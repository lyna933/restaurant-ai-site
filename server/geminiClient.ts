import { getTavilyConfig, researchRestaurantWithTavily } from "./tavilyClient.js";

export interface GroundingSource {
  title: string;
  url: string;
  kind: "search" | "maps" | "tavily";
  placeId?: string;
}

interface GeminiCallOptions {
  tools?: Array<Record<string, unknown>>;
  toolConfig?: Record<string, unknown>;
  json?: boolean;
  temperature?: number;
  maxOutputTokens?: number;
}

const isHttpUrl = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const getGeminiConfig = () => ({
  apiKey: process.env.GEMINI_API_KEY?.trim() || "",
  model: process.env.GEMINI_MODEL?.trim() || "gemini-3.1-flash-lite",
});

const extractText = (payload: any) =>
  (payload?.candidates || [])
    .flatMap((candidate: any) => candidate?.content?.parts || [])
    .map((part: any) => (typeof part?.text === "string" ? part.text : ""))
    .filter(Boolean)
    .join("\n")
    .trim();

const extractSources = (payload: any, fallbackKind: "search" | "maps") => {
  const seen = new Set<string>();
  const sources: GroundingSource[] = [];
  const add = (url: unknown, title: unknown, kind: "search" | "maps", placeId?: unknown) => {
    if (!isHttpUrl(url) || seen.has(url)) return;
    seen.add(url);
    sources.push({
      url,
      title: typeof title === "string" && title.trim() ? title.trim() : new URL(url).hostname,
      kind,
      ...(typeof placeId === "string" && placeId.trim() ? { placeId: placeId.trim() } : {}),
    });
  };

  for (const candidate of payload?.candidates || []) {
    const metadata = candidate?.groundingMetadata || {};
    for (const chunk of metadata?.groundingChunks || []) {
      if (chunk?.web) add(chunk.web.uri, chunk.web.title, "search");
      if (chunk?.maps) add(chunk.maps.uri, chunk.maps.title, "maps", chunk.maps.placeId);
      if (chunk?.retrievedContext) {
        add(chunk.retrievedContext.uri, chunk.retrievedContext.title, fallbackKind);
      }
    }
    for (const attribution of metadata?.groundingAttributions || []) {
      add(attribution?.web?.uri || attribution?.sourceId?.uri, attribution?.web?.title, fallbackKind);
    }
  }

  return sources;
};

const extractGroundingDetails = (payload: any) =>
  (payload?.candidates || [])
    .flatMap((candidate: any) => candidate?.groundingMetadata?.groundingChunks || [])
    .map((chunk: any) => chunk?.maps?.text || chunk?.web?.text || chunk?.retrievedContext?.text || "")
    .filter(Boolean)
    .join("\n\n")
    .trim();

export async function callGemini(prompt: string, options: GeminiCallOptions = {}) {
  const { apiKey, model } = getGeminiConfig();
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 75_000);
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          ...(options.tools ? { tools: options.tools } : {}),
          ...(options.toolConfig ? { toolConfig: options.toolConfig } : {}),
          generationConfig: {
            temperature: options.temperature ?? 0.15,
            maxOutputTokens: options.maxOutputTokens ?? 8192,
            ...(options.json ? { responseMimeType: "application/json" } : {}),
          },
        }),
        signal: controller.signal,
      },
    );

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = payload?.error?.message || `HTTP ${response.status}`;
      throw new Error(`Gemini API request failed: ${detail}`);
    }

    const text = extractText(payload);
    if (!text) {
      const reason = payload?.promptFeedback?.blockReason || payload?.candidates?.[0]?.finishReason || "empty response";
      throw new Error(`Gemini returned no usable content: ${reason}`);
    }

    const toolKind = options.tools?.some((tool) => "googleMaps" in tool) ? "maps" : "search";
    return {
      text,
      sources: extractSources(payload, toolKind),
      groundingDetails: extractGroundingDetails(payload),
      raw: payload,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function researchRestaurantWithGemini(input: {
  name: string;
  city: string;
  cuisineType: string;
  menuInput: string;
  language: string;
  latitude?: number;
  longitude?: number;
}) {
  const hasLocation = Number.isFinite(input.latitude) && Number.isFinite(input.longitude);
  const searchPrompt = `Research the exact restaurant or merchant "${input.name}" for a source-backed restaurant website. Brand identity, official website, and official social accounts must be researched globally and must not be limited by the device location. Store-specific review and menu evidence should prefer ${input.city || "the requested market"}.
Cuisine hint: ${input.cuisineType || "not specified"}
User menu notes: ${input.menuInput || "none"}
Research separately: (1) official website/contact page; (2) direct merchant pages on Instagram, Facebook, TikTok/Douyin, Xiaohongshu, Weibo, YouTube, Yelp, TripAdvisor, Dianping/Meituan and delivery platforms; (3) official or credible menu pages with real dish names and prices; (4) merchant/dish image URLs only when the image itself and its containing source page are both available.
Return concise factual notes with the source name beside every fact. Never treat a platform homepage as the merchant profile and never invent handles, followers, dishes, prices, phones, addresses or images.`;

  const globalChineseSocialPrompt = `Use Google Search to research the global Chinese-language identity and social presence of the exact restaurant brand "${input.name}". This search is global and MUST NOT be restricted to ${input.city || "the device location"}.
First identify the brand's verified Chinese name and aliases. Then find direct brand-specific URLs on Xiaohongshu/RED (xiaohongshu.com user profile or brand-specific note), Weibo, Douyin, WeChat public-account references, and Dianping where available. A Xiaohongshu note is useful because users can comment on the note even when the platform has no universal merchant review form. Never return a platform homepage or generic search-results page. Return concise facts and exact direct URLs only; do not invent an account.`;

  const mapsToolConfig = hasLocation
    ? {
        retrievalConfig: {
          latLng: { latitude: input.latitude, longitude: input.longitude },
        },
      }
    : undefined;

  const tavily = getTavilyConfig();
  const [search, globalChineseSocial] = await Promise.allSettled([
    tavily.apiKey
      ? researchRestaurantWithTavily({
          name: input.name,
          city: input.city,
          cuisineType: input.cuisineType,
        })
      : callGemini(searchPrompt, {
          tools: [{ googleSearch: {} }],
          temperature: 0,
          maxOutputTokens: 6144,
        }),
    callGemini(globalChineseSocialPrompt, {
      tools: [{ googleSearch: {} }],
      temperature: 0,
      maxOutputTokens: 4096,
    }),
  ]);

  const webResearchValues = [
    ...(search.status === "fulfilled" ? [search.value] : []),
    ...(globalChineseSocial.status === "fulfilled" ? [globalChineseSocial.value] : []),
  ];
  const aliasSourceTitles = webResearchValues
    .flatMap((value) => value.sources as readonly { title: string }[])
    .slice(0, 20)
    .map((source) => source.title)
    .join("; ");
  const aliasEvidence = webResearchValues.length > 0
    ? [`Likely identity clues from source titles: ${aliasSourceTitles}`, ...webResearchValues.map((value) => value.text.slice(0, 2_500))].join("\n\n")
    : "Web research did not return usable brand aliases.";
  const mapNameVariants = /hotpot/i.test(input.name)
    ? `${input.name}; alternate spacing: ${input.name.replace(/hotpot/ig, "Hot Pot")}`
    : input.name;
  const mapsPrompt = `You MUST use the provided Google Maps grounding tool. Find physical branches for the exact restaurant or merchant entered as "${input.name}". Search all supported spelling variants: ${mapNameVariants}.
${hasLocation
    ? `The device coordinates ${input.latitude}, ${input.longitude} are authoritative. Ignore a conflicting typed city or distant brand headquarters. Find up to 5 closest matching physical branches to these coordinates and order them nearest-first.`
    : `No reliable device coordinates are available. Find up to 5 closest matching physical branches in or near ${input.city || "the requested area"}, ordered nearest-first.`}

First use the web evidence below to resolve the merchant's official English/Chinese name, transliteration and genuine aliases. For example, a Chinese brand may operate abroad under a different official English name. Accept only an alias supported by that evidence. Do not substitute a similarly spelled or similar-category merchant.

For every returned branch, include the exact branch name, full street address, direct telephone, opening hours, latitude/longitude when available, distance from the device when available, and its direct Google Maps place link. If the exact merchant has no nearby Maps result, say so instead of returning a distant headquarters or another brand. Do not invent missing values.

WEB EVIDENCE FOR IDENTITY AND ALIASES:
${aliasEvidence}`;

  const runMapsResearch = (prompt: string, useDeviceLocation = true) => callGemini(prompt, {
      tools: [{ googleMaps: {} }],
      toolConfig: useDeviceLocation ? mapsToolConfig : undefined,
      temperature: 0,
      maxOutputTokens: 6144,
    });
  let [maps] = await Promise.allSettled([runMapsResearch(mapsPrompt)]);
  const hasGroundedMapPlace = () => maps.status === "fulfilled"
    && maps.value.sources.some((source) => source.kind === "maps");
  let mapsScope: "local" | "global" = "local";
  if (!hasGroundedMapPlace()) {
    const retryPrompt = `Use Google Maps now to find the nearest exact physical branches for the merchant entered as "${input.name}". Search all supported spelling variants: ${mapNameVariants}.
Supported alias clues from web source titles: ${aliasSourceTitles || input.name}.
${hasLocation
    ? `The device coordinates ${input.latitude}, ${input.longitude} are authoritative. Return up to 5 exact branches ordered nearest-first.`
    : `Search in or near ${input.city || "the requested area"} and return up to 5 exact branches ordered nearest-first.`}
Every branch must include its exact name, full address, phone and hours when available, and a direct grounded Google Maps place record. Do not return another merchant, a distant headquarters, or an answer based only on web evidence.`;
    const [retry] = await Promise.allSettled([runMapsResearch(retryPrompt)]);
    if (retry.status === "fulfilled" && retry.value.sources.some((source) => source.kind === "maps")) {
      maps = retry;
    } else if (maps.status === "rejected") {
      maps = retry;
    }
  }

  if (!hasGroundedMapPlace()) {
    const globalPrompt = `Use Google Maps now to find verified physical branches anywhere in the world for the exact merchant entered as "${input.name}".
No exact nearby branch was found for the device/requested market. Resolve the merchant using these supported identity clues: ${aliasSourceTitles || input.name}.
Find up to 5 exact branches in countries or cities where this merchant actually operates. Prefer the merchant's home market and locations supported by the web identity evidence. Return exact branch names, full street addresses, direct phone numbers, hours, coordinates when available, and direct grounded Google Maps place records. Do not return a headquarters, an unrelated similarly named business, or any invented data. Explicitly state that these are global fallback locations, not nearby stores.`;
    const [globalFallback] = await Promise.allSettled([runMapsResearch(globalPrompt, false)]);
    if (globalFallback.status === "fulfilled" && globalFallback.value.sources.some((source) => source.kind === "maps")) {
      maps = globalFallback;
      mapsScope = "global";
    } else if (maps.status === "rejected") {
      maps = globalFallback;
    }
  }

  if (maps.status === "rejected" && search.status === "rejected" && globalChineseSocial.status === "rejected") {
    throw new Error(`${maps.reason?.message || maps.reason}; ${search.reason?.message || search.reason}`);
  }

  return {
    mapsText: maps.status === "fulfilled"
      ? [maps.value.text, maps.value.groundingDetails].filter(Boolean).join("\n\nGOOGLE MAPS SOURCE DETAILS:\n")
      : `Maps research unavailable: ${maps.reason?.message || maps.reason}`,
    searchText: webResearchValues.length > 0
      ? webResearchValues.map((value) => [value.text, "groundingDetails" in value ? value.groundingDetails : ""].filter(Boolean).join("\n\nWEB SEARCH SOURCE DETAILS:\n")).join("\n\nGLOBAL WEB RESEARCH:\n")
      : `Web research unavailable: ${search.status === "rejected" ? search.reason?.message || search.reason : "no result"}`,
    sources: [
      ...(maps.status === "fulfilled" ? maps.value.sources : []),
      ...(search.status === "fulfilled" ? search.value.sources : []),
      ...(globalChineseSocial.status === "fulfilled" ? globalChineseSocial.value.sources : []),
    ].filter((source, index, all) => all.findIndex((item) => item.url === source.url) === index),
    searchProvider: tavily.apiKey ? "tavily" : "google-search",
    mapsScope,
  };
}

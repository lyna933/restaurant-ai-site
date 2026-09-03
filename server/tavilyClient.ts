export interface TavilySource {
  title: string;
  url: string;
  kind: "tavily";
}

interface TavilyImage {
  url: string;
  description?: string;
  sourceUrl?: string;
}

interface TavilySearchResponse {
  results?: Array<{
    title?: string;
    url?: string;
    content?: string;
    score?: number;
    images?: Array<{ url?: string; description?: string }>;
  }>;
  images?: Array<{ url?: string; description?: string }>;
  usage?: { credits?: number };
}

export const getTavilyConfig = () => ({
  apiKey: process.env.TAVILY_API_KEY?.trim() || "",
});

const isHttpUrl = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const socialPlatformHosts = [
  "instagram.com", "facebook.com", "tiktok.com", "youtube.com", "x.com",
  "twitter.com", "threads.net", "linkedin.com", "pinterest.com",
  "xiaohongshu.com", "weibo.com", "douyin.com",
];

const isSocialPlatformUrl = (value: string) => {
  try {
    const host = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
    return socialPlatformHosts.some((candidate) => host === candidate || host.endsWith(`.${candidate}`));
  } catch {
    return false;
  }
};

const thirdPartyDirectoryHosts = [
  "wikipedia.org", "baidu.com", "globaldata.com", "leadiq.com", "mapquest.com",
  "yelp.com", "tripadvisor.com", "opentable.com", "foursquare.com", "zomato.com",
  "restaurantguru.com", "happycow.net", "trustpilot.com", "ubereats.com",
  "doordash.com", "grubhub.com", "linkedin.com", "indeed.com", "reddit.com",
  "yahoo.com", "apple.com", "facebook.com", "instagram.com", "tiktok.com",
  "youtube.com", "x.com", "twitter.com", "xiaohongshu.com", "weibo.com",
];

const extractOfficialSiteSocialLinks = async (
  pages: Array<{ title?: string; url?: string }>,
  restaurantName: string,
) => {
  const identity = restaurantName.toLowerCase().replace(/[^a-z0-9\u3400-\u9fff]+/g, "");
  const candidates = pages
    .filter((page) => {
      if (!isHttpUrl(page.url) || isSocialPlatformUrl(page.url!)) return false;
      const parsed = new URL(page.url!);
      const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
      if (thirdPartyDirectoryHosts.some((candidate) => host === candidate || host.endsWith(`.${candidate}`))) return false;
      const hostIdentity = host.split(".")[0].replace(/[^a-z0-9\u3400-\u9fff]+/g, "");
      const titleIdentity = (page.title || "").toLowerCase().replace(/[^a-z0-9\u3400-\u9fff]+/g, "");
      const exactBrandMatch = identity.length >= 4
        && (hostIdentity.includes(identity) || identity.includes(hostIdentity) || titleIdentity.includes(identity));
      const officialTitleMatch = /\bofficial\b|官网|官方網站|公式サイト/i.test(page.title || "");
      return exactBrandMatch || officialTitleMatch;
    })
    .sort((a, b) => {
      const score = (page: { title?: string; url?: string }) => {
        const parsed = new URL(page.url!);
        const hostIdentity = parsed.hostname.toLowerCase().replace(/^www\./, "").split(".")[0].replace(/[^a-z0-9\u3400-\u9fff]+/g, "");
        const titleIdentity = (page.title || "").toLowerCase().replace(/[^a-z0-9\u3400-\u9fff]+/g, "");
        return (hostIdentity.includes(identity) || identity.includes(hostIdentity) ? 8 : 0)
          + (titleIdentity.includes(identity) ? 4 : 0)
          + (parsed.pathname === "/" || parsed.pathname === "" ? 2 : 0);
      };
      return score(b) - score(a);
    })
    .slice(0, 3);
  const settled = await Promise.allSettled(candidates.map(async (page) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    try {
      const response = await fetch(page.url!, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; RestaurantLinkHub/1.0)",
          Accept: "text/html,application/xhtml+xml",
        },
        redirect: "follow",
        signal: controller.signal,
      });
      if (!response.ok || !(response.headers.get("content-type") || "").includes("text/html")) return [];
      const html = (await response.text()).slice(0, 2_000_000);
      const links: Array<{ title: string; url: string; sourcePage: string }> = [];
      for (const match of html.matchAll(/href\s*=\s*["']([^"']+)["']/gi)) {
        const raw = match[1].replace(/&amp;/g, "&").trim();
        try {
          const resolved = new URL(raw, response.url || page.url!).toString();
          if (!isHttpUrl(resolved) || !isSocialPlatformUrl(resolved)) continue;
          if (links.some((link) => link.url === resolved)) continue;
          links.push({
            title: `${restaurantName} — link verified from ${new URL(response.url || page.url!).hostname}`,
            url: resolved,
            sourcePage: page.url!,
          });
        } catch {}
      }
      return links.slice(0, 20);
    } finally {
      clearTimeout(timeout);
    }
  }));
  return settled
    .filter((item): item is PromiseFulfilledResult<Array<{ title: string; url: string; sourcePage: string }>> => item.status === "fulfilled")
    .flatMap((item) => item.value)
    .filter((item, index, all) => all.findIndex((candidate) => candidate.url === item.url) === index);
};

async function tavilySearch(
  query: string,
  options: { includeImages?: boolean; maxResults?: number; includeDomains?: string[] } = {},
) {
  const { apiKey } = getTavilyConfig();
  if (!apiKey) throw new Error("TAVILY_API_KEY is not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);
  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        search_depth: "basic",
        chunks_per_source: 2,
        max_results: options.maxResults || 10,
        topic: "general",
        include_answer: false,
        include_raw_content: false,
        include_images: !!options.includeImages,
        include_image_descriptions: !!options.includeImages,
        include_favicon: false,
        include_usage: true,
        safe_search: true,
        ...(options.includeDomains?.length ? { include_domains: options.includeDomains } : {}),
      }),
      signal: controller.signal,
    });

    const payload = (await response.json().catch(() => ({}))) as TavilySearchResponse & { detail?: any };
    if (!response.ok) {
      const detail = typeof payload?.detail === "string"
        ? payload.detail
        : payload?.detail?.error || `HTTP ${response.status}`;
      throw new Error(`Tavily search failed: ${detail}`);
    }
    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

export async function researchRestaurantWithTavily(input: {
  name: string;
  city: string;
  cuisineType: string;
}) {
  const location = input.city || "local area";
  const queries = [
    `"${input.name}" official name Chinese name English name alias global official website contact phone worldwide locations official social profile avatar logo image brand colors mascot visual identity`,
    `"${input.name}" ${location} global official menu full menu signature dishes individual product photos prices image gallery ${input.cuisineType || "restaurant"}`,
    `"${input.name}" official Instagram profile account`,
    `"${input.name}" official Facebook page profile account`,
    `"${input.name}" official TikTok YouTube X Twitter Threads LinkedIn Pinterest profile channel account`,
    `"${input.name}" Chinese name official Xiaohongshu RED 小红书 Weibo 微博 Douyin 抖音 brand profile account post`,
    `"${input.name}" ${location} Google Maps Yelp TripAdvisor Facebook reviews address`,
    `"${input.name}" ${location} OpenTable Foursquare Zomato Restaurant Guru HappyCow Trustpilot restaurant reviews`,
    `"${input.name}" ${location} Uber Eats DoorDash Grubhub restaurant delivery rating`,
  ];

  const settled = await Promise.allSettled([
    tavilySearch(queries[0], { includeImages: true, maxResults: 12 }),
    tavilySearch(queries[1], { includeImages: true, maxResults: 12 }),
    tavilySearch(queries[2], {
      maxResults: 10,
      includeDomains: ["instagram.com"],
    }),
    tavilySearch(queries[3], {
      maxResults: 10,
      includeDomains: ["facebook.com"],
    }),
    tavilySearch(queries[4], {
      maxResults: 16,
      includeDomains: ["tiktok.com", "youtube.com", "x.com", "twitter.com", "threads.net", "linkedin.com", "pinterest.com"],
    }),
    tavilySearch(queries[5], {
      maxResults: 12,
      includeDomains: ["xiaohongshu.com", "weibo.com", "douyin.com", "dianping.com"],
    }),
    tavilySearch(queries[6], {
      maxResults: 16,
      includeDomains: ["yelp.com", "tripadvisor.com", "facebook.com"],
    }),
    tavilySearch(queries[7], {
      maxResults: 18,
      includeDomains: ["opentable.com", "foursquare.com", "zomato.com", "restaurantguru.com", "happycow.net", "trustpilot.com"],
    }),
    tavilySearch(queries[8], {
      maxResults: 16,
      includeDomains: ["ubereats.com", "doordash.com", "grubhub.com"],
    }),
  ]);
  const successful = settled
    .filter((item): item is PromiseFulfilledResult<TavilySearchResponse> => item.status === "fulfilled")
    .map((item) => item.value);
  if (successful.length === 0) {
    const errors = settled
      .filter((item): item is PromiseRejectedResult => item.status === "rejected")
      .map((item) => item.reason?.message || String(item.reason));
    throw new Error(errors.join("; ") || "Tavily returned no results");
  }

  const results = successful.flatMap((payload) => payload.results || []);
  const uniqueResults = results.filter((result, index, all) =>
    isHttpUrl(result.url) && all.findIndex((candidate) => candidate.url === result.url) === index,
  );
  const officialSiteSocialLinks = await extractOfficialSiteSocialLinks(uniqueResults, input.name);
  const sources: TavilySource[] = uniqueResults.map((result) => ({
    title: result.title?.trim() || new URL(result.url!).hostname,
    url: result.url!,
    kind: "tavily",
  }));
  for (const link of officialSiteSocialLinks) {
    if (sources.some((source) => source.url === link.url)) continue;
    sources.push({ title: link.title, url: link.url, kind: "tavily" });
  }

  const images: TavilyImage[] = [];
  for (const result of uniqueResults) {
    for (const item of result.images || []) {
      if (!isHttpUrl(item.url)) continue;
      images.push({ url: item.url, description: item.description || "", sourceUrl: result.url });
    }
  }
  for (const payload of successful) {
    for (const item of payload.images || []) {
      if (!isHttpUrl(item.url) || images.some((existing) => existing.url === item.url)) continue;
      images.push({ url: item.url, description: item.description || "" });
    }
  }
  for (const item of images) {
    if (sources.some((source) => source.url === item.url)) continue;
    sources.push({
      title: item.description?.trim() || "Tavily restaurant image result",
      url: item.url,
      kind: "tavily",
    });
  }

  const resultText = uniqueResults.map((result, index) => {
    const nestedImages = (result.images || [])
      .filter((item) => isHttpUrl(item.url))
      .map((item) => `  Image: ${item.url}${item.description ? ` — ${item.description}` : ""}`)
      .join("\n");
    return `[${index + 1}] ${result.title || "Untitled"}\nURL: ${result.url}\nEvidence: ${result.content || ""}${nestedImages ? `\n${nestedImages}` : ""}`;
  }).join("\n\n");
  const globalImageText = images
    .filter((item) => !item.sourceUrl)
    .slice(0, 12)
    .map((item) => `Image candidate: ${item.url}${item.description ? ` — ${item.description}` : ""}`)
    .join("\n");

  const officialSocialText = officialSiteSocialLinks
    .map((link) => `Official-site social link: ${link.url}\nFound on: ${link.sourcePage}`)
    .join("\n\n");

  return {
    text: [resultText, officialSocialText, globalImageText].filter(Boolean).join("\n\nADDITIONAL VERIFIED EVIDENCE:\n"),
    sources,
    images,
    creditsUsed: successful.reduce((sum, payload) => sum + Number(payload.usage?.credits || 0), 0),
  };
}

export async function researchReviewPlatformsForBranches(input: {
  name: string;
  branches: Array<{ name?: string; address?: string }>;
}) {
  const branchContext = input.branches
    .slice(0, 2)
    .map((branch) => `"${branch.name || input.name}" "${branch.address || ""}"`)
    .join(" OR ");
  if (!branchContext) return { text: "", sources: [] as TavilySource[] };

  const queries = [
    `${input.name} ${branchContext} Yelp restaurant reviews`,
    `${input.name} ${branchContext} TripAdvisor Facebook restaurant reviews`,
    `${input.name} ${branchContext} OpenTable Foursquare Zomato Restaurant Guru HappyCow Trustpilot`,
    `${input.name} ${branchContext} Uber Eats DoorDash Grubhub restaurant rating`,
  ];
  const settled = await Promise.allSettled([
    tavilySearch(queries[0], {
      maxResults: 12,
      includeDomains: ["yelp.com"],
    }),
    tavilySearch(queries[1], {
      maxResults: 16,
      includeDomains: ["tripadvisor.com", "facebook.com"],
    }),
    tavilySearch(queries[2], {
      maxResults: 16,
      includeDomains: ["opentable.com", "foursquare.com", "zomato.com", "restaurantguru.com", "happycow.net", "trustpilot.com"],
    }),
    tavilySearch(queries[3], {
      maxResults: 16,
      includeDomains: ["ubereats.com", "doordash.com", "grubhub.com"],
    }),
  ]);
  const results = settled
    .filter((item): item is PromiseFulfilledResult<TavilySearchResponse> => item.status === "fulfilled")
    .flatMap((item) => item.value.results || [])
    .filter((result, index, all) =>
      isHttpUrl(result.url) && all.findIndex((candidate) => candidate.url === result.url) === index,
    );
  return {
    text: results.map((result) => `${result.title || "Review platform"}\nURL: ${result.url}\nEvidence: ${result.content || ""}`).join("\n\n"),
    sources: results.map((result) => ({
      title: result.title?.trim() || new URL(result.url!).hostname,
      url: result.url!,
      kind: "tavily" as const,
    })),
  };
}

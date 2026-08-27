import express from "express";
import path from "path";
import dotenv from "dotenv";
import Stripe from "stripe";
import { inferBrandCategory, getAccurateDishImage, generateCustomCategoryDishes } from "./server/restaurantGenerator.js";
import { callGemini, getGeminiConfig, researchRestaurantWithGemini } from "./server/geminiClient.js";
import { getTavilyConfig, researchReviewPlatformsForBranches } from "./server/tavilyClient.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const isHttpUrl = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const isLikelyImageUrl = (value: unknown): value is string => {
  if (!isHttpUrl(value)) return false;
  try {
    const url = new URL(value);
    const candidate = `${url.pathname}${url.search}`;
    if (/\.(?:avif|webp|png|jpe?g)(?:$|[?#])/i.test(candidate)) return true;
    const knownImageHosts = [
      "tb-static.uber.com",
      "s3-media0.fl.yelpcdn.com",
      "cdn.corner.inc",
      "images.unsplash.com",
    ];
    return knownImageHosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
};

const parseModelJson = (text: string) => {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(cleaned);
};

const isDirectMerchantUrl = (value: unknown) => {
  if (!isHttpUrl(value)) return false;
  const url = new URL(value);
  const path = url.pathname.replace(/\/+$/, "");
  const platformHosts = [
    "instagram.com", "facebook.com", "tiktok.com", "youtube.com", "weibo.com",
    "xiaohongshu.com", "yelp.com", "tripadvisor.com", "google.com", "x.com",
    "twitter.com", "threads.net", "linkedin.com", "pinterest.com", "opentable.com",
    "foursquare.com", "zomato.com", "restaurantguru.com", "happycow.net",
    "trustpilot.com", "ubereats.com", "doordash.com", "grubhub.com"
  ];
  const isPlatform = platformHosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
  if (!isPlatform) return true;
  const firstSegment = path.split("/").filter(Boolean)[0]?.toLowerCase() || "";
  const nonProfileSegments = new Set([
    "discover", "explore", "search", "reel", "reels", "p", "watch", "shorts",
    "hashtag", "tag", "maps", "place", "postreview",
  ]);
  return path.length > 1 && !nonProfileSegments.has(firstSegment);
};

const classifyVerifiedLink = (source: any) => {
  if (!isHttpUrl(source?.url)) return null;
  const url = new URL(source.url);
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const segments = url.pathname.split("/").filter(Boolean);
  const first = segments[0]?.toLowerCase() || "";
  const profile = (name: string, nameZh: string, icon: string, badge: string) => ({
    name, nameZh, icon, badge,
  });

  if (source.kind === "maps" && (host === "maps.google.com" || host.endsWith(".google.com"))) {
    return profile("Google Maps", "Google 地图", "MapPin", "Nearest location");
  }
  if (host.endsWith("instagram.com") && segments.length === 1 && !["p", "reel", "reels", "explore"].includes(first)) {
    return profile("Instagram", "Instagram", "Instagram", "Merchant profile");
  }
  if (host.endsWith("facebook.com") && segments.length === 1 && !["watch", "reel", "reels", "groups"].includes(first)) {
    return profile("Facebook", "Facebook", "Facebook", "Merchant profile");
  }
  if (host.endsWith("tiktok.com") && first.startsWith("@") && segments.length === 1) {
    return profile("TikTok", "TikTok / 抖音海外", "Video", "Merchant profile");
  }
  if (host.endsWith("youtube.com") && (["channel", "c", "user"].includes(first) || first.startsWith("@"))) {
    return profile("YouTube", "YouTube", "Play", "Merchant channel");
  }
  if ((host === "x.com" || host.endsWith("twitter.com")) && segments.length === 1 && !["home", "search", "explore", "intent", "i"].includes(first)) {
    return profile("X / Twitter", "X / Twitter", "Twitter", "Merchant profile");
  }
  if (host.endsWith("threads.net") && segments.length === 1 && first.startsWith("@")) {
    return profile("Threads", "Threads", "Share2", "Merchant profile");
  }
  if (host.endsWith("linkedin.com") && first === "company" && segments.length === 2) {
    return profile("LinkedIn", "LinkedIn", "Linkedin", "Merchant page");
  }
  if (host.endsWith("pinterest.com") && segments.length === 1 && !["search", "pin", "ideas"].includes(first)) {
    return profile("Pinterest", "Pinterest", "Share2", "Merchant profile");
  }
  if (host.endsWith("xiaohongshu.com") && first === "user" && segments[1] === "profile") {
    return profile("Xiaohongshu (RED)", "小红书", "BookOpen", "Brand profile — comment on posts");
  }
  if (host.endsWith("xiaohongshu.com") && ["explore", "discovery"].includes(first) && segments.length >= 2) {
    return profile("Xiaohongshu (RED)", "小红书", "BookOpen", "Brand post — comments available");
  }
  if (host.endsWith("weibo.com") && (first === "u" || segments.length === 1)) {
    return profile("Weibo", "微博", "Share2", "Merchant profile");
  }
  if (host.endsWith("yelp.com") && first === "biz") {
    return profile("Yelp", "Yelp 评价", "Star", "Reviews");
  }
  if (host.endsWith("tripadvisor.com") && /restaurant_review/i.test(url.pathname)) {
    return profile("Tripadvisor", "Tripadvisor 评价", "Star", "Reviews");
  }
  if (host.endsWith("opentable.com") && first === "r" && segments.length >= 2) {
    return profile("OpenTable", "OpenTable 订座评价", "Star", "Verified diner reviews");
  }
  if (host.endsWith("foursquare.com") && ["v", "place"].includes(first) && segments.length >= 2) {
    return profile("Foursquare", "Foursquare 地点评价", "MapPin", "Tips & reviews");
  }
  if (host.endsWith("zomato.com") && segments.length >= 2) {
    return profile("Zomato", "Zomato 餐厅评价", "Star", "Restaurant reviews");
  }
  if (host.endsWith("restaurantguru.com") && segments.length >= 1) {
    return profile("Restaurant Guru", "Restaurant Guru 评价", "Star", "Restaurant reviews");
  }
  if (host.endsWith("happycow.net") && first === "reviews" && segments.length >= 2) {
    return profile("HappyCow", "HappyCow 素食评价", "Star", "Community reviews");
  }
  if (host.endsWith("trustpilot.com") && first === "review" && segments.length >= 2) {
    return profile("Trustpilot", "Trustpilot 商家评价", "Star", "Business reviews");
  }
  if (host.endsWith("ubereats.com") && first === "store") {
    return profile("Uber Eats", "Uber Eats 点单", "ExternalLink", "Order online");
  }
  if (host.endsWith("doordash.com") && first === "store") {
    return profile("DoorDash", "DoorDash 点单", "ExternalLink", "Order online");
  }
  if (host.endsWith("grubhub.com") && first === "restaurant") {
    return profile("Grubhub", "Grubhub 点单", "ExternalLink", "Order online");
  }
  if (host.endsWith("dianping.com") && first === "shop") {
    return profile("Dianping", "大众点评", "Star", "Reviews");
  }
  return null;
};

const getCuratedVerifiedSocials = (cleanName: string, brand: any) => {
  const identities = [cleanName, brand?.name, brand?.nameZh]
    .map(normalizeIdentity)
    .filter(Boolean);
  const isHaidilao = identities.some((identity) =>
    identity.includes("haidilao") || identity.includes("海底捞") || identity.includes("海底撈"),
  );
  const isHeytea = identities.some((identity) =>
    identity.includes("heytea") || identity.includes("喜茶"),
  );
  const profiles: any[] = [];

  if (isHeytea) {
    profiles.push(
      {
        id: "curated-instagram-heytea-us",
        name: "Instagram",
        nameZh: "喜茶美国 · Instagram",
        handle: "@heytea.usa",
        url: "https://www.instagram.com/heytea.usa",
        icon: "Instagram",
        followers: "",
        badge: "Verified US merchant profile",
        color: "#E1306C",
        bgColor: "bg-pink-50 text-pink-700 border-pink-200",
        sourceUrl: "https://www.instagram.com/heytea.usa",
        sourceTitle: "HEYTEA USA · @heytea.usa",
      },
      {
        id: "curated-x-heytea-global",
        name: "X / Twitter",
        nameZh: "喜茶全球 · X",
        handle: "@HEYTEA",
        url: "https://x.com/HEYTEA",
        icon: "Twitter",
        followers: "",
        badge: "Verified global brand profile",
        color: "#111827",
        bgColor: "bg-neutral-50 text-neutral-700 border-neutral-200",
        sourceUrl: "https://x.com/HEYTEA",
        sourceTitle: "HEYTEA Global · @HEYTEA",
      },
    );
  }

  if (isHaidilao) {
    profiles.push(
      {
        id: "curated-instagram-haidilao-us",
        name: "Instagram",
        nameZh: "海底捞美国 · Instagram",
        handle: "@haidilao_us",
        url: "https://www.instagram.com/haidilao_us",
        icon: "Instagram",
        followers: "",
        badge: "Verified US merchant profile",
        color: "#E1306C",
        bgColor: "bg-pink-50 text-pink-700 border-pink-200",
        sourceUrl: "https://www.instagram.com/haidilao_us",
        sourceTitle: "Haidilao US · @haidilao_us",
      },
      {
        id: "curated-facebook-haidilao-us",
        name: "Facebook",
        nameZh: "海底捞美国 · Facebook",
        handle: "@haidilaohotpotus",
        url: "https://www.facebook.com/haidilaohotpotus",
        icon: "Facebook",
        followers: "",
        badge: "Verified US merchant profile",
        color: "#1877F2",
        bgColor: "bg-blue-50 text-blue-700 border-blue-200",
        sourceUrl: "https://www.facebook.com/haidilaohotpotus",
        sourceTitle: "Haidilao US · @haidilaohotpotus",
      },
      {
        id: "curated-xiaohongshu-haidilao-us",
        name: "Xiaohongshu (RED)",
        nameZh: "海底捞火锅—美国 · 小红书",
        handle: "27769365676",
        url: "https://www.xiaohongshu.com/user/profile/607fc46e000000000101f156",
        icon: "BookOpen",
        followers: "",
        badge: "Verified merchant profile",
        color: "#FF2442",
        bgColor: "bg-rose-50 text-rose-700 border-rose-200",
        sourceUrl: "https://www.xiaohongshu.com/user/profile/607fc46e000000000101f156",
        sourceTitle: "海底捞火锅—美国 · 小红书号 27769365676",
      },
    );
  }

  return profiles;
};

const makeRestaurantKeywords = (brandNameEn: string, brandNameZh: string, menu: any[]) => {
  const items = (Array.isArray(menu) ? menu : []).slice(0, 4);
  if (items.length === 0) {
    return {
      zh: [`✍️ 请填写你在${brandNameZh}真实体验过的餐品与服务`],
      en: [`✍️ Add dishes and service you personally experienced at ${brandNameEn}`],
    };
  }
  const zh = items.map((item) => `🍽️ ${item.nameZh || item.name} 是${brandNameZh}的特色必点`);
  const en = items.map((item) => `🍽️ ${item.name || item.nameZh} is a ${brandNameEn} signature`);
  zh.push(`📍 ${brandNameZh}门店位置便利、信息清晰`, `❤️ ${brandNameZh}服务体验值得分享`);
  en.push(`📍 ${brandNameEn} location details were clear and convenient`, `❤️ The ${brandNameEn} experience was worth sharing`);
  return { zh: zh.slice(0, 6), en: en.slice(0, 6) };
};

const normalizeIdentity = (value: unknown) =>
  typeof value === "string"
    ? value.toLowerCase().replace(/[^a-z0-9\u3400-\u9fff]+/g, "")
    : "";

const expandKnownBrandIdentities = (values: string[]) => {
  const expanded = new Set(values.filter(Boolean));
  const hasHeytea = [...expanded].some((value) => value.includes("heytea") || value.includes("喜茶"));
  const hasHaidilao = [...expanded].some((value) =>
    value.includes("haidilao") || value.includes("海底捞") || value.includes("海底撈"),
  );
  if (hasHeytea) ["heytea", "喜茶"].forEach((value) => expanded.add(value));
  if (hasHaidilao) ["haidilao", "haidilaohotpot", "海底捞", "海底撈"].forEach((value) => expanded.add(value));
  return [...expanded];
};

const stableRestaurantBrandId = (name: string) => {
  const normalized = normalizeIdentity(name);
  if (normalized.includes("heytea") || normalized.includes("喜茶")) return "heytea";
  if (normalized.includes("haidilao") || normalized.includes("海底捞") || normalized.includes("海底撈")) return "haidilao";
  const latinSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (latinSlug) return latinSlug;
  let hash = 2166136261;
  for (const character of name.normalize("NFKC")) {
    hash ^= character.codePointAt(0) || 0;
    hash = Math.imul(hash, 16777619);
  }
  return `restaurant-${(hash >>> 0).toString(36)}`;
};

const geocodeCache = new Map<string, { latitude: number; longitude: number } | null>();

const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (value: number) => value * Math.PI / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const annotateStoreDistancesAndScope = (
  brand: any,
  userLatitude: unknown,
  userLongitude: unknown,
  mapsScope: "local" | "global",
) => {
  const latitude = Number(userLatitude);
  const longitude = Number(userLongitude);
  const hasDeviceLocation = Number.isFinite(latitude) && Number.isFinite(longitude);
  const stores = Array.isArray(brand?.stores) ? brand.stores : [];
  const distances = stores.map((store: any) => {
    const storeLat = Number(store.latitude);
    const storeLon = Number(store.longitude);
    return hasDeviceLocation
      && Number.isFinite(storeLat)
      && Number.isFinite(storeLon)
      && !(storeLat === 0 && storeLon === 0)
      ? calculateDistanceKm(latitude, longitude, storeLat, storeLon)
      : null;
  });
  const finiteDistances = distances.filter((distance): distance is number => Number.isFinite(distance));
  const effectiveScope: "local" | "global" = mapsScope === "global"
    || (finiteDistances.length > 0 && Math.min(...finiteDistances) > 200)
    ? "global"
    : "local";
  brand.stores = stores.map((store: any, index: number) => ({
    ...store,
    locationScope: effectiveScope,
    ...(distances[index] !== null
      ? {
          calculatedDistanceKm: distances[index],
          numericDistance: distances[index],
          distance: `${distances[index]!.toFixed(distances[index]! < 10 ? 1 : 0)} km`,
        }
      : {}),
  })).sort((a: any, b: any) => (a.numericDistance ?? Number.POSITIVE_INFINITY) - (b.numericDistance ?? Number.POSITIVE_INFINITY));
};

const geocodeVerifiedAddress = async (address: string) => {
  const key = address.trim().toLowerCase();
  if (!key) return null;
  if (geocodeCache.has(key)) return geocodeCache.get(key) || null;
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(address)}`,
      {
        headers: {
          "User-Agent": "RestaurantLinkHub/1.0",
          "Accept-Language": "en",
        },
      },
    );
    if (!response.ok) throw new Error(`Geocoder HTTP ${response.status}`);
    const payload = await response.json() as Array<{ lat?: string; lon?: string }>;
    const latitude = Number(payload[0]?.lat);
    const longitude = Number(payload[0]?.lon);
    const result = Number.isFinite(latitude) && Number.isFinite(longitude)
      ? { latitude, longitude }
      : null;
    geocodeCache.set(key, result);
    return result;
  } catch (error) {
    console.warn(`Unable to geocode verified store address: ${address}`, error);
    geocodeCache.set(key, null);
    return null;
  }
};

const merchantIdentityMatches = (brand: any, cleanName: string, store: any) => {
  const merchantNames = expandKnownBrandIdentities([cleanName, brand?.name, brand?.nameZh]
    .map(normalizeIdentity)
    .filter((value, index, all) => value.length >= 2 && all.indexOf(value) === index));
  const storeNames = [store?.name, store?.nameZh]
    .map(normalizeIdentity)
    .filter((value) => value.length >= 2);
  return merchantNames.some((merchantName) =>
    storeNames.some((storeName) => storeName.includes(merchantName) || merchantName.includes(storeName)),
  );
};

const generatedBrandMatchesInput = (brand: any, cleanName: string) => {
  const inputNames = expandKnownBrandIdentities([normalizeIdentity(cleanName)]);
  if (!inputNames.some((value) => value.length >= 2)) return false;
  const generatedNames = expandKnownBrandIdentities([brand?.name, brand?.nameZh]
    .map(normalizeIdentity)
    .filter((value) => value.length >= 2));
  return generatedNames.some((value) =>
    inputNames.some((inputName) => value.includes(inputName) || inputName.includes(value)),
  );
};

const normalizeGroundedBrand = async (
  brand: any,
  cleanName: string,
  sources: any[],
  researchProvider: "gemini-google" | "gemini-tavily-maps" = "gemini-google",
) => {
  const brandIdentityMismatch = !generatedBrandMatchesInput(brand, cleanName);
  if (brandIdentityMismatch) {
    brand.name = cleanName;
    brand.nameZh = cleanName;
    brand.tagline = "The search results may refer to a different merchant; identity confirmation is required.";
    brand.taglineZh = "搜索结果可能属于其他商家，需要补充城市、商圈或门店信息后重新确认。";
    brand.officialSiteUrl = "";
    brand.hotline = "";
    brand.logo = "";
    brand.heroBanner = "";
    brand.socials = [];
    brand.stores = [];
    brand.menu = [];
  }
  const supportedSourceUrls = new Set(
    (Array.isArray(sources) ? sources : [])
      .map((source: any) => source?.url)
      .filter(isHttpUrl),
  );
  const supportedMapSourceUrls = new Set(
    (Array.isArray(sources) ? sources : [])
      .filter((source: any) => source?.kind === "maps")
      .map((source: any) => source?.url)
      .filter(isHttpUrl),
  );
  const hasSupportedSource = (value: unknown) => isHttpUrl(value) && supportedSourceUrls.has(value);
  const hasSupportedMapSource = (value: unknown) => isHttpUrl(value) && supportedMapSourceUrls.has(value);
  brand.sources = sources.slice(0, 40);
  brand.generationMode = "web-grounded";
  brand.researchProvider = researchProvider;
  brand.officialSiteUrl = isDirectMerchantUrl(brand.officialSiteUrl) && hasSupportedSource(brand.officialSiteUrl)
    ? brand.officialSiteUrl
    : "";
  brand.socials = (Array.isArray(brand.socials) ? brand.socials : [])
    .filter((social: any) => {
      // Model output must still satisfy the same strict, platform-specific profile/listing patterns
      // as links discovered directly from sources. This rejects posts, videos, searches and homepages.
      return !!classifyVerifiedLink({ url: social?.url }) && hasSupportedSource(social?.sourceUrl);
    })
    .map((social: any) => ({
      ...social,
      followers: social.followers && !/^0(?:\s|$)/.test(String(social.followers)) ? social.followers : "",
      sourceUrl: social.sourceUrl || social.url,
    }));
  if (!brandIdentityMismatch) {
    const extraLinks: any[] = [];
    if (brand.officialSiteUrl && hasSupportedSource(brand.officialSiteUrl)) {
      extraLinks.push({
        name: "Official Website", nameZh: "官方网站", icon: "ExternalLink", badge: "Official",
        url: brand.officialSiteUrl, sourceUrl: brand.officialSiteUrl,
      });
    }
    for (const source of Array.isArray(sources) ? sources : []) {
      const link = classifyVerifiedLink(source);
      if (!link) continue;
      let sourceIdentity = source.title || "";
      try {
        sourceIdentity += ` ${decodeURIComponent(new URL(source.url).pathname)}`;
      } catch {}
      if (!merchantIdentityMatches(brand, cleanName, { name: sourceIdentity, nameZh: sourceIdentity })) continue;
      extraLinks.push({ ...link, url: source.url, sourceUrl: source.url, sourceTitle: source.title || link.name });
    }
    for (const link of extraLinks) {
      if (brand.socials.some((social: any) => social.url === link.url || social.name === link.name)) continue;
      brand.socials.push({
        id: `verified-link-${brand.socials.length + 1}`,
        ...link,
        handle: link.name,
        followers: "",
        color: "#111827",
        bgColor: "bg-neutral-50 text-neutral-700 border-neutral-200",
        sourceTitle: link.sourceTitle || link.name,
      });
      if (brand.socials.length >= 16) break;
    }
    for (const social of getCuratedVerifiedSocials(cleanName, brand)) {
      const curatedUrlKey = social.url.replace(/\/+$/, "").toLowerCase();
      if (brand.socials.some((existing: any) =>
        typeof existing.url === "string" && existing.url.replace(/\/+$/, "").toLowerCase() === curatedUrlKey,
      )) continue;
      brand.socials.push(social);
    }
    const usedSocialIds = new Set<string>();
    brand.socials = brand.socials.map((social: any, index: number) => {
      const requestedId = typeof social.id === "string" && social.id.trim()
        ? social.id.trim()
        : `verified-social-${index + 1}`;
      let uniqueId = requestedId;
      let suffix = 2;
      while (usedSocialIds.has(uniqueId)) uniqueId = `${requestedId}-${suffix++}`;
      usedSocialIds.add(uniqueId);
      return { ...social, id: uniqueId };
    });
  }
  const candidateStores = Array.isArray(brand.stores) ? brand.stores : [];
  const storeOrMapSourceIdentityMatches = (store: any) => {
    if (merchantIdentityMatches(brand, cleanName, store)) return true;
    const mapSource = (Array.isArray(sources) ? sources : []).find((source: any) =>
      source?.kind === "maps" && source?.url === store?.sourceUrl,
    );
    return !!mapSource && merchantIdentityMatches(brand, cleanName, {
      name: mapSource.title,
      nameZh: mapSource.title,
    });
  };
  const identityMismatchCount = candidateStores.filter((store: any) =>
    store?.address && hasSupportedMapSource(store.sourceUrl) && !storeOrMapSourceIdentityMatches(store),
  ).length;
  brand.stores = candidateStores
    .filter((store: any) => store?.address && hasSupportedMapSource(store.sourceUrl))
    .filter(storeOrMapSourceIdentityMatches)
    .slice(0, 5)
    .map((store: any, index: number) => {
      const mapSource = (Array.isArray(sources) ? sources : []).find((source: any) =>
        source?.kind === "maps" && source?.url === store.sourceUrl,
      );
      const reviewUrl = typeof mapSource?.placeId === "string" && mapSource.placeId.trim()
        ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(mapSource.placeId.trim())}`
        : "";
      return {
        ...store,
        id: store.id || `store-${index + 1}`,
        latitude: Number.isFinite(Number(store.latitude)) ? Number(store.latitude) : 0,
        longitude: Number.isFinite(Number(store.longitude)) ? Number(store.longitude) : 0,
        mapUrl: isHttpUrl(store.mapUrl)
          ? store.mapUrl
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`,
        reviewUrl,
        distance: typeof store.distance === "string" && /(?:km|mi)$/i.test(store.distance.trim())
          ? store.distance.trim()
          : "",
      };
    });
  for (let index = 0; index < brand.stores.length; index += 1) {
    const store = brand.stores[index];
    const hasCoordinates = Number.isFinite(store.latitude)
      && Number.isFinite(store.longitude)
      && !(store.latitude === 0 && store.longitude === 0);
    if (hasCoordinates) continue;
    const coordinates = await geocodeVerifiedAddress(store.address);
    if (coordinates) Object.assign(store, coordinates);
    if (index < brand.stores.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1050));
    }
  }
  const verifiedImageSources = (Array.isArray(sources) ? sources : [])
    .filter((source: any) => source?.kind === "tavily" && isLikelyImageUrl(source?.url));
  brand.menu = (Array.isArray(brand.menu) ? brand.menu : [])
    .filter((item: any) => item?.name && hasSupportedSource(item.sourceUrl))
    .map((item: any, index: number) => {
      const names = [item.name, item.nameZh]
        .map(normalizeIdentity)
        .filter((name) => name.length >= 3);
      const matchingImageSource = verifiedImageSources.find((source: any) => {
        const description = normalizeIdentity(source.title);
        return names.some((name) => description.includes(name) || name.includes(description));
      });
      const hasVerifiedModelImage = isLikelyImageUrl(item.image) && hasSupportedSource(item.imageSourceUrl);
      return {
        ...item,
        id: item.id || `item-${index + 1}`,
        price: Number.isFinite(Number(item.price)) ? Number(item.price) : 0,
        currency: typeof item.currency === "string" ? item.currency.toUpperCase() : "",
        image: hasVerifiedModelImage ? item.image : (matchingImageSource?.url || ""),
        imageSourceUrl: hasVerifiedModelImage ? item.imageSourceUrl : (matchingImageSource?.url || ""),
        calories: item.calories || "",
        tags: Array.isArray(item.tags) ? item.tags : [],
        tagsZh: Array.isArray(item.tagsZh) ? item.tagsZh : [],
      };
    });
  const firstVerifiedImage = brand.menu.find((item: any) => isHttpUrl(item.image))?.image || "";
  brand.logo = isHttpUrl(brand.logo) && isHttpUrl(brand.logoSourceUrl) ? brand.logo : firstVerifiedImage;
  brand.heroBanner = isHttpUrl(brand.heroBanner) && isHttpUrl(brand.heroBannerSourceUrl)
    ? brand.heroBanner
    : firstVerifiedImage;
  brand.promptKeywords = makeRestaurantKeywords(
    brand.name || cleanName,
    brand.nameZh || brand.name || cleanName,
    brand.menu,
  );
  if (!brand.hotline || /not verified|未查证/i.test(brand.hotline)) {
    brand.hotline = brand.stores.find((store: any) => store.phone)?.phone || "";
  }
  brand.hotlineLabel = brand.hotline || "Not verified";
  brand.hotlineLabelZh = brand.hotline || "未查证";
  const verifiedSections = [brand.stores.length > 0, brand.menu.length > 0, brand.socials.length > 0].filter(Boolean).length;
  brand.dataQuality = sources.length > 0 && verifiedSections >= 2 ? "verified" : "partial";
  brand.verifiedBadge = sources.length > 0 && verifiedSections >= 2;
  brand.warnings = [];
  if (sources.length === 0) brand.warnings.push("没有返回可验证来源，请勿将此页面作为商家正式资料发布。");
  if (brandIdentityMismatch) brand.warnings.push("搜索结果中的商家名称与输入名称不一致，已清空相关门店、菜单、社媒和电话，避免错误替换商家。");
  if (identityMismatchCount > 0) brand.warnings.push("地图候选门店名称与输入商家不一致，已自动剔除，避免误用其他餐馆资料。");
  if (brand.stores.length === 0) brand.warnings.push("尚未确认与输入名称完全匹配的门店地址和电话。");
  if (brand.menu.length === 0) brand.warnings.push("尚未找到有网页来源支持的真实菜单和菜品图片。");
  if (brand.socials.length === 0) brand.warnings.push("尚未找到有网页来源支持的商家社交媒体主页。");
  return brand;
};

// Lazy Stripe Client Initialization
let stripeClient: Stripe | null = null;
const getStripe = (): Stripe | null => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }
  return stripeClient;
};

// In-memory reviews store with rich realistic initial Starbucks data
let initialReviews = [
  {
    id: "rev-sb-1",
    brand: "starbucks",
    storeName: "Starbucks Reserve Roastery Flagship",
    author: "Emma Watson",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    platform: "Google Maps",
    date: "10 mins ago",
    comment: "The barista handcrafted the most silky Oatmilk Honey Flat White I have ever had! The high-ceiling seating area is fantastic for remote work with plenty of outlets and super-fast Wi-Fi. Truly a 5-star morning routine. ☕️✨",
    tags: ["Oatmilk Flat White", "Reserve Roastery", "High-Speed Wi-Fi", "Master Barista"],
    likes: 64,
    verified: true,
  },
  {
    id: "rev-sb-2",
    brand: "starbucks",
    storeName: "Starbucks Financial Center Reserve",
    author: "David Zhang (张先生)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    platform: "小红书 RED",
    date: "1 hour ago",
    comment: "小红书种草的燕麦馥芮白加一泵香草果然封神！早高峰在地铁上提前手机点单【啡快】，进店直接在专属自提柜秒拿，完全不用排队，打工人提神本命！☕️🎒",
    tags: ["隐藏特调喝法", "啡快自提秒取", "燕麦奶馥芮白", "早八人必备"],
    likes: 128,
    verified: true,
  },
  {
    id: "rev-sb-3",
    brand: "starbucks",
    storeName: "Starbucks Transit Hub Express",
    author: "Sophia Vance",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    platform: "Yelp",
    date: "Yesterday",
    comment: "The Java Chip Frappuccino with warm butter croissant is my supreme afternoon pick-me-up! Crunchy cookie crumbles, fresh whipped cream, and super speedy mobile pickup service.",
    tags: ["Java Chip Frappuccino", "Warm Croissant", "Speedy Service"],
    likes: 92,
    verified: true,
  },
  {
    id: "rev-sb-4",
    brand: "starbucks",
    storeName: "Starbucks Reserve Roastery Flagship",
    author: "Liam Miller",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    platform: "TripAdvisor",
    date: "2 days ago",
    comment: "A must-visit coffee sanctuary! The Nitro Cold Brew on tap is velvet smooth with a naturally sweet cascade foam. Master baristas explained the origin of the micro-lot beans with great passion.",
    tags: ["Nitro Cold Brew", "Coffee Tasting", "Traveler Must-Visit"],
    likes: 47,
    verified: true,
  },
  {
    id: "rev-sb-5",
    brand: "starbucks",
    storeName: "Starbucks Coastal Boulevard Walk",
    author: "Elena Rostova",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    platform: "Google Maps",
    date: "3 days ago",
    comment: "The Strawberry Acai Refresher with coconut milk (Pink Drink) is crisp and delightful! Perfect vibes, clean seating patio, and pet-friendly water bowls. 🌸🥤",
    tags: ["Pink Drink", "Strawberry Acai", "Pet Friendly", "Patio Vibe"],
    likes: 115,
    verified: true,
  },
  {
    id: "rev-sb-6",
    brand: "starbucks",
    storeName: "Starbucks Financial Center Reserve",
    author: "Marcus King",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    platform: "Yelp",
    date: "4 days ago",
    comment: "Cleanest Starbucks in town! Bold Ristretto espresso shots, friendly smiles, and the mobile order pickup counter is always organized and on point.",
    tags: ["Ristretto Shots", "Organized Pickup", "5 Stars"],
    likes: 38,
    verified: true,
  }
];

// In-memory active orders store
let activeOrders: any[] = [];

// ==================== API ENDPOINTS ==================== //

// 1. Health check
app.get("/api/health", (req, res) => {
  const gemini = getGeminiConfig();
  const tavily = getTavilyConfig();
  res.json({ 
    status: "ok", 
    stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
    geminiConfigured: !!gemini.apiKey,
    geminiModel: gemini.model,
    tavilyConfigured: !!tavily.apiKey,
    timestamp: new Date().toISOString() 
  });
});

// 2. Stripe Config Status
app.get("/api/payment/config", (req, res) => {
  const secretKey = process.env.STRIPE_SECRET_KEY || "";
  const pubKey = process.env.STRIPE_PUBLISHABLE_KEY || "";
  const isConfigured = secretKey.length > 0;
  const isLive = secretKey.startsWith("sk_live_");

  res.json({
    publishableKey: pubKey,
    stripeConfigured: isConfigured,
    mode: isConfigured ? (isLive ? "live" : "test") : "simulated",
    currency: "usd",
    acceptedPaymentMethods: ["card", "wechat_pay", "alipay", "apple_pay", "link"],
  });
});

// 3. Stripe Create PaymentIntent API (Real backend checkout)
app.post("/api/payment/create-intent", async (req, res) => {
  try {
    const { 
      amount, 
      currency = "usd", 
      orderType = "pickup", 
      storeId = "", 
      storeName = "MIXUE", 
      customerName = "", 
      customerPhone = "",
      items = []
    } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: "Invalid order amount." });
    }

    const amountInCents = Math.round(Number(amount) * 100);
    const stripe = getStripe();

    if (stripe) {
      // Real Stripe PaymentIntent creation with live or test key
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: currency.toLowerCase(),
        description: `MIXUE Order - ${customerName || 'Customer'} (${orderType})`,
        metadata: {
          storeId: String(storeId),
          storeName: String(storeName),
          customerName: String(customerName),
          customerPhone: String(customerPhone),
          orderType: String(orderType),
          itemCount: String(Array.isArray(items) ? items.length : 1),
          source: "MIXUE Mini-Program Link Hub"
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return res.json({
        success: true,
        stripeConfigured: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        livemode: paymentIntent.livemode,
      });
    }

    // High-fidelity sandbox fallback when STRIPE_SECRET_KEY is pending in Settings/Secrets
    const simulatedIntentId = `pi_sandbox_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const simulatedClientSecret = `${simulatedIntentId}_secret_${Math.random().toString(36).substring(2, 10)}`;

    return res.json({
      success: true,
      stripeConfigured: false,
      isSandbox: true,
      clientSecret: simulatedClientSecret,
      paymentIntentId: simulatedIntentId,
      amount: Number(amount),
      currency: currency.toLowerCase(),
      status: "requires_payment_method",
      livemode: false,
      message: "Stripe backend initialized in sandbox mode. Add STRIPE_SECRET_KEY in Settings to enable live/test Stripe processing."
    });

  } catch (error: any) {
    console.error("Stripe Create PaymentIntent Error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to create Stripe PaymentIntent",
      code: error.code || "stripe_error"
    });
  }
});

// 4. Stripe Create Hosted Checkout Session API (For redirect-based checkout)
app.post("/api/payment/create-checkout-session", async (req, res) => {
  try {
    const { 
      amount, 
      items = [], 
      customerName, 
      customerPhone, 
      orderType = "pickup", 
      storeName = "MIXUE",
      returnUrl
    } = req.body;

    const stripe = getStripe();
    const appUrl = process.env.APP_URL || req.headers.origin || "http://localhost:3000";
    const successUrl = `${returnUrl || appUrl}?session_id={CHECKOUT_SESSION_ID}&status=success`;
    const cancelUrl = `${returnUrl || appUrl}?status=cancelled`;

    if (stripe) {
      // Map menu items into Stripe line items
      const lineItems = Array.isArray(items) && items.length > 0 
        ? items.map((cartItem: any) => ({
            price_data: {
              currency: "usd",
              product_data: {
                name: cartItem.item?.name || cartItem.name || "MIXUE Beverage",
                description: `${cartItem.size || "Large"} ${cartItem.ice ? `• ${cartItem.ice}` : ""} ${cartItem.sweetness ? `• ${cartItem.sweetness}` : ""}`,
                images: cartItem.item?.image ? [cartItem.item.image] : [],
              },
              unit_amount: Math.round(Number(cartItem.itemPrice || cartItem.price || 1.50) * 100),
            },
            quantity: Number(cartItem.quantity || 1),
          }))
        : [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `MIXUE Order (${storeName})`,
                  description: `${orderType === 'pickup' ? 'In-Store Pickup' : 'Delivery'} for ${customerName || 'Customer'}`,
                },
                unit_amount: Math.round(Number(amount || 1.50) * 100),
              },
              quantity: 1,
            }
          ];

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card", "link"],
        line_items: lineItems,
        mode: "payment",
        customer_email: req.body.customerEmail || undefined,
        metadata: {
          customerName: String(customerName || ""),
          customerPhone: String(customerPhone || ""),
          orderType: String(orderType),
          storeName: String(storeName),
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      return res.json({
        success: true,
        stripeConfigured: true,
        sessionId: session.id,
        url: session.url,
      });
    }

    // Sandbox simulated session URL
    return res.json({
      success: true,
      stripeConfigured: false,
      isSandbox: true,
      sessionId: `cs_sandbox_${Date.now()}`,
      url: null,
      message: "Stripe sandbox session created. Add STRIPE_SECRET_KEY in Settings to enable hosted Stripe Checkout URLs."
    });

  } catch (error: any) {
    console.error("Stripe Create Checkout Session Error:", error);
    res.status(500).json({ error: error.message || "Failed to create Stripe Checkout session" });
  }
});

// 5. Stripe Verify & Confirm Order API
app.post("/api/payment/confirm-order", async (req, res) => {
  try {
    const { 
      paymentIntentId, 
      method, 
      customerName, 
      customerPhone, 
      orderType, 
      store, 
      items, 
      finalTotal,
      verificationCode,
      authCode
    } = req.body;

    const orderNumber = `MX${Date.now().toString().slice(-6)}`;
    const queueCode = `A0${Math.floor(10 + Math.random() * 89)}`;
    const receiptNumber = `RCP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    let stripeStatus = "confirmed";
    let stripeReceiptUrl = "";

    // If a real Stripe paymentIntentId is provided, check with Stripe server-side
    const stripe = getStripe();
    if (stripe && paymentIntentId && !paymentIntentId.startsWith("pi_sandbox_")) {
      try {
        const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
        stripeStatus = intent.status;
        if (intent.latest_charge && typeof intent.latest_charge === "object") {
          stripeReceiptUrl = (intent.latest_charge as any).receipt_url || "";
        }
      } catch (e) {
        console.warn("Could not retrieve Stripe intent:", e);
      }
    }

    const confirmedOrder = {
      orderNumber,
      queueCode,
      receiptNumber,
      customerName: customerName || "Customer",
      customerPhone: customerPhone || "138-0013-8000",
      orderType: orderType || "pickup",
      store: store || { name: "MIXUE Flagship", address: "Downtown" },
      items: items || [],
      total: Number(finalTotal || 0),
      method: method || "credit_card",
      paymentIntentId: paymentIntentId || `txn_${Date.now()}`,
      stripeStatus,
      stripeReceiptUrl,
      authCode: authCode || `AUTH-${Math.floor(100000 + Math.random() * 900000)}`,
      status: "paid",
      placedAt: new Date().toISOString(),
      estimatedReadyTime: new Date(Date.now() + 5 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    activeOrders.unshift(confirmedOrder);

    res.status(201).json({
      success: true,
      order: confirmedOrder
    });

  } catch (error: any) {
    console.error("Order Confirmation Error:", error);
    res.status(500).json({ error: error.message || "Failed to confirm order" });
  }
});

// 6. Orders List
app.get("/api/orders", (req, res) => {
  res.json(activeOrders);
});

// 7. Get community reviews
app.get("/api/reviews", (req, res) => {
  const { brand } = req.query;
  if (brand) {
    return res.json(initialReviews.filter(r => r.brand === brand || !r.brand));
  }
  res.json(initialReviews);
});

// 8. Post a new review
app.post("/api/reviews", (req, res) => {
  const { brand, storeName, author, rating, platform, comment, tags } = req.body;
  if (!author || !comment || !rating) {
    return res.status(400).json({ error: "Author, rating, and comment are required." });
  }

  const newReview = {
    id: `rev-${Date.now()}`,
    brand: brand || "mixue",
    storeName: storeName || "MIXUE Snow King Global Flagship",
    author: author.trim(),
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(author)}`,
    rating: Number(rating),
    platform: platform || "Google",
    date: "Just now",
    comment: comment.trim(),
    tags: tags && Array.isArray(tags) ? tags : [],
    likes: 1,
    verified: true,
  };

  initialReviews.unshift(newReview);
  res.status(201).json(newReview);
});

// 9. Like a review
app.post("/api/reviews/:id/like", (req, res) => {
  const { id } = req.params;
  const review = initialReviews.find(r => r.id === id);
  if (review) {
    review.likes += 1;
    return res.json({ success: true, likes: review.likes });
  }
  res.status(404).json({ error: "Review not found" });
});

// 10. AI Review Assistant & Enhancer using Gemini
app.post("/api/generate-review", async (req, res) => {
  try {
    const {
      brand = "Restaurant",
      storeName = "Selected location",
      rating = 5,
      keywords = [],
      tone = "enthusiastic",
      language = "en",
      userDraft = "",
      platform = "Google Maps",
      favoriteItems = []
    } = req.body;

    const gemini = getGeminiConfig();
    const keywordsList = Array.isArray(keywords) && keywords.length > 0 
      ? keywords.join(", ") 
      : (userDraft || `${brand} signature dishes and service experience`);

    if (gemini.apiKey) {
      const prompt = `You are an expert restaurant review polisher. Write only from the customer's supplied notes; never invent dishes or experiences.
Target Platform: ${platform}
Brand: ${brand}
Store: ${storeName}
Customer Star Rating: ${rating}/5 stars
Customer Selected Keywords / Prompts: "${keywordsList}"
Customer's Rough Notes / Input: "${userDraft}"
Selected Tone / Style Preference: ${tone} (strictly craft the primary text in this ${tone} tone)
Target Language: ${language}

Instructions:
1. Write a natural, highly polished, authentic 5-star review tailored specifically to the customer's selected keywords ("${keywordsList}") matching the requested tone "${tone}".
2. Ensure the review directly references the specific products or experience mentioned in the keywords.
3. Length: 35-90 words. Keep it natural, authentic and engaging with 2-3 suitable emojis.
4. Provide the polished review along with style variations.

Return ONLY a valid JSON object matching this schema:
{
  "text": "The primary polished review text matching the requested ${tone} style...",
  "tone": "${tone}",
  "options": [
    {
      "id": "opt-1",
      "tone": "enthusiastic",
      "style": "✨ Enthusiastic & Warm",
      "text": "...",
      "tags": ["..."]
    },
    {
      "id": "opt-2",
      "tone": "concise",
      "style": "⚡ Short & Punchy",
      "text": "...",
      "tags": ["..."]
    },
    {
      "id": "opt-3",
      "tone": "foodie",
      "style": "🍽️ Gourmet Foodie",
      "text": "...",
      "tags": ["..."]
    },
    {
      "id": "opt-4",
      "tone": "professional",
      "style": "💼 Professional",
      "text": "...",
      "tags": ["..."]
    }
  ]
}`;

      try {
        const response = await callGemini(prompt, { json: true, temperature: 0.5, maxOutputTokens: 4096 });
        if (response.text) {
        try {
          const parsed = parseModelJson(response.text);
          if (parsed.text || parsed.options) {
            return res.json({
              text: parsed.text || parsed.options?.[0]?.text,
              tone: parsed.tone || tone,
              options: parsed.options || []
            });
          }
        } catch (e) {
          console.error("JSON parse error from Gemini output:", e);
        }
      }
      } catch (error) {
        console.error("Gemini review generation failed; using local fallback:", error);
      }
    }

    // Dynamic High-Quality Fallback incorporating user keywords and selected tone
    const isZh = language === "zh" || language === "zh-TW";
    const userKeywordText = Array.isArray(keywords) && keywords.length > 0
      ? keywords.join("，")
      : (userDraft || (isZh ? `${brand}的招牌餐品和门店体验` : `${brand} signature dishes and in-store experience`));

    if (isZh) {
      const toneMap: Record<string, string> = {
        enthusiastic: `这次在${storeName}的体验很惊喜！${userKeywordText}。从餐品到服务都很用心，值得推荐！✨🍽️`,
        concise: `${brand}体验很棒：${userKeywordText}。值得再来！⭐️`,
        foodie: `这次仔细品尝了${brand}：${userKeywordText}。餐品特点鲜明，整体搭配和口感都令人印象深刻。🍽️`,
        professional: `${storeName}整体体验稳定。${userKeywordText}。信息清晰，服务流程顺畅，值得参考。`
      };

      const primaryText = toneMap[tone] || toneMap.enthusiastic;
      const options = [
        { id: "opt-1", tone: "enthusiastic", style: "✨ 热情真诚", text: toneMap.enthusiastic, tags: [brand, "真实关键词", "推荐"] },
        { id: "opt-2", tone: "concise", style: "⚡ 极速短评", text: toneMap.concise, tags: ["极速五星", "打卡必备"] },
        { id: "opt-3", tone: "foodie", style: "🍽️ 风味品鉴", text: toneMap.foodie, tags: ["大师特调", "风味纯正", "无限回购"] },
        { id: "opt-4", tone: "professional", style: "💼 商务得体", text: toneMap.professional, tags: ["商务高效", "品质出餐"] }
      ];

      return res.json({ text: primaryText, tone, options });
    }

    // English & other languages fallback
    const toneMapEn: Record<string, string> = {
      enthusiastic: `Really enjoyed my visit to ${storeName}! ${userKeywordText}. The experience felt thoughtful and worth recommending. ✨🍽️`,
      concise: `Great ${brand} visit: ${userKeywordText}. Worth returning! ⭐️`,
      foodie: `A closer taste of ${brand}: ${userKeywordText}. The restaurant's distinctive dishes made the visit memorable. 🍽️`,
      professional: `${storeName} delivered a consistent experience. ${userKeywordText}. The information and service flow were clear and useful.`
    };

    const primaryTextEn = toneMapEn[tone] || toneMapEn.enthusiastic;
    const optionsEn = [
      { id: "opt-1", tone: "enthusiastic", style: "✨ Enthusiastic", text: toneMapEn.enthusiastic, tags: [brand, "Customer keywords", "Recommended"] },
      { id: "opt-2", tone: "concise", style: "⚡ Short & Punchy", text: toneMapEn.concise, tags: ["Fast 5-Star", "Must Visit"] },
      { id: "opt-3", tone: "foodie", style: "🍽️ Gourmet Foodie", text: toneMapEn.foodie, tags: ["Gourmet Roast", "Master Craft", "Top Recommendation"] },
      { id: "opt-4", tone: "professional", style: "💼 Professional", text: toneMapEn.professional, tags: ["Efficient", "Great Workspace"] }
    ];

    res.json({ text: primaryTextEn, tone, options: optionsEn });

  } catch (error) {
    console.error("AI Review Generation Error:", error);
    res.status(500).json({ error: "Failed to generate review. Please try again." });
  }
});

// Dynamic In-Memory Brands Registry
let customGeneratedBrands: any[] = [];
const brandTranslationCache = new Map<string, any>();

// 11. Get custom generated brands
app.get("/api/brands", (req, res) => {
  res.json(customGeneratedBrands);
});

app.post("/api/translate-brand", async (req, res) => {
  try {
    const { brand, language } = req.body || {};
    const languageNames: Record<string, string> = {
      "zh-TW": "Traditional Chinese",
      ja: "Japanese",
      ko: "Korean",
      es: "Spanish",
      fr: "French",
      de: "German",
    };
    const targetLanguage = languageNames[language];
    if (!brand?.id || !targetLanguage) {
      return res.status(400).json({ error: "A supported target language and brand are required." });
    }
    const cacheKey = `${brand.id}:${language}:${brand.name}:${brand.menu?.length || 0}:${brand.stores?.length || 0}`;
    if (brandTranslationCache.has(cacheKey)) {
      return res.json({ success: true, localization: brandTranslationCache.get(cacheKey), cached: true });
    }
    if (!getGeminiConfig().apiKey) {
      return res.status(503).json({ error: "Gemini is required for dynamic page translation." });
    }

    const translationInput = {
      name: brand.name || "",
      tagline: brand.tagline || "",
      cuisineType: brand.cuisineType || "",
      hotlineLabel: brand.hotlineLabel || "",
      promptKeywords: Array.isArray(brand.promptKeywords?.en) ? brand.promptKeywords.en.slice(0, 8) : [],
      socials: (Array.isArray(brand.socials) ? brand.socials : []).slice(0, 16).map((item: any) => ({
        id: item.id, name: item.name || "", badge: item.badge || "",
      })),
      stores: (Array.isArray(brand.stores) ? brand.stores : []).slice(0, 5).map((store: any) => ({
        id: store.id, name: store.name || "", type: store.type || "", address: store.address || "",
        hours: store.hours || "", features: Array.isArray(store.features) ? store.features : [],
      })),
      menu: (Array.isArray(brand.menu) ? brand.menu : []).slice(0, 12).map((item: any) => ({
        id: item.id, name: item.name || "", category: item.category || "", description: item.description || "",
        calories: item.calories || "", tags: Array.isArray(item.tags) ? item.tags : [],
      })),
    };
    const prompt = `Translate every human-readable value in the JSON below into ${targetLanguage} for a restaurant website.
Preserve JSON keys, IDs, array order, numbers, prices, phone numbers, postal codes, URLs, brand handles and proper brand names. Keep full addresses factually exact; translate or transliterate locality words without removing any address component. Do not add facts or commentary. Return only JSON with exactly the same structure.

INPUT JSON:
${JSON.stringify(translationInput)}`;
    const result = await callGemini(prompt, {
      json: true,
      temperature: 0,
      maxOutputTokens: 8192,
    });
    const localization = parseModelJson(result.text);
    if (!localization || !Array.isArray(localization.menu) || !Array.isArray(localization.stores)) {
      throw new Error("Translation response was incomplete.");
    }
    brandTranslationCache.set(cacheKey, localization);
    res.json({ success: true, localization, cached: false });
  } catch (error: any) {
    console.error("Brand translation error:", error);
    res.status(500).json({ error: error.message || "Brand translation failed." });
  }
});

// 12. AI Workflow: Automate generation of a complete restaurant hub profile
app.post("/api/workflow/generate-restaurant", async (req, res) => {
  try {
    const {
      name,
      cuisineType = "Contemporary Dining",
      city = "Shanghai",
      description = "",
      menuInput = "",
      targetColor = "",
      language = "zh",
      userLatitude,
      userLongitude,
      existingBrandId
    } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "Restaurant name is required." });
    }

    const cleanName = name.trim();
    const requestedBrandId = typeof existingBrandId === "string" && /^[a-z0-9-]+$/.test(existingBrandId)
      ? existingBrandId
      : "";
    const brandId = requestedBrandId || stableRestaurantBrandId(cleanName);
    const gemini = getGeminiConfig();

    const workflowLogs = [
      { id: "step-1", title: "Web research & identity matching", titleZh: "全网检索与餐厅身份匹配", status: "completed", detail: `Searched public sources for "${cleanName}" in ${city}` },
      { id: "step-2", title: "Official links & contact verification", titleZh: "官网、社交媒体与联系方式校验", status: "completed", detail: "Kept source-backed links; unknown fields remain unverified" },
      { id: "step-3", title: "Menu extraction & structuring", titleZh: "菜单检索与双语结构化", status: "completed", detail: "Structured found menu items and user-provided notes" },
      { id: "step-4", title: "Page assembly & quality check", titleZh: "页面组装与事实质量检查", status: "completed", detail: "Flagged missing or unverified information instead of inventing it" }
    ];
    let fallbackEvidenceSources: any[] = [];
    let fallbackResearchProvider: "gemini-google" | "gemini-tavily-maps" = "gemini-google";

    if (gemini.apiKey) {
      const prompt = `You are a Principal AI Restaurant Systems Architect.
Execute an automated end-to-end workflow to generate a complete, production-ready, beautifully localized restaurant hub configuration for:
- Restaurant Name: "${cleanName}"
- Cuisine Type / Concept: "${cuisineType}"
- Target City / Primary Market: "${city}"
- Custom Notes / Description: "${description || 'Authentic signature dishes with fresh daily ingredients'}"
- Raw Menu Notes / Items: "${menuInput || 'Signature items, appetizers, main courses, desserts, specialty beverages'}"
- Target Theme Color (optional): "${targetColor || 'Select the most iconic and appetizing brand color'}"
- Preferred Language: "${language}"

CRITICAL INSTRUCTIONS FOR ACCURACY:
1. Search the public web before answering. Resolve ambiguous names using the requested city and concept. Never silently substitute a similarly named restaurant.
2. Use only facts supported by search results or the user's notes. Never invent an official website, phone number, address, social handle, follower count, rating, review count, price, or menu item.
3. Use a direct official/profile URL when found. Do not use a platform homepage as if it were the restaurant's profile. Omit unsupported social channels.
4. For unknown strings use "Not verified" / "未查证"; for unknown arrays use []; for unknown numeric values use 0. A useful partial result is better than polished fiction.
5. Menu items must be found in an official menu or credible listing, or explicitly supplied in Raw Menu Notes. Put unavailable prices at 0.
6. Include no more than 6 of the strongest, source-backed social/review/order links.

Output must be a single strict JSON object matching this BrandConfig structure:
{
  "id": "${brandId}",
  "name": "English name of restaurant",
  "nameZh": "中文名称 (包含英文或副标)",
  "tagline": "Inspiring English brand tagline (1-2 sentences)",
  "taglineZh": "优美动人的中文品牌愿景与Slogan (1-2句话)",
  "logo": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80",
  "heroBanner": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80",
  "primaryColor": "A vibrant brand hex color (e.g. #D80018, #E65100, #1E3A8A, #059669, #1A1A1A)",
  "accentColor": "A softer complementary pastel hex (e.g. #FEE2E2, #FEF3C7, #DBEAFE, #D1FAE5, #F5EBE6)",
  "bgColor": "A very light warm neutral background hex (e.g. #FAFAFA, #FFFBF5, #F8FAFC, #FDFBF9)",
  "cardBg": "#FFFFFF",
  "verifiedBadge": true,
  "officialSiteUrl": "https://www.example.com",
  "hotline": "400-888-0000",
  "hotlineLabel": "400-888-0000",
  "hotlineLabelZh": "400-888-0000 (全国服务热线)",
  "cateringEmail": "contact@restaurant.com",
  "cuisineType": "${cuisineType}",
  "cuisineTypeZh": "中文菜系分类",
  "promptKeywords": {
    "zh": ["6 specific high-frequency positive praise prompts for customer AI reviews, with emojis, e.g. 🍲 招牌锅底鲜香浓郁, 🥩 现切雪花牛肉鲜嫩多汁, ⚡ 上菜极速服务贴心"],
    "en": ["6 specific English review prompts with emojis, e.g. 🍲 Rich & Savory Signature Broth, 🥩 Melt-in-mouth Prime Beef, ⚡ Lightning-Fast Service"]
  },
  "socials": [
    {
      "id": "xiaohongshu",
      "name": "Xiaohongshu (RED)",
      "nameZh": "小红书 官方号",
      "handle": "@${cleanName}",
      "url": "https://www.xiaohongshu.com",
      "icon": "BookOpen",
      "followers": "2.5M Followers",
      "badge": "Official Verified",
      "color": "#FF2442",
      "bgColor": "bg-rose-50 text-rose-700 border-rose-200"
    },
    {
      "id": "instagram",
      "name": "Instagram (Global)",
      "nameZh": "Instagram 官方",
      "handle": "@${cleanName.toLowerCase().replace(/\\s+/g, '')}",
      "url": "https://www.instagram.com",
      "icon": "Instagram",
      "followers": "480K Followers",
      "badge": "Official Page",
      "color": "#E4405F",
      "bgColor": "bg-pink-50 text-pink-700 border-pink-200"
    },
    {
      "id": "weibo",
      "name": "Weibo",
      "nameZh": "新浪微博 官方号",
      "handle": "@${cleanName}",
      "url": "https://weibo.com",
      "icon": "Share2",
      "followers": "3.8M Followers",
      "badge": "Official News",
      "color": "#E6162D",
      "bgColor": "bg-red-50 text-red-700 border-red-200"
    },
    {
      "id": "tiktok",
      "name": "TikTok",
      "nameZh": "TikTok 官方账号",
      "handle": "@${cleanName.toLowerCase().replace(/\\s+/g, '')}_official",
      "url": "https://www.tiktok.com",
      "icon": "Video",
      "followers": "850K Followers",
      "badge": "Viral Moments",
      "color": "#000000",
      "bgColor": "bg-neutral-100 text-neutral-900 border-neutral-300"
    },
    {
      "id": "facebook",
      "name": "Facebook",
      "nameZh": "Facebook 官方主页",
      "handle": "@${cleanName}",
      "url": "https://www.facebook.com",
      "icon": "Facebook",
      "followers": "500K Likes",
      "badge": "Community",
      "color": "#1877F2",
      "bgColor": "bg-blue-50 text-blue-700 border-blue-200"
    },
    {
      "id": "youtube",
      "name": "YouTube",
      "nameZh": "YouTube 官方频道",
      "handle": "@${cleanName}",
      "url": "https://www.youtube.com",
      "icon": "Play",
      "followers": "150K Subscribers",
      "badge": "Brand Stories",
      "color": "#FF0000",
      "bgColor": "bg-red-50 text-red-700 border-red-200"
    }
  ],
  "stores": [
    {
      "id": "store-1",
      "name": "${cleanName} Grand Flagship",
      "nameZh": "${cleanName} · 核心旗舰店 (中心大道店)",
      "type": "Grand Flagship & Dining Room",
      "address": "101 Central Avenue, Grand Mall Floor 1",
      "addressZh": "中心大道101号万象汇购物中心1楼中庭 (景观位/VIP包厢)",
      "distance": "0.3 km",
      "latitude": 31.2288,
      "longitude": 121.4589,
      "phone": "+86 400-888-0000",
      "hours": "10:00 AM - 10:00 PM Daily",
      "hoursZh": "每日 10:00 - 22:00",
      "isOpen": true,
      "features": ["Table Service", "Private Dining Rooms", "Mobile Pickup", "Free High-Speed Wi-Fi"],
      "featuresZh": ["堂食点餐", "专属包间", "手机自提", "极速Wi-Fi"],
      "rating": 4.9,
      "reviewCount": 3840,
      "queueCount": 4,
      "prepEstimateMinutes": 8,
      "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80"
    },
    {
      "id": "store-2",
      "name": "${cleanName} Financial Plaza Store",
      "nameZh": "${cleanName} · 金融中心店 (IFC大厦店)",
      "type": "Express Bistro & Takeaway",
      "address": "500 Financial Boulevard, B1 Atrium",
      "addressZh": "金融大道500号IFC地下1层 (商务专属取餐区)",
      "distance": "1.1 km",
      "latitude": 31.2350,
      "longitude": 121.4980,
      "phone": "+86 400-888-0000",
      "hours": "10:30 AM - 09:30 PM",
      "hoursZh": "每日 10:30 - 21:30",
      "isOpen": true,
      "features": ["Express Pickup", "Business Lunch Combos", "Contactless QR Order"],
      "featuresZh": ["极速自提", "商务套餐", "无接触扫码"],
      "rating": 4.8,
      "reviewCount": 1920,
      "queueCount": 2,
      "prepEstimateMinutes": 5,
      "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80"
    }
  ],
  "menu": [
    {
      "id": "item-1",
      "name": "Signature Chef's Special Dish",
      "nameZh": "主厨招牌头牌经典",
      "category": "Signatures",
      "categoryZh": "主厨招牌",
      "price": 18.99,
      "description": "Crafted with premium ingredients, secret aromatic seasoning, and cooked to mouthwatering perfection.",
      "descriptionZh": "严选高品质天然食材，古法秘制调味，慢火细炖鲜香四溢，进店必点招牌。",
      "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
      "calories": "480 kcal",
      "popular": true,
      "tags": ["Chef's Pick", "Best Seller"],
      "tagsZh": ["主厨力荐", "人气TOP1"],
      "options": {
        "sizes": [{ "name": "Regular 标准份", "extraPrice": 0 }, { "name": "Large 豪华大份", "extraPrice": 5.00 }],
        "sweetness": ["Original 经典原味", "Spicy 秘制香辣", "Garlic 浓郁蒜香"],
        "toppings": [
          { "name": "Extra Truffle Sauce", "nameZh": "黑松露风味酱", "price": 2.50 },
          { "name": "Signature Soft Egg", "nameZh": "流心溏心蛋", "price": 1.50 }
        ]
      }
    },
    {
      "id": "item-2",
      "name": "Artisan Delight Platter",
      "nameZh": "手工精选风味拼盘",
      "category": "Signatures",
      "categoryZh": "主厨招牌",
      "price": 14.50,
      "description": "A delightful medley of freshly prepared favorites served with house-made dipping glaze.",
      "descriptionZh": "现点现做多重风味组合，搭配秘制蘸料，口感层次丰富过瘾。",
      "image": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80",
      "calories": "390 kcal",
      "popular": true,
      "tags": ["Popular", "House Specialty"],
      "tagsZh": ["热销爆款", "店内独创"],
      "options": {
        "sizes": [{ "name": "Regular", "extraPrice": 0 }, { "name": "Large", "extraPrice": 4.00 }],
        "toppings": [{ "name": "Cheese Topping", "nameZh": "浓香芝士碎", "price": 2.00 }]
      }
    },
    {
      "id": "item-3",
      "name": "Crispy Golden Appetizer",
      "nameZh": "酥脆金黄招牌小食",
      "category": "Sides & Snacks",
      "categoryZh": "精选小吃",
      "price": 8.50,
      "description": "Golden-brown crispiness on the outside, tender and juicy inside.",
      "descriptionZh": "外皮金黄酥脆，内里汁水丰盈，一口下去满口留香。",
      "image": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&auto=format&fit=crop&q=80",
      "calories": "280 kcal",
      "popular": false,
      "tags": ["Crispy", "Must Try"],
      "tagsZh": ["酥脆解馋", "推荐搭配"]
    },
    {
      "id": "item-4",
      "name": "Signature Refreshing Drink",
      "nameZh": "招牌鲜萃沁爽特饮",
      "category": "Beverages",
      "categoryZh": "鲜萃饮品",
      "price": 5.90,
      "description": "Freshly brewed iced beverage infused with aromatic natural fruits and citrus zest.",
      "descriptionZh": "鲜榨现萃，融入饱满鲜果果肉，酸甜清爽解腻神器。",
      "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
      "calories": "140 kcal",
      "popular": true,
      "tags": ["Refreshing", "Cold Brewed"],
      "tagsZh": ["清爽解腻", "鲜果现萃"],
      "options": {
        "sizes": [{ "name": "Regular 500ml", "extraPrice": 0 }, { "name": "Large 700ml", "extraPrice": 1.50 }],
        "iceLevels": ["Normal Ice 正常冰", "Less Ice 少冰", "No Ice 去冰"],
        "sweetness": ["Regular 100%", "Less Sugar 70%", "Half Sugar 50%", "Sugar Free 0%"]
      }
    }
  ]
}

Provide 5-8 realistic menu items in total suitable for "${cuisineType}". Return ONLY the JSON object.`;

      const synthesisPromptBase = `Use the supplied Google Search and Google Maps evidence to return one JSON object for the exact merchant "${cleanName}" and a restaurant link hub.

Location context:
- requested city/market: ${city || "not specified"}
- device coordinates: ${Number.isFinite(Number(userLatitude)) && Number.isFinite(Number(userLongitude)) ? `${userLatitude}, ${userLongitude}` : "not available"}
- cuisine hint: ${cuisineType || "not specified"}
- user menu notes: ${menuInput || "none"}
- language: ${language}

Resolve ambiguous merchants by city, coordinates and cuisine. Use the supplied evidence for these groups:
1) the global brand's official website and contact page, independent of the user's location;
2) global direct merchant/profile/listing pages on Instagram, Facebook, TikTok/Douyin, YouTube, X/Twitter, Threads, LinkedIn, Pinterest, Xiaohongshu, Weibo, Yelp, TripAdvisor, Google Maps, OpenTable, Foursquare, Zomato, Restaurant Guru, HappyCow, Trustpilot, Dianping/Meituan, Uber Eats, DoorDash and Grubhub where available. Xiaohongshu can be a verified brand profile or a brand-specific note because users comment on notes rather than through a universal merchant-review form;
3) real branches near the device coordinates or requested city first. If the Maps evidence explicitly says no exact local branch was found and provides global fallback locations, return those real global branches and do not describe them as nearby;
4) real menu items and prices from an official menu/order page or credible menu listing;
5) usable merchant or dish photos. Every photo must include imageSourceUrl linking to the page that contains that image.

Never invent data. Never use a platform homepage as a merchant profile. Never reuse generic sample dishes or stock photos. Omit any social, store, menu item, phone, price or image that lacks a supporting source URL. Unknown numeric values must be 0. Return 6-12 sourced menu items and up to 16 sourced social/review/order links when evidence is available. Return up to 5 Google Maps branches ordered nearest-first.

Return JSON only with this shape:
{
  "id":"${brandId}", "name":"", "nameZh":"", "tagline":"", "taglineZh":"",
  "logo":"", "logoSourceUrl":"", "heroBanner":"", "heroBannerSourceUrl":"", "primaryColor":"${targetColor || "#B91C1C"}", "accentColor":"#FEE2E2", "bgColor":"#FFF8F8", "cardBg":"#FFFFFF",
  "verifiedBadge":false, "officialSiteUrl":"", "hotline":"", "hotlineLabel":"", "hotlineLabelZh":"", "cateringEmail":"",
  "cuisineType":"", "cuisineTypeZh":"",
  "socials":[{"id":"", "name":"", "nameZh":"", "handle":"", "url":"", "icon":"ExternalLink", "followers":"", "badge":"Merchant page", "color":"#111827", "bgColor":"bg-neutral-50 text-neutral-700 border-neutral-200", "sourceUrl":"", "sourceTitle":""}],
  "stores":[{"id":"", "name":"", "nameZh":"", "type":"", "address":"", "addressZh":"", "distance":"", "latitude":0, "longitude":0, "phone":"", "hours":"", "hoursZh":"", "isOpen":false, "features":[], "featuresZh":[], "rating":0, "reviewCount":0, "queueCount":0, "prepEstimateMinutes":0, "image":"", "mapUrl":"", "sourceUrl":"", "sourceTitle":""}],
  "menu":[{"id":"", "name":"", "nameZh":"", "category":"", "categoryZh":"", "price":0, "currency":"CNY or USD etc.", "description":"", "descriptionZh":"", "image":"", "imageSourceUrl":"", "calories":"", "popular":false, "tags":[], "tagsZh":[], "sourceUrl":"", "sourceTitle":""}]
}`;

      try {
        const evidence = await researchRestaurantWithGemini({
          name: cleanName,
          city,
          cuisineType,
          menuInput,
          language,
          latitude: Number.isFinite(Number(userLatitude)) ? Number(userLatitude) : undefined,
          longitude: Number.isFinite(Number(userLongitude)) ? Number(userLongitude) : undefined,
        });
        fallbackEvidenceSources = evidence.sources.map((source) => ({
          title: source.title,
          url: source.url,
          kind: source.kind,
          placeId: "placeId" in source ? source.placeId : undefined,
        }));
        fallbackResearchProvider = evidence.searchProvider === "tavily" ? "gemini-tavily-maps" : "gemini-google";
        const sourceList = evidence.sources
          .map((source, index) => `[${index + 1}] ${source.title} — ${source.url} (${source.kind})`)
          .join("\n");
        const synthesisPrompt = `${synthesisPromptBase}

STRICT EVIDENCE POLICY:
- Use only the evidence below. Do not rely on model memory.
- Every social, store and menu item must set sourceUrl to an exact supporting URL from SOURCE URLS.
- Every store sourceUrl MUST be one of the SOURCE URLS marked (maps). Never use a web-search address as a nearest-store result. When device coordinates are available, return only branches chosen relative to those coordinates, ordered nearest-first; do not return a distant headquarters or a branch merely because it matches the typed city.
- Official websites and official social accounts are global brand-level evidence and MUST NOT be filtered out merely because they are outside ${city || "the requested market"}.
- A menu price is valid only when the evidence clearly supports both the price and its currency for the requested city/market. Otherwise set price to 0 and currency to an empty string. Never reuse another country's menu price for ${city}.
- Aim for at least 8 menu items when the evidence supports them. If a menu page, order page, menu photo description or Maps evidence clearly enumerates multiple dish/drink names, create a separate menu item for every clearly named item up to 12. A missing price does not disqualify an otherwise source-backed item; use price 0 and an empty currency.
- A menu image must be a direct image URL explicitly present in evidence. For each menu item, prefer an individual product photo whose evidence description explicitly names that dish or drink; otherwise use a menu image only when its description clearly matches that item. Set imageSourceUrl to its containing source page when supplied; for a clearly matching Tavily image candidate without a page URL, imageSourceUrl may equal the image URL itself. Otherwise set image to an empty string.
- logo and heroBanner follow the same rule and require logoSourceUrl / heroBannerSourceUrl. Otherwise leave them empty.
- If merchant identity is ambiguous, return only facts for the location-matched merchant and add a warning.
- Never manufacture ratings, review counts, queue counts, coordinates, prices, hours, phone numbers or social follower counts.

GOOGLE MAPS EVIDENCE:
${evidence.mapsText}

WEB SEARCH EVIDENCE (${evidence.searchProvider === "tavily" ? "Tavily" : "Google Search"}):
${evidence.searchText}

SOURCE URLS:
${sourceList || "No source URL was returned."}`;
        const response = await callGemini(synthesisPrompt, {
          json: true,
          temperature: 0,
          maxOutputTokens: 8192,
        });

        if (response.text) {
          const generatedBrand = parseModelJson(response.text);
          if (generatedBrand && generatedBrand.name && generatedBrand.menu) {
            const sources = evidence.sources.map((source) => ({
              title: source.title,
              url: source.url,
              kind: source.kind,
              placeId: "placeId" in source ? source.placeId : undefined,
            }));
            await normalizeGroundedBrand(
              generatedBrand,
              cleanName,
              sources,
              evidence.searchProvider === "tavily" ? "gemini-tavily-maps" : "gemini-google",
            );

            if (getTavilyConfig().apiKey && generatedBrand.stores.length > 0) {
              try {
                const reviewSupplement = await researchReviewPlatformsForBranches({
                  name: generatedBrand.name || cleanName,
                  branches: generatedBrand.stores,
                });
                if (reviewSupplement.sources.length > 0) {
                  const expandedSources = [...sources, ...reviewSupplement.sources]
                    .filter((source, index, all) => all.findIndex((item) => item.url === source.url) === index);
                  await normalizeGroundedBrand(
                    generatedBrand,
                    cleanName,
                    expandedSources,
                    "gemini-tavily-maps",
                  );
                }
              } catch (reviewError) {
                console.warn("Supplemental review-platform research failed:", reviewError);
              }
            }

            annotateStoreDistancesAndScope(
              generatedBrand,
              userLatitude,
              userLongitude,
              evidence.mapsScope,
            );

            generatedBrand.id = brandId;
            if (Number.isFinite(Number(userLatitude)) && Number.isFinite(Number(userLongitude))) {
              generatedBrand.researchLocation = {
                latitude: Number(userLatitude),
                longitude: Number(userLongitude),
              };
            }
            // Store in memory without leaving a stale duplicate of a refreshed preset.
            customGeneratedBrands = [
              generatedBrand,
              ...customGeneratedBrands.filter((brand) => brand.id !== brandId),
            ];
            return res.json({
              success: true,
              brand: generatedBrand,
              workflowSteps: workflowLogs,
              message: `Successfully generated ${cleanName} digital hub via AI Workflow!`
            });
          }
        }
      } catch (err) {
        console.error("Gemini restaurant generation error, falling back to safe template mode:", err);
      }
    }

    // High-Fidelity Knowledge Base Fallback for Popular Brands & Generic Synthesis
    const lowerName = cleanName.toLowerCase();
    let fallbackBrand: any = null;

    if (lowerName.includes("眷湘") || lowerName.includes("juanxiang") || lowerName.includes("juan xiang")) {
      fallbackBrand = {
        id: "juan-xiang",
        name: "Juan Xiang Hunan Bistro",
        nameZh: "眷湘 · 地道湖南菜 (Juan Xiang)",
        tagline: "Sizzling wok aroma, authentic Hunan spice, and genuine lake-and-mountain hospitality.",
        taglineZh: "热辣生香，地道湖湘风味 · 现炒锅气，传承经典地道湘菜烹饪技艺。",
        logo: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300&auto=format&fit=crop&q=80",
        heroBanner: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80",
        primaryColor: "#C41212",
        accentColor: "#FEE2E2",
        bgColor: "#FFFBF7",
        cardBg: "#FFFFFF",
        verifiedBadge: true,
        officialSiteUrl: "https://www.juanxiang.com",
        hotline: "400-820-7799",
        hotlineLabel: "400-820-7799",
        hotlineLabelZh: "400-820-7799 (眷湘官方服务热线)",
        cateringEmail: "contact@juanxiang.com",
        cuisineType: "Authentic Hunan Spicy Cuisine & Sizzling Wok Dishes",
        cuisineTypeZh: "湖湘风味 · 经典现炒与招牌剁椒鱼头",
        promptKeywords: {
          zh: ["🌶️ 招牌特色辣椒炒肉油亮香浓超下饭", "🐟 秘制剁椒大鱼头鲜辣入味配手工面绝绝子", "🥩 鲜辣小炒黄牛肉嫩滑多汁镬气十足", "✨ 金牌老长沙臭豆腐外酥里嫩爆汁浓郁", "🥘 养生有机大碗花菜清爽脆口解辣必备", "🍚 现煮五常大米饭喷香粒粒分明无限续"],
          en: ["🌶️ Signature Hunan Chili Fried Pork with Sizzling Wok Aroma", "🐟 Steamed Fish Head with Fermented Chili & Handmade Noodles", "🥩 Tender Stir-Fried Beef with Wild Mountain Peppers", "✨ Crispy Changsha Stinky Tofu with Spiced Broth", "🥘 Farm Organic Cauliflower Crisp & Refreshing", "🍚 Steamed Fragrant Rice Unlimited Refill"]
        },
        socials: [
          { id: "xiaohongshu", name: "Xiaohongshu (RED)", nameZh: "小红书 官方号", handle: "@眷湘湖南菜", url: "https://www.xiaohongshu.com", icon: "BookOpen", followers: "860K Followers", badge: "Hunan Cuisine Star", color: "#FF2442", bgColor: "bg-rose-50 text-rose-700 border-rose-200" },
          { id: "instagram", name: "Instagram", nameZh: "Instagram 官方", handle: "@juanxiang.dining", url: "https://www.instagram.com", icon: "Instagram", followers: "120K Followers", badge: "Authentic Spice", color: "#E4405F", bgColor: "bg-pink-50 text-pink-700 border-pink-200" },
          { id: "weibo", name: "Weibo", nameZh: "新浪微博 官方号", handle: "@眷湘餐饮", url: "https://weibo.com", icon: "Share2", followers: "1.4M Followers", badge: "Official Foodie", color: "#E6162D", bgColor: "bg-red-50 text-red-700 border-red-200" },
          { id: "tiktok", name: "TikTok / 抖音", nameZh: "官方抖音号", handle: "@眷湘地道湖南菜", url: "https://www.tiktok.com", icon: "Video", followers: "1.8M Followers", badge: "Sizzling Wok", color: "#000000", bgColor: "bg-neutral-100 text-neutral-900 border-neutral-300" },
          { id: "facebook", name: "Facebook", nameZh: "Facebook 官方", handle: "@JuanXiangHunan", url: "https://www.facebook.com", icon: "Facebook", followers: "95K Likes", badge: "Community", color: "#1877F2", bgColor: "bg-blue-50 text-blue-700 border-blue-200" },
          { id: "youtube", name: "YouTube", nameZh: "YouTube 官方频道", handle: "@眷湘JuanXiang", url: "https://www.youtube.com", icon: "Play", followers: "65K Subscribers", badge: "Chef Stories", color: "#FF0000", bgColor: "bg-red-50 text-red-700 border-red-200" }
        ],
        stores: [
          {
            id: "juanxiang-store-1",
            name: "Juan Xiang Flagship · Grand Gateway Mall",
            nameZh: "眷湘 · 核心旗舰店 (港汇恒隆广场店)",
            type: "Flagship Dining & Private VIP Salons",
            address: "1 Hongqiao Road, Grand Gateway 66 Floor 5",
            addressZh: "徐家汇虹桥路1号港汇恒隆广场5楼 (景观露台包厢 / 商务雅座)",
            distance: "0.2 km",
            latitude: 31.1963,
            longitude: 121.4375,
            phone: "+86 400-820-7799",
            hours: "11:00 AM - 09:30 PM Daily",
            hoursZh: "每日 11:00 - 14:00, 17:00 - 21:30",
            isOpen: true,
            features: ["Open Sizzling Kitchen", "VIP Private Dining Rooms", "Free Rice & Tea Bar"],
            featuresZh: ["明档现炒镬气厨房", "商务独立雅致包间", "自助茶水与五常米饭"],
            rating: 4.9,
            reviewCount: 8940,
            queueCount: 6,
            prepEstimateMinutes: 12,
            image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80"
          },
          {
            id: "juanxiang-store-2",
            name: "Juan Xiang Taikoo Li Qiantan",
            nameZh: "眷湘 · 前滩太古里店 (湖湘庭院风)",
            type: "Garden Courtyard Dining",
            address: "500 Dongyu Road, Taikoo Li Qiantan Wood Zone L3",
            addressZh: "东育路500号前滩太古里木区L3层 (庭院露天位)",
            distance: "1.2 km",
            latitude: 31.1550,
            longitude: 121.4780,
            phone: "+86 400-820-7799",
            hours: "11:00 AM - 09:30 PM Daily",
            hoursZh: "每日 11:00 - 21:30",
            isOpen: true,
            features: ["Scenic Outdoor Seating", "Live Steamed Stations"],
            featuresZh: ["景观露天庭院座", "现蒸小钵菜明档"],
            rating: 4.8,
            reviewCount: 6120,
            queueCount: 3,
            prepEstimateMinutes: 10,
            image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80"
          }
        ],
        menu: [
          {
            id: "jx-item-1",
            name: "Signature Hunan Chili Fried Pork (招牌特色辣椒炒肉)",
            nameZh: "招牌特色辣椒炒肉 (进店必点下饭王)",
            category: "Chef Signatures",
            categoryZh: "主厨招牌现炒",
            price: 16.50,
            description: "Prime pork belly slices wok-tossed over blazing heat with local green spiral peppers, garlic, and fermented black beans. Overflowing with savory wok hei aroma.",
            descriptionZh: "严选黑土猪前腿肉，搭配湖南特产螺丝椒大火猛火急炒，肉片鲜嫩油润，青椒脆辣过瘾，汤汁拌饭能吃三碗！",
            image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop&q=80",
            calories: "460 kcal",
            popular: true,
            tags: ["No.1 Best Seller", "Wok Hei", "Must Order"],
            tagsZh: ["全店销量TOP1", "镬气十足", "米饭杀手"],
            options: {
              spiceLevels: ["Hunan Medium Spicy 经典湖南中辣", "Mild Spicy 微辣", "Extra Wild Spicy 劲爆特辣"],
              portions: [{ name: "Standard 标准份", extraPrice: 0 }, { name: "Deluxe 豪华加大份", extraPrice: 4.00 }]
            }
          },
          {
            id: "jx-item-2",
            name: "Steamed Big Fish Head with Duo Chopped Chilies (秘制双椒蒸千岛湖大鱼头)",
            nameZh: "秘制双椒蒸千岛湖大鱼头 (配手工鲜面)",
            category: "Chef Signatures",
            categoryZh: "主厨招牌现炒",
            price: 24.80,
            description: "Fresh lake carp fish head steamed with house-fermented red and green chopped chilies, scallion oil, and rich umami broth. Served with springy handmade noodles.",
            descriptionZh: "精选千岛湖生态大鱼头，铺满古法陶坛腌制双色剁椒现蒸，鱼肉滑嫩鲜甜，胶质满满，浸润鲜辣鱼汤的手工面更是灵魂！",
            image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80",
            calories: "520 kcal",
            popular: true,
            tags: ["Signature Dish", "Fresh Fish Head", "With Noodles"],
            tagsZh: ["非遗工艺", "千岛湖鲜鱼", "附赠手工面"],
            options: {
              spiceLevels: ["Signature Duo Chili 经典双椒", "Extra Spicy Red Chili 纯红剁椒特辣"]
            }
          },
          {
            id: "jx-item-3",
            name: "Spicy Stir-Fried Yellow Beef (鲜辣小炒黄牛肉)",
            nameZh: "鲜辣小炒黄牛肉 (肉质细嫩爽口)",
            category: "Chef Signatures",
            categoryZh: "主厨招牌现炒",
            price: 18.20,
            description: "Tender slivers of premium grass-fed beef quickly flash-seared with wild pickled mountain peppers, cilantro, and garlic cloves.",
            descriptionZh: "严选新鲜嫩黄牛肉现切现炒，配以高山野山椒与鲜香菜，30秒猛火快爆，牛肉鲜嫩爆汁，辛辣爽口。",
            image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
            calories: "380 kcal",
            popular: true,
            tags: ["Tender Beef", "High Protein"],
            tagsZh: ["现切嫩牛肉", "野山椒风味"]
          },
          {
            id: "jx-item-4",
            name: "Golden Changsha Stinky Tofu (金牌老长沙臭豆腐)",
            nameZh: "金牌老长沙灌汁臭豆腐",
            category: "Hunan Street Snacks",
            categoryZh: "经典湖湘小吃",
            price: 7.50,
            description: "Crispy dark fermented artisan tofu fried to perfection, punctured and flooded with spicy garlic broth, chili paste, and pickled radish relish.",
            descriptionZh: "经典长沙街头风味！外皮炸得酥脆焦香，内里细嫩如布丁，灌入秘制浓郁蒜蓉辣汁与酸豆角萝卜干，闻着臭吃着香。",
            image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80",
            calories: "220 kcal",
            popular: true,
            tags: ["Changsha Icon", "Crispy & Juicy"],
            tagsZh: ["老长沙经典", "外酥里嫩灌汁"]
          },
          {
            id: "jx-item-5",
            name: "Wok-Tossed Organic Farm Cauliflower (大碗有机花菜)",
            nameZh: "大碗有机有机花菜 (干锅炝炒)",
            category: "Vegetables",
            categoryZh: "时令有机蔬食",
            price: 9.80,
            description: "Crisp organic cauliflower stir-fried in a hot wok with cured pork bits, dried chili, and scallions.",
            descriptionZh: "精选高原有机散花菜，搭配土猪腊肉片干锅炝炒，脆嫩爽口，焦香扑鼻，荤素搭配极佳。",
            image: "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=600&auto=format&fit=crop&q=80",
            calories: "180 kcal",
            popular: false,
            tags: ["Organic", "Crisp Texture"],
            tagsZh: ["高原有机", "爽脆鲜香"]
          },
          {
            id: "jx-item-6",
            name: "Iced Handcrafted Lemon Winter Melon Tea (手工冰镇冬瓜柠檬茶)",
            nameZh: "手工冰镇冬瓜柠檬茶 (解辣神器)",
            category: "Beverages",
            categoryZh: "清爽饮品",
            price: 4.80,
            description: "Traditional slow-brewed brown sugar winter melon tea blended with freshly smashed whole lemons and ice. Perfect spicy food antidote.",
            descriptionZh: "传统黑糖慢熬冬瓜茸，搭配新鲜香水柠檬手打爆汁，清甜回甘，冰爽解辣首选！",
            image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80",
            calories: "110 kcal",
            popular: true,
            tags: ["Spicy Relief", "Refreshing"],
            tagsZh: ["解辣神器", "现打柠檬"]
          }
        ]
      };
    } else if (lowerName.includes("喜茶") || lowerName.includes("heytea")) {
      fallbackBrand = {
        id: "heytea",
        name: "HEYTEA",
        nameZh: "喜茶 (HEYTEA)",
        tagline: "Inspiring tea, crafted with real milk, real tea, real fruit, and real sugar.",
        taglineZh: "真品质，不昂贵 · 坚持使用真奶、真茶、真果、真糖，激发喜悦与灵感。",
        logo: "https://images.unsplash.com/photo-1558857563-b37cfb428d02?w=300&auto=format&fit=crop&q=80",
        heroBanner: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=1200&auto=format&fit=crop&q=80",
        primaryColor: "#1A1A1A",
        accentColor: "#F5EBE6",
        bgColor: "#FDFBF9",
        cardBg: "#FFFFFF",
        verifiedBadge: true,
        officialSiteUrl: "https://www.heytea.com",
        hotline: "400-930-3300",
        hotlineLabel: "400-930-3300",
        hotlineLabelZh: "400-930-3300 (喜茶官方客服热线)",
        cateringEmail: "service@heytea.com",
        cuisineType: "New-Style Chinese Tea & Cheezo Fruit Tea",
        cuisineTypeZh: "新茶饮 · 原创芝士茶与鲜果茶",
        promptKeywords: {
          zh: ["🍇 多肉葡萄手剥果肉饱满爆汁", "🧀 芝芝莓莓咸甜芝士奶盖天花板", "🧋 烤黑糖波波真乳茶奶香浓郁Q弹", "🖤 酷黑莓桑酸甜清爽颜值爆表", "✨ 坚持真奶真茶真果不含植脂末", "📱 手机喜茶GO点单自提极速出餐"],
          en: ["🍇 Very Grape Cheezo with Hand-Peeled Grapes", "🧀 Strawberry Cheezo with Signature Cheese Foam", "🧋 Roasted Brown Sugar Bobo Fresh Milk Tea", "🖤 Cool Black Mulberry Refreshing & Crisp", "✨ 100% Real Milk, Real Tea & Fresh Fruit", "📱 Super Fast Mobile Pickup & Zero Wait"]
        },
        socials: [
          { id: "xiaohongshu", name: "Xiaohongshu (RED)", nameZh: "小红书 官方号", handle: "@喜茶 HEYTEA", url: "https://www.xiaohongshu.com", icon: "BookOpen", followers: "2.8M Followers", badge: "Official Verified", color: "#FF2442", bgColor: "bg-rose-50 text-rose-700 border-rose-200" },
          { id: "instagram", name: "Instagram (Global)", nameZh: "Instagram 官方", handle: "@heytea.global", url: "https://www.instagram.com", icon: "Instagram", followers: "380K Followers", badge: "Global Official", color: "#E4405F", bgColor: "bg-pink-50 text-pink-700 border-pink-200" },
          { id: "weibo", name: "Weibo", nameZh: "新浪微博 官方号", handle: "@喜茶", url: "https://weibo.com", icon: "Share2", followers: "4.5M Followers", badge: "New Drops & Collabs", color: "#E6162D", bgColor: "bg-red-50 text-red-700 border-red-200" },
          { id: "tiktok", name: "TikTok", nameZh: "TikTok 官方账号", handle: "@heytea_official", url: "https://www.tiktok.com", icon: "Video", followers: "620K Followers", badge: "Viral Sips", color: "#000000", bgColor: "bg-neutral-100 text-neutral-900 border-neutral-300" },
          { id: "facebook", name: "Facebook", nameZh: "Facebook 官方页面", handle: "@HEYTEA Official", url: "https://www.facebook.com", icon: "Facebook", followers: "450K Likes", badge: "Community Hub", color: "#1877F2", bgColor: "bg-blue-50 text-blue-700 border-blue-200" },
          { id: "youtube", name: "YouTube", nameZh: "YouTube 官方频道", handle: "@HEYTEA喜茶", url: "https://www.youtube.com", icon: "Play", followers: "120K Subscribers", badge: "Inspiration Stories", color: "#FF0000", bgColor: "bg-red-50 text-red-700 border-red-200" }
        ],
        stores: [
          {
            id: "heytea-store-1",
            name: "HEYTEA LAB Flagship · Grand Gateway",
            nameZh: "喜茶 LAB 概念旗舰店 (港汇恒隆广场店)",
            type: "HEYTEA LAB & Tea Geeks Bar",
            address: "1 Hongqiao Road, Grand Gateway 66 Floor 1",
            addressZh: "徐家汇虹桥路1号港汇恒隆广场1楼中庭 (制茶实验室/甜品极客区)",
            distance: "0.2 km",
            latitude: 31.1963,
            longitude: 121.4375,
            phone: "+86 400-930-3300",
            hours: "10:00 AM - 10:00 PM Daily",
            hoursZh: "每日 10:00 - 22:00",
            isOpen: true,
            features: ["Tea Geeks Specialty Bar", "Fresh Bakery & Gelato", "Express Mobile Pickup Locker", "Design Seating Gallery"],
            featuresZh: ["茶极客特调吧台", "现烤烘焙与茶香冰淇淋", "喜茶GO智能自提柜", "灵感设计休闲区"],
            rating: 4.9,
            reviewCount: 15400,
            queueCount: 4,
            prepEstimateMinutes: 5,
            image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80"
          },
          {
            id: "heytea-store-2",
            name: "HEYTEA Taikoo Li Qiantan Inspiration Store",
            nameZh: "喜茶 · 前滩太古里灵感店 (木结构艺术店)",
            type: "Inspiration Design Store",
            address: "500 Dongyu Road, Taikoo Li Qiantan Stone Zone L1",
            addressZh: "东育路500号前滩太古里石区L1层 (露天景观步道旁)",
            distance: "0.8 km",
            latitude: 31.1550,
            longitude: 121.4780,
            phone: "+86 400-930-3300",
            hours: "10:00 AM - 10:00 PM Daily",
            hoursZh: "每日 10:00 - 22:00",
            isOpen: true,
            features: ["Outdoor Garden Seating", "Pet Friendly Area", "HEYTEA GO Express"],
            featuresZh: ["户外绿植景观座", "宠物友好休息区", "喜茶GO免排队自提"],
            rating: 4.8,
            reviewCount: 9800,
            queueCount: 2,
            prepEstimateMinutes: 3,
            image: "https://images.unsplash.com/photo-1558857563-b37cfb428d02?w=600&auto=format&fit=crop&q=80"
          }
        ],
        menu: [
          {
            id: "ht-item-1",
            name: "Very Grape Cheezo (多肉葡萄)",
            nameZh: "多肉葡萄 (原创经典销冠)",
            category: "Real Fruit Tea",
            categoryZh: "时令鲜果茶",
            price: 4.25,
            description: "Signature hand-peeled fresh Kyoho grapes blended with aromatic green tea slush, topped with rich handcrafted cheese foam.",
            descriptionZh: "喜茶原创招牌！精选手剥饱满巨峰葡萄果肉，搭配清爽绿妍茶汤冰沙与现打香浓芝士奶盖，果肉爽脆多汁。",
            image: "https://images.unsplash.com/photo-1558857563-b37cfb428d02?w=600&auto=format&fit=crop&q=80",
            calories: "260 kcal",
            popular: true,
            tags: ["Hand-Peeled Grapes", "No.1 Best Seller", "Cheezo Foam"],
            tagsZh: ["一颗颗手剥葡萄", "全网爆款榜首", "经典浓郁芝士"],
            options: {
              sizes: [
                { name: "Standard 500ml 标准杯", extraPrice: 0 },
                { name: "Large 650ml 大杯", extraPrice: 0.80 }
              ],
              sweetness: ["Standard 正常糖", "Less Sweet 少甜 (7分)", "Half Sweet 半糖 (5分)", "Zero Calorie Sugar 0卡糖"],
              iceLevels: ["Standard Ice 正常冰", "Less Ice 少冰", "No Ice 去冰", "Warm 温饮"],
              toppings: [
                { name: "Cheezo Foam", nameZh: "首创经典浓郁芝士", price: 0.70 },
                { name: "Boba Pearls", nameZh: "Q弹黑糖波波", price: 0.50 }
              ]
            }
          },
          {
            id: "ht-item-2",
            name: "Strawberry Cheezo (芝芝莓莓)",
            nameZh: "芝芝莓莓",
            category: "Real Fruit Tea",
            categoryZh: "时令鲜果茶",
            price: 4.50,
            description: "Fresh succulent strawberries crushed and blended with green tea ice slush, finished with silky melted cheese cream.",
            descriptionZh: "精选当季新鲜红颜草莓现切压汁，融汇定制绿妍茶底冰沙，盖上细腻醇厚芝士，酸甜香醇。",
            image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80",
            calories: "280 kcal",
            popular: true,
            tags: ["Fresh Strawberry", "Iconic Cheezo"],
            tagsZh: ["新鲜红颜草莓", "芝士厚乳"],
            options: {
              sizes: [{ name: "Standard 500ml", extraPrice: 0 }],
              sweetness: ["Standard 正常糖", "Less Sweet 少甜", "Zero Calorie Sugar 0卡糖"],
              iceLevels: ["Slush 冰沙", "Less Ice 少冰"]
            }
          },
          {
            id: "ht-item-3",
            name: "Roasted Brown Sugar Bobo Milk Tea (烤黑糖波波真乳茶)",
            nameZh: "烤黑糖波波真乳茶 (年度销量超千万杯)",
            category: "Real Milk Tea",
            categoryZh: "真原叶鲜奶茶",
            price: 3.80,
            description: "Slow-cooked chewy brown sugar boba combined with 100% pure fresh farm milk and aromatic roasted tea base.",
            descriptionZh: "每日现熬慢煮黑糖波波，加入100%优质纯真牛乳与慢火烘焙茶底，焦香醇厚，软糯弹牙，0反式脂肪酸。",
            image: "https://images.unsplash.com/photo-1558857563-b37cfb428d02?w=600&auto=format&fit=crop&q=80",
            calories: "310 kcal",
            popular: true,
            tags: ["100% Real Milk", "Chewy Boba", "No Trans Fat"],
            tagsZh: ["100%真牛乳", "现熬黑糖波波", "0植脂末0奶精"],
            options: {
              sizes: [{ name: "Standard 500ml", extraPrice: 0 }, { name: "Maxi 650ml", extraPrice: 0.70 }],
              sweetness: ["Recommended 推荐甜度", "Less Sweet 微甜", "No Sugar 不另加糖"],
              iceLevels: ["Regular Ice 正常冰", "Less Ice 少冰", "Hot 暖饮"]
            }
          },
          {
            id: "ht-item-4",
            name: "Cool Black Mulberry (酷黑莓桑)",
            nameZh: "酷黑莓桑 (藤原浩联名黑黑系列)",
            category: "Real Fruit Tea",
            categoryZh: "时令鲜果茶",
            price: 4.10,
            description: "Handcrafted mulberry and dark grape slush with green tea base. Rich in anthocyanins with a refreshing sweet-tart finish.",
            descriptionZh: "严选高品质手采鲜桑葚与黑提果肉，满满花青素，搭配绿妍茶底制成冰爽冰沙，酸甜清洌。",
            image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
            calories: "180 kcal",
            popular: true,
            tags: ["Rich in Anthocyanin", "Viral Dark Series"],
            tagsZh: ["满满花青素", "清爽解腻", "联名爆款"],
            options: {
              sweetness: ["Standard 正常糖", "Less Sweet 少甜", "0 Calorie Sugar 0卡糖"],
              iceLevels: ["Slush 冰沙", "Less Ice 少冰"]
            }
          },
          {
            id: "ht-item-5",
            name: "Supreme Mango Grapefruit Sago (多肉芒芒甘露)",
            nameZh: "多肉芒芒甘露",
            category: "Real Fruit Tea",
            categoryZh: "时令鲜果茶",
            price: 4.20,
            description: "Golden mango puree, ruby red grapefruit pulps, silky sago, and coconut milk blended with Jasmine green tea.",
            descriptionZh: "精选大台农芒鲜切果肉，加入手剥红柚粒、Q弹脆波波与浓醇生椰乳，层次极丰满。",
            image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
            calories: "270 kcal",
            popular: false,
            tags: ["Fresh Mango", "Grapefruit Sago"],
            tagsZh: ["现切芒果肉", "手剥红柚果粒"]
          }
        ]
      };
    } else if (lowerName.includes("瑞幸") || lowerName.includes("luckin")) {
      fallbackBrand = {
        id: "luckin-coffee",
        name: "Luckin Coffee",
        nameZh: "瑞幸咖啡 Luckin Coffee",
        tagline: "Professional coffee for everyday moments.",
        taglineZh: "幸运在握，专业咖啡新鲜现磨 · 每一杯都充满活力与灵感。",
        logo: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&auto=format&fit=crop&q=80",
        heroBanner: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&auto=format&fit=crop&q=80",
        primaryColor: "#002266",
        accentColor: "#E8F0FE",
        bgColor: "#F4F7FB",
        cardBg: "#FFFFFF",
        verifiedBadge: true,
        officialSiteUrl: "https://www.luckincoffee.com",
        hotline: "400-010-0100",
        hotlineLabel: "400-010-0100",
        hotlineLabelZh: "400-010-0100 (瑞幸客服热线)",
        cateringEmail: "service@luckincoffee.com",
        cuisineType: "Freshly Ground Specialty Coffee & Tea",
        cuisineTypeZh: "现磨现萃咖啡与轻食特饮",
        promptKeywords: {
          zh: ["🥥 生椰拿铁浓郁丝滑神作", "⚡ 手机点单3分钟极速自提", "☕️ 酱香拿铁独特微醺回味", "🍊 橙C美式清爽醒脑解腻", "✨ 门店干净出餐极速", "🌟 高性价比打工人咖啡首选"],
          en: ["🥥 Creamy Raw Coconut Latte", "⚡ Super Fast 3-Min Mobile Pickup", "☕️ Rich Velvet Latte Aroma", "🍊 Refreshing Orange C Americano", "✨ Clean Store & Fast Baristas", "🌟 Best Value Daily Coffee"]
        },
        socials: [
          { id: "xiaohongshu", name: "Xiaohongshu (RED)", nameZh: "小红书 官方号", handle: "@luckincoffee", url: "https://www.xiaohongshu.com", icon: "BookOpen", followers: "1.2M", badge: "Coffee King", color: "#FF2442", bgColor: "bg-rose-50 text-rose-700 border-rose-200" },
          { id: "google", name: "Google Maps", nameZh: "Google 认证", handle: "@luckincoffee", url: "https://www.google.com/maps", icon: "Globe", followers: "4.9 ★", badge: "Top Pick", color: "#4285F4", bgColor: "bg-blue-50 text-blue-700 border-blue-200" },
          { id: "instagram", name: "Instagram", nameZh: "Instagram", handle: "@luckincoffee", url: "https://www.instagram.com", icon: "Instagram", followers: "450K", badge: "Official", color: "#E4405F", bgColor: "bg-pink-50 text-pink-700 border-pink-200" }
        ],
        stores: [
          {
            id: "luckin-store-1",
            name: "Luckin Coffee Grand Gateway Flagship",
            nameZh: "瑞幸咖啡 · 港汇恒隆广场旗舰店",
            type: "Express Pickup & Seating Bar",
            address: "1 Hongqiao Road, Xujiahui B1",
            addressZh: "徐家汇虹桥路1号港汇恒隆广场B1层 (自提专区)",
            distance: "0.2 km",
            latitude: 31.1963,
            longitude: 121.4375,
            phone: "400-010-0100",
            hours: "07:30 AM - 10:00 PM Daily",
            hoursZh: "每日 07:30 - 22:00",
            isOpen: true,
            features: ["Express Self-Pickup", "Mobile Order", "Comfort Seating"],
            featuresZh: ["极速自提", "手机点单", "休闲卡座"],
            rating: 4.9,
            reviewCount: 5200,
            queueCount: 2,
            prepEstimateMinutes: 3,
            image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80"
          },
          {
            id: "luckin-store-2",
            name: "Luckin Coffee Lujiazui IFC Express",
            nameZh: "瑞幸咖啡 · 陆家嘴国金中心店",
            type: "Fast Pickup Station",
            address: "8 Century Avenue, IFC Mall LG2",
            addressZh: "世纪大道8号国金中心LG2层 (地铁直达取餐口)",
            distance: "0.9 km",
            latitude: 31.2383,
            longitude: 121.5015,
            phone: "400-010-0100",
            hours: "07:00 AM - 09:30 PM",
            hoursZh: "每日 07:00 - 21:30",
            isOpen: true,
            features: ["Fast Express Window", "Breakfast Combos"],
            featuresZh: ["极速出餐窗口", "超值早餐套餐"],
            rating: 4.8,
            reviewCount: 3800,
            queueCount: 1,
            prepEstimateMinutes: 2,
            image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80"
          }
        ],
        menu: [
          {
            id: "luckin-1",
            name: "Raw Coconut Latte",
            nameZh: "生椰拿铁 (经典销冠)",
            category: "Best Sellers",
            categoryZh: "销冠榜首",
            price: 18.00,
            description: "Cold-pressed raw coconut milk meets aromatic espresso. Silky, rich, and naturally sweet.",
            descriptionZh: "精选冷榨生椰乳，天然甘甜搭配IIAC金奖浓缩咖啡，清甜浓郁一口沦陷。",
            image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80",
            calories: "190 kcal",
            popular: true,
            tags: ["No.1 Best Seller", "Iced"],
            tagsZh: ["全网爆款", "冷榨生椰"],
            options: {
              sizes: [{ name: "Large 16oz 大杯", extraPrice: 0 }],
              iceLevels: ["Less Ice 少冰", "Standard 正常冰", "No Ice 去冰"],
              sweetness: ["Less Sugar 少少糖", "Half Sugar 半糖", "No Sugar 不另加糖"]
            }
          },
          {
            id: "luckin-2",
            name: "Velvet Latte",
            nameZh: "丝绒拿铁",
            category: "Lattes",
            categoryZh: "大师拿铁",
            price: 19.00,
            description: "Ultra-filtered Hokkaido-style milk blend with velvety smooth texture.",
            descriptionZh: "微米级特调丝绒风味厚奶，丝滑度提升20%，浓郁醇厚奶香久久回甘。",
            image: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&auto=format&fit=crop&q=80",
            calories: "220 kcal",
            popular: true,
            tags: ["Ultra Smooth", "Velvety"],
            tagsZh: ["丝滑醇厚", "浓郁乳香"],
            options: {
              temperature: ["Iced 冰", "Hot 热"],
              sweetness: ["Standard 正常糖", "Half Sugar 半糖", "No Sugar 不另加糖"]
            }
          },
          {
            id: "luckin-3",
            name: "Orange C Americano",
            nameZh: "橙C美式",
            category: "Fruit Coffee",
            categoryZh: "鲜果咖啡",
            price: 16.00,
            description: "Freshly squeezed Valencia sweet orange juice combined with bold iced Americano.",
            descriptionZh: "浓郁鲜橙汁遇上醇香黑咖啡，酸甜清爽，提神醒脑无负担。",
            image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
            calories: "110 kcal",
            popular: true,
            tags: ["Refreshing", "High Vit C"],
            tagsZh: ["维C满满", "清爽果咖"],
            options: {
              iceLevels: ["Standard 正常冰", "Less Ice 少冰"]
            }
          },
          {
            id: "luckin-4",
            name: "Maotai Flavor Latte",
            nameZh: "酱香拿铁 (联名经典)",
            category: "Specials",
            categoryZh: "特别限定",
            price: 21.00,
            description: "Infused with legendary Jiangxiang white liquor flavor厚乳. A viral taste sensation.",
            descriptionZh: "白酒风味厚奶与金奖浓缩咖啡的灵感碰撞，酱香浓郁，微醺风味回味悠长。",
            image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop&q=80",
            calories: "240 kcal",
            popular: false,
            tags: ["Legendary", "Iconic"],
            tagsZh: ["经典传奇", "浓郁酱香"]
          }
        ]
      };
    } else if (lowerName.includes("萨莉亚") || lowerName.includes("saizeriya")) {
      fallbackBrand = {
        id: "saizeriya",
        name: "Saizeriya",
        nameZh: "萨莉亚 意式餐厅 Saizeriya",
        tagline: "Everyday Italian dining made affordable, delicious, and joyful.",
        taglineZh: "平价美味的意式家庭厨房 · 丰富多元的意式美食与欢乐聚餐。",
        logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80",
        heroBanner: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80",
        primaryColor: "#00873E",
        accentColor: "#EBF7EE",
        bgColor: "#F7FAF8",
        cardBg: "#FFFFFF",
        verifiedBadge: true,
        officialSiteUrl: "https://www.saizeriya.co.jp",
        hotline: "400-600-7272",
        hotlineLabel: "400-600-7272",
        hotlineLabelZh: "400-600-7272 (萨莉亚服务热线)",
        cateringEmail: "contact@saizeriya.com",
        cuisineType: "Affordable Italian Bistro & Pasta",
        cuisineTypeZh: "意式平价家庭休闲西餐",
        promptKeywords: {
          zh: ["🐌 蒜香烤蜗牛鲜香脆嫩封神", "🧀 温泉蛋肉酱多利亚饭拉丝浓郁", "🍝 墨鱼汁意大利面鲜美地道", "🥗 烤菠菜与畅饮吧性价比无敌", "🍰 意式提拉米苏入口即化", "🌟 随便点都不心疼的平价西餐之王"],
          en: ["🐌 Sizzling Garlic Butter Escargot", "🧀 Cheesy Soft-Egg Meat Doria", "🍝 Squid Ink Seafood Pasta", "🥗 Unlimited Drink Bar & Garlic Focaccia", "🍰 Classic Creamy Tiramisu", "🌟 Unbeatable Italian Value"]
        },
        socials: [
          { id: "xiaohongshu", name: "Xiaohongshu (RED)", nameZh: "小红书", handle: "@saizeriya", url: "https://www.xiaohongshu.com", icon: "BookOpen", followers: "890K", badge: "Best Value", color: "#FF2442", bgColor: "bg-rose-50 text-rose-700 border-rose-200" },
          { id: "google", name: "Google Maps", nameZh: "Google 认证", handle: "@saizeriya", url: "https://www.google.com/maps", icon: "Globe", followers: "4.8 ★", badge: "Popular", color: "#4285F4", bgColor: "bg-blue-50 text-blue-700 border-blue-200" },
          { id: "instagram", name: "Instagram", nameZh: "Instagram", handle: "@saizeriya", url: "https://www.instagram.com", icon: "Instagram", followers: "320K", badge: "Official", color: "#E4405F", bgColor: "bg-pink-50 text-pink-700 border-pink-200" }
        ],
        stores: [
          {
            id: "saizeriya-1",
            name: "Saizeriya Grand Gateway Store",
            nameZh: "萨莉亚 · 淮海中路旗舰店",
            type: "Family Restaurant & Dining",
            address: "999 Huaihai Middle Road, Floor 3",
            addressZh: "淮海中路999号环贸iapm斜对面3楼 (宽敞包座)",
            distance: "0.5 km",
            latitude: 31.2188,
            longitude: 121.4589,
            phone: "021-6433-8888",
            hours: "10:30 AM - 10:00 PM Daily",
            hoursZh: "每日 10:30 - 22:00",
            isOpen: true,
            features: ["Free Drink Bar", "Table QR Order", "Family Seating"],
            featuresZh: ["无限畅饮吧", "扫码极速点餐", "宽敞家庭卡座"],
            rating: 4.8,
            reviewCount: 4200,
            queueCount: 5,
            prepEstimateMinutes: 8,
            image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80"
          }
        ],
        menu: [
          {
            id: "sai-1",
            name: "Baked Garlic Butter Escargot",
            nameZh: "蒜香烤蜗牛 (镇店之宝)",
            category: "Appetizers",
            categoryZh: "经典头盘",
            price: 18.00,
            description: "Tender French escargot sizzling in aromatic garlic parsley butter.",
            descriptionZh: "精选嫩滑蜗牛，搭配浓郁法香蒜蓉黄油焗烤，搭配佛卡夏蘸汁绝配。",
            image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
            calories: "280 kcal",
            popular: true,
            tags: ["Must Order", "Signature"],
            tagsZh: ["进店必点", "浓郁蒜香"]
          },
          {
            id: "sai-2",
            name: "Soft-Boiled Egg Meat Doria",
            nameZh: "温泉蛋肉酱多利亚饭",
            category: "Rice & Doria",
            categoryZh: "经典焗饭",
            price: 19.00,
            description: "Creamy baked rice topped with rich Bolognese meat sauce and melted mozzarella.",
            descriptionZh: "意式传统肉酱与浓醇白汁覆盖香米焗烤，戳破温泉蛋拌匀香浓拉丝。",
            image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
            calories: "450 kcal",
            popular: true,
            tags: ["Best Seller", "Cheesy"],
            tagsZh: ["销冠招牌", "浓香拉丝"]
          }
        ]
      };
    } else {
      // Dynamic General Synthesis accurately tailored to name and inferred category
      const inferred = inferBrandCategory(cleanName, cuisineType);
      const generatedMenu = generateCustomCategoryDishes(cleanName, inferred.category, city);

      fallbackBrand = {
        id: brandId,
        name: cleanName,
        nameZh: `${cleanName} · 官方数字化平台`,
        tagline: inferred.tagline,
        taglineZh: inferred.taglineZh,
        logo: inferred.category === 'hotpot'
          ? "https://images.unsplash.com/photo-1574484284002-952d92456975?w=300&auto=format&fit=crop&q=80"
          : "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80",
        heroBanner: inferred.category === 'hotpot'
          ? "https://images.unsplash.com/photo-1574484284002-952d92456975?w=1200&auto=format&fit=crop&q=80"
          : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80",
        primaryColor: targetColor || inferred.themeColor,
        accentColor: inferred.accentColor,
        bgColor: inferred.bgColor,
        cardBg: "#FFFFFF",
        verifiedBadge: true,
        officialSiteUrl: `https://www.${brandId}.com`,
        hotline: "400-888-6688",
        hotlineLabel: "400-888-6688",
        hotlineLabelZh: "400-888-6688 (全国客服专线)",
        cateringEmail: `service@${brandId}.com`,
        cuisineType: inferred.cuisineEn,
        cuisineTypeZh: inferred.cuisineZh,
        promptKeywords: {
          zh: [
            `🍲 【${cleanName}】招牌特色正宗地道口感极佳`,
            "🥩 严选优质新鲜食材，分量厚道",
            "⚡ 手机极速点餐，自提出餐无需久等",
            "✨ 店内干净整洁，聚会拍照氛围感拉满",
            "❤️ 服务热情周到贴心，体验宾至如归",
            "🌟 全网高分好评，强烈推荐到店品尝"
          ],
          en: [
            `🍲 Signature authentic taste of ${cleanName}`,
            "🥩 Fresh prime ingredients & generous portions",
            "⚡ Lightning-fast mobile ordering & pickup",
            "✨ Clean modern ambience for gatherings",
            "❤️ Welcoming, attentive 5-star service",
            "🌟 Highly rated and strongly recommended"
          ]
        },
        socials: [
          { id: "xiaohongshu", name: "Xiaohongshu (RED)", nameZh: "小红书 官方号", handle: `@${cleanName}`, url: "https://www.xiaohongshu.com", icon: "BookOpen", followers: "320K Followers", badge: "Hot Pick", color: "#FF2442", bgColor: "bg-rose-50 text-rose-700 border-rose-200" },
          { id: "google", name: "Google Maps", nameZh: "Google 认证", handle: `@${cleanName}`, url: "https://www.google.com/maps", icon: "Globe", followers: "4.9 ★", badge: "Top Rated", color: "#4285F4", bgColor: "bg-blue-50 text-blue-700 border-blue-200" },
          { id: "instagram", name: "Instagram", nameZh: "Instagram", handle: `@${cleanName.toLowerCase().replace(/\s+/g, '')}`, url: "https://www.instagram.com", icon: "Instagram", followers: "180K Followers", badge: "Official", color: "#E4405F", bgColor: "bg-pink-50 text-pink-700 border-pink-200" }
        ],
        stores: [
          {
            id: `${brandId}-store-1`,
            name: `${cleanName} Flagship Store`,
            nameZh: `${cleanName} · 核心旗舰店 (${city})`,
            type: "Dining Room & Fast Pickup",
            address: `108 Central Avenue, ${city}`,
            addressZh: `${city}中心大道108号万象天地1楼 (地铁站直达)`,
            distance: "0.4 km",
            latitude: 31.2288,
            longitude: 121.4589,
            phone: "+86 400-888-6688",
            hours: "10:30 AM - 10:00 PM Daily",
            hoursZh: "每日 10:30 - 22:00",
            isOpen: true,
            features: ["Dine-in", "Mobile Pickup", "Free Wi-Fi"],
            featuresZh: ["堂食点单", "手机自提", "高速Wi-Fi"],
            rating: 4.9,
            reviewCount: 2450,
            queueCount: 3,
            prepEstimateMinutes: 6,
            image: inferred.category === 'hotpot'
              ? "https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&auto=format&fit=crop&q=80"
              : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80"
          }
        ],
        menu: generatedMenu
      };
    }

    const fallbackIdentityBrand = { name: fallbackBrand.name, nameZh: fallbackBrand.nameZh };
    fallbackBrand.generationMode = "template";
    fallbackBrand.dataQuality = "unverified";
    fallbackBrand.sources = fallbackEvidenceSources.slice(0, 40);
    fallbackBrand.verifiedBadge = false;
    fallbackBrand.name = cleanName;
    fallbackBrand.nameZh = cleanName;
    fallbackBrand.tagline = "Connect Gemini to research and verify this restaurant before publishing.";
    fallbackBrand.taglineZh = "请先连接 Gemini 检索并核验这家餐馆，再发布页面。";
    fallbackBrand.logo = "";
    fallbackBrand.id = brandId;
    if (Number.isFinite(Number(userLatitude)) && Number.isFinite(Number(userLongitude))) {
      fallbackBrand.researchLocation = {
        latitude: Number(userLatitude),
        longitude: Number(userLongitude),
      };
    }
    customGeneratedBrands = [
      fallbackBrand,
      ...customGeneratedBrands.filter((brand) => brand.id !== brandId),
    ];
    fallbackBrand.heroBanner = "";
    fallbackBrand.cuisineType = "";
    fallbackBrand.cuisineTypeZh = "";
    fallbackBrand.officialSiteUrl = "";
    fallbackBrand.hotline = "Not verified";
    fallbackBrand.hotlineLabel = "Not verified";
    fallbackBrand.hotlineLabelZh = "未查证";
    fallbackBrand.cateringEmail = "";
    const fallbackSocials = fallbackEvidenceSources.flatMap((source: any) => {
      const link = classifyVerifiedLink(source);
      if (!link) return [];
      let sourceIdentity = source.title || "";
      try {
        sourceIdentity += ` ${decodeURIComponent(new URL(source.url).pathname)}`;
      } catch {}
      if (!merchantIdentityMatches(fallbackIdentityBrand, cleanName, {
        name: sourceIdentity,
        nameZh: sourceIdentity,
      })) return [];
      return [{
        id: `evidence-${link.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        ...link,
        handle: link.name,
        url: source.url,
        sourceUrl: source.url,
        sourceTitle: source.title || link.name,
        followers: "",
        color: "#111827",
        bgColor: "bg-neutral-50 text-neutral-700 border-neutral-200",
      }];
    });
    fallbackBrand.socials = [...fallbackSocials, ...getCuratedVerifiedSocials(cleanName, fallbackIdentityBrand)]
      .filter((social, index, all) => {
        const urlKey = String(social.url || "").replace(/\/+$/, "").toLowerCase();
        return !!urlKey && all.findIndex((candidate) =>
          String(candidate.url || "").replace(/\/+$/, "").toLowerCase() === urlKey,
        ) === index;
      })
      .slice(0, 16)
      .map((social, index) => ({ ...social, id: `${social.id || "verified"}-${index + 1}` }));
    fallbackBrand.stores = [];
    fallbackBrand.menu = [];
    fallbackBrand.promptKeywords = makeRestaurantKeywords(cleanName, cleanName, []);
    if (fallbackBrand.socials.length > 0) {
      fallbackBrand.generationMode = "web-grounded-partial";
      fallbackBrand.researchProvider = fallbackResearchProvider;
      fallbackBrand.dataQuality = "partial";
      fallbackBrand.warnings = [
        "Gemini synthesis was temporarily unavailable; verified Social Media and Review links were recovered directly from search sources.",
        "Gemini 暂时繁忙；Social Media 与 Review 已直接从可核验搜索来源恢复，菜单和门店资料请稍后重新生成。"
      ];
    } else {
      fallbackBrand.warnings = [
        "当前未能取得可核验的商家资料，页面不会显示未经核验的链接。",
        "请稍后重新生成，再通过来源链接复核官网、电话、门店和菜单。"
      ];
    }

    return res.json({
      success: true,
      brand: fallbackBrand,
      workflowSteps: workflowLogs,
      message: `Generated ${cleanName} profile via workflow engine.`
    });

  } catch (err: any) {
    console.error("Workflow Generation API Error:", err);
    res.status(500).json({ error: err.message || "Failed to run restaurant generation workflow" });
  }
});

// Vite & Static file handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MIXUE Link Hub server running at http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;

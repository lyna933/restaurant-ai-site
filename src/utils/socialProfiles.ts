import type { BrandConfig, SocialLink } from '../types';

const normalizeIdentity = (value: unknown) =>
  typeof value === 'string' ? value.toLowerCase().replace(/[^a-z0-9\u3400-\u9fff]+/g, '') : '';

/** One profile policy shared by discovery, generation and rendering. Never turn search pages into accounts. */
export function socialProfile(value: unknown) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    const on = (domain: string) => host === domain || host.endsWith('.' + domain);
    const parts = url.pathname.split('/').filter(Boolean);
    const first = parts[0]?.toLowerCase() || '';
    if (!first || ['search', 'explore', 'discover', 'login', 'signup', 'share', 'sharer', 'sharer.php', 'intent', 'home'].includes(first)) return null;
    let name = '', nameZh = '', icon = 'Share2';
    if (on('instagram.com') && parts.length === 1 && !['p','reel','reels','accounts','about','direct'].includes(first)) {
      name = nameZh = 'Instagram'; icon = 'Instagram';
    } else if (on('facebook.com') && (
      (parts.length === 1 && first === 'profile.php' && /^\d+$/.test(url.searchParams.get('id') || '')) ||
      (parts.length === 1 && !['profile.php','watch','reel','reels','groups','pages','people','events','marketplace','gaming','help','settings','photo.php','permalink.php','story.php'].includes(first)) ||
      (['pages','people'].includes(first) && parts.length === 3 && /^\d+$/.test(parts[2]))
    )) { name = nameZh = 'Facebook'; icon = 'Facebook';
    } else if (on('tiktok.com') && parts.length === 1 && /^@.+/.test(first)) {
      name = nameZh = 'TikTok'; icon = 'Video';
    } else if (on('youtube.com') && ((parts.length === 1 && /^@.+/.test(first)) || (parts.length === 2 && ['channel','c','user'].includes(first)))) {
      name = nameZh = 'YouTube'; icon = 'Play';
    } else if ((on('x.com') || on('twitter.com')) && parts.length === 1 && !['i','settings','messages','notifications','compose'].includes(first)) {
      name = nameZh = 'X / Twitter'; icon = 'Twitter';
    } else if ((on('threads.net') || on('threads.com')) && parts.length === 1 && /^@.+/.test(first)) {
      name = nameZh = 'Threads';
    } else if (on('linkedin.com') && first === 'company' && parts.length === 2) {
      name = nameZh = 'LinkedIn'; icon = 'Linkedin';
    } else if (on('pinterest.com') && parts.length === 1 && !['pin','ideas','business'].includes(first)) {
      name = nameZh = 'Pinterest';
    } else if (on('xiaohongshu.com') && first === 'user' && parts[1] === 'profile' && parts.length === 3) {
      name = 'Xiaohongshu (RED)'; nameZh = '小红书'; icon = 'BookOpen';
    } else if (on('weibo.com') && ((first === 'u' && parts.length === 2) || (parts.length === 1 && !['u','tv','newlogin'].includes(first)))) {
      name = 'Weibo'; nameZh = '微博';
    } else if (on('douyin.com') && first === 'user' && parts.length === 2) {
      name = 'Douyin'; nameZh = '抖音'; icon = 'Video';
    } else if (host === 'linktr.ee' && parts.length === 1 && !['s','marketplace','blog','privacy'].includes(first)) {
      name = nameZh = 'Linktree';
    } else return null;
    url.hash = '';
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|fbclid$|igsh$|igshid$|ref$)/i.test(key)) url.searchParams.delete(key);
    }
    url.pathname = url.pathname.replace(/\/+$/, '');
    return { name, nameZh, icon, badge: 'Merchant profile', url: url.toString() };
  } catch { return null; }
}

export function profileKey(value: string) {
  const profile = socialProfile(value);
  if (!profile) return value;
  const url = new URL(profile.url);
  url.hostname = url.hostname.replace(/^www\./, '').replace(/^twitter.com$/, 'x.com');
  const identityQuery = url.pathname === '/profile.php' ? '?id=' + (url.searchParams.get('id') || '') : '';
  return url.hostname + url.pathname.toLowerCase().replace(/\/+$/, '') + identityQuery;
}

function profileFromEvidence(url: string, sourceUrl: string, sourceTitle: string, region?: string): SocialLink {
  const profile = socialProfile(url)!;
  return {
    ...profile, id: 'known-' + profileKey(url).replace(/[^a-z0-9]/gi, '-'),
    handle: region ? region + ' · ' + new URL(url).pathname.split('/').filter(Boolean).pop()
      : new URL(url).searchParams.get('id') || new URL(url).pathname.slice(1),
    badge: region ? 'Merchant-linked · ' + region : 'US brand profile',
    sourceUrl, sourceTitle, color: '#111827',
    bgColor: 'bg-neutral-50 text-neutral-700 border-neutral-200',
  };
}

export const getCuratedVerifiedSocials = (cleanName: string, brand: any) => {
  const identities = [cleanName, brand?.name, brand?.nameZh]
    .map(normalizeIdentity)
    .filter(Boolean);
  const isHaidilao = identities.some((identity) =>
    identity.includes("haidilao") || identity.includes("海底捞") || identity.includes("海底撈"),
  );
  const isHeytea = identities.some((identity) =>
    identity.includes("heytea") || identity.includes("喜茶"),
  );
  const isTaier = identities.some((identity) =>
    identity.includes("taier") || identity.includes("太二酸菜鱼") || identity === "太二",
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

  if (isTaier) {
    profiles.push(
      {
        id: "curated-weibo-taier",
        name: "Weibo",
        nameZh: "太二酸菜鱼官方微博",
        handle: "@太二酸菜鱼",
        url: "https://www.weibo.com/taier22",
        icon: "MessageCircle",
        followers: "",
        badge: "Verified Official",
        color: "#E6162D",
        bgColor: "bg-red-50 text-red-700 border-red-200",
        sourceUrl: "https://www.weibo.com/taier22",
        sourceTitle: "太二酸菜鱼官方微博",
      },
      {
        id: "curated-x-taier",
        name: "X / Twitter",
        nameZh: "太二酸菜鱼官方 X",
        handle: "@TaiEr_",
        url: "https://x.com/TaiEr_",
        icon: "Twitter",
        followers: "",
        badge: "Official Brand Profile",
        color: "#111827",
        bgColor: "bg-neutral-50 text-neutral-700 border-neutral-200",
        sourceUrl: "https://x.com/TaiEr_",
        sourceTitle: "太二酸菜鱼 @TaiEr_",
      },
    );
  }

  const isLuckin = identities.some((identity) => identity === "luckin" || identity.includes("luckincoffee") || identity.includes("瑞幸"));
  const isEasterly = identities.some((identity) => identity.includes("juanxiang") || identity.includes("眷湘") || identity === "easterly" || identity.includes("easterlyhunan"));
  if (isLuckin) {
    const sourceUrl = "https://linktr.ee/luckincoffeeus";
    for (const url of [
      "https://instagram.com/Luckin_coffeeus",
      "https://tiktok.com/@luckincoffeeus",
      "https://www.facebook.com/profile.php?id=61577299109629",
      "https://x.com/luckincoffeeus",
      sourceUrl,
    ]) profiles.push(profileFromEvidence(url, sourceUrl, "Luckin Coffee US · official social hub"));
  }
  if (isEasterly) {
    const sourceUrl = "https://www.google.com/maps/place/Easterly-Berkeley/data=!4m2!3m1!1s0x0:0x608f9fd052790876";
    for (const url of [
      "https://www.instagram.com/jasonwang2278/",
      "https://www.facebook.com/jasonwang2278/",
      "https://www.tiktok.com/@easterly2017",
      "https://x.com/JasonWa66783889",
    ]) profiles.push(profileFromEvidence(url, sourceUrl, "Easterly-Berkeley · merchant-linked social profile", "Berkeley"));
  }
  return profiles;
};

/** Retain only actual social accounts; platform roots are intentionally not substitutes. */
export function mergeSocialProfiles(...groups: SocialLink[][]): SocialLink[] {
  const profiles = new Map<string, SocialLink>();
  for (const group of groups) for (const social of group || []) {
    const profile = socialProfile(social?.url);
    if (!profile) continue;
    const key = profileKey(profile.url);
    if (!profiles.has(key)) profiles.set(key, { ...social, url: profile.url, id: 'social-' + key.replace(/[^a-z0-9]/gi, '-') });
  }
  return [...profiles.values()];
}

export function withKnownSocials(brand: BrandConfig): BrandConfig {
  const known = getCuratedVerifiedSocials(brand.name, brand);
  // Reviews and ordering links remain available to the other sections.
  const otherLinks = (brand.socials || []).filter(link => !socialProfile(link.url));
  return { ...brand, socials: [...mergeSocialProfiles(known, brand.socials), ...otherLinks] };
}

/** A location refresh must not erase already sourced brand accounts or resurrect old branches. */
export function mergeBrandRefresh(previous: BrandConfig, incoming: BrandConfig): BrandConfig {
  const next = withKnownSocials(incoming);
  const identities = (brand: BrandConfig) => [brand.name, brand.nameZh].map(normalizeIdentity).filter(Boolean);
  const sameIdentity = identities(previous).some(value => identities(incoming).includes(value));
  if (!sameIdentity) return next;
  const retained = mergeSocialProfiles((previous.socials || []).filter(link => !!link.sourceUrl));
  const otherLinks = next.socials.filter(link => !socialProfile(link.url));
  return { ...next, socials: [...mergeSocialProfiles(next.socials, retained), ...otherLinks] };
}

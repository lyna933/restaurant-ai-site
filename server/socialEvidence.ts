import { socialProfile, profileKey } from '../src/utils/socialProfiles.js';

export function hasMatchingBrandDomain(url: string, restaurantName: string) {
  try {
    const identity = restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const shortIdentity = identity.replace(/(?:coffee|hotpot|restaurant|bistro|cafe|cuisine)+$/g, '');
    const labels = new URL(url).hostname.toLowerCase().split('.');
    return [identity, shortIdentity].some(name => name.length >= 4 && labels.includes(name));
  } catch { return false; }
}

/** Read only links and Schema.org sameAs, never unrelated suggested accounts in page state. */
export function extractSocialEvidence(html: string, sourcePage: string, restaurantName: string) {
  const candidates = [...html.matchAll(/href\s*=\s*["']([^"']+)["']/gi)].map(match => match[1].replace(/&amp;/g, '&'));
  const visit = (value: any) => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach(visit); return; }
    if (Array.isArray(value.sameAs)) candidates.push(...value.sameAs.filter((url: unknown) => typeof url === 'string'));
    if (value['@graph']) visit(value['@graph']);
    if (value.mainEntity) visit(value.mainEntity);
    if (value.about) visit(value.about);
  };
  for (const script of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { visit(JSON.parse(script[1])); } catch { /* Ignore invalid embedded metadata. */ }
  }
  const found = new Map<string, { title: string; url: string; sourcePage: string }>();
  for (const candidate of candidates) {
    try {
      const profile = socialProfile(new URL(candidate, sourcePage).href);
      if (!profile) continue;
      found.set(profileKey(profile.url), {
        title: restaurantName + ' — social link found on ' + new URL(sourcePage).hostname,
        url: profile.url, sourcePage,
      });
    } catch { /* Malformed links are not evidence. */ }
  }
  return [...found.values()].slice(0, 20);
}

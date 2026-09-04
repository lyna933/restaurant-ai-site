export const normalizeRestaurantIdentity = (value: unknown) =>
  typeof value === 'string' ? value.toLowerCase().replace(/[^a-z0-9\u3400-\u9fff]+/g, '') : '';

const knownAliases = [
  ['heytea', '喜茶'],
  ['haidilao', 'haidilaohotpot', '海底捞', '海底撈'],
  ['juanxiang', '眷湘', 'easterly', 'easterlyhunancuisine'],
  ['luckincoffee', '瑞幸', '瑞幸咖啡'],
  ['taier', '太二', '太二酸菜鱼', '太二酸菜魚'],
];

export function restaurantAliases(name: string): string[] {
  const identity = normalizeRestaurantIdentity(name);
  return knownAliases.find(aliases => aliases.some(alias => identity.includes(alias))) || [];
}

export function sourceMatchesRestaurant(input: string, candidate: string, translatedNames: string[] = []) {
  const aliases = restaurantAliases(input);
  // A model-invented translated name must not override a known brand's identity.
  const names = aliases.length ? aliases : [input, ...translatedNames].map(normalizeRestaurantIdentity);
  const text = normalizeRestaurantIdentity(candidate);
  return names.some(name => {
    if (name.length < 2 || !text.includes(name)) return false;
    // Easterly is also a surname; that word alone does not identify the restaurant.
    if (name === 'easterly') return /hunan|cuisine|restaurant|berkeley|cupertino|santaclara|眷湘/.test(text);
    return true;
  });
}

export function restaurantSearchName(name: string) {
  const aliases = restaurantAliases(name);
  if (aliases.includes('juanxiang')) return 'Easterly Hunan Cuisine';
  return name;
}

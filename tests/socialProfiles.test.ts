import test from 'node:test';
import assert from 'node:assert/strict';
import { AVAILABLE_BRANDS } from '../src/data/brandsData';
import { socialProfile, mergeSocialProfiles, withKnownSocials, mergeBrandRefresh, getCuratedVerifiedSocials } from '../src/utils/socialProfiles';
import { extractSocialEvidence, hasMatchingBrandDomain } from '../server/socialEvidence';

test('third-party coupon pages cannot donate their social accounts to a restaurant', () => {
  assert.equal(hasMatchingBrandDomain('https://couponfollow.com/site/bluebottlecoffee.com', 'Blue Bottle Coffee'), false);
  assert.equal(hasMatchingBrandDomain('https://store.bluebottlecoffee.jp', 'Blue Bottle Coffee'), true);
  assert.equal(hasMatchingBrandDomain('https://bluebottlecoffee.com/us/eng', 'Blue Bottle Coffee'), true);
  assert.equal(hasMatchingBrandDomain('https://www.starbucks.com', 'Starbucks Coffee'), true);
});
import { sourceMatchesRestaurant, restaurantSearchName } from '../src/utils/brandIdentity';

test('Juan Xiang uses Easterly identity and rejects a model-invented Jia Xiang alias', () => {
  assert.equal(restaurantSearchName('Juan Xiang Hunan Bistro'), 'Easterly Hunan Cuisine');
  assert.ok(sourceMatchesRestaurant('Juan Xiang Hunan Bistro', '眷湘Easterly Cupertino'));
  assert.equal(sourceMatchesRestaurant('Juan Xiang Hunan Bistro', 'Xiang Home Kitchen 2 家湘 2', ['家湘']), false);
  assert.equal(sourceMatchesRestaurant('Juan Xiang Hunan Bistro', 'Ashley Easterly Purvis @ash.easterly'), false);
  assert.equal(sourceMatchesRestaurant('Juan Xiang Hunan Bistro', 'Emily Easterly @emilyeasterlymusic'), false);
});

test('all six presets expose real profile paths before any AI request', () => {
  for (const brand of AVAILABLE_BRANDS) {
    const links = mergeSocialProfiles(withKnownSocials(brand).socials);
    assert.ok(links.length > 0, brand.name);
    assert.ok(links.every(link => socialProfile(link.url)));
    console.log(brand.name + ': ' + links.length + ' direct social profiles');
  }
});
test('Facebook semantic IDs and business paths survive rendering', () => {
  assert.equal(socialProfile('https://www.facebook.com/profile.php?id=61577299109629&utm_source=test')?.url,
    'https://www.facebook.com/profile.php?id=61577299109629');
  assert.equal(socialProfile('https://www.facebook.com/people/Example/12345/')?.url,
    'https://www.facebook.com/people/Example/12345');
});
test('homepages, search, posts and spoofed hosts are not social profiles', () => {
  for (const url of ['https://instagram.com/', 'https://instagram.com/p/abc', 'https://fakeinstagram.com/brand',
    'https://facebook.com/search/top?q=brand', 'https://facebook.com/profile.php', 'https://weibo.com/u',
    'https://youtube.com/channel', 'https://xiaohongshu.com/explore/note', 'javascript:alert(1)']) {
    assert.equal(socialProfile(url), null, url);
  }
});
test('Linktree, Threads and Chinese merchant profiles are accepted', () => {
  for (const url of ['https://linktr.ee/luckincoffeeus', 'https://threads.com/@brand', 'https://douyin.com/user/brand',
    'https://xiaohongshu.com/user/profile/12345']) assert.ok(socialProfile(url), url);
});
test('duplicate account variants merge but distinct regions remain', () => {
  const base = getCuratedVerifiedSocials('Luckin Coffee', {})[0];
  const links = mergeSocialProfiles([base, {...base, url: base.url + '/?utm_source=web'},
    {...base, url: 'https://instagram.com/luckincoffee.sg'}]);
  assert.equal(links.length, 2);
  assert.equal(new Set(links.map(link => link.id)).size, 2);
});
test('partial refresh retains sourced social accounts, not stale stores or menus', () => {
  const old = withKnownSocials(AVAILABLE_BRANDS.find(brand => brand.id === 'juanxiang')!);
  const next = mergeBrandRefresh(old, {...old, socials: [], stores: [], menu: []});
  assert.equal(mergeSocialProfiles(next.socials).length, 4);
  assert.equal(next.stores.length, 0);
  assert.equal(next.menu.length, 0);
});
test('a different restaurant never inherits previous social accounts', () => {
  const old = withKnownSocials(AVAILABLE_BRANDS[0]);
  const next = mergeBrandRefresh(old, {...old, name: 'Unrelated Cafe', nameZh: '另一家咖啡', socials: []});
  assert.equal(next.socials.length, 0);
});
test('Luckin aliases resolve to sourced US accounts including Facebook ID', () => {
  for (const name of ['Luckin Coffee', '瑞幸咖啡']) {
    const links = getCuratedVerifiedSocials(name, {});
    assert.equal(links.length, 5);
    assert.ok(links.every(link => link.sourceUrl === 'https://linktr.ee/luckincoffeeus'));
    assert.ok(links.some(link => link.url.includes('profile.php?id=61577299109629')));
  }
});
test('official-page sameAs and href evidence is recovered without suggested accounts', () => {
  const html = '<a href="https://instagram.com/example/?utm_source=site">Follow</a>' +
    '<script type="application/ld+json">{"@type":"WebPage","mainEntity":{"sameAs":["https://facebook.com/profile.php?id=123"]}}</script>' +
    '<script type="application/json">{"suggested":["https://instagram.com/unrelated"]}</script>';
  const links = extractSocialEvidence(html, 'https://example.com/', 'Example');
  assert.equal(links.length, 2);
  assert.ok(links.every(link => link.sourcePage === 'https://example.com/'));
  assert.ok(!links.some(link => link.url.includes('unrelated')));
});

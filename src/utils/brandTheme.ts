import { BrandConfig, BrandLayoutMode, BrandStyleProfile, BrandVisualStyle } from '../types';
import type { CSSProperties } from 'react';

const includesAny = (text: string, words: string[]) => words.some((word) => text.includes(word));

const STYLE_DEFAULTS: Record<BrandVisualStyle, BrandStyleProfile> = {
  playful: {
    visualStyle: 'playful',
    layoutMode: 'bento',
    displayFont: 'rounded',
    cardShape: 'organic',
    motifs: ['✦', '♡', '●', '✺'],
    patternStyle: 'confetti',
    atmosphere: 'Bright, friendly and character-led',
  },
  minimal: {
    visualStyle: 'minimal',
    layoutMode: 'gallery',
    displayFont: 'modern',
    cardShape: 'soft',
    motifs: ['—', '○', '·', '◇'],
    patternStyle: 'minimal',
    atmosphere: 'Quiet, refined and ingredient-focused',
  },
  heritage: {
    visualStyle: 'heritage',
    layoutMode: 'story',
    displayFont: 'serif',
    cardShape: 'soft',
    motifs: ['◆', '☰', '✦', '◉'],
    patternStyle: 'stamp',
    atmosphere: 'Warm, storied and gathering-focused',
  },
  street: {
    visualStyle: 'street',
    layoutMode: 'showcase',
    displayFont: 'condensed',
    cardShape: 'sharp',
    motifs: ['★', '⚡', '＋', '●'],
    patternStyle: 'grid',
    atmosphere: 'Bold, energetic and urban',
  },
  editorial: {
    visualStyle: 'editorial',
    layoutMode: 'showcase',
    displayFont: 'serif',
    cardShape: 'sharp',
    motifs: ['✦', '◇', '—', '○'],
    patternStyle: 'waves',
    atmosphere: 'Expressive, curated and design-forward',
  },
};

export function inferBrandStyle(brand: BrandConfig): BrandStyleProfile {
  const text = [brand.name, brand.nameZh, brand.cuisineType, brand.cuisineTypeZh, brand.tagline]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  let inferred: BrandVisualStyle = 'editorial';
  let motifs = STYLE_DEFAULTS.editorial.motifs;

  if (includesAny(text, ['mixue', '蜜雪', 'ice cream', 'dessert', '甜品', 'milk tea', 'bubble tea', '奶茶', 'boba'])) {
    inferred = 'playful';
    motifs = includesAny(text, ['mixue', '蜜雪', 'ice cream'])
      ? ['❄', '♕', '♡', '🍦']
      : ['●', '♡', '✦', '🧋'];
  } else if (includesAny(text, ['burger', 'shake shack', 'fried chicken', 'pizza', '汉堡', '炸鸡'])) {
    inferred = 'street';
    motifs = ['★', '⚡', '＋', '🍔'];
  } else if (includesAny(text, ['hotpot', 'hot pot', '火锅', 'sichuan', '川味', 'hunan', '湘菜', 'bbq', '烧烤'])) {
    inferred = 'heritage';
    motifs = ['♨', '✦', '◉', '火'];
  } else if (includesAny(text, ['coffee', 'cafe', 'tea', '咖啡', '茶', 'bakery', 'bistro'])) {
    inferred = 'minimal';
    motifs = ['○', '—', '☕', '◇'];
  } else if (includesAny(text, ['japanese', 'sushi', 'omakase', '日料', '寿司', 'fine dining'])) {
    inferred = 'editorial';
    motifs = ['◉', '—', '✦', '旬'];
  }

  const supplied = brand.styleProfile;
  const base = STYLE_DEFAULTS[supplied?.visualStyle || inferred];
  return {
    ...base,
    ...supplied,
    motifs: (supplied?.motifs?.length ? supplied.motifs : motifs)
      .filter((motif) => typeof motif === 'string' && motif.trim())
      .slice(0, 6)
      .map((motif) => motif.slice(0, 4)),
  };
}

export function brandThemeStyle(brand: BrandConfig, profile: BrandStyleProfile) {
  const cardRadius = {
    soft: '24px',
    pill: '34px',
    sharp: '8px',
    organic: '28px 12px 30px 16px',
  }[profile.cardShape];

  return {
    '--brand-primary': brand.primaryColor || '#171717',
    '--brand-accent': brand.accentColor || '#F3F4F6',
    '--brand-bg': brand.bgColor || '#FAFAF8',
    '--brand-card': brand.cardBg || '#FFFFFF',
    '--brand-radius': cardRadius,
  } as CSSProperties;
}

export const layoutClassName = (layout: BrandLayoutMode) => `brand-layout-${layout}`;

export type Language = 'en' | 'zh' | 'zh-TW' | 'ja' | 'ko' | 'es' | 'fr' | 'de';

export interface SocialLink {
  id: string;
  name: string;
  nameZh: string;
  handle: string;
  url: string;
  icon: string;
  followers?: string;
  badge?: string;
  color: string;
  bgColor: string;
  sourceUrl?: string;
  sourceTitle?: string;
}

export interface StoreLocation {
  id: string;
  name: string;
  nameZh: string;
  type: string;
  address: string;
  addressZh: string;
  distance: string;
  numericDistance?: number;
  calculatedDistanceKm?: number;
  latitude: number;
  longitude: number;
  phone: string;
  hours: string;
  hoursZh: string;
  isOpen: boolean;
  features: string[];
  featuresZh: string[];
  rating: number;
  reviewCount: number;
  image?: string;
  mapUrl?: string;
  reviewUrl?: string;
  queueCount?: number;
  prepEstimateMinutes?: number;
  sourceUrl?: string;
  sourceTitle?: string;
  locationScope?: 'local' | 'global';
}

export interface MenuItem {
  id: string;
  name: string;
  nameZh: string;
  category: string;
  categoryZh?: string;
  price: number;
  currency?: string;
  description: string;
  descriptionZh: string;
  image: string;
  calories: string;
  popular?: boolean;
  seasonal?: boolean;
  tags: string[];
  tagsZh: string[];
  sourceUrl?: string;
  sourceTitle?: string;
  imageSourceUrl?: string;
  options?: {
    sizes?: { name: string; extraPrice: number }[];
    milks?: string[];
    iceLevels?: string[];
    sweetness?: string[];
    toppings?: { name: string; nameZh: string; price: number }[];
  };
}

export interface CustomerReview {
  id: string;
  brand: string;
  storeName: string;
  author: string;
  avatar: string;
  rating: number;
  platform: string;
  date: string;
  comment: string;
  tags: string[];
  likes: number;
  verified: boolean;
}

export type BrandVisualStyle = 'playful' | 'minimal' | 'heritage' | 'street' | 'editorial';
export type BrandLayoutMode = 'bento' | 'showcase' | 'story' | 'gallery';

export interface BrandStyleProfile {
  visualStyle: BrandVisualStyle;
  layoutMode: BrandLayoutMode;
  displayFont: 'rounded' | 'modern' | 'serif' | 'condensed';
  cardShape: 'soft' | 'pill' | 'sharp' | 'organic';
  motifs: string[];
  patternStyle: 'confetti' | 'stamp' | 'waves' | 'grid' | 'minimal';
  atmosphere?: string;
}

export interface BrandConfig {
  id: string;
  name: string;
  nameZh: string;
  tagline: string;
  taglineZh: string;
  logo: string;
  logoSourceUrl?: string;
  heroBanner: string;
  heroBannerSourceUrl?: string;
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  cardBg: string;
  styleProfile?: BrandStyleProfile;
  verifiedBadge: boolean;
  officialSiteUrl: string;
  hotline: string;
  hotlineLabel: string;
  hotlineLabelZh?: string;
  cateringEmail: string;
  cuisineType?: string;
  cuisineTypeZh?: string;
  promptKeywords?: {
    en?: string[];
    zh?: string[];
    ja?: string[];
    ko?: string[];
  };
  socials: SocialLink[];
  stores: StoreLocation[];
  menu: MenuItem[];
  generationMode?: 'web-grounded' | 'template';
  researchProvider?: 'gemini-google' | 'gemini-tavily-maps';
  dataQuality?: 'verified' | 'partial' | 'unverified';
  sources?: { title: string; url: string }[];
  warnings?: string[];
  researchLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface WorkflowGenerationRequest {
  name: string;
  cuisineType?: string;
  city?: string;
  description?: string;
  menuInput?: string;
  targetColor?: string;
  language?: Language;
}

export interface WorkflowStageLog {
  id: string;
  title: string;
  titleZh: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  detail: string;
}

export interface CartItem {
  item: MenuItem;
  size: string;
  milk?: string;
  ice?: string;
  sweetness?: string;
  toppings?: string[];
  extraNotes?: string;
  quantity: number;
  itemPrice: number;
}

export type PaymentMethodType = 'mixue_wallet' | 'wechat_pay' | 'alipay' | 'apple_pay' | 'credit_card' | 'stripe_card' | 'stripe_checkout';

export interface PaymentDetails {
  method: PaymentMethodType;
  methodLabel: string;
  accountEmail?: string;
  customerName: string;
  customerPhone: string;
  cardNumberMasked?: string;
  tipAmount: number;
  discountAmount: number;
  promoCode?: string;
  taxAmount: number;
  subtotal: number;
  finalTotal: number;
  transactionId: string;
  paidAt: string;
  authCode?: string;
  verificationMethod: string;
  receiptNumber: string;
  stripePaymentIntentId?: string;
  stripeClientSecret?: string;
  stripeReceiptUrl?: string;
  stripeStatus?: string;
}

export interface StripeConfigResponse {
  publishableKey: string;
  stripeConfigured: boolean;
  currency: string;
  mode: 'live' | 'test' | 'simulated';
}

export type OrderStatus = 'submitted' | 'paid' | 'preparing' | 'ready_for_pickup' | 'completed';

export interface ActiveOrder {
  orderNumber: string;
  ticketQueueCode: string; // e.g. "A042"
  orderType: 'pickup' | 'delivery';
  store: StoreLocation;
  items: CartItem[];
  paymentDetails: PaymentDetails;
  status: OrderStatus;
  estimatedReadyTime: string;
  placedAt: string;
}

export interface UserCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  city?: string;
  timestamp?: number;
}

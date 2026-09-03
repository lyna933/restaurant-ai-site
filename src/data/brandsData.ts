import { BrandConfig, StoreLocation, MenuItem, CustomerReview } from '../types';

export const STARBUCKS_BRAND: BrandConfig = {
  id: 'starbucks',
  name: 'Starbucks Coffee',
  nameZh: '星巴克 (Starbucks)',
  tagline: 'To inspire and nurture the human spirit — one person, one cup and one neighborhood at a time.',
  taglineZh: '激发并孕育人文精神——每人、每杯、每个社区。始于1971年，用心调制每一杯臻选咖啡。',
  logo: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&auto=format&fit=crop&q=80',
  heroBanner: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80',
  primaryColor: '#006241',
  accentColor: '#D4E9E2',
  bgColor: '#F1F8F6',
  cardBg: '#FFFFFF',
  verifiedBadge: true,
  officialSiteUrl: 'https://www.starbucks.com.cn',
  hotline: '400-820-6998',
  hotlineLabel: '400-820-6998',
  hotlineLabelZh: '400-820-6998 (客服热线)',
  cateringEmail: 'customercare@starbucks.com.cn',
  socials: [
    {
      id: 'instagram',
      name: 'Instagram',
      nameZh: 'Instagram 官方主页',
      handle: '@starbucks',
      url: 'https://www.instagram.com/starbucks/',
      icon: 'Instagram',
      followers: '18.1M Followers',
      badge: 'Official Verified',
      color: '#E4405F',
      bgColor: 'bg-pink-50 text-pink-700 border-pink-200'
    },
    {
      id: 'xiaohongshu',
      name: 'Xiaohongshu (RED)',
      nameZh: '小红书 官方号',
      handle: '@Starbucks (RED)',
      url: 'https://www.xiaohongshu.com/search_result?keyword=%E6%98%9F%E5%B7%B4%E5%85%8B',
      icon: 'BookOpen',
      followers: '4.6M Followers',
      badge: 'Secret Menu & Sips',
      color: '#FF2442',
      bgColor: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      nameZh: 'TikTok 官方账号',
      handle: '@starbucks',
      url: 'https://www.tiktok.com/@starbucks',
      icon: 'Video',
      followers: '2.4M Followers',
      badge: 'Trending Sips',
      color: '#000000',
      bgColor: 'bg-neutral-100 text-neutral-900 border-neutral-300'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      nameZh: 'Facebook 官方页面',
      handle: '@Starbucks',
      url: 'https://www.facebook.com/Starbucks/',
      icon: 'Facebook',
      followers: '35M Likes',
      badge: 'Community Hub',
      color: '#1877F2',
      bgColor: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 'x_twitter',
      name: 'X (formerly Twitter)',
      nameZh: 'X (原 Twitter) 官方推特',
      handle: '@Starbucks',
      url: 'https://twitter.com/starbucks',
      icon: 'Twitter',
      followers: '11.0M Followers',
      badge: 'Official News & Care',
      color: '#000000',
      bgColor: 'bg-neutral-100 text-neutral-900 border-neutral-300'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      nameZh: 'YouTube 官方频道',
      handle: '@Starbucks',
      url: 'https://www.youtube.com/user/Starbucks',
      icon: 'Play',
      followers: '380K Subscribers',
      badge: 'Masterclass & Stories',
      color: '#FF0000',
      bgColor: 'bg-red-50 text-red-700 border-red-200'
    }
  ],
  stores: [
    {
      id: 'sbux-store-1',
      name: 'Starbucks Reserve Roastery & Flagship',
      nameZh: '星巴克臻选烘焙工坊 · 旗舰店 (中心大道店)',
      type: 'Reserve Roastery & Teavana Bar',
      address: '789 Grand Avenue, Reserve Pavilion #101',
      addressZh: '中心大道789号臻选工坊101 (中庭巨型铜罐烘焙区)',
      distance: '0.2 km',
      latitude: 37.7749,
      longitude: -122.4194,
      phone: '+86 400-820-6998',
      hours: '07:00 AM - 11:00 PM Daily',
      hoursZh: '每日 07:00 - 23:00',
      isOpen: true,
      features: ['Starbucks Reserve Bar', 'Teavana Tea Bar', 'Freshly Baked Princi Bakery', 'Mobile Order & Pay (啡快)', 'High-speed Wi-Fi & Power Outlets'],
      featuresZh: ['臻选咖啡吧台', '茶瓦纳特调吧', '焙意之现烤烘焙', '啡快手机点餐', '极速Wi-Fi与电源插座'],
      rating: 4.9,
      reviewCount: 18620,
      queueCount: 3,
      prepEstimateMinutes: 4,
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop&q=80',
      mapUrl: 'https://maps.google.com'
    },
    {
      id: 'sbux-store-2',
      name: 'Starbucks Financial District Reserve Store',
      nameZh: '星巴克臻选 · 金融中心店 (IFC大厦店)',
      type: 'Reserve Cafe & Nitro Bar',
      address: '200 International Financial Centre, Floor 1',
      addressZh: '国际金融中心IFC一楼大堂东侧 (商务专属休息区)',
      distance: '0.8 km',
      latitude: 37.7812,
      longitude: -122.4110,
      phone: '+86 400-820-6998',
      hours: '06:30 AM - 10:00 PM Weekdays (07:30 AM Weekends)',
      hoursZh: '工作日 06:30 - 22:00 / 周末 07:30 - 22:00',
      isOpen: true,
      features: ['Nitro Cold Brew on Tap', 'Executive Meeting Zone', 'Mobile Express Pickup', 'Outdoor Garden Seating'],
      featuresZh: ['气致冷萃水龙头', '商务会议区', '啡快自提专属台', '户外花园露天座'],
      rating: 4.8,
      reviewCount: 9420,
      queueCount: 5,
      prepEstimateMinutes: 3,
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
      mapUrl: 'https://maps.google.com'
    },
    {
      id: 'sbux-store-3',
      name: 'Starbucks Metro Transit Hub Express Store',
      nameZh: '星巴克 · 地铁交通枢纽快捷店 (换乘中心B1)',
      type: 'Express Mobile Pickup Store',
      address: 'Central Subway Interchange Station, B1 Level',
      addressZh: '中央枢纽地铁换乘站B1层3号口直达 (啡快无接触自提柜)',
      distance: '1.4 km',
      latitude: 37.7689,
      longitude: -122.4285,
      phone: '+86 400-820-6998',
      hours: '06:00 AM - 11:30 PM Daily',
      hoursZh: '每日 06:00 - 23:30',
      isOpen: true,
      features: ['60-Second Express Pickup', 'Contactless Lockers', 'Grab & Go Fresh Sandwiches'],
      featuresZh: ['60秒极速取杯', '无接触自提柜', '即取新鲜三明治与沙拉'],
      rating: 4.7,
      reviewCount: 6850,
      queueCount: 2,
      prepEstimateMinutes: 2,
      image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&auto=format&fit=crop&q=80',
      mapUrl: 'https://maps.google.com'
    }
  ],
  menu: [
    {
      id: 'sb-item-1',
      name: 'Iced Caffe Americano',
      nameZh: '冰美式咖啡',
      category: 'Espresso & Classics',
      categoryZh: '浓缩咖啡与经典',
      price: 3.65,
      description: 'Signature Starbucks Espresso roast shots combined with cold filtered water and crisp ice. Rich, aromatic, full-bodied with a caramel finish.',
      descriptionZh: '选用星巴克经典浓缩烘焙咖啡豆，现磨现萃注入纯净冷水与冰块，口感深沉浓郁，回甘醇正，0糖低卡。',
      image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80',
      calories: '15 Cal',
      popular: true,
      tags: ['Zero Sugar', 'Classic Bold', 'Morning Wake-up'],
      tagsZh: ['0糖低卡', '经典纯萃', '清醒必备'],
      options: {
        sizes: [
          { name: 'Tall (12 fl oz / 355ml)', extraPrice: 0 },
          { name: 'Grande (16 fl oz / 473ml)', extraPrice: 0.50 },
          { name: 'Venti (24 fl oz / 709ml)', extraPrice: 0.90 }
        ],
        sweetness: ['Unsweetened (0%)', '1 Pump Vanilla', '2 Pumps Vanilla', 'Sugar-Free Hazelnut'],
        iceLevels: ['Regular Ice', 'Less Ice', 'Extra Ice', 'No Ice', 'Hot Steamed']
      }
    },
    {
      id: 'sb-item-2',
      name: 'Oatmilk Honey Flat White',
      nameZh: '燕麦焦糖馥芮白',
      category: 'Espresso & Classics',
      categoryZh: '浓缩咖啡与经典',
      price: 4.95,
      description: 'Bold Ristretto shots of Starbucks Reserve Espresso blended with velvety steamed Oatly oatmilk and a touch of wild honey sweetness.',
      descriptionZh: '精萃短浓缩萃取咖啡前段精华，带来更浓郁的甘甜芳香，与进口Oatly燕麦奶微泡完美交融，点缀天然野生蜂蜜。',
      image: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=500&auto=format&fit=crop&q=80',
      calories: '180 Cal',
      popular: true,
      tags: ['Oatly Oatmilk', 'Ristretto Shots', 'Velvet Microfoam'],
      tagsZh: ['Oatly燕麦奶', '精萃短浓缩', '大师拉花'],
      options: {
        sizes: [
          { name: 'Grande (16 fl oz)', extraPrice: 0 },
          { name: 'Venti (20 fl oz)', extraPrice: 0.60 }
        ],
        sweetness: ['Regular Honey', 'Less Sweet', 'No Honey Added'],
        iceLevels: ['Hot (65°C)', 'Extra Hot (75°C)', 'Iced with Cold Foam']
      }
    },
    {
      id: 'sb-item-3',
      name: 'Caramel Macchiato',
      nameZh: '焦糖玛奇朵',
      category: 'Espresso & Classics',
      categoryZh: '浓缩咖啡与经典',
      price: 4.85,
      description: 'Freshly steamed milk with vanilla-flavored syrup marked with rich espresso and finished with Starbucks signature crosshatch caramel drizzle.',
      descriptionZh: '新鲜蒸奶与香草风味糖浆轻柔融合，缓缓倒入浓烈浓缩咖啡留下标志性印记，顶层淋上香浓的网格状手工焦糖沙司。',
      image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=500&auto=format&fit=crop&q=80',
      calories: '250 Cal',
      popular: true,
      tags: ['Starbucks Icon', 'Caramel Drizzle', 'Vanilla Syrup'],
      tagsZh: ['星巴克名作', '双重层次', '焦糖淋酱'],
      options: {
        sizes: [
          { name: 'Tall (355ml)', extraPrice: 0 },
          { name: 'Grande (473ml)', extraPrice: 0.50 },
          { name: 'Venti (709ml)', extraPrice: 0.90 }
        ],
        sweetness: ['Standard Vanilla', 'Half Sweet', 'Extra Caramel Drizzle'],
        iceLevels: ['Iced with Ice Cubes', 'Hot Steamed Milk']
      }
    },
    {
      id: 'sb-item-4',
      name: 'Iced Matcha Green Tea Latte',
      nameZh: '冰抹茶拿铁',
      category: 'Teavana & Refreshers',
      categoryZh: '茶瓦纳与特调',
      price: 4.65,
      description: 'Premium shade-grown micro-ground green tea matcha combined with fresh milk and ice. Earthy, vibrant green and deeply comforting.',
      descriptionZh: '甄选日本遮光栽培的高品质微研磨纯抹茶，茶多酚丰富，融入新鲜纯牛奶，茶韵悠长醇厚，回味清香丝滑。',
      image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=80',
      calories: '200 Cal',
      popular: true,
      tags: ['Pure Matcha', 'Fresh Milk', 'Vibrant Green'],
      tagsZh: ['纯正宇治抹茶', '茶香醇厚', '高颜值绿意'],
      options: {
        sizes: [
          { name: 'Grande (473ml)', extraPrice: 0 },
          { name: 'Venti (709ml)', extraPrice: 0.60 }
        ],
        sweetness: ['Regular Sweet', 'Half Sweet', 'Unsweetened Pure Matcha'],
        iceLevels: ['Regular Ice', 'Less Ice', 'No Ice', 'Warm Steamed']
      }
    },
    {
      id: 'sb-item-5',
      name: 'Java Chip Frappuccino',
      nameZh: '摩卡可可碎片星冰乐',
      category: 'Frappuccino',
      categoryZh: '星冰乐系列',
      price: 5.25,
      description: 'Rich mocha sauce and Frappuccino chips blended with coffee and milk, topped with whipped cream and mocha drizzle. Pure indulgence!',
      descriptionZh: '浓郁黑巧克力风味摩卡酱与可可碎片，与特制星冰乐咖啡液与纯净冰块充分搅打，顶层覆盖香浓现打鲜奶油与可可淋酱。',
      image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80',
      calories: '440 Cal',
      popular: true,
      tags: ['Frappuccino Top Pick', 'Crisp Cocoa Chips', 'Whipped Cream'],
      tagsZh: ['星冰乐人气王', '酥脆可可碎片', '香浓鲜奶油'],
      options: {
        sizes: [
          { name: 'Tall (355ml)', extraPrice: 0 },
          { name: 'Grande (473ml)', extraPrice: 0.50 },
          { name: 'Venti (591ml)', extraPrice: 0.90 }
        ],
        sweetness: ['Regular Sweet', 'Light Sweet Formula'],
        iceLevels: ['Blended with Ice']
      }
    },
    {
      id: 'sb-item-6',
      name: 'Strawberry Acai Starbucks Refreshers',
      nameZh: '草莓巴西莓生咖',
      category: 'Teavana & Refreshers',
      categoryZh: '茶瓦纳与特调',
      price: 4.45,
      description: 'Sweet strawberry flavors accented by passion fruit and acai notes, shaken with real green coffee extract and freeze-dried strawberries.',
      descriptionZh: '萃取自未经烘焙的纯天然生咖啡豆精华，带来轻盈果香与微提神活力，加入酸甜巴西莓果汁与真实酥脆冻干草莓切片手工摇匀。',
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=80',
      calories: '90 Cal',
      popular: true,
      tags: ['Green Coffee Extract', 'Real Strawberries', 'Low Calorie Boost'],
      tagsZh: ['生咖啡萃取提神', '真实冻干草莓', '清爽低卡力'],
      options: {
        sizes: [
          { name: 'Grande (473ml)', extraPrice: 0 },
          { name: 'Venti (709ml)', extraPrice: 0.60 }
        ],
        sweetness: ['Classic Lemonade Base', 'Coconut Milk (Pink Drink Style) +$0.50'],
        iceLevels: ['Regular Ice', 'Extra Ice', 'Less Ice']
      }
    },
    {
      id: 'sb-item-7',
      name: 'Artisan Butter Croissant',
      nameZh: '法式黄油羊角包',
      category: 'Bakery & Food',
      categoryZh: '烘焙与轻食',
      price: 3.95,
      description: 'Flaky 100% Normandy butter croissant baked golden brown. Crispy exterior, airy honeycomb interior, warmed fresh in store.',
      descriptionZh: '采用法国诺曼底进口优质发酵黄油，经过多次折叠烘烤，外皮金黄酥脆、蜂窝气孔松软；支持门店现烤加热。',
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80',
      calories: '280 Cal',
      tags: ['French Butter', 'Freshly Warmed', 'Breakfast Pick'],
      tagsZh: ['法国进口黄油', '门店现烤加热', '超值早餐'],
      options: {
        sizes: [
          { name: 'Warm & Crisp in Store', extraPrice: 0 }
        ]
      }
    }
  ]
};

export const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-sb-1',
    brand: 'starbucks',
    storeName: 'Starbucks Reserve Roastery Flagship',
    author: 'Emma Watson',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    platform: 'Google Maps',
    date: '10 mins ago',
    comment: 'The barista handcrafted the most silky Oatmilk Honey Flat White I have ever had! The high-ceiling seating area is fantastic for remote work with plenty of outlets and super-fast Wi-Fi. Truly a 5-star morning routine. ☕️✨',
    tags: ['Oatmilk Flat White', 'Reserve Roastery', 'High-Speed Wi-Fi', 'Master Barista'],
    likes: 64,
    verified: true
  },
  {
    id: 'rev-sb-2',
    brand: 'starbucks',
    storeName: 'Starbucks Financial Center Reserve',
    author: 'David Zhang (张先生)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    platform: '小红书 RED',
    date: '1 hour ago',
    comment: '小红书种草的燕麦馥芮白加一泵香草果然封神！早高峰在地铁上提前手机点单【啡快】，进店直接在专属自提柜秒拿，完全不用排队，打工人提神本命！☕️🎒',
    tags: ['隐藏特调喝法', '啡快自提秒取', '燕麦奶馥芮白', '早八人必备'],
    likes: 128,
    verified: true
  },
  {
    id: 'rev-sb-3',
    brand: 'starbucks',
    storeName: 'Starbucks Transit Hub Express',
    author: 'Sophia Vance',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    platform: 'Yelp',
    date: 'Yesterday',
    comment: 'The Java Chip Frappuccino with warm butter croissant is my supreme afternoon pick-me-up! Crunchy cookie crumbles, fresh whipped cream, and super speedy drive-thru service.',
    tags: ['Java Chip Frappuccino', 'Warm Croissant', 'Speedy Service'],
    likes: 92,
    verified: true
  },
  {
    id: 'rev-sb-4',
    brand: 'starbucks',
    storeName: 'Starbucks Reserve Roastery Flagship',
    author: 'Liam Miller',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    platform: 'TripAdvisor',
    date: '2 days ago',
    comment: 'A must-visit coffee sanctuary! The Nitro Cold Brew on tap is velvet smooth with a naturally sweet cascade foam. Master baristas explained the origin of the micro-lot beans with great passion.',
    tags: ['Nitro Cold Brew', 'Coffee Tasting', 'Traveler Must-Visit'],
    likes: 47,
    verified: true
  },
  {
    id: 'rev-sb-5',
    brand: 'starbucks',
    storeName: 'Starbucks Coastal Boulevard Walk',
    author: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    platform: 'Instagram',
    date: '3 days ago',
    comment: 'The Strawberry Acai Refresher with coconut milk (Pink Drink) is gorgeous and crisp! Perfect beach vibes, clean outdoor patio, and pet-friendly water bowls. 🌸🥤',
    tags: ['Pink Drink', 'Strawberry Acai', 'Pet Friendly', 'Patio Vibe'],
    likes: 115,
    verified: true
  },
  {
    id: 'rev-sb-6',
    brand: 'starbucks',
    storeName: 'Starbucks Financial Center Reserve',
    author: 'Marcus King',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    platform: 'Google Maps',
    date: '4 days ago',
    comment: 'Cleanest Starbucks in town! Bold Ristretto espresso shots, friendly smiles, and the mobile order pickup counter is always organized and on point.',
    tags: ['Ristretto Shots', 'Organized Pickup', '5 Stars'],
    likes: 38,
    verified: true
  }
];

export const HAIDILAO_BRAND: BrandConfig = {
  id: 'haidilao',
  name: 'Haidilao Hotpot',
  nameZh: '海底捞火锅 (Haidilao)',
  tagline: 'Service from the heart, unforgettable dining, and boiling passion in every pot.',
  taglineZh: '服务至上，顾客至尊。精熬浓郁汤底，鲜切优质食材，传递沸腾的欢聚温情。',
  logo: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=300&auto=format&fit=crop&q=80',
  heroBanner: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200&auto=format&fit=crop&q=80',
  primaryColor: '#D80018',
  accentColor: '#FEE2E2',
  bgColor: '#FFF8F8',
  cardBg: '#FFFFFF',
  verifiedBadge: true,
  officialSiteUrl: 'https://www.haidilao.com',
  hotline: '4009-107-107',
  hotlineLabel: '4009-107-107',
  hotlineLabelZh: '4009-107-107 (订座与客服专线)',
  cateringEmail: 'customercare@haidilao.com',
  cuisineType: 'Sichuan Hotpot',
  cuisineTypeZh: '川味特色火锅',
  promptKeywords: {
    zh: ['🍲 经典番茄与清油麻辣双拼绝了', '🥩 捞派雪花牛肉鲜嫩爆汁', '⚡ 手机排号入座神速无缝对接', '✨ 免费美甲与小食服务天花板', '🍜 现场花式捞面表演太精彩', '🥤 招牌自制酸梅汤无限续杯解腻'],
    en: ['🍲 Signature Tomato & Spicy Mala Broth', '🥩 Prime Marble Beef Slices', '⚡ Lightning-Fast Mobile Queue & Seating', '✨ World-Class Free Manicure & Snacks', '🍜 Spectacular Handmade Flying Noodles', '🥤 Refreshing Plum Juice Refills']
  },
  socials: [
    {
      id: 'xiaohongshu',
      name: 'Xiaohongshu (RED)',
      nameZh: '小红书 官方号',
      handle: '@海底捞火锅',
      url: 'https://www.xiaohongshu.com',
      icon: 'BookOpen',
      followers: '5.2M Followers',
      badge: 'Secret Broth Hacks',
      color: '#FF2442',
      bgColor: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      nameZh: 'TikTok 官方账号',
      handle: '@haidilaohotpot',
      url: 'https://www.tiktok.com',
      icon: 'Video',
      followers: '3.8M Followers',
      badge: 'Viral Noodle Dance',
      color: '#000000',
      bgColor: 'bg-neutral-100 text-neutral-900 border-neutral-300'
    },
    {
      id: 'google',
      name: 'Google Maps',
      nameZh: 'Google 认证商家',
      handle: '@Haidilao Hotpot',
      url: 'https://www.google.com/maps',
      icon: 'Globe',
      followers: '4.9 ★ (8,500+)',
      badge: 'Michelin Recommended',
      color: '#4285F4',
      bgColor: 'bg-blue-50 text-blue-700 border-blue-200'
    }
  ],
  stores: [
    {
      id: 'hdl-store-1',
      name: 'Haidilao Grand Pavilion Flagship',
      nameZh: '海底捞 · 人民广场核心旗舰店 (大上海时代广场店)',
      type: 'Smart Dining Hall & Private Suites',
      address: '99 Central Avenue, Grand Plaza Floor 5',
      addressZh: '人民大道99号时代广场5楼 (景观露台/智能传菜机器人)',
      distance: '0.3 km',
      latitude: 31.2304,
      longitude: 121.4737,
      phone: '+86 4009-107-107',
      hours: 'Open 24 Hours / 全天24小时营业',
      hoursZh: '24小时通宵营业 (夜宵服务已开放)',
      isOpen: true,
      features: ['24H Late Night Dining', 'Free Nail Art & Kids Corner', 'Handmade Flying Noodles', 'Smart Robot Delivery'],
      featuresZh: ['24小时通宵夜宵', '免费美甲与儿童乐园', '捞派花式捞面', '智能机械臂传菜'],
      rating: 4.9,
      reviewCount: 24500,
      queueCount: 6,
      prepEstimateMinutes: 5,
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80'
    }
  ],
  menu: [
    {
      id: 'hdl-item-1',
      name: 'Signature Four-Grid Soup Base (Tomato & Mala Broth)',
      nameZh: '经典招牌四宫格锅底 (浓香番茄拼经典清油辣)',
      category: 'Soup Bases',
      categoryZh: '特色锅底',
      price: 18.00,
      description: 'Slow-simmered Sun-ripened Xinjiang Tomatoes combined with traditional Sichuan chili & peppercorns for the ultimate contrast.',
      descriptionZh: '精选新疆高日照熟透番茄慢熬，酸甜浓郁泡饭一绝；搭配四川九叶青花椒与秘制牛油，麻辣鲜香过瘾。',
      image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&auto=format&fit=crop&q=80',
      calories: '320 kcal',
      popular: true,
      tags: ['Chef Signature', 'Top Broth'],
      tagsZh: ['招牌力荐', '开锅先喝汤'],
      options: {
        sweetness: ['Normal Tomato 浓郁番茄', 'Extra Rich 加浓番茄', 'Less Oil Mala 少油微辣'],
        toppings: [{ name: 'Fresh Beef Celery Soup Garnish', nameZh: '牛肉粒配香菜芹菜末', price: 0 }]
      }
    },
    {
      id: 'hdl-item-2',
      name: 'Prime Wagyu Marble Beef Slices (捞派雪花肥牛)',
      nameZh: '捞派特选雪花肥牛 (大份)',
      category: 'Meats',
      categoryZh: '精选肉类',
      price: 24.50,
      description: 'Evenly marbled premium grain-fed beef, tender texture, swirled in broth for 8 seconds for a melt-in-mouth finish.',
      descriptionZh: '严选谷饲安格斯雪花部位，油花分布如大理石般细腻，七上八下烫煮8秒即可，入口肉香四溢软嫩化渣。',
      image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&auto=format&fit=crop&q=80',
      calories: '420 kcal',
      popular: true,
      tags: ['Grain-Fed', 'Best Seller'],
      tagsZh: ['谷饲原切', '必点销冠'],
      options: {
        sizes: [{ name: 'Full Portion 整份', extraPrice: 0 }, { name: 'Half Portion 半份', extraPrice: -10.00 }]
      }
    },
    {
      id: 'hdl-item-3',
      name: 'Handcrafted Dancing Flying Noodles (捞派捞面)',
      nameZh: '招牌捞派花式捞面 (含现场功夫表演)',
      category: 'Specialties',
      categoryZh: '捞派特色',
      price: 4.50,
      description: 'Master noodle chef performs synchronized acrobatics right by your table before tossing silky noodles into the bubbling soup.',
      descriptionZh: '由专业捞面师傅现场伴乐进行花式功夫甩面表演，面条劲道爽滑，吸饱浓郁汤汁。',
      image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80',
      calories: '280 kcal',
      popular: true,
      tags: ['Live Show', 'Must Experience'],
      tagsZh: ['现场功夫表演', '吸汁劲道']
    }
  ]
};

export const SHAKESHACK_BRAND: BrandConfig = {
  id: 'shakeshack',
  name: 'Shake Shack',
  nameZh: 'Shake Shack (昔客堡)',
  tagline: 'Stand For Something Good — 100% all-natural Angus beef, spun custard, and community vibe.',
  taglineZh: '始终坚持优质原料。100%全天然安格斯牛肉堡、现切波浪薯条与浓郁手打冰淇淋奶昔。',
  logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80',
  heroBanner: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&auto=format&fit=crop&q=80',
  primaryColor: '#5A8F34',
  accentColor: '#E8F4D9',
  bgColor: '#F8FAF5',
  cardBg: '#FFFFFF',
  verifiedBadge: true,
  officialSiteUrl: 'https://www.shakeshack.com',
  hotline: '400-600-7422',
  hotlineLabel: '400-600-7422',
  hotlineLabelZh: '400-600-7422 (服务热线)',
  cateringEmail: 'shareholder@shakeshack.com',
  cuisineType: 'Modern American Burger & Craft',
  cuisineTypeZh: '美式汉堡精酿与奶昔',
  promptKeywords: {
    zh: ['🍔 双层招牌ShackBurger肉汁丰盈', '🍟 浓郁芝士波浪纹薯条酥脆上瘾', '🍦 手打黑糖香草冰淇淋奶昔丝滑浓郁', '⚡ 手机点单扫码自提极速出餐', '✨ 纽约街头潮酷工业风环境舒适', '🍺 独家精酿啤酒搭配汉堡太绝了'],
    en: ['🍔 Juicy Double ShackBurger with ShackSauce', '🍟 Golden Crispy Crinkle Cut Cheese Fries', '🍦 Rich Hand-Spun Vanilla Custard Shake', '⚡ Seamless Mobile Order & Fast Counter Pickup', '✨ NYC Modern Loft Vibe & Great Music', '🍺 Exclusive ShackMeister Ale Pairing']
  },
  socials: [
    {
      id: 'instagram',
      name: 'Instagram',
      nameZh: 'Instagram 官方',
      handle: '@shakeshack',
      url: 'https://www.instagram.com/shakeshack',
      icon: 'Instagram',
      followers: '1.2M Followers',
      badge: 'Official',
      color: '#E4405F',
      bgColor: 'bg-pink-50 text-pink-700 border-pink-200'
    },
    {
      id: 'xiaohongshu',
      name: 'Xiaohongshu (RED)',
      nameZh: '小红书 官方号',
      handle: '@ShakeShack',
      url: 'https://www.xiaohongshu.com',
      icon: 'BookOpen',
      followers: '850K Followers',
      badge: 'Burgers & Shakes',
      color: '#FF2442',
      bgColor: 'bg-rose-50 text-rose-700 border-rose-200'
    }
  ],
  stores: [
    {
      id: 'shack-store-1',
      name: 'Shake Shack Central Park Flagship',
      nameZh: 'Shake Shack · 新天地核心概念店',
      type: 'Burger Counter & Outdoor Patio',
      address: '123 Fashion Promenade, West Block',
      addressZh: '新天地时尚一期西里101室 (绿植户外露天餐位)',
      distance: '0.2 km',
      latitude: 31.2215,
      longitude: 121.4750,
      phone: '+86 400-600-7422',
      hours: '10:00 AM - 10:30 PM Daily',
      hoursZh: '每日 10:00 - 22:30',
      isOpen: true,
      features: ['Outdoor Patio', 'Pet Friendly', 'Mobile Express Pickup', 'Craft Beer on Tap'],
      featuresZh: ['户外露台景观座', '宠物友好水盆', '手机点单秒提', '现打精酿生啤'],
      rating: 4.9,
      reviewCount: 16800,
      queueCount: 4,
      prepEstimateMinutes: 5,
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80'
    }
  ],
  menu: [
    {
      id: 'shack-item-1',
      name: 'ShackBurger® (招牌芝士牛肉堡)',
      nameZh: '招牌芝士牛肉堡 (ShackBurger)',
      category: 'Burgers',
      categoryZh: '招牌汉堡',
      price: 8.95,
      description: '100% all-natural Angus beef blend smash patty, American cheese, lettuce, tomato, and secret ShackSauce toasted on a potato bun.',
      descriptionZh: '100%纯天然安格斯牛肉饼现压焦香，融化美式芝士、鲜脆罗马生菜、多汁番茄片及独门秘制ShackSauce，夹入松软黄油土豆面包。',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
      calories: '550 kcal',
      popular: true,
      tags: ['Angus Beef', 'Iconic Smash'],
      tagsZh: ['安格斯原切', '招牌经典'],
      options: {
        sizes: [{ name: 'Single 单层肉饼', extraPrice: 0 }, { name: 'Double 双层超厚肉饼', extraPrice: 3.50 }],
        toppings: [{ name: 'Crispy Applewood Smoked Bacon', nameZh: '美式苹果木熏培根', price: 1.80 }]
      }
    },
    {
      id: 'shack-item-2',
      name: 'Crinkle Cut Cheese Fries (波浪纹芝士薯条)',
      nameZh: '波浪纹浓香芝士薯条',
      category: 'Sides',
      categoryZh: '招牌小食',
      price: 5.25,
      description: 'Crispy crinkle-cut golden potatoes topped with a house blend of creamy cheddar and American cheese sauce.',
      descriptionZh: '精选马铃薯粗切波浪纹油炸至金黄酥脆，淋上特调车达与美式双重温热芝士熔岩酱。',
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
      calories: '680 kcal',
      popular: true,
      tags: ['Warm Cheese Dip', 'Crispy Golden'],
      tagsZh: ['爆浆芝士', '酥脆金黄']
    }
  ]
};

export const HEYTEA_BRAND: BrandConfig = {
  id: 'heytea',
  name: 'HEYTEA',
  nameZh: '喜茶 (HEYTEA)',
  tagline: 'Inspiring tea, crafted with real milk, real tea, real fruit, and real sugar.',
  taglineZh: '真品质，不昂贵 · 坚持使用真奶、真茶、真果、真糖，激发喜悦与灵感。',
  logo: 'https://images.unsplash.com/photo-1558857563-b37cfb428d02?w=300&auto=format&fit=crop&q=80',
  heroBanner: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=1200&auto=format&fit=crop&q=80',
  primaryColor: '#1A1A1A',
  accentColor: '#F5EBE6',
  bgColor: '#FDFBF9',
  cardBg: '#FFFFFF',
  verifiedBadge: true,
  officialSiteUrl: 'https://www.heytea.com',
  hotline: '400-930-3300',
  hotlineLabel: '400-930-3300',
  hotlineLabelZh: '400-930-3300 (喜茶官方客服热线)',
  cateringEmail: 'service@heytea.com',
  cuisineType: 'New-Style Chinese Tea & Cheezo Fruit Tea',
  cuisineTypeZh: '新茶饮 · 原创芝士茶与鲜果茶',
  promptKeywords: {
    zh: ['🍇 多肉葡萄手剥果肉饱满爆汁', '🧀 芝芝莓莓咸甜芝士奶盖天花板', '🧋 烤黑糖波波真乳茶奶香浓郁Q弹', '🖤 酷黑莓桑酸甜清爽颜值爆表', '✨ 坚持真奶真茶真果不含植脂末', '📱 手机喜茶GO点单自提极速出餐'],
    en: ['🍇 Very Grape Cheezo with Hand-Peeled Grapes', '🧀 Strawberry Cheezo with Signature Cheese Foam', '🧋 Roasted Brown Sugar Bobo Fresh Milk Tea', '🖤 Cool Black Mulberry Refreshing & Crisp', '✨ 100% Real Milk, Real Tea & Fresh Fruit', '📱 Super Fast Mobile Pickup & Zero Wait']
  },
  socials: [
    {
      id: 'xiaohongshu',
      name: 'Xiaohongshu (RED)',
      nameZh: '小红书 官方号',
      handle: '@喜茶 HEYTEA',
      url: 'https://www.xiaohongshu.com',
      icon: 'BookOpen',
      followers: '2.8M Followers',
      badge: 'Official Verified',
      color: '#FF2442',
      bgColor: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    {
      id: 'instagram',
      name: 'Instagram (Global)',
      nameZh: 'Instagram 官方',
      handle: '@heytea.global',
      url: 'https://www.instagram.com',
      icon: 'Instagram',
      followers: '380K Followers',
      badge: 'Global Official',
      color: '#E4405F',
      bgColor: 'bg-pink-50 text-pink-700 border-pink-200'
    },
    {
      id: 'weibo',
      name: 'Weibo',
      nameZh: '新浪微博 官方号',
      handle: '@喜茶',
      url: 'https://weibo.com',
      icon: 'Share2',
      followers: '4.5M Followers',
      badge: 'New Drops & Collabs',
      color: '#E6162D',
      bgColor: 'bg-red-50 text-red-700 border-red-200'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      nameZh: 'TikTok 官方账号',
      handle: '@heytea_official',
      url: 'https://www.tiktok.com',
      icon: 'Video',
      followers: '620K Followers',
      badge: 'Viral Sips',
      color: '#000000',
      bgColor: 'bg-neutral-100 text-neutral-900 border-neutral-300'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      nameZh: 'Facebook 官方页面',
      handle: '@HEYTEA Official',
      url: 'https://www.facebook.com',
      icon: 'Facebook',
      followers: '450K Likes',
      badge: 'Community Hub',
      color: '#1877F2',
      bgColor: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      nameZh: 'YouTube 官方频道',
      handle: '@HEYTEA喜茶',
      url: 'https://www.youtube.com',
      icon: 'Play',
      followers: '120K Subscribers',
      badge: 'Inspiration Stories',
      color: '#FF0000',
      bgColor: 'bg-red-50 text-red-700 border-red-200'
    }
  ],
  stores: [
    {
      id: 'heytea-store-1',
      name: 'HEYTEA LAB Flagship · Grand Gateway',
      nameZh: '喜茶 LAB 概念旗舰店 (港汇恒隆广场店)',
      type: 'HEYTEA LAB & Tea Geeks Bar',
      address: '1 Hongqiao Road, Grand Gateway 66 Floor 1',
      addressZh: '徐家汇虹桥路1号港汇恒隆广场1楼中庭 (制茶实验室/甜品极客区)',
      distance: '0.2 km',
      latitude: 31.1963,
      longitude: 121.4375,
      phone: '+86 400-930-3300',
      hours: '10:00 AM - 10:00 PM Daily',
      hoursZh: '每日 10:00 - 22:00',
      isOpen: true,
      features: ['Tea Geeks Specialty Bar', 'Fresh Bakery & Gelato', 'Express Mobile Pickup Locker', 'Design Seating Gallery'],
      featuresZh: ['茶极客特调吧台', '现烤烘焙与茶香冰淇淋', '喜茶GO智能自提柜', '灵感设计休闲区'],
      rating: 4.9,
      reviewCount: 15400,
      queueCount: 4,
      prepEstimateMinutes: 5,
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'heytea-store-2',
      name: 'HEYTEA Taikoo Li Qiantan Inspiration Store',
      nameZh: '喜茶 · 前滩太古里灵感店 (木结构艺术店)',
      type: 'Inspiration Design Store',
      address: '500 Dongyu Road, Taikoo Li Qiantan Stone Zone L1',
      addressZh: '东育路500号前滩太古里石区L1层 (露天景观步道旁)',
      distance: '0.8 km',
      latitude: 31.1550,
      longitude: 121.4780,
      phone: '+86 400-930-3300',
      hours: '10:00 AM - 10:00 PM Daily',
      hoursZh: '每日 10:00 - 22:00',
      isOpen: true,
      features: ['Outdoor Garden Seating', 'Pet Friendly Area', 'HEYTEA GO Express'],
      featuresZh: ['户外绿植景观座', '宠物友好休息区', '喜茶GO免排队自提'],
      rating: 4.8,
      reviewCount: 9800,
      queueCount: 2,
      prepEstimateMinutes: 3,
      image: 'https://images.unsplash.com/photo-1558857563-b37cfb428d02?w=600&auto=format&fit=crop&q=80'
    }
  ],
  menu: [
    {
      id: 'ht-item-1',
      name: 'Very Grape Cheezo (多肉葡萄)',
      nameZh: '多肉葡萄 (原创经典销冠)',
      category: 'Real Fruit Tea',
      categoryZh: '时令鲜果茶',
      price: 4.25,
      description: 'Signature hand-peeled fresh Kyoho grapes blended with aromatic green tea slush, topped with rich handcrafted cheese foam.',
      descriptionZh: '喜茶原创招牌！精选手剥饱满巨峰葡萄果肉，搭配清爽绿妍茶汤冰沙与现打香浓芝士奶盖，果肉爽脆多汁。',
      image: 'https://images.unsplash.com/photo-1570857502809-08184874388e?w=600&auto=format&fit=crop&q=80',
      calories: '260 kcal',
      popular: true,
      tags: ['Hand-Peeled Grapes', 'No.1 Best Seller', 'Cheezo Foam'],
      tagsZh: ['一颗颗手剥葡萄', '全网爆款榜首', '经典浓郁芝士'],
      options: {
        sizes: [
          { name: 'Standard 500ml 标准杯', extraPrice: 0 },
          { name: 'Large 650ml 大杯', extraPrice: 0.80 }
        ],
        sweetness: ['Standard 正常糖', 'Less Sweet 少甜 (7分)', 'Half Sweet 半糖 (5分)', 'Zero Calorie Sugar 0卡糖'],
        iceLevels: ['Standard Ice 正常冰', 'Less Ice 少冰', 'No Ice 去冰', 'Warm 温饮'],
        toppings: [
          { name: 'Cheezo Foam', nameZh: '首创经典浓郁芝士', price: 0.70 },
          { name: 'Boba Pearls', nameZh: 'Q弹黑糖波波', price: 0.50 }
        ]
      }
    },
    {
      id: 'ht-item-2',
      name: 'Strawberry Cheezo (芝芝莓莓)',
      nameZh: '芝芝莓莓',
      category: 'Real Fruit Tea',
      categoryZh: '时令鲜果茶',
      price: 4.50,
      description: 'Fresh succulent strawberries crushed and blended with green tea ice slush, finished with silky melted cheese cream.',
      descriptionZh: '精选当季新鲜红颜草莓现切压汁，融汇定制绿妍茶底冰沙，盖上细腻醇厚芝士，酸甜香醇。',
      image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80',
      calories: '280 kcal',
      popular: true,
      tags: ['Fresh Strawberry', 'Iconic Cheezo'],
      tagsZh: ['新鲜红颜草莓', '芝士厚乳'],
      options: {
        sizes: [{ name: 'Standard 500ml', extraPrice: 0 }],
        sweetness: ['Standard 正常糖', 'Less Sweet 少甜', 'Zero Calorie Sugar 0卡糖'],
        iceLevels: ['Slush 冰沙', 'Less Ice 少冰']
      }
    },
    {
      id: 'ht-item-3',
      name: 'Roasted Brown Sugar Bobo Milk Tea (烤黑糖波波真乳茶)',
      nameZh: '烤黑糖波波真乳茶 (年度销量超千万杯)',
      category: 'Real Milk Tea',
      categoryZh: '真原叶鲜奶茶',
      price: 3.80,
      description: 'Slow-cooked chewy brown sugar boba combined with 100% pure fresh farm milk and aromatic roasted tea base.',
      descriptionZh: '每日现熬慢煮黑糖波波，加入100%优质纯真牛乳与慢火烘焙茶底，焦香醇厚，软糯弹牙，0反式脂肪酸。',
      image: 'https://images.unsplash.com/photo-1558857563-b37cfb428d02?w=600&auto=format&fit=crop&q=80',
      calories: '310 kcal',
      popular: true,
      tags: ['100% Real Milk', 'Chewy Boba', 'No Trans Fat'],
      tagsZh: ['100%真牛乳', '现熬黑糖波波', '0植脂末0奶精'],
      options: {
        sizes: [{ name: 'Standard 500ml', extraPrice: 0 }, { name: 'Maxi 650ml', extraPrice: 0.70 }],
        sweetness: ['Recommended 推荐甜度', 'Less Sweet 微甜', 'No Sugar 不另加糖'],
        iceLevels: ['Regular Ice 正常冰', 'Less Ice 少冰', 'Hot 暖饮']
      }
    },
    {
      id: 'ht-item-4',
      name: 'Cool Black Mulberry (酷黑莓桑)',
      nameZh: '酷黑莓桑 (藤原浩联名黑黑系列)',
      category: 'Real Fruit Tea',
      categoryZh: '时令鲜果茶',
      price: 4.10,
      description: 'Handcrafted mulberry and dark grape slush with green tea base. Rich in anthocyanins with a refreshing sweet-tart finish.',
      descriptionZh: '严选高品质手采鲜桑葚与黑提果肉，满满花青素，搭配绿妍茶底制成冰爽冰沙，酸甜清洌。',
      image: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=600&auto=format&fit=crop&q=80',
      calories: '180 kcal',
      popular: true,
      tags: ['Rich in Anthocyanin', 'Viral Dark Series'],
      tagsZh: ['满满花青素', '清爽解腻', '联名爆款'],
      options: {
        sweetness: ['Standard 正常糖', 'Less Sweet 少甜', '0 Calorie Sugar 0卡糖'],
        iceLevels: ['Slush 冰沙', 'Less Ice 少冰']
      }
    },
    {
      id: 'ht-item-5',
      name: 'Supreme Mango Grapefruit Sago (多肉芒芒甘露)',
      nameZh: '多肉芒芒甘露',
      category: 'Real Fruit Tea',
      categoryZh: '时令鲜果茶',
      price: 4.20,
      description: 'Golden mango puree, ruby red grapefruit pulps, silky sago, and coconut milk blended with Jasmine green tea.',
      descriptionZh: '精选大台农芒鲜切果肉，加入手剥红柚粒、Q弹脆波波与浓醇生椰乳，层次极丰满。',
      image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&auto=format&fit=crop&q=80',
      calories: '270 kcal',
      popular: false,
      tags: ['Fresh Mango', 'Grapefruit Sago'],
      tagsZh: ['现切芒果肉', '手剥红柚果粒']
    }
  ]
};

export const JUANXIANG_BRAND: BrandConfig = {
  id: 'juanxiang',
  name: 'Juan Xiang Hunan Bistro',
  nameZh: '眷湘 · 地道湖南菜 (Juan Xiang)',
  tagline: 'Sizzling wok aroma, authentic Hunan spice, and genuine lake-and-mountain hospitality.',
  taglineZh: '热辣生香，地道湖湘风味 · 现炒锅气，传承经典地道湘菜烹饪技艺。',
  logo: '/brand-assets/juanxiang-storefront.jpg',
  logoSourceUrl: 'https://easterly-cupertino.wheree.com/',
  heroBanner: '/brand-assets/juanxiang-storefront.jpg',
  heroBannerSourceUrl: 'https://easterly-cupertino.wheree.com/',
  primaryColor: '#C41212',
  accentColor: '#FEE2E2',
  bgColor: '#FFFBF7',
  cardBg: '#FFFFFF',
  verifiedBadge: true,
  officialSiteUrl: 'https://order.online/store/Easterly-926097',
  hotline: '400-820-7799',
  hotlineLabel: '400-820-7799',
  hotlineLabelZh: '400-820-7799 (眷湘官方服务热线)',
  cateringEmail: 'contact@juanxiang.com',
  cuisineType: 'Authentic Hunan Spicy Cuisine',
  cuisineTypeZh: '湖湘风味 · 经典现炒与招牌剁椒鱼头',
  promptKeywords: {
    zh: ['🌶️ 招牌特色辣椒炒肉油亮香浓超下饭', '🐟 秘制剁椒大鱼头鲜辣入味配手工面绝绝子', '🥩 鲜辣小炒黄牛肉嫩滑多汁镬气十足', '✨ 金牌老长沙臭豆腐外酥里嫩爆汁浓郁', '🥘 养生有机大碗花菜清爽脆口解辣必备', '🍚 现煮五常大米饭喷香粒粒分明无限续'],
    en: ['🌶️ Signature Hunan Chili Fried Pork with Wok Hei', '🐟 Steamed Fish Head with Fermented Chili & Noodles', '🥩 Tender Stir-Fried Beef with Wild Mountain Peppers', '✨ Crispy Changsha Stinky Tofu with Spiced Broth', '🥘 Organic Cauliflower Crisp & Refreshing', '🍚 Steamed Fragrant Rice Unlimited Refill']
  },
  socials: [
    { id: 'xiaohongshu', name: 'Xiaohongshu (RED)', nameZh: '小红书 官方号', handle: '@眷湘湖南菜', url: 'https://www.xiaohongshu.com', icon: 'BookOpen', followers: '860K Followers', badge: 'Hunan Star', color: '#FF2442', bgColor: 'bg-rose-50 text-rose-700 border-rose-200' },
    { id: 'instagram', name: 'Instagram', nameZh: 'Instagram 官方', handle: '@juanxiang.dining', url: 'https://www.instagram.com', icon: 'Instagram', followers: '120K Followers', badge: 'Authentic', color: '#E4405F', bgColor: 'bg-pink-50 text-pink-700 border-pink-200' },
    { id: 'google', name: 'Google Maps', nameZh: 'Google 认证商家', handle: '@JuanXiang', url: 'https://www.google.com/maps', icon: 'Globe', followers: '4.9 ★', badge: 'Top Rated', color: '#4285F4', bgColor: 'bg-blue-50 text-blue-700 border-blue-200' }
  ],
  stores: [
    {
      id: 'jx-store-1',
      name: 'Juan Xiang Flagship · Grand Gateway Mall',
      nameZh: '眷湘 · 核心旗舰店 (港汇恒隆广场店)',
      type: 'Flagship Dining Room',
      address: '1 Hongqiao Road, Grand Gateway 66 Floor 5',
      addressZh: '徐家汇虹桥路1号港汇恒隆广场5楼 (景观露台包厢)',
      distance: '0.2 km',
      latitude: 31.1963,
      longitude: 121.4375,
      phone: '+86 400-820-7799',
      hours: '11:00 AM - 09:30 PM Daily',
      hoursZh: '每日 11:00 - 14:00, 17:00 - 21:30',
      isOpen: true,
      features: ['Open Sizzling Kitchen', 'VIP Dining Salons', 'Free Fragrant Rice Bar'],
      featuresZh: ['明档现炒镬气厨房', '商务独立雅致包间', '自助五常米饭'],
      rating: 4.9,
      reviewCount: 8940,
      queueCount: 6,
      prepEstimateMinutes: 12,
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80'
    }
  ],
  menu: [
    {
      id: 'jx-dish-1',
      name: 'Signature Hunan Chili Fried Pork (招牌特色辣椒炒肉)',
      nameZh: '招牌特色辣椒炒肉 (进店必点下饭王)',
      category: 'Signatures',
      categoryZh: '主厨招牌现炒',
      price: 16.50,
      description: 'Prime pork belly wok-tossed over blazing heat with green spiral peppers, garlic, and fermented beans.',
      descriptionZh: '严选黑土猪前腿肉，搭配湖南特产螺丝椒大火猛火急炒，肉片鲜嫩油润，青椒脆辣过瘾，下饭神器！',
      image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop&q=80',
      calories: '460 kcal',
      popular: true,
      tags: ['No.1 Best Seller', 'Wok Hei'],
      tagsZh: ['全店销冠', '镬气十足']
    },
    {
      id: 'jx-dish-2',
      name: 'Steamed Fish Head with Duo Chopped Chilies (秘制双椒蒸千岛湖大鱼头)',
      nameZh: '秘制双椒蒸千岛湖大鱼头 (配手工鲜面)',
      category: 'Signatures',
      categoryZh: '主厨招牌现炒',
      price: 24.80,
      description: 'Fresh lake carp head steamed with house-fermented duo chopped chilies, scallion oil, and noodles.',
      descriptionZh: '精选千岛湖生态大鱼头，铺满古法陶坛腌制双色剁椒现蒸，鱼肉滑嫩鲜甜，附赠手工面。',
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80',
      calories: '520 kcal',
      popular: true,
      tags: ['Signature', 'Handmade Noodles'],
      tagsZh: ['非遗工艺', '附赠手工面']
    },
    {
      id: 'jx-dish-3',
      name: 'Spicy Stir-Fried Yellow Beef (鲜辣小炒黄牛肉)',
      nameZh: '鲜辣小炒黄牛肉 (肉质细嫩爽口)',
      category: 'Signatures',
      categoryZh: '主厨招牌现炒',
      price: 18.20,
      description: 'Tender slivers of premium yellow beef quickly flash-seared with wild pickled mountain peppers and cilantro.',
      descriptionZh: '严选新鲜嫩黄牛肉现切现炒，配以高山野山椒与鲜香菜，30秒猛火快爆，牛肉鲜嫩爆汁。',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
      calories: '380 kcal',
      popular: true,
      tags: ['Tender Beef', 'High Protein'],
      tagsZh: ['现切嫩牛肉', '野山椒风味']
    },
    {
      id: 'jx-dish-4',
      name: 'Golden Changsha Stinky Tofu (金牌老长沙臭豆腐)',
      nameZh: '金牌老长沙灌汁臭豆腐',
      category: 'Street Snacks',
      categoryZh: '经典湖湘小吃',
      price: 7.50,
      description: 'Crispy dark fermented artisan tofu fried golden crisp and filled with spicy garlic broth.',
      descriptionZh: '经典长沙街头风味！外皮酥脆焦香，灌入秘制浓郁蒜蓉辣汁与酸豆角萝卜干。',
      image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80',
      calories: '220 kcal',
      popular: true,
      tags: ['Changsha Icon', 'Crispy'],
      tagsZh: ['老长沙经典', '外酥里嫩']
    },
    {
      id: 'jx-dish-5',
      name: 'Wok-Tossed Organic Cauliflower (大碗有机花菜)',
      nameZh: '大碗有机花菜 (干锅炝炒)',
      category: 'Vegetables',
      categoryZh: '时令有机蔬食',
      price: 9.80,
      description: 'Crisp organic cauliflower stir-fried in a hot wok with cured pork slices and dried chili.',
      descriptionZh: '精选高原有机散花菜，搭配土猪腊肉片干锅炝炒，脆嫩爽口，焦香扑鼻。',
      image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=600&auto=format&fit=crop&q=80',
      calories: '180 kcal',
      popular: false,
      tags: ['Organic', 'Crisp'],
      tagsZh: ['高原有机', '爽脆鲜香']
    },
    {
      id: 'jx-dish-6',
      name: 'Iced Handcrafted Lemon Winter Melon Tea (手工冰镇冬瓜柠檬茶)',
      nameZh: '手工冰镇冬瓜柠檬茶 (解辣神器)',
      category: 'Beverages',
      categoryZh: '清爽饮品',
      price: 4.80,
      description: 'Traditional slow-brewed brown sugar winter melon tea blended with freshly smashed lemons and ice.',
      descriptionZh: '传统黑糖慢熬冬瓜茸，搭配新鲜香水柠檬手打爆汁，清甜回甘，冰爽解辣首选！',
      image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80',
      calories: '110 kcal',
      popular: true,
      tags: ['Spicy Relief', 'Iced'],
      tagsZh: ['解辣神器', '现打柠檬']
    }
  ]
};

export const TAIER_BRAND: BrandConfig = {
  id: 'taier',
  name: 'Tai Er Sauerkraut Fish',
  nameZh: '太二酸菜鱼 (Tai Er)',
  tagline: 'Our sauerkraut tastes even better than the fish. Authentic Sichuan flavors.',
  taglineZh: '酸菜比鱼好吃 · 甄选古法老坛腌制酸菜与新鲜活鱼，麻辣酸爽。',
  logo: '/brand-assets/taier-avatar.jpg',
  logoSourceUrl: 'https://www.taier.net/',
  heroBanner: '/brand-assets/taier-hero.jpg',
  heroBannerSourceUrl: 'https://www.taier.net/',
  primaryColor: '#E65100',
  accentColor: '#FFEDD5',
  bgColor: '#FFFDF9',
  cardBg: '#FFFFFF',
  verifiedBadge: true,
  officialSiteUrl: 'https://www.taier.net',
  hotline: '400-880-9922',
  hotlineLabel: '400-880-9922',
  hotlineLabelZh: '400-880-9922 (太二服务热线)',
  cateringEmail: 'service@taier.net',
  cuisineType: 'Sichuan Sauerkraut Fish & Delicacies',
  cuisineTypeZh: '经典老坛酸菜鱼 · 鲜麻酸爽',
  promptKeywords: {
    zh: ['🐟 招牌老坛子酸菜鲈鱼酸麻过瘾', '🥩 无骨鲜藤椒现炸小酥肉酥脆椒麻', '✨ 洛神花陈皮热茶免费自助畅饮', '🥬 鸡汤清甜娃娃菜解辣解腻', '⚡ 手机扫码入座排号极速体验', '🌟 酸菜真的比鱼还要好吃很多'],
    en: ['🐟 Signature Sauerkraut Sea Bass Golden Broth', '🥩 Crispy Sichuan Pepper Pork Bites', '✨ Free Roselle Citrus Hot Tea Bar', '🥬 Poached Baby Cabbage in Bone Broth', '⚡ Fast Mobile Check-in & Seating', '🌟 Sauerkraut That Tastes Better Than Fish']
  },
  socials: [
    { id: 'weibo', name: 'Weibo', nameZh: '太二酸菜鱼官方微博', handle: '@太二酸菜鱼', url: 'https://www.weibo.com/taier22', icon: 'MessageCircle', followers: '', badge: 'Verified Official', color: '#E6162D', bgColor: 'bg-red-50 text-red-700 border-red-200', sourceUrl: 'https://www.weibo.com/taier22', sourceTitle: '太二酸菜鱼官方微博' },
    { id: 'x', name: 'X / Twitter', nameZh: '太二酸菜鱼官方 X', handle: '@TaiEr_', url: 'https://x.com/TaiEr_', icon: 'Twitter', followers: '', badge: 'Official Brand Profile', color: '#111827', bgColor: 'bg-neutral-50 text-neutral-700 border-neutral-200', sourceUrl: 'https://x.com/TaiEr_', sourceTitle: '太二酸菜鱼 @TaiEr_' }
  ],
  stores: [
    {
      id: 'te-store-1',
      name: 'Tai Er Sauerkraut Fish · IAPM Store',
      nameZh: '太二酸菜鱼 · 环贸iapm核心旗舰店',
      type: 'Flagship Dining Room',
      address: '999 Huaihai Middle Road, Floor 4',
      addressZh: '淮海中路999号环贸iapm商场4楼 (近地铁陕西南路站)',
      distance: '0.5 km',
      latitude: 31.2188,
      longitude: 121.4589,
      phone: '+86 400-880-9922',
      hours: '11:00 AM - 09:30 PM Daily',
      hoursZh: '每日 11:00 - 14:00, 17:00 - 21:30',
      isOpen: true,
      features: ['Free Roselle Tea Bar', 'Fresh Sauerkraut Fermentation', 'Fast Seating'],
      featuresZh: ['自助洛神花茶水吧', '老坛酸菜工艺展示', '扫码极速点餐'],
      rating: 4.8,
      reviewCount: 9300,
      queueCount: 8,
      prepEstimateMinutes: 10,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80'
    }
  ],
  menu: [
    {
      id: 'te-dish-1',
      name: 'Signature Sauerkraut Sea Bass (老坛子酸菜鲈鱼)',
      nameZh: '招牌老坛子酸菜鲈鱼 (酸菜比鱼好吃)',
      category: 'Signatures',
      categoryZh: '主厨招牌',
      price: 26.80,
      description: 'Tender fresh sea bass slices in golden sour broth with fermented sauerkraut and Sichuan peppers.',
      descriptionZh: '精选鲜活加州鲈鱼去骨起片，搭配老坛地窖腌制酸菜，鱼片嫩滑爽口，酸麻过瘾。',
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80',
      calories: '480 kcal',
      popular: true,
      tags: ['No.1 Best Seller', 'Fermented Sauerkraut'],
      tagsZh: ['镇店销冠', '酸菜比鱼好吃']
    },
    {
      id: 'te-dish-2',
      name: 'Crispy Boneless Sichuan Pepper Pork Bites (无骨鲜藤椒小酥肉)',
      nameZh: '无骨鲜藤椒现炸小酥肉 (外酥里嫩)',
      category: 'Sides',
      categoryZh: '经典小吃',
      price: 8.50,
      description: 'Tender pork loin fried golden crisp and dusted with tingling green Sichuan pepper.',
      descriptionZh: '严选猪里脊肉现切现炸，外酥里嫩，配秘制鲜藤椒辣椒粉，焦香麻爽。',
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
      calories: '320 kcal',
      popular: true,
      tags: ['Crispy', 'Sichuan Pepper'],
      tagsZh: ['现炸酥脆', '藤椒椒麻']
    },
    {
      id: 'te-dish-3',
      name: 'Luohan Fruit & Tangerine Peel Hot Tea (洛神花陈皮热茶)',
      nameZh: '洛神花陈皮茶 (自助免费畅饮)',
      category: 'Beverages',
      categoryZh: '特色茶饮',
      price: 3.50,
      description: 'Natural dried roselle flowers and aged tangerine peels steeped in hot water. Sweet-sour and soothing.',
      descriptionZh: '新会老陈皮搭配红艳洛神花冲泡，酸甜适口，暖胃润喉，无限畅饮。',
      image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80',
      calories: '40 kcal',
      popular: true,
      tags: ['Free Refills', 'Soothing'],
      tagsZh: ['自助畅饮', '生津止渴']
    }
  ]
};

export const AVAILABLE_BRANDS: BrandConfig[] = [
  STARBUCKS_BRAND,
  HEYTEA_BRAND,
  HAIDILAO_BRAND,
  SHAKESHACK_BRAND,
  JUANXIANG_BRAND,
  TAIER_BRAND
];

export function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Number(d.toFixed(2));
}

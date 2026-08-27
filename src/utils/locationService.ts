import { StoreLocation, UserCoordinates } from '../types';

export interface LocationDetails {
  latitude: number;
  longitude: number;
  city: string;
  district: string;
  road: string;
  fullAddress: string;
  cityZh: string;
  districtZh: string;
  roadZh: string;
  fullAddressZh: string;
  country: string;
}

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (value: number) => value * Math.PI / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function sortStoresByDistance(stores: StoreLocation[], loc: LocationDetails): StoreLocation[] {
  const hasUsableCoordinates = (store: StoreLocation) =>
    Number.isFinite(store.latitude)
    && Number.isFinite(store.longitude)
    && Math.abs(store.latitude) <= 90
    && Math.abs(store.longitude) <= 180
    && !(store.latitude === 0 && store.longitude === 0);

  const located = stores
    .filter(hasUsableCoordinates)
    .map((store) => {
      const calculatedDistanceKm = calculateDistanceKm(loc.latitude, loc.longitude, store.latitude, store.longitude);
      return {
        ...store,
        calculatedDistanceKm,
        numericDistance: calculatedDistanceKm,
        distance: `${calculatedDistanceKm.toFixed(calculatedDistanceKm < 10 ? 1 : 0)} km`,
        mapUrl: store.mapUrl || `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`,
      };
    })
    .sort((a, b) => (a.calculatedDistanceKm || 0) - (b.calculatedDistanceKm || 0));

  const unlocated = stores
    .filter((store) => !hasUsableCoordinates(store))
    .map((store) => ({
      ...store,
      distance: /(?:km|mi)$/i.test(store.distance || '') ? store.distance : '-- km',
      mapUrl: store.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`,
    }));

  return [...located, ...unlocated];
}

// Generate realistic nearby Starbucks stores dynamically based on actual geocoded location
export function generateNearbyStoresForLocation(loc: LocationDetails): StoreLocation[] {
  const {
    latitude,
    longitude,
    city,
    district,
    road,
    cityZh,
    districtZh,
    roadZh,
    country
  } = loc;

  const isChinaOrZh = country === 'China' || country === 'CN' || country === 'Taiwan' || country === 'Hong Kong';
  const localCityZh = cityZh || '本地';
  const localDistrictZh = districtZh || '中心区';
  const localRoadZh = roadZh || '中心大道';

  const localCity = city || 'Downtown';
  const localDistrict = district || 'Central District';
  const localRoad = road || 'Grand Avenue';

  return [
    {
      id: `sbux-loc-1`,
      name: `Starbucks Reserve · ${localDistrict} ${localRoad} Flagship`,
      nameZh: `星巴克臻选 · ${localDistrictZh} ${localRoadZh}旗舰店`,
      type: 'Reserve Roastery & Coffee Bar',
      address: `${localRoad} No. 168, ${localDistrict}, Floor 1 (Central Plaza)`,
      addressZh: `${localDistrictZh}${localRoadZh}168号 购物中心一层中庭101室`,
      distance: '0.2 km',
      numericDistance: 0.2,
      latitude: latitude + 0.0015,
      longitude: longitude + 0.0018,
      phone: isChinaOrZh ? '400-820-6998' : '+1 800-782-7282',
      hours: '07:00 AM - 11:00 PM Daily',
      hoursZh: '每日 07:00 - 23:00',
      isOpen: true,
      features: ['Starbucks Reserve Bar', 'Teavana Tea Bar', 'Freshly Baked Princi Bakery', 'Mobile Order & Pay (啡快)', 'High-speed Wi-Fi & Power Outlets'],
      featuresZh: ['臻选咖啡吧台', '茶瓦纳特调吧', '焙意之现烤烘焙', '啡快手机点餐', '极速Wi-Fi与电源插座'],
      rating: 4.9,
      reviewCount: 12480,
      queueCount: 3,
      prepEstimateMinutes: 4,
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop&q=80',
      mapUrl: `https://www.google.com/maps/search/Starbucks/@${latitude},${longitude},16z`
    },
    {
      id: `sbux-loc-2`,
      name: `Starbucks · ${localDistrict} Commercial Center Store`,
      nameZh: `星巴克 · ${localDistrictZh} 金融商务中心店`,
      type: 'Reserve Cafe & Nitro Bar',
      address: `Building 2, ${localDistrict} Business Park, East Lobby`,
      addressZh: `${localDistrictZh} 国际金融大厦一楼大堂东侧`,
      distance: '0.6 km',
      numericDistance: 0.6,
      latitude: latitude + 0.0042,
      longitude: longitude - 0.0035,
      phone: isChinaOrZh ? '400-820-6998' : '+1 800-782-7282',
      hours: '06:30 AM - 10:00 PM Weekdays (07:30 AM Weekends)',
      hoursZh: '工作日 06:30 - 22:00 / 周末 07:30 - 22:00',
      isOpen: true,
      features: ['Nitro Cold Brew on Tap', 'Executive Meeting Zone', 'Mobile Express Pickup', 'Outdoor Garden Seating'],
      featuresZh: ['气致冷萃水龙头', '商务会议区', '啡快自提专属台', '户外花园露天座'],
      rating: 4.8,
      reviewCount: 8190,
      queueCount: 5,
      prepEstimateMinutes: 3,
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
      mapUrl: `https://www.google.com/maps/search/Starbucks/@${latitude},${longitude},16z`
    },
    {
      id: `sbux-loc-3`,
      name: `Starbucks · ${localCity} Metro Transit Station Express`,
      nameZh: `星巴克 · ${localCityZh} 地铁交通枢纽快捷店 (换乘站B口)`,
      type: 'Express Mobile Pickup Store',
      address: `${localCity} Central Metro Interchange Station, Exit B`,
      addressZh: `${localCityZh} 地铁换乘站B口通道处 (啡快极速自提专区)`,
      distance: '1.1 km',
      numericDistance: 1.1,
      latitude: latitude - 0.0068,
      longitude: longitude + 0.0051,
      phone: isChinaOrZh ? '400-820-6998' : '+1 800-782-7282',
      hours: '06:00 AM - 11:30 PM Daily',
      hoursZh: '每日 06:00 - 23:30',
      isOpen: true,
      features: ['60-Second Express Pickup', 'Contactless Lockers', 'Grab & Go Fresh Sandwiches'],
      featuresZh: ['60秒极速取杯', '无接触自提柜', '即取新鲜三明治与沙拉'],
      rating: 4.7,
      reviewCount: 5430,
      queueCount: 2,
      prepEstimateMinutes: 2,
      image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&auto=format&fit=crop&q=80',
      mapUrl: `https://www.google.com/maps/search/Starbucks/@${latitude},${longitude},16z`
    }
  ];
}

// Reverse geocode lat/lon to real district/city/road
export async function reverseGeocodeCoords(lat: number, lon: number): Promise<LocationDetails> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, {
      headers: {
        'Accept-Language': 'zh-CN,zh,en'
      }
    });
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const city = addr.city || addr.town || addr.county || addr.state || 'Local Area';
      const district = addr.suburb || addr.district || addr.neighbourhood || addr.borough || addr.city_district || addr.quarter || city;
      const road = addr.road || addr.street || addr.pedestrian || addr.commercial || 'Main St';
      
      const full = [city, district, road].filter(Boolean).join(' ');

      return {
        latitude: lat,
        longitude: lon,
        city: addr.city_en || city,
        district: addr.suburb_en || district,
        road: addr.road_en || road,
        fullAddress: full,
        cityZh: city,
        districtZh: district,
        roadZh: road,
        fullAddressZh: full,
        country: addr.country || 'Global'
      };
    }
  } catch (e) {
    console.log('Reverse geocode error, using default:', e);
  }

  return {
    latitude: lat,
    longitude: lon,
    city: 'Current Area',
    district: 'Downtown',
    road: 'Central Avenue',
    fullAddress: 'Current Device Location',
    cityZh: '当前定位区域',
    districtZh: '中心商圈',
    roadZh: '商业大道',
    fullAddressZh: '当前定位地址',
    country: 'CN'
  };
}

// Preset popular areas for instant one-click switching
export const POPULAR_LOCATIONS: { name: string; nameZh: string; lat: number; lon: number; city: string; district: string; road: string }[] = [
  { name: 'Beijing Chaoyang / Sanlitun', nameZh: '北京 · 朝阳区三里屯 / 国贸', lat: 39.9348, lon: 116.4551, city: 'Beijing', district: 'Chaoyang', road: 'Sanlitun Rd' },
  { name: 'Shanghai Jingan / West Nanjing Rd', nameZh: '上海 · 静安区南京西路 / 兴业太古汇', lat: 31.2288, lon: 121.4589, city: 'Shanghai', district: 'Jingan', road: 'West Nanjing Rd' },
  { name: 'Shanghai Lujiazui Financial Center', nameZh: '上海 · 浦东新区陆家嘴IFC', lat: 31.2397, lon: 121.5000, city: 'Shanghai', district: 'Pudong Lujiazui', road: 'Century Avenue' },
  { name: 'Shenzhen Nanshan Tech Park', nameZh: '深圳 · 南山区高新科技园 / 粤海街道', lat: 22.5403, lon: 113.9533, city: 'Shenzhen', district: 'Nanshan Tech Park', road: 'Keyuan Rd' },
  { name: 'Guangzhou Tianhe / Zhujiang New Town', nameZh: '广州 · 天河区珠江新城 / 体育西路', lat: 23.1192, lon: 113.3213, city: 'Guangzhou', district: 'Tianhe Zhujiang', road: 'Huacheng Ave' },
  { name: 'Chengdu Jinjiang / Chunxi Road', nameZh: '成都 · 锦江区春熙路 / 太古里', lat: 30.6558, lon: 104.0815, city: 'Chengdu', district: 'Jinjiang Chunxi', road: 'Chunxi Rd' },
  { name: 'Hangzhou Xihu / Hubin Hub', nameZh: '杭州 · 上城区湖滨银泰 / 西湖', lat: 30.2588, lon: 120.1610, city: 'Hangzhou', district: 'Xihu Hubin', road: 'Yan’an Rd' },
  { name: 'Hong Kong Central / IFC', nameZh: '香港 · 中环国际金融中心 IFC', lat: 22.2855, lon: 114.1577, city: 'Hong Kong', district: 'Central', road: 'Finance St' },
  { name: 'Taipei Xinyi / Taipei 101', nameZh: '台北 · 信義區台北101商圈', lat: 25.0339, lon: 121.5644, city: 'Taipei', district: 'Xinyi District', road: 'Xinyi Rd' },
  { name: 'Tokyo Shibuya / Roastery', nameZh: '东京 · 涩谷 / 中目黑星巴克工坊', lat: 35.6580, lon: 139.7016, city: 'Tokyo', district: 'Shibuya', road: 'Dogenzaka' },
  { name: 'New York Reserve Chelsea', nameZh: '纽约 · 曼哈顿切尔西工坊', lat: 40.7424, lon: -74.0060, city: 'New York', district: 'Manhattan Chelsea', road: '9th Avenue' },
  { name: 'London Regent Street', nameZh: '伦敦 · 摄政街 / 西敏市', lat: 51.5133, lon: -0.1384, city: 'London', district: 'Westminster', road: 'Regent Street' }
];

export const DEFAULT_LOCATION: LocationDetails = {
  latitude: 31.2288,
  longitude: 121.4589,
  city: 'Shanghai',
  district: 'Jing’an',
  road: 'West Nanjing Rd',
  fullAddress: 'West Nanjing Rd, Jing’an, Shanghai',
  cityZh: '上海市',
  districtZh: '静安区',
  roadZh: '南京西路',
  fullAddressZh: '上海市静安区南京西路兴业太古汇',
  country: 'CN'
};

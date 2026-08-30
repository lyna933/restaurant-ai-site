import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  STARBUCKS_BRAND,
  AVAILABLE_BRANDS,
  INITIAL_REVIEWS
} from './data/brandsData';
import { 
  BrandConfig, 
  Language, 
  MenuItem, 
  CustomerReview, 
  StoreLocation
} from './types';
import { 
  LocationDetails, 
  DEFAULT_LOCATION, 
  generateNearbyStoresForLocation, 
  reverseGeocodeCoords,
  sortStoresByDistance,
} from './utils/locationService';

import { Header } from './components/Header';
import { SocialsSection } from './components/SocialsSection';
import { RateUsSection } from './components/RateUsSection';
import { MenuDisplaySection } from './components/MenuDisplaySection';
import { ContactHotlineSection } from './components/ContactHotlineSection';

import { LocationSelectorModal } from './components/LocationSelectorModal';
import { AIReviewModal } from './components/AIReviewModal';
import { AIWorkflowModal } from './components/AIWorkflowModal';
import { ConciergeInquiryModal } from './components/ConciergeInquiryModal';
import { QRCodeModal } from './components/QRCodeModal';
import { ToastNotification } from './components/ToastNotification';
import { TRANSLATIONS } from './utils/translations';
import { brandThemeStyle, inferBrandStyle, layoutClassName } from './utils/brandTheme';

import { 
  Sparkles, 
  ArrowUp
} from 'lucide-react';

const applyBrandLocalization = (brand: BrandConfig, localization: any, language: Language): BrandConfig => {
  if (!localization) return brand;
  const traditionalChinese = language === 'zh-TW';
  const localizePair = (base: any, translated: any, standardKey: string, zhKey: string) => ({
    ...base,
    [traditionalChinese ? zhKey : standardKey]: translated?.[standardKey] || base[traditionalChinese ? zhKey : standardKey],
  });
  const translatedSocials = new Map((localization.socials || []).map((item: any) => [item.id, item]));
  const translatedStores = new Map((localization.stores || []).map((item: any) => [item.id, item]));
  const translatedMenu = new Map((localization.menu || []).map((item: any) => [item.id, item]));
  return {
    ...brand,
    ...(traditionalChinese
      ? {
          nameZh: localization.name || brand.nameZh,
          taglineZh: localization.tagline || brand.taglineZh,
          cuisineTypeZh: localization.cuisineType || brand.cuisineTypeZh,
          hotlineLabelZh: localization.hotlineLabel || brand.hotlineLabelZh,
        }
      : {
          name: localization.name || brand.name,
          tagline: localization.tagline || brand.tagline,
          cuisineType: localization.cuisineType || brand.cuisineType,
          hotlineLabel: localization.hotlineLabel || brand.hotlineLabel,
        }),
    promptKeywords: {
      ...brand.promptKeywords,
      [traditionalChinese ? 'zh' : 'en']: localization.promptKeywords || brand.promptKeywords?.[traditionalChinese ? 'zh' : 'en'],
    },
    socials: brand.socials.map((social) => {
      const translated: any = translatedSocials.get(social.id);
      if (!translated) return social;
      return {
        ...localizePair(social, translated, 'name', 'nameZh'),
        badge: translated.badge || social.badge,
      };
    }),
    stores: brand.stores.map((store) => {
      const translated: any = translatedStores.get(store.id);
      if (!translated) return store;
      return traditionalChinese
        ? {
            ...store,
            nameZh: translated.name || store.nameZh,
            addressZh: translated.address || store.addressZh,
            hoursZh: translated.hours || store.hoursZh,
            featuresZh: translated.features || store.featuresZh,
            type: translated.type || store.type,
          }
        : {
            ...store,
            name: translated.name || store.name,
            address: translated.address || store.address,
            hours: translated.hours || store.hours,
            features: translated.features || store.features,
            type: translated.type || store.type,
          };
    }),
    menu: brand.menu.map((item) => {
      const translated: any = translatedMenu.get(item.id);
      if (!translated) return item;
      return traditionalChinese
        ? {
            ...item,
            nameZh: translated.name || item.nameZh,
            categoryZh: translated.category || item.categoryZh,
            descriptionZh: translated.description || item.descriptionZh,
            tagsZh: translated.tags || item.tagsZh,
            calories: translated.calories || item.calories,
          }
        : {
            ...item,
            name: translated.name || item.name,
            category: translated.category || item.category,
            description: translated.description || item.description,
            tags: translated.tags || item.tags,
            calories: translated.calories || item.calories,
          };
    }),
  };
};

export default function App() {
  // Multi-Tenant Brand State
  const [availableBrands, setAvailableBrands] = useState<BrandConfig[]>(AVAILABLE_BRANDS);
  const [currentBrand, setCurrentBrand] = useState<BrandConfig>(AVAILABLE_BRANDS[0]);
  const [isAIWorkflowOpen, setIsAIWorkflowOpen] = useState(true);
  
  // Language
  const [language, setLanguage] = useState<Language>('en');
  const isZh = language === 'zh' || language === 'zh-TW';
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [brandLocalizations, setBrandLocalizations] = useState<Record<string, any>>({});
  const localizationKey = `${currentBrand.id}:${language}`;
  const needsDynamicTranslation = !['en', 'zh'].includes(language);

  useEffect(() => {
    if (!needsDynamicTranslation || brandLocalizations[localizationKey]) return;
    let cancelled = false;
    fetch('/api/translate-brand', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand: currentBrand, language }),
    })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Translation failed')))
      .then((payload) => {
        if (!cancelled && payload?.localization) {
          setBrandLocalizations((previous) => ({ ...previous, [localizationKey]: payload.localization }));
        }
      })
      .catch((error) => console.warn('Dynamic page translation unavailable:', error));
    return () => { cancelled = true; };
  }, [brandLocalizations, currentBrand, language, localizationKey, needsDynamicTranslation]);

  const displayBrand = useMemo(
    () => applyBrandLocalization(currentBrand, brandLocalizations[localizationKey], language),
    [brandLocalizations, currentBrand, language, localizationKey],
  );
  const brandStyle = useMemo(() => inferBrandStyle(displayBrand), [displayBrand]);

  useEffect(() => {
    const htmlLanguages: Record<Language, string> = {
      en: 'en', zh: 'zh-CN', 'zh-TW': 'zh-Hant', ja: 'ja', ko: 'ko', es: 'es', fr: 'fr', de: 'de',
    };
    document.documentElement.lang = htmlLanguages[language];
    document.title = isZh
      ? `${displayBrand.nameZh || displayBrand.name} · ${t.reviewsTitle}`
      : `${displayBrand.name} · ${t.reviewsTitle}`;
  }, [displayBrand.name, displayBrand.nameZh, isZh, language, t.reviewsTitle]);

  const directSocialProfiles = displayBrand.socials.filter((social) => {
    try {
      const url = new URL(social.url);
      const host = url.hostname.toLowerCase().replace(/^www\./, '');
      const segments = url.pathname.split('/').filter(Boolean);
      const first = segments[0]?.toLowerCase() || '';
      if (host.endsWith('instagram.com')) return segments.length === 1 && !['p', 'reel', 'reels', 'explore'].includes(first);
      if (host.endsWith('facebook.com')) return segments.length >= 1 && !['watch', 'reel', 'reels', 'groups', 'search'].includes(first);
      if (host.endsWith('tiktok.com')) return segments.length === 1 && first.startsWith('@');
      if (host.endsWith('youtube.com')) return ['channel', 'c', 'user'].includes(first) || first.startsWith('@');
      if (host === 'x.com' || host.endsWith('twitter.com')) return segments.length === 1 && !['home', 'search', 'explore', 'intent', 'i'].includes(first);
      if (host.endsWith('threads.net')) return segments.length === 1 && first.startsWith('@');
      if (host.endsWith('linkedin.com')) return first === 'company' && segments.length === 2;
      if (host.endsWith('pinterest.com')) return segments.length === 1 && !['search', 'pin', 'ideas'].includes(first);
      if (host.endsWith('xiaohongshu.com')) return first === 'user' && segments[1] === 'profile';
      if (host.endsWith('weibo.com')) return first === 'u' || segments.length === 1;
      if (host.endsWith('douyin.com')) return first === 'user' && segments.length >= 2;
      return false;
    } catch {
      return false;
    }
  });

  // Real Dynamic Location State
  const [currentLocation, setCurrentLocation] = useState<LocationDetails>(DEFAULT_LOCATION);
  const [nearbyStores, setNearbyStores] = useState<StoreLocation[]>(() =>
    generateNearbyStoresForLocation(DEFAULT_LOCATION)
  );
  const [selectedStoreId, setSelectedStoreId] = useState<string>(
    nearbyStores[0]?.id || 'store-nearby-1'
  );
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);

  // Community Reviews State
  const [reviews, setReviews] = useState<CustomerReview[]>(INITIAL_REVIEWS);

  // Modals
  const [isAIReviewModalOpen, setIsAIReviewModalOpen] = useState(false);
  const [aiReviewInitialPlatform] = useState('Google');
  
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false);

  // Active Scroll Section
  const [activeSection, setActiveSection] = useState<string>('section-socials');
  
  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const activeBrandIdRef = useRef(currentBrand.id);
  const activeLocationResearchRef = useRef('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const hasMapsBackedStore = useCallback((brand: BrandConfig) =>
    brand.generationMode === 'web-grounded'
    && brand.stores.some((store) => /(?:google\.com\/maps|maps\.google\.com)/i.test(store.sourceUrl || '')),
  []);

  const locationChangedSinceResearch = useCallback((brand: BrandConfig, loc: LocationDetails) => {
    if (!brand.researchLocation) return true;
    const latDeltaKm = Math.abs(brand.researchLocation.latitude - loc.latitude) * 111;
    const lonDeltaKm = Math.abs(brand.researchLocation.longitude - loc.longitude)
      * 111 * Math.cos(loc.latitude * Math.PI / 180);
    return Math.hypot(latDeltaKm, lonDeltaKm) > 25;
  }, []);

  const researchBrandNearLocation = useCallback(async (brand: BrandConfig, loc: LocationDetails) => {
    const requestKey = `${brand.id}:${loc.latitude.toFixed(3)}:${loc.longitude.toFixed(3)}`;
    if (activeLocationResearchRef.current === requestKey) return;
    activeLocationResearchRef.current = requestKey;
    setNearbyStores([]);
    setSelectedStoreId('');
    showToast(isZh
      ? `📍 正在按当前位置查找最近的 ${brand.nameZh || brand.name} 门店…`
      : `📍 Finding the nearest ${brand.name} location…`);

    try {
      const response = await fetch('/api/workflow/generate-restaurant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: brand.name,
          cuisineType: brand.cuisineType || 'Restaurant',
          city: loc.fullAddress || `${loc.district}, ${loc.city}`,
          language,
          userLatitude: loc.latitude,
          userLongitude: loc.longitude,
          existingBrandId: brand.id,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload?.brand) throw new Error(payload?.error || 'Nearby store research failed');

      const refreshedBrand: BrandConfig = {
        ...payload.brand,
        id: brand.id,
        researchLocation: { latitude: loc.latitude, longitude: loc.longitude },
      };
      setAvailableBrands((prev) => [
        refreshedBrand,
        ...prev.filter((item) => item.id !== brand.id),
      ]);
      if (activeBrandIdRef.current !== brand.id) return;
      setCurrentBrand(refreshedBrand);
      const sortedStores = sortStoresByDistance(refreshedBrand.stores || [], loc);
      setNearbyStores(sortedStores);
      setSelectedStoreId(sortedStores[0]?.id || '');
      showToast(sortedStores.length > 0
        ? (isZh
          ? `✅ 已找到最近门店：${sortedStores[0].distance}`
          : `✅ Nearest location found: ${sortedStores[0].distance}`)
        : (isZh
          ? '当前定位附近暂未找到可核验门店'
          : 'No verifiable nearby location was found'));
    } catch (error) {
      console.error('Nearby restaurant research error:', error);
      if (activeBrandIdRef.current === brand.id) {
        setNearbyStores([]);
        setSelectedStoreId('');
        showToast(isZh
          ? '无法核验附近门店，已隐藏旧的远距离演示地址'
          : 'Nearby locations could not be verified; the stale demo address was hidden');
      }
    } finally {
      if (activeLocationResearchRef.current === requestKey) activeLocationResearchRef.current = '';
    }
  }, [isZh, language]);

  // Fetch registered server-side custom brands on mount
  useEffect(() => {
    fetch('/api/brands')
      .then((res) => res.json())
      .then((serverBrands) => {
        if (Array.isArray(serverBrands) && serverBrands.length > 0) {
          setAvailableBrands((prev) => {
            const incomingById = new Map(
              serverBrands.map((brand: BrandConfig) => [brand.id, brand] as const),
            );
            const existingIds = new Set(prev.map((brand) => brand.id));
            const refreshedExisting = prev.map((brand) => incomingById.get(brand.id) || brand);
            const newlyGenerated = serverBrands.filter((brand: BrandConfig) => !existingIds.has(brand.id));
            return [...refreshedExisting, ...newlyGenerated];
          });
        }
      })
      .catch(() => {});
  }, []);

  // Handle Brand Switching
  const handleSelectBrand = (newBrand: BrandConfig) => {
    activeBrandIdRef.current = newBrand.id;
    setCurrentBrand(newBrand);
    if (newBrand.stores && newBrand.stores.length > 0) {
      const sortedStores = sortStoresByDistance(newBrand.stores, currentLocation);
      const shouldResearchCurrentArea = newBrand.id !== 'starbucks'
        && (!hasMapsBackedStore(newBrand) || locationChangedSinceResearch(newBrand, currentLocation));
      if (shouldResearchCurrentArea) {
        void researchBrandNearLocation(newBrand, currentLocation);
        return;
      }
      setNearbyStores(sortedStores);
      setSelectedStoreId(sortedStores[0]?.id || newBrand.stores[0].id);
    } else {
      // Never substitute made-up Starbucks branches for a custom restaurant.
      setNearbyStores([]);
      setSelectedStoreId('');
    }
    showToast(
      isZh 
        ? `✨ 已切换至：${newBrand.nameZh || newBrand.name}` 
        : `✨ Switched to ${newBrand.name}`
    );
  };

  // Handle dynamically generated brand from AI Workflow
  const handleAddGeneratedBrand = (newBrand: BrandConfig) => {
    const locatedBrand = {
      ...newBrand,
      researchLocation: { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
    };
    setAvailableBrands((prev) => [locatedBrand, ...prev.filter((b) => b.id !== locatedBrand.id)]);
    handleSelectBrand(locatedBrand);
    showToast(
      isZh
        ? `🚀 AI 流水线已成功生成并上线：${newBrand.nameZh || newBrand.name}！`
        : `🚀 AI Pipeline deployed ${newBrand.name} live!`
    );
  };

  // Update stores when location changes
  const applyLocationUpdate = useCallback((newLoc: LocationDetails) => {
    setCurrentLocation(newLoc);
    if (currentBrand.id === 'starbucks') {
      const newStores = generateNearbyStoresForLocation(newLoc);
      setNearbyStores(newStores);
      if (newStores.length > 0) {
        setSelectedStoreId(newStores[0].id);
      }
    } else if (currentBrand.stores?.length) {
      const sortedStores = sortStoresByDistance(currentBrand.stores, newLoc);
      if (!hasMapsBackedStore(currentBrand) || locationChangedSinceResearch(currentBrand, newLoc)) {
        void researchBrandNearLocation(currentBrand, newLoc);
        return;
      }
      setNearbyStores(sortedStores);
      setSelectedStoreId(sortedStores[0]?.id || '');
    }
  }, [currentBrand, hasMapsBackedStore, locationChangedSinceResearch, researchBrandNearLocation]);

  // GPS Geolocation trigger
  const handleTriggerGPS = useCallback((silent = false) => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const loc = await reverseGeocodeCoords(latitude, longitude);
            applyLocationUpdate(loc);
            setIsLocating(false);
            if (!silent) {
              showToast(isZh ? `📍 GPS 已定位到：${loc.districtZh || loc.cityZh}` : `📍 GPS Located: ${loc.district || loc.city}`);
            }
          } catch (err) {
            console.log('Reverse geocode error:', err);
            const fallbackLoc: LocationDetails = {
              latitude,
              longitude,
              city: 'Current Area',
              district: 'Nearby Metro Center',
              road: 'Central Way',
              fullAddress: 'Your Current GPS Coordinates',
              cityZh: '当前区域',
              districtZh: '就近商圈',
              roadZh: '主干道',
              fullAddressZh: '您当前的实时地理位置',
              country: 'CN'
            };
            applyLocationUpdate(fallbackLoc);
            setIsLocating(false);
            if (!silent) {
              showToast(isZh ? '📍 实时 GPS 坐标已更新' : '📍 GPS coordinates updated');
            }
          }
        },
        async () => {
          // IP fallback if browser denies GPS
          try {
            const ipRes = await fetch('https://ipapi.co/json/');
            if (ipRes.ok) {
              const ipData = await ipRes.json();
              if (ipData.latitude && ipData.longitude) {
                const loc = await reverseGeocodeCoords(ipData.latitude, ipData.longitude);
                applyLocationUpdate(loc);
                setIsLocating(false);
                return;
              }
            }
          } catch (e) {
            // Keep default
          }
          setIsLocating(false);
          if (!silent) {
            showToast(isZh ? '无法获取GPS，已使用推荐商圈定位' : 'Using default metropolitan location');
          }
        },
        { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 }
      );
    } else {
      setIsLocating(false);
    }
  }, [applyLocationUpdate, isZh]);

  // Initial GPS detection on load
  useEffect(() => {
    handleTriggerGPS(true);
  }, []);

  // Fetch Reviews on mount
  useEffect(() => {
    fetch(`/api/reviews?brand=${encodeURIComponent(currentBrand.id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setReviews(data);
        }
      })
      .catch((err) => console.log('Fetch reviews fallback to initial:', err));
  }, [currentBrand.id]);

  // Smooth scroll to section
  const handleScrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Like Review Handler
  const handleLikeReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, likes: r.likes + 1 } : r))
    );
    fetch(`/api/reviews/${reviewId}/like`, { method: 'POST' }).catch(() => {});
  };

  const displayStores = useMemo(() => nearbyStores.map((store) => {
    const localized = displayBrand.stores.find((candidate) => candidate.id === store.id);
    if (!localized) return store;
    return {
      ...store,
      name: localized.name,
      nameZh: localized.nameZh,
      type: localized.type,
      address: localized.address,
      addressZh: localized.addressZh,
      hours: localized.hours,
      hoursZh: localized.hoursZh,
      features: localized.features,
      featuresZh: localized.featuresZh,
    };
  }), [displayBrand.stores, nearbyStores]);

  const currentStore =
    displayStores.find((s) => s.id === selectedStoreId) || displayStores[0] || displayBrand.stores[0];
  const footerUi = ({
    en: { hub: 'Official Digital Hub', top: 'Back to Top' },
    zh: { hub: '官方数字化系统', top: '回到顶部' },
    'zh-TW': { hub: '官方數位平台', top: '回到頂端' },
    ja: { hub: '公式デジタルハブ', top: 'ページ上部へ' },
    ko: { hub: '공식 디지털 허브', top: '맨 위로' },
    es: { hub: 'Centro digital oficial', top: 'Volver arriba' },
    fr: { hub: 'Espace numérique officiel', top: 'Haut de page' },
    de: { hub: 'Offizieller Digital-Hub', top: 'Nach oben' },
  } as Record<Language, { hub: string; top: string }>)[language];

  return (
    <div 
      className={`brand-shell min-h-screen text-neutral-900 flex flex-col antialiased transition-colors duration-500 ${layoutClassName(brandStyle.layoutMode)}`}
      data-brand-canvas
      data-visual-style={brandStyle.visualStyle}
      data-card-shape={brandStyle.cardShape}
      data-pattern={brandStyle.patternStyle}
      style={brandThemeStyle(displayBrand, brandStyle)}
    >
      <div className="brand-atmosphere" aria-hidden="true">
        {Array.from({ length: 14 }, (_, index) => (
          <span key={index}>{brandStyle.motifs[index % brandStyle.motifs.length]}</span>
        ))}
      </div>
      
      {/* Header with Multi-Tenant Switcher, Brand Hero and Navigation */}
      <Header
        brand={displayBrand}
        availableBrands={availableBrands}
        onSelectBrand={handleSelectBrand}
        onOpenAIWorkflow={() => setIsAIWorkflowOpen(true)}
        language={language}
        onSelectLanguage={setLanguage}
        onOpenShare={() => setIsQRCodeOpen(true)}
        activeSection={activeSection}
        onScrollToSection={handleScrollToSection}
        nearestStore={displayStores[0]}
        styleProfile={brandStyle}
      />

      {/* Main Content Area: Strictly Ordered into 4 Sections */}
      <main className="brand-content-grid flex-1 max-w-6xl w-full mx-auto px-3.5 sm:px-5 py-7">
        
        {/* SECTION 1: Social Media Matrix (社交媒体) */}
        <div className="brand-grid-social brand-section-wrap">
          <SocialsSection
            socials={directSocialProfiles}
            language={language}
            onShowToast={showToast}
            researchProvider={displayBrand.researchProvider}
            sourceCount={displayBrand.sources?.length || 0}
          />
        </div>

        {/* SECTION 2: Customer Reviews & AI Ratings (用户评价) */}
        <div className="brand-grid-reviews brand-section-wrap">
          <RateUsSection
            reviews={reviews}
            stores={displayStores}
            language={language}
            brand={displayBrand}
            onLikeReview={handleLikeReview}
            onShowToast={showToast}
          />
        </div>

        {/* SECTION 3: Official Menu & Stores (精选菜单与门店) */}
        <div className="brand-grid-menu brand-section-wrap">
          <MenuDisplaySection
            stores={displayStores}
            selectedStoreId={selectedStoreId}
            onSelectStore={setSelectedStoreId}
            menu={displayBrand.menu}
            language={language}
            currentLocation={currentLocation}
            onOpenLocationModal={() => setIsLocationModalOpen(true)}
            onTriggerGPS={() => handleTriggerGPS(false)}
            isLocating={isLocating}
            onShowToast={showToast}
            brandId={displayBrand.id}
            brandPrimaryColor={displayBrand.primaryColor}
          />
        </div>

        {/* SECTION 4: Contact & Hotline (联系方式) */}
        <div className="brand-grid-contact brand-section-wrap">
          <ContactHotlineSection
            brand={displayBrand}
            stores={displayStores}
            language={language}
            onOpenConciergeModal={() => setIsConciergeOpen(true)}
            onShowToast={showToast}
          />
        </div>

      </main>

      {/* Footer */}
      <footer 
        className="text-white text-xs py-8 px-4 border-t border-neutral-800 mt-10"
        style={{ backgroundColor: '#171717' }}
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 font-bold text-white text-sm mb-1">
              <span className="text-base">✨</span>
              <span>{isZh ? displayBrand.nameZh : displayBrand.name}</span>
              <span 
                className="text-[10px] text-white px-2 py-0.5 rounded-full font-bold shadow-xs"
                style={{ backgroundColor: displayBrand.primaryColor }}
              >
                {footerUi.hub}
              </span>
            </div>
            <p className="text-neutral-400 text-xs">
              {isZh 
                ? `${displayBrand.nameZh} · ${displayBrand.taglineZh}` 
                : `${displayBrand.name} • ${displayBrand.tagline}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAIWorkflowOpen(true)}
              className="bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer text-xs font-bold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.customRestaurant}</span>
            </button>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 p-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer text-xs border border-neutral-700"
            >
              <ArrowUp className="w-4 h-4" />
              <span>{footerUi.top}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* AI Workflow Generator Modal */}
      <AIWorkflowModal
        isOpen={isAIWorkflowOpen}
        onClose={() => setIsAIWorkflowOpen(false)}
        onSelectBrand={handleAddGeneratedBrand}
        language={language}
        currentBrand={currentBrand}
        availableBrands={availableBrands}
        currentLocation={currentLocation}
      />

      {/* Location Selector Modal */}
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={currentLocation}
        onSelectLocation={applyLocationUpdate}
        onTriggerGPS={() => handleTriggerGPS(false)}
        isLocating={isLocating}
        language={language}
        onShowToast={showToast}
      />

      {/* Modals */}
      {isAIReviewModalOpen && (
        <AIReviewModal
          isOpen={isAIReviewModalOpen}
          onClose={() => setIsAIReviewModalOpen(false)}
          storeName={isZh ? currentStore.nameZh : currentStore.name}
          initialPlatform={aiReviewInitialPlatform}
          language={language}
          onShowToast={showToast}
          onReviewCopied={() => {}}
        />
      )}

      {isConciergeOpen && (
        <ConciergeInquiryModal
          isOpen={isConciergeOpen}
          onClose={() => setIsConciergeOpen(false)}
          brandName={isZh ? displayBrand.nameZh : displayBrand.name}
          hotline={displayBrand.hotline}
          language={language}
          onShowToast={showToast}
        />
      )}

      {isQRCodeOpen && (
        <QRCodeModal
          isOpen={isQRCodeOpen}
          onClose={() => setIsQRCodeOpen(false)}
          brand={displayBrand}
          language={language}
          onShowToast={showToast}
        />
      )}

      {toastMessage && <ToastNotification message={toastMessage} />}
    </div>
  );
}

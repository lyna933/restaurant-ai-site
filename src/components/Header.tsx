import React, { useState, useRef, useEffect } from 'react';
import { BrandConfig, BrandStyleProfile, Language, StoreLocation } from '../types';
import { TRANSLATIONS, LANGUAGE_OPTIONS } from '../utils/translations';
import { 
  CheckCircle2, 
  Share2, 
  Globe, 
  Star, 
  Phone, 
  Store,
  UtensilsCrossed, 
  MessageSquareHeart,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  brand: BrandConfig;
  availableBrands: BrandConfig[];
  onSelectBrand: (b: BrandConfig) => void;
  onOpenAIWorkflow: () => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  onOpenShare: () => void;
  activeSection: string;
  onScrollToSection: (sectionId: string) => void;
  nearestStore?: StoreLocation;
  styleProfile: BrandStyleProfile;
}

export const Header: React.FC<HeaderProps> = ({
  brand,
  availableBrands,
  onSelectBrand,
  onOpenAIWorkflow,
  language,
  onSelectLanguage,
  onOpenShare,
  activeSection,
  onScrollToSection,
  nearestStore,
  styleProfile,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isZh = language === 'zh' || language === 'zh-TW';
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const verifiedRating = brand.stores.find((store) => Number(store.rating) > 0)?.rating;
  const langRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);

  const currentLangObj = LANGUAGE_OPTIONS.find((l) => l.code === language) || LANGUAGE_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
      if (brandRef.current && !brandRef.current.contains(e.target as Node)) {
        setIsBrandDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header id="brand-header" className="w-full relative z-20">
      
      {/* Top Banner with Multi-Brand Switcher / Language Dropdown / AI Workflow trigger */}
      <div className="brand-toolbar bg-neutral-950 text-neutral-200 text-xs py-1.5 px-4 shadow-xs border-b border-neutral-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          
          {/* Brand Switcher & AI Generator Trigger */}
          <div className="flex items-center gap-2">
            
            {/* Brand Dropdown */}
            <div className="relative" ref={brandRef}>
              <button
                id="header-brand-switcher"
                onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-white transition-all cursor-pointer shadow-xs border border-white/20"
                style={{ backgroundColor: brand.primaryColor || '#006241' }}
              >
                <span>{isZh ? brand.nameZh : brand.name}</span>
                <ChevronDown className="w-3 h-3 text-white/80" />
              </button>

              {isBrandDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-60 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-800 mb-1">
                    {isZh ? '已加载餐馆品牌' : 'Available Restaurant Hubs'}
                  </div>
                  {availableBrands.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        onSelectBrand(b);
                        setIsBrandDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-neutral-800 transition-colors cursor-pointer ${
                        brand.id === b.id ? 'text-amber-400 font-bold bg-neutral-800/80' : 'text-neutral-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: b.primaryColor }}
                        />
                        <span className="truncate">{isZh ? b.nameZh : b.name}</span>
                      </div>
                      {brand.id === b.id && <span className="text-[10px] text-amber-400">✓</span>}
                    </button>
                  ))}

                  <div className="pt-1.5 mt-1 border-t border-neutral-800 px-2">
                    <button
                      onClick={() => {
                        setIsBrandDropdownOpen(false);
                        onOpenAIWorkflow();
                      }}
                      className="w-full py-1.5 px-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <span>⚡ {isZh ? 'AI 生成新餐馆' : '+ AI Generate New'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* AI Generator Top Pill */}
            <button
              onClick={onOpenAIWorkflow}
              className="hidden sm:flex items-center gap-1 bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 text-amber-300 text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors cursor-pointer"
            >
              <span>⚡ {t.customRestaurant}</span>
            </button>
          </div>

          {/* Action buttons: Lang Switch Dropdown & Share QR */}
          <div className="flex items-center gap-2">
            
            {/* Language Selector Dropdown */}
            <div className="relative" ref={langRef}>
              <button
                id="header-lang-toggle"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-700 transition-colors text-xs font-medium cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentLangObj.flag} {currentLangObj.label}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-1.5 w-40 bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.code}
                      onClick={() => {
                        onSelectLanguage(opt.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-neutral-800 transition-colors cursor-pointer ${
                        language === opt.code ? 'text-amber-400 font-bold bg-neutral-800/60' : 'text-neutral-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{opt.flag}</span>
                        <span>{opt.label}</span>
                      </span>
                      {language === opt.code && <span className="text-[10px]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              id="header-share-btn"
              onClick={onOpenShare}
              className="flex items-center gap-1 text-white px-2.5 py-1 rounded-lg transition-all text-xs font-bold cursor-pointer opacity-90 hover:opacity-100"
              style={{ backgroundColor: brand.primaryColor || '#006241' }}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isZh ? '分享' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Profile Hero Card with Dynamic Brand Gradient */}
      <div 
        className="brand-hero relative text-white px-4 shadow-md transition-all duration-500 overflow-hidden"
        style={{ backgroundColor: 'transparent' }}
      >
        <div className="brand-hero-pattern" aria-hidden="true">
          {Array.from({ length: 12 }, (_, index) => (
            <span key={index}>{styleProfile.motifs[index % styleProfile.motifs.length]}</span>
          ))}
        </div>
        <div className="brand-hero-inner max-w-6xl mx-auto flex flex-col relative z-10">
          
          {/* Logo Avatar */}
          <div className="brand-logo-lockup relative mb-3 group">
            <div className="brand-logo-frame w-20 h-20 sm:w-24 sm:h-24 border-2 border-white/95 shadow-xl overflow-hidden bg-white flex items-center justify-center p-1">
              {brand.logo ? (
                <img
                  src={brand.logo}
                alt={isZh ? brand.nameZh : brand.name}
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-xl font-black" style={{ color: brand.primaryColor }}>
                  {(isZh ? brand.nameZh : brand.name).trim().slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>
            {brand.verifiedBadge && (
              <div 
                className="absolute bottom-0 right-0 p-0.5 rounded-full border-2 border-white shadow-md"
                style={{ backgroundColor: brand.primaryColor }}
                title={isZh ? '官方已核验' : 'Verified Official'}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>

          {/* Brand Name & Tagline */}
          <div className="brand-title-lockup flex flex-col gap-1 justify-center max-w-2xl">
            <h1 className="brand-display-title text-3xl sm:text-5xl font-black tracking-tight text-white">
              {isZh ? brand.nameZh : brand.name}
            </h1>
            <p className="brand-tagline text-sm sm:text-base text-white/85 line-clamp-2">
              {isZh ? brand.taglineZh : brand.tagline}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="brand-metrics mt-4 flex items-center gap-3 sm:gap-4 text-xs text-white/90 bg-black/35 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span className="font-bold text-white">{verifiedRating || '--'}</span>
            </div>
            <span className="text-white/30">•</span>
            <div className="flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-amber-300" />
              <span>{brand.stores.length} {isZh ? '家门店' : 'Stores'}</span>
            </div>
            <span className="text-white/30">•</span>
            <div className="flex items-center gap-1 text-[11px] text-amber-300 font-medium">
              <span>{(isZh ? brand.cuisineTypeZh : brand.cuisineType) || (brand.verifiedBadge ? (isZh ? '已核验' : 'Verified') : (isZh ? '未查证' : 'Unverified'))}</span>
            </div>
          </div>

          {nearestStore && (
            <div className="brand-nearest-store mt-2 flex max-w-2xl items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-[11px] text-white/85">
              <span className="font-bold text-amber-300">{/(?:km|mi)$/i.test(nearestStore.distance || '') ? nearestStore.distance : '-- km'}</span>
              <span>{nearestStore.locationScope === 'global'
                ? (isZh ? '全球已核验门店' : 'verified global location')
                : t.fromLocation}</span>
              <span className="text-white/35">•</span>
              <span className="max-w-[280px] truncate">{isZh ? nearestStore.addressZh : nearestStore.address}</span>
            </div>
          )}

          {/* Navigation Anchors: 1. Socials, 2. Reviews, 3. Order, 4. Contact */}
          <nav aria-label={isZh ? '页面导航' : 'Sections'} className="brand-section-nav mt-4 w-full flex items-center justify-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            
            <button
              id="nav-socials"
              onClick={() => onScrollToSection('section-socials')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap ${
                activeSection === 'section-socials'
                  ? 'bg-white text-neutral-900 shadow-md ring-2 ring-white/50'
                  : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>1. {t.navSocials}</span>
            </button>

            <button
              id="nav-rate"
              onClick={() => onScrollToSection('section-reviews')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap ${
                activeSection === 'section-reviews'
                  ? 'bg-white text-neutral-900 shadow-md ring-2 ring-white/50'
                  : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
              }`}
            >
              <MessageSquareHeart className="w-4 h-4" />
              <span>2. {t.navReviews}</span>
            </button>

            <button
              id="nav-order"
              onClick={() => onScrollToSection('section-menu')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap ${
                activeSection === 'section-menu'
                  ? 'bg-white text-neutral-900 shadow-md ring-2 ring-white/50'
                  : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>3. {t.navOrder}</span>
            </button>

            <button
              id="nav-contact"
              onClick={() => onScrollToSection('section-contact')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap ${
                activeSection === 'section-contact'
                  ? 'bg-white text-neutral-900 shadow-md ring-2 ring-white/50'
                  : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>4. {t.navContact}</span>
            </button>

          </nav>

        </div>
      </div>

    </header>
  );
};

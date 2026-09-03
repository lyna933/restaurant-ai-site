import React, { useState, useMemo } from 'react';
import { StoreLocation, MenuItem, Language } from '../types';
import { LocationDetails } from '../utils/locationService';
import { TRANSLATIONS } from '../utils/translations';
import { 
  Search, 
  Navigation, 
  RefreshCw, 
  ChevronRight, 
  MapPin, 
  Flame, 
  Sparkles, 
  Info,
  Clock,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface MenuDisplaySectionProps {
  stores: StoreLocation[];
  selectedStoreId: string;
  onSelectStore: (id: string) => void;
  menu: MenuItem[];
  language: Language;
  currentLocation: LocationDetails;
  onOpenLocationModal: () => void;
  onTriggerGPS: () => void;
  isLocating: boolean;
  onShowToast: (msg: string) => void;
  brandId?: string;
  brandPrimaryColor?: string;
}

export const MenuDisplaySection: React.FC<MenuDisplaySectionProps> = ({
  stores,
  selectedStoreId,
  onSelectStore,
  menu,
  language,
  currentLocation,
  onOpenLocationModal,
  onTriggerGPS,
  isLocating,
  onShowToast,
  brandPrimaryColor = '#006241'
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isZh = language === 'zh' || language === 'zh-TW';

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isStoreModalOpen, setIsStoreModalOpen] = useState<boolean>(false);
  const [selectedItemDetail, setSelectedItemDetail] = useState<MenuItem | null>(null);

  const formatPrice = (item: MenuItem) => {
    if (item.price <= 0) return isZh ? '价格未查证' : 'Price unverified';
    const currency = item.currency || 'USD';
    try {
      return new Intl.NumberFormat(isZh ? 'zh-CN' : 'en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
      }).format(item.price);
    } catch {
      return `${currency} ${item.price.toFixed(2)}`;
    }
  };
  const formatCalories = (value: string) => isZh
    ? value.replace(/\s*(?:kcal|calories?|cal)\b/gi, ' 千卡')
    : value;

  // Current active store object
  const currentStore = useMemo(() => {
    return stores.find((s) => s.id === selectedStoreId) || stores[0] || {
      id: 'default-1',
      name: 'No verified store found',
      nameZh: '暂未找到已核验门店',
      address: 'Enable web research and regenerate',
      addressZh: '请启用全网检索后重新生成',
      distance: '--',
      phone: '',
      hours: 'Not verified',
      hoursZh: '未查证'
    };
  }, [stores, selectedStoreId]);

  // Categories in pure English or pure Chinese
  const categories = useMemo(() => {
    const map = new Map<string, { en: string; zh: string }>();
    menu.forEach((item) => {
      if (!map.has(item.category)) {
        map.set(item.category, {
          en: item.category,
          zh: item.categoryZh || item.category
        });
      }
    });
    const result: { id: string; label: string }[] = [
      { id: 'all', label: t.allCategory }
    ];
    map.forEach((val, key) => {
      result.push({
        id: key,
        label: isZh ? val.zh : val.en
      });
    });
    return result;
  }, [menu, isZh, t.allCategory]);

  // Filtered menu based on search and category
  const filteredMenu = useMemo(() => {
    return menu.filter((item) => {
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        (item.nameZh && item.nameZh.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.descriptionZh && item.descriptionZh.toLowerCase().includes(query));
      return matchCategory && matchQuery;
    });
  }, [menu, selectedCategory, searchQuery]);

  return (
    <section id="section-menu" className="scroll-mt-16 space-y-4">
      {/* Section Header */}
      <div className="brand-section-heading flex items-center justify-between mb-1">
        <div className="flex items-center gap-2.5">
          <span 
            className="w-8 h-8 rounded-xl text-white flex items-center justify-center font-bold text-sm shadow-xs transition-colors"
            style={{ backgroundColor: brandPrimaryColor }}
          >
            03
          </span>
          <div>
            <h2 className="text-xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <span>{t.orderTitle}</span>
              <span className="text-[11px] font-semibold text-neutral-500 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-full">
                {menu.length} {t.itemCountLabel}
              </span>
            </h2>
          </div>
        </div>

        {/* Real-time Location Indicator Badge */}
        <button
          type="button"
          onClick={onOpenLocationModal}
          className="flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-800 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <MapPin className="w-3.5 h-3.5" style={{ color: brandPrimaryColor }} />
          <span className="max-w-[120px] sm:max-w-[180px] truncate">
            {isZh ? (currentLocation.districtZh || currentLocation.cityZh) : (currentLocation.district || currentLocation.city)}
          </span>
          <span className="text-[10px] text-neutral-500 underline ml-0.5">{t.changeLocation}</span>
        </button>
      </div>

      {/* --- STORE LOCATION CARD --- */}
      <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
          
          {/* Store Info & Click to switch */}
          <div 
            onClick={() => setIsStoreModalOpen(true)}
            className="flex items-start gap-3 cursor-pointer group flex-1"
          >
            <div 
              className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs transition-colors"
              style={{ backgroundColor: brandPrimaryColor }}
            >
              🏬
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h3 className="font-bold text-sm sm:text-base text-neutral-900 group-hover:text-neutral-600 transition-colors flex items-center gap-1">
                  <span>{isZh ? currentStore.nameZh : currentStore.name}</span>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </h3>
              </div>
              <p className="text-xs text-neutral-500 flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1 font-semibold" style={{ color: brandPrimaryColor }}>
                  <Navigation className="w-3 h-3" />
                  {currentStore.distance || '0.2 km'}
                </span>
                <span>•</span>
                <span className="truncate max-w-[200px] sm:max-w-md">{isZh ? currentStore.addressZh : currentStore.address}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsStoreModalOpen(true)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 transition-colors cursor-pointer"
            >
              {isZh ? '查看全部门店' : 'All Stores'} ({stores.length})
            </button>
          </div>
        </div>

        {/* Store Live Status Notice */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 text-xs text-neutral-600">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[11px] border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t.openStatus} ({isZh ? currentStore.hoursZh : currentStore.hours})
            </span>
            {currentStore.phone && (
              <span className="text-[11px] text-neutral-500 font-mono">
                📞 {currentStore.phone}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onTriggerGPS}
            disabled={isLocating}
            className="text-[11px] font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer border bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200"
          >
            <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? t.detectingLocation : t.refreshGps}</span>
          </button>
        </div>
      </div>

      {/* --- SEARCH & CATEGORY SELECTOR --- */}
      <div className="space-y-2.5">
        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-white border border-neutral-200 rounded-xl pl-9.5 pr-4 py-2.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-400 focus:border-transparent transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'text-white shadow-xs'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300'
                }`}
                style={{
                  backgroundColor: active ? brandPrimaryColor : undefined
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- MENU PRODUCTS GRID (Pure Menu Showcase) --- */}
      {filteredMenu.length === 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center text-sm text-amber-900 md:col-span-2">
          {isZh ? '暂未找到有可验证来源的菜单。启用全网检索后重新生成。' : 'No menu with verifiable sources was found. Enable web research and regenerate.'}
        </div>
      )}
      <div className="menu-product-grid grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredMenu.map((item) => {
          return (
            <div
              key={item.id}
              onClick={() => setSelectedItemDetail(item)}
              className="menu-product-card bg-white rounded-2xl p-3.5 border border-neutral-200 shadow-xs hover:border-neutral-300 hover:shadow-md transition-all flex gap-3.5 group cursor-pointer"
            >
              {/* Product Thumbnail */}
              <div className="menu-product-image relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-neutral-100 px-2 text-center text-xs font-bold text-neutral-400">
                    {isZh ? item.nameZh : item.name}
                  </div>
                )}
                {item.popular && (
                  <span className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                    <Flame className="w-2.5 h-2.5" />
                    {isZh ? '人气' : 'HOT'}
                  </span>
                )}
              </div>

              {/* Product Info & Specifications Preview */}
              <div className="menu-product-copy flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-bold text-neutral-900 text-sm sm:text-base leading-tight group-hover:text-neutral-700 transition-colors">
                      {isZh ? item.nameZh : item.name}
                    </h4>
                  </div>

                  <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                    {isZh ? item.descriptionZh : item.description}
                  </p>
                  {item.sourceUrl && (
                    <a href={item.sourceUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 hover:underline">
                      <ExternalLink className="h-3 w-3" /> {isZh ? '菜单来源' : 'Menu source'}
                    </a>
                  )}

                  {/* Tags / Modifiers pill */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(isZh ? (item.tagsZh || item.tags) : item.tags)?.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                    {item.calories && (
                      <span className="text-[10px] bg-neutral-50 text-neutral-400 px-1.5 py-0.5 rounded">
                    {formatCalories(item.calories)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price & View Detail Indicator */}
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-neutral-100">
                  <span className="font-black text-sm sm:text-base text-neutral-900 font-mono">
                    {formatPrice(item)}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItemDetail(item);
                    }}
                    className="text-neutral-600 hover:text-neutral-900 text-xs font-bold px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>{isZh ? '查看详情与配方' : 'Details'}</span>
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Item Detail Modal */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 max-h-[90vh] flex flex-col"
          >
            {/* Header image */}
            <div className="relative h-48 sm:h-56 w-full bg-neutral-100">
              <img
                src={selectedItemDetail.image}
                alt={selectedItemDetail.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setSelectedItemDetail(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
              >
                ✕
              </button>
              {selectedItemDetail.popular && (
                <span className="absolute bottom-3 left-3 bg-amber-500 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  {isZh ? '人气推荐 / 明星单品' : 'Popular Signature'}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto space-y-4">
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-lg sm:text-xl font-black text-neutral-900">
                    {isZh ? selectedItemDetail.nameZh : selectedItemDetail.name}
                  </h3>
                  <span className="text-lg font-mono font-black" style={{ color: brandPrimaryColor }}>
                    {formatPrice(selectedItemDetail)}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  {isZh ? selectedItemDetail.descriptionZh : selectedItemDetail.description}
                </p>
              </div>

              {/* Tags & Calories */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(isZh ? (selectedItemDetail.tagsZh || selectedItemDetail.tags) : selectedItemDetail.tags)?.map((tag, idx) => (
                  <span key={idx} className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded-md font-medium">
                    ✨ {tag}
                  </span>
                ))}
                {selectedItemDetail.calories && (
                  <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-1 rounded-md font-medium">
                    🔥 {selectedItemDetail.calories}
                  </span>
                )}
              </div>

              {/* Options / Craft Ingredients */}
              {selectedItemDetail.options && (
                <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-2.5 text-xs">
                  <div className="font-bold text-neutral-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" style={{ color: brandPrimaryColor }} />
                    <span>{isZh ? '官方标准配方与可选规格' : 'Craft Options & Formula'}</span>
                  </div>

                  {selectedItemDetail.options.sizes && (
                    <div>
                      <span className="text-neutral-500 block mb-1">{isZh ? '杯型容量：' : 'Sizes:'}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedItemDetail.options.sizes.map((s, idx) => (
                          <span key={idx} className="bg-white border border-neutral-200 px-2 py-1 rounded text-neutral-800">
                            {s.name} {s.extraPrice > 0 ? `(+$${s.extraPrice})` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedItemDetail.options.sweetness && (
                    <div>
                      <span className="text-neutral-500 block mb-1">{isZh ? '甜度选项：' : 'Sweetness:'}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedItemDetail.options.sweetness.map((s, idx) => (
                          <span key={idx} className="bg-white border border-neutral-200 px-2 py-1 rounded text-neutral-800">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedItemDetail.options.iceLevels && (
                    <div>
                      <span className="text-neutral-500 block mb-1">{isZh ? '温度/冰度：' : 'Ice / Temp:'}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedItemDetail.options.iceLevels.map((ice, idx) => (
                          <span key={idx} className="bg-white border border-neutral-200 px-2 py-1 rounded text-neutral-800">
                            {ice}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedItemDetail.options.toppings && (
                    <div>
                      <span className="text-neutral-500 block mb-1">{isZh ? '经典加料：' : 'Toppings:'}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedItemDetail.options.toppings.map((top, idx) => (
                          <span key={idx} className="bg-white border border-neutral-200 px-2 py-1 rounded text-neutral-800">
                            {isZh ? top.nameZh : top.name} (+${top.price})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer button */}
            <div className="bg-neutral-50 p-4 border-t border-neutral-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedItemDetail(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90 cursor-pointer shadow-xs"
                style={{ backgroundColor: brandPrimaryColor }}
              >
                {isZh ? '知道了' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Store Selection Modal */}
      {isStoreModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 max-h-[85vh] flex flex-col"
          >
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-neutral-900">
                  {isZh ? '选择就近门店' : 'Select Nearby Store'}
                </h3>
                <p className="text-xs text-neutral-500">
                  {isZh ? '查看具体门店地址、营业时间与距离' : 'View store locations, hours & distance'}
                </p>
              </div>
              <button
                onClick={() => setIsStoreModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {stores.map((st) => {
                const isSelected = st.id === selectedStoreId;
                return (
                  <div
                    key={st.id}
                    onClick={() => {
                      onSelectStore(st.id);
                      setIsStoreModalOpen(false);
                      onShowToast(isZh ? `已切换门店至：${st.nameZh || st.name}` : `Switched to ${st.name}`);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-50 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-400 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-neutral-900">
                          {isZh ? st.nameZh : st.name}
                        </h4>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">
                        📍 {isZh ? st.addressZh : st.address}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-neutral-500 mt-1.5">
                        <span className="font-semibold" style={{ color: brandPrimaryColor }}>
                          ↔ {st.distance || '-- km'} {st.locationScope === 'global'
                            ? (isZh ? '· 全球已核验门店' : '· verified global location')
                            : t.fromLocation}
                        </span>
                        <span>•</span>
                        <span>🕒 {isZh ? st.hoursZh : st.hours}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3.5 bg-neutral-50 border-t border-neutral-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsStoreModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer"
              >
                {isZh ? '关闭' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

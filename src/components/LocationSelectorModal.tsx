import React, { useState } from 'react';
import { Language } from '../types';
import { LocationDetails, POPULAR_LOCATIONS, reverseGeocodeCoords } from '../utils/locationService';
import { TRANSLATIONS } from '../utils/translations';
import { MapPin, Navigation, Search, Check, RefreshCw, X, Building2, Sparkles } from 'lucide-react';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LocationDetails;
  onSelectLocation: (loc: LocationDetails) => void;
  onTriggerGPS: () => void;
  isLocating: boolean;
  language: Language;
  onShowToast: (msg: string) => void;
}

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
  onTriggerGPS,
  isLocating,
  language,
  onShowToast
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isZh = language === 'zh' || language === 'zh-TW';

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.trim())}&limit=1&addressdetails=1`, {
        headers: { 'Accept-Language': isZh ? 'zh-CN,zh,en' : 'en' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const item = data[0];
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          const addr = item.address || {};
          const city = addr.city || addr.town || addr.county || addr.state || searchQuery.trim();
          const district = addr.suburb || addr.district || addr.neighbourhood || addr.city_district || searchQuery.trim();
          const road = addr.road || addr.pedestrian || addr.commercial || 'Central Ave';
          const full = [city, district, road].filter(Boolean).join(' ');

          const newLoc: LocationDetails = {
            latitude: lat,
            longitude: lon,
            city,
            district,
            road,
            fullAddress: full,
            cityZh: city,
            districtZh: district,
            roadZh: road,
            fullAddressZh: full,
            country: addr.country || 'CN'
          };

          onSelectLocation(newLoc);
          onClose();
          onShowToast(isZh ? `📍 已定位至：${district || city}` : `📍 Location updated to ${district || city}`);
          setIsSearching(false);
          return;
        }
      }
    } catch (err) {
      console.log('Search location error:', err);
    }

    // Fallback if network search is unavailable
    const q = searchQuery.trim();
    const mockLoc: LocationDetails = {
      latitude: 31.2304,
      longitude: 121.4737,
      city: q,
      district: `${q}中心商圈`,
      road: `${q}商业街`,
      fullAddress: `${q}中心区`,
      cityZh: q,
      districtZh: `${q}中心商圈`,
      roadZh: `${q}商业街`,
      fullAddressZh: `${q}中心区`,
      country: 'CN'
    };
    onSelectLocation(mockLoc);
    onClose();
    onShowToast(isZh ? `📍 已切换至：${q}` : `📍 Location set to ${q}`);
    setIsSearching(false);
  };

  const handlePickPreset = (p: typeof POPULAR_LOCATIONS[0]) => {
    const newLoc: LocationDetails = {
      latitude: p.lat,
      longitude: p.lon,
      city: p.city,
      district: p.district,
      road: p.road,
      fullAddress: `${p.city} ${p.district} ${p.road}`,
      cityZh: p.nameZh,
      districtZh: p.district,
      roadZh: p.road,
      fullAddressZh: p.nameZh,
      country: 'CN'
    };
    onSelectLocation(newLoc);
    onClose();
    onShowToast(isZh ? `📍 已切换至：${p.nameZh}` : `📍 Switched to ${p.name}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col justify-between animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#006241] flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-neutral-900">
                {isZh ? '选择您的当前位置' : 'Set Your Current Location'}
              </h3>
              <p className="text-[11px] text-neutral-400">
                {isZh ? '就近匹配您身边的真实星巴克门店与出餐时间' : 'Matches authentic nearby Starbucks stores & distance'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Location Box */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50/50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                {t.currentLocationText}
              </span>
              <p className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                {isZh ? (currentLocation.districtZh || currentLocation.cityZh) : (currentLocation.district || currentLocation.city)}
              </p>
              <p className="text-[11px] text-neutral-500 truncate">
                {isZh ? (currentLocation.fullAddressZh || currentLocation.roadZh) : (currentLocation.fullAddress || currentLocation.road)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onTriggerGPS();
              onClose();
            }}
            disabled={isLocating}
            className="bg-[#006241] hover:bg-[#004D34] text-white px-3 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all ml-2"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isZh ? 'GPS 重新定位' : 'GPS Refresh'}</span>
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isZh ? '输入您的城市、行政区、街道或商圈...' : 'Search city, district, street or landmark...'}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9.5 pr-20 py-2.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#006241] focus:ring-1 focus:ring-[#006241]"
          />
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all"
          >
            {isSearching ? <RefreshCw className="w-3 h-3 animate-spin" /> : (isZh ? '搜索' : 'Search')}
          </button>
        </form>

        {/* Popular Metropolitan Hub Presets */}
        <div className="space-y-2 flex-1 overflow-y-auto pr-1">
          <span className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#006241]" />
            {isZh ? '热门核心商圈快捷切换' : 'Popular Metropolitan Hubs'}
          </span>
          <div className="grid grid-cols-2 gap-2">
            {POPULAR_LOCATIONS.map((loc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePickPreset(loc)}
                className="p-2.5 rounded-xl border border-neutral-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-left transition-all cursor-pointer flex flex-col justify-between group active:scale-95"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900 group-hover:text-[#006241] truncate">
                    {isZh ? loc.nameZh.split(' · ')[1] : loc.name}
                  </span>
                  <span className="text-[10px] text-neutral-400">{isZh ? loc.nameZh.split(' · ')[0] : loc.city}</span>
                </div>
                <span className="text-[10px] text-neutral-500 mt-1 line-clamp-1">
                  {loc.road}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            {isZh ? '门店距离与自提状态将实时按此位置计算' : 'Stores & distances auto-calculate from this position'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-700 font-bold hover:underline cursor-pointer"
          >
            {isZh ? '完成' : 'Done'}
          </button>
        </div>

      </div>
    </div>
  );
};

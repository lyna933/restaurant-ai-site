import React, { useState } from 'react';
import { StoreLocation, BrandConfig, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { 
  Phone, 
  Headphones, 
  MessageSquare, 
  Clock, 
  Check, 
  Copy, 
  Sparkles, 
  Store,
  ExternalLink,
} from 'lucide-react';

interface ContactHotlineSectionProps {
  brand: BrandConfig;
  stores: StoreLocation[];
  language: Language;
  onOpenConciergeModal: () => void;
  onShowToast: (msg: string) => void;
}

export const ContactHotlineSection: React.FC<ContactHotlineSectionProps> = ({
  brand,
  stores,
  language,
  onOpenConciergeModal,
  onShowToast
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isZh = language === 'zh' || language === 'zh-TW';
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    onShowToast(isZh ? `已复制: ${num}` : `Copied: ${num}`);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  // Determine hotline label strictly by language
  const displayHotline = isZh ? (brand.hotlineLabelZh || brand.hotlineLabel || brand.hotline) : brand.hotline;
  const hasHotline = Boolean(brand.hotline && !/not verified|未查证/i.test(brand.hotline));

  return (
    <section id="section-contact" className="scroll-mt-16 space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-[#006241] text-white flex items-center justify-center font-bold text-sm shadow-xs">
            04
          </span>
          <div>
            <h2 className="text-xl font-black text-neutral-900 tracking-tight">
              {t.contactTitle}
            </h2>
          </div>
        </div>
      </div>

      {/* Main Hotline Card */}
      <div className="bg-gradient-to-br from-[#004D34] via-[#006241] to-[#002B1D] text-white rounded-2xl p-4 sm:p-5 shadow-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-white text-[#006241] flex items-center justify-center shadow-md shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {t.hotlineTitle}
              </h3>
              <p className="text-xl sm:text-2xl font-black text-amber-300 font-mono tracking-wide mt-0.5">
                {displayHotline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a id="btn-call-official-hotline" href={hasHotline ? `tel:${brand.hotline}` : undefined} aria-disabled={!hasHotline}
              className={`flex-1 sm:flex-none font-bold px-4 py-2 rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5 ${hasHotline ? 'bg-amber-400 hover:bg-amber-300 text-amber-950 cursor-pointer' : 'bg-white/15 text-white/60 cursor-not-allowed'}`}>
              <Phone className="w-3.5 h-3.5" />
              <span>{t.call}</span>
            </a>

            <button disabled={!hasHotline}
              onClick={() => handleCopy(brand.hotline)}
              className="bg-white/15 hover:bg-white/25 disabled:opacity-40 text-white border border-white/30 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              {copiedNumber === brand.hotline ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{t.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t.copy}</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Stores Direct Line Contact Cards */}
      {stores.length === 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {isZh ? '暂未找到有来源的门店地址和联系方式。' : 'No store address or contact with a verifiable source was found.'}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stores.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-2xl p-3.5 border border-neutral-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-[#006241]" />
                <h4 className="font-bold text-xs sm:text-sm text-neutral-900 line-clamp-1">
                  {isZh ? s.nameZh : s.name}
                </h4>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2">
                {isZh ? s.addressZh : s.address}
              </p>
              {s.sourceUrl && (
                <a href={s.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 hover:underline">
                  <ExternalLink className="h-3 w-3" /> {isZh ? '地址来源' : 'Address source'}
                </a>
              )}
              <div className="text-[11px] text-neutral-400 mt-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-neutral-400" />
                <span>{isZh ? s.hoursZh : s.hours}</span>
              </div>
            </div>

            <div className="pt-2.5 mt-2.5 border-t border-neutral-100 flex items-center justify-between">
              <span className="font-mono text-xs text-neutral-600 font-semibold">{s.phone}</span>
              <a
                href={`tel:${s.phone}`}
                className="bg-emerald-50 hover:bg-emerald-100 text-[#006241] border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Phone className="w-3 h-3" />
                <span>{t.call}</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Online Concierge Button */}
      <div className="bg-neutral-900 text-white rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 border border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neutral-800 flex items-center justify-center text-amber-300">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-white">
              {t.onlineConcierge}
            </h4>
          </div>
        </div>

        <button
          onClick={onOpenConciergeModal}
          className="bg-white hover:bg-neutral-100 text-neutral-900 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#006241]" />
          <span>{t.inquire}</span>
        </button>
      </div>

    </section>
  );
};

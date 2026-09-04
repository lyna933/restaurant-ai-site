import React, { useState } from 'react';
import { SocialLink, Language, BrandConfig } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { socialProfile } from '../utils/socialProfiles';
import { 
  Instagram, 
  Video, 
  BookOpen, 
  Facebook, 
  MessageCircle, 
  Star, 
  MapPin, 
  Play, 
  ExternalLink, 
  Copy, 
  Check, 
  Users, 
  Compass, 
  Twitter,
  Linkedin,
  Share2
} from 'lucide-react';

interface SocialsSectionProps {
  socials: SocialLink[];
  language: Language;
  onShowToast: (msg: string) => void;
  researchProvider?: BrandConfig['researchProvider'];
  sourceCount?: number;
}

export const SocialsSection: React.FC<SocialsSectionProps> = ({
  socials,
  language,
  onShowToast,
  researchProvider,
  sourceCount = 0,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isZh = language === 'zh' || language === 'zh-TW';
  const sourceUi = ({
    en: { summary: 'Verified via Tavily, Google Search and official-site links', source: 'Verified source', empty: 'No merchant social profile with a verifiable source was found.' },
    zh: { summary: '核验来源：Tavily 全网检索、Google Search、餐馆官网外链', source: '核验来源', empty: '暂未找到有可验证来源的商家社交媒体账号。' },
    'zh-TW': { summary: '核驗來源：Tavily 全網搜尋、Google Search、餐廳官網外部連結', source: '核驗來源', empty: '暫未找到具有可驗證來源的商家社群帳號。' },
    ja: { summary: '確認元：Tavily、Google Search、公式サイトの外部リンク', source: '確認済みソース', empty: '確認可能な店舗公式ソーシャルプロフィールは見つかりませんでした。' },
    ko: { summary: '확인 출처: Tavily, Google Search, 공식 사이트 외부 링크', source: '확인된 출처', empty: '확인 가능한 매장 소셜 프로필을 찾지 못했습니다.' },
    es: { summary: 'Verificado con Tavily, Google Search y enlaces del sitio oficial', source: 'Fuente verificada', empty: 'No se encontró un perfil social verificable del comercio.' },
    fr: { summary: 'Vérifié via Tavily, Google Search et les liens du site officiel', source: 'Source vérifiée', empty: 'Aucun profil social vérifiable de l’établissement n’a été trouvé.' },
    de: { summary: 'Geprüft über Tavily, Google Search und Links der offiziellen Website', source: 'Verifizierte Quelle', empty: 'Kein verifizierbares Social-Media-Profil des Restaurants gefunden.' },
  } as Record<Language, { summary: string; source: string; empty: string }>)[language];
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const localizedBadge = (badge?: string) => {
    if (!badge || !isZh) return badge || '';
    if (/profile|page/i.test(badge)) return '商家主页';
    if (/channel/i.test(badge)) return '商家频道';
    if (/official|verified/i.test(badge)) return '官方已核验';
    return '已核验商家主页';
  };
  const localizedMetric = (metric?: string) => {
    if (!metric || !isZh) return metric || '';
    return metric
      .replace(/Followers?/gi, '粉丝')
      .replace(/Subscribers?/gi, '订阅者')
      .replace(/Likes?/gi, '赞');
  };
  const directProfileUrl = (value: string) => {
    try {
      const url = new URL(value);
      const host = url.hostname.toLowerCase().replace(/^www\./, '');
      const segments = url.pathname.split('/').filter(Boolean);
      return socialProfile(value)?.url || value;
    } catch {
      return value;
    }
  };
  const sourceLabel = (social: SocialLink) => {
    if (social.sourceTitle) return social.sourceTitle;
    try {
      return new URL(social.sourceUrl || social.url).hostname.replace(/^www\./, '');
    } catch {
      return social.name;
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Instagram':
        return <Instagram className="w-5 h-5" />;
      case 'Video':
        return <Video className="w-5 h-5" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5" />;
      case 'Facebook':
        return <Facebook className="w-5 h-5" />;
      case 'Twitter':
        return <Twitter className="w-5 h-5" />;
      case 'Linkedin':
        return <Linkedin className="w-5 h-5" />;
      case 'Play':
        return <Play className="w-5 h-5 fill-current" />;
      case 'MessageCircle':
        return <MessageCircle className="w-5 h-5" />;
      case 'Share2':
        return <Share2 className="w-5 h-5" />;
      case 'Star':
        return <Star className="w-5 h-5" />;
      case 'MapPin':
        return <MapPin className="w-5 h-5" />;
      default:
        return <Compass className="w-5 h-5" />;
    }
  };

  const handleCopyHandle = (social: SocialLink, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(social.handle);
    setCopiedId(social.id);
    onShowToast(isZh ? `已复制: ${social.handle}` : `Copied: ${social.handle}`);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleOpenLink = (url: string, name: string) => {
    try {
      const win = window.open(url, '_blank', 'noopener,noreferrer');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      onShowToast(isZh ? `正在打开 ${name}...` : `Opening ${name}...`);
    } catch (e) {
      window.location.href = url;
    }
  };

  return (
    <section id="section-socials" className="scroll-mt-16">
      {/* Section Header */}
      <div className="brand-section-heading flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-[#006241] text-white flex items-center justify-center font-bold text-sm shadow-xs">
            01
          </span>
          <div>
            <h2 className="text-xl font-black text-neutral-900 tracking-tight">
              {t.socialsTitle}
            </h2>
            {researchProvider && (
              <p className="mt-0.5 text-[11px] text-neutral-500">
                {`${sourceUi.summary} · ${sourceCount}`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Social Channels */}
      {socials.length === 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {sourceUi.empty}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {socials.map((social) => (
          <div
            key={social.id}
            id={`social-card-${social.id}`}
            onClick={() => handleOpenLink(directProfileUrl(social.url), isZh ? social.nameZh : social.name)}
            className="social-link-card group relative bg-white rounded-2xl p-3.5 border border-neutral-200 shadow-xs hover:border-emerald-500/60 transition-all flex flex-col justify-between cursor-pointer hover:bg-emerald-50/20"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold shadow-inner ${social.bgColor}`}
                >
                  {getIcon(social.icon)}
                </div>

                {/* Action Buttons: Copy Handle & Direct Launch */}
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={(e) => handleCopyHandle(social, e)}
                    className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition-colors text-xs cursor-pointer"
                    title={t.copyHandle}
                  >
                    {copiedId === social.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <a
                    href={directProfileUrl(social.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowToast(isZh ? `正在打开 ${social.nameZh}...` : `Opening ${social.name}...`);
                    }}
                    className="bg-[#006241] hover:bg-[#00754A] text-white p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
                    title={t.visitProfile}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="mt-2.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-neutral-900 text-sm group-hover:text-[#006241] transition-colors">
                    {isZh ? social.nameZh : social.name}
                  </span>
                  {social.badge && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 font-semibold px-1.5 py-0.2 rounded border border-emerald-200">
                      {localizedBadge(social.badge)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">
                  {social.handle}
                </p>
                {social.sourceUrl && (
                  <a
                    href={social.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className="mt-1 block max-w-full truncate text-[10px] font-medium text-emerald-700 hover:text-emerald-900 hover:underline"
                    title={sourceLabel(social)}
                  >
                    {sourceUi.source}: {sourceLabel(social)}
                  </a>
                )}
                {social.followers && (
                  <span className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5 font-medium">
                    <Users className="w-3 h-3 text-neutral-400" />
                    {localizedMetric(social.followers)}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Visit Bar */}
            <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 group-hover:text-[#006241] font-semibold">
              <span>{t.visitProfile}</span>
              <span className="text-[#006241] font-bold group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

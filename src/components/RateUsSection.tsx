import React, { useEffect, useState } from 'react';
import { CustomerReview, StoreLocation, Language, BrandConfig } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { 
  Star, 
  ThumbsUp, 
  ExternalLink, 
  Copy, 
  Check, 
  Wand2, 
  Tag, 
  Plus,
  RefreshCw,
  Sparkles,
  Smile,
  Zap,
  Coffee,
  Briefcase
} from 'lucide-react';

interface RateUsSectionProps {
  reviews: CustomerReview[];
  stores: StoreLocation[];
  language: Language;
  onLikeReview: (reviewId: string) => void;
  onShowToast: (msg: string) => void;
  brand?: BrandConfig;
}

export const RateUsSection: React.FC<RateUsSectionProps> = ({
  reviews,
  stores,
  language,
  onLikeReview,
  onShowToast,
  brand
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isZh = language === 'zh' || language === 'zh-TW';
  const brandName = brand ? (isZh ? brand.nameZh : brand.name) : 'this restaurant';
  const ui = ({
    en: { direct: 'Direct review form for this store', store: 'Exact store page — tap Write a review', exact: 'Exact merchant page', booking: 'Review after verified booking', venue: 'Exact venue tips & feedback', restaurant: 'Exact restaurant listing', community: 'Community review listing', public: 'Public business review', post: 'Open the merchant post and comment', profile: 'Open merchant profile, then choose a post to comment', order: 'Rate after a completed order', style: 'Select Style Preference', draft: 'Selected Keywords & Notes', result: 'Polished Review Result' },
    zh: { direct: '直接打开当前门店写评价页面', store: '当前门店主页，点击“撰写评价”', exact: '当前商家页面', booking: '完成订座后可评价', venue: '商家地点与评价', restaurant: '当前餐厅评价页', community: '社区评价页', public: '公开商家评价页', post: '直接打开商家笔记并评论', profile: '进入商家主页，选择笔记后评论', order: '完成订单后可评分', style: '选择语言风格偏好', draft: '已选关键词 / 输入要点', result: 'AI 润色生成结果' },
    'zh-TW': { direct: '直接開啟目前門市評價頁面', store: '目前門市首頁，點選「撰寫評論」', exact: '目前商家頁面', booking: '完成訂位後可評論', venue: '商家地點與評論', restaurant: '目前餐廳評論頁', community: '社群評論頁', public: '公開商家評論頁', post: '直接開啟商家貼文並留言', profile: '進入商家首頁，選擇貼文後留言', order: '完成訂單後可評分', style: '選擇文字風格', draft: '已選關鍵字／輸入重點', result: 'AI 潤飾結果' },
    ja: { direct: 'この店舗のレビュー投稿画面を直接開く', store: '店舗ページを開き「クチコミを書く」を選択', exact: 'この店舗のページ', booking: '予約完了後にレビュー可能', venue: '店舗情報・レビュー', restaurant: 'レストランのレビューページ', community: 'コミュニティレビュー', public: '公開ビジネスレビュー', post: '店舗投稿を開いてコメント', profile: '店舗プロフィールから投稿を選んでコメント', order: '注文完了後に評価可能', style: '文章スタイルを選択', draft: 'キーワード・メモ', result: 'AI推敲結果' },
    ko: { direct: '현재 매장 리뷰 작성 화면 바로 열기', store: '매장 페이지에서 리뷰 작성을 선택하세요', exact: '현재 매장 페이지', booking: '예약 완료 후 리뷰 가능', venue: '매장 정보 및 리뷰', restaurant: '현재 음식점 리뷰 페이지', community: '커뮤니티 리뷰', public: '공개 비즈니스 리뷰', post: '매장 게시물을 열어 댓글 작성', profile: '매장 프로필에서 게시물을 선택해 댓글 작성', order: '주문 완료 후 평가 가능', style: '문체 선택', draft: '선택한 키워드 및 메모', result: 'AI 다듬기 결과' },
    es: { direct: 'Abrir directamente el formulario de reseña', store: 'Página exacta del local: pulsa Escribir reseña', exact: 'Página exacta del comercio', booking: 'Reseña disponible tras reservar', venue: 'Lugar y opiniones verificadas', restaurant: 'Ficha exacta del restaurante', community: 'Reseñas de la comunidad', public: 'Reseña pública del negocio', post: 'Abrir la publicación y comentar', profile: 'Abrir el perfil y elegir una publicación para comentar', order: 'Valorar después de completar un pedido', style: 'Seleccionar estilo', draft: 'Palabras clave y notas', result: 'Resultado mejorado' },
    fr: { direct: 'Ouvrir directement le formulaire d’avis', store: 'Page exacte du restaurant — cliquez sur Rédiger un avis', exact: 'Page exacte du commerce', booking: 'Avis possible après réservation', venue: 'Lieu et avis vérifiés', restaurant: 'Fiche exacte du restaurant', community: 'Avis de la communauté', public: 'Avis public sur l’établissement', post: 'Ouvrir la publication et commenter', profile: 'Ouvrir le profil puis choisir une publication', order: 'Noter après une commande terminée', style: 'Choisir le style', draft: 'Mots-clés et notes', result: 'Résultat optimisé' },
    de: { direct: 'Bewertungsformular für diese Filiale direkt öffnen', store: 'Exakte Filialseite — „Rezension schreiben“ wählen', exact: 'Exakte Unternehmensseite', booking: 'Bewertung nach bestätigter Reservierung', venue: 'Standort und verifizierte Hinweise', restaurant: 'Exakter Restauranteintrag', community: 'Community-Bewertungen', public: 'Öffentliche Unternehmensbewertung', post: 'Unternehmensbeitrag öffnen und kommentieren', profile: 'Unternehmensprofil öffnen und Beitrag auswählen', order: 'Nach abgeschlossener Bestellung bewerten', style: 'Schreibstil auswählen', draft: 'Schlagwörter und Notizen', result: 'KI-optimiertes Ergebnis' },
  } as Record<Language, Record<string, string>>)[language];

  const exactStore = stores[0];
  const googleLanguage = ({ en: 'en', zh: 'zh-CN', 'zh-TW': 'zh-TW', ja: 'ja', ko: 'ko', es: 'es', fr: 'fr', de: 'de' } as Record<Language, string>)[language];
  const withGoogleLanguage = (value: string) => {
    try {
      const parsed = new URL(value);
      parsed.searchParams.set('hl', googleLanguage);
      return parsed.toString();
    } catch {
      return value;
    }
  };
  const findSocial = (...hosts: string[]) => brand?.socials.find((social) => {
    try {
      const host = new URL(social.url).hostname.toLowerCase().replace(/^www\./, '');
      return hosts.some((candidate) => host === candidate || host.endsWith(`.${candidate}`));
    } catch {
      return false;
    }
  });
  const googleReviewUrl = exactStore?.reviewUrl || '';
  const googleMapsListing = findSocial('google.com');
  const googlePageUrl = withGoogleLanguage(googleReviewUrl
    || (exactStore?.sourceUrl?.includes('google.com/maps') || exactStore?.sourceUrl?.includes('maps.google.com') ? exactStore.sourceUrl : '')
    || (exactStore?.mapUrl?.includes('google.com/maps') || exactStore?.mapUrl?.includes('maps.google.com') ? exactStore.mapUrl : '')
    || googleMapsListing?.url
    || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${brand?.name || brandName} ${exactStore?.address || ''}`.trim())}`);
  const yelp = findSocial('yelp.com');
  const tripadvisor = findSocial('tripadvisor.com');
  const facebook = findSocial('facebook.com');
  const dianping = findSocial('dianping.com');
  const xiaohongshu = brand?.socials.find((social) => {
    try {
      const url = new URL(social.url);
      const isXhs = url.hostname.toLowerCase().replace(/^www\./, '').endsWith('xiaohongshu.com');
      return isXhs && (/^\/user\/profile\//i.test(url.pathname) || /^\/(explore|discovery)\//i.test(url.pathname));
    } catch {
      return false;
    }
  });
  const isXiaohongshuPost = !!xiaohongshu && /^\/(explore|discovery)\//i.test(new URL(xiaohongshu.url).pathname);
  const openTable = findSocial('opentable.com');
  const foursquare = findSocial('foursquare.com');
  const zomato = findSocial('zomato.com');
  const restaurantGuru = findSocial('restaurantguru.com');
  const happyCow = findSocial('happycow.net');
  const trustpilot = findSocial('trustpilot.com');
  const uberEats = findSocial('ubereats.com');
  const doorDash = findSocial('doordash.com');
  const grubhub = findSocial('grubhub.com');

  const toYelpReviewUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      const match = parsed.pathname.match(/^\/biz\/([^/?#]+)/);
      return match ? `${parsed.origin}/writeareview/biz/${match[1]}` : url;
    } catch {
      return url;
    }
  };
  const toTripadvisorReviewUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      if (!/\/Restaurant_Review-/i.test(parsed.pathname)) return url;
      return `${parsed.origin}${parsed.pathname.replace('/Restaurant_Review-', '/UserReviewEdit-').replace('-Reviews-', '-')}`;
    } catch {
      return url;
    }
  };

  // Only use URLs already tied to the current merchant/branch; never send users to a platform search page.
  const reviewApps = [
    { id: 'Google', name: isZh ? 'Google 地图' : 'Google Maps', url: googlePageUrl, badge: googleReviewUrl ? ui.direct : ui.store },
    ...(yelp ? [{ id: 'Yelp', name: 'Yelp', url: toYelpReviewUrl(yelp.url), badge: ui.exact }] : []),
    ...(tripadvisor ? [{ id: 'TripAdvisor', name: 'Tripadvisor', url: toTripadvisorReviewUrl(tripadvisor.url), badge: ui.exact }] : []),
    ...(facebook ? [{ id: 'Facebook', name: 'Facebook', url: `${facebook.url.replace(/\/$/, '')}/reviews`, badge: ui.exact }] : []),
    ...(openTable ? [{ id: 'OpenTable', name: 'OpenTable', url: openTable.url, badge: ui.booking }] : []),
    ...(foursquare ? [{ id: 'Foursquare', name: 'Foursquare', url: foursquare.url, badge: ui.venue }] : []),
    ...(zomato ? [{ id: 'Zomato', name: 'Zomato', url: zomato.url, badge: ui.restaurant }] : []),
    ...(restaurantGuru ? [{ id: 'RestaurantGuru', name: 'Restaurant Guru', url: restaurantGuru.url, badge: ui.restaurant }] : []),
    ...(happyCow ? [{ id: 'HappyCow', name: 'HappyCow', url: happyCow.url, badge: ui.community }] : []),
    ...(trustpilot ? [{ id: 'Trustpilot', name: 'Trustpilot', url: trustpilot.url, badge: ui.public }] : []),
    ...(dianping ? [{ id: 'Dianping', name: '大众点评', url: dianping.url, badge: ui.exact }] : []),
    ...(xiaohongshu ? [{
      id: 'Xiaohongshu',
      name: isZh ? '小红书 RED' : 'Xiaohongshu (RED)',
      url: xiaohongshu.url,
      badge: isXiaohongshuPost ? ui.post : ui.profile,
    }] : []),
    ...(uberEats ? [{ id: 'UberEats', name: 'Uber Eats', url: uberEats.url, badge: ui.order }] : []),
    ...(doorDash ? [{ id: 'DoorDash', name: 'DoorDash', url: doorDash.url, badge: ui.order }] : []),
    ...(grubhub ? [{ id: 'Grubhub', name: 'Grubhub', url: grubhub.url, badge: ui.order }] : []),
  ];

  // Prompt keyword suggestions based on brand and language
  const getPromptKeywords = () => {
    if (brand?.promptKeywords) {
      if (isZh && brand.promptKeywords.zh && brand.promptKeywords.zh.length > 0) {
        return brand.promptKeywords.zh;
      }
      if (brand.promptKeywords.en && brand.promptKeywords.en.length > 0) {
        return brand.promptKeywords.en;
      }
    }

    switch (language) {
      case 'zh':
      case 'zh-TW':
        return [
          '☕️ 招牌风味丝滑浓郁醇香',
          '⚡️ 手机点单自提极速出餐',
          '✨ 环境宽敞舒适Wi-Fi极速',
          '❤️ 服务人员热情专业周到',
          '🥐 食材新鲜现做口感极佳',
          '🌟 综合体验拉满强烈推荐'
        ];
      default:
        return [
          '☕️ Signature Flavor & Rich Aroma',
          '⚡️ Fast Mobile Order & Pay Pickup',
          '✨ Cozy Vibe & Fast Wi-Fi',
          '❤️ Super Welcoming & Friendly Staff',
          '🥐 Fresh Ingredients & Delicious Taste',
          '🌟 5-Star Rating Highly Recommended'
        ];
    }
  };

  const promptKeywords = getPromptKeywords();

  // Tone Options
  const getToneOptions = () => {
    switch (language) {
      case 'zh':
      case 'zh-TW':
        return [
          { id: 'enthusiastic', label: '✨ 热情真诚', icon: Smile, desc: '生动热情、走心推荐' },
          { id: 'concise', label: '⚡ 极速短评', icon: Zap, desc: '简短有力、快速打卡' },
          { id: 'foodie', label: '🍽️ 风味品鉴', icon: Coffee, desc: '专业口感、细节描述' },
          { id: 'professional', label: '💼 商务得体', icon: Briefcase, desc: '客观规范、适合商用' }
        ];
      case 'ja':
        return [
          { id: 'enthusiastic', label: '✨ 熱意・おすすめ', icon: Smile, desc: '親しみやすく熱心' },
          { id: 'concise', label: '⚡ 短文・簡潔', icon: Zap, desc: '手短で要点重視' },
          { id: 'foodie', label: '🍽️ グルメ・風味', icon: Coffee, desc: '味わい詳細レビュー' },
          { id: 'professional', label: '💼 丁寧・ビジネス', icon: Briefcase, desc: '丁寧で落ち着いた表現' }
        ];
      case 'ko':
        return [
          { id: 'enthusiastic', label: '✨ 열정적인 추천', icon: Smile, desc: '친절하고 진심 어린' },
          { id: 'concise', label: '⚡ 간결하고 명확', icon: Zap, desc: '짧고 강렬한 5점' },
          { id: 'foodie', label: '🍽️ 미식가 스타일', icon: Coffee, desc: '풍미와 디테일 중심' },
          { id: 'professional', label: '💼 정중하고 깔끔', icon: Briefcase, desc: '격식 있는 표현' }
        ];
      case 'es':
        return [
          { id: 'enthusiastic', label: '✨ Entusiasta', icon: Smile, desc: 'Cálido y convincente' },
          { id: 'concise', label: '⚡ Breve y directo', icon: Zap, desc: 'Lo esencial en pocas palabras' },
          { id: 'foodie', label: '🍽️ Estilo gourmet', icon: Coffee, desc: 'Sabores y detalles del plato' },
          { id: 'professional', label: '💼 Profesional', icon: Briefcase, desc: 'Equilibrado y cuidado' }
        ];
      case 'fr':
        return [
          { id: 'enthusiastic', label: '✨ Enthousiaste', icon: Smile, desc: 'Chaleureux et convaincant' },
          { id: 'concise', label: '⚡ Bref et percutant', icon: Zap, desc: 'L’essentiel en quelques mots' },
          { id: 'foodie', label: '🍽️ Fin gourmet', icon: Coffee, desc: 'Saveurs et détails des plats' },
          { id: 'professional', label: '💼 Professionnel', icon: Briefcase, desc: 'Soigné et équilibré' }
        ];
      case 'de':
        return [
          { id: 'enthusiastic', label: '✨ Begeistert', icon: Smile, desc: 'Herzlich und überzeugend' },
          { id: 'concise', label: '⚡ Kurz und prägnant', icon: Zap, desc: 'Das Wichtigste auf den Punkt' },
          { id: 'foodie', label: '🍽️ Feinschmecker', icon: Coffee, desc: 'Aromen und Speisedetails' },
          { id: 'professional', label: '💼 Professionell', icon: Briefcase, desc: 'Sachlich und ausgewogen' }
        ];
      default:
        return [
          { id: 'enthusiastic', label: '✨ Enthusiastic', icon: Smile, desc: 'Warm & engaging' },
          { id: 'concise', label: '⚡ Short & Punchy', icon: Zap, desc: 'Quick 5-star highlight' },
          { id: 'foodie', label: '🍽️ Gourmet Foodie', icon: Coffee, desc: 'Tasting notes & pairings' },
          { id: 'professional', label: '💼 Professional', icon: Briefcase, desc: 'Polished & balanced' }
        ];
    }
  };

  const toneOptions = getToneOptions();

  // State
  const [selectedApp, setSelectedApp] = useState<string>('Google');
  const [userInputNotes, setUserInputNotes] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<string>('enthusiastic');
  const [isPolishing, setIsPolishing] = useState<boolean>(false);
  const [hasPolished, setHasPolished] = useState<boolean>(false);
  const [polishedReviewText, setPolishedReviewText] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    setSelectedApp('Google');
    setUserInputNotes('');
    setPolishedReviewText('');
    setHasPolished(false);
  }, [language, brand?.id]);

  // Active App Object
  const currentAppObj = reviewApps.find((a) => a.id === selectedApp) || reviewApps[0];

  // Add / Toggle prompt keyword into notes
  const handleAddPromptChip = (chip: string) => {
    const cleanChip = chip.replace(/^[^\w\s\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]+/, '').trim();
    
    let updatedNotes = '';
    if (!userInputNotes.trim()) {
      updatedNotes = cleanChip;
    } else if (userInputNotes.includes(cleanChip)) {
      // already exists, don't duplicate
      updatedNotes = userInputNotes;
    } else {
      updatedNotes = `${userInputNotes}，${cleanChip}`;
    }
    
    // Only update the keywords input box - do NOT automatically generate the polished review
    setUserInputNotes(updatedNotes);
    onShowToast(isZh ? `已添加关键词: ${cleanChip}` : `Added keyword: ${cleanChip}`);
  };

  // Switch Tone: simply updates selectedTone without jumping or auto-polishing
  const handleSelectTone = (toneId: string) => {
    setSelectedTone(toneId);
    // If the user has already polished before, optionally notify them to click Polish to regenerate in this style
    if (hasPolished) {
      onShowToast(isZh ? '已切换风格，点击【AI 智能润色】即可重新生成' : 'Style changed, tap Polish to regenerate');
    }
  };

  // Perform AI Polishing on button click
  const handlePolishReview = async () => {
    setIsPolishing(true);
    const currentNotes = userInputNotes.trim();

    const finishPolish = (text: string) => {
      setPolishedReviewText(text);
      setHasPolished(true);
      setIsPolishing(false);
      onShowToast(isZh
        ? '✨ AI 润色已完成，请确认内容后点击下方按钮复制并打开评价页'
        : '✨ AI polish completed. Review the text, then use Copy & Open below.');
    };

    try {
      const res = await fetch('/api/generate-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: brand?.name || 'Restaurant',
          storeName: stores[0]?.name || brand?.name || 'Restaurant',
          rating: 5,
          keywords: currentNotes
            ? currentNotes.split(/[,，\n]+/).filter(Boolean)
            : promptKeywords.slice(0, 4),
          userDraft: currentNotes,
          tone: selectedTone,
          language: language,
          platform: currentAppObj.name
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          finishPolish(data.text);
          return;
        }
      }
    } catch (err) {
      console.log('AI Polish fetch error:', err);
    }

    // Local fallback generator strictly matching the selected tone
    const fallbackText = generateLocalToneReview(currentNotes, selectedTone);
    finishPolish(fallbackText);
  };

  const generateLocalToneReview = (kw: string, tone: string) => {
    const text = kw.trim() || (isZh ? '招牌风味丝滑浓郁醇香，出餐极速服务贴心' : 'Signature flavors, fast pickup and wonderful hospitality');
    const name = brandName || (isZh ? '本店' : 'this place');
    if (isZh) {
      switch (tone) {
        case 'concise':
          return `超赞的美食体验！${text}，体验满分，必须给全五星！⭐⭐⭐⭐⭐`;
        case 'foodie':
          return `实名推荐这家【${name}】！${text}。食材新鲜地道，风味层次丰富，环境舒适，值得反复打卡！🌿✨`;
        case 'professional':
          return `非常高效且品质稳定的【${name}】门店。${text}。动线清晰，出餐迅速，环境干净整洁，值得信赖。💼✨`;
        default:
          return `【${name}】出品一如既往的高水准！${text}。店员态度特别亲切专业，自提非常省时，五星好评强烈推荐！🌟✨`;
      }
    }
    switch (tone) {
      case 'concise':
        return `Phenomenal experience at ${name}! ${text}. 10/10 service and delicious quality. ⭐⭐⭐⭐⭐`;
      case 'foodie':
        return `Exceptional dining at ${name}! ${text}. Ingredients are super fresh, flavors are balanced and authentic. Highly recommended! 🌿✨`;
      case 'professional':
        return `Consistently excellent ${name} location. ${text}. Fast mobile order turnaround, clean seating area. Ideal experience. 💼✨`;
      default:
        return `${name} never disappoints! ${text}. Staff members are super welcoming, service is fast and seamless. Truly a 5-star experience! 🌟✨`;
    }
  };

  // Copy & launch app directly
  const handleCopyAndLaunchApp = (appUrl: string, appName: string) => {
    const textToCopy = polishedReviewText || userInputNotes || `${brandName} 5-Star Experience! 🌟✨`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    onShowToast(isZh ? `📋 好评已复制！正在前往 ${appName}...` : `📋 Review copied! Opening ${appName}...`);
    
    setTimeout(() => {
      setIsCopied(false);
      try {
        window.open(appUrl, '_blank', 'noopener,noreferrer');
      } catch (e) {
        window.location.href = appUrl;
      }
    }, 400);
  };

  const activeToneObj = toneOptions.find((t) => t.id === selectedTone) || toneOptions[0];

  return (
    <section id="section-reviews" className="scroll-mt-16 space-y-4">
      {/* Section Header */}
      <div className="brand-section-heading flex items-center justify-between mb-1">
        <div className="flex items-center gap-2.5">
          <span 
            className="w-8 h-8 rounded-xl text-white flex items-center justify-center font-bold text-sm shadow-xs"
            style={{ backgroundColor: brand?.primaryColor || '#006241' }}
          >
            02
          </span>
          <div>
            <h2 className="text-xl font-black text-neutral-900 tracking-tight">
              {t.reviewsTitle}
            </h2>
          </div>
        </div>
      </div>

      {/* --- DIRECT RATING & AI POLISH CARD --- */}
      <div className="review-composer bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs space-y-4">
        
        {/* Step 1: Select Platform */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-700 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              {t.chooseApp}
            </span>
          </div>

          <div className="review-platform-grid grid grid-cols-2 sm:grid-cols-4 gap-2">
            {reviewApps.map((app) => {
              const isSelected = selectedApp === app.id;
              return (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => setSelectedApp(app.id)}
                  className={`review-platform-card p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-neutral-900 line-clamp-1">{app.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-neutral-900" />}
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1">{app.badge}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Prompt Keywords */}
        <div>
          <span className="text-xs font-bold text-neutral-700 block mb-1.5 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-neutral-700" />
            {t.keywordPrompts}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {promptKeywords.map((kw, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddPromptChip(kw)}
                className="bg-neutral-50 hover:bg-neutral-100 text-neutral-700 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-300 px-2.5 py-1 rounded-full text-xs transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <span>{kw}</span>
                <Plus className="w-3 h-3 text-neutral-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Select Style / Tone Preference */}
        <div>
          <span className="text-xs font-bold text-neutral-700 block mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-neutral-700" />
            {ui.style}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {toneOptions.map((tone) => {
              const isSelected = selectedTone === tone.id;
              const Icon = tone.icon;
              return (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => handleSelectTone(tone.id)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs font-bold'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 font-medium'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-amber-300' : 'text-neutral-500'}`} />
                  <div className="min-w-0">
                    <div className="text-xs truncate">{tone.label}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 4: Keywords Input Box & Polish with AI Button */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-700 block">
            {ui.draft}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={userInputNotes}
              onChange={(e) => setUserInputNotes(e.target.value)}
              placeholder={t.draftNotesPlaceholder}
              className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            />
            <button
              type="button"
              id="btn-ai-polish-submit"
              onClick={handlePolishReview}
              disabled={isPolishing}
              className="bg-neutral-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 whitespace-nowrap"
            >
              {isPolishing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t.polishing}</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-amber-300" />
                  <span>{t.polishBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Step 5: Polished Review Output (Appears after clicking Polish with AI) */}
        {hasPolished && (
          <div className="space-y-2.5 pt-2 border-t border-neutral-100 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                {`${ui.result} · ${activeToneObj.label}`}
              </span>
              <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold border border-amber-200">
                5.0 ★ {currentAppObj.name}
              </span>
            </div>

            <div className="relative">
              <textarea
                rows={3}
                value={polishedReviewText}
                onChange={(e) => setPolishedReviewText(e.target.value)}
                className="w-full bg-amber-50/30 border border-amber-200/80 rounded-xl p-3 text-xs sm:text-sm text-neutral-800 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 leading-relaxed resize-none font-sans"
              />
            </div>

            {/* Direct Copy & Open Action Button */}
            <button
              type="button"
              id="btn-copy-and-open"
              onClick={() => handleCopyAndLaunchApp(currentAppObj.url, currentAppObj.name)}
              className="w-full bg-neutral-900 hover:bg-black text-white py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{t.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-amber-300" />
                  <span>{t.copyAndOpen} {currentAppObj.name}</span>
                  <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
                </>
              )}
            </button>
          </div>
        )}

      </div>

    </section>
  );
};

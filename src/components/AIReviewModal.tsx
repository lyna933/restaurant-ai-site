import React, { useState } from 'react';
import { StoreLocation, CustomerReview, Language } from '../types';
import { 
  Sparkles, 
  Star, 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  Send, 
  Heart,
  MessageSquare,
  ThumbsUp
} from 'lucide-react';

interface AIReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  stores: StoreLocation[];
  selectedStoreId: string;
  onSelectStore: (id: string) => void;
  initialPlatform?: string;
  language: Language;
  onReviewSubmitted: (newReview: CustomerReview) => void;
  onShowToast: (msg: string) => void;
}

const REVIEW_PLATFORMS = [
  { id: 'Google', name: 'Google Reviews', nameZh: 'Google 谷歌评价', url: 'https://maps.google.com', color: '#4285F4' },
  { id: 'Yelp', name: 'Yelp', nameZh: 'Yelp 美食点评', url: 'https://www.yelp.com', color: '#D32323' },
  { id: 'Xiaohongshu', name: 'Xiaohongshu (RED)', nameZh: '小红书种草打卡', url: 'https://www.xiaohongshu.com', color: '#FF2442' },
  { id: 'TripAdvisor', name: 'TripAdvisor', nameZh: '猫途鹰 TripAdvisor', url: 'https://www.tripadvisor.com', color: '#00AF87' },
  { id: 'Dianping', name: 'Dianping / Meituan', nameZh: '大众点评 / 美团', url: 'https://www.dianping.com', color: '#FF6600' },
  { id: 'Facebook', name: 'Facebook Reviews', nameZh: 'Facebook 推荐', url: 'https://www.facebook.com', color: '#1877F2' }
];

const PRESET_TAGS = {
  en: [
    'Friendly Barista',
    'Oat Milk Flat White',
    'Nitro Cold Brew',
    'Fast Mobile Pickup',
    'Cozy Seating & Wi-Fi',
    'Clean & Tidy Store',
    'Warm Artisan Food',
    'Great Background Music',
    'Drive-Thru Speed'
  ],
  zh: [
    '咖啡师亲切热情',
    '燕麦奶馥芮白绝绝子',
    '气致冷萃丝滑醇厚',
    '手机点单极速取餐',
    '环境舒适Wi-Fi快',
    '店面干净整洁',
    '现烤全麦暖食',
    '背景音乐很惬意',
    '免下车通道很顺畅'
  ]
};

export const AIReviewModal: React.FC<AIReviewModalProps> = ({
  isOpen,
  onClose,
  brandName,
  stores,
  selectedStoreId,
  onSelectStore,
  initialPlatform = 'Google',
  language,
  onReviewSubmitted,
  onShowToast
}) => {
  const isZh = language === 'zh';
  
  const [platform, setPlatform] = useState(initialPlatform);
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(isZh ? ['咖啡师亲切热情', '手机点单极速取餐'] : ['Friendly Barista', 'Fast Mobile Pickup']);
  const [tone, setTone] = useState<'enthusiastic' | 'concise' | 'foodie' | 'professional'>('enthusiastic');
  const [reviewLang, setReviewLang] = useState<'en' | 'zh' | 'bilingual'>(isZh ? 'zh' : 'en');
  const [authorName, setAuthorName] = useState('');
  const [userNotes, setUserNotes] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOptions, setGeneratedOptions] = useState<Array<{ id: string; style: string; text: string; tags: string[] }>>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('opt-1');
  const [customizedText, setCustomizedText] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      if (initialPlatform) setPlatform(initialPlatform);
      if (generatedOptions.length === 0) {
        handleGenerateAI();
      }
    }
  }, [isOpen, initialPlatform]);

  const currentStore = stores.find(s => s.id === selectedStoreId) || stores[0];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleGenerateAI = async () => {
    setIsLoading(true);
    setCopied(false);
    try {
      const response = await fetch('/api/generate-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: brandName,
          storeName: isZh ? currentStore.nameZh : currentStore.name,
          rating,
          keywords: selectedTags,
          tone,
          language: reviewLang,
          userDraft: userNotes,
          platform: platform
        })
      });

      const data = await response.json();
      if (data.options && data.options.length > 0) {
        setGeneratedOptions(data.options);
        setSelectedOptionId(data.options[0].id);
        setCustomizedText(data.options[0].text);
        onShowToast(isZh ? '✨ AI 智能评价润色已完成！' : '✨ AI review generated & polished!');
      }
    } catch (err) {
      console.error('Failed to generate review:', err);
      onShowToast(isZh ? '生成失败，请重试' : 'Failed to generate review. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (opt: { id: string; text: string }) => {
    setSelectedOptionId(opt.id);
    setCustomizedText(opt.text);
  };

  const handleCopyAndRedirect = () => {
    const textToCopy = customizedText || (generatedOptions.find(o => o.id === selectedOptionId)?.text || '');
    if (!textToCopy) {
      onShowToast(isZh ? '请先生成评价内容' : 'Please generate review text first');
      return;
    }
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    onShowToast(isZh ? '已复制好评文案！正在前往评价页面...' : 'Review copied! Redirecting to review page...');
    
    // Find target platform URL
    const target = REVIEW_PLATFORMS.find(p => p.id === platform) || REVIEW_PLATFORMS[0];
    setTimeout(() => {
      window.open(target.url, '_blank');
    }, 800);
  };

  const handleSubmitToCommunity = async () => {
    const textToPost = customizedText.trim();
    if (!textToPost) {
      onShowToast(isZh ? '请先生成评价内容' : 'Please generate or write review content first');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: 'starbucks',
          storeName: isZh ? currentStore.nameZh : currentStore.name,
          author: authorName.trim() || (isZh ? '星粉咖啡客' : 'Coffee Lover'),
          rating,
          platform,
          comment: textToPost,
          tags: selectedTags
        })
      });

      if (response.ok) {
        const newRev = await response.json();
        onReviewSubmitted(newRev);
        onShowToast(isZh ? '🎉 评价已成功发表到主页评价墙！' : '🎉 Review published to Community Board!');
        onClose();
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      onShowToast(isZh ? '发布失败，请重试' : 'Failed to publish review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shadow">
              <Sparkles className="w-5 h-5 fill-amber-950" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight flex items-center gap-1.5">
                {isZh ? 'AI 智能评价润色助手' : 'AI Review Assistant & Polisher'}
                <span className="text-[11px] font-normal bg-emerald-700/80 text-emerald-200 px-2 py-0.5 rounded-full">
                  Gemini
                </span>
              </h3>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                {isZh 
                  ? '一键生成高赞好评，快速同步至 Google / Yelp / 小红书' 
                  : 'Generate high-impact authentic reviews for Google, Yelp & social platforms'}
              </p>
            </div>
          </div>
          <button
            id="close-ai-modal"
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-700/50 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-neutral-800 text-sm">
          
          {/* Step 1: Store & Platform Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {isZh ? '选择就餐/自提门店' : 'Select Store Location'}
              </label>
              <select
                id="ai-modal-store-select"
                value={selectedStoreId}
                onChange={(e) => onSelectStore(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {isZh ? s.nameZh : s.name} ({s.distance})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {isZh ? '目标发布平台' : 'Target Platform'}
              </label>
              <select
                id="ai-modal-platform-select"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {REVIEW_PLATFORMS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {isZh ? p.nameZh : p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 2: Rating & Quick Sentiment Tags */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-neutral-700">
                {isZh ? '您的星级评分' : 'Your Star Rating'}
              </label>
              <span className="text-xs font-bold text-amber-600">
                {rating} / 5 {isZh ? '星' : 'Stars'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  id={`rating-star-${star}`}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1.5 rounded-lg hover:bg-amber-50 transition-transform active:scale-95 cursor-pointer"
                >
                  <Star 
                    className={`w-7 h-7 ${
                      star <= rating 
                        ? 'text-amber-400 fill-amber-400' 
                        : 'text-neutral-300'
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Highlight Tags */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-2">
              {isZh ? '选择体验亮点 (可多选)' : 'Experience Highlights (Select Tags)'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(isZh ? PRESET_TAGS.zh : PRESET_TAGS.en).map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer font-medium ${
                      isSelected
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tone & Language Preferences */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {isZh ? '文案语气风格' : 'Tone / Persona'}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'enthusiastic', label: isZh ? '热情真诚' : 'Enthusiastic' },
                  { id: 'concise', label: isZh ? '精炼简洁' : 'Concise' },
                  { id: 'foodie', label: isZh ? '美食达人' : 'Foodie' },
                  { id: 'professional', label: isZh ? '客观专业' : 'Professional' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t.id as any)}
                    className={`text-xs py-1.5 px-2 rounded border font-medium cursor-pointer text-center ${
                      tone === t.id
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-semibold'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {isZh ? '生成语言' : 'Language of Output'}
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'zh', label: '中文 (ZH)' },
                  { id: 'en', label: 'English' },
                  { id: 'bilingual', label: '双语 (EN+ZH)' }
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setReviewLang(l.id as any)}
                    className={`text-xs py-1.5 px-1 rounded border font-medium cursor-pointer text-center ${
                      reviewLang === l.id
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-semibold'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Optional Raw notes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              {isZh ? '补充细节 (选填，例如特调饮品名或咖啡师名字)' : 'Custom Notes / Details (Optional)'}
            </label>
            <input
              id="ai-user-notes"
              type="text"
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder={isZh ? '例如：Leo 做的燕麦奶馥芮白非常细腻拉花很漂亮' : 'e.g., Barista Leo made an exceptional Oat Milk Flat White with latte art'}
              className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Trigger Generate Button */}
          <button
            id="btn-generate-ai-review"
            type="button"
            onClick={handleGenerateAI}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-800 to-teal-700 hover:from-emerald-700 hover:to-teal-600 text-white font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{isZh ? 'Gemini 正在智能润色生成中...' : 'Gemini is crafting your review...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>{isZh ? '一键智能生成 3 款定制好评' : 'Generate 3 AI Review Variations'}</span>
              </>
            )}
          </button>

          {/* Generated Variations Container */}
          {generatedOptions.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800">
                  {isZh ? '✨ AI 推荐文案 (点击可切换与编辑)' : '✨ AI Generated Drafts (Click to select & edit)'}
                </span>
                <span className="text-[11px] text-emerald-700 font-medium">
                  {isZh ? '可自由修改细节' : 'Editable below'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {generatedOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedOptionId === opt.id
                        ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-1 ring-emerald-500'
                        : 'border-neutral-200 bg-neutral-50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-emerald-950">
                        {opt.style}
                      </span>
                      {selectedOptionId === opt.id && (
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-600 line-clamp-3 leading-relaxed">
                      {opt.text}
                    </p>
                  </button>
                ))}
              </div>

              {/* Editable Textarea */}
              <div className="relative mt-2">
                <textarea
                  id="final-review-text"
                  rows={4}
                  value={customizedText}
                  onChange={(e) => setCustomizedText(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-xs leading-relaxed text-neutral-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-inner"
                  placeholder={isZh ? 'AI 生成评价内容...' : 'AI generated review text...'}
                />
              </div>

              {/* Author Name for Community Post */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  {isZh ? '您的昵称 (用于发布在主页评价墙)' : 'Your Name / Nickname (For Community Board)'}
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder={isZh ? '例如：咖啡探店达人 Emma' : 'e.g., Emma Watson'}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="bg-neutral-50 border-t border-neutral-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 cursor-pointer"
          >
            {isZh ? '取消关闭' : 'Cancel'}
          </button>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Action 1: Submit to Community Board */}
            <button
              id="btn-post-community"
              type="button"
              onClick={handleSubmitToCommunity}
              disabled={isSubmitting || !customizedText}
              className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isZh ? '发表到主页评价墙' : 'Post to Community'}</span>
            </button>

            {/* Action 2: Copy & Go to External Platform */}
            <button
              id="btn-copy-and-redirect"
              type="button"
              onClick={handleCopyAndRedirect}
              disabled={!customizedText}
              className="bg-emerald-800 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>{isZh ? '已复制！跳转中...' : 'Copied! Opening...'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>
                    {isZh ? `复制并前往 ${platform}` : `Copy & Open ${platform}`}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

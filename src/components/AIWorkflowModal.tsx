import React, { useState, useEffect } from 'react';
import { BrandConfig, Language, WorkflowStageLog } from '../types';
import { LocationDetails } from '../utils/locationService';
import { TRANSLATIONS } from '../utils/translations';
import { 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Loader2, 
  ArrowRight, 
  X, 
  Wand2, 
  Compass, 
  AlertCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Palette,
  RotateCcw
} from 'lucide-react';

interface AIWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBrand: (brand: BrandConfig) => void;
  language: Language;
  currentBrand: BrandConfig;
  availableBrands: BrandConfig[];
  currentLocation: LocationDetails;
}

export const AIWorkflowModal: React.FC<AIWorkflowModalProps> = ({
  isOpen,
  onClose,
  onSelectBrand,
  language,
  currentBrand,
  availableBrands,
  currentLocation
}) => {
  const isZh = language === 'zh' || language === 'zh-TW';
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const translateWarning = (warning: string) => {
    if (/没有返回可验证来源/.test(warning)) return 'No verifiable sources were returned. Do not publish this as official merchant information.';
    if (/商家名称与输入名称不一致/.test(warning)) return 'The search result did not match the requested merchant, so unrelated store, menu, social and phone data was removed.';
    if (/地图候选门店名称与输入商家不一致/.test(warning)) return 'A mismatched Google Maps location was removed to avoid showing another restaurant.';
    if (/尚未确认.*门店地址和电话/.test(warning)) return 'No exact-match store address and phone number could be verified yet.';
    if (/尚未找到.*真实菜单和菜品图片/.test(warning)) return 'No source-backed menu or dish images could be verified yet.';
    if (/尚未找到.*社交媒体主页/.test(warning)) return 'No source-backed merchant social profiles could be verified yet.';
    return 'Some merchant information could not be verified from the available sources.';
  };

  // Custom Input State
  const [restaurantName, setRestaurantName] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [cuisineType, setCuisineType] = useState('');
  const [city, setCity] = useState(currentLocation.city || currentLocation.cityZh || 'Current location');
  const [menuNotes, setMenuNotes] = useState('');
  const [targetColor, setTargetColor] = useState('');

  // Workflow execution state
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stageLogs, setStageLogs] = useState<WorkflowStageLog[]>([]);
  const [generatedBrand, setGeneratedBrand] = useState<BrandConfig | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset workflow result when modal opens
  useEffect(() => {
    if (isOpen) {
      setCity(currentLocation.city || currentLocation.cityZh || 'Current location');
      setIsRunning(false);
      setGeneratedBrand(null);
      setStageLogs([]);
      setErrorMessage(null);
    }
  }, [isOpen, currentLocation.city, currentLocation.cityZh]);

  // Quick 1-click Preset Templates
  const presets = [
    {
      nameEn: 'Juan Xiang Hunan Bistro', nameZh: '眷湘湖南菜',
      cuisineEn: 'Authentic Hunan Cuisine', cuisineZh: '地道热辣湘菜',
      city: 'Shanghai / Changsha',
      color: '#C41212',
      icon: '🌶️',
      badgeEn: 'Hunan chili pork', badgeZh: '招牌辣椒炒肉'
    },
    {
      nameEn: 'Luckin Coffee', nameZh: '瑞幸咖啡',
      cuisineEn: 'Specialty Coffee and Coconut Latte', cuisineZh: '现磨咖啡与生椰系列',
      city: 'Shanghai',
      color: '#002266',
      icon: '☕️',
      badgeEn: 'Coconut latte', badgeZh: '生椰销冠'
    },
    {
      nameEn: 'Tai Er Sauerkraut Fish', nameZh: '太二酸菜鱼',
      cuisineEn: 'Sour and Spicy Fish', cuisineZh: '经典老坛酸菜鱼',
      city: 'Guangzhou / Shanghai',
      color: '#E65100',
      icon: '🐟',
      badgeEn: 'Signature fish', badgeZh: '酸菜比鱼好吃'
    },
    {
      nameEn: 'Saizeriya', nameZh: '萨莉亚',
      cuisineEn: 'Casual Italian Bistro', cuisineZh: '意式家庭平价休闲餐厅',
      city: 'Shanghai',
      color: '#00873E',
      icon: '🍝',
      badgeEn: 'Casual Italian', badgeZh: '平价意餐'
    },
    {
      nameEn: 'Haidilao Hotpot', nameZh: '海底捞火锅',
      cuisineEn: 'Sichuan Hotpot', cuisineZh: '川味经典火锅',
      city: 'Shanghai / Beijing',
      color: '#D80018',
      icon: '🍲',
      badgeEn: 'Signature service', badgeZh: '贴心服务'
    },
    {
      nameEn: 'HEYTEA', nameZh: '喜茶',
      cuisineEn: 'Fresh Fruit and Cheese Tea', cuisineZh: '鲜果茶与芝士茗茶',
      city: 'Shenzhen / Hangzhou',
      color: '#1A1A1A',
      icon: '🧋',
      badgeEn: 'Fresh fruit tea', badgeZh: '真果现萃'
    },
    {
      nameEn: 'Shake Shack', nameZh: '昔客堡',
      cuisineEn: 'American Smash Burgers', cuisineZh: '美式安格斯汉堡',
      city: 'New York / Shanghai',
      color: '#5A8F34',
      icon: '🍔',
      badgeEn: 'Angus beef', badgeZh: '安格斯牛肉'
    }
  ];

  if (!isOpen) return null;

  const defaultSteps: WorkflowStageLog[] = [
    { id: '1', title: 'Tavily web identity research', titleZh: '1. Tavily 餐厅身份与官网检索', status: 'pending', detail: 'Finding source-backed official pages and merchant profiles' },
    { id: '2', title: 'Menu and media source extraction', titleZh: '2. 真实菜单、菜品与媒体来源抽取', status: 'pending', detail: 'Keeping only menu items and images supported by source pages' },
    { id: '3', title: 'Google Maps branch matching', titleZh: '3. Google Maps 最近门店与联系方式匹配', status: 'pending', detail: 'Matching the nearest branch using device location when allowed' },
    { id: '4', title: 'Dynamic review keywords & social links', titleZh: '4. 动态评价关键词与社交媒体校验', status: 'pending', detail: 'Generating keywords from the sourced restaurant and menu' },
    { id: '5', title: 'Theme Deployment & Live Hot-Swap', titleZh: '5. 架构校验与全平台即刻上线', status: 'pending', detail: 'Deploying generated restaurant configuration to live interface' }
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setRestaurantName(isZh ? preset.nameZh : preset.nameEn);
    setCuisineType(isZh ? preset.cuisineZh : preset.cuisineEn);
    setTargetColor(preset.color);
    setCity(preset.city);
    // Crucial: reset previous generation state so new generation can be triggered immediately
    setGeneratedBrand(null);
    setStageLogs([]);
    setErrorMessage(null);
  };

  const handleClearInput = () => {
    setRestaurantName('');
    setCuisineType('');
    setTargetColor('');
    setMenuNotes('');
    setGeneratedBrand(null);
    setStageLogs([]);
    setErrorMessage(null);
  };

  const handleRunWorkflow = async () => {
    if (!restaurantName.trim()) {
      setErrorMessage(isZh ? '请输入您想创建的餐馆名称（如：眷湘、瑞幸咖啡、太二酸菜鱼...）' : 'Please enter a restaurant name (e.g., Juan Xiang, Luckin Coffee, Tai Er...)');
      return;
    }

    setErrorMessage(null);
    setIsRunning(true);
    setGeneratedBrand(null);
    setStageLogs(defaultSteps.map((s, idx) => ({
      ...s,
      status: idx === 0 ? 'running' : 'pending'
    })));

    try {
      // Trigger API in backend
      const responsePromise = fetch('/api/workflow/generate-restaurant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: restaurantName,
          cuisineType: cuisineType || 'Authentic Dining',
          city: city || 'Shanghai',
          menuInput: menuNotes,
          targetColor: targetColor || '',
          language,
          // Reuse the location already resolved by the main page. A second short-lived
          // browser permission request can fail and silently fall back to the wrong city.
          userLatitude: currentLocation.latitude,
          userLongitude: currentLocation.longitude
        })
      });

      // Animated multi-step progression
      for (let i = 0; i < defaultSteps.length - 1; i++) {
        await new Promise((r) => setTimeout(r, 600));
        setCurrentStepIndex(i + 1);
        setStageLogs((prev) =>
          prev.map((step, idx) => {
            if (idx <= i) return { ...step, status: 'completed' };
            if (idx === i + 1) return { ...step, status: 'running' };
            return step;
          })
        );
      }

      const res = await responsePromise;
      const data = await res.json();

      if (data.success && data.brand) {
        setStageLogs((prev) =>
          prev.map((s) => ({ ...s, status: 'completed' }))
        );
        setGeneratedBrand(data.brand);
      } else {
        throw new Error(data.error || 'Workflow execution failed');
      }
    } catch (err: any) {
      console.error('Workflow error:', err);
      setErrorMessage(err.message || 'Workflow failed');
      setStageLogs((prev) =>
        prev.map((s, idx) =>
          idx === currentStepIndex ? { ...s, status: 'failed' } : s
        )
      );
    } finally {
      setIsRunning(false);
    }
  };

  const handleLaunchGeneratedBrand = () => {
    if (generatedBrand) {
      onSelectBrand(generatedBrand);
      setGeneratedBrand(null);
      setStageLogs([]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="ai-workflow-modal"
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-950 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center font-black shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight flex items-center gap-2">
                {t.customRestaurant}
                <span className="text-[10px] uppercase font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  {isZh ? '智能网络检索' : 'Web Research Assistant'}
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                {isZh 
                  ? '仅需输入餐厅名称，AI 工作流全自动从网络与知识库检索菜单、品牌色、招牌菜与门店' 
                  : 'Simply enter a restaurant name — AI retrieves real menu items, colors, branding & stores automatically.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm text-neutral-800">
          
          {/* Main Search & Restaurant Name Bar */}
          <div className="bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-white p-4 rounded-2xl border-2 border-amber-300 shadow-sm space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-amber-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-amber-600" />
                {isZh ? '请输入您想生成的餐馆名称 (核心输入)' : 'Restaurant Name to Generate'}
              </span>
              <span className="text-[11px] font-normal text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-full">
                {isZh ? '✨ 自动检索菜单与风格' : '✨ Auto-fetches menu & style'}
              </span>
            </label>

            <div className="relative">
              <input
                type="text"
                value={restaurantName}
                onChange={(e) => {
                  setRestaurantName(e.target.value);
                  if (!showAdvanced) {
                    setCuisineType('');
                    setTargetColor('');
                    setMenuNotes('');
                  }
                  if (generatedBrand) {
                    setGeneratedBrand(null);
                    setStageLogs([]);
                    setErrorMessage(null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isRunning && restaurantName.trim()) {
                    handleRunWorkflow();
                  }
                }}
                placeholder={isZh ? '输入任意店名，例如：mumu hot pot、眷湘、瑞幸咖啡、海底捞、太二酸菜鱼...' : 'Enter any brand, e.g. Mumu Hot Pot, Juan Xiang, Luckin Coffee, In-N-Out...'}
                className="w-full pl-4 pr-12 py-3 text-sm font-semibold rounded-xl border border-amber-300 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-xs"
              />
              {restaurantName && (
                <button
                  type="button"
                  onClick={handleClearInput}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1 text-xs cursor-pointer"
                  title="Clear"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Inspiration Pills */}
            <div>
              <div className="text-[11px] font-bold text-neutral-500 mb-1.5 flex items-center gap-1">
                <Compass className="w-3 h-3 text-amber-600" />
                <span>{isZh ? '热门品牌一键填入测试：' : 'Quick test inspirations:'}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((preset) => (
                  <button
                    key={preset.nameEn}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      restaurantName === (isZh ? preset.nameZh : preset.nameEn)
                        ? 'border-amber-500 bg-amber-500 text-white shadow-xs'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-amber-50 hover:border-amber-300'
                    }`}
                  >
                    <span>{preset.icon}</span>
                    <span>{isZh ? preset.nameZh : preset.nameEn}</span>
                    <span className="text-[10px] opacity-75 font-normal">({isZh ? preset.badgeZh : preset.badgeEn})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Advanced Custom Tuning (Collapsible) */}
          <div className="border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50/50">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-neutral-500" />
                {isZh ? '高级自定义选项 (可选微调)' : 'Advanced Tuning (Optional)'}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                {showAdvanced ? (isZh ? '收起' : 'Hide') : (isZh ? '展开' : 'Expand')}
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </span>
            </button>

            {showAdvanced && (
              <div className="p-4 pt-2 space-y-3 border-t border-neutral-200 bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      {isZh ? '菜系与概念 (可选)' : 'Cuisine & Concept (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={cuisineType}
                      onChange={(e) => setCuisineType(e.target.value)}
                      placeholder={isZh ? '留空由 AI 自动识别' : 'Leave empty for AI auto-detection'}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-neutral-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      {isZh ? '所在城市 / 商圈' : 'City / Business Hub'}
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Shanghai, Beijing, Tokyo, New York..."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-neutral-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1 flex items-center justify-between">
                      <span>{isZh ? '指定品牌主色调' : 'Custom Brand Hex Color'}</span>
                      <span className="text-[10px] text-neutral-400">{targetColor || (isZh ? 'AI 自动分析' : 'AI Auto')}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={targetColor || '#D80018'}
                        onChange={(e) => setTargetColor(e.target.value)}
                        className="w-8 h-8 rounded border border-neutral-300 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={targetColor}
                        onChange={(e) => setTargetColor(e.target.value)}
                        placeholder="#D80018 (留空由AI匹配)"
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-neutral-300 bg-neutral-50 focus:bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      {isZh ? '指定招牌菜 (可选)' : 'Custom Dish Notes (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={menuNotes}
                      onChange={(e) => setMenuNotes(e.target.value)}
                      placeholder={isZh ? '例如：生椰拿铁、香辣鸡翅...' : 'e.g. Raw Coconut Latte...'}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-neutral-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Workflow Stage Logs Monitor */}
          {(isRunning || stageLogs.length > 0) && (
            <div className="bg-neutral-950 text-neutral-200 p-4 rounded-xl border border-neutral-800 space-y-2.5 font-mono text-xs shadow-inner">
              <div className="flex items-center justify-between text-neutral-400 border-b border-neutral-800 pb-2 mb-2 font-sans font-bold">
                <span className="flex items-center gap-2 text-amber-400">
                  <Layers className="w-4 h-4" />
                  {isZh ? 'AI 自动化生成执行管线' : 'AI Autonomous Workflow Pipeline'}
                </span>
                <span className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded text-neutral-300">
                  {isRunning ? 'RETRIEVING & GENERATING' : generatedBrand ? 'COMPLETED' : 'IDLE'}
                </span>
              </div>

              {stageLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2.5 text-xs">
                  {log.status === 'completed' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {log.status === 'running' && (
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0 mt-0.5" />
                  )}
                  {log.status === 'pending' && (
                    <div className="w-4 h-4 rounded-full border border-neutral-700 shrink-0 mt-0.5" />
                  )}
                  {log.status === 'failed' && (
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className={`font-semibold ${
                      log.status === 'completed' ? 'text-emerald-300' :
                      log.status === 'running' ? 'text-amber-300 animate-pulse' :
                      'text-neutral-500'
                    }`}>
                      {isZh ? log.titleZh : log.title}
                    </div>
                    <div className="text-[11px] text-neutral-400 font-sans">
                      {log.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Generated Success Card Preview */}
          {generatedBrand && (
            <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/70 text-emerald-950 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={generatedBrand.logo}
                    alt={generatedBrand.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                      <span>{isZh ? generatedBrand.nameZh : generatedBrand.name}</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-xs text-emerald-700 line-clamp-1">
                      {isZh ? generatedBrand.taglineZh : generatedBrand.tagline}
                    </div>
                  </div>
                </div>
                <div 
                  className="w-6 h-6 rounded-full border border-white shadow-xs" 
                  style={{ backgroundColor: generatedBrand.primaryColor }}
                  title="Theme Color"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs bg-white/70 p-2.5 rounded-lg border border-emerald-200">
                <div>
                  <div className="font-bold text-emerald-900">{generatedBrand.stores.length}</div>
                  <div className="text-[10px] text-emerald-600">{isZh ? '真实门店' : 'Stores'}</div>
                </div>
                <div>
                  <div className="font-bold text-emerald-900">{generatedBrand.menu.length}</div>
                  <div className="text-[10px] text-emerald-600">{isZh ? '招牌菜品' : 'Dishes'}</div>
                </div>
                <div>
                  <div className="font-bold text-emerald-900">{generatedBrand.socials.length}</div>
                  <div className="text-[10px] text-emerald-600">{isZh ? '口碑矩阵' : 'Channels'}</div>
                </div>
              </div>

              {generatedBrand.warnings?.map((warning) => (
                <div key={warning} className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{isZh ? warning : translateWarning(warning)}</span>
                </div>
              ))}

              {generatedBrand.sources && generatedBrand.sources.length > 0 && (
                <div className="rounded-lg border border-emerald-200 bg-white/80 p-2.5 text-xs">
                  <div className="mb-1.5 font-bold text-emerald-900">
                    {isZh ? `检索来源 (${generatedBrand.sources.length})` : `Research sources (${generatedBrand.sources.length})`}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {generatedBrand.sources.slice(0, 6).map((source, index) => (
                      <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="max-w-full truncate rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-800 hover:bg-emerald-100" title={source.url}>
                        {isZh ? source.title : `Source ${index + 1}`}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-neutral-50 px-5 py-3.5 border-t border-neutral-200 flex items-center justify-between gap-3">
          <div className="text-xs text-neutral-500">
            {generatedBrand?.generationMode === 'template'
              ? (isZh ? '结构演示模式 · 资料未核验' : 'Template preview · data not verified')
              : generatedBrand?.researchProvider === 'gemini-tavily-maps'
                ? (isZh ? '基于 Gemini + Tavily + Google Maps 的来源校验' : 'Gemini with Tavily + Google Maps grounding')
                : (isZh ? '基于 Gemini + Google Search / Maps 的来源校验' : 'Gemini with Google Search / Maps grounding')}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              {isZh ? '关闭' : 'Cancel'}
            </button>

            {generatedBrand ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setGeneratedBrand(null);
                    setStageLogs([]);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-neutral-700 bg-neutral-200 hover:bg-neutral-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isZh ? '重新生成' : 'Regenerate'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchGeneratedBrand}
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 animate-pulse"
                >
                  <span>{isZh ? '🚀 即刻上线并查看此餐厅' : '🚀 Launch This Restaurant'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={isRunning || !restaurantName.trim()}
                onClick={handleRunWorkflow}
                className={`px-5 py-2.5 rounded-xl text-xs font-black text-neutral-950 flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                  isRunning || !restaurantName.trim()
                    ? 'bg-amber-300/50 text-neutral-400 cursor-not-allowed'
                    : 'bg-amber-400 hover:bg-amber-300 active:scale-95'
                }`}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isZh ? 'AI 正在检索并生成...' : 'Generating Hub...'}</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>{isZh ? '✨ 生成自定义餐馆' : '✨ Generate Custom Restaurant'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

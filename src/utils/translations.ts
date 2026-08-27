import { Language } from '../types';

export interface TranslationDict {
  navSocials: string;
  navReviews: string;
  navOrder: string;
  navContact: string;
  customRestaurant: string;
  fromLocation: string;
  itemCountLabel: string;
  
  socialsTitle: string;
  visitProfile: string;
  copyHandle: string;
  copied: string;
  
  reviewsTitle: string;
  aiPolishTitle: string;
  chooseApp: string;
  keywordPrompts: string;
  draftNotesPlaceholder: string;
  polishBtn: string;
  polishing: string;
  copyAndOpen: string;
  recentReviewsTitle: string;
  like: string;
  verifiedCustomer: string;
  
  orderTitle: string;
  pickup: string;
  delivery: string;
  openStatus: string;
  refreshGps: string;
  switchStore: string;
  currentLocationText: string;
  detectingLocation: string;
  changeLocation: string;
  searchPlaceholder: string;
  allCategory: string;
  selectSpec: string;
  viewCart: string;
  checkout: string;
  clearCart: string;
  customerName: string;
  customerPhone: string;
  total: string;
  placeOrder: string;
  
  contactTitle: string;
  hotlineTitle: string;
  call: string;
  copy: string;
  onlineConcierge: string;
  inquire: string;
}

export const TRANSLATIONS: Record<Language, TranslationDict> = {
  en: {
    navSocials: 'Socials',
    navReviews: 'Rate & Reviews',
    navOrder: 'Menu & Stores',
    navContact: 'Contact',
    customRestaurant: 'Custom Restaurant',
    fromLocation: 'from your location',
    itemCountLabel: 'Items',
    
    socialsTitle: 'Social Media Matrix',
    visitProfile: 'Visit Profile',
    copyHandle: 'Copy Handle',
    copied: 'Copied',
    
    reviewsTitle: 'Customer Reviews & Rating',
    aiPolishTitle: 'AI Review Polish',
    chooseApp: 'Select Platform',
    keywordPrompts: 'Tap Keywords to Add Prompt',
    draftNotesPlaceholder: 'Tap prompt keywords above or type custom notes...',
    polishBtn: 'Polish with AI',
    polishing: 'AI Polishing...',
    copyAndOpen: 'Copy & Open',
    recentReviewsTitle: 'Recent Customer Reviews',
    like: 'Like',
    verifiedCustomer: 'Verified Customer',
    
    orderTitle: 'Official Menu & Stores',
    pickup: 'Pickup',
    delivery: 'Delivery',
    openStatus: 'Open Now',
    refreshGps: 'GPS Locate',
    switchStore: 'Switch Store',
    currentLocationText: 'Current Location',
    detectingLocation: 'Locating GPS...',
    changeLocation: 'Change Location',
    searchPlaceholder: 'Search drinks, dishes, specials...',
    allCategory: 'All',
    selectSpec: 'View Details',
    viewCart: 'Cart',
    checkout: 'Checkout',
    clearCart: 'Clear',
    customerName: 'Customer Name',
    customerPhone: 'Phone Number',
    total: 'Total',
    placeOrder: 'Confirm Order',
    
    contactTitle: 'Contact & Support',
    hotlineTitle: 'Customer Care Hotline',
    call: 'Call',
    copy: 'Copy',
    onlineConcierge: 'Online Concierge',
    inquire: 'Contact'
  },
  
  zh: {
    navSocials: '社交媒体',
    navReviews: '用户评价',
    navOrder: '精选菜单',
    navContact: '联系方式',
    customRestaurant: '自定义餐馆',
    fromLocation: '离当前定位',
    itemCountLabel: '项',
    
    socialsTitle: '官方社交媒体矩阵',
    visitProfile: '访问主页',
    copyHandle: '复制账号',
    copied: '已复制',
    
    reviewsTitle: '用户评价与AI点评',
    aiPolishTitle: 'AI 智能润色好评',
    chooseApp: '选择直达平台',
    keywordPrompts: '点击提示词一键填入',
    draftNotesPlaceholder: '可点击上方提示词或自由输入评价要点...',
    polishBtn: 'AI 智能润色',
    polishing: 'AI 生成中...',
    copyAndOpen: '复制好评并直达',
    recentReviewsTitle: '最新用户评价',
    like: '赞同',
    verifiedCustomer: '已验证顾客',
    
    orderTitle: '官方精选菜单与门店',
    pickup: '到店自提',
    delivery: '外卖配送',
    openStatus: '营业中',
    refreshGps: 'GPS定位',
    switchStore: '切换门店',
    currentLocationText: '当前定位',
    detectingLocation: '正在获取定位...',
    changeLocation: '修改位置',
    searchPlaceholder: '搜索招牌菜品、饮品、时令单品...',
    allCategory: '全部品类',
    selectSpec: '查看详情',
    viewCart: '点餐袋',
    checkout: '去结算',
    clearCart: '清空',
    customerName: '取餐人姓名',
    customerPhone: '联系电话',
    total: '合计应付',
    placeOrder: '确认下单',
    
    contactTitle: '官方联系方式与门店热线',
    hotlineTitle: '官方客户服务热线',
    call: '一键拨打',
    copy: '复制号码',
    onlineConcierge: '品牌数字化专属客服',
    inquire: '立即咨询'
  },

  'zh-TW': {
    navSocials: '社群媒體',
    navReviews: '顧客評價',
    navOrder: '精選菜單',
    navContact: '聯絡方式',
    customRestaurant: '自訂餐廳',
    fromLocation: '距離目前位置',
    itemCountLabel: '項',
    
    socialsTitle: '官方社群媒體矩陣',
    visitProfile: '前往首頁',
    copyHandle: '複製帳號',
    copied: '已複製',
    
    reviewsTitle: '顧客評價與AI點評',
    aiPolishTitle: 'AI 智慧潤色好評',
    chooseApp: '選擇直達平台',
    keywordPrompts: '點擊提示詞一鍵填入',
    draftNotesPlaceholder: '可點擊上方提示詞或自由輸入評價重點...',
    polishBtn: 'AI 智慧潤色',
    polishing: 'AI 生成中...',
    copyAndOpen: '複製好評並直達',
    recentReviewsTitle: '最新顧客評價',
    like: '讚同',
    verifiedCustomer: '已驗證顧客',
    
    orderTitle: '隨行卡行動點餐',
    pickup: '到店自取',
    delivery: '外送服務',
    openStatus: '營業中',
    refreshGps: 'GPS定位',
    switchStore: '切換門市',
    currentLocationText: '目前位置',
    detectingLocation: '正在獲取定位...',
    changeLocation: '修改位置',
    searchPlaceholder: '搜尋美式、馥芮白、抹茶那堤、星冰樂...',
    allCategory: '全部',
    selectSpec: '選規格',
    viewCart: '購物袋',
    checkout: '去結帳',
    clearCart: '清空',
    customerName: '取餐人姓名',
    customerPhone: '聯絡電話',
    total: '合計應付',
    placeOrder: '確認下單',
    
    contactTitle: '官方聯絡方式與門市熱線',
    hotlineTitle: '星巴克官方顧客服務專線',
    call: '撥打電話',
    copy: '複製號碼',
    onlineConcierge: '星巴克數位專屬客服',
    inquire: '立即諮詢'
  },

  ja: {
    navSocials: 'SNS',
    navReviews: 'レビュー',
    navOrder: '注文',
    navContact: 'お問い合わせ',
    customRestaurant: 'レストランをカスタマイズ',
    fromLocation: '現在地から',
    itemCountLabel: '品',
    
    socialsTitle: '公式SNSアカウント',
    visitProfile: 'ページを開く',
    copyHandle: 'コピー',
    copied: 'コピー完了',
    
    reviewsTitle: 'カスタマーレビュー',
    aiPolishTitle: 'AIレビュー作成',
    chooseApp: '投稿先アプリを選択',
    keywordPrompts: 'キーワードをタップして挿入',
    draftNotesPlaceholder: 'キーワードを選択するかメモを入力...',
    polishBtn: 'AIで推敲・作成',
    polishing: 'AI生成中...',
    copyAndOpen: 'コピーしてアプリを開く',
    recentReviewsTitle: '最新のお客様レビュー',
    like: 'いいね',
    verifiedCustomer: '認証済みのお客様',
    
    orderTitle: 'モバイルオーダー＆メニュー',
    pickup: '店舗受取',
    delivery: 'デリバリー',
    openStatus: '営業中',
    refreshGps: 'GPS更新',
    switchStore: '店舗切替',
    currentLocationText: '現在地',
    detectingLocation: '位置情報取得中...',
    changeLocation: '場所を変更',
    searchPlaceholder: 'ドリンク、コーヒー、ベーカリーを検索...',
    allCategory: 'すべて',
    selectSpec: 'カスタマイズ',
    viewCart: 'カート',
    checkout: 'お会計へ',
    clearCart: 'クリア',
    customerName: 'お名前',
    customerPhone: '電話番号',
    total: '合計',
    placeOrder: '注文を確定する',
    
    contactTitle: 'お問い合わせ・サポート',
    hotlineTitle: 'お客様相談窓口',
    call: '電話する',
    copy: 'コピー',
    onlineConcierge: 'オンラインコンシェルジュ',
    inquire: '問い合わせる'
  },

  ko: {
    navSocials: '소셜 미디어',
    navReviews: '고객 리뷰',
    navOrder: '사이렌 오더',
    navContact: '연락처',
    customRestaurant: '맞춤 레스토랑',
    fromLocation: '현재 위치에서',
    itemCountLabel: '개',
    
    socialsTitle: '공식 소셜 미디어',
    visitProfile: '프로필 방문',
    copyHandle: '아이디 복사',
    copied: '복사 완료',
    
    reviewsTitle: '고객 리뷰 및 AI 별점',
    aiPolishTitle: 'AI 스마트 리뷰 다듬기',
    chooseApp: '플랫폼 선택',
    keywordPrompts: '키워드를 터치하여 입력',
    draftNotesPlaceholder: '위 키워드를 선택하거나 직접 메모를 입력하세요...',
    polishBtn: 'AI로 리뷰 다듬기',
    polishing: 'AI 생성 중...',
    copyAndOpen: '복사 후 앱으로 이동',
    recentReviewsTitle: '최신 고객 리뷰',
    like: '좋아요',
    verifiedCustomer: '인증된 고객',
    
    orderTitle: '사이렌 오더 & 메뉴',
    pickup: '매장 픽업',
    delivery: '딜리버스',
    openStatus: '영업 중',
    refreshGps: 'GPS 새로고침',
    switchStore: '매장 변경',
    currentLocationText: '현재 위치',
    detectingLocation: '위치 확인 중...',
    changeLocation: '위치 변경',
    searchPlaceholder: '음료, 커피, 푸드 검색...',
    allCategory: '전체',
    selectSpec: '옵션 선택',
    viewCart: '장바구니',
    checkout: '결제하기',
    clearCart: '비우기',
    customerName: '주문자 이름',
    customerPhone: '연락처',
    total: '총 결제 금액',
    placeOrder: '주문 완료하기',
    
    contactTitle: '고객센터 & 매장 안내',
    hotlineTitle: '스타벅스 고객상담실',
    call: '전화 걸기',
    copy: '번호 복사',
    onlineConcierge: '디지털 컨시어지 상담',
    inquire: '문의하기'
  },

  es: {
    navSocials: 'Redes',
    navReviews: 'Reseñas',
    navOrder: 'Pedir',
    navContact: 'Contacto',
    customRestaurant: 'Restaurante personalizado',
    fromLocation: 'desde tu ubicación',
    itemCountLabel: 'artículos',
    
    socialsTitle: 'Redes Sociales Oficiales',
    visitProfile: 'Ver Perfil',
    copyHandle: 'Copiar',
    copied: 'Copiado',
    
    reviewsTitle: 'Reseñas de Clientes',
    aiPolishTitle: 'Mejorar con IA',
    chooseApp: 'Seleccionar Plataforma',
    keywordPrompts: 'Toca palabras clave para añadir',
    draftNotesPlaceholder: 'Toca palabras clave o escribe notas...',
    polishBtn: 'Mejorar con IA',
    polishing: 'Generando con IA...',
    copyAndOpen: 'Copiar y Abrir',
    recentReviewsTitle: 'Reseñas Recientes',
    like: 'Me gusta',
    verifiedCustomer: 'Cliente Verificado',
    
    orderTitle: 'Menú y Pedidos Móviles',
    pickup: 'Recoger en Tienda',
    delivery: 'A Domicilio',
    openStatus: 'Abierto',
    refreshGps: 'Actualizar GPS',
    switchStore: 'Cambiar Tienda',
    currentLocationText: 'Ubicación Actual',
    detectingLocation: 'Obteniendo ubicación...',
    changeLocation: 'Cambiar ubicación',
    searchPlaceholder: 'Buscar bebidas, café...',
    allCategory: 'Todo',
    selectSpec: 'Seleccionar',
    viewCart: 'Bolsa',
    checkout: 'Pagar',
    clearCart: 'Vaciar',
    customerName: 'Nombre',
    customerPhone: 'Teléfono',
    total: 'Total',
    placeOrder: 'Confirmar Pedido',
    
    contactTitle: 'Contacto y Soporte',
    hotlineTitle: 'Línea de Atención al Cliente',
    call: 'Llamar',
    copy: 'Copiar',
    onlineConcierge: 'Conserje Virtual',
    inquire: 'Contactar'
  },

  fr: {
    navSocials: 'Réseaux',
    navReviews: 'Avis',
    navOrder: 'Commander',
    navContact: 'Contact',
    customRestaurant: 'Restaurant personnalisé',
    fromLocation: 'depuis votre position',
    itemCountLabel: 'articles',
    
    socialsTitle: 'Réseaux Sociaux Officiels',
    visitProfile: 'Voir le Profil',
    copyHandle: 'Copier',
    copied: 'Copié',
    
    reviewsTitle: 'Avis Clients & Notation',
    aiPolishTitle: 'Optimiser avec l’IA',
    chooseApp: 'Choisir la Plateforme',
    keywordPrompts: 'Appuyez pour insérer des mots-clés',
    draftNotesPlaceholder: 'Sélectionnez des mots-clés ou écrivez...',
    polishBtn: 'Optimiser avec l’IA',
    polishing: 'Génération IA...',
    copyAndOpen: 'Copier & Ouvrir',
    recentReviewsTitle: 'Avis Récents',
    like: 'Utile',
    verifiedCustomer: 'Client Vérifié',
    
    orderTitle: 'Menu & Commande Mobile',
    pickup: 'À Emporter',
    delivery: 'Livraison',
    openStatus: 'Ouvert',
    refreshGps: 'Actualiser GPS',
    switchStore: 'Changer de Magasin',
    currentLocationText: 'Position Actuelle',
    detectingLocation: 'Localisation GPS...',
    changeLocation: 'Modifier position',
    searchPlaceholder: 'Rechercher boissons, café...',
    allCategory: 'Tous',
    selectSpec: 'Personnaliser',
    viewCart: 'Panier',
    checkout: 'Commander',
    clearCart: 'Vider',
    customerName: 'Nom',
    customerPhone: 'Téléphone',
    total: 'Total',
    placeOrder: 'Confirmer la Commande',
    
    contactTitle: 'Contact & Support',
    hotlineTitle: 'Service Clientèle',
    call: 'Appeler',
    copy: 'Copier',
    onlineConcierge: 'Conciergerie en Ligne',
    inquire: 'Contacter'
  },

  de: {
    navSocials: 'Social',
    navReviews: 'Bewertungen',
    navOrder: 'Bestellen',
    navContact: 'Kontakt',
    customRestaurant: 'Individuelles Restaurant',
    fromLocation: 'von Ihrem Standort',
    itemCountLabel: 'Artikel',
    
    socialsTitle: 'Soziale Medien',
    visitProfile: 'Profil öffnen',
    copyHandle: 'Kopieren',
    copied: 'Kopiert',
    
    reviewsTitle: 'Kundenbewertungen',
    aiPolishTitle: 'Mit KI verfeinern',
    chooseApp: 'Plattform wählen',
    keywordPrompts: 'Schlagwörter antippen zum Einfügen',
    draftNotesPlaceholder: 'Schlagwörter wählen oder Text eingeben...',
    polishBtn: 'Mit KI verfeinern',
    polishing: 'KI generiert...',
    copyAndOpen: 'Kopieren & Öffnen',
    recentReviewsTitle: 'Neueste Kundenbewertungen',
    like: 'Gefällt mir',
    verifiedCustomer: 'Verifizierter Kunde',
    
    orderTitle: 'Speisekarte & Bestellung',
    pickup: 'Abholung',
    delivery: 'Lieferung',
    openStatus: 'Geöffnet',
    refreshGps: 'GPS aktualisieren',
    switchStore: 'Filiale wechseln',
    currentLocationText: 'Aktueller Standort',
    detectingLocation: 'Standort wird ermittelt...',
    changeLocation: 'Standort ändern',
    searchPlaceholder: 'Getränke, Kaffee suchen...',
    allCategory: 'Alle',
    selectSpec: 'Auswählen',
    viewCart: 'Warenkorb',
    checkout: 'Zur Kasse',
    clearCart: 'Leeren',
    customerName: 'Name',
    customerPhone: 'Telefonnummer',
    total: 'Gesamt',
    placeOrder: 'Bestellung aufgeben',
    
    contactTitle: 'Kontakt & Kundendienst',
    hotlineTitle: 'Kundenservice-Hotline',
    call: 'Anrufen',
    copy: 'Kopieren',
    onlineConcierge: 'Online-Service',
    inquire: 'Kontaktieren'
  }
};

export const LANGUAGE_OPTIONS: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'zh', label: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', label: '繁體中文', flag: '🇭🇰' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

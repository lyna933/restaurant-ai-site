// Restaurant Workflow & Knowledge Base Generator

export interface InferredBrandInfo {
  cuisineEn: string;
  cuisineZh: string;
  themeColor: string;
  accentColor: string;
  bgColor: string;
  tagline: string;
  taglineZh: string;
  category: 'hotpot' | 'hunan' | 'fish' | 'tea' | 'coffee' | 'burger' | 'italian' | 'japanese' | 'bbq' | 'general';
}

export function inferBrandCategory(name: string, userSpecifiedCuisine: string = ''): InferredBrandInfo {
  const text = `${name} ${userSpecifiedCuisine}`.toLowerCase();

  // 1. Hot Pot (e.g. Mumu Hot Pot, Haidilao, Shabu Shabu, etc.)
  if (
    text.includes('hot pot') ||
    text.includes('hotpot') ||
    text.includes('火锅') ||
    text.includes('mumu') ||
    text.includes('haidilao') ||
    text.includes('shabu') ||
    text.includes('海底捞')
  ) {
    return {
      category: 'hotpot',
      cuisineEn: 'Authentic Sichuan & Classic Hotpot',
      cuisineZh: '川味特色火锅 · 鲜切原肉与慢熬鲜汤',
      themeColor: '#D80018',
      accentColor: '#FEE2E2',
      bgColor: '#FFF8F8',
      tagline: 'Simmering broths, hand-cut prime meats, and boiling hospitality in every pot.',
      taglineZh: '精熬醇厚锅底，严选鲜切原肉，传递沸腾的欢聚温情与地道川味。'
    };
  }

  // 2. Hunan Sizzling Cuisine (e.g. Juan Xiang 眷湘)
  if (
    text.includes('眷湘') ||
    text.includes('juanxiang') ||
    text.includes('juan xiang') ||
    text.includes('hunan') ||
    text.includes('湘菜') ||
    text.includes('辣椒炒肉') ||
    text.includes('剁椒')
  ) {
    return {
      category: 'hunan',
      cuisineEn: 'Authentic Hunan Spicy Cuisine & Sizzling Wok Dishes',
      cuisineZh: '湖湘风味 · 经典现炒与招牌剁椒鱼头',
      themeColor: '#C41212',
      accentColor: '#FEE2E2',
      bgColor: '#FFFBF7',
      tagline: 'Sizzling wok aroma, authentic Hunan spice, and genuine lake-and-mountain hospitality.',
      taglineZh: '热辣生香，地道湖湘风味 · 现炒锅气，传承经典湘菜烹饪技艺。'
    };
  }

  // 3. Tai Er Sauerkraut Fish (太二酸菜鱼)
  if (
    text.includes('太二') ||
    text.includes('tai er') ||
    text.includes('taier') ||
    text.includes('酸菜鱼') ||
    text.includes('sauerkraut fish')
  ) {
    return {
      category: 'fish',
      cuisineEn: 'Sour Spicy Sauerkraut Fish & Szechuan Delicacies',
      cuisineZh: '经典老坛酸菜鱼 · 鲜麻酸爽',
      themeColor: '#E65100',
      accentColor: '#FFEDD5',
      bgColor: '#FFFDF9',
      tagline: 'Our sauerkraut tastes even better than the fish. Authentic Sichuan flavors.',
      taglineZh: '酸菜比鱼好吃 · 甄选古法老坛腌制酸菜与新鲜活鱼，麻辣酸爽。'
    };
  }

  // 4. Tea & Fruit Beverages (e.g. HEYTEA 喜茶, BaWang ChaJi, etc.)
  if (
    text.includes('喜茶') ||
    text.includes('heytea') ||
    text.includes('tea') ||
    text.includes('boba') ||
    text.includes('奶茶') ||
    text.includes('茶') ||
    text.includes('chagee') ||
    text.includes('bawang') ||
    text.includes('coco') ||
    text.includes('nayuki')
  ) {
    return {
      category: 'tea',
      cuisineEn: 'New-Style Chinese Tea Drinks & Fresh Fruit Tea',
      cuisineZh: '新茶饮 · 原创芝士茶与时令鲜果茶',
      themeColor: '#1A1A1A',
      accentColor: '#F5EBE6',
      bgColor: '#FDFBF9',
      tagline: 'Inspiring tea, crafted with real milk, real tea, real fruit, and real sugar.',
      taglineZh: '真品质，不昂贵 · 坚持使用真奶、真茶、真果、真糖，激发灵感。'
    };
  }

  // 5. Coffee & Bakery (e.g. Luckin 瑞幸, Starbucks, Manner, etc.)
  if (
    text.includes('luckin') ||
    text.includes('瑞幸') ||
    text.includes('coffee') ||
    text.includes('cafe') ||
    text.includes('咖啡') ||
    text.includes('latte') ||
    text.includes('starbucks') ||
    text.includes('星巴克') ||
    text.includes('manner')
  ) {
    return {
      category: 'coffee',
      cuisineEn: 'Freshly Ground Specialty Coffee & Pastries',
      cuisineZh: '现磨精品咖啡与大师特调轻食',
      themeColor: '#002266',
      accentColor: '#E8F0FE',
      bgColor: '#F4F7FB',
      tagline: 'Professional freshly ground coffee crafted for everyday moments.',
      taglineZh: '幸运在握，专业咖啡新鲜现磨 · 每一杯都充满活力与灵感。'
    };
  }

  // 6. American Burgers & Fast Casual (e.g. Shake Shack, In-N-Out)
  if (
    text.includes('burger') ||
    text.includes('shack') ||
    text.includes('汉堡') ||
    text.includes('mcdonald') ||
    text.includes('kfc') ||
    text.includes('innout') ||
    text.includes('in-n-out')
  ) {
    return {
      category: 'burger',
      cuisineEn: 'Gourmet Angus Smash Burgers & Frozen Custards',
      cuisineZh: '美式现压安格斯牛肉堡与精酿奶昔',
      themeColor: '#5A8F34',
      accentColor: '#ECFDF5',
      bgColor: '#F8FAF9',
      tagline: '100% all-natural Angus beef, hormone-free and smashed to perfection.',
      taglineZh: '100%全天然安格斯牛肉，鲜嫩爆汁，搭配经典波浪薯条与精酿奶昔。'
    };
  }

  // 7. Italian / Pizza / Pasta (e.g. Saizeriya 萨莉亚)
  if (
    text.includes('saizeriya') ||
    text.includes('萨莉亚') ||
    text.includes('italian') ||
    text.includes('pizza') ||
    text.includes('pasta') ||
    text.includes('披萨') ||
    text.includes('意面')
  ) {
    return {
      category: 'italian',
      cuisineEn: 'Affordable Italian Bistro & Woodfired Pizza',
      cuisineZh: '意式平价家庭休闲西餐与手工披萨',
      themeColor: '#00873E',
      accentColor: '#EBF7EE',
      bgColor: '#F7FAF8',
      tagline: 'Everyday Italian dining made affordable, delicious, and joyful.',
      taglineZh: '平价美味的意式家庭厨房 · 丰富多元的意式美食与欢乐聚餐。'
    };
  }

  // Default / General
  return {
    category: 'general',
    cuisineEn: userSpecifiedCuisine || 'Contemporary Signature Dining',
    cuisineZh: '招牌特色餐饮与主厨推荐',
    themeColor: '#B91C1C',
    accentColor: '#FEE2E2',
    bgColor: '#FFF8F8',
    tagline: `Welcome to ${name}, crafting exceptional culinary moments every day.`,
    taglineZh: `精选新鲜天然食材与地道风味，在【${name}】感受高品质的用餐与点餐体验。`
  };
}

export function getAccurateDishImage(dishName: string, category: string = '', cuisine: string = ''): string {
  const text = `${dishName} ${category} ${cuisine}`.toLowerCase();

  // Hot pot items
  if (text.includes('noodle') || text.includes('面') || text.includes('捞面') || text.includes('拉面')) {
    return 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80';
  }
  if (text.includes('beef') || text.includes('肥牛') || text.includes('牛肉') || text.includes('wagyu') || text.includes('雪花')) {
    return 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&auto=format&fit=crop&q=80';
  }
  if (text.includes('shrimp') || text.includes('虾滑') || text.includes('海鲜') || text.includes('丸')) {
    return 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&auto=format&fit=crop&q=80';
  }
  if (text.includes('broth') || text.includes('soup') || text.includes('锅底') || text.includes('鸳鸯') || text.includes('番茄') || text.includes('麻辣')) {
    return 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&auto=format&fit=crop&q=80';
  }
  if (text.includes('tofu skin') || text.includes('响铃') || text.includes('腐竹') || text.includes('mushroom') || text.includes('菌菇') || text.includes('蔬菜') || text.includes('vegetable')) {
    return 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=600&auto=format&fit=crop&q=80';
  }

  // Hunan wok dishes
  if (text.includes('pork') || text.includes('辣椒炒肉') || text.includes('小炒肉') || text.includes('回锅肉')) {
    return 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop&q=80';
  }
  if (text.includes('fish') || text.includes('鱼') || text.includes('剁椒') || text.includes('酸菜鱼') || text.includes('鱼头')) {
    return 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80';
  }
  if (text.includes('stinky tofu') || text.includes('臭豆腐')) {
    return 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80';
  }
  if (text.includes('cauliflower') || text.includes('花菜')) {
    return 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=600&auto=format&fit=crop&q=80';
  }

  // Teas & beverages
  if (text.includes('grape') || text.includes('葡萄')) {
    return 'https://images.unsplash.com/photo-1570857502809-08184874388e?w=600&auto=format&fit=crop&q=80';
  }
  if (text.includes('strawberry') || text.includes('草莓')) {
    return 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80';
  }
  if (text.includes('boba') || text.includes('pearl') || text.includes('milk tea') || text.includes('波波') || text.includes('真乳茶')) {
    return 'https://images.unsplash.com/photo-1558857563-b37cfb428d02?w=600&auto=format&fit=crop&q=80';
  }
  if (text.includes('mulberry') || text.includes('桑葚') || text.includes('黑黑')) {
    return 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=600&auto=format&fit=crop&q=80';
  }
  if (text.includes('mango') || text.includes('芒果')) {
    return 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&auto=format&fit=crop&q=80';
  }
  if (text.includes('lemon') || text.includes('酸梅汤') || text.includes('冬瓜') || text.includes('tea') || text.includes('饮品')) {
    return 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80';
  }

  // Coffee
  if (text.includes('coconut') || text.includes('生椰') || text.includes('latte') || text.includes('拿铁')) {
    return 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80';
  }
  if (text.includes('americano') || text.includes('美式')) {
    return 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80';
  }

  // Burgers & Western
  if (text.includes('burger') || text.includes('汉堡')) {
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80';
  }
  if (text.includes('fries') || text.includes('薯条') || text.includes('wings') || text.includes('chicken') || text.includes('小吃')) {
    return 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80';
  }
  if (text.includes('pasta') || text.includes('意面') || text.includes('焗饭') || text.includes('doria')) {
    return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80';
  }

  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
}

export function generateCustomCategoryDishes(name: string, category: string, city: string = 'Shanghai') {
  if (category === 'hotpot') {
    return [
      {
        id: 'hp-1',
        name: 'Signature Twin Broth (Rich Tomato & Sichuan Mala Butter)',
        nameZh: '经典招牌双拼鸳鸯锅底 (大红浓番茄拼秘制牛油麻辣)',
        category: 'Soup Bases',
        categoryZh: '特色锅底',
        price: 16.80,
        description: 'Sun-ripened tomatoes simmered for 4 hours paired with authentic Sichuan chili & peppercorns for the ultimate flavor contrast.',
        descriptionZh: '精选高日照浓甜番茄慢熬浓汤，搭配经典四川九叶青花椒与古法牛油，红亮麻辣鲜香，开锅先喝汤！',
        image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&auto=format&fit=crop&q=80',
        calories: '310 kcal',
        popular: true,
        tags: ['Signature Broth', 'Best Seller'],
        tagsZh: ['招牌力荐', '开锅先喝汤'],
        options: {
          sweetness: ['Rich Tomato 浓郁番茄', 'Extra Thick 加浓番茄', 'Less Spicy Mala 少油微辣']
        }
      },
      {
        id: 'hp-2',
        name: 'Prime Angus Marbled Beef Platter (特选原切雪花肥牛)',
        nameZh: '特选原切安格斯雪花肥牛 (大盘)',
        category: 'Prime Meats',
        categoryZh: '鲜切肉品',
        price: 22.50,
        description: 'Premium grain-fed Angus beef with rich marbling. Swirl in broth for 8 seconds for a melt-in-your-mouth tenderness.',
        descriptionZh: '严选优质谷饲安格斯牛雪花部位，大理石纹理细密，七上八下烫煮8秒即熟，入口柔嫩多汁奶香浓郁。',
        image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&auto=format&fit=crop&q=80',
        calories: '420 kcal',
        popular: true,
        tags: ['Grain-Fed', 'Melt-in-Mouth'],
        tagsZh: ['原切谷饲', '鲜嫩爆汁'],
        options: {
          sizes: [{ name: 'Full Platter 整份大盘', extraPrice: 0 }, { name: 'Half Platter 半份精选', extraPrice: -9.00 }]
        }
      },
      {
        id: 'hp-3',
        name: 'Handcrafted Bamboo Shrimp Paste (手工手打鲜竹荪虾滑)',
        nameZh: '手工鲜打黑虎虾滑 (含95%纯虾肉)',
        category: 'Specialties',
        categoryZh: '手打特色',
        price: 15.00,
        description: 'Made with 95% pure black tiger prawn meat. Springy, succulent, and bursting with fresh ocean sweetness.',
        descriptionZh: '精选鲜活黑虎虾仁，千次手工捶打上劲，颗粒饱满弹牙，一口爆汁鲜甜爽口。',
        image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&auto=format&fit=crop&q=80',
        calories: '190 kcal',
        popular: true,
        tags: ['95% Pure Prawn', 'Handmade'],
        tagsZh: ['95%虾肉含量', 'Q弹爽脆']
      },
      {
        id: 'hp-4',
        name: 'Artisan Hand-Pulled Dancing Noodles (招牌功夫花式拉面)',
        nameZh: '招牌花式功夫跳舞拉面 (吸汁神器)',
        category: 'Noodles & Staples',
        categoryZh: '主食与面点',
        price: 4.50,
        description: 'Fresh elastic dough pulled tableside, chewy texture that soaks up every drop of boiling savory broth.',
        descriptionZh: '精选高筋小麦粉现揉现拉，面条筋道爽滑，下锅煮2分钟充分吸收浓醇汤汁。',
        image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80',
        calories: '260 kcal',
        popular: true,
        tags: ['Handcrafted', 'Chewy'],
        tagsZh: ['现拉筋道', '吸汁必备']
      },
      {
        id: 'hp-5',
        name: 'Crispy Ring Tofu Skin & Fresh Mushrooms (黄金炸响铃配菌菇拼盘)',
        nameZh: '黄金炸响铃双拼鲜菌菇荟萃',
        category: 'Fresh Greens',
        categoryZh: '豆面与菌菇',
        price: 9.80,
        description: 'Golden crispy tofu rolls dip 3 seconds in broth, served with organic enoki, king oyster, and shiitake mushrooms.',
        descriptionZh: '头层大豆金黄炸响铃，下锅3秒即吸饱鲜汁，搭配有机金针菇与白玉菇，鲜甜清脆。',
        image: 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=600&auto=format&fit=crop&q=80',
        calories: '170 kcal',
        popular: false,
        tags: ['Crispy Tofu', 'Fresh Mushrooms'],
        tagsZh: ['3秒吸汁', '鲜甜菌菇']
      },
      {
        id: 'hp-6',
        name: 'Traditional Iced Sour Plum Refresher (老北京古法熬制冰镇酸梅汤)',
        nameZh: '古法慢熬冰镇解辣酸梅汤 (无限续杯)',
        category: 'Beverages',
        categoryZh: '解辣特饮',
        price: 4.00,
        description: 'Slow-simmered smoked plums, hawthorn, and sweet osmanthus. Chilled and refreshing for spicy hot pot dining.',
        descriptionZh: '严选乌梅、山楂、甘草与桂花古法文火慢熬6小时，酸甜冰爽，火锅解辣第一神器！',
        image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80',
        calories: '95 kcal',
        popular: true,
        tags: ['Spicy Antidote', 'Unlimited Refill'],
        tagsZh: ['解辣解腻', '冰镇畅饮']
      }
    ];
  }

  // Tai Er Sauerkraut Fish
  if (category === 'fish') {
    return [
      {
        id: 'te-1',
        name: 'Signature Sauerkraut Sea Bass (老坛子酸菜鲈鱼)',
        nameZh: '招牌老坛子酸菜鲈鱼 (酸菜比鱼好吃)',
        category: 'Signatures',
        categoryZh: '主厨招牌',
        price: 26.80,
        description: 'Tender fresh sea bass slices in golden sour chili broth with heritage fermented sauerkraut, Sichuan peppercorns, and chrysanthemum petals.',
        descriptionZh: '精选鲜活加州鲈鱼去骨起片，搭配地窖古法腌制老坛酸菜，撒入贡椒与菊花瓣，鱼片嫩滑爽口，酸麻过瘾。',
        image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80',
        calories: '480 kcal',
        popular: true,
        tags: ['No.1 Best Seller', 'Fermented Sauerkraut'],
        tagsZh: ['镇店销冠', '酸菜比鱼好吃'],
        options: {
          sizes: [{ name: 'Standard 1-2 Persons 经典份', extraPrice: 0 }, { name: 'Feast 3-4 Persons 土豪份', extraPrice: 12.00 }]
        }
      },
      {
        id: 'te-2',
        name: 'Crispy Boneless Sichuan Pepper Pork Bites (无骨鲜藤椒小酥肉)',
        nameZh: '无骨鲜藤椒现炸小酥肉 (外酥里嫩)',
        category: 'Sides',
        categoryZh: '经典小吃',
        price: 8.50,
        description: 'Tender pork loin coated in light batter and fried golden crisp, dusted with tongue-tingling green Sichuan pepper.',
        descriptionZh: '严选猪里脊肉现切现裹面糊，高温油炸金黄酥脆，蘸上秘制鲜藤椒辣椒粉，焦香麻爽。',
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
        calories: '320 kcal',
        popular: true,
        tags: ['Crispy', 'Sichuan Pepper'],
        tagsZh: ['现炸酥脆', '藤椒椒麻']
      },
      {
        id: 'te-3',
        name: 'Poached Baby Cabbage in Rich Bone Broth (上汤大白菜)',
        nameZh: '清甜上汤娃娃菜 (解辣暖胃)',
        category: 'Sides',
        categoryZh: '时令蔬食',
        price: 7.00,
        description: 'Sweet tender baby cabbage leaves simmered in rich chicken and pork bone broth with wolfberries.',
        descriptionZh: '浓郁高汤慢火浸煨有机娃娃菜，汤清味鲜，清甜解辣。',
        image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=600&auto=format&fit=crop&q=80',
        calories: '110 kcal',
        popular: false,
        tags: ['Sweet & Mild', 'Rich Broth'],
        tagsZh: ['清甜解腻', '浓醇上汤']
      },
      {
        id: 'te-4',
        name: 'Luohan Fruit & Tangerine Peel Hot Tea (洛神花陈皮热茶)',
        nameZh: '洛神花陈皮茶 (自助免费畅饮)',
        category: 'Beverages',
        categoryZh: '特色茶饮',
        price: 3.50,
        description: 'Natural dried roselle flowers and aged tangerine peels steeped in hot water. Sweet-sour and throat soothing.',
        descriptionZh: '新会老陈皮搭配红艳洛神花冲泡，酸甜适口，暖胃润喉。',
        image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80',
        calories: '40 kcal',
        popular: true,
        tags: ['Free Refills', 'Soothing'],
        tagsZh: ['自助畅饮', '生津止渴']
      }
    ];
  }

  // Generic Signature fallback with high quality dishes
  return [
    {
      id: `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}-item-1`,
      name: `${name} Masterpiece Signature Dish`,
      nameZh: `${name} · 头牌主厨招牌盛宴`,
      category: 'Signatures',
      categoryZh: '主厨招牌',
      price: 24.50,
      description: 'Crafted with premium authentic ingredients, secret seasoning, and mouthwatering perfection.',
      descriptionZh: '严选高品质天然食材，古法秘制调味，慢火细调鲜香四溢，进店必点。',
      image: getAccurateDishImage(name, 'signature', 'dining'),
      calories: '420 kcal',
      popular: true,
      tags: ["Chef's Pick", 'Top Seller'],
      tagsZh: ['主厨力荐', '店内销冠'],
      options: {
        sizes: [{ name: 'Standard 标准份', extraPrice: 0 }, { name: 'Deluxe 豪华加大', extraPrice: 5.00 }]
      }
    },
    {
      id: `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}-item-2`,
      name: 'Golden Sizzling Specialty Appetizer',
      nameZh: '金牌酥脆特色佐餐小食',
      category: 'Sides',
      categoryZh: '精选小食',
      price: 9.80,
      description: 'Crispy and golden on the outside, juicy and fragrant inside.',
      descriptionZh: '外皮金黄酥脆诱人，内里汁水饱满，搭配特调秘酱解馋开胃。',
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
      calories: '280 kcal',
      popular: true,
      tags: ['Crispy', 'Popular'],
      tagsZh: ['酥脆解馋', '热门小食']
    },
    {
      id: `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}-item-3`,
      name: 'Handcrafted Iced Fresh Fruit Refresher',
      nameZh: '招牌鲜萃清爽手作特饮',
      category: 'Drinks',
      categoryZh: '清爽特饮',
      price: 5.50,
      description: 'Freshly brewed fruit beverage, natural citrus notes, cool and rejuvenating.',
      descriptionZh: '鲜果现萃，酸甜清爽解腻神器，冰凉畅快提神必备。',
      image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80',
      calories: '120 kcal',
      popular: false,
      tags: ['Refreshing', 'Iced'],
      tagsZh: ['沁爽解腻', '现萃冰饮']
    }
  ];
}

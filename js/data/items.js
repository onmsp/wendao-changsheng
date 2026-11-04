/*
 * 物品数据 —— 新增物品只需在此追加一条
 * type:material 材料 / pill 丹药 (可堆叠,每格上限 99)
 *       equip 法宝 / special 特殊 (不可堆叠,一件占一格;法宝最多同时佩戴 4 件)
 * icon:assets 下的图片路径(不含扩展名);hue:色相旋转角度,可用同一图标做出不同物品;badge:图标角标文字
 * q:品质 0凡 1灵 2玄 3地 4天 5仙;price:出售价格(灵石)
 * use:使用效果(由 systems/inventory.js 解释)
 */
XX.data.itemTypes = {
  material: { name: '材料', stack: true },
  pill: { name: '丹药', stack: true },
  equip: { name: '法宝', stack: false },
  special: { name: '特殊', stack: false }
};


/* 法宝品质对属性的倍率 */
XX.data.equipQualityMul = [1, 1.5, 2.2, 3.2, 4.6, 6.5];

XX.data.items = {
  /* ---------- 材料 ---------- */
  herb_ninglu: { name: '凝露草', type: 'material', icon: 'item/herb', q: 0, price: 4, desc: '吸收晨露灵气而生的灵草,炼制聚气丹的主材。' },
  herb_chiyan: { name: '赤炎花', type: 'material', icon: 'item/herb', hue: 240, q: 1, price: 12, desc: '生于地火之侧,性烈如火,可炼养元丹。' },
  herb_ziyun: { name: '紫云芝', type: 'material', icon: 'item/herb', hue: 160, q: 2, price: 40, desc: '紫气缭绕的灵芝,百年方得一株,筑基丹主材。' },
  fruit_zhu: { name: '朱果', type: 'material', icon: 'item/fruit', q: 1, price: 15, desc: '赤红如血,蕴含精纯气血之力。' },
  ore_iron: { name: '玄铁', type: 'material', icon: 'item/iron', q: 0, price: 5, desc: '常见炼器材料,质地坚硬。' },
  ore_cold: { name: '寒铁', type: 'material', icon: 'item/coldiron', q: 1, price: 15, desc: '极寒之地出产的灵铁,炼制法衣的上佳材料。' },
  ore_star: { name: '星辰砂', type: 'material', icon: 'item/coldiron', hue: 180, q: 2, price: 50, desc: '天外陨星所化,蕴含星辰之力。' },
  wood_ling: { name: '灵木', type: 'material', icon: 'item/wood', q: 0, price: 5, desc: '灵气充沛的木材,常作剑柄与阵基。' },
  jade_raw: { name: '青玉原石', type: 'material', icon: 'icon/lingshi', hue: 270, q: 1, price: 20, desc: '温润青玉,炼制玉佩所需。' },
  core_yao: { name: '妖丹', type: 'material', icon: 'item/core', q: 1, price: 25, desc: '妖兽毕生修为凝结之物,丹道与器道皆需。' },
  core_xuan: { name: '玄阴妖丹', type: 'material', icon: 'item/core', hue: 260, q: 3, price: 120, desc: '高阶妖兽的妖丹,阴寒之气逼人。' },

  /* ---------- 种子(材料类) ---------- */
  seed_ninglu: { name: '凝露草种', type: 'material', icon: 'item/herb', hue: 50, badge: '种', q: 0, price: 2, desc: '种于灵田,可收获凝露草。' },
  seed_zhu: { name: '朱果种', type: 'material', icon: 'item/fruit', hue: 40, badge: '种', q: 1, price: 6, desc: '种于灵田,可收获朱果。' },
  seed_chiyan: { name: '赤炎花种', type: 'material', icon: 'item/herb', hue: 240, badge: '种', q: 1, price: 6, desc: '种于灵田,可收获赤炎花。' },
  seed_ziyun: { name: '紫云芝孢', type: 'material', icon: 'item/herb', hue: 160, badge: '种', q: 2, price: 20, desc: '种于灵田,可收获紫云芝。' },

  /* ---------- 丹药 ---------- */
  pill_juqi: { name: '聚气丹', type: 'pill', icon: 'item/pill_red', q: 0, price: 10, desc: '服用后立即获得当前境界所需修为的 10%(至少 60 点)。', use: { kind: 'exp', pct: 0.10, min: 60 } },
  pill_yangyuan: { name: '养元丹', type: 'pill', icon: 'item/pill_red', hue: 200, q: 1, price: 40, desc: '服用后立即获得当前境界所需修为的 30%。', use: { kind: 'exp', pct: 0.30, min: 200 } },
  pill_peiyuan: { name: '培元丹', type: 'pill', icon: 'item/bottle', q: 1, price: 30, desc: '固本培元,永久提升气血 1%(累计上限 50%)。', use: { kind: 'perm', key: 'hpPct', add: 0.01, cap: 0.5 } },
  pill_wudao: { name: '悟道丹', type: 'pill', icon: 'item/pill_gold', hue: 120, q: 3, price: 300, desc: '明心见性,永久提升悟性 1 点(累计上限 30)。', use: { kind: 'perm', key: 'comprehension', add: 1, cap: 30 } },
  pill_zhuji: { name: '筑基丹', type: 'pill', icon: 'item/pill_gold', q: 2, price: 200, desc: '突破至筑基期所必需。突破时自动服用。', use: { kind: 'break' } },
  pill_ningjin: { name: '凝金丹', type: 'pill', icon: 'item/pill_gold', hue: 25, q: 3, price: 600, desc: '凝结金丹所必需。突破时自动服用。', use: { kind: 'break' } },
  pill_huaying: { name: '化婴丹', type: 'pill', icon: 'item/pill_gold', hue: 80, q: 3, price: 1500, desc: '碎丹成婴所必需。突破时自动服用。', use: { kind: 'break' } },
  pill_ningshen: { name: '凝神丹', type: 'pill', icon: 'item/pill_gold', hue: 150, q: 4, price: 4000, desc: '元神化形所必需。突破时自动服用。', use: { kind: 'break' } },
  pill_lianxu: { name: '炼虚丹', type: 'pill', icon: 'item/pill_gold', hue: 200, q: 4, price: 9000, desc: '炼神返虚所必需。突破时自动服用。', use: { kind: 'break' } },
  pill_heti: { name: '合体丹', type: 'pill', icon: 'item/pill_gold', hue: 250, q: 5, price: 20000, desc: '法相合一所必需。突破时自动服用。', use: { kind: 'break' } },
  pill_dacheng: { name: '大乘丹', type: 'pill', icon: 'item/pill_gold', hue: 300, q: 5, price: 50000, desc: '大道将成所必需。突破时自动服用。', use: { kind: 'break' } },
  pill_dujie: { name: '渡劫丹', type: 'pill', icon: 'item/pill_gold', hue: 330, q: 5, price: 99999, desc: '直面天劫所必需。突破时自动服用。', use: { kind: 'break' } },

  /* ---------- 特殊(一件一格) ---------- */
  sp_pouch: { name: '储物袋', type: 'special', icon: 'item/pouch', q: 2, price: 100, desc: '使用后背包容量永久 +10 格。', use: { kind: 'bag', add: 10 } },
  sp_jadeslip: { name: '《太玄引气诀》', type: 'special', icon: 'item/jadeslip', q: 3, price: 500, desc: '上古引气功法玉简。参悟后修炼速度永久 +10%(最多参悟 10 次)。', use: { kind: 'perm', key: 'rateBonus', add: 0.10, cap: 1.0 } },
  sp_talisman: { name: '破境符', type: 'special', icon: 'item/talisman', q: 2, price: 150, desc: '使用后,下一次大境界突破成功率 +15%(可叠加至 45%)。', use: { kind: 'buff', key: 'breakBonus', add: 0.15, cap: 0.45 } },
  sp_stonebag: { name: '灵石袋', type: 'special', icon: 'item/pouch', hue: 180, q: 1, price: 50, desc: '打开可获得 1000 × (大境界+1) 灵石。', use: { kind: 'stone', base: 1000 } },
  sp_xiling: { name: '洗灵液', type: 'special', icon: 'item/gourd', q: 4, price: 1000, desc: '洗筋伐髓,重塑灵根。使用后灵根提升一阶(五色→四色→三色→两色→单色)。', use: { kind: 'root' } },

  /* ---------- 法宝(一件一格,属性随品质浮动,任意 4 件可同时佩戴) ---------- */
  eq_qingfeng: { name: '青锋剑', type: 'equip', icon: 'item/sword', q: 0, price: 40, desc: '寻常修士的入门飞剑。', stats: { atk: 12, crit: 0.01 } },
  eq_xuantie: { name: '玄铁重剑', type: 'equip', icon: 'item/sword', hue: 180, q: 1, price: 150, desc: '重剑无锋,大巧不工。', stats: { atk: 40, crit: 0.02 } },
  eq_chiyan: { name: '赤焰剑', type: 'equip', icon: 'item/sword', hue: 330, q: 2, price: 600, desc: '以星辰砂与妖丹淬炼,剑身赤焰流转。', stats: { atk: 120, crit: 0.04, critDmg: 0.1 } },
  eq_yunwen: { name: '云纹道袍', type: 'equip', icon: 'item/robe', q: 0, price: 40, desc: '绣有云纹的入门法衣。', stats: { hp: 90, def: 8 } },
  eq_hantie: { name: '寒铁法衣', type: 'equip', icon: 'item/robe', hue: 200, q: 1, price: 150, desc: '以寒铁丝织就,刀剑难伤。', stats: { hp: 260, def: 24 } },
  eq_xuanwu: { name: '玄武宝甲', type: 'equip', icon: 'item/robe', hue: 90, q: 2, price: 600, desc: '仿玄武背甲炼制,坚不可摧。', stats: { hp: 900, def: 75 } },
  eq_qingyu: { name: '青玉佩', type: 'equip', icon: 'item/pendant', q: 0, price: 40, desc: '温养神识的玉佩。', stats: { mp: 40, sense: 6, dodge: 0.01 } },
  eq_ziling: { name: '紫灵佩', type: 'equip', icon: 'item/pendant', hue: 120, q: 1, price: 150, desc: '紫气东来,灵台清明。', stats: { mp: 130, sense: 18, dodge: 0.02, crit: 0.01 } },
  eq_xingchen: { name: '星辰坠', type: 'equip', icon: 'item/pendant', hue: 200, q: 2, price: 600, desc: '内蕴一方星空,神识如海。', stats: { mp: 400, sense: 50, dodge: 0.03, crit: 0.02 } }
};

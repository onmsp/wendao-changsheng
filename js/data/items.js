/*
 * 物品数据 —— 新增物品只需在此追加一条
 * type:material 材料 / pill 丹药 (可堆叠,每格上限 99)
 *       equip 法宝 / special 特殊 (不可堆叠,一件占一格)
 * icon:assets 下图片路径(不含扩展名);hue:色相旋转;badge:角标
 * q:品阶 0白 1绿 2蓝 3紫 4金;price:出售价格(灵石)
 * use:使用效果(由 systems/inventory.js 解释)
 * 功法/技能玉简由 skills.js 自动生成,无需在此填写
 */
XX.data.itemTypes = {
  material: { name: '材料', stack: true },
  pill: { name: '丹药', stack: true },
  equip: { name: '法宝', stack: false },
  special: { name: '特殊', stack: false }
};

/* 法宝品阶对属性的倍率(白 绿 蓝 紫 金) */
XX.data.equipQualityMul = [1, 1.5, 2.2, 3.2, 4.6];
/* 法宝等级成长:属性 × levelGrow^等级(等级≈产出地图的强度) */
XX.data.equipLevelGrow = 1.16;
/* 按等级给普通法宝加材质前缀 */
XX.data.equipTierNames = [[0, ''], [3, '玄铁'], [6, '寒玉'], [9, '紫金'], [12, '星辰'], [16, '九幽'], [19, '天雷']];

XX.data.items = {
  /* ---------- 材料 ---------- */
  herb_ninglu: { name: '凝露草', type: 'material', icon: 'item/herb', q: 0, price: 4, desc: '吸收晨露灵气而生的灵草,炼制聚气丹的主材。' },
  herb_chiyan: { name: '赤炎花', type: 'material', icon: 'item/herb', hue: 240, q: 1, price: 12, desc: '生于地火之侧,性烈如火,可炼养元丹。' },
  herb_ziyun: { name: '紫云芝', type: 'material', icon: 'item/herb', hue: 160, q: 2, price: 40, desc: '紫气缭绕的灵芝,百年方得一株,筑基丹主材。' },
  fruit_zhu: { name: '朱果', type: 'material', icon: 'item/fruit', q: 1, price: 15, desc: '赤红如血,蕴含精纯气血之力。' },
  ore_iron: { name: '玄铁', type: 'material', icon: 'item/iron', q: 0, price: 5, desc: '常见炼器材料,质地坚硬。' },
  ore_cold: { name: '寒铁', type: 'material', icon: 'item/coldiron', q: 1, price: 15, desc: '极寒之地出产的灵铁。' },
  ore_star: { name: '星辰砂', type: 'material', icon: 'item/coldiron', hue: 180, q: 2, price: 50, desc: '天外陨星所化,蕴含星辰之力。' },
  wood_ling: { name: '灵木', type: 'material', icon: 'item/wood', q: 0, price: 5, desc: '灵气充沛的木材,常作剑柄与阵基。' },
  jade_raw: { name: '青玉原石', type: 'material', icon: 'icon/lingshi', hue: 270, q: 1, price: 20, desc: '温润青玉,炼器常用。' },
  core_yao: { name: '妖丹', type: 'material', icon: 'item/core', q: 1, price: 25, desc: '妖兽毕生修为凝结之物。' },
  core_xuan: { name: '玄阴妖丹', type: 'material', icon: 'item/core', hue: 260, q: 3, price: 120, desc: '高阶妖兽的妖丹,阴寒之气逼人。' },
  /* 元婴期材料 */
  ore_youming: { name: '九幽冥铁', type: 'material', icon: 'item/darkiron', q: 3, price: 200, desc: '自九幽深处涌出的冥铁,炼制元婴期法宝的主材。' },
  bamboo_lei: { name: '天雷竹', type: 'material', icon: 'item/thunderbamboo', q: 3, price: 220, desc: '经天雷淬炼百年的灵竹,内蕴雷霆。' },
  milk_wannian: { name: '万年灵乳', type: 'material', icon: 'item/spiritmilk', q: 3, price: 260, desc: '灵脉深处万年凝结的灵乳,化婴丹主材。' },
  crystal_xuehun: { name: '血魂晶', type: 'material', icon: 'item/bloodcrystal', q: 3, price: 240, desc: '血煞魔域中凝结的魂晶,煞气冲天。' },
  scale_long: { name: '蛟龙鳞', type: 'material', icon: 'item/dragonscale', q: 4, price: 600, desc: '真龙后裔脱落的鳞片,坚不可摧。' },
  feather_feng: { name: '火凤翎', type: 'material', icon: 'item/phoenix', q: 4, price: 600, desc: '火凤遗落的翎羽,不灭之火长燃。' },

  /* ---------- 种子 ---------- */
  seed_ninglu: { name: '凝露草种', type: 'material', icon: 'item/herb', hue: 50, badge: '种', q: 0, price: 2, desc: '种于灵田,可收获凝露草。' },
  seed_zhu: { name: '朱果种', type: 'material', icon: 'item/fruit', hue: 40, badge: '种', q: 1, price: 6, desc: '种于灵田(需灵田 3 级),可收获朱果。' },
  seed_chiyan: { name: '赤炎花种', type: 'material', icon: 'item/herb', hue: 240, badge: '种', q: 1, price: 6, desc: '种于灵田(需灵田 3 级),可收获赤炎花。' },
  seed_ziyun: { name: '紫云芝孢', type: 'material', icon: 'item/herb', hue: 160, badge: '种', q: 2, price: 20, desc: '种于灵田(需灵田 5 级),可收获紫云芝。' },

  /* ---------- 丹药 ----------
   * use.kind:exp 加修为(amount 固定值) / timed 限时增益(key: rate 修炼速度、atk 攻击、def 防御;v 数值;min 分钟)
   *           perm 永久属性 / buff 下次突破加成 / root 灵根提升 / break 突破丹(突破时自动服用)
   */
  pill_juqi: { name: '聚气丹', type: 'pill', icon: 'item/pill_red', q: 0, price: 5, desc: '服用后立即获得 100 点修为。', use: { kind: 'exp', amount: 100 } },
  pill_julingsan: { name: '聚灵散', type: 'pill', icon: 'item/bottle', hue: 120, q: 0, price: 12, desc: '30 分钟内修炼速度 +15%(多颗可叠加时长)。', use: { kind: 'timed', key: 'rate', v: 0.15, min: 30 } },
  pill_yangyuan: { name: '养元丹', type: 'pill', icon: 'item/pill_red', hue: 200, q: 1, price: 40, desc: '服用后立即获得 800 点修为。', use: { kind: 'exp', amount: 800 } },
  pill_peiyuan: { name: '培元丹', type: 'pill', icon: 'item/bottle', q: 1, price: 40, desc: '固本培元,永久提升气血 1%(累计上限 50%)。', use: { kind: 'perm', key: 'hpPct', add: 0.01, cap: 0.5 } },
  pill_jingang: { name: '金刚丹', type: 'pill', icon: 'item/pill_gold', hue: 60, q: 1, price: 35, desc: '60 分钟内防御 +25%。', use: { kind: 'timed', key: 'def', v: 0.25, min: 60 } },
  pill_kuangxue: { name: '狂血丹', type: 'pill', icon: 'item/pill_red', hue: 330, q: 2, price: 120, desc: '60 分钟内攻击 +25%。', use: { kind: 'timed', key: 'atk', v: 0.25, min: 60 } },
  pill_julingdan: { name: '聚灵丹', type: 'pill', icon: 'item/bottle', hue: 200, q: 2, price: 200, desc: '60 分钟内修炼速度 +30%(与聚灵散不叠加,取较高者)。', use: { kind: 'timed', key: 'rate', v: 0.3, min: 60 } },
  pill_pojing: { name: '破境丹', type: 'pill', icon: 'item/pill_gold', hue: 280, q: 2, price: 250, desc: '特殊丹药。服用后下一次大境界突破成功率 +15%(可叠加至 45%)。', use: { kind: 'buff', key: 'breakBonus', add: 0.15, cap: 0.45 } },
  pill_ningyuan: { name: '凝元丹', type: 'pill', icon: 'item/pill_red', hue: 280, q: 3, price: 600, desc: '服用后立即获得 6000 点修为。', use: { kind: 'exp', amount: 6000 } },
  pill_wudao: { name: '悟道丹', type: 'pill', icon: 'item/pill_gold', hue: 120, q: 3, price: 800, desc: '特殊丹药。明心见性,永久提升悟性 1 点(累计上限 20)。', use: { kind: 'perm', key: 'comprehension', add: 1, cap: 20 } },
  pill_fuyuan: { name: '福缘丹', type: 'pill', icon: 'item/pill_gold', hue: 200, q: 3, price: 800, desc: '特殊丹药。永久提升气运 1 点(累计上限 10),气运影响突破与掉落。', use: { kind: 'perm', key: 'luck', add: 1, cap: 10 } },
  pill_zhuji: { name: '筑基丹', type: 'pill', icon: 'item/pill_gold', q: 1, price: 200, desc: '突破至筑基期所必需。突破时自动服用。', use: { kind: 'break' } },
  pill_ningjin: { name: '凝金丹', type: 'pill', icon: 'item/pill_gold', hue: 25, q: 2, price: 600, desc: '凝结金丹所必需。突破时自动服用。', use: { kind: 'break' } },
  pill_huaying: { name: '化婴丹', type: 'pill', icon: 'item/pill_gold', hue: 80, q: 3, price: 1500, desc: '碎丹成婴所必需。突破时自动服用。', use: { kind: 'break' } },
  pill_ningshen: { name: '凝神丹', type: 'pill', icon: 'item/pill_gold', hue: 150, q: 4, price: 4000, desc: '元神化形所必需。突破时自动服用。', use: { kind: 'break' } },
  pill_lianxu: { name: '炼虚丹', type: 'pill', icon: 'item/pill_gold', hue: 200, q: 4, price: 9000, desc: '炼神返虚所必需。突破时自动服用。', use: { kind: 'break' } },
  pill_heti: { name: '合体丹', type: 'pill', icon: 'item/pill_gold', hue: 250, q: 4, price: 20000, desc: '法相合一所必需。突破时自动服用。', use: { kind: 'break' } },
  pill_dacheng: { name: '大乘丹', type: 'pill', icon: 'item/pill_gold', hue: 300, q: 4, price: 50000, desc: '大道将成所必需。突破时自动服用。', use: { kind: 'break' } },
  pill_dujie: { name: '渡劫丹', type: 'pill', icon: 'item/pill_gold', hue: 330, q: 4, price: 99999, desc: '直面天劫所必需。突破时自动服用。', use: { kind: 'break' } },

  /* ---------- 特殊(一件一格) ---------- */
  sp_pouch: { name: '储物袋', type: 'special', icon: 'item/pouch', q: 2, price: 100, desc: '使用后背包容量永久 +10 格。扩展上限 200 格,元婴之后每个大境界上限 +50。', use: { kind: 'bag', add: 10 } },
  sp_talisman: { name: '破境符', type: 'special', icon: 'item/talisman', q: 1, price: 150, desc: '使用后,下一次大境界突破成功率 +15%(可叠加至 45%)。', use: { kind: 'buff', key: 'breakBonus', add: 0.15, cap: 0.45 } },
  sp_stonebag: { name: '灵石袋', type: 'special', icon: 'item/pouch', hue: 180, q: 1, price: 50, desc: '打开可获得 1000 × (大境界+1) 灵石。', use: { kind: 'stone', base: 1000 } },
  /* 洗灵液:只能炼制(需丹方),图纸等级决定可达最高灵根 */
  sp_xiling: { name: '洗灵液', type: 'pill', special: true, noDrop: true, icon: 'item/gourd', q: 3, price: 1000,
    desc: '特殊道具,只能炼制。每次服用灵根转化度 +5%,满 100% 灵根提升一品。丹方等级决定可达到的最高灵根:1 级四色、2 级三色、3 级两色、4 级单色、5 级天灵根。', use: { kind: 'rootProg' } },

  /* ---------- 普通法宝(掉落时按地图强度 pw 生成数值) ---------- */
  eq_changjian: { name: '长剑', type: 'equip', icon: 'item/sword', q: 0, price: 20, desc: '寻常修士的入门飞剑。', stats: { atk: 12, crit: 0.01 } },
  eq_daopao: { name: '道袍', type: 'equip', icon: 'item/robe', q: 0, price: 20, desc: '绣有云纹的法衣,可御刀兵。', stats: { hp: 90, def: 8 } },
  eq_yupei: { name: '玉佩', type: 'equip', icon: 'item/pendant', q: 0, price: 20, desc: '温养神识的玉佩。', stats: { mp: 40, sense: 6, dodge: 0.01 } },
  eq_lingzhuo: { name: '灵镯', type: 'equip', icon: 'item/bracelet', q: 0, price: 20, desc: '护身灵镯,可挡一击。', stats: { hp: 60, def: 6, mp: 20 } },
  eq_tongling: { name: '摄魂铃', type: 'equip', icon: 'item/bell', q: 0, price: 20, desc: '铃声可乱妖兽心神。', stats: { atk: 6, sense: 10, crit: 0.01 } }
};

/* 可掉落的普通法宝 */
XX.data.treasureBases = ['eq_changjian', 'eq_daopao', 'eq_yupei', 'eq_lingzhuo', 'eq_tongling'];

/*
 * 法宝效果(词条):白/绿/蓝 1 条,紫/金 2 条(config.affixCount)
 * kind:stat 直接加属性;battle 战斗中生效;range 为紫色品质的基准范围,其他品质按 affixQMul 缩放
 */
XX.data.affixQMul = [0.4, 0.55, 0.75, 1, 1.3];
XX.data.affixes = {
  lifesteal: { name: '吸血', kind: 'battle', range: [0.05, 0.12], pct: true, desc: '造成伤害的 {v} 转化为气血' },
  thorns: { name: '反震', kind: 'battle', range: [0.08, 0.20], pct: true, desc: '受到伤害时反弹 {v}' },
  double: { name: '连击', kind: 'battle', range: [0.06, 0.15], pct: true, desc: '普攻有 {v} 概率追加一击' },
  pierce: { name: '破甲', kind: 'battle', range: [0.10, 0.25], pct: true, desc: '攻击无视敌方 {v} 防御' },
  mpRegen: { name: '回灵', kind: 'battle', range: [0.03, 0.08], pct: true, desc: '每回合额外恢复 {v} 灵力' },
  rate: { name: '聚灵', kind: 'stat', range: [0.03, 0.08], pct: true, desc: '修炼速度 +{v}' },
  luck: { name: '福缘', kind: 'stat', range: [2, 5], desc: '气运 +{v}' },
  comprehension: { name: '慧心', kind: 'stat', range: [2, 5], desc: '悟性 +{v}' },
  critDmg: { name: '诛心', kind: 'stat', range: [0.15, 0.35], pct: true, desc: '暴击伤害 +{v}' },
  crit: { name: '会心', kind: 'stat', range: [0.03, 0.06], pct: true, desc: '暴击率 +{v}' },
  dodge: { name: '灵动', kind: 'stat', range: [0.02, 0.05], pct: true, desc: '闪避率 +{v}' },
  hpPct: { name: '坚体', kind: 'stat', range: [0.05, 0.12], pct: true, desc: '气血 +{v}' }
};

/*
 * 炼器法宝:只能通过「炼器 + 器图」获得,品质固定(白~金),效果固定(白~蓝 1 条,紫/金 2 条)
 * 器图等级决定成品数值倍率(config.bpEffect)
 */
XX.data.forgeTreasures = {
  eq_qingfeng: { name: '青锋剑', q: 0, icon: 'item/sword', hue: 160, desc: '剑气清冽的入门飞剑。', stats: { atk: 16, crit: 0.01 }, effects: ['crit'] },
  eq_yunwen: { name: '云纹宝衣', q: 0, icon: 'item/robe', hue: 40, desc: '织入云纹禁制的护身法衣。', stats: { hp: 110, def: 10 }, effects: ['hpPct'] },
  eq_shehun: { name: '摄魂铃', q: 1, icon: 'item/bell', hue: 300, desc: '铃声摄人心魄。', stats: { atk: 20, sense: 14 }, effects: ['pierce'] },
  eq_qiankun: { name: '乾坤镯', q: 1, icon: 'item/bracelet', hue: 40, desc: '可收纳乾坤,护主周全。', stats: { hp: 200, def: 16 }, effects: ['thorns'] },
  eq_jianxia: { name: '青冥剑匣', q: 2, icon: 'item/swordcase', desc: '匣中藏剑三千,一念出鞘。', stats: { atk: 30, crit: 0.03 }, effects: ['double'] },
  eq_zhenhun: { name: '镇魂钟', q: 2, icon: 'item/bell', hue: 200, desc: '钟声一响,群邪辟易。', stats: { def: 22, sense: 24, mp: 60 }, effects: ['mpRegen'] },
  eq_zhaohun: { name: '招魂幡', q: 3, icon: 'item/banner', hue: 150, desc: '幡动则百魂随行,吞噬生机。', stats: { atk: 30, hp: 150 }, effects: ['lifesteal', 'critDmg'] },
  eq_kunlun: { name: '昆仑镜', q: 3, icon: 'item/mirror', desc: '照见万物本源,洞穿虚实。', stats: { atk: 26, sense: 32, crit: 0.04 }, effects: ['pierce', 'crit'] },
  eq_fantian: { name: '翻天印', q: 4, icon: 'item/seal', desc: '一印落下,山岳崩摧。', stats: { atk: 52, critDmg: 0.15 }, effects: ['critDmg', 'double'] },
  eq_linglong: { name: '玲珑宝塔', q: 4, icon: 'item/pagoda', desc: '塔镇八方,聚天地灵气于一身。', stats: { hp: 260, def: 26, mp: 90 }, effects: ['rate', 'hpPct'] },
  eq_zijin: { name: '紫金葫芦', q: 4, icon: 'item/gourd', hue: 60, desc: '葫中自有洞天,福缘深厚。', stats: { mp: 170, sense: 24, dodge: 0.03 }, effects: ['luck', 'dodge'] }
};
(function () {
  Object.keys(XX.data.forgeTreasures).forEach(function (id) {
    var t = XX.data.forgeTreasures[id];
    XX.data.items[id] = { name: t.name, type: 'equip', forged: true, icon: t.icon, hue: t.hue, q: t.q, price: 60 * Math.pow(2.5, t.q), desc: t.desc, stats: t.stats, effects: t.effects };
  });
})();

/* 洞府升级材料 */
XX.data.items.ore_iron_g = { name: '玄铁精', type: 'material', icon: 'item/iron', hue: 100, q: 1, price: 15, desc: '千锤百炼的玄铁精华,洞府 6 级以上升级与法宝高阶强化所需。' };

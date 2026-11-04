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
XX.data.equipTierNames = [[0, ''], [3, '玄铁'], [6, '寒玉'], [9, '紫金'], [12, '星辰'], [16, '九幽'], [19, '天雷'], [22, '太虚'], [26, '混元'], [30, '不朽'], [34, '仙灵'], [38, '劫火']];

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
  pill_jingang: { name: '金刚丹', type: 'pill', icon: 'item/pill_gold', hue: 60, q: 1, price: 35, desc: '60 分钟内防御 +25%。', use: { kind: 'timed', key: 'def', v: 0.25, min: 60 } },
  pill_kuangxue: { name: '狂血丹', type: 'pill', icon: 'item/pill_red', hue: 330, q: 2, price: 120, desc: '60 分钟内攻击 +25%。', use: { kind: 'timed', key: 'atk', v: 0.25, min: 60 } },
  pill_julingdan: { name: '聚灵丹', type: 'pill', icon: 'item/bottle', hue: 200, q: 2, price: 200, desc: '60 分钟内修炼速度 +30%(与聚灵散不叠加,取较高者)。', use: { kind: 'timed', key: 'rate', v: 0.3, min: 60 } },
  pill_ningyuan: { name: '凝元丹', type: 'pill', icon: 'item/pill_red', hue: 280, q: 3, price: 600, desc: '服用后立即获得 6000 点修为。', use: { kind: 'exp', amount: 6000 } },
  pill_wudao: { name: '悟道丹', type: 'pill', icon: 'item/pill_gold', hue: 120, q: 3, price: 800, desc: '特殊丹药。明心见性,永久提升悟性 1 点(累计上限 20)。', use: { kind: 'perm', key: 'comprehension', add: 1, cap: 20 } },
  pill_fuyuan: { name: '福缘丹', type: 'pill', icon: 'item/pill_gold', hue: 200, q: 3, price: 800, desc: '特殊丹药。永久提升气运 2 点(累计上限 40),气运影响突破与掉落。', use: { kind: 'perm', key: 'luck', add: 2, cap: 40 } },

  /* ---------- 特殊(一件一格) ---------- */
  sp_pouch: { name: '储物袋', type: 'special', icon: 'item/pouch', q: 3, price: 300, secretOk: true, noShop: true, desc: '只能在秘境中低概率获得。使用后背包容量永久 +10 格。扩展上限 200 格,元婴之后每个大境界上限 +50。', use: { kind: 'bag', add: 10 } },
  sp_stonebag: { name: '灵石袋', type: 'special', icon: 'item/pouch', hue: 180, q: 1, price: 50, desc: '打开可获得 1000 × (大境界+1) 灵石。', use: { kind: 'stone', base: 1000 } },
  /* 洗灵液:只能炼制(需丹方),图纸等级决定可达最高灵根 */
  sp_xiling: { name: '洗灵液', type: 'pill', special: true, noDrop: true, icon: 'item/gourd', q: 3, price: 1000,
    desc: '特殊道具,只能炼制。每次服用灵根转化度 +5%,满 100% 灵根提升一品。丹方等级决定可达到的最高灵根:1 级四色、2 级三色、3 级两色、4 级单色、5 级天灵根。', use: { kind: 'rootProg' } },

  /* ---------- 普通法宝(掉落时按地图强度 pw 生成数值) ---------- */
};

/*
 * 普通法宝库:历练/秘境掉落,可用强化石强化;cat 为类别(攻/防/灵/辅),stats 为白色 0 级基准,
 * 实际属性 = 基准 × 品质倍率 × 1.16^强度(产出地图),词条从 affixes 中随机
 */
XX.data.normalTreasures = [
  ['eq_changjian', '长剑', 'item/sword', 0, '攻', '寻常修士的入门飞剑。', { atk: 12, crit: 0.01 }],
  ['eq_kuandao', '阔刃刀', 'item/saber', 0, '攻', '刀背厚重,劈砍之势刚猛无俦。', { atk: 14, critDmg: 0.05 }],
  ['eq_changqiang', '长枪', 'item/spear', 0, '攻', '一寸长一寸强,枪出如龙。', { atk: 11, spd: 4 }],
  ['eq_fusuo', '飞梭', 'item/shuttle', 0, '攻', '穿梭如电的小巧法器。', { atk: 7, spd: 8 }],
  ['eq_zheshan', '折扇', 'item/fan', 0, '攻', '扇骨暗藏锋刃,开合之间杀机隐现。', { atk: 9, sense: 6, dodge: 0.01 }],
  ['eq_daopao', '道袍', 'item/robe', 0, '防', '绣有云纹的法衣,可御刀兵。', { hp: 90, def: 8 }],
  ['eq_guijia', '龟甲盾', 'item/shell', 0, '防', '千年灵龟背甲所制,坚不可摧。', { def: 12, hp: 60 }],
  ['eq_yunlv', '云履', 'item/boots', 0, '防', '踏云而行,身法轻灵。', { def: 5, spd: 6, dodge: 0.012 }],
  ['eq_youzhisan', '油纸伞', 'item/umbrella', 0, '防', '伞面绘有避邪符纹,可挡风雨刀兵。', { def: 9, dodge: 0.015 }],
  ['eq_xiaoding', '小鼎', 'item/ding', 0, '防', '巴掌大的青铜小鼎,镇压周身气血。', { hp: 110, def: 4 }],
  ['eq_yupei', '玉佩', 'item/pendant', 0, '灵', '温养神识的玉佩。', { mp: 40, sense: 6, dodge: 0.01 }],
  ['eq_lingzhuo', '灵镯', 'item/bracelet', 0, '灵', '护身灵镯,可挡一击。', { hp: 60, def: 6, mp: 20 }],
  ['eq_lingjie', '灵戒', 'item/ring', 0, '灵', '戒面镶嵌灵石,可储灵力。', { mp: 45, atk: 5 }],
  ['eq_lingzhu', '灵珠', 'item/pearl', 0, '灵', '蕴含水灵之气的宝珠。', { mp: 50, hp: 40 }],
  ['eq_yudi', '玉笛', 'item/flute', 0, '灵', '笛声清越,可乱敌心神。', { mp: 30, atk: 7, spd: 3 }],
  ['eq_yaoqin', '瑶琴', 'item/guqin', 0, '辅', '琴音入魂,攻守随心。', { atk: 7, mp: 30, sense: 6 }],
  ['eq_tongling', '铜铃', 'item/goldbell', 0, '辅', '铃声可乱妖兽心神。', { atk: 6, sense: 10, crit: 0.01 }],
  ['eq_fuchen', '拂尘', 'item/whisk', 0, '辅', '道家拂尘,一拂可散邪祟。', { atk: 7, def: 5, sense: 6 }],
  ['eq_liandeng', '莲灯', 'item/lantern', 0, '辅', '灯火长明,滋养气血。', { hp: 70, mp: 25 }],
  ['eq_shufaguan', '束发冠', 'item/crown', 0, '辅', '凝神静气的宝冠。', { hp: 50, sense: 10, mp: 20 }]
];
XX.data.treasureBases = [];
XX.data.normalTreasures.forEach(function (t) {
  XX.data.items[t[0]] = { name: t[1], type: 'equip', icon: t[2], q: t[3], cat: t[4], price: 20, desc: t[5], stats: t[6] };
  XX.data.treasureBases.push(t[0]);
});

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
  hpPct: { name: '坚体', kind: 'stat', range: [0.05, 0.12], pct: true, desc: '气血 +{v}' },
  atkPct: { name: '锋锐', kind: 'stat', range: [0.04, 0.10], pct: true, desc: '攻击 +{v}' },
  defPct: { name: '金身', kind: 'stat', range: [0.05, 0.12], pct: true, desc: '防御 +{v}' }
};

/*
 * 炼器法宝:只能通过「炼器 + 器图」获得,品质固定(白~金),效果固定(白~蓝 1 条,紫/金 2 条)
 * 器图等级决定成品数值倍率(config.bpEffect)
 */
/* 特殊法宝 stats 与普通法宝同一量级(白色 0 级基准),实际 × 品质倍率 × 1.16^强度 × 1.6 × 器图倍率 */
XX.data.forgeTreasures = {
  /* 白 */
  eq_qingfeng: { name: '青锋剑', q: 0, icon: 'item/sword', hue: 160, desc: '剑气清冽的入门飞剑。', stats: { atk: 14, crit: 0.01 }, effects: ['crit'] },
  eq_yunwen: { name: '云纹宝衣', q: 0, icon: 'item/robe', hue: 40, desc: '织入云纹禁制的护身法衣。', stats: { hp: 100, def: 9 }, effects: ['hpPct'] },
  eq_qingxin: { name: '清心玉笛', q: 0, icon: 'item/flute', hue: 30, desc: '笛声涤荡心神,灵力绵绵不绝。', stats: { mp: 45, sense: 8 }, effects: ['mpRegen'] },
  eq_tayun: { name: '踏云靴', q: 0, icon: 'item/boots', hue: 200, desc: '足踏祥云,身轻如燕。', stats: { spd: 8, def: 6, dodge: 0.01 }, effects: ['dodge'] },
  /* 绿 */
  eq_shehun: { name: '摄魂铃', q: 1, icon: 'item/bell', hue: 300, desc: '铃声摄人心魄。', stats: { atk: 10, sense: 10 }, effects: ['pierce'] },
  eq_qiankun: { name: '乾坤镯', q: 1, icon: 'item/bracelet', hue: 40, desc: '可收纳乾坤,护主周全。', stats: { hp: 90, def: 8 }, effects: ['thorns'] },
  eq_bishui: { name: '碧水扇', q: 1, icon: 'item/fan', hue: 60, desc: '一扇碧波起,再扇浪滔天。', stats: { atk: 11, dodge: 0.015 }, effects: ['double'] },
  eq_xuangui: { name: '玄龟盾', q: 1, icon: 'item/shell', hue: 300, desc: '玄龟真灵所化,万法难侵。', stats: { def: 12, hp: 60 }, effects: ['defPct'] },
  /* 蓝 */
  eq_jianxia: { name: '青冥剑匣', q: 2, icon: 'item/swordcase', desc: '匣中藏剑三千,一念出鞘。', stats: { atk: 13, crit: 0.02 }, effects: ['double'] },
  eq_zhenhun: { name: '镇魂钟', q: 2, icon: 'item/bell', hue: 200, desc: '钟声一响,群邪辟易。', stats: { def: 7, sense: 10, mp: 30 }, effects: ['mpRegen'] },
  eq_jiuxiao: { name: '九霄环佩琴', q: 2, icon: 'item/guqin', hue: 330, desc: '琴音直上九霄,声声夺魄。', stats: { atk: 11, sense: 8 }, effects: ['critDmg'] },
  eq_luohun: { name: '落魂伞', q: 2, icon: 'item/umbrella', hue: 200, desc: '伞开则阴风四起,敌刃难近其身。', stats: { def: 8, hp: 60, dodge: 0.01 }, effects: ['dodge'] },
  /* 紫 */
  eq_zhaohun: { name: '招魂幡', q: 3, icon: 'item/banner', hue: 150, desc: '幡动则百魂随行,吞噬生机。', stats: { atk: 10, hp: 60 }, effects: ['lifesteal', 'critDmg'] },
  eq_kunlun: { name: '昆仑镜', q: 3, icon: 'item/mirror', desc: '照见万物本源,洞穿虚实。', stats: { atk: 9, sense: 10, crit: 0.02 }, effects: ['pierce', 'crit'] },
  eq_zidian: { name: '紫电神枪', q: 3, icon: 'item/spear', hue: 230, desc: '枪身缠绕紫电,一击破军。', stats: { atk: 12, spd: 5 }, effects: ['pierce', 'atkPct'] },
  eq_liuli: { name: '八宝琉璃灯', q: 3, icon: 'item/lantern', hue: 160, desc: '琉璃灯火照彻三界,滋养元神。', stats: { hp: 90, mp: 35 }, effects: ['hpPct', 'rate'] },
  /* 金 */
  eq_fantian: { name: '翻天印', q: 4, icon: 'item/seal', desc: '一印落下,山岳崩摧。', stats: { atk: 14, critDmg: 0.1 }, effects: ['critDmg', 'double'] },
  eq_linglong: { name: '玲珑宝塔', q: 4, icon: 'item/pagoda', desc: '塔镇八方,聚天地灵气于一身。', stats: { hp: 80, def: 8, mp: 30 }, effects: ['rate', 'hpPct'] },
  eq_zijin: { name: '紫金葫芦', q: 4, icon: 'item/gourd', hue: 60, desc: '葫中自有洞天,福缘深厚。', stats: { mp: 50, sense: 8, dodge: 0.02 }, effects: ['luck', 'dodge'] },
  eq_dinghai: { name: '定海神珠', q: 4, icon: 'item/pearl', hue: 40, desc: '二十四颗神珠化二十四诸天,定住四海。', stats: { mp: 40, def: 10, hp: 50 }, effects: ['defPct', 'mpRegen'] },
  eq_donghuang: { name: '东皇钟', q: 4, icon: 'item/goldbell', hue: 330, desc: '先天至宝,钟鸣镇压诸天。', stats: { def: 12, hp: 90, mp: 20 }, effects: ['thorns', 'defPct'] },
  eq_zhuxianjian: { name: '诛仙剑', q: 4, icon: 'item/saber', hue: 300, desc: '诛仙四剑之首,非四圣不可破。', stats: { atk: 16, crit: 0.03 }, effects: ['pierce', 'critDmg'] },
  eq_taiji: { name: '太极图', q: 4, icon: 'item/mirror', hue: 180, desc: '一图化阴阳,攻守兼备。', stats: { atk: 9, def: 9, sense: 8 }, effects: ['double', 'atkPct'] },
  eq_hundunzhu: { name: '混沌珠', q: 4, icon: 'item/pearl', hue: 250, desc: '混沌初开凝结之珠,蕴藏无穷灵机。', stats: { hp: 100, mp: 40, sense: 10 }, effects: ['rate', 'lifesteal'] }
};
(function () {
  Object.keys(XX.data.forgeTreasures).forEach(function (id) {
    var t = XX.data.forgeTreasures[id];
    XX.data.items[id] = { name: t.name, type: 'equip', forged: true, icon: t.icon, hue: t.hue, q: t.q, price: 60 * Math.pow(2.5, t.q), desc: t.desc + '(特殊法宝:不可强化,最多同时佩戴 2 件)', stats: t.stats, effects: t.effects };
  });
})();

/* 洞府升级材料 */
XX.data.items.ore_iron_g = { name: '玄铁精', type: 'material', icon: 'item/iron', hue: 100, q: 1, price: 15, desc: '千锤百炼的玄铁精华,洞府 6 级以上升级与法宝高阶强化所需。' };


/* ========== 0.1.5 新增 ========== */
(function () {
  var D = XX.data, I = D.items;
  /* 强化石:历练副本基础掉落 30%,只能强化普通法宝 */
  I.stone_qh = { name: '强化石', type: 'material', icon: 'icon/lingshi', hue: 200, q: 0, price: 5, desc: '凝聚天地精华的灵石,历练副本基础掉落 30%。用于强化普通法宝(特殊法宝无法强化)。' };

  /* 化神~渡劫材料(紫色,副本可掉落)与金色珍材(仅秘境) */
  var mats = [
    ['herb_jiuye', '九叶灵参', 'item/herb', 30, 3, 260, '九叶齐生的灵参,化神修士炼丹所需。'],
    ['ore_xujin', '虚空金', 'item/coldiron', 300, 3, 300, '生于虚空裂隙的奇金,炼虚期炼器主材。'],
    ['herb_wudaocha', '悟道茶', 'item/herb', 280, 3, 320, '传闻饮之可悟大道,炼虚期丹材。'],
    ['core_dao', '道纹妖丹', 'item/core', 100, 3, 360, '妖丹上浮现天然道纹,合体期珍材。'],
    ['crystal_xing', '星魂晶', 'item/bloodcrystal', 200, 3, 380, '蕴藏星辰之魂的晶石。'],
    ['ore_tianjing', '天晶', 'item/coldiron', 60, 3, 420, '天外坠落的晶石,大乘期炼器主材。'],
    ['herb_longxue', '龙血藤', 'item/wood', 330, 3, 440, '吸食真龙之血而生的灵藤。'],
    ['herb_leihua', '劫雷花', 'item/herb', 200, 3, 500, '于劫云之下绽放的奇花,渡劫期炼丹主材。'],
    ['stone_jie', '劫雷石', 'item/darkiron', 60, 3, 480, '天劫雷霆淬炼万年的奇石,渡劫期所需。'],
    ['ore_hundun', '混沌石', 'item/darkiron', 250, 4, 1200, '开天辟地遗留的混沌之石,只在秘境出现。'],
    ['herb_busi', '不死神药', 'item/herb', 50, 4, 1500, '传说中的神药,只在秘境出现。'],
    ['ore_xianjin', '仙金', 'item/iron', 45, 4, 1800, '仙界遗落的神金,只在秘境出现。']
  ];
  mats.forEach(function (m) { I[m[0]] = { name: m[1], type: 'material', icon: m[2], hue: m[3], q: m[4], price: m[5], desc: m[6] }; });

  /* 后期修为丹 */
  I.pill_tongxuan = { name: '通玄丹', type: 'pill', icon: 'item/pill_red', hue: 160, q: 3, price: 2000, desc: '服用后立即获得 40000 点修为。', use: { kind: 'exp', amount: 40000 } };
  I.pill_taixu = { name: '太虚丹', type: 'pill', icon: 'item/pill_gold', hue: 260, q: 4, price: 8000, desc: '服用后立即获得 200000 点修为。', use: { kind: 'exp', amount: 200000 } };
  I.pill_jiuzhuan = { name: '九转金丹', type: 'pill', icon: 'item/pill_gold', hue: 10, q: 4, price: 30000, desc: '服用后立即获得 1000000 点修为。', use: { kind: 'exp', amount: 1000000 } };

  /*
   * 突破丹:每个大境界一种,只能在该大境界内服用(突破时选择是否服用)
   * qByGrade:品质由炼制时的丹方等级决定(1级白 2级绿 3级蓝 4级紫 5级金),成功率 +10%/15%/20%/25%/30%
   */
  D.breakPillNames = ['筑基丹', '凝金丹', '化婴丹', '凝神丹', '炼虚丹', '合体丹', '大乘丹', '渡劫丹', '飞升丹'];
  D.realmMajors.forEach(function (m, mi) {
    I['pill_brk' + mi] = { name: D.breakPillNames[mi], type: 'pill', qByGrade: true, icon: 'item/pill_gold', hue: mi * 40, q: 0, price: 100 * Math.pow(2.2, mi),
      desc: m.name + '期专用突破丹,突破时可选择服用:白 +10%,每高一品质再 +5%(金 +30%)。品质由炼制所用丹方等级决定。', use: { kind: 'break', major: mi } };
  });

  /* 属性丹:永久提升属性,每种每个大境界有累计服用上限;效果随品质(丹方等级)提升 */
  D.attrPills = {
    pill_attr_hp: { name: '气血丹', key: 'hpPct', v: 0.006, label: '气血', hue: 0 },
    pill_attr_atk: { name: '力元丹', key: 'atkPct', v: 0.005, label: '攻击', hue: 300 },
    pill_attr_def: { name: '铁骨丹', key: 'defPct', v: 0.005, label: '防御', hue: 60 },
    pill_attr_mp: { name: '灵元丹', key: 'mpPct', v: 0.006, label: '灵力', hue: 200 }
  };
  Object.keys(D.attrPills).forEach(function (id) {
    var a = D.attrPills[id];
    I[id] = { name: a.name, type: 'pill', qByGrade: true, icon: 'item/bottle', hue: a.hue, q: 0, price: 60,
      desc: '属性丹。每颗永久提升' + a.label + ' ' + (a.v * 100).toFixed(1) + '%(随品质提升,金色 ×2)。每种累计服用上限:炼气期 5 颗、筑基期 10 颗,之后每突破一个大境界上限 +15。', use: { kind: 'attr', key: a.key, v: a.v } };
  });

})();

/* 物品的实际品质:按品质着色的丹药(突破丹、属性丹)品质 = 品级 - 1 */
XX.data.qOf = function (id, g) {
  var it = XX.data.items[id];
  if (!it) return 0;
  return it.qByGrade ? Math.max(0, Math.min(4, (g || 1) - 1)) : (it.q || 0);
};

/*
 * 洞府数据:设施升级 / 阵法 / 灵田 / 灵矿
 * 设施与阵法上限 10 级。升到目标等级 T 的消耗:
 *   1~5 级:灵石 + 白色玄铁(ore_iron)
 *   6~10 级:灵石 + 绿色玄铁精(ore_iron_g) + 仙玉
 * 数量 = 基数(stoneBase / ironBase / jadeBase) × upgradeMul 对应列
 */
XX.data.upgradeMul = {
  //          T: 0  1  2  3  4   5   6   7   8   9   10
  stone:      [0, 1, 2, 4, 7, 12, 20, 32, 50, 75, 110],
  iron:       [0, 1, 2, 3, 5, 8,  0,  0,  0,  0,  0],   // 白色玄铁
  ironG:      [0, 0, 0, 0, 0, 0,  2,  3,  5,  8, 12],   // 绿色玄铁精
  jade:       [0, 0, 0, 0, 0, 0,  1,  2,  3,  4,  5]
};
XX.data.upgradeMat = { iron: 'ore_iron', ironG: 'ore_iron_g' };

/* 设施:初始 1 级 */
XX.data.facilities = {
  alchemy: { name: '丹炉', icon: 'icon/alchemy', stoneBase: 500, ironBase: 3, jadeBase: 20, desc: '等级决定可炼丹药品质:1-2 级白、3-4 级绿、5-6 级蓝、7-8 级紫、9-10 级金;每级成丹率 +1%' },
  forge: { name: '器炉', icon: 'icon/forge', stoneBase: 600, ironBase: 4, jadeBase: 25, desc: '等级决定可炼法宝品质:1-2 级白、3-4 级绿、5-6 级蓝、7-8 级紫、9-10 级金' },
  field: { name: '灵田', icon: 'icon/field', stoneBase: 400, ironBase: 2, jadeBase: 15, desc: '每级增加 1 块地(最多 9 块),生长速度 +4%;等级决定可种灵植品质' },
  mine: { name: '灵矿', icon: 'icon/mine', stoneBase: 500, ironBase: 3, jadeBase: 20, desc: '等级提升灵石产量,并解锁更珍贵的伴生矿' }
};
/* 设施等级 → 可处理的最高品质:1-2→白 3-4→绿 5-6→蓝 7-8→紫 9-10→金 */
XX.data.tierByLv = function (lv) { return Math.min(4, Math.floor((lv - 1) / 2)); };
XX.data.lvForTier = function (q) { return q * 2 + 1; };

/*
 * 阵法:每种品质(白~金)都有 修炼速度 / 攻击 / 防御 / 气血 四类阵法,同时最多 5 个阵法生效(config.arrayActiveMax)
 * 白/绿/蓝 1 种效果,紫/金 2 种效果;需持有阵图(base:true 开局即有);布置即 1 级,每升 1 级效果 +20%,10 级 = ★
 * 效果字段:rate atkPct defPct hpPct mpPct critDmg dodge crit
 */
XX.data.arrayTypes = [
  { key: 'rate', label: '修炼速度', icon: 'icon/array', names: ['聚灵阵', '灵泉阵', '周天星斗阵', '九天聚灵阵', '混元太极阵'], extra: { k: 'mpPct', r: 0.6 } },
  { key: 'atkPct', label: '攻击', icon: 'icon/trial', names: ['杀伐阵', '锐金阵', '天罡剑阵', '诛仙剑阵', '戮仙剑阵'], extra: { k: 'critDmg', r: 1.2 } },
  { key: 'defPct', label: '防御', icon: 'icon/array', hue: 180, names: ['金光阵', '厚土阵', '玄武阵', '两仪微尘阵', '八卦天机阵'], extra: { k: 'dodge', r: 0.25 } },
  { key: 'hpPct', label: '气血', icon: 'icon/field', names: ['青木阵', '长春阵', '九宫护山阵', '生生造化阵', '不灭金身阵'], extra: { k: 'crit', r: 0.25 } }
];
XX.data.arrayBase = [0.03, 0.05, 0.08, 0.12, 0.18];       // 各品质主效果基础值(1 级)
XX.data.arrayIds = { rate: ['juling', 'lingquan', 'xingdou', 'jiutian', 'hunyuan'], atkPct: ['shafa', 'ruijin', 'tiangang', 'zhuxian', 'luxian'],
  defPct: ['jinguang', 'houtu', 'xuanwu', 'liangyi', 'bagua'], hpPct: ['qingmu', 'changchun', 'hushan', 'zaohua', 'jinshen'] };
XX.data.arrays = [];
XX.data.arrayTypes.forEach(function (t) {
  for (var q = 0; q < 5; q++) {
    var eff = {}; eff[t.key] = XX.data.arrayBase[q];
    if (q >= 3) eff[t.extra.k] = Math.round(XX.data.arrayBase[q] * t.extra.r * 1000) / 1000;
    XX.data.arrays.push({ id: XX.data.arrayIds[t.key][q], name: t.names[q], q: q, base: q === 0, icon: t.icon, hue: (t.hue || 0) + q * 40, effects: eff,
      stoneBase: [300, 600, 1200, 2400, 4800][q], ironBase: [2, 3, 4, 6, 8][q], jadeBase: [15, 25, 40, 60, 90][q], desc: '提升' + t.label + (q >= 3 ? '并附带额外效果' : '') + '。' });
  }
});
XX.data.arrayEffectName = { rate: '修炼速度', atkPct: '攻击', defPct: '防御', hpPct: '气血', mpPct: '灵力', critDmg: '暴击伤害', dodge: '闪避率', crit: '暴击率' };
XX.data.makeBlueprints('array', XX.data.arrays);

/* 灵田:地块数 = min(maxPlots, basePlots + 等级);seedQ 为灵种品阶,需要对应灵田等级 */
XX.data.field = {
  basePlots: 2,
  maxPlots: 9,
  speedPerLv: 0.04,
  crops: [
    { seed: 'seed_ninglu', out: 'herb_ninglu', time: 600, yield: [1, 3], q: 0 },
    { seed: 'seed_zhu', out: 'fruit_zhu', time: 1800, yield: [1, 2], q: 1 },
    { seed: 'seed_chiyan', out: 'herb_chiyan', time: 2400, yield: [1, 2], q: 1 },
    { seed: 'seed_ziyun', out: 'herb_ziyun', time: 7200, yield: [1, 2], q: 2 }
  ],
  seedReturnChance: 0.35 // 收获时返还种子的概率
};

/* 灵矿:每分钟灵石(按等级 1~10);储量上限为 capMinutes 分钟产量 */
XX.data.mine = {
  stonePerMin: [0, 4, 6, 9, 13, 18, 25, 34, 46, 62, 82],
  capMinutes: 480,
  /* 每分钟伴生矿掉落概率(按等级解锁) */
  ores: [
    { id: 'ore_iron', perMin: 0.06, minLv: 1 },
    { id: 'ore_iron_g', perMin: 0.02, minLv: 3 },
    { id: 'jade_raw', perMin: 0.03, minLv: 3 },
    { id: 'ore_cold', perMin: 0.025, minLv: 5 },
    { id: 'ore_star', perMin: 0.008, minLv: 7 },
    { id: 'ore_youming', perMin: 0.003, minLv: 9 }
  ]
};

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
 * 阵法:白~金品质;白/绿/蓝 1 种效果,紫/金 2 种效果
 * 需持有对应阵图(base:true 开局即有)才能布置,布置即 1 级;每升 1 级效果 +20%,10 级 = 1 颗星
 * 阵图等级决定效果倍率(config.bpEffect);效果字段:rate atkPct defPct hpPct dodge critDmg fieldSpeed mineBonus
 */
XX.data.arrays = [
  { id: 'juling', name: '聚灵阵', q: 0, base: true, icon: 'icon/array', effects: { rate: 0.05 }, stoneBase: 300, ironBase: 2, jadeBase: 20, desc: '汇聚天地灵气,提升修炼速度。' },
  { id: 'jinguang', name: '金光阵', q: 0, base: true, icon: 'icon/array', hue: 180, effects: { defPct: 0.05 }, stoneBase: 300, ironBase: 2, jadeBase: 20, desc: '金光护体,提升防御。' },
  { id: 'shafa', name: '杀伐阵', q: 1, icon: 'icon/trial', effects: { atkPct: 0.06 }, stoneBase: 400, ironBase: 3, jadeBase: 20, desc: '以煞气淬体,提升攻击。' },
  { id: 'yuanling', name: '元灵阵', q: 1, icon: 'icon/field', effects: { fieldSpeed: 0.1 }, stoneBase: 400, ironBase: 3, jadeBase: 20, desc: '滋养灵田,加快灵植生长。' },
  { id: 'jubao', name: '聚宝阵', q: 2, icon: 'icon/mine', effects: { mineBonus: 0.15 }, stoneBase: 600, ironBase: 4, jadeBase: 25, desc: '牵引地脉,提升灵矿产出。' },
  { id: 'hushan', name: '九宫护山阵', q: 2, icon: 'icon/array', hue: 90, effects: { hpPct: 0.08 }, stoneBase: 600, ironBase: 4, jadeBase: 25, desc: '九宫护山,固本培元。' },
  { id: 'xingdou', name: '周天星斗阵', q: 3, icon: 'icon/array', hue: 250, effects: { rate: 0.08, atkPct: 0.05 }, stoneBase: 1000, ironBase: 6, jadeBase: 35, desc: '引周天星力,修炼与攻伐兼备。' },
  { id: 'liangyi', name: '两仪微尘阵', q: 3, icon: 'icon/array', hue: 300, effects: { defPct: 0.08, dodge: 0.02 }, stoneBase: 1000, ironBase: 6, jadeBase: 35, desc: '两仪化微尘,来犯者难近其身。' },
  { id: 'zhuxian', name: '诛仙剑阵', q: 4, icon: 'icon/trial', hue: 200, effects: { atkPct: 0.1, critDmg: 0.12 }, stoneBase: 1600, ironBase: 8, jadeBase: 50, desc: '四剑镇四方,杀伐无双。' },
  { id: 'hunyuan', name: '混元太极阵', q: 4, icon: 'icon/array', hue: 40, effects: { rate: 0.12, hpPct: 0.08 }, stoneBase: 1600, ironBase: 8, jadeBase: 50, desc: '混元归一,太极生生。' }
];
XX.data.arrayEffectName = { rate: '修炼速度', atkPct: '攻击', defPct: '防御', hpPct: '气血', dodge: '闪避率', critDmg: '暴击伤害', fieldSpeed: '灵植生长', mineBonus: '灵矿产出' };
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

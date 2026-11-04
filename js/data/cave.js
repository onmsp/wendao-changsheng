/*
 * 洞府数据:设施升级 / 阵法 / 灵田 / 灵矿
 * 所有设施与阵法上限 10 级(config.caveMaxLv)
 * 升级到目标等级 T 的消耗:灵石 = stoneBase × upgradeMul.stone[T];仙玉 = jadeBase × upgradeMul.jade[T](6 级起需要仙玉)
 */
XX.data.upgradeMul = {
  //       T: 0  1  2  3  4   5   6   7   8   9   10
  stone: [0, 1, 2, 4, 7, 12, 20, 32, 50, 75, 110],
  jade: [0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5]
};

/* 设施:初始 1 级 */
XX.data.facilities = {
  alchemy: { name: '丹炉', icon: 'icon/alchemy', stoneBase: 500, jadeBase: 20, desc: '等级决定可炼丹药品阶:1-2 级白、3-4 级绿、5-6 级蓝、7-8 级紫、9-10 级金;每级成丹率 +1%' },
  forge: { name: '器炉', icon: 'icon/forge', stoneBase: 600, jadeBase: 25, desc: '等级决定可炼特殊法宝阶位(3/5/7/9 级解锁);每级出金品概率 +2%' },
  field: { name: '灵田', icon: 'icon/field', stoneBase: 400, jadeBase: 15, desc: '每级增加 1 块地(最多 9 块),生长速度 +4%;等级决定可种灵植品阶' },
  mine: { name: '灵矿', icon: 'icon/mine', stoneBase: 500, jadeBase: 20, desc: '等级提升灵石产量,并解锁更珍贵的伴生矿' }
};
/* 设施等级 → 可处理的最高品阶:1-2→白 3-4→绿 5-6→蓝 7-8→紫 9-10→金 */
XX.data.tierByLv = function (lv) { return Math.min(4, Math.floor((lv - 1) / 2)); };
XX.data.lvForTier = function (q) { return q * 2 + 1; };

/* 阵法:初始 0 级;per 为每级效果 */
XX.data.arrays = [
  { id: 'juling', name: '聚灵阵', icon: 'icon/array', effect: 'rate', per: 0.04, stoneBase: 300, jadeBase: 20, desc: '汇聚天地灵气,修炼速度 +4%/级' },
  { id: 'shafa', name: '杀伐阵', icon: 'icon/trial', effect: 'atkPct', per: 0.03, stoneBase: 400, jadeBase: 20, desc: '以煞气淬体,攻击 +3%/级' },
  { id: 'jinguang', name: '金光阵', icon: 'icon/array', hue: 180, effect: 'defPct', per: 0.03, stoneBase: 400, jadeBase: 20, desc: '金光护体,防御与气血 +3%/级' },
  { id: 'yuanling', name: '元灵阵', icon: 'icon/field', effect: 'fieldSpeed', per: 0.05, stoneBase: 300, jadeBase: 15, desc: '滋养灵田,灵植生长速度 +5%/级' },
  { id: 'jubao', name: '聚宝阵', icon: 'icon/mine', effect: 'mineBonus', per: 0.08, stoneBase: 300, jadeBase: 15, desc: '牵引地脉,灵矿产出 +8%/级' }
];

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
    { id: 'jade_raw', perMin: 0.03, minLv: 3 },
    { id: 'ore_cold', perMin: 0.025, minLv: 5 },
    { id: 'ore_star', perMin: 0.008, minLv: 7 },
    { id: 'ore_youming', perMin: 0.003, minLv: 9 }
  ]
};

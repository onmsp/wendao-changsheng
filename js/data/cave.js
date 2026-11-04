/* 洞府数据:阵法 / 灵田 / 灵矿 */

/* 阵法:cost(lv) 返回升到 lv+1 的灵石花费;per 为每级效果 */
XX.data.arrays = [
  { id: 'juling', name: '聚灵阵', icon: 'icon/array', effect: 'rate', per: 0.08, maxLv: 30, costBase: 200, costGrow: 1.55, desc: '汇聚天地灵气,修炼速度 +8%/级' },
  { id: 'shafa', name: '杀伐阵', icon: 'icon/trial', effect: 'atkPct', per: 0.04, maxLv: 30, costBase: 300, costGrow: 1.55, desc: '以煞气淬体,攻击 +4%/级' },
  { id: 'jinguang', name: '金光阵', icon: 'icon/array', hue: 180, effect: 'defPct', per: 0.04, maxLv: 30, costBase: 300, costGrow: 1.55, desc: '金光护体,防御与气血 +4%/级' },
  { id: 'yuanling', name: '元灵阵', icon: 'icon/field', effect: 'fieldSpeed', per: 0.06, maxLv: 20, costBase: 250, costGrow: 1.6, desc: '滋养灵田,灵植生长速度 +6%/级' },
  { id: 'jubao', name: '聚宝阵', icon: 'icon/mine', effect: 'mineBonus', per: 0.10, maxLv: 20, costBase: 250, costGrow: 1.6, desc: '牵引地脉,灵矿产出 +10%/级' }
];

/* 灵田 */
XX.data.field = {
  initPlots: 3,
  maxPlots: 9,
  unlockCost: [0, 0, 0, 800, 2000, 5000, 12000, 30000, 80000], // 第 n 块地的解锁花费(灵石)
  crops: [
    { seed: 'seed_ninglu', out: 'herb_ninglu', time: 90, yield: [2, 4], reqRealm: 0 },
    { seed: 'seed_zhu', out: 'fruit_zhu', time: 180, yield: [1, 3], reqRealm: 1 },
    { seed: 'seed_chiyan', out: 'herb_chiyan', time: 240, yield: [1, 3], reqRealm: 3 },
    { seed: 'seed_ziyun', out: 'herb_ziyun', time: 600, yield: [1, 2], reqRealm: 6 }
  ],
  seedReturnChance: 0.35 // 收获时返还种子的概率
};

/* 灵矿:每分钟产出;储量上限为 cap 分钟产量 */
XX.data.mine = {
  maxLv: 30,
  stonePerMin: function (lv) { return Math.round(6 * Math.pow(1.28, lv - 1)); },
  upgradeCost: function (lv) { return Math.round(400 * Math.pow(1.7, lv - 1)); },
  capMinutes: 480,
  /* 每分钟矿石掉落概率表(按等级解锁) */
  ores: [
    { id: 'ore_iron', perMin: 0.08, minLv: 1 },
    { id: 'jade_raw', perMin: 0.035, minLv: 2 },
    { id: 'ore_cold', perMin: 0.03, minLv: 3 },
    { id: 'ore_star', perMin: 0.008, minLv: 6 }
  ]
};

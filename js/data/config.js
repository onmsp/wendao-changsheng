/* 全局命名空间与基础配置 */
window.XX = window.XX || { data: {}, sys: {}, pages: {}, screens: {} };

XX.config = {
  gameName: '问道长生',
  version: '0.1.7',
  /* 开源出处(游戏内「关于」页与开始页底部显示) */
  about: { author: 'onmsp', year: 2026, license: 'MIT', repo: 'https://github.com/onmsp/wendao-changsheng' },
  saveKey: 'wendao_changsheng_save',
  tickMs: 3000,            // 修炼结算周期:每 3 秒
  bagCapacity: 50,         // 初始背包格子
  bagMax: { base: 200, perMajorAfter: 3, add: 50 },  // 背包扩展上限:200;元婴(大境界3)之后每个大境界 +50
  stackMax: 99,            // 普通物品每格上限
  shopRefreshHours: 12,    // 商城刷新周期(小时)
  offlineCapHours: 12,     // 离线收益上限(小时)
  autoSaveMs: 5000,
  start: {
    stone: 500,            // 初始灵石
    jade: 0,               // 初始仙玉
    root: 'r5',            // 初始灵根:五色灵根
    items: [['eq_changjian', 1, { q: 0 }]]   // 初始物品:一把白色法宝·长剑
  },
  treasureSlots: 4,        // 可同时佩戴的法宝数量(显示在人物四角)
  specialTreasureMax: 2,   // 其中特殊法宝(炼器所得)最多佩戴 2 件
  arrayActiveMax: 5,       // 同时生效的阵法数量

  /*
   * 突破:基础成功率 = 0.9 - 大境界序号×0.1 - 小境界序号×0.02;冲击下一大境界再 -5%
   * 失败扣除本层所需修为的 20%
   * 突破丹:当前大境界专用,白色 +10%,每高一品质再 +5%(绿15 蓝20 紫25 金30)
   * 气运:100 气运在炼气期 = +10%(上限),之后每个大境界效果减半
   */
  breakBase: 0.9, breakMajorStep: 0.1, breakMinorStep: 0.02, breakGatePenalty: 0.05,
  breakFailLoss: 0.2,
  breakPillBonus: [0.10, 0.15, 0.20, 0.25, 0.30],
  luckBreakCap: 0.10, luckFull: 100,
  breakMin: 0.03, breakMax: 0.98,
  /* 属性丹:每种每个大境界的累计服用上限(炼气 5、筑基 10,之后每个大境界 +15) */
  attrPillCap: function (major) { return major <= 0 ? 5 : major === 1 ? 10 : 10 + 15 * (major - 1); },
  shopMaxQ: 3,             // 仙玉商城只刷新紫色及以下
  battleSpeed: 1,          // 战斗演出默认倍速
  dungeonCooldownSec: 10,  // 历练副本每场战斗后的刷新等待(秒)
  secretMaxTimes: 10,      // 秘境次数上限
  secretRegenMinutes: 60,  // 每多少分钟恢复 1 次秘境次数
  breakRateBonus: { minor: 0.02, major: 0.05 },   // 每次小/大境界突破永久提升的修炼速度
  /* 功法/技能栏位:按大境界序号(0炼气 1筑基 2金丹 3元婴 … 8渡劫) */
  techniqueSlots: [
    { maxMajor: 2, gongfa: 1, shentong: 2 },   // 元婴以下
    { maxMajor: 7, gongfa: 1, shentong: 3 },   // 渡劫以下
    { maxMajor: 8, gongfa: 1, shentong: 4 }    // 渡劫期
  ],
  /* 品质:白 绿 蓝 紫 金(界面只用颜色表示,不显示文字) */
  qualities: [
    { name: '白', color: '#e2ddd2' },
    { name: '绿', color: '#6fd28a' },
    { name: '蓝', color: '#5fb4ff' },
    { name: '紫', color: '#c58cff' },
    { name: '金', color: '#ffc83d' }
  ],
  /* 法宝掉落概率(每场胜利/每次通关) */
  treasureDrop: {
    dungeon: [0.10, 0.05, 0.02, 0.005, 0],   // 历练副本:白 绿 蓝 紫 金(副本不出金色)
    secret: [0, 0, 0, 0.20, 0.10]            // 秘境:只出紫/金
  },
  /* 品质与掉落:所有掉落物的实际概率 = 填写概率 × tierDropMul[品质](品质越高按比例降低) */
  tierDropMul: [1, 0.5, 0.25, 0.125, 0.0625],
  /* 气运提高掉率:每点 +0.5%(100 气运 ≈ +50%,如 30% → 45%),最多按 200 点计 */
  luckDropPer: 0.005, luckDropMaxLuck: 200,
  /* 每个历练副本的基础掉落:玄铁 30%、强化石 30%(数量随副本强度增加) */
  dungeonBaseDrops: [['ore_iron', 0.30], ['stone_qh', 0.30]],
  /* 炼丹/炼器耗时:白 1 分钟,每高一个品质 +1 分钟;特殊丹药双倍 */
  craftMinutes: [1, 2, 3, 4, 5], craftSpecialMul: 2,
  /* 特殊法宝炼制强度 = max(器图基准, 当前境界序号),属性倍率高于普通法宝 */
  specialStatMul: 1.6, specialAffixMul: 1.2,
  /* 战斗:回合上限(超过判负)、单次伤害上限(占目标最大气血)、保底伤害、治疗衰减、护盾/吸血/反震上限 */
  battle: { maxRounds: 30, hitCap: 0.35, critCap: 0.5, skillCap: 0.5, minDmgAtk: 0.15, healDecay: 0.7, shieldCap: 0.5, lifestealCap: 0.08, thornsCap: 0.06 },
  dungeonMaxQ: 3,          // 副本掉落最高品质(紫),金色不会出现在副本
  secretMinQ: 3,           // 秘境掉落最低品质(紫),且不掉落特殊道具

  /* 效果条数:白/绿/蓝 1 条,紫/金 2 条(法宝、阵法);功法额外属性:白~蓝 1 条,紫 2 条,金 3 条 */
  affixCount: [1, 1, 1, 2, 2],
  gongfaExtraCount: [1, 1, 1, 2, 3],
  gongfaBaseRate: [0.05, 0.10, 0.15, 0.22, 0.30], // 功法固定基础属性:修炼速度

  /* 升级通用规则(功法、技能、法宝、阵法):初始 1 级,上限 10 级(10 级 = 1 颗星),每升 1 级基础属性 +20% */
  maxLv: 10,
  lvGrow: 0.2,
  /* 功法/技能碎片:重复获得自动转化为 5 个碎片;升级所需碎片(1→2, 2→3, …, 9→10) */
  fragPerDup: 5,
  fragCost: [10, 30, 50, 100, 150, 200, 250, 300, 350],
  /* 技能:被动概率触发,默认 30%,每升 1 级 +1%,超过 100% 的部分转为技能增伤;每升 1 级灵力消耗 +30% */
  skillChance: 0.30,
  skillChancePerLv: 0.01,
  skillMpGrow: 0.3,

  /* 图纸(丹方/器图/阵图):5 个等级,重复获得 +5 经验;升到下一级所需经验;成品效果倍率 */
  bpExpPerDup: 5,
  bpExpNeed: [50, 150, 450, 1350],
  bpEffect: [1, 1.2, 1.4, 1.7, 2.0],
  /* 洗灵液:每次提升灵根转化度 5%,满 100% 升一品;图纸等级决定可达最高灵根(1级→四色 … 5级→天灵根) */
  rootProgPerUse: 0.05,

  caveMaxLv: 10            // 洞府设施等级上限
};

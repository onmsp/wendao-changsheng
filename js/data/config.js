/* 全局命名空间与基础配置 */
window.XX = window.XX || { data: {}, sys: {}, pages: {}, screens: {} };

XX.config = {
  gameName: '问道长生',
  version: '0.1.3',
  saveKey: 'wendao_changsheng_save',
  tickMs: 3000,            // 修炼结算周期:每 3 秒
  bagCapacity: 50,         // 初始背包格子
  bagMax: { base: 200, perMajorAfter: 3, add: 50 },  // 背包扩展上限:200;元婴(大境界3)之后每个大境界 +50
  stackMax: 99,            // 普通物品每格上限
  shopRefreshHours: 12,    // 商城刷新周期(小时)
  offlineCapHours: 12,     // 离线收益上限(小时)
  autoSaveMs: 5000,
  start: {
    stone: 0,              // 初始灵石
    jade: 0,               // 初始仙玉
    root: 'r5',            // 初始灵根:五色灵根
    items: [['eq_changjian', 1, { q: 0, lv: 0 }]]   // 初始物品:一把凡品法宝·长剑
  },
  treasureSlots: 4,        // 可同时佩戴的法宝数量(显示在人物四角)
  battleSpeed: 1,          // 战斗演出默认倍速
  dungeonCooldownSec: 10,  // 历练副本每场战斗后的刷新等待(秒)
  secretMaxTimes: 10,      // 秘境次数上限
  secretRegenMinutes: 60,  // 每多少分钟恢复 1 次秘境次数
  breakRateBonus: { minor: 0.02, major: 0.05 },   // 每次小/大境界突破永久提升的修炼速度
  /* 功法/神通栏位:按大境界序号(0炼气 1筑基 2金丹 3元婴 … 8渡劫) */
  techniqueSlots: [
    { maxMajor: 2, gongfa: 1, shentong: 2 },   // 元婴以下
    { maxMajor: 7, gongfa: 1, shentong: 3 },   // 渡劫以下
    { maxMajor: 8, gongfa: 1, shentong: 4 }    // 渡劫期
  ],
  /* 法宝品阶:白 绿 蓝 紫 金 */
  qualities: [
    { name: '凡品', color: '#e2ddd2', short: '白' },
    { name: '灵品', color: '#6fd28a', short: '绿' },
    { name: '玄品', color: '#5fb4ff', short: '蓝' },
    { name: '地品', color: '#c58cff', short: '紫' },
    { name: '天品', color: '#ffc83d', short: '金' }
  ],
  /* 法宝掉落概率(每场胜利/每次通关) */
  treasureDrop: {
    dungeon: [0.10, 0.05, 0.02, 0.005, 0],   // 历练副本:白 绿 蓝 紫 金
    secret: [0, 0, 0, 0.20, 0.10]            // 秘境:紫 20% 金 10%
  },
  affixCount: [0, 0, 0, 1, 2],               // 各品阶附带特殊属性条数
  secretTierDropMul: [1, 0.7, 0.45, 0.25, 0.1], // 秘境物品掉率按品阶衰减(白 绿 蓝 紫 金)
  gongfaBaseRate: [0.05, 0.10, 0.15, 0.22, 0.30], // 功法固定基础属性:修炼速度(按品阶)
  shentongMaxLv: 5,                          // 神通最高等级(重复参悟玉简升级,每级效果 +10%)
  caveMaxLv: 10                              // 洞府设施/阵法等级上限
};

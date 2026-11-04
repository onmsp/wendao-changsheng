/* 全局命名空间与基础配置 */
window.XX = window.XX || { data: {}, sys: {}, pages: {}, screens: {} };

XX.config = {
  gameName: '问道长生',
  version: '0.1.1',
  saveKey: 'wendao_changsheng_save',
  tickMs: 3000,            // 修炼结算周期:每 3 秒
  bagCapacity: 50,         // 初始背包格子
  stackMax: 99,            // 普通物品每格上限
  shopRefreshHours: 12,    // 商城刷新周期(小时)
  offlineCapHours: 12,     // 离线收益上限(小时)
  autoSaveMs: 5000,
  start: {
    stone: 0,              // 初始灵石
    jade: 0,               // 初始仙玉
    root: 'r5',            // 初始灵根:五色灵根
    items: [               // 初始物品 [物品id, 数量]
      ['pill_juqi', 5],
      ['seed_ninglu', 6],
      ['herb_ninglu', 6],
      ['ore_iron', 5],
      ['wood_ling', 2]
    ]
  },
  secretDailyTimes: 3,     // 秘境每日次数
  treasureSlots: 4,        // 可同时佩戴的法宝数量(显示在人物四角)
  battleSpeed: 1,          // 战斗演出默认倍速
  qualities: [
    { name: '凡品', color: '#c9c3b5' },
    { name: '灵品', color: '#6fd28a' },
    { name: '玄品', color: '#5fb4ff' },
    { name: '地品', color: '#c58cff' },
    { name: '天品', color: '#ffb547' },
    { name: '仙品', color: '#ff5d6c' }
  ]
};

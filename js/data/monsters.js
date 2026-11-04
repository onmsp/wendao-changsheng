/*
 * 妖兽图鉴:img 对应 assets/monster/{img}.webp
 * hp/atk/def/spd 为相对倍率,实际数值由所在地图的 power 决定
 */
XX.data.monsters = {
  wolf: { name: '风灵狼', img: 'wolf', hp: 0.9, atk: 1.0, def: 0.8, spd: 1.2 },
  spider: { name: '碧毒蛛', img: 'spider', hp: 0.8, atk: 1.1, def: 0.9, spd: 1.0 },
  boar: { name: '赤焰豪彘', img: 'boar', hp: 1.3, atk: 1.0, def: 1.1, spd: 0.8 },
  golem: { name: '镇墓石傀', img: 'golem', hp: 1.6, atk: 0.8, def: 1.5, spd: 0.6 },
  python: { name: '墨鳞玄蟒', img: 'python', hp: 1.3, atk: 1.1, def: 1.0, spd: 0.9 },
  ghost: { name: '阴骨鬼修', img: 'ghost', hp: 0.9, atk: 1.3, def: 0.8, spd: 1.1 },
  eagle: { name: '紫雷鹰', img: 'eagle', hp: 0.9, atk: 1.25, def: 0.8, spd: 1.5 },
  tiger: { name: '金焰白虎', img: 'tiger', hp: 1.2, atk: 1.25, def: 1.1, spd: 1.1 },
  beast: { name: '上古魔兕', img: 'beast', hp: 2.2, atk: 1.3, def: 1.3, spd: 0.9 }
};

/* 妖兽基础曲线(与 realms.js 的玩家曲线对应,power 相当于同等境界序号) */
XX.data.monsterCurve = { hp: [95, 1.172], atk: [13, 1.163], def: [4.5, 1.165], spd: [9, 1.9] };

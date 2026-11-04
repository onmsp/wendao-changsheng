/*
 * 妖兽图鉴:img 对应 assets/monster/{img}.webp;hue 可选,用同一张图做出变种
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
  beast: { name: '上古魔兕', img: 'beast', hp: 2.2, atk: 1.3, def: 1.3, spd: 0.9 },
  /* 元婴 */
  xuelang: { name: '血煞魔狼', img: 'wolf', hue: 160, hp: 1.1, atk: 1.25, def: 0.9, spd: 1.3 },
  minggu: { name: '冥骨尸王', img: 'ghost', hue: 200, hp: 1.3, atk: 1.3, def: 1.0, spd: 1.0 },
  leipeng: { name: '天雷大鹏', img: 'eagle', hue: 40, hp: 1.1, atk: 1.35, def: 0.9, spd: 1.6 },
  mojiao: { name: '幽冥魔蛟', img: 'python', hue: 250, hp: 1.6, atk: 1.25, def: 1.2, spd: 1.0 },
  /* 化神 */
  guiwang: { name: '幽冥鬼王', img: 'ghost', hue: 280, hp: 1.3, atk: 1.35, def: 1.0, spd: 1.1 },
  jinpeng: { name: '金翅大鹏', img: 'eagle', hue: 80, hp: 1.1, atk: 1.4, def: 0.9, spd: 1.7 },
  /* 炼虚 */
  xumang: { name: '虚空巨蟒', img: 'python', hue: 120, hp: 1.7, atk: 1.3, def: 1.2, spd: 0.9 },
  shimo: { name: '太古石魔', img: 'golem', hue: 200, hp: 2.0, atk: 1.1, def: 1.7, spd: 0.6 },
  /* 合体 */
  qilin: { name: '赤炎麒麟', img: 'tiger', hue: 330, hp: 1.4, atk: 1.4, def: 1.2, spd: 1.2 },
  tianlang: { name: '啸月天狼', img: 'wolf', hue: 220, hp: 1.2, atk: 1.45, def: 1.0, spd: 1.5 },
  /* 大乘 */
  mozhu: { name: '万毒魔蛛', img: 'spider', hue: 260, hp: 1.3, atk: 1.5, def: 1.1, spd: 1.2 },
  baize: { name: '圣兽白泽', img: 'tiger', hue: 160, hp: 1.6, atk: 1.4, def: 1.3, spd: 1.2 },
  /* 渡劫 */
  leishou: { name: '九霄雷兽', img: 'beast', hue: 200, hp: 2.2, atk: 1.5, def: 1.4, spd: 1.0 },
  tianmo: { name: '域外天魔', img: 'ghost', hue: 30, hp: 1.5, atk: 1.6, def: 1.1, spd: 1.3 }
};

/* 妖兽基础曲线(power 相当于同等境界序号) */
XX.data.monsterCurve = { hp: [95, 1.172], atk: [13, 1.163], def: [4.5, 1.165], spd: [9, 1.9] };

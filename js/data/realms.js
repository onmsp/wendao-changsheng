/*
 * 境界数据
 * majors:大境界;stages 小境界名称;pill 为突破到该大境界所需丹药(物品 id);baseChance 基础成功率
 * 所有小境界在加载时自动展开为 XX.data.realms 扁平数组,index 即玩家境界序号
 */
XX.data.realmMajors = [
  { name: '炼气', stages: ['一层', '二层', '三层', '四层', '五层', '六层', '七层', '八层', '九层'], lifespan: 100 },
  { name: '筑基', stages: ['初期', '中期', '后期', '圆满'], pill: 'pill_zhuji', baseChance: 0.45, lifespan: 200 },
  { name: '金丹', stages: ['初期', '中期', '后期', '圆满'], pill: 'pill_ningjin', baseChance: 0.40, lifespan: 500 },
  { name: '元婴', stages: ['初期', '中期', '后期', '圆满'], pill: 'pill_huaying', baseChance: 0.35, lifespan: 1000 },
  { name: '化神', stages: ['初期', '中期', '后期', '圆满'], pill: 'pill_ningshen', baseChance: 0.30, lifespan: 2000 },
  { name: '炼虚', stages: ['初期', '中期', '后期', '圆满'], pill: 'pill_lianxu', baseChance: 0.28, lifespan: 5000 },
  { name: '合体', stages: ['初期', '中期', '后期', '圆满'], pill: 'pill_heti', baseChance: 0.25, lifespan: 10000 },
  { name: '大乘', stages: ['初期', '中期', '后期', '圆满'], pill: 'pill_dacheng', baseChance: 0.22, lifespan: 30000 },
  { name: '渡劫', stages: ['初期', '中期', '后期', '圆满'], pill: 'pill_dujie', baseChance: 0.20, lifespan: 99999 }
];

/* 数值曲线(可调) */
XX.data.realmCurve = {
  expBase: 100, expGrow: 1.32,          // 每层所需修为 = expBase * expGrow^index
  hp: [120, 1.18], mp: [60, 1.15],
  atk: [16, 1.17], def: [6, 1.17],
  spd: [10, 2], sense: [10, 3]          // 线性:base + index * k
};

(function buildRealms() {
  var c = XX.data.realmCurve, list = [], idx = 0;
  XX.data.realmMajors.forEach(function (m, mi) {
    m.stages.forEach(function (s, si) {
      list.push({
        index: idx, major: mi, minor: si,
        name: m.name + s,
        majorName: m.name,
        isMajorGate: si === 0 && mi > 0,      // 突破进入此境界需要大境界突破
        pill: si === 0 ? m.pill : null,
        baseChance: si === 0 && mi > 0 ? m.baseChance : Math.max(0.6, 0.92 - mi * 0.04), // 小境界基础成功率随大境界递减
        expNeed: Math.round(c.expBase * Math.pow(c.expGrow, idx)),
        lifespan: m.lifespan,
        stats: {
          hp: Math.round(c.hp[0] * Math.pow(c.hp[1], idx)),
          mp: Math.round(c.mp[0] * Math.pow(c.mp[1], idx)),
          atk: Math.round(c.atk[0] * Math.pow(c.atk[1], idx)),
          def: Math.round(c.def[0] * Math.pow(c.def[1], idx)),
          spd: c.spd[0] + idx * c.spd[1],
          sense: c.sense[0] + idx * c.sense[1]
        }
      });
      idx++;
    });
  });
  XX.data.realms = list;
})();

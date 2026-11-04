/*
 * 境界数据
 * majors:大境界;stages 小境界名称;所有小境界展开为 XX.data.realms 扁平数组,index 即玩家境界序号
 * 突破丹:每个大境界有专用突破丹(pill_brk{大境界序号}),可选服用以提高成功率
 */
XX.data.realmMajors = [
  { name: '炼气', stages: ['一层', '二层', '三层', '四层', '五层', '六层', '七层', '八层', '九层'], lifespan: 100 },
  { name: '筑基', stages: ['初期', '中期', '后期', '圆满'], lifespan: 200 },
  { name: '金丹', stages: ['初期', '中期', '后期', '圆满'], lifespan: 500 },
  { name: '元婴', stages: ['初期', '中期', '后期', '圆满'], lifespan: 1000 },
  { name: '化神', stages: ['初期', '中期', '后期', '圆满'], lifespan: 2000 },
  { name: '炼虚', stages: ['初期', '中期', '后期', '圆满'], lifespan: 5000 },
  { name: '合体', stages: ['初期', '中期', '后期', '圆满'], lifespan: 10000 },
  { name: '大乘', stages: ['初期', '中期', '后期', '圆满'], lifespan: 30000 },
  { name: '渡劫', stages: ['初期', '中期', '后期', '圆满'], lifespan: 99999 }
];

/* 数值曲线(可调) */
XX.data.realmCurve = {
  /*
   * 每层突破所需修为(按境界序号 0~40)。0.1.6 起全部减半(按模型估算普通玩家约 40 天到渡劫);
   * 突破失败会额外损耗修为。
   */
  expTable: [150, 400, 1000, 2500, 6000, 12500, 20000, 27500, 35000,
    85000, 105000, 130000, 155000,
    220000, 270000, 335000, 410000,
    480000, 600000, 700000, 800000,
    850000, 1000000, 1250000, 1450000,
    1500000, 1700000, 1950000, 2250000,
    2400000, 2650000, 2950000, 3300000,
    3600000, 4300000, 5000000, 6000000,
    6500000, 7500000, 8500000, 10000000],
  hp: [120, 1.18], mp: [60, 1.15],
  atk: [16, 1.17], def: [6, 1.17],
  spd: [10, 2], sense: [10, 3]          // 线性:base + index * k
};

(function buildRealms() {
  var c = XX.data.realmCurve, C = XX.config, list = [], idx = 0;
  XX.data.realmMajors.forEach(function (m, mi) {
    m.stages.forEach(function (s, si) {
      var last = si === m.stages.length - 1;
      list.push({
        index: idx, major: mi, minor: si,
        name: m.name + s,
        majorName: m.name,
        isMajorGate: si === 0 && mi > 0,      // 突破进入此境界属于大境界突破
        /* 从本层突破到下一层的基础成功率 */
        breakChance: C.breakBase - mi * C.breakMajorStep - si * C.breakMinorStep - (last ? C.breakGatePenalty : 0),
        pill: 'pill_brk' + mi,                // 本大境界可用的突破丹
        expNeed: c.expTable[idx],
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

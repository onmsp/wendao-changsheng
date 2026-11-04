/*
 * 功法 & 神通
 * 功法(被动):同时只能运转 1 本,提供修炼速度与属性加成
 * 神通(主动):战斗中按栏位顺序自动施展;栏位数量见 config.techniqueSlots
 *   type:dmg 伤害 / multi 多段 / heal 治疗 / drain 吸取
 *   mult 伤害倍率;hits 段数;heal 回复最大气血比例;drain 伤害转化为气血比例
 *   cost 消耗最大灵力比例;cd 冷却回合;fx 演出特效类型(见 battle-view.js)
 * 玉简物品自动生成:功法 gf_{id},神通 st_{id}
 */
XX.data.gongfa = {
  yinqi: { name: '引气诀', q: 0, reqRealm: 0, icon: 'skill/book', hue: 120, effects: { mpPct: 0.05 }, desc: '最基础的引气法门,人人可修,略增灵力。', innate: true },
  changchun: { name: '长春功', q: 1, reqRealm: 2, icon: 'skill/book', hue: 60, effects: { rate: 0.12, hpPct: 0.05 }, desc: '生生不息,滋养肉身。' },
  taixuan: { name: '太玄引气诀', q: 2, reqRealm: 6, icon: 'skill/book', effects: { rate: 0.22 }, desc: '上古引气功法,吐纳之速远超同侪。' },
  jingang: { name: '金刚不坏体', q: 2, reqRealm: 9, icon: 'skill/golden', effects: { rate: 0.15, hpPct: 0.15, defPct: 0.15 }, desc: '佛门炼体秘法,修至大成刀枪不入。' },
  zixia: { name: '紫霞神功', q: 3, reqRealm: 13, icon: 'skill/book', hue: 270, effects: { rate: 0.35, mpPct: 0.2, atkPct: 0.1 }, desc: '紫气东来三万里,灵力生生不绝。' },
  jiuzhuan: { name: '九转玄功', q: 3, reqRealm: 17, icon: 'skill/golden', hue: 320, effects: { rate: 0.5, hpPct: 0.2, atkPct: 0.15 }, desc: '九转功成,法体双修。' },
  taishang: { name: '太上忘情录', q: 4, reqRealm: 21, icon: 'skill/book', hue: 180, effects: { rate: 0.7, sensePct: 0.3, comprehension: 5 }, desc: '太上忘情,以无情证有情。' },
  dayan: { name: '大衍天书', q: 4, reqRealm: 33, icon: 'skill/book', hue: 30, effects: { rate: 1.0, hpPct: 0.2, atkPct: 0.2, defPct: 0.2 }, desc: '大衍之数五十,其用四十有九。' },
  taichu: { name: '太初真解', q: 4, reqRealm: 37, icon: 'skill/sun', effects: { rate: 1.3, atkPct: 0.3, luck: 10 }, desc: '直指太初本源,渡劫者的不传之秘。' }
};

XX.data.shentong = {
  /* —— 角色本命神通(创建角色时自带)—— */
  qingfeng: { name: '青锋剑诀', q: 2, icon: 'skill/sword', type: 'dmg', mult: 1.7, cost: 0.25, cd: 2, fx: 'sword', innate: 'm1', desc: '凝聚剑气,一剑斩出 170% 伤害。' },
  jiugong: { name: '九宫困阵', q: 2, icon: 'skill/rune', type: 'dmg', mult: 1.6, cost: 0.25, cd: 2, fx: 'rune', innate: 'm2', desc: '以九宫阵困杀敌人,造成 160% 伤害。' },
  danhuo: { name: '丹火焚天', q: 2, icon: 'skill/fire', type: 'dmg', mult: 1.7, cost: 0.25, cd: 2, fx: 'fire', innate: 'm3', desc: '以丹火焚烧敌人,造成 170% 伤害。' },
  liedi: { name: '裂地狂刀', q: 2, icon: 'skill/heavy', type: 'dmg', mult: 2.0, cost: 0.3, cd: 3, fx: 'heavy', innate: 'm4', desc: '跃起劈斩,大地崩裂,造成 200% 伤害。' },
  youming: { name: '幽冥魔音', q: 2, icon: 'skill/mist', type: 'drain', mult: 1.5, drain: 0.3, cost: 0.25, cd: 2, fx: 'mist', innate: 'm5', desc: '魔音摄魂,造成 150% 伤害并吸取其中 30% 为气血。' },
  shuanghua: { name: '霜华剑舞', q: 2, icon: 'skill/sword', hue: 20, type: 'multi', mult: 0.65, hits: 3, cost: 0.25, cd: 2, fx: 'swords', innate: 'f1', desc: '剑舞霜华,连斩 3 次,每次 65% 伤害。' },
  huhuo: { name: '狐火燎原', q: 2, icon: 'skill/foxfire', type: 'multi', mult: 0.6, hits: 3, cost: 0.25, cd: 2, fx: 'foxfire', innate: 'f2', desc: '三团狐火追魂索命,每团 60% 伤害。' },
  tianlai: { name: '天籁琴音', q: 2, icon: 'skill/sound', type: 'dmg', mult: 1.6, heal: 0.06, cost: 0.25, cd: 2, fx: 'sound', innate: 'f3', desc: '琴音化刃造成 160% 伤害,并回复 6% 气血。' },
  chiyan: { name: '赤焰双斩', q: 2, icon: 'skill/twin', type: 'multi', mult: 0.9, hits: 2, cost: 0.25, cd: 2, fx: 'twin', innate: 'f4', desc: '双剑交错,斩击 2 次,每次 90% 伤害。' },
  qinglian: { name: '青莲缚灵', q: 2, icon: 'skill/leaf', type: 'dmg', mult: 1.4, heal: 0.12, cost: 0.25, cd: 2, fx: 'leaf', innate: 'f5', desc: '青莲叶刃造成 140% 伤害,并回复 12% 气血。' },
  /* —— 可习得神通 —— */
  huoqiu: { name: '火球术', q: 0, reqRealm: 0, icon: 'skill/fire', type: 'dmg', mult: 1.4, cost: 0.15, cd: 1, fx: 'fire', desc: '凝聚火球轰击敌人,造成 140% 伤害。' },
  huichun: { name: '回春术', q: 0, reqRealm: 1, icon: 'skill/heal', type: 'heal', heal: 0.25, cost: 0.2, cd: 4, fx: 'heal', desc: '气血低于 55% 时施展,回复 25% 气血。' },
  zhangxin: { name: '掌心雷', q: 1, reqRealm: 3, icon: 'skill/thunder', type: 'dmg', mult: 1.8, cost: 0.2, cd: 2, fx: 'thunder', desc: '掌心引雷,造成 180% 伤害。' },
  shiling: { name: '噬灵诀', q: 1, reqRealm: 5, icon: 'skill/drain', type: 'drain', mult: 1.3, drain: 0.5, cost: 0.2, cd: 3, fx: 'drain', desc: '造成 130% 伤害,吸取其中 50% 为气血。' },
  jinshen: { name: '金身诀', q: 2, reqRealm: 8, icon: 'skill/golden', type: 'heal', heal: 0.35, cost: 0.25, cd: 5, fx: 'golden', desc: '气血低于 55% 时施展,金光护体回复 35% 气血。' },
  wanjian: { name: '万剑归宗', q: 2, reqRealm: 10, icon: 'skill/swords', type: 'multi', mult: 0.45, hits: 5, cost: 0.3, cd: 3, fx: 'swords', desc: '万剑齐落,攻击 5 次,每次 45% 伤害。' },
  jiutian: { name: '九天玄雷', q: 3, reqRealm: 14, icon: 'skill/thunder', hue: 40, type: 'dmg', mult: 2.6, cost: 0.3, cd: 3, fx: 'thunder', desc: '引九天玄雷,造成 260% 伤害。' },
  tianhuo: { name: '天火燎原', q: 3, reqRealm: 18, icon: 'skill/sun', type: 'dmg', mult: 3.0, cost: 0.35, cd: 3, fx: 'sun', desc: '召唤天火,造成 300% 伤害。' },
  zhanxian: { name: '斩仙一剑', q: 4, reqRealm: 25, icon: 'skill/sword', hue: 160, type: 'dmg', mult: 4.2, cost: 0.4, cd: 4, fx: 'sword', desc: '斩仙之剑,造成 420% 伤害。' },
  daluo: { name: '大罗金身', q: 4, reqRealm: 29, icon: 'skill/golden', hue: 30, type: 'heal', heal: 0.6, cost: 0.35, cd: 5, fx: 'golden', desc: '气血低于 55% 时施展,回复 60% 气血。' },
  hunyuan: { name: '混元一气', q: 4, reqRealm: 37, icon: 'skill/sun', hue: 180, type: 'multi', mult: 1.2, hits: 4, cost: 0.4, cd: 4, fx: 'sun', desc: '混元一气化四象,攻击 4 次,每次 120% 伤害。' }
};

/* 自动生成玉简物品 */
(function () {
  var D = XX.data;
  Object.keys(D.gongfa).forEach(function (id) {
    var g = D.gongfa[id];
    if (g.innate) return;
    D.items['gf_' + id] = { name: '《' + g.name + '》', type: 'special', icon: 'item/manual', hue: g.hue, q: g.q, price: 150 * (g.q + 1) * (g.q + 1), badge: '功',
      desc: '功法玉简。参悟后可习得功法【' + g.name + '】(需' + D.realms[g.reqRealm].name + ')。' + g.desc, use: { kind: 'learn', cat: 'gongfa', id: id } };
  });
  Object.keys(D.shentong).forEach(function (id) {
    var s = D.shentong[id];
    if (s.innate) return;
    D.items['st_' + id] = { name: '神通·' + s.name, type: 'special', icon: s.icon, hue: s.hue, q: s.q, price: 150 * (s.q + 1) * (s.q + 1), badge: '神',
      desc: '神通玉简。参悟后可习得神通【' + s.name + '】(需' + D.realms[s.reqRealm].name + ')。' + s.desc, use: { kind: 'learn', cat: 'shentong', id: id } };
  });
})();

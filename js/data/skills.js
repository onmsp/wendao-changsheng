/*
 * 功法 & 技能
 * 功法(被动):同时运转 1 本。固定基础属性 = 修炼速度(config.gongfaBaseRate),
 *             另有额外属性 effects:白~蓝 1 条,紫 2 条,金 3 条
 * 技能(被动概率触发):每回合按栏位顺序判定,触发概率默认 30%,每级 +1%,超出 100% 的部分转为技能增伤;
 *             每次触发消耗固定灵力 mp,每升 1 级消耗 +30%
 *   type:dmg 单体 / multi 多段 / heal 治疗(气血<55%) / drain 吸血 / buff 增益 / shield 护盾(气血<70%)
 *   mult 伤害倍率 hits 段数 heal/shield 最大气血比例 drain 伤害转化比例
 *   burn:{pct 每回合灼烧=攻击×pct, turns}  stun 眩晕概率  armor:{pct 降敌防御, turns}  atkUp:{pct, turns}
 *   fx:演出特效(见 battle-view.js)
 * 功法与技能初始 1 级,上限 10 级(满级 = 1 颗星),每升 1 级基础属性 +20%;升级消耗碎片(重复获得自动转化)
 * 玉简物品自动生成:功法 gf_{id},技能 st_{id};获得即自动习得,重复获得转化为碎片
 */
XX.data.gongfa = {
  yinqi: { name: '引气诀', q: 0, reqRealm: 0, icon: 'skill/book', hue: 120, effects: { mpPct: 0.06 }, desc: '最基础的引气法门,人人可修。', innate: true },
  tuna: { name: '吐纳术', q: 0, reqRealm: 0, icon: 'skill/book', hue: 90, effects: { hpPct: 0.06 }, desc: '调和呼吸,气血绵长。' },
  changchun: { name: '长春功', q: 1, reqRealm: 2, icon: 'skill/book', hue: 60, effects: { hpPct: 0.1 }, desc: '生生不息,滋养肉身。' },
  liehuo: { name: '烈火诀', q: 1, reqRealm: 4, icon: 'skill/fire', effects: { atkPct: 0.08 }, desc: '以火炼气,出手刚猛。' },
  taixuan: { name: '太玄引气诀', q: 2, reqRealm: 6, icon: 'skill/book', effects: { mpPct: 0.2 }, desc: '上古引气功法,吐纳之速远超同侪。' },
  jingang: { name: '金刚不坏体', q: 2, reqRealm: 9, icon: 'skill/golden', effects: { defPct: 0.15 }, desc: '佛门炼体秘法,修至大成刀枪不入。' },
  zixia: { name: '紫霞神功', q: 3, reqRealm: 13, icon: 'skill/book', hue: 270, effects: { mpPct: 0.2, atkPct: 0.12 }, desc: '紫气东来三万里,灵力生生不绝。' },
  jiuzhuan: { name: '九转玄功', q: 3, reqRealm: 15, icon: 'skill/golden', hue: 320, effects: { hpPct: 0.2, defPct: 0.12 }, desc: '九转功成,法体双修。' },
  xuanming: { name: '玄冥真经', q: 3, reqRealm: 21, icon: 'skill/book', hue: 220, effects: { hpPct: 0.2, defPct: 0.15 }, desc: '玄冥之气护体,万法难侵。' },
  taishang: { name: '太上忘情录', q: 4, reqRealm: 17, icon: 'skill/book', hue: 180, effects: { sensePct: 0.3, comprehension: 5, luck: 3 }, desc: '太上忘情,以无情证有情。' },
  dayan: { name: '大衍天书', q: 4, reqRealm: 25, icon: 'skill/book', hue: 30, effects: { hpPct: 0.2, atkPct: 0.2, defPct: 0.2 }, desc: '大衍之数五十,其用四十有九。' },
  hunyuangong: { name: '混元一气功', q: 4, reqRealm: 29, icon: 'skill/sun', hue: 100, effects: { atkPct: 0.25, hpPct: 0.2, crit: 0.04 }, desc: '混元一气,万法归宗。' },
  taichu: { name: '太初真解', q: 4, reqRealm: 33, icon: 'skill/sun', effects: { atkPct: 0.3, luck: 5, crit: 0.05 }, desc: '直指太初本源,渡劫者的不传之秘。' }
};
XX.data.gongfaAttrName = { rate: '修炼速度', hpPct: '气血', atkPct: '攻击', defPct: '防御', mpPct: '灵力', sensePct: '神识', luck: '气运', comprehension: '悟性', crit: '暴击率', dodge: '闪避率' };

/* 等级倍率:每升 1 级基础属性 +20% */
XX.data.lvMul = function (lv) { return 1 + XX.config.lvGrow * ((lv || 1) - 1); };
/* 升到下一级所需碎片(当前等级 lv);满级返回 0 */
XX.data.fragNeed = function (lv) { return lv >= XX.config.maxLv ? 0 : XX.config.fragCost[lv - 1]; };

/* 功法完整效果(含等级) = 固定修炼速度 + 额外属性 */
XX.data.gongfaEffects = function (id, lv) {
  var g = XX.data.gongfa[id];
  if (!g) return {};
  var m = XX.data.lvMul(lv), e = { rate: XX.config.gongfaBaseRate[g.q] * m };
  Object.keys(g.effects).forEach(function (k) {
    var v = g.effects[k] * m;
    e[k] = (e[k] || 0) + (g.effects[k] >= 1 ? Math.round(v) : Math.round(v * 1000) / 1000);
  });
  return e;
};

XX.data.shentong = {
  /* —— 角色本命技能(创建角色时已习得,需自行装配)—— */
  qingfeng: { name: '青锋剑诀', q: 2, icon: 'skill/sword', type: 'dmg', mult: 1.8, armor: { pct: 0.2, turns: 2 }, mp: 20, fx: 'sword', innate: 'm1', desc: '凝聚剑气斩出 180% 伤害,并使敌人防御降低 20%(2 回合)。' },
  jiugong: { name: '九宫困阵', q: 2, icon: 'skill/rune', type: 'dmg', mult: 1.4, stun: 0.5, mp: 20, fx: 'rune', innate: 'm2', desc: '九宫阵困杀敌人,造成 140% 伤害,50% 概率使其眩晕 1 回合。' },
  danhuo: { name: '丹火焚天', q: 2, icon: 'skill/fire', type: 'dmg', mult: 1.5, burn: { pct: 0.3, turns: 3 }, mp: 20, fx: 'fire', innate: 'm3', desc: '丹火焚烧敌人造成 150% 伤害,并灼烧 3 回合(每回合 30% 攻击)。' },
  liedi: { name: '裂地狂刀', q: 2, icon: 'skill/heavy', type: 'dmg', mult: 2.2, stun: 0.2, mp: 24, fx: 'heavy', innate: 'm4', desc: '跃起劈斩造成 220% 伤害,20% 概率震晕敌人。' },
  youming: { name: '幽冥魔音', q: 2, icon: 'skill/mist', type: 'drain', mult: 1.5, drain: 0.3, stun: 0.25, mp: 20, fx: 'mist', innate: 'm5', desc: '魔音摄魂造成 150% 伤害,吸取其中 30% 为气血,25% 概率使敌人失神。' },
  shuanghua: { name: '霜华剑舞', q: 2, icon: 'skill/sword', hue: 20, type: 'multi', mult: 0.65, hits: 3, stun: 0.2, mp: 20, fx: 'swords', innate: 'f1', desc: '剑舞霜华连斩 3 次,每次 65% 伤害,20% 概率冻结敌人。' },
  huhuo: { name: '狐火燎原', q: 2, icon: 'skill/foxfire', type: 'multi', mult: 0.55, hits: 3, burn: { pct: 0.2, turns: 3 }, mp: 20, fx: 'foxfire', innate: 'f2', desc: '三团狐火每团 55% 伤害,并灼烧 3 回合(每回合 20% 攻击)。' },
  tianlai: { name: '天籁琴音', q: 2, icon: 'skill/sound', type: 'dmg', mult: 1.5, heal: 0.08, mp: 20, fx: 'sound', innate: 'f3', desc: '琴音化刃造成 150% 伤害,并回复 8% 气血。' },
  chiyan: { name: '赤焰双斩', q: 2, icon: 'skill/twin', type: 'multi', mult: 0.95, hits: 2, burn: { pct: 0.15, turns: 2 }, mp: 20, fx: 'twin', innate: 'f4', desc: '双剑交错斩击 2 次,每次 95% 伤害,附带灼烧。' },
  qinglian: { name: '青莲缚灵', q: 2, icon: 'skill/leaf', type: 'dmg', mult: 1.3, heal: 0.12, stun: 0.3, mp: 20, fx: 'leaf', innate: 'f5', desc: '青莲叶刃造成 130% 伤害,回复 12% 气血,30% 概率缚住敌人。' },
  /* —— 白 —— */
  huoqiu: { name: '火球术', q: 0, reqRealm: 0, icon: 'skill/fire', type: 'dmg', mult: 1.4, burn: { pct: 0.12, turns: 2 }, mp: 10, fx: 'fire', desc: '火球轰击造成 140% 伤害,并灼烧 2 回合。' },
  huichun: { name: '回春术', q: 0, reqRealm: 1, icon: 'skill/heal', type: 'heal', heal: 0.25, mp: 12, fx: 'heal', desc: '气血低于 55% 时可触发,回复 25% 气血。' },
  jinzhong: { name: '金钟罩', q: 0, reqRealm: 2, icon: 'skill/golden', hue: 200, type: 'shield', shield: 0.2, mp: 12, fx: 'shield', desc: '气血低于 70% 时可触发,获得 20% 最大气血的护盾。' },
  /* —— 绿 —— */
  zhangxin: { name: '掌心雷', q: 1, reqRealm: 3, icon: 'skill/thunder', type: 'dmg', mult: 1.8, stun: 0.2, mp: 16, fx: 'thunder', desc: '掌心引雷造成 180% 伤害,20% 概率麻痹敌人。' },
  shiling: { name: '噬灵诀', q: 1, reqRealm: 5, icon: 'skill/drain', type: 'drain', mult: 1.3, drain: 0.5, mp: 16, fx: 'drain', desc: '造成 130% 伤害,吸取其中 50% 为气血。' },
  kuangbao: { name: '狂暴诀', q: 1, reqRealm: 4, icon: 'skill/drain', hue: 30, type: 'buff', atkUp: { pct: 0.3, turns: 3 }, mp: 16, fx: 'rage', desc: '触发后 3 回合内攻击 +30%(效果期间不再触发)。' },
  /* —— 蓝 —— */
  jinshen: { name: '金身诀', q: 2, reqRealm: 8, icon: 'skill/golden', type: 'heal', heal: 0.3, shield: 0.15, mp: 24, fx: 'golden', desc: '气血低于 55% 时可触发,回复 30% 气血并获得 15% 护盾。' },
  wanjian: { name: '万剑归宗', q: 2, reqRealm: 10, icon: 'skill/swords', type: 'multi', mult: 0.45, hits: 5, mp: 26, fx: 'swords', desc: '万剑齐落,攻击 5 次,每次 45% 伤害。' },
  pojia: { name: '破甲指', q: 2, reqRealm: 9, icon: 'skill/thunder', hue: 160, type: 'dmg', mult: 1.5, armor: { pct: 0.35, turns: 3 }, mp: 22, fx: 'sword', desc: '指力破甲造成 150% 伤害,敌人防御降低 35%(3 回合)。' },
  /* —— 紫 —— */
  jiutian: { name: '九天玄雷', q: 3, reqRealm: 14, icon: 'skill/thunder', hue: 40, type: 'dmg', mult: 2.6, stun: 0.35, mp: 40, fx: 'thunder', desc: '引九天玄雷造成 260% 伤害,35% 概率眩晕。' },
  tianhuo: { name: '天火燎原', q: 3, reqRealm: 16, icon: 'skill/sun', type: 'dmg', mult: 2.2, burn: { pct: 0.4, turns: 3 }, mp: 42, fx: 'sun', desc: '召唤天火造成 220% 伤害,并灼烧 3 回合(每回合 40% 攻击)。' },
  xuanwu: { name: '玄武真罡', q: 3, reqRealm: 15, icon: 'skill/golden', hue: 120, type: 'shield', shield: 0.4, mp: 36, fx: 'shield', desc: '气血低于 70% 时可触发,获得 40% 最大气血的护盾。' },
  xuehai: { name: '血海滔天', q: 3, reqRealm: 23, icon: 'skill/drain', hue: 340, type: 'drain', mult: 2.0, drain: 0.4, mp: 45, fx: 'drain', desc: '血海翻涌造成 200% 伤害,吸取其中 40% 为气血。' },
  /* —— 金 —— */
  tianjie: { name: '天劫神雷', q: 4, reqRealm: 37, icon: 'skill/thunder', hue: 200, type: 'dmg', mult: 5.0, stun: 0.4, mp: 90, fx: 'thunder', desc: '引动天劫之雷造成 500% 伤害,40% 概率眩晕。' },
  wanfa: { name: '万法归一', q: 4, reqRealm: 35, icon: 'skill/swords', hue: 50, type: 'multi', mult: 1.5, hits: 4, mp: 85, fx: 'swords', desc: '万法归一,攻击 4 次,每次 150% 伤害。' },
  zhanxian: { name: '斩仙一剑', q: 4, reqRealm: 21, icon: 'skill/sword', hue: 160, type: 'dmg', mult: 4.2, armor: { pct: 0.3, turns: 2 }, mp: 70, fx: 'sword', desc: '斩仙之剑造成 420% 伤害,并破敌防御 30%。' },
  daluo: { name: '大罗金身', q: 4, reqRealm: 25, icon: 'skill/golden', hue: 30, type: 'heal', heal: 0.5, shield: 0.3, mp: 60, fx: 'golden', desc: '气血低于 55% 时可触发,回复 50% 气血并获得 30% 护盾。' },
  hunyuan: { name: '混元一气', q: 4, reqRealm: 29, icon: 'skill/sun', hue: 180, type: 'multi', mult: 1.2, hits: 4, mp: 70, fx: 'sun', desc: '混元一气化四象,攻击 4 次,每次 120% 伤害。' },
  tianmo: { name: '天魔解体', q: 4, reqRealm: 33, icon: 'skill/drain', hue: 300, type: 'buff', atkUp: { pct: 0.6, turns: 3 }, mp: 60, fx: 'rage', desc: '燃烧精血,3 回合内攻击 +60%。' }
};

/* 技能按等级计算的实际数值 */
XX.data.shentongAt = function (id, lv) {
  var C = XX.config, s = XX.data.shentong[id], m = XX.data.lvMul(lv), o = {};
  lv = lv || 1;
  Object.keys(s).forEach(function (k) { o[k] = s[k]; });
  /* 伤害倍率按 +20%/级成长;治疗、护盾、吸血等续航效果只按 +5%/级成长并设上限,避免战斗中「打不死」 */
  var ms = 1 + 0.05 * (lv - 1);
  if (o.mult) o.mult = Math.round(o.mult * m * 1000) / 1000;
  if (o.heal) o.heal = Math.min(0.4, Math.round(o.heal * ms * 1000) / 1000);
  if (o.shield) o.shield = Math.min(0.4, Math.round(o.shield * ms * 1000) / 1000);
  if (o.drain) o.drain = Math.min(0.5, Math.round(o.drain * ms * 1000) / 1000);
  if (o.burn) o.burn = { pct: Math.round(o.burn.pct * m * 1000) / 1000, turns: o.burn.turns };
  if (o.armor) o.armor = { pct: Math.min(0.6, Math.round(o.armor.pct * m * 1000) / 1000), turns: o.armor.turns };
  if (o.atkUp) o.atkUp = { pct: Math.round(o.atkUp.pct * m * 1000) / 1000, turns: o.atkUp.turns };
  if (o.stun) o.stun = Math.min(0.6, Math.round(o.stun * ms * 1000) / 1000);
  var ch = C.skillChance + C.skillChancePerLv * (lv - 1);
  o.chance = Math.min(1, ch);
  o.overDmg = Math.max(0, ch - 1);                 // 超出 100% 转为技能增伤
  o.mpCost = Math.round(s.mp * Math.pow(1 + C.skillMpGrow, lv - 1));
  return o;
};
/* 技能效果简述(按等级) */
XX.data.shentongBrief = function (id, lv) {
  var s = XX.data.shentongAt(id, lv), U = XX.util, parts = [];
  parts.push('触发 ' + U.pct(s.chance, 0) + (s.overDmg ? '(增伤 +' + U.pct(s.overDmg, 0) + ')' : ''));
  if (s.mult) parts.push((s.hits ? s.hits + '×' : '') + U.pct(s.mult, 0) + '伤害');
  if (s.drain) parts.push('吸血' + U.pct(s.drain, 0));
  if (s.heal) parts.push('回复' + U.pct(s.heal, 0));
  if (s.shield) parts.push('护盾' + U.pct(s.shield, 0));
  if (s.burn) parts.push('灼烧' + U.pct(s.burn.pct, 0) + '×' + s.burn.turns);
  if (s.stun) parts.push('眩晕' + U.pct(s.stun, 0));
  if (s.armor) parts.push('破甲' + U.pct(s.armor.pct, 0));
  if (s.atkUp) parts.push('攻击+' + U.pct(s.atkUp.pct, 0) + '×' + s.atkUp.turns + '回合');
  parts.push('灵力 ' + s.mpCost);
  return parts.join(' · ');
};

/* 自动生成玉简物品 */
(function () {
  var D = XX.data;
  Object.keys(D.shentong).forEach(function (id) { if (D.shentong[id].reqRealm == null) D.shentong[id].reqRealm = D.shentong[id].innate ? 2 : 0; });
  Object.keys(D.gongfa).forEach(function (id) { if (D.gongfa[id].reqRealm == null) D.gongfa[id].reqRealm = 0; });
  Object.keys(D.gongfa).forEach(function (id) {
    var g = D.gongfa[id];
    D.items['gf_' + id] = { name: '《' + g.name + '》', type: 'special', scroll: 'gongfa', ref: id, icon: 'item/manual', hue: g.hue, q: g.q, price: 150 * (g.q + 1) * (g.q + 1), badge: '功',
      desc: '功法玉简(需' + D.realms[g.reqRealm].name + ')。获得即自动习得;已掌握则转化为 5 个功法碎片。' + g.desc };
  });
  Object.keys(D.shentong).forEach(function (id) {
    var s = D.shentong[id];
    D.items['st_' + id] = { name: '技能·' + s.name, type: 'special', scroll: 'shentong', ref: id, icon: s.icon, hue: s.hue, q: s.q, price: 150 * (s.q + 1) * (s.q + 1), badge: '技',
      desc: '技能玉简(需' + D.realms[s.reqRealm].name + ')。获得即自动习得;已掌握则转化为 5 个技能碎片。' + s.desc };
  });
})();

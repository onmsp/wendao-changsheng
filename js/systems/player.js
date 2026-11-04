/* 人物:属性计算、修炼、突破 */
XX.sys.player = (function () {
  var P = {}, D = XX.data, U = XX.util;
  function st() { return XX.store.state; }

  P.tpl = function () { return D.characters.filter(function (c) { return c.id === st().charId; })[0] || D.characters[0]; };
  P.root = function () { return D.roots.filter(function (r) { return r.id === st().root; })[0]; };
  P.realm = function (i) { return D.realms[i == null ? st().realm : i]; };
  P.nextRealm = function () { return D.realms[st().realm + 1] || null; };
  P.arrayLv = function (id) { return (st().cave.arrays || {})[id] || 0; };
  P.arrayVal = function (id) {
    var def = D.arrays.filter(function (a) { return a.id === id; })[0];
    return def ? def.per * P.arrayLv(id) : 0;
  };
  P.img = function (kind, id) { return U.img('char/' + (id || st().charId) + '_' + kind); };

  /* 修炼速度倍率 */
  P.rateMul = function () {
    var r = P.realm();
    return 1 + r.major * D.realmCurve.majorRateBonus + P.arrayVal('juling') + (st().perm.rateBonus || 0);
  };
  P.rate = function () { return Math.round(P.root().rate * P.rateMul() * 10) / 10; };

  /* 装备属性汇总 */
  P.equipStats = function () {
    var sum = {};
    Object.keys(st().equip).forEach(function (slot) {
      var e = st().equip[slot];
      if (!e) return;
      Object.keys(e.stats).forEach(function (k) { sum[k] = (sum[k] || 0) + e.stats[k]; });
    });
    return sum;
  };

  /* 计算完整属性 */
  P.stats = function () {
    var s = st(), r = P.realm(), b = P.tpl().bonus, eq = P.equipStats();
    var g = function (o, k) { return o[k] || 0; };
    var hp = (r.stats.hp + g(eq, 'hp')) * (1 + g(b, 'hpPct') + (s.perm.hpPct || 0) + P.arrayVal('jinguang'));
    var mp = (r.stats.mp + g(eq, 'mp')) * (1 + g(b, 'mpPct'));
    var atk = (r.stats.atk + g(eq, 'atk')) * (1 + g(b, 'atkPct') + P.arrayVal('shafa'));
    var def = (r.stats.def + g(eq, 'def')) * (1 + g(b, 'defPct') + P.arrayVal('jinguang'));
    var spd = (r.stats.spd + g(eq, 'spd')) * (1 + g(b, 'spdPct'));
    var sense = (r.stats.sense + g(eq, 'sense')) * (1 + g(b, 'sensePct'));
    return {
      hp: Math.round(hp), mp: Math.round(mp), atk: Math.round(atk), def: Math.round(def),
      spd: Math.round(spd), sense: Math.round(sense),
      crit: U.clamp(0.05 + g(b, 'crit') + g(eq, 'crit') + sense / 10 * 0.005, 0, 0.75),
      critDmg: 1.5 + g(b, 'critDmg') + g(eq, 'critDmg'),
      dodge: U.clamp(0.02 + g(b, 'dodge') + g(eq, 'dodge') + spd * 0.0004, 0, 0.4),
      comprehension: 5 + g(b, 'comprehension') + (s.perm.comprehension || 0),
      luck: 5 + g(b, 'luck'),
      rate: P.rate(),
      lifespan: r.lifespan
    };
  };

  /* 战力 */
  P.power = function () {
    var s = P.stats();
    return Math.round(s.hp * 0.2 + s.mp * 0.1 + s.atk * 2 + s.def * 1.5 + s.spd + s.sense + s.crit * 500 + s.dodge * 500);
  };

  P.expNeed = function () { return P.realm().expNeed; };

  /* 增加修为;到达瓶颈后停留 */
  P.addExp = function (v) {
    var s = st();
    s.exp += v;
    P.autoBreak();
    var need = P.expNeed();
    if (!P.nextRealm()) s.exp = Math.min(s.exp, need);
    else if (s.exp > need && P.nextRealm().isMajorGate) s.exp = need;
  };

  /* 小境界自动突破 */
  P.autoBreak = function () {
    var s = st(), changed = false;
    while (s.settings.autoBreak && P.nextRealm() && !P.nextRealm().isMajorGate && s.exp >= P.expNeed()) {
      s.exp -= P.expNeed();
      s.realm++;
      changed = true;
      XX.store.addLog('修为精进,突破至「' + P.realm().name + '」。');
    }
    if (changed) XX.bus.emit('realm');
    return changed;
  };

  /* 定时修炼结算:每 3 秒一次 */
  P.tick = function (now) {
    var s = st(), ms = XX.config.tickMs;
    var n = Math.floor((now - s.lastTick) / ms);
    if (n <= 0) return 0;
    s.lastTick += n * ms;
    var gain = n * P.rate();
    P.addExp(gain);
    return gain;
  };

  /* 离线收益(返回秒数与修为) */
  P.offline = function () {
    var s = st(), now = Date.now();
    var cap = XX.config.offlineCapHours * 3600 * 1000;
    var elapsed = now - s.lastTick;
    if (elapsed > cap) { s.lastTick = now - cap; elapsed = cap; }
    var before = { realm: s.realm, exp: s.exp };
    var gain = P.tick(now);
    return { sec: elapsed / 1000, gain: gain, before: before };
  };

  P.breakInfo = function () {
    var s = st(), next = P.nextRealm();
    if (!next) return { max: true };
    var info = { next: next, ready: s.exp >= P.expNeed(), major: next.isMajorGate };
    if (info.major) {
      info.pill = next.pill;
      info.havePill = XX.sys.inv.count(next.pill) > 0;
      info.chance = U.clamp(next.baseChance + P.stats().comprehension * 0.01 + (s.buffs.breakBonus || 0), 0.05, 0.95);
    } else info.chance = 1;
    return info;
  };

  /* 手动突破 */
  P.breakthrough = function () {
    var s = st(), info = P.breakInfo();
    if (info.max) return { ok: false, msg: '已至巅峰,前路唯有飞升。' };
    if (!info.ready) return { ok: false, msg: '修为不足,尚需继续积累。' };
    if (!info.major) {
      s.exp -= P.expNeed(); s.realm++;
      XX.store.addLog('突破至「' + P.realm().name + '」。');
      XX.bus.emit('realm');
      return { ok: true, msg: '突破成功!晋升 ' + P.realm().name };
    }
    if (!info.havePill) return { ok: false, msg: '缺少【' + D.items[info.pill].name + '】,无法冲击' + info.next.majorName + '。' };
    XX.sys.inv.remove(info.pill, 1);
    s.buffs.breakBonus = 0;
    if (Math.random() < info.chance) {
      s.exp = 0; s.realm++;
      var jade = 20 * P.realm().major;
      s.jade += jade;
      XX.store.addLog('天地异象!成功突破至「' + P.realm().name + '」,获赠仙玉 ' + jade + '。');
      XX.bus.emit('realm');
      return { ok: true, big: true, msg: '大境界突破成功!晋升 ' + P.realm().name + ',获得仙玉 ×' + jade };
    }
    s.exp = Math.floor(s.exp * 0.7);
    XX.store.addLog('冲击' + info.next.majorName + '失败,经脉受损,修为倒退三成。');
    return { ok: false, fail: true, msg: '突破失败……修为倒退三成,丹药已耗。' };
  };

  return P;
})();

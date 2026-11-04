/* 存档 & 事件总线 */
XX.bus = (function () {
  var map = {};
  return {
    on: function (ev, fn) { (map[ev] = map[ev] || []).push(fn); },
    emit: function (ev, data) { (map[ev] || []).forEach(function (fn) { fn(data); }); }
  };
})();

XX.store = (function () {
  var C = XX.config;
  var S = { state: null };

  S.hasSave = function () {
    try { return !!localStorage.getItem(C.saveKey); } catch (e) { return false; }
  };

  S.innateSkill = function (charId) {
    var D = XX.data;
    return Object.keys(D.shentong).filter(function (k) { return D.shentong[k].innate === charId; })[0] || null;
  };

  S.newGame = function (opts) {
    var now = Date.now(), sig = S.innateSkill(opts.charId);
    var st = {
      v: C.version,
      created: now,
      lastTick: now,
      lastSave: now,
      name: opts.name,
      gender: opts.gender,
      charId: opts.charId,
      root: C.start.root,
      realm: 0,
      exp: 0,
      stone: C.start.stone,
      jade: C.start.jade,
      bag: { cap: C.bagCapacity, slots: [] },
      equip: [null, null, null, null],
      skills: { gongfa: 'yinqi', shentong: [sig, null, null, null], learnedGongfa: ['yinqi'], learnedShentong: sig ? [sig] : [] },
      blueprints: {},
      perm: { hpPct: 0, comprehension: 0, rateBonus: 0 },
      buffs: { breakBonus: 0 },
      cave: {
        arrays: {},
        alchemy: null,
        forge: null,
        field: { unlocked: XX.data.field.initPlots, plots: [] },
        mine: { lv: 1, last: now }
      },
      outing: { area: 'qinglan', wins: 0, losses: 0, cdUntil: 0 },
      secret: { times: C.secretMaxTimes, last: now, clears: {} },
      shop: { period: -1, bought: {} },
      battleSpeed: 1,
      log: []
    };
    S.state = st;
    C.start.items.forEach(function (p) { XX.sys.inv.add(p[0], p[1], true, p[2]); });
    S.addLog('道友「' + opts.name + '」踏入仙途,以五色灵根之资,誓求长生大道。');
    S.save();
    return st;
  };

  S.load = function () {
    try {
      var raw = localStorage.getItem(C.saveKey);
      if (!raw) return null;
      S.state = JSON.parse(raw);
      S.migrate(S.state);
      return S.state;
    } catch (e) {
      console.error('读取存档失败', e);
      return null;
    }
  };

  /* 存档结构升级兼容:为旧存档补全字段 */
  S.migrate = function (st) {
    var D = XX.data, now = Date.now();
    st.perm = st.perm || { hpPct: 0, comprehension: 0, rateBonus: 0 };
    st.buffs = st.buffs || { breakBonus: 0 };
    st.shop = st.shop || { period: -1, bought: {} };
    st.log = st.log || [];
    st.blueprints = st.blueprints || {};
    st.outing = st.outing || { area: 'qinglan', wins: 0, losses: 0 };
    st.outing.cdUntil = st.outing.cdUntil || 0;
    if (!st.skills) {
      var sig = S.innateSkill(st.charId);
      st.skills = { gongfa: 'yinqi', shentong: [sig, null, null, null], learnedGongfa: ['yinqi'], learnedShentong: sig ? [sig] : [] };
    }
    if (!st.secret || st.secret.times == null) {
      st.secret = { times: C.secretMaxTimes, last: now, clears: (st.secret && st.secret.clears) || {} };
    }
    /* 0.1.0 存档:武器/法衣/饰品 → 4 件法宝 */
    if (!Array.isArray(st.equip)) {
      var old = st.equip || {};
      st.equip = [old.weapon || null, old.armor || null, old.accessory || null, null];
    }
    while (st.equip.length < C.treasureSlots) st.equip.push(null);
    /* 0.1.2:旧物品 id 映射、品阶收敛到 5 阶 */
    var map = { eq_qingfeng: 'eq_changjian', eq_xuantie: 'eq_changjian', eq_chiyan: 'eq_changjian', eq_yunwen: 'eq_daopao', eq_hantie: 'eq_daopao',
      eq_xuanwu: 'eq_daopao', eq_qingyu: 'eq_yupei', eq_ziling: 'eq_yupei', eq_xingchen: 'eq_yupei', sp_jadeslip: 'gf_taixuan' };
    function fix(sl) {
      if (!sl) return null;
      if (map[sl.id]) sl.id = map[sl.id];
      if (!D.items[sl.id]) return null;
      if (sl.q != null) sl.q = Math.min(4, sl.q);
      if (D.items[sl.id].type === 'equip') { sl.affixes = sl.affixes || []; sl.lv = sl.lv || 0; sl.name = sl.name || D.items[sl.id].name; }
      return sl;
    }
    st.bag.slots = st.bag.slots.map(fix).filter(function (x) { return x; });
    st.equip = st.equip.map(fix);
    st.battleSpeed = st.battleSpeed || 1;
    st.v = C.version;
  };

  S.save = function () {
    if (!S.state) return;
    S.state.lastSave = Date.now();
    try { localStorage.setItem(C.saveKey, JSON.stringify(S.state)); } catch (e) { console.error(e); }
  };

  S.wipe = function () {
    try { localStorage.removeItem(C.saveKey); } catch (e) { /* ignore */ }
    S.state = null;
  };

  S.addLog = function (text) {
    if (!S.state) return;
    var d = new Date();
    var t = (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
    S.state.log.unshift({ t: t, text: text });
    if (S.state.log.length > 60) S.state.log.length = 60;
    XX.bus.emit('log');
  };

  return S;
})();

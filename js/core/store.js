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

  S.newGame = function (opts) {
    var now = Date.now();
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
      perm: { hpPct: 0, comprehension: 0, rateBonus: 0 },
      buffs: { breakBonus: 0 },
      cave: {
        arrays: {},
        alchemy: null,
        forge: null,
        field: { unlocked: XX.data.field.initPlots, plots: [] },
        mine: { lv: 1, last: now }
      },
      outing: { area: 'qinglan', wins: 0, losses: 0 },
      secret: { day: XX.util.today(), used: 0, clears: {} },
      shop: { period: -1, bought: {} },
      log: []
    };
    S.state = st;
    C.start.items.forEach(function (p) { XX.sys.inv.add(p[0], p[1], true); });
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
    st.perm = st.perm || { hpPct: 0, comprehension: 0, rateBonus: 0 };
    st.buffs = st.buffs || { breakBonus: 0 };
    if (!Array.isArray(st.equip)) {   // 0.1.0 存档:武器/法衣/饰品 → 4 件法宝
      var old = st.equip || {};
      st.equip = [old.weapon || null, old.armor || null, old.accessory || null, null];
    }
    while (st.equip.length < XX.config.treasureSlots) st.equip.push(null);
    st.v = XX.config.version;
    st.secret = st.secret || { day: XX.util.today(), used: 0, clears: {} };
    st.shop = st.shop || { period: -1, bought: {} };
    st.log = st.log || [];
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

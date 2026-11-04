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

  /* 开局默认掌握的图纸(1 级) */
  S.baseBlueprints = function () {
    var D = XX.data, bp = {};
    D.alchemyRecipes.concat(D.forgeRecipes).concat(D.arrays).forEach(function (r) { if (r.base) bp[r.id] = { lv: 1, exp: 0 }; });
    return bp;
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
      rootProg: 0,
      realm: 0,
      exp: 0,
      stone: C.start.stone,
      jade: C.start.jade,
      bag: { cap: C.bagCapacity, slots: [] },
      equip: [null, null, null, null],
      /* 0.1.5:开局没有任何功法与技能,需通过历练/秘境/商城获取玉简 */
      skills: { gongfa: null, shentong: [null, null, null, null], learnedGongfa: [], learnedShentong: [],
        gfLv: {}, stLv: {}, frags: { gongfa: {}, shentong: {} } },
      bp: S.baseBlueprints(),
      timed: {},
      perm: { hpPct: 0, comprehension: 0, rateBonus: 0 },
      buffs: {},
      attrUsed: {},
      cave: {
        lv: { alchemy: 1, forge: 1, field: 1, mine: 1 },
        arrays: {},
        activeArrays: [],
        alchemy: null,
        forge: null,
        field: { plots: [], queue: [null, null, null] },
        mine: { last: now }
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
    st.recipes = st.recipes || {};
    st.timed = st.timed || {};
    var bmap = { pill_zhuji: 'pill_brk0', pill_ningjin: 'pill_brk1', pill_huaying: 'pill_brk2', pill_ningshen: 'pill_brk3', pill_lianxu: 'pill_brk4',
      pill_heti: 'pill_brk5', pill_dacheng: 'pill_brk6', pill_dujie: 'pill_brk7', pill_peiyuan: 'pill_attr_hp' };
    var rmap = { a_zhuji: 'a_brk0', a_ningjin: 'a_brk1', a_huaying: 'a_brk2', a_ningshen: 'a_brk3', a_peiyuan: 'a_attr_hp' };
    st.bag.slots = st.bag.slots.map(function (sl) {
      if (sl && bmap[sl.id]) { var ns = { id: bmap[sl.id], n: sl.n || 1 }; if (D.items[ns.id].qByGrade) ns.g = sl.g || 2; return ns; }
      return sl;
    });
    /* 0.1.3:洞府设施等级、阵法上限 10、灵田地块由等级决定 */
    var cv = st.cave;
    if (!cv.lv) {
      cv.lv = { alchemy: 1, forge: 1, field: Math.max(1, Math.min(C.caveMaxLv, ((cv.field && cv.field.unlocked) || 3) - 2)), mine: Math.max(1, Math.min(C.caveMaxLv, (cv.mine && cv.mine.lv) || 1)) };
    }
    Object.keys(cv.arrays || {}).forEach(function (k) { cv.arrays[k] = Math.min(C.caveMaxLv, cv.arrays[k]); });
    if (cv.alchemy && cv.alchemy.rid && !D.alchemyRecipes.some(function (r) { return r.id === cv.alchemy.rid; })) cv.alchemy = null;
    st.outing = st.outing || { area: 'qinglan', wins: 0, losses: 0 };
    st.outing.cdUntil = st.outing.cdUntil || 0;
    if (!st.skills) {
      var sig = S.innateSkill(st.charId);
      st.skills = { gongfa: 'yinqi', shentong: [sig, null, null, null], learnedGongfa: ['yinqi'], learnedShentong: sig ? [sig] : [] };
    }
    st.skills.stLv = st.skills.stLv || {};

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
      eq_xuanwu: 'eq_daopao', eq_qingyu: 'eq_yupei', eq_ziling: 'eq_yupei', eq_xingchen: 'eq_yupei', sp_jadeslip: 'gf_taixuan', pill_xisui: 'sp_xiling' };
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
    /* 0.1.4:碎片、等级、图纸、阵法、法宝强化、灵根转化度、自动灵田 */
    var sk = st.skills;
    sk.gfLv = sk.gfLv || {}; sk.stLv = sk.stLv || {};
    sk.frags = sk.frags || { gongfa: {}, shentong: {} };
    sk.learnedGongfa.forEach(function (id) { sk.gfLv[id] = sk.gfLv[id] || 1; });
    sk.learnedShentong.forEach(function (id) { sk.stLv[id] = Math.min(C.maxLv, sk.stLv[id] || 1); });
    sk.learnedGongfa = sk.learnedGongfa.filter(function (id) { return D.gongfa[id]; });
    sk.learnedShentong = sk.learnedShentong.filter(function (id) { return D.shentong[id]; });
    st.rootProg = st.rootProg || 0;
    if (!st.bp) {
      st.bp = S.baseBlueprints();
      Object.keys(st.recipes || {}).concat(Object.keys(st.blueprints || {})).forEach(function (rid) { if (!st.bp[rid]) st.bp[rid] = { lv: 1, exp: 0 }; });
      Object.keys(st.cave.arrays || {}).forEach(function (aid) { if (st.cave.arrays[aid] > 0 && !st.bp[aid]) st.bp[aid] = { lv: 1, exp: 0 }; });
    }
    Object.keys(st.cave.arrays || {}).forEach(function (aid) { if (!D.arrays.some(function (a) { return a.id === aid; })) delete st.cave.arrays[aid]; });
    st.cave.field.queue = st.cave.field.queue || [null, null, null];
    function fixEq(e) {
      if (!e || D.items[e.id].type !== 'equip') return e;
      if (!e.bs) { e.pw = e.pw != null ? e.pw : (e.lv || 0); e.lv = 1; e.bs = e.stats || {}; delete e.stats; }
      return e;
    }
    st.equip = st.equip.map(fixEq);
    var pend = [];
    st.bag.slots = st.bag.slots.map(function (sl) {
      if (!sl) return null;
      if (sl.id === 'pill_xisui') sl = { id: 'sp_xiling', n: sl.n || 1 };
      var it = D.items[sl.id];
      if (!it) return null;
      if (it.scroll || it.bpRef) { pend.push([sl.id, sl.n || 1]); return null; }
      if (it.type === 'pill' && !sl.n) sl = { id: sl.id, n: 1 };
      return fixEq(sl);
    }).filter(function (x) { return x; });
    pend.forEach(function (p) { if (D.items[p[0]].scroll) XX.sys.inv.gainScroll(p[0], p[1]); else XX.sys.inv.gainBlueprint(p[0], p[1]); });
    if (st.skills.gongfa && !D.gongfa[st.skills.gongfa]) st.skills.gongfa = null;
    /* 0.1.5:突破丹按大境界统一、属性丹、阵法 5 槽、特殊法宝最多 2 件 */
    st.attrUsed = st.attrUsed || {};
    var slots2 = [];
    st.bag.slots.forEach(function (sl) {
      if (!sl || !D.items[sl.id]) return;
      var same = slots2.filter(function (x) { return x.id === sl.id && x.g === sl.g && x.n != null && D.items[sl.id].type !== 'equip'; })[0];
      if (same && sl.n != null) same.n += sl.n; else slots2.push(sl);
    });
    st.bag.slots = slots2;
    Object.keys(rmap).forEach(function (o) { if (st.bp && st.bp[o]) { var nb = st.bp[rmap[o]]; if (!nb || nb.lv < st.bp[o].lv) st.bp[rmap[o]] = st.bp[o]; delete st.bp[o]; } });
    Object.keys(st.bp).forEach(function (rid) {
      var ok = D.alchemyRecipes.concat(D.forgeRecipes).concat(D.arrays).some(function (r) { return r.id === rid; });
      if (!ok) delete st.bp[rid];
    });
    var base = S.baseBlueprints(); Object.keys(base).forEach(function (k) { if (!st.bp[k]) st.bp[k] = base[k]; });
    delete st.buffs.breakBonus;
    var cv2 = st.cave;
    cv2.arrays = cv2.arrays || {};
    if (!cv2.activeArrays) {
      cv2.activeArrays = Object.keys(cv2.arrays).filter(function (k) { return cv2.arrays[k] > 0; })
        .sort(function (a, b) { return cv2.arrays[b] - cv2.arrays[a]; }).slice(0, C.arrayActiveMax);
    }
    cv2.activeArrays = cv2.activeArrays.filter(function (k) { return cv2.arrays[k] > 0; }).slice(0, C.arrayActiveMax);
    var spc = 0;
    st.equip = st.equip.map(function (e) {
      if (e && D.items[e.id] && D.items[e.id].forged) { spc++; if (spc > C.specialTreasureMax) { st.bag.slots.push(e); return null; } }
      return e;
    });
    st.battleSpeed = st.battleSpeed || 1;
    if (st.v !== C.version) st.shop = { period: -1, bought: {} };   // 版本更新后商城货架重新生成
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

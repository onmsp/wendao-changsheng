/* 人物:属性计算、修炼、突破、功法技能栏位 */
XX.sys.player = (function () {
  var P = {}, D = XX.data, U = XX.util, C = XX.config;
  function st() { return XX.store.state; }

  P.tpl = function () { return D.characters.filter(function (c) { return c.id === st().charId; })[0] || D.characters[0]; };
  P.root = function () { return D.roots.filter(function (r) { return r.id === st().root; })[0]; };
  P.realm = function (i) { return D.realms[i == null ? st().realm : i]; };
  P.nextRealm = function () { return D.realms[st().realm + 1] || null; };
  /* 阵法:等级 0 = 未布置 */
  P.arrayLv = function (id) { return (st().cave.arrays || {})[id] || 0; };
  /* 生效中的阵法(最多 config.arrayActiveMax 个) */
  P.activeArrays = function () {
    var cv = st().cave; cv.activeArrays = cv.activeArrays || [];
    return cv.activeArrays.filter(function (id) { return P.arrayLv(id) > 0; }).slice(0, C.arrayActiveMax);
  };
  P.arrayEffects = function () {
    var sum = {}, act = P.activeArrays();
    D.arrays.forEach(function (a) {
      var lv = P.arrayLv(a.id);
      if (!lv || act.indexOf(a.id) < 0) return;
      var m = D.lvMul(lv) * XX.sys.inv.bpMul(a.id);
      Object.keys(a.effects).forEach(function (k) { sum[k] = (sum[k] || 0) + a.effects[k] * m; });
    });
    return sum;
  };
  P.arrayEff = function (key) { return P.arrayEffects()[key] || 0; };
  /* 角色图片:kind = stand/med/avatar/bidle/bwind/batk/bcast/bhurt;hd = 高清原图 */
  P.img = function (kind, id, hd) { return U.img('char/' + (hd ? 'hd/' : '') + (id || st().charId) + '_' + kind); };

  /* ---------- 功法技能 ---------- */
  P.slots = function () {
    var major = P.realm().major, rule = C.techniqueSlots[C.techniqueSlots.length - 1];
    for (var i = 0; i < C.techniqueSlots.length; i++) if (major <= C.techniqueSlots[i].maxMajor) { rule = C.techniqueSlots[i]; break; }
    return rule;
  };
  P.gongfa = function () { var id = st().skills.gongfa; return id ? D.gongfa[id] : null; };
  P.gfLv = function (id) { return ((st().skills.gfLv || {})[id]) || 1; };
  P.activeShentong = function () {
    var n = P.slots().shentong;
    return st().skills.shentong.slice(0, n).filter(function (x) { return x && D.shentong[x]; });
  };
  /* 灵根转化度(洗灵液) */
  P.rootGrade = function () { return P.root().grade; };

  /* 加成汇总:模板天赋 + 功法 + 法宝特殊属性(stat 类) */
  P.bonus = function () {
    var sum = {}, add = function (o) { Object.keys(o || {}).forEach(function (k) { sum[k] = (sum[k] || 0) + o[k]; }); };
    add(P.tpl().bonus);
    if (P.gongfa()) add(D.gongfaEffects(st().skills.gongfa, P.gfLv(st().skills.gongfa)));
    var ae = P.arrayEffects();
    ['rate', 'atkPct', 'defPct', 'hpPct', 'mpPct', 'dodge', 'crit', 'critDmg'].forEach(function (k) { if (ae[k]) { var o = {}; o[k] = ae[k]; add(o); } });
    st().equip.forEach(function (e) {
      if (!e || !e.affixes) return;
      e.affixes.forEach(function (a) { if (D.affixes[a.id] && D.affixes[a.id].kind === 'stat') { var o = {}; o[a.id] = a.v; add(o); } });
    });
    return sum;
  };
  /* 战斗类特殊属性汇总 */
  P.battleAffix = function () {
    var sum = {};
    st().equip.forEach(function (e) {
      if (!e || !e.affixes) return;
      e.affixes.forEach(function (a) { if (D.affixes[a.id] && D.affixes[a.id].kind === 'battle') sum[a.id] = (sum[a.id] || 0) + a.v; });
    });
    return sum;
  };

  /* 突破累计带来的修炼速度加成 */
  P.breakRate = function () {
    var r = P.realm(), majors = r.major, minors = r.index - majors;
    return minors * C.breakRateBonus.minor + majors * C.breakRateBonus.major;
  };
  P.rateMul = function () {
    var b = P.bonus();
    return 1 + P.breakRate() + (st().perm.rateBonus || 0) + (b.rate || 0) + P.timed('rate');
  };
  P.rate = function () { return U.trunc2(P.root().rate * P.rateMul()); };

  P.equipStats = function () {
    var sum = {};
    st().equip.forEach(function (e) {
      if (!e) return;
      var es = XX.sys.inv.eqStats(e);
      Object.keys(es).forEach(function (k) { sum[k] = (sum[k] || 0) + es[k]; });
    });
    return sum;
  };

  /* 计算完整属性 */
  P.stats = function () {
    var s = st(), r = P.realm(), b = P.bonus(), eq = P.equipStats();
    var g = function (o, k) { return o[k] || 0; };
    var hp = (r.stats.hp + g(eq, 'hp')) * (1 + g(b, 'hpPct') + (s.perm.hpPct || 0));
    var mp = (r.stats.mp + g(eq, 'mp')) * (1 + g(b, 'mpPct') + (s.perm.mpPct || 0));
    var atk = (r.stats.atk + g(eq, 'atk')) * (1 + g(b, 'atkPct') + (s.perm.atkPct || 0) + P.timed('atk'));
    var def = (r.stats.def + g(eq, 'def')) * (1 + g(b, 'defPct') + (s.perm.defPct || 0) + P.timed('def'));
    var spd = (r.stats.spd + g(eq, 'spd')) * (1 + g(b, 'spdPct'));
    var sense = (r.stats.sense + g(eq, 'sense')) * (1 + g(b, 'sensePct'));
    return {
      hp: Math.round(hp), mp: Math.round(mp), atk: Math.round(atk), def: Math.round(def),
      spd: Math.round(spd), sense: Math.round(sense),
      crit: U.clamp(0.05 + g(b, 'crit') + g(eq, 'crit') + sense / 10 * 0.005, 0, 0.75),
      critDmg: 1.5 + g(b, 'critDmg') + g(eq, 'critDmg'),
      dodge: U.clamp(0.02 + g(b, 'dodge') + g(eq, 'dodge') + spd * 0.0004, 0, 0.4),
      comprehension: Math.round(5 + g(b, 'comprehension') + (s.perm.comprehension || 0)),
      luck: Math.round(5 + g(b, 'luck') + (s.perm.luck || 0)),
      rate: P.rate(),
      lifespan: r.lifespan
    };
  };

  P.power = function () {
    var s = P.stats();
    return Math.round(s.hp * 0.2 + s.mp * 0.1 + s.atk * 2 + s.def * 1.5 + s.spd + s.sense + s.crit * 500 + s.dodge * 500);
  };

  /* 限时丹药增益:返回当前生效数值 */
  P.timed = function (key) {
    var t = (st().timed || {})[key];
    return t && t.until > Date.now() ? t.v : 0;
  };
  P.timedList = function () {
    var now = Date.now(), T = st().timed || {}, NAMES = { rate: '修炼速度', atk: '攻击', def: '防御' };
    return Object.keys(T).filter(function (k) { return T[k].until > now; }).map(function (k) { return { key: k, name: NAMES[k], v: T[k].v, left: (T[k].until - now) / 1000 }; });
  };
  /* 背包扩展上限 */
  P.bagMax = function () {
    var m = C.bagMax;
    return m.base + Math.max(0, P.realm().major - m.perMajorAfter) * m.add;
  };
  /* 技能等级 */
  P.stLv = function (id) { return ((st().skills.stLv || {})[id]) || 1; };

  P.expNeed = function () { return P.realm().expNeed; };
  P.canBreak = function () { return !!P.nextRealm() && st().exp >= P.expNeed(); };
  P.isFull = P.canBreak;

  /* 修为可无限累积,保留两位小数 */
  P.addExp = function (v) {
    var s = st(), before = s.exp;
    s.exp = U.trunc2(s.exp + v);
    return U.trunc2(s.exp - before);
  };

  P.tick = function (now) {
    var s = st(), ms = C.tickMs;
    var n = Math.floor((now - s.lastTick) / ms);
    if (n <= 0) return 0;
    s.lastTick += n * ms;
    return P.addExp(n * P.rate());
  };

  P.offline = function () {
    var s = st(), now = Date.now();
    var cap = C.offlineCapHours * 3600 * 1000;
    var elapsed = now - s.lastTick;
    if (elapsed > cap) { s.lastTick = now - cap; elapsed = cap; }
    var gain = P.tick(now);
    return { sec: elapsed / 1000, gain: gain };
  };

  /* 气运对突破的加成:100 点气运在炼气期为 +10%(上限),之后每个大境界效果减半 */
  P.luckBreakBonus = function (luck, major) {
    if (luck == null) luck = P.stats().luck;
    if (major == null) major = P.realm().major;
    return C.luckBreakCap * Math.min(1, Math.max(0, luck) / C.luckFull) * Math.pow(0.5, major);
  };
  /* 当前大境界可用的突破丹(按品级从高到低) */
  P.breakPills = function () {
    var r = P.realm(), list = [];
    st().bag.slots.forEach(function (sl) {
      if (sl && sl.id === r.pill) list.push({ id: sl.id, g: sl.g || 1, n: sl.n || 1, q: D.qOf(sl.id, sl.g), bonus: C.breakPillBonus[D.qOf(sl.id, sl.g)] });
    });
    var m = {};
    list.forEach(function (x) { if (m[x.g]) m[x.g].n += x.n; else m[x.g] = x; });
    return Object.keys(m).map(function (k) { return m[k]; }).sort(function (a, b) { return b.g - a.g; });
  };

  /* pillG:选择服用的突破丹品级(0/undefined = 不服用;'best' = 最好的一颗) */
  P.breakInfo = function (pillG) {
    var s = st(), cur = P.realm(), next = P.nextRealm();
    if (!next) return { max: true };
    var info = { cur: cur, next: next, ready: s.exp >= P.expNeed(), major: next.isMajorGate };
    info.base = cur.breakChance;
    info.luck = P.stats().luck;
    info.luckBonus = P.luckBreakBonus(info.luck, cur.major);
    info.rateGain = info.major ? C.breakRateBonus.major : C.breakRateBonus.minor;
    info.pills = P.breakPills();
    info.pillId = cur.pill;
    if (pillG === 'best') pillG = info.pills.length ? info.pills[0].g : 0;
    var pick = info.pills.filter(function (x) { return x.g === pillG; })[0] || null;
    info.pillG = pick ? pick.g : 0;
    info.pillBonus = pick ? pick.bonus : 0;
    info.chance = U.clamp(info.base + info.pillBonus + info.luckBonus, C.breakMin, C.breakMax);
    info.loss = U.trunc2(P.expNeed() * C.breakFailLoss);
    return info;
  };

  /* 手动突破:消耗本境界所需修为,多余修为保留;失败扣除所需修为的 20% */
  P.breakthrough = function (pillG) {
    var s = st(), info = P.breakInfo(pillG), need = P.expNeed();
    if (info.max) return { ok: false, msg: '已至巅峰,前路唯有飞升。' };
    if (!info.ready) return { ok: false, msg: '修为不足,尚需继续积累。' };
    if (info.pillG) XX.sys.inv.removeG(info.pillId, 1, info.pillG);
    if (Math.random() < info.chance) {
      var slotsBefore = P.slots().shentong;
      s.exp = U.trunc2(s.exp - need); s.realm++;
      var msg = '突破成功!晋升 ' + P.realm().name + ',修炼速度永久 +' + U.pct(info.rateGain, 0);
      if (info.major) {
        var jade = 20 * P.realm().major;
        s.jade += jade;
        msg += ',获得仙玉 ×' + jade;
        if (P.slots().shentong > slotsBefore) msg += ',技能栏位增加至 ' + P.slots().shentong + ' 个!';
        msg += '。属性丹服用上限提升至每种 ' + C.attrPillCap(P.realm().major) + ' 颗';
      }
      XX.store.addLog((info.major ? '天地异象!' : '') + '突破至「' + P.realm().name + '」,修炼速度 +' + U.pct(info.rateGain, 0) + '。');
      XX.bus.emit('realm');
      return { ok: true, big: info.major, msg: msg };
    }
    s.exp = Math.max(0, U.trunc2(s.exp - info.loss));
    XX.store.addLog('冲击「' + info.next.name + '」失败,损失修为 ' + U.exp(info.loss) + '。');
    return { ok: false, fail: true, msg: '突破失败……损失修为 ' + U.exp(info.loss) + (info.pillG ? ',丹药已耗' : '') };
  };

  /* 属性丹:每种在当前大境界的累计上限 */
  P.attrCap = function () { return C.attrPillCap(P.realm().major); };
  P.attrUsed = function (id) { return (st().attrUsed || {})[id] || 0; };

  return P;
})();

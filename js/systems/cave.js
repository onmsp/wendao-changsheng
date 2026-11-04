/* 洞府:设施升级 / 阵法 / 炼丹 / 炼器 / 灵田 / 灵矿 */
XX.sys.cave = (function () {
  var K = {}, D = XX.data, U = XX.util, C = XX.config;
  function st() { return XX.store.state; }
  function cave() { return st().cave; }
  function P() { return XX.sys.player; }
  function inv() { return XX.sys.inv; }

  /* ---------- 通用升级消耗 ---------- */
  K.costAt = function (def, target, disc) {
    return {
      stone: Math.round(def.stoneBase * D.upgradeMul.stone[target] * (1 - (disc || 0))),
      jade: Math.round(def.jadeBase * D.upgradeMul.jade[target])
    };
  };
  K.canPay = function (c) { return st().stone >= c.stone && st().jade >= c.jade; };
  K.pay = function (c) { st().stone -= c.stone; st().jade -= c.jade; };
  K.costText = function (c) {
    return '<img class="ci" src="' + U.img('icon/lingshi') + '">' + U.num(c.stone) + (c.jade ? ' <img class="ci" src="' + U.img('icon/xianyu') + '">' + c.jade : '');
  };

  /* ---------- 设施 ---------- */
  K.lv = function (key) { return (cave().lv && cave().lv[key]) || 1; };
  K.facilityCost = function (key) { return K.costAt(D.facilities[key], K.lv(key) + 1); };
  K.upgradeFacility = function (key) {
    var lv = K.lv(key), f = D.facilities[key];
    if (lv >= C.caveMaxLv) return { ok: false, msg: f.name + '已达最高等级' };
    var c = K.facilityCost(key);
    if (st().stone < c.stone) return { ok: false, msg: '灵石不足' };
    if (st().jade < c.jade) return { ok: false, msg: '仙玉不足' };
    if (key === 'mine') K.mineCollect();
    K.pay(c);
    cave().lv[key] = lv + 1;
    XX.store.addLog(f.name + '升至 ' + (lv + 1) + ' 级。');
    return { ok: true, msg: f.name + '升至 ' + (lv + 1) + ' 级' };
  };
  K.maxTier = function (key) { return D.tierByLv(K.lv(key)); };

  /* ---------- 阵法 ---------- */
  K.arrayDef = function (id) { return D.arrays.filter(function (a) { return a.id === id; })[0]; };
  K.arrayCost = function (id) {
    return K.costAt(K.arrayDef(id), P().arrayLv(id) + 1, P().tpl().bonus.arrayDiscount || 0);
  };
  K.upgradeArray = function (id) {
    var a = K.arrayDef(id), lv = P().arrayLv(id);
    if (lv >= C.caveMaxLv) return { ok: false, msg: '阵法已臻圆满' };
    var c = K.arrayCost(id);
    if (st().stone < c.stone) return { ok: false, msg: '灵石不足' };
    if (st().jade < c.jade) return { ok: false, msg: '仙玉不足' };
    K.pay(c);
    cave().arrays[id] = lv + 1;
    XX.bus.emit('stats');
    return { ok: true, msg: a.name + ' 提升至 ' + (lv + 1) + ' 级' };
  };

  /* ---------- 炼丹 / 炼器(共用) ---------- */
  K.recipes = function (kind) { return kind === 'alchemy' ? D.alchemyRecipes : D.forgeRecipes; };
  K.recipe = function (kind, id) { return K.recipes(kind).filter(function (r) { return r.id === id; })[0]; };
  K.successRate = function (kind, r) {
    var s = P().stats(), b = P().tpl().bonus;
    var bonus = s.comprehension * 0.005 + (kind === 'alchemy' ? (b.alchemyRate || 0) + K.lv('alchemy') * 0.01 : 0);
    return U.clamp(r.rate + bonus, 0.05, 0.99);
  };
  K.known = function (kind, r) { return kind === 'alchemy' ? (!r.needRecipe || !!(st().recipes || {})[r.id]) : !!st().blueprints[r.id]; };
  K.needLv = function (kind, r) { return kind === 'alchemy' ? D.lvForTier(r.q) : D.lvForTier(r.tier); };
  K.lvOk = function (kind, r) { return K.lv(kind) >= K.needLv(kind, r); };
  K.batchTime = function (r, n) { return r.time * (1 + (n - 1) * D.batchTimeFactor); };
  K.maxBatch = function (kind, r) {
    if (kind !== 'alchemy') return 1;
    return Math.max(0, Math.min(99, inv().maxTimes(r.need), r.stone ? Math.floor(st().stone / r.stone) : 99));
  };
  K.startCraft = function (kind, rid, n) {
    var r = K.recipe(kind, rid), F = D.facilities[kind];
    n = kind === 'alchemy' ? Math.max(1, Math.floor(n || 1)) : 1;
    if (cave()[kind]) return { ok: false, msg: '炉火未熄,请先收取' };
    if (!K.known(kind, r)) return { ok: false, msg: kind === 'alchemy' ? '尚未掌握丹方' : '尚未掌握图纸' };
    if (!K.lvOk(kind, r)) return { ok: false, msg: F.name + '需达到 ' + K.needLv(kind, r) + ' 级' };
    if (st().realm < r.reqRealm) return { ok: false, msg: '境界不足' };
    if (st().stone < r.stone * n) return { ok: false, msg: '灵石不足' };
    if (!inv().hasAll(r.need, n)) return { ok: false, msg: '材料不足' };
    inv().consume(r.need, n);
    st().stone -= r.stone * n;
    var now = Date.now();
    cave()[kind] = { rid: rid, n: n, start: now, end: now + K.batchTime(r, n) * 1000 };
    return { ok: true, msg: F.name + '已开启:' + r.name + (n > 1 ? ' ×' + n + ' 炉' : '') };
  };
  K.craftProgress = function (kind) {
    var j = cave()[kind];
    if (!j) return null;
    var r = K.recipe(kind, j.rid);
    if (!r) { cave()[kind] = null; return null; }
    var now = Date.now();
    return { job: j, recipe: r, ratio: now >= j.end ? 1 : U.clamp((now - j.start) / (j.end - j.start), 0, 1), left: (j.end - now) / 1000 };
  };
  K.goldChance = function () {
    var s = P().stats();
    return U.clamp(D.forgeGoldChance + K.lv('forge') * 0.02 + s.comprehension * 0.005 + s.luck * 0.003, 0, 0.6);
  };
  K.collectCraft = function (kind) {
    var p = K.craftProgress(kind);
    if (!p || p.ratio < 1) return { ok: false, msg: '尚未完成' };
    var r = p.recipe, n = p.job.n || 1, rate = K.successRate(kind, r);
    var outId = r.out[0], outDef = D.items[outId];
    if (outDef.type === 'equip') {
      if (inv().free() < 1) return { ok: false, msg: '储物袋空间不足,请先整理' };
      cave()[kind] = null;
      if (Math.random() > rate) {
        XX.store.addLog('炼器失败,' + r.name + '器胚碎裂。');
        return { ok: false, fail: true, msg: '器胚碎裂!' + r.name + '炼制失败' };
      }
      var eq = inv().makeEquip(outId, Math.random() < K.goldChance() ? 4 : 3, r.lv);
      inv().addInstance(eq);
      var txt = C.qualities[eq.q].name + '·' + eq.name;
      XX.store.addLog('神兵出炉:获得特殊法宝 ' + txt + '。');
      return { ok: true, msg: '炼制成功!获得 ' + txt, eq: eq };
    }
    var okCount = 0, total = 0;
    for (var i = 0; i < n; i++) if (Math.random() <= rate) { okCount++; total += U.randInt(r.out[1], r.out[2]); }
    if (total > 0 && !inv().canAdd(outId, total)) return { ok: false, msg: '储物袋空间不足,请先整理' };
    cave()[kind] = null;
    if (!okCount) {
      XX.store.addLog('炼丹失败,' + r.name + '尽化飞灰。');
      return { ok: false, fail: true, msg: '炸炉了!' + r.name + '炼制失败' };
    }
    inv().add(outId, total);
    var msg = '成丹 ' + okCount + '/' + n + ' 炉,获得 ' + outDef.name + ' ×' + total;
    XX.store.addLog('开炉成丹:' + msg + '。');
    return { ok: true, msg: msg };
  };

  /* ---------- 灵田 ---------- */
  K.plots = function () { return Math.min(D.field.maxPlots, D.field.basePlots + K.lv('field')); };
  K.crop = function (seed) { return D.field.crops.filter(function (c) { return c.seed === seed; })[0]; };
  K.cropOk = function (c) { return K.lv('field') >= D.lvForTier(c.q); };
  K.growTime = function (crop) { return crop.time / (1 + P().arrayVal('yuanling') + K.lv('field') * D.field.speedPerLv); };
  K.plant = function (i, seed) {
    var f = cave().field;
    if (i >= K.plots()) return { ok: false, msg: '该地块尚未开垦' };
    if (f.plots[i]) return { ok: false, msg: '此处已有灵植' };
    if (inv().count(seed) < 1) return { ok: false, msg: '种子不足' };
    var c = K.crop(seed), now = Date.now();
    if (!K.cropOk(c)) return { ok: false, msg: '灵田需达到 ' + D.lvForTier(c.q) + ' 级' };
    inv().remove(seed, 1);
    f.plots[i] = { seed: seed, start: now, end: now + K.growTime(c) * 1000 };
    return { ok: true, msg: '已种下' + D.items[seed].name };
  };
  /* 一键播种:用指定灵种填满空地 */
  K.plantAll = function (seed) {
    var n = 0;
    for (var i = 0; i < K.plots(); i++) if (!cave().field.plots[i] && inv().count(seed) > 0 && K.plant(i, seed).ok) n++;
    return n;
  };
  K.harvest = function (i) {
    var f = cave().field, p = f.plots[i];
    if (!p || Date.now() < p.end) return null;
    var c = K.crop(p.seed);
    var n = U.randInt(c.yield[0], c.yield[1]) + (P().tpl().bonus.fieldYield || 0);
    var res = [[c.out, n]];
    if (U.chance(D.field.seedReturnChance)) res.push([p.seed, 1]);
    if (!inv().canAdd(c.out, n)) return { full: true };
    f.plots[i] = null;
    return { got: inv().grant(res) };
  };
  K.harvestAll = function () {
    var all = [], full = false;
    for (var i = 0; i < K.plots(); i++) {
      var r = K.harvest(i);
      if (r && r.full) full = true;
      if (r && r.got) all = all.concat(r.got);
    }
    return { got: all, full: full };
  };

  /* ---------- 灵矿 ---------- */
  K.minePerMin = function () { return D.mine.stonePerMin[K.lv('mine')] * (1 + P().arrayVal('jubao')); };
  K.minePending = function () {
    var m = cave().mine;
    var mins = Math.min(D.mine.capMinutes, (Date.now() - m.last) / 60000);
    return { mins: mins, stone: Math.floor(mins * K.minePerMin()), full: mins >= D.mine.capMinutes };
  };
  K.mineCollect = function () {
    var m = cave().mine, p = K.minePending(), lv = K.lv('mine');
    if (p.stone <= 0) return { ok: false, msg: '矿脉尚在积蓄灵气' };
    st().stone += p.stone;
    var ores = [];
    D.mine.ores.forEach(function (o) {
      if (lv < o.minLv) return;
      var e = o.perMin * p.mins * (1 + P().arrayVal('jubao') * 0.5);
      var n = Math.floor(e) + (U.chance(e - Math.floor(e)) ? 1 : 0);
      if (n > 0) ores.push([o.id, n]);
    });
    var got = inv().grant(ores);
    m.last = Date.now();
    return { ok: true, stone: p.stone, got: got };
  };

  return K;
})();

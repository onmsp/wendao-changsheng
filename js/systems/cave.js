/* 洞府:阵法 / 炼丹 / 炼器 / 灵田 / 灵矿 */
XX.sys.cave = (function () {
  var K = {}, D = XX.data, U = XX.util;
  function st() { return XX.store.state; }
  function cave() { return st().cave; }
  function P() { return XX.sys.player; }
  function inv() { return XX.sys.inv; }

  /* ---------- 阵法 ---------- */
  K.arrayDef = function (id) { return D.arrays.filter(function (a) { return a.id === id; })[0]; };
  K.arrayCost = function (id) {
    var a = K.arrayDef(id), lv = P().arrayLv(id);
    var disc = P().tpl().bonus.arrayDiscount || 0;
    return Math.round(a.costBase * Math.pow(a.costGrow, lv) * (1 - disc));
  };
  K.upgradeArray = function (id) {
    var a = K.arrayDef(id), lv = P().arrayLv(id), cost = K.arrayCost(id);
    if (lv >= a.maxLv) return { ok: false, msg: '阵法已臻圆满' };
    if (st().stone < cost) return { ok: false, msg: '灵石不足' };
    st().stone -= cost;
    cave().arrays[id] = lv + 1;
    XX.bus.emit('stats');
    return { ok: true, msg: a.name + ' 提升至 ' + (lv + 1) + ' 级' };
  };

  /* ---------- 炼丹 / 炼器(共用) ---------- */
  K.recipes = function (kind) { return kind === 'alchemy' ? D.alchemyRecipes : D.forgeRecipes; };
  K.recipe = function (kind, id) { return K.recipes(kind).filter(function (r) { return r.id === id; })[0]; };
  K.successRate = function (kind, r) {
    var s = P().stats(), b = P().tpl().bonus;
    var bonus = s.comprehension * 0.005 + (kind === 'alchemy' ? (b.alchemyRate || 0) : 0);
    return U.clamp(r.rate + bonus, 0.05, 0.99);
  };
  K.startCraft = function (kind, rid) {
    var r = K.recipe(kind, rid);
    if (cave()[kind]) return { ok: false, msg: '炉火未熄,请先收取' };
    if (st().realm < r.reqRealm) return { ok: false, msg: '境界不足' };
    if (st().stone < r.stone) return { ok: false, msg: '灵石不足' };
    if (!inv().hasAll(r.need)) return { ok: false, msg: '材料不足' };
    inv().consume(r.need);
    st().stone -= r.stone;
    var now = Date.now();
    cave()[kind] = { rid: rid, start: now, end: now + r.time * 1000 };
    return { ok: true, msg: (kind === 'alchemy' ? '丹炉' : '器炉') + '已开启:' + r.name };
  };
  K.craftProgress = function (kind) {
    var j = cave()[kind];
    if (!j) return null;
    var now = Date.now();
    return { job: j, recipe: K.recipe(kind, j.rid), ratio: now >= j.end ? 1 : U.clamp((now - j.start) / (j.end - j.start), 0, 1), left: (j.end - now) / 1000 };
  };
  K.collectCraft = function (kind) {
    var p = K.craftProgress(kind);
    if (!p || p.ratio < 1) return { ok: false, msg: '尚未完成' };
    var r = p.recipe, s = P().stats();
    if (Math.random() > K.successRate(kind, r)) {
      cave()[kind] = null;
      XX.store.addLog((kind === 'alchemy' ? '炼丹' : '炼器') + '失败,' + r.name + '化为飞灰。');
      return { ok: false, fail: true, msg: (kind === 'alchemy' ? '炸炉了!' : '器胚碎裂!') + r.name + '炼制失败' };
    }
    var outId = r.out[0], n = U.randInt(r.out[1], r.out[2]);
    var outDef = D.items[outId];
    if (!inv().canAdd(outId, n)) return { ok: false, msg: '储物袋空间不足,请先整理' };
    var got;
    if (outDef.type === 'equip') {
      var q = inv().rollQuality(outDef.q, s.comprehension * 0.02 + s.luck * 0.01);
      inv().add(outId, 1, false, { q: q });
      got = XX.config.qualities[q].name + '·' + outDef.name;
    } else {
      inv().add(outId, n);
      got = outDef.name + ' ×' + n;
    }
    cave()[kind] = null;
    XX.store.addLog((kind === 'alchemy' ? '开炉成丹' : '神兵出炉') + ':获得 ' + got + '。');
    return { ok: true, msg: '炼制成功!获得 ' + got };
  };

  /* ---------- 灵田 ---------- */
  K.crop = function (seed) { return D.field.crops.filter(function (c) { return c.seed === seed; })[0]; };
  K.plot = function (i) { return cave().field.plots[i] || null; };
  K.growTime = function (crop) { return crop.time / (1 + P().arrayVal('yuanling')); };
  K.plant = function (i, seed) {
    var f = cave().field;
    if (i >= f.unlocked) return { ok: false, msg: '该地块尚未开垦' };
    if (f.plots[i]) return { ok: false, msg: '此处已有灵植' };
    if (inv().count(seed) < 1) return { ok: false, msg: '种子不足' };
    var c = K.crop(seed), now = Date.now();
    if (st().realm < c.reqRealm) return { ok: false, msg: '境界不足' };
    inv().remove(seed, 1);
    f.plots[i] = { seed: seed, start: now, end: now + K.growTime(c) * 1000 };
    return { ok: true, msg: '已种下' + D.items[seed].name };
  };
  K.harvest = function (i) {
    var f = cave().field, p = f.plots[i];
    if (!p) return null;
    if (Date.now() < p.end) return null;
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
    for (var i = 0; i < cave().field.unlocked; i++) {
      var r = K.harvest(i);
      if (r && r.full) full = true;
      if (r && r.got) all = all.concat(r.got);
    }
    return { got: all, full: full };
  };
  K.unlockPlot = function () {
    var f = cave().field;
    if (f.unlocked >= D.field.maxPlots) return { ok: false, msg: '灵田已全部开垦' };
    var cost = D.field.unlockCost[f.unlocked];
    if (st().stone < cost) return { ok: false, msg: '灵石不足' };
    st().stone -= cost; f.unlocked++;
    return { ok: true, msg: '开垦新灵田成功' };
  };

  /* ---------- 灵矿 ---------- */
  K.minePerMin = function () {
    var m = cave().mine;
    return D.mine.stonePerMin(m.lv) * (1 + P().arrayVal('jubao'));
  };
  K.minePending = function () {
    var m = cave().mine;
    var mins = Math.min(D.mine.capMinutes, (Date.now() - m.last) / 60000);
    return { mins: mins, stone: Math.floor(mins * K.minePerMin()), full: mins >= D.mine.capMinutes };
  };
  K.mineCollect = function () {
    var m = cave().mine, p = K.minePending();
    if (p.stone <= 0) return { ok: false, msg: '矿脉尚在积蓄灵气' };
    st().stone += p.stone;
    var ores = [];
    D.mine.ores.forEach(function (o) {
      if (m.lv < o.minLv) return;
      var exp = o.perMin * p.mins * (1 + P().arrayVal('jubao') * 0.5);
      var n = Math.floor(exp) + (U.chance(exp - Math.floor(exp)) ? 1 : 0);
      if (n > 0) ores.push([o.id, n]);
    });
    var got = inv().grant(ores);
    m.last = Date.now();
    return { ok: true, stone: p.stone, got: got };
  };
  K.mineUpgrade = function () {
    var m = cave().mine;
    if (m.lv >= D.mine.maxLv) return { ok: false, msg: '灵矿已达最高等级' };
    var cost = D.mine.upgradeCost(m.lv);
    if (st().stone < cost) return { ok: false, msg: '灵石不足' };
    K.mineCollect();
    st().stone -= cost; m.lv++;
    return { ok: true, msg: '灵矿升至 ' + m.lv + ' 级' };
  };

  return K;
})();

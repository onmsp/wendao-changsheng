/* 洞府:设施升级 / 阵法 / 炼丹 / 炼器 / 灵田 / 灵矿 */
XX.sys.cave = (function () {
  var K = {}, D = XX.data, U = XX.util, C = XX.config;
  function st() { return XX.store.state; }
  function cave() { return st().cave; }
  function P() { return XX.sys.player; }
  function inv() { return XX.sys.inv; }

  /* ---------- 通用升级消耗:1~5 级 灵石+玄铁;6~10 级 灵石+玄铁精+仙玉 ---------- */
  K.costAt = function (def, target, disc) {
    var M = D.upgradeMul;
    return {
      stone: Math.round(def.stoneBase * M.stone[target] * (1 - (disc || 0))),
      iron: Math.round((def.ironBase || 0) * M.iron[target]),
      ironG: Math.round((def.ironBase || 0) * M.ironG[target]),
      jade: Math.round(def.jadeBase * M.jade[target])
    };
  };
  K.canPay = function (c) {
    return st().stone >= c.stone && st().jade >= c.jade && inv().count(D.upgradeMat.iron) >= c.iron && inv().count(D.upgradeMat.ironG) >= c.ironG;
  };
  K.lackText = function (c) {
    if (st().stone < c.stone) return '灵石不足';
    if (inv().count(D.upgradeMat.iron) < c.iron) return D.items[D.upgradeMat.iron].name + '不足';
    if (inv().count(D.upgradeMat.ironG) < c.ironG) return D.items[D.upgradeMat.ironG].name + '不足';
    if (st().jade < c.jade) return '仙玉不足';
    return '';
  };
  K.pay = function (c) {
    st().stone -= c.stone; st().jade -= c.jade;
    if (c.iron) inv().remove(D.upgradeMat.iron, c.iron);
    if (c.ironG) inv().remove(D.upgradeMat.ironG, c.ironG);
  };
  K.costText = function (c) {
    var t = '<img class="ci" src="' + U.img('icon/lingshi') + '">' + U.num(c.stone);
    if (c.iron) t += ' <span class="cost-mat" style="color:' + U.qColor(0) + '">' + U.itemIcon(D.upgradeMat.iron, 'xs') + c.iron + '</span>';
    if (c.ironG) t += ' <span class="cost-mat" style="color:' + U.qColor(1) + '">' + U.itemIcon(D.upgradeMat.ironG, 'xs') + c.ironG + '</span>';
    if (c.jade) t += ' <img class="ci" src="' + U.img('icon/xianyu') + '">' + c.jade;
    return t;
  };

  /* ---------- 设施 ---------- */
  K.lv = function (key) { return (cave().lv && cave().lv[key]) || 1; };
  K.facilityCost = function (key) { return K.costAt(D.facilities[key], K.lv(key) + 1); };
  K.upgradeFacility = function (key) {
    var lv = K.lv(key), f = D.facilities[key];
    if (lv >= C.caveMaxLv) return { ok: false, msg: f.name + '已达最高等级' };
    var c = K.facilityCost(key);
    if (!K.canPay(c)) return { ok: false, msg: K.lackText(c) };
    if (key === 'mine') K.mineCollect();
    K.pay(c);
    cave().lv[key] = lv + 1;
    XX.store.addLog(f.name + '升至 ' + (lv + 1) + ' 级。');
    return { ok: true, msg: f.name + '升至 ' + (lv + 1) + ' 级' };
  };
  K.maxTier = function (key) { return D.tierByLv(K.lv(key)); };

  /* ---------- 阵法:需阵图;布置即 1 级,上限 10 级(★) ---------- */
  K.arrayDef = function (id) { return D.arrays.filter(function (a) { return a.id === id; })[0]; };
  K.arrayCost = function (id) {
    return K.costAt(K.arrayDef(id), P().arrayLv(id) + 1, P().tpl().bonus.arrayDiscount || 0);
  };
  K.arrayValue = function (a, lv) {
    var m = D.lvMul(lv || 1) * inv().bpMul(a.id), o = {};
    Object.keys(a.effects).forEach(function (k) { o[k] = a.effects[k] * m; });
    return o;
  };
  K.upgradeArray = function (id) {
    var a = K.arrayDef(id), lv = P().arrayLv(id);
    if (!inv().bpLv(id)) return { ok: false, msg: '尚未获得【' + a.name + '】阵图' };
    if (lv >= C.maxLv) return { ok: false, msg: '阵法已臻圆满(★)' };
    var c = K.arrayCost(id);
    if (!K.canPay(c)) return { ok: false, msg: K.lackText(c) };
    K.pay(c);
    cave().arrays[id] = lv + 1;
    cave().activeArrays = cave().activeArrays || [];
    var auto = !lv && cave().activeArrays.length < C.arrayActiveMax && cave().activeArrays.indexOf(id) < 0;
    if (auto) cave().activeArrays.push(id);
    XX.bus.emit('stats');
    return { ok: true, msg: lv ? a.name + ' 提升至 ' + U.lvText(lv + 1) : '布置' + a.name + '成功' + (auto ? ',已启用' : '(生效阵法已满 ' + C.arrayActiveMax + ' 个,可手动替换)') };
  };
  /* 启用/停用阵法:同时最多 config.arrayActiveMax 个生效 */
  K.isActive = function (id) { return (cave().activeArrays || []).indexOf(id) >= 0; };
  K.toggleArray = function (id) {
    var cv = cave(), a = K.arrayDef(id);
    cv.activeArrays = (cv.activeArrays || []).filter(function (x) { return P().arrayLv(x) > 0; });
    var i = cv.activeArrays.indexOf(id);
    if (i >= 0) { cv.activeArrays.splice(i, 1); XX.bus.emit('stats'); return { ok: true, msg: '已停用' + a.name }; }
    if (!P().arrayLv(id)) return { ok: false, msg: '尚未布置' + a.name };
    if (cv.activeArrays.length >= C.arrayActiveMax) return { ok: false, msg: '最多同时启用 ' + C.arrayActiveMax + ' 个阵法,请先停用其他阵法' };
    cv.activeArrays.push(id); XX.bus.emit('stats');
    return { ok: true, msg: '已启用' + a.name };
  };

  /* ---------- 炼丹 / 炼器(共用) ---------- */
  K.recipes = function (kind) { return kind === 'alchemy' ? D.alchemyRecipes : D.forgeRecipes; };
  K.recipe = function (kind, id) { return K.recipes(kind).filter(function (r) { return r.id === id; })[0]; };
  K.successRate = function (kind, r) {
    var s = P().stats(), b = P().tpl().bonus;
    var bonus = s.comprehension * 0.005 + (kind === 'alchemy' ? (b.alchemyRate || 0) + K.lv('alchemy') * 0.01 : 0);
    return U.clamp(r.rate + bonus, 0.05, 0.99);
  };
  K.known = function (kind, r) { return inv().bpLv(r.id) > 0; };
  K.needLv = function (kind, r) { return D.lvForTier(r.q); };
  K.lvOk = function (kind, r) { return K.lv(kind) >= K.needLv(kind, r); };
  /* 特殊法宝炼制强度 = max(器图基准, 当前境界序号);灵石消耗随强度提升 */
  K.forgePw = function (r) { return Math.max(r.pw || 0, st().realm); };
  K.craftStone = function (kind, r) {
    if (kind !== 'forge') return r.stone;
    return Math.round(r.stone * Math.pow(1.12, K.forgePw(r) - (r.pw || 0)));
  };
  K.batchTime = function (r, n) { return r.time * (1 + (n - 1) * D.batchTimeFactor); };
  K.maxBatch = function (kind, r) {
    if (kind !== 'alchemy') return 1;
    return Math.max(0, Math.min(99, inv().maxTimes(r.need), r.stone ? Math.floor(st().stone / r.stone) : 99));
  };
  K.startCraft = function (kind, rid, n) {
    var r = K.recipe(kind, rid), F = D.facilities[kind];
    n = kind === 'alchemy' ? Math.max(1, Math.floor(n || 1)) : 1;
    if (cave()[kind]) return { ok: false, msg: '炉火未熄,请先收取' };
    if (!K.known(kind, r)) return { ok: false, msg: kind === 'alchemy' ? '尚未获得丹方' : '尚未获得器图' };
    if (!K.lvOk(kind, r)) return { ok: false, msg: F.name + '需达到 ' + K.needLv(kind, r) + ' 级' };
    if (st().realm < r.reqRealm) return { ok: false, msg: '境界不足' };
    var cs = K.craftStone(kind, r);
    if (st().stone < cs * n) return { ok: false, msg: '灵石不足' };
    if (!inv().hasAll(r.need, n)) return { ok: false, msg: '材料不足' };
    inv().consume(r.need, n);
    st().stone -= cs * n;
    var now = Date.now();
    cave()[kind] = { rid: rid, n: n, start: now, end: now + K.batchTime(r, n) * 1000 };
    if (kind === 'forge') cave()[kind].pw = K.forgePw(r);
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
      var eq = inv().makeEquip(outId, outDef.q, p.job.pw != null ? p.job.pw : r.pw, inv().bpMul(r.id));
      inv().addInstance(eq);
      XX.store.addLog('神兵出炉:获得法宝【' + eq.name + '】。');
      return { ok: true, msg: '炼制成功!获得 ' + eq.name, eq: eq };
    }
    var okCount = 0, total = 0;
    for (var i = 0; i < n; i++) if (Math.random() <= rate) { okCount++; total += U.randInt(r.out[1], r.out[2]); }
    var g = inv().bpLv(r.id) || 1;
    if (total > 0 && !inv().canAdd(outId, total, g)) return { ok: false, msg: '储物袋空间不足,请先整理' };
    cave()[kind] = null;
    if (!okCount) {
      XX.store.addLog('炼丹失败,' + r.name + '尽化飞灰。');
      return { ok: false, fail: true, msg: '炸炉了!' + r.name + '炼制失败' };
    }
    inv().add(outId, total, false, { g: g });
    var msg = '成丹 ' + okCount + '/' + n + ' 炉,获得 ' + outDef.name + ' ×' + total;
    XX.store.addLog('开炉成丹:' + msg + '。');
    return { ok: true, msg: msg };
  };

  /* ---------- 灵田 ---------- */
  K.plots = function () { return Math.min(D.field.maxPlots, D.field.basePlots + K.lv('field')); };
  K.crop = function (seed) { return D.field.crops.filter(function (c) { return c.seed === seed; })[0]; };
  K.cropOk = function (c) { return K.lv('field') >= D.lvForTier(c.q); };
  K.growTime = function (crop) { return crop.time / (1 + P().arrayEff('fieldSpeed') + K.lv('field') * D.field.speedPerLv); };
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
  /* 播种顺序(最多 3 种,按先后自动播种) */
  K.queue = function () { var f = cave().field; f.queue = f.queue || [null, null, null]; return f.queue; };
  K.nextSeed = function () {
    var q = K.queue();
    for (var i = 0; i < q.length; i++) {
      var c = q[i] && K.crop(q[i]);
      if (c && K.cropOk(c) && inv().count(q[i]) > 0) return q[i];
    }
    return null;
  };
  /* 自动收获 + 按顺序自动播种(含离线补算);返回本次收获列表 */
  K.autoField = function (now) {
    var f = cave().field, got = {}, full = false;
    now = now || Date.now();
    for (var i = 0; i < K.plots(); i++) {
      for (var guard = 0; guard < 300; guard++) {
        var p = f.plots[i];
        if (p && p.end <= now) {
          var c = K.crop(p.seed);
          var n = U.randInt(c.yield[0], c.yield[1]) + (P().tpl().bonus.fieldYield || 0);
          if (!inv().canAdd(c.out, n)) { full = true; break; }
          inv().add(c.out, n, true);
          got[c.out] = (got[c.out] || 0) + n;
          if (U.chance(D.field.seedReturnChance)) inv().add(p.seed, 1, true);
          var endAt = p.end;
          f.plots[i] = null;
          var sd = K.nextSeed();
          if (sd) { inv().remove(sd, 1); f.plots[i] = { seed: sd, start: endAt, end: endAt + K.growTime(K.crop(sd)) * 1000 }; continue; }
          break;
        }
        if (!p) {
          var sd2 = K.nextSeed();
          if (sd2) { inv().remove(sd2, 1); f.plots[i] = { seed: sd2, start: now, end: now + K.growTime(K.crop(sd2)) * 1000 }; }
        }
        break;
      }
      if (full) break;
    }
    return { got: Object.keys(got).map(function (k) { return [k, got[k]]; }), full: full };
  };

  /* ---------- 灵矿 ---------- */
  K.minePerMin = function () { return D.mine.stonePerMin[K.lv('mine')] * (1 + P().arrayEff('mineBonus')); };
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
      var e = o.perMin * p.mins * (1 + P().arrayEff('mineBonus') * 0.5);
      var n = Math.floor(e) + (U.chance(e - Math.floor(e)) ? 1 : 0);
      if (n > 0) ores.push([o.id, n]);
    });
    var got = inv().grant(ores);
    m.last = Date.now();
    return { ok: true, stone: p.stone, got: got };
  };

  return K;
})();

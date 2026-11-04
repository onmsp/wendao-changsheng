/*
 * 背包系统
 * 格子结构:可堆叠 {id, n}(每格上限 stackMax);法宝 {id, uid, q, lv, name, stats, affixes};特殊 {id, uid}
 */
XX.sys.inv = (function () {
  var I = {}, D = XX.data, U = XX.util, C = XX.config;
  function bag() { return XX.store.state.bag; }
  function st() { return XX.store.state; }

  I.def = function (id) { return D.items[id]; };
  I.stackable = function (id) { var it = D.items[id]; return it && D.itemTypes[it.type].stack; };
  I.used = function () { return bag().slots.length; };
  I.free = function () { return bag().cap - bag().slots.length; };
  I.count = function (id) { return bag().slots.reduce(function (s, sl) { return s + (sl.id === id ? (sl.n || 1) : 0); }, 0); };

  I.slotsNeeded = function (id, n) {
    if (!I.stackable(id)) return n;
    var room = 0;
    bag().slots.forEach(function (sl) { if (sl.id === id) room += C.stackMax - sl.n; });
    return Math.max(0, Math.ceil((n - room) / C.stackMax));
  };
  I.canAdd = function (id, n) { return I.slotsNeeded(id, n) <= I.free(); };

  /* 随机特殊属性 */
  I.rollAffix = function (id) {
    var a = D.affixes[id], v = U.rand(a.range[0], a.range[1]);
    v = a.pct ? Math.round(v * 1000) / 1000 : Math.round(v);
    return { id: id, v: v };
  };
  I.affixText = function (a) {
    var d = D.affixes[a.id];
    if (!d) return '';
    return d.name + ':' + d.desc.replace('{v}', d.pct ? U.pct(a.v) : a.v);
  };

  /* 生成法宝实例:q 品阶 0~4,lv 等级 */
  I.makeEquip = function (id, q, lv) {
    var it = D.items[id];
    q = U.clamp(q == null ? (it.q || 0) : q, 0, 4); lv = lv || 0;
    var mul = D.equipQualityMul[q] * Math.pow(D.equipLevelGrow, lv), stats = {};
    Object.keys(it.stats).forEach(function (k) {
      var base = it.stats[k], v;
      if (base < 1) v = Math.round(base * (1 + q * 0.35) * U.rand(0.9, 1.1) * 1000) / 1000;   // 百分比类不随等级暴涨
      else v = Math.round(base * mul * U.rand(0.9, 1.1));
      stats[k] = v;
    });
    var affixes = [], need = C.affixCount[q] || 0, pool = Object.keys(D.affixes);
    if (it.fixed) { affixes.push(I.rollAffix(it.fixed)); need = Math.max(need, 1); }
    while (affixes.length < need) {
      var k = U.pick(pool);
      if (!affixes.some(function (a) { return a.id === k; })) affixes.push(I.rollAffix(k));
    }
    var name = it.name;
    if (!it.special) {
      var prefix = '';
      D.equipTierNames.forEach(function (t) { if (lv >= t[0]) prefix = t[1]; });
      name = prefix + it.name;
    }
    return { id: id, uid: U.uid(), q: q, lv: lv, name: name, stats: stats, affixes: affixes };
  };

  /*
   * 加入物品,返回 {added, lost}
   * opts:法宝的 {q, lv}
   */
  I.add = function (id, n, silent, opts) {
    var it = D.items[id], b = bag(), added = 0;
    if (!it) { console.warn('未知物品', id); return { added: 0, lost: n }; }
    n = n || 1;
    if (I.stackable(id)) {
      var left = n;
      b.slots.forEach(function (sl) {
        if (left > 0 && sl.id === id && sl.n < C.stackMax) { var put = Math.min(left, C.stackMax - sl.n); sl.n += put; left -= put; }
      });
      while (left > 0 && b.slots.length < b.cap) { var put2 = Math.min(left, C.stackMax); b.slots.push({ id: id, n: put2 }); left -= put2; }
      added = n - left;
    } else {
      for (var i = 0; i < n && b.slots.length < b.cap; i++) {
        if (it.type === 'equip') b.slots.push(I.makeEquip(id, opts && opts.q, opts && opts.lv));
        else b.slots.push({ id: id, uid: U.uid() });
        added++;
      }
    }
    if (added < n && !silent) XX.ui.toast('储物袋已满,' + it.name + ' ×' + (n - added) + ' 遗失', 'warn');
    XX.bus.emit('bag');
    return { added: added, lost: n - added };
  };

  /* 直接放入一个已生成的法宝实例 */
  I.addInstance = function (eq) {
    if (I.free() <= 0) { XX.ui.toast('储物袋已满,' + eq.name + ' 遗失', 'warn'); return false; }
    bag().slots.push(eq); XX.bus.emit('bag'); return true;
  };

  I.remove = function (id, n) {
    var b = bag(), left = n;
    for (var i = b.slots.length - 1; i >= 0 && left > 0; i--) {
      var sl = b.slots[i];
      if (sl.id !== id) continue;
      var take = Math.min(left, sl.n || 1);
      if (sl.n) sl.n -= take;
      if (!sl.n || sl.n <= 0) b.slots.splice(i, 1);
      left -= take;
    }
    XX.bus.emit('bag');
    return n - left;
  };
  I.removeAt = function (idx, n) {
    var b = bag(), sl = b.slots[idx];
    if (!sl) return;
    if (sl.n && sl.n > (n || 1)) sl.n -= (n || 1); else b.slots.splice(idx, 1);
    XX.bus.emit('bag');
  };
  I.hasAll = function (need, times) {
    times = times || 1;
    return Object.keys(need).every(function (k) { return I.count(k) >= need[k] * times; });
  };
  I.consume = function (need, times) { times = times || 1; Object.keys(need).forEach(function (k) { I.remove(k, need[k] * times); }); };
  /* 材料最多够炼几次 */
  I.maxTimes = function (need) {
    return Object.keys(need).reduce(function (m, k) { return Math.min(m, Math.floor(I.count(k) / need[k])); }, 9999);
  };

  /* 使用物品,返回提示文字 */
  I.use = function (idx, times) {
    var s = st(), sl = s.bag.slots[idx];
    if (!sl) return null;
    var it = D.items[sl.id], u = it.use, P = XX.sys.player;
    if (!u) return '此物无法直接使用。';
    times = Math.min(times || 1, sl.n || 1);
    var msg = '';
    switch (u.kind) {
      case 'exp':
        var total = 0;
        for (var i = 0; i < times; i++) total += P.addExp(Math.max(u.min || 0, P.expNeed() * u.pct));
        msg = '服下' + it.name + (times > 1 ? ' ×' + times : '') + ',修为 +' + U.exp(total);
        break;
      case 'perm':
        var cur = s.perm[u.key] || 0;
        if (cur >= u.cap - 1e-9) return '药力已达上限,无法再获增益。';
        times = Math.min(times, Math.round((u.cap - cur) / u.add));
        s.perm[u.key] = Math.round((cur + u.add * times) * 1000) / 1000;
        var labels = { hpPct: '气血', comprehension: '悟性', rateBonus: '修炼速度' };
        msg = it.name + '生效,' + labels[u.key] + ' 永久 +' + (u.key === 'comprehension' ? u.add * times : U.pct(u.add * times));
        break;
      case 'buff':
        var b = s.buffs[u.key] || 0;
        if (b >= u.cap - 1e-9) return '符力已满,无需再用。';
        s.buffs[u.key] = Math.min(u.cap, b + u.add); times = 1;
        msg = '破境符燃起金光,下次大境界突破成功率 +' + U.pct(s.buffs[u.key], 0);
        break;
      case 'bag':
        s.bag.cap += u.add; times = 1;
        msg = '储物袋容量 +' + u.add + ',当前 ' + s.bag.cap + ' 格';
        break;
      case 'stone':
        var v = u.base * (P.realm().major + 1);
        s.stone += v; times = 1;
        msg = '打开灵石袋,获得灵石 ×' + U.num(v);
        break;
      case 'root':
        var idxR = D.roots.findIndex(function (r) { return r.id === s.root; });
        if (idxR >= D.roots.length - 1) return '你已是单色天灵根,无需洗灵。';
        s.root = D.roots[idxR + 1].id; times = 1;
        msg = '洗筋伐髓,灵根蜕变为【' + D.roots[idxR + 1].name + '】!';
        XX.store.addLog(msg);
        break;
      case 'learn':
        var def = u.cat === 'gongfa' ? D.gongfa[u.id] : D.shentong[u.id];
        var list = u.cat === 'gongfa' ? s.skills.learnedGongfa : s.skills.learnedShentong;
        if (list.indexOf(u.id) >= 0) return '你已掌握【' + def.name + '】。';
        if (s.realm < (def.reqRealm || 0)) return '境界不足,需达到「' + D.realms[def.reqRealm].name + '」方可参悟。';
        list.push(u.id); times = 1;
        msg = '参悟玉简,习得' + (u.cat === 'gongfa' ? '功法' : '神通') + '【' + def.name + '】!可在人物页装配。';
        XX.store.addLog(msg);
        break;
      case 'blueprint':
        if (s.blueprints[u.recipe]) return '你已掌握该器方。';
        s.blueprints[u.recipe] = true; times = 1;
        msg = '研读图纸,掌握器方【' + it.name.replace('图纸', '') + '】,可在洞府·炼器中炼制。';
        XX.store.addLog(msg);
        break;
      case 'break':
        return '此丹将在冲击大境界时自动服用。';
      default:
        return '此物无法直接使用。';
    }
    I.removeAt(idx, times);
    XX.bus.emit('stats');
    return msg;
  };

  I.price = function (sl) {
    var it = D.items[sl.id];
    if (sl.q != null) return Math.round(it.price * D.equipQualityMul[sl.q] * (1 + (sl.lv || 0) * 0.25));
    return it.price;
  };
  I.sell = function (idx, n) {
    var s = st(), sl = s.bag.slots[idx];
    if (!sl) return 0;
    n = Math.min(n || 1, sl.n || 1);
    var price = I.price(sl) * n;
    s.stone += price;
    I.removeAt(idx, n);
    return price;
  };

  /* 佩戴法宝:slot 0~3;不传则放入第一个空位 */
  I.firstFreeTreasure = function () { return st().equip.indexOf(null); };
  I.equip = function (idx, slot) {
    var s = st(), sl = s.bag.slots[idx];
    if (!sl || D.items[sl.id].type !== 'equip') return false;
    if (slot == null) slot = I.firstFreeTreasure();
    if (slot < 0) return false;
    var old = s.equip[slot];
    s.equip[slot] = sl;
    if (old) s.bag.slots[idx] = old; else s.bag.slots.splice(idx, 1);
    XX.bus.emit('bag'); XX.bus.emit('stats');
    return true;
  };
  I.unequip = function (slot) {
    var s = st();
    if (!s.equip[slot]) return false;
    if (I.free() <= 0) { XX.ui.toast('储物袋已满', 'warn'); return false; }
    s.bag.slots.push(s.equip[slot]); s.equip[slot] = null;
    XX.bus.emit('bag'); XX.bus.emit('stats');
    return true;
  };

  I.sort = function () {
    var b = bag(), order = { equip: 0, special: 1, pill: 2, material: 3 };
    var counts = {}, others = [];
    b.slots.forEach(function (sl) { if (I.stackable(sl.id)) counts[sl.id] = (counts[sl.id] || 0) + sl.n; else others.push(sl); });
    var stacks = [];
    Object.keys(counts).forEach(function (id) {
      var n = counts[id];
      while (n > 0) { var p = Math.min(n, C.stackMax); stacks.push({ id: id, n: p }); n -= p; }
    });
    var all = others.concat(stacks);
    all.sort(function (a, c) {
      var A = D.items[a.id], B = D.items[c.id];
      return (order[A.type] - order[B.type]) || ((c.q != null ? c.q : B.q) - (a.q != null ? a.q : A.q)) || ((c.lv || 0) - (a.lv || 0)) || (a.id < c.id ? -1 : a.id > c.id ? 1 : 0);
    });
    b.slots = all;
    XX.bus.emit('bag');
  };

  I.grant = function (list) {
    var got = [];
    list.forEach(function (p) { var r = I.add(p[0], p[1]); if (r.added) got.push([p[0], r.added]); });
    return got;
  };

  return I;
})();

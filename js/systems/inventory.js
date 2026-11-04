/*
 * 背包系统
 * 格子结构:可堆叠 {id, n}(每格上限 stackMax);装备 {id, uid, q, stats};特殊 {id, uid}
 */
XX.sys.inv = (function () {
  var I = {}, D = XX.data, U = XX.util, C = XX.config;
  function bag() { return XX.store.state.bag; }

  I.def = function (id) { return D.items[id]; };
  I.stackable = function (id) { var it = D.items[id]; return it && D.itemTypes[it.type].stack; };
  I.used = function () { return bag().slots.length; };
  I.free = function () { return bag().cap - bag().slots.length; };

  I.count = function (id) {
    return bag().slots.reduce(function (s, sl) { return s + (sl.id === id ? (sl.n || 1) : 0); }, 0);
  };

  /* 计算放入 n 个需要的新格子数 */
  I.slotsNeeded = function (id, n) {
    if (!I.stackable(id)) return n;
    var room = 0;
    bag().slots.forEach(function (sl) { if (sl.id === id) room += C.stackMax - sl.n; });
    return Math.max(0, Math.ceil((n - room) / C.stackMax));
  };
  I.canAdd = function (id, n) { return I.slotsNeeded(id, n) <= I.free(); };

  /* 生成装备实例 */
  I.makeEquip = function (id, q) {
    var it = D.items[id];
    q = q == null ? (it.q || 0) : q;
    var mul = D.equipQualityMul[q], stats = {};
    Object.keys(it.stats).forEach(function (k) {
      var v = it.stats[k] * mul * U.rand(0.9, 1.1);
      stats[k] = v < 1 ? Math.round(v * 1000) / 1000 : Math.round(v);
    });
    return { id: id, uid: U.uid(), q: q, stats: stats };
  };

  /* 随机品质(炼器、掉落) */
  I.rollQuality = function (base, bonus) {
    var w = D.forgeQualityWeights.slice();
    for (var i = 1; i < w.length; i++) w[i] *= 1 + (bonus || 0);
    return Math.min(5, (base || 0) + U.weighted(w));
  };

  /*
   * 加入物品,返回 {added, lost}
   * opts.q:装备品质
   */
  I.add = function (id, n, silent, opts) {
    var it = D.items[id], b = bag(), added = 0;
    if (!it) { console.warn('未知物品', id); return { added: 0, lost: n }; }
    n = n || 1;
    if (I.stackable(id)) {
      var left = n;
      b.slots.forEach(function (sl) {
        if (left > 0 && sl.id === id && sl.n < C.stackMax) {
          var put = Math.min(left, C.stackMax - sl.n); sl.n += put; left -= put;
        }
      });
      while (left > 0 && b.slots.length < b.cap) {
        var put2 = Math.min(left, C.stackMax);
        b.slots.push({ id: id, n: put2 }); left -= put2;
      }
      added = n - left;
    } else {
      for (var i = 0; i < n && b.slots.length < b.cap; i++) {
        if (it.type === 'equip') b.slots.push(I.makeEquip(id, opts && opts.q != null ? opts.q : I.rollQuality(it.q, 0)));
        else b.slots.push({ id: id, uid: U.uid() });
        added++;
      }
    }
    if (added < n && !silent) XX.ui.toast('储物袋已满,' + it.name + ' ×' + (n - added) + ' 遗失', 'warn');
    XX.bus.emit('bag');
    return { added: added, lost: n - added };
  };

  /* 移除指定数量(按物品 id) */
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
    if (sl.n && sl.n > (n || 1)) sl.n -= (n || 1);
    else b.slots.splice(idx, 1);
    XX.bus.emit('bag');
  };

  I.hasAll = function (need) {
    return Object.keys(need).every(function (k) { return I.count(k) >= need[k]; });
  };
  I.consume = function (need) { Object.keys(need).forEach(function (k) { I.remove(k, need[k]); }); };

  /* 使用物品,返回提示文字 */
  I.use = function (idx, times) {
    var s = XX.store.state, sl = s.bag.slots[idx];
    if (!sl) return null;
    var it = D.items[sl.id], u = it.use, P = XX.sys.player;
    if (!u) return '此物无法直接使用。';
    times = Math.min(times || 1, sl.n || 1);
    var msg = '';
    switch (u.kind) {
      case 'exp':
        if (P.isFull()) return '修为已满,服用无益,请先突破。';
        var total = 0;
        for (var i = 0; i < times; i++) {
          if (P.isFull()) { times = i; break; }
          total += P.addExp(Math.max(u.min || 0, Math.round(P.expNeed() * u.pct)));
        }
        msg = '服下' + it.name + (times > 1 ? ' ×' + times : '') + ',修为 +' + U.num(total);
        break;
      case 'perm':
        var cur = s.perm[u.key] || 0;
        if (cur >= u.cap - 1e-9) return '药力已达上限,无法再获增益。';
        var canTimes = Math.min(times, Math.round((u.cap - cur) / u.add));
        times = canTimes;
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
      case 'break':
        return '此丹将在冲击大境界时自动服用。';
      default:
        return '此物无法直接使用。';
    }
    I.removeAt(idx, times);
    XX.bus.emit('stats');
    return msg;
  };

  I.sell = function (idx, n) {
    var s = XX.store.state, sl = s.bag.slots[idx];
    if (!sl) return 0;
    var it = D.items[sl.id];
    n = Math.min(n || 1, sl.n || 1);
    var price = it.price * n * (sl.q != null ? D.equipQualityMul[sl.q] : 1);
    price = Math.round(price);
    s.stone += price;
    I.removeAt(idx, n);
    return price;
  };

  /* 佩戴法宝:slot 为 0~3;不传则放入第一个空位,返回 -1 表示已满需选择替换 */
  I.firstFreeTreasure = function () { return XX.store.state.equip.indexOf(null); };
  I.equip = function (idx, slot) {
    var s = XX.store.state, sl = s.bag.slots[idx];
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
    var s = XX.store.state;
    if (!s.equip[slot]) return false;
    if (I.free() <= 0) { XX.ui.toast('储物袋已满', 'warn'); return false; }
    s.bag.slots.push(s.equip[slot]); s.equip[slot] = null;
    XX.bus.emit('bag'); XX.bus.emit('stats');
    return true;
  };

  /* 整理:合并堆叠 + 排序 */
  I.sort = function () {
    var b = bag(), order = { equip: 0, special: 1, pill: 2, material: 3 };
    var counts = {}, others = [];
    b.slots.forEach(function (sl) {
      if (I.stackable(sl.id)) counts[sl.id] = (counts[sl.id] || 0) + sl.n; else others.push(sl);
    });
    var stacks = [];
    Object.keys(counts).forEach(function (id) {
      var n = counts[id];
      while (n > 0) { var p = Math.min(n, C.stackMax); stacks.push({ id: id, n: p }); n -= p; }
    });
    var all = others.concat(stacks);
    all.sort(function (a, c) {
      var A = D.items[a.id], B = D.items[c.id];
      return (order[A.type] - order[B.type]) || ((c.q != null ? c.q : B.q) - (a.q != null ? a.q : A.q)) || (a.id < c.id ? -1 : a.id > c.id ? 1 : 0);
    });
    b.slots = all;
    XX.bus.emit('bag');
  };

  /* 批量发放奖励 [[id, n], ...] -> 返回实际获得 */
  I.grant = function (list) {
    var got = [];
    list.forEach(function (p) { var r = I.add(p[0], p[1]); if (r.added) got.push([p[0], r.added]); });
    return got;
  };

  return I;
})();

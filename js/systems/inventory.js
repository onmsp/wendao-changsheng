/*
 * 背包系统
 * 格子:可堆叠 {id, n, g}(g = 品级,由图纸等级决定,1~5;同 id 同品级才叠加,每格上限 stackMax)
 *       法宝 {id, uid, q, pw, lv, bs, affixes};特殊 {id, uid}
 * 功法/技能玉简、图纸:获得时自动习得/转化,不占背包
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
  function gOf(sl) { return sl.g || 1; }

  I.slotsNeeded = function (id, n, g) {
    if (!I.stackable(id)) return n;
    var room = 0;
    g = g || 1;
    bag().slots.forEach(function (sl) { if (sl.id === id && gOf(sl) === g) room += C.stackMax - sl.n; });
    return Math.max(0, Math.ceil((n - room) / C.stackMax));
  };
  I.canAdd = function (id, n, g) {
    var it = D.items[id];
    if (it && (it.scroll || it.bpRef)) return true;
    return I.slotsNeeded(id, n, g) <= I.free();
  };

  /* ---------- 图纸 ---------- */
  I.bp = function (rid) { return (st().bp || {})[rid] || null; };
  I.bpLv = function (rid) { var b = I.bp(rid); return b ? b.lv : 0; };
  I.bpMul = function (rid) { var lv = I.bpLv(rid); return lv ? C.bpEffect[lv - 1] : 1; };
  I.bpNeed = function (lv) { return lv >= C.bpEffect.length ? 0 : C.bpExpNeed[lv - 1]; };
  /* 获得图纸:首次掌握,重复 +经验 */
  I.gainBlueprint = function (itemId, n) {
    var ref = D.items[itemId].bpRef, s = st(), msgs = [];
    s.bp = s.bp || {};
    for (var i = 0; i < n; i++) {
      var b = s.bp[ref.id];
      if (!b) { s.bp[ref.id] = { lv: 1, exp: 0 }; msgs.push('掌握' + D.items[itemId].name); XX.store.addLog('获得图纸,掌握【' + D.items[itemId].name + '】。'); continue; }
      if (b.lv >= C.bpEffect.length) { b.exp = 0; continue; }
      b.exp += C.bpExpPerDup;
      while (b.lv < C.bpEffect.length && b.exp >= I.bpNeed(b.lv)) {
        b.exp -= I.bpNeed(b.lv); b.lv++;
        msgs.push(D.items[itemId].name + ' 升至 ' + b.lv + ' 级');
        XX.store.addLog('图纸【' + D.items[itemId].name + '】升至 ' + b.lv + ' 级,成品效果 ' + U.pct(C.bpEffect[b.lv - 1], 0) + '。');
      }
    }
    return msgs;
  };

  /* ---------- 功法/技能玉简:自动习得,重复转碎片 ---------- */
  I.gainScroll = function (itemId, n) {
    var it = D.items[itemId], cat = it.scroll, sk = st().skills, msgs = [];
    var list = cat === 'gongfa' ? sk.learnedGongfa : sk.learnedShentong, lvMap = cat === 'gongfa' ? sk.gfLv : sk.stLv;
    sk.frags = sk.frags || { gongfa: {}, shentong: {} };
    for (var i = 0; i < n; i++) {
      if (list.indexOf(it.ref) < 0) {
        list.push(it.ref); lvMap[it.ref] = 1;
        var nm = (cat === 'gongfa' ? D.gongfa : D.shentong)[it.ref].name;
        msgs.push('习得' + (cat === 'gongfa' ? '功法' : '技能') + '【' + nm + '】');
        XX.store.addLog('参悟玉简,习得' + (cat === 'gongfa' ? '功法' : '技能') + '【' + nm + '】。');
      } else {
        sk.frags[cat][it.ref] = (sk.frags[cat][it.ref] || 0) + C.fragPerDup;
        msgs.push(it.name + ' → 碎片 +' + C.fragPerDup);
      }
    }
    return msgs;
  };
  I.frags = function (cat, id) { var f = st().skills.frags || {}; return (f[cat] && f[cat][id]) || 0; };
  /* 用碎片升级功法/技能 */
  I.upgradeSkill = function (cat, id) {
    var sk = st().skills, lvMap = cat === 'gongfa' ? sk.gfLv : sk.stLv, lv = lvMap[id] || 1, need = D.fragNeed(lv);
    var nm = (cat === 'gongfa' ? D.gongfa : D.shentong)[id].name;
    if (!need) return { ok: false, msg: '已达满级' };
    if (I.frags(cat, id) < need) return { ok: false, msg: '碎片不足(' + I.frags(cat, id) + '/' + need + ')' };
    sk.frags[cat][id] -= need;
    lvMap[id] = lv + 1;
    XX.store.addLog((cat === 'gongfa' ? '功法' : '技能') + '【' + nm + '】升至 ' + U.lvText(lv + 1) + '。');
    XX.bus.emit('stats');
    return { ok: true, msg: nm + ' 升至 ' + U.lvText(lv + 1) };
  };

  /* ---------- 法宝 ---------- */
  I.rollAffix = function (id, q, mul) {
    var a = D.affixes[id], v = U.rand(a.range[0], a.range[1]) * D.affixQMul[q] * (mul || 1);
    v = a.pct ? Math.round(v * 1000) / 1000 : Math.max(1, Math.round(v));
    return { id: id, v: v };
  };
  I.affixText = function (a) {
    var d = D.affixes[a.id];
    if (!d) return '';
    return d.name + ':' + d.desc.replace('{v}', d.pct ? U.pct(a.v) : a.v);
  };
  /* 生成法宝:q 品质;pw 强度基准(地图/配方);mul 图纸效果倍率 */
  I.makeEquip = function (id, q, pw, mul) {
    var it = D.items[id];
    q = U.clamp(q == null ? (it.q || 0) : q, 0, 4); pw = pw || 0; mul = mul || 1;
    var sp = it.forged ? C.specialStatMul : 1, am = it.forged ? C.specialAffixMul : 1;
    var m = D.equipQualityMul[q] * Math.pow(D.equipLevelGrow, pw) * mul * sp, bs = {};
    Object.keys(it.stats).forEach(function (k) {
      var base = it.stats[k];
      if (I.linearStat[k]) { bs[k] = Math.round(I.linearVal(base, q, pw, mul * sp) * U.rand(0.9, 1.1)); return; }
      bs[k] = base < 1 ? Math.round(base * (1 + q * 0.35) * mul * U.rand(0.9, 1.1) * 1000) / 1000 : Math.round(base * m * U.rand(0.9, 1.1));
    });
    var affixes = [];
    if (it.effects) affixes = it.effects.slice(0, C.affixCount[q]).map(function (k) { return I.rollAffix(k, q, mul * am); });
    else {
      var pool = Object.keys(D.affixes);
      while (affixes.length < C.affixCount[q]) {
        var k = U.pick(pool);
        if (!affixes.some(function (a) { return a.id === k; })) affixes.push(I.rollAffix(k, q, mul));
      }
    }
    var name = it.name;
    if (!it.forged) { var prefix = ''; D.equipTierNames.forEach(function (t) { if (pw >= t[0]) prefix = t[1]; }); name = prefix + it.name; }
    return { id: id, uid: U.uid(), q: q, pw: pw, lv: 1, name: name, bs: bs, affixes: affixes, bpm: mul };
  };
  /* 身法、神识与境界一样线性成长(避免高强度法宝的身法/神识失控) */
  I.linearStat = { spd: true, sense: true };
  I.linearVal = function (base, q, pw, mul) { return base * D.equipQualityMul[q] * (1 + 0.12 * pw) * mul; };
  /* 法宝预览:返回属性与词条的取值范围(炼器界面查看详情用) */
  I.previewEquip = function (id, q, pw, mul) {
    var it = D.items[id];
    q = q == null ? (it.q || 0) : q; mul = mul || 1;
    var sp = it.forged ? C.specialStatMul : 1, am = it.forged ? C.specialAffixMul : 1;
    var m = D.equipQualityMul[q] * Math.pow(D.equipLevelGrow, pw) * mul * sp, stats = {};
    Object.keys(it.stats).forEach(function (k) {
      var b = it.stats[k];
      if (I.linearStat[k]) { var lv = I.linearVal(b, q, pw, mul * sp); stats[k] = [Math.round(lv * 0.9), Math.round(lv * 1.1)]; return; }
      stats[k] = b < 1 ? [b * (1 + q * 0.35) * mul * 0.9, b * (1 + q * 0.35) * mul * 1.1] : [Math.round(b * m * 0.9), Math.round(b * m * 1.1)];
    });
    var affixes = (it.effects || []).slice(0, C.affixCount[q]).map(function (k) {
      var a = D.affixes[k], f = D.affixQMul[q] * mul * am;
      return { id: k, min: a.pct ? a.range[0] * f : Math.max(1, Math.round(a.range[0] * f)), max: a.pct ? a.range[1] * f : Math.max(1, Math.round(a.range[1] * f)) };
    });
    return { stats: stats, affixes: affixes, randomAffix: !it.effects, affixCount: C.affixCount[q] };
  };
  /* 法宝当前属性 = 基础属性 × 强化等级倍率 */
  I.eqStats = function (e) {
    var m = D.lvMul(e.lv || 1), o = {}, bs = e.bs || e.stats || {};
    Object.keys(bs).forEach(function (k) { o[k] = bs[k] < 1 ? Math.round(bs[k] * m * 1000) / 1000 : Math.round(bs[k] * m); });
    return o;
  };
  /* 特殊法宝 = 图纸炼制的法宝:不可强化,最多同时装备 2 件 */
  I.isSpecial = function (e) { return !!(e && D.items[e.id] && D.items[e.id].forged); };
  I.specialEquipped = function () { return st().equip.filter(function (e) { return I.isSpecial(e); }).length; };
  /* 普通法宝强化:灵石 + 强化石(副本基础掉落 30%) */
  I.enhanceCost = function (e) {
    var q = (e.q || 0) + 1, lv = e.lv || 1;
    return { stone: Math.round(100 * q * lv * (1 + (e.pw || 0) * 0.15)), qh: q * lv };
  };
  I.enhance = function (e) {
    if (I.isSpecial(e)) return { ok: false, msg: '特殊法宝无法强化,只能以更高等级图纸重新炼制' };
    if ((e.lv || 1) >= C.maxLv) return { ok: false, msg: '已达满级(★)' };
    var c = I.enhanceCost(e), s = st();
    if (s.stone < c.stone) return { ok: false, msg: '灵石不足(需 ' + U.num(c.stone) + ')' };
    if (I.count('stone_qh') < c.qh) return { ok: false, msg: '强化石不足(' + I.count('stone_qh') + '/' + c.qh + ',副本基础掉落 30%)' };
    s.stone -= c.stone; I.remove('stone_qh', c.qh);
    e.lv = (e.lv || 1) + 1;
    XX.bus.emit('stats');
    return { ok: true, msg: U.eqName(e) + ' 强化至 ' + U.lvText(e.lv) };
  };

  /* ---------- 加入/移除 ---------- */
  /* opts:法宝 {q, pw, mul};丹药 {g} */
  I.add = function (id, n, silent, opts) {
    var it = D.items[id], b = bag(), added = 0;
    if (!it) { console.warn('未知物品', id); return { added: 0, lost: n }; }
    n = n || 1;
    if (it.scroll) { var m1 = I.gainScroll(id, n); if (!silent && m1.length) XX.ui.toast(m1.join(','), 'ok'); return { added: n, lost: 0, auto: true }; }
    if (it.bpRef) { var m2 = I.gainBlueprint(id, n); if (!silent && m2.length) XX.ui.toast(m2.join(','), 'ok'); return { added: n, lost: 0, auto: true }; }
    if (I.stackable(id)) {
      var g = (opts && opts.g) || 1, left = n;
      b.slots.forEach(function (sl) {
        if (left > 0 && sl.id === id && gOf(sl) === g && sl.n < C.stackMax) { var put = Math.min(left, C.stackMax - sl.n); sl.n += put; left -= put; }
      });
      while (left > 0 && b.slots.length < b.cap) { var put2 = Math.min(left, C.stackMax); var ns = { id: id, n: put2 }; if (g > 1) ns.g = g; b.slots.push(ns); left -= put2; }
      added = n - left;
    } else {
      for (var i = 0; i < n && b.slots.length < b.cap; i++) {
        if (it.type === 'equip') b.slots.push(I.makeEquip(id, opts && opts.q, opts && opts.pw, opts && opts.mul));
        else b.slots.push({ id: id, uid: U.uid() });
        added++;
      }
    }
    if (added < n && !silent) XX.ui.toast('储物袋已满,' + it.name + ' ×' + (n - added) + ' 遗失', 'warn');
    XX.bus.emit('bag');
    return { added: added, lost: n - added };
  };
  I.addInstance = function (eq) {
    if (I.free() <= 0) { XX.ui.toast('储物袋已满,' + eq.name + ' 遗失', 'warn'); return false; }
    bag().slots.push(eq); XX.bus.emit('bag'); return true;
  };
  /* 移除:优先消耗低品级 */
  I.remove = function (id, n) {
    var b = bag(), left = n;
    var idx = b.slots.map(function (sl, i) { return i; }).filter(function (i) { return b.slots[i].id === id; })
      .sort(function (x, y) { return gOf(b.slots[x]) - gOf(b.slots[y]) || y - x; });
    var del = [];
    idx.forEach(function (i) {
      if (left <= 0) return;
      var sl = b.slots[i], take = Math.min(left, sl.n || 1);
      if (sl.n) sl.n -= take;
      if (!sl.n || sl.n <= 0) del.push(i);
      left -= take;
    });
    del.sort(function (x, y) { return y - x; }).forEach(function (i) { b.slots.splice(i, 1); });
    XX.bus.emit('bag');
    return n - left;
  };
  /* 按品级移除 */
  I.removeG = function (id, n, g) {
    var b = bag(), left = n;
    for (var i = b.slots.length - 1; i >= 0 && left > 0; i--) {
      var sl = b.slots[i];
      if (sl.id !== id || gOf(sl) !== g) continue;
      var take = Math.min(left, sl.n || 1);
      sl.n = (sl.n || 1) - take; left -= take;
      if (sl.n <= 0) b.slots.splice(i, 1);
    }
    XX.bus.emit('bag');
    return n - left;
  };
  I.countG = function (id, g) { return bag().slots.reduce(function (s, sl) { return s + (sl.id === id && gOf(sl) === g ? (sl.n || 1) : 0); }, 0); };
  I.removeAt = function (idx, n) {
    var b = bag(), sl = b.slots[idx];
    if (!sl) return;
    if (sl.n && sl.n > (n || 1)) sl.n -= (n || 1); else b.slots.splice(idx, 1);
    XX.bus.emit('bag');
  };
  I.hasAll = function (need, times) { times = times || 1; return Object.keys(need).every(function (k) { return I.count(k) >= need[k] * times; }); };
  I.consume = function (need, times) { times = times || 1; Object.keys(need).forEach(function (k) { I.remove(k, need[k] * times); }); };
  I.maxTimes = function (need) { return Object.keys(need).reduce(function (m, k) { return Math.min(m, Math.floor(I.count(k) / need[k])); }, 9999); };

  /* 品级倍率(丹药效果) */
  I.gMul = function (sl) { return C.bpEffect[gOf(sl) - 1] || 1; };

  /* ---------- 使用 ---------- */
  I.use = function (idx, times) {
    var s = st(), sl = s.bag.slots[idx];
    if (!sl) return null;
    var it = D.items[sl.id], u = it.use, P = XX.sys.player, gm = I.gMul(sl);
    if (!u) return '此物无法直接使用。';
    times = Math.min(times || 1, sl.n || 1);
    var msg = '';
    switch (u.kind) {
      case 'exp':
        var total = 0;
        for (var i = 0; i < times; i++) total += P.addExp(u.amount * gm);
        msg = '服下' + it.name + (times > 1 ? ' ×' + times : '') + ',修为 +' + U.exp(total);
        break;
      case 'perm':
        var cur = s.perm[u.key] || 0, add = u.add >= 1 ? Math.round(u.add * gm) : Math.round(u.add * gm * 1000) / 1000;
        if (cur >= u.cap - 1e-9) return '药力已达上限,无法再获增益。';
        times = Math.max(1, Math.min(times, Math.ceil((u.cap - cur) / add)));
        s.perm[u.key] = Math.min(u.cap, Math.round((cur + add * times) * 1000) / 1000);
        var labels = { hpPct: '气血', comprehension: '悟性', rateBonus: '修炼速度', luck: '气运' };
        msg = it.name + '生效,' + labels[u.key] + ' 永久 +' + (u.add >= 1 ? s.perm[u.key] - cur : U.pct(s.perm[u.key] - cur));
        break;
      case 'attr':
        s.attrUsed = s.attrUsed || {};
        var acap = P.attrCap(), aused = s.attrUsed[sl.id] || 0;
        if (aused >= acap) return it.name + '累计已服用 ' + aused + ' 颗,达到上限 ' + acap + '(突破大境界后提升)。';
        times = Math.min(times, acap - aused);
        var av = Math.round(u.v * gm * times * 10000) / 10000;
        s.perm[u.key] = Math.round(((s.perm[u.key] || 0) + av) * 10000) / 10000;
        s.attrUsed[sl.id] = aused + times;
        msg = '服下' + it.name + (times > 1 ? ' ×' + times : '') + ',' + D.attrPills[sl.id].label + ' 永久 +' + U.pct(av, 1) + '(' + s.attrUsed[sl.id] + '/' + acap + ')';
        break;
      case 'bag':
        var bmax = P.bagMax();
        if (s.bag.cap >= bmax) return '储物袋已达当前境界上限 ' + bmax + ' 格' + (P.realm().major < 4 ? '(元婴之后每个大境界上限 +50)' : '') + '。';
        s.bag.cap = Math.min(bmax, s.bag.cap + u.add); times = 1;
        msg = '储物袋容量扩展,当前 ' + s.bag.cap + ' / ' + bmax + ' 格';
        break;
      case 'timed':
        s.timed = s.timed || {};
        var v = Math.round(u.v * gm * 1000) / 1000, cur2 = s.timed[u.key], now2 = Date.now();
        if (cur2 && cur2.until > now2 && cur2.v > v) return '已有更强的同类药力在身,无需服用。';
        var from = cur2 && cur2.until > now2 && cur2.v === v ? cur2.until : now2;
        s.timed[u.key] = { v: v, until: from + u.min * 60000 * times };
        msg = '服下' + it.name + (times > 1 ? ' ×' + times : '') + ',' + U.timeCN(u.min * 60 * times) + '内' + { rate: '修炼速度', atk: '攻击', def: '防御' }[u.key] + ' +' + U.pct(v, 0);
        break;
      case 'stone':
        var sv = u.base * (P.realm().major + 1);
        s.stone += sv; times = 1;
        msg = '打开灵石袋,获得灵石 ×' + U.num(sv);
        break;
      case 'rootProg':
        var cap = 5 - gOf(sl), grade = P.rootGrade();
        if (grade <= 0) return '你已是天灵根,无需洗灵。';
        if (grade <= cap) return '此洗灵液(' + gOf(sl) + ' 级丹方所炼)最多只能将灵根洗至' + D.roots.filter(function (r) { return r.grade === cap; })[0].name + ',需更高等级丹方。';
        var used = 0;
        for (var j = 0; j < times; j++) {
          s.rootProg = (s.rootProg || 0) + C.rootProgPerUse; used++;
          if (s.rootProg >= 1 - 1e-9) {
            s.rootProg = 0;
            var ri = D.roots.findIndex(function (r) { return r.id === s.root; });
            s.root = D.roots[ri + 1].id;
            msg = '洗筋伐髓,灵根蜕变为【' + D.roots[ri + 1].name + '】!';
            XX.store.addLog(msg);
            break;
          }
        }
        times = used;
        if (!msg) msg = '灵根转化度 +' + U.pct(C.rootProgPerUse * used, 0) + ',当前 ' + U.pct(s.rootProg, 0);
        break;
      case 'break':
        return '突破丹需在人物页点击「突破」时选择服用(仅限' + D.realmMajors[u.major].name + '期)。';
      default:
        return '此物无法直接使用。';
    }
    I.removeAt(idx, times);
    XX.bus.emit('stats');
    return msg;
  };

  I.price = function (sl) {
    var it = D.items[sl.id];
    if (it.type === 'equip') return Math.round(it.price * D.equipQualityMul[sl.q || 0] * (1 + (sl.pw || 0) * 0.25) * D.lvMul(sl.lv || 1));
    return Math.round(it.price * I.gMul(sl));
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

  I.firstFreeTreasure = function () { return st().equip.indexOf(null); };
  I.equip = function (idx, slot) {
    var s = st(), sl = s.bag.slots[idx];
    if (!sl || D.items[sl.id].type !== 'equip') return false;
    if (slot == null) slot = I.firstFreeTreasure();
    if (slot < 0) return false;
    var old = s.equip[slot];
    if (I.isSpecial(sl) && !I.isSpecial(old) && I.specialEquipped() >= C.specialTreasureMax) {
      XX.ui.toast('特殊法宝最多同时装备 ' + C.specialTreasureMax + ' 件', 'warn'); return false;
    }
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
    b.slots.forEach(function (sl) {
      if (I.stackable(sl.id)) { var k = sl.id + '|' + gOf(sl); counts[k] = (counts[k] || 0) + sl.n; } else others.push(sl);
    });
    var stacks = [];
    Object.keys(counts).forEach(function (k) {
      var parts = k.split('|'), id = parts[0], g = +parts[1], n = counts[k];
      while (n > 0) { var p = Math.min(n, C.stackMax); var ns = { id: id, n: p }; if (g > 1) ns.g = g; stacks.push(ns); n -= p; }
    });
    var all = others.concat(stacks);
    all.sort(function (a, c) {
      var A = D.items[a.id], B = D.items[c.id];
      return (order[A.type] - order[B.type]) || ((c.q != null ? c.q : D.qOf(c.id, c.g)) - (a.q != null ? a.q : D.qOf(a.id, a.g))) || (gOf(c) - gOf(a)) || ((c.lv || 0) - (a.lv || 0)) || (a.id < c.id ? -1 : a.id > c.id ? 1 : 0);
    });
    b.slots = all;
    XX.bus.emit('bag');
  };

  I.grant = function (list) {
    var got = [];
    list.forEach(function (p) { var r = I.add(p[0], p[1], false, p[2]); if (r.added) got.push([p[0], r.added, p[2] && p[2].g]); });
    return got;
  };

  return I;
})();

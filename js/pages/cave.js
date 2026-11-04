/* 洞府页面:阵法 / 炼丹 / 炼器 / 灵田 / 灵矿(设施上限 10 级;1~5 级灵石+玄铁,6~10 级灵石+玄铁精+仙玉) */
XX.pages.cave = (function () {
  var U = XX.util, D = XX.data, C = XX.config, PG = {}, tab = 'array', root = null;
  var TABS = [
    { id: 'array', name: '阵法', icon: 'icon/array' },
    { id: 'alchemy', name: '炼丹', icon: 'icon/alchemy' },
    { id: 'forge', name: '炼器', icon: 'icon/forge' },
    { id: 'field', name: '灵田', icon: 'icon/field' },
    { id: 'mine', name: '灵矿', icon: 'icon/mine' }
  ];
  function K() { return XX.sys.cave; }
  function I() { return XX.sys.inv; }
  function st() { return XX.store.state; }
  function res(r) { if (r && r.msg) XX.ui.toast(r.msg, r.ok ? 'ok' : 'warn'); PG.draw(); }
  /* 品质只用颜色表示:彩色小点 */
  function dot(q) { return '<i class="qdot" style="--qc:' + U.qColor(q) + '"></i>'; }
  function tierDots(lv) { var q = D.tierByLv(lv), h = ''; for (var i = 0; i <= q; i++) h += dot(i); return h; }
  function bpTag(rid) {
    var b = I().bp(rid);
    if (!b) return '';
    var need = I().bpNeed(b.lv);
    return '<span class="bp-tag" title="图纸等级">图纸 ' + b.lv + ' 级 · ' + U.pct(C.bpEffect[b.lv - 1], 0) + (need ? ' <em>' + b.exp + '/' + need + '</em>' : '') + '</span>';
  }

  PG.render = function (el) {
    root = el;
    el.innerHTML = '<div class="icon-tabs" id="cv-tabs">' + TABS.map(function (t) {
      return '<button data-t="' + t.id + '"' + (t.id === tab ? ' class="on"' : '') + '><img src="' + U.img(t.icon) + '" alt=""><span>' + t.name + '</span></button>';
    }).join('') + '</div><div id="cv-body"></div>';
    U.$('#cv-tabs').onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      tab = b.dataset.t;
      U.$$('#cv-tabs button').forEach(function (x) { x.classList.toggle('on', x === b); });
      PG.draw();
    };
    U.$('#cv-body').onclick = PG.onClick;
    PG.draw();
  };

  PG.draw = function () {
    if (!root) return;
    U.$('#cv-body').innerHTML = PG['draw_' + tab]();
    PG.update();
  };

  function pips(lv) {
    return '<div class="lv-pips">' + Array.apply(null, Array(C.caveMaxLv)).map(function (_, i) { return '<i class="' + (i < lv ? 'on' : '') + (i >= 5 ? ' jade' : '') + '"></i>'; }).join('') + '</div>';
  }
  /* 设施升级卡片 */
  function facilityCard(key, effectNow, effectNext) {
    var f = D.facilities[key], lv = K().lv(key), max = lv >= C.caveMaxLv, c = max ? null : K().facilityCost(key);
    return '<div class="card fac-card"><img class="fac-img" src="' + U.img(f.icon) + '" alt="">' +
      '<div class="rc-main"><b>' + f.name + ' <em class="lv">' + (max ? '★' : 'Lv.' + lv + ' / ' + C.caveMaxLv) + '</em></b>' + pips(lv) +
      '<div class="small">' + effectNow + '</div>' + (max ? '' : '<div class="muted small">下一级:' + effectNext + '</div>') +
      (max ? '' : '<div class="cost-line">' + K().costText(c) + '</div>') + '</div>' +
      '<button class="btn small primary up-btn" data-act="fac" data-k="' + key + '"' + (max || !K().canPay(c) ? ' disabled' : '') + '>' + (max ? '满级' : '升级') + '</button></div>';
  }

  /* ---------- 阵法 ---------- */
  function effText(eff) { return Object.keys(eff).map(function (k) { return D.arrayEffectName[k] + ' +' + U.pct(eff[k], 1); }).join(' · '); }
  PG.draw_array = function () {
    var P = XX.sys.player;
    return '<p class="section-tip">阵法需持有阵图方可布置;每升 1 级效果 +20%,满 10 级为 ★。阵图等级越高效果越强。</p>' + D.arrays.map(function (a) {
      var lv = P.arrayLv(a.id), has = I().bpLv(a.id) > 0, max = lv >= C.maxLv, c = max || !has ? null : K().arrayCost(a.id);
      var now = lv ? K().arrayValue(a, lv) : null, next = max ? null : K().arrayValue(a, lv + 1);
      return '<div class="card row-card arr-card' + (has ? '' : ' locked') + '" style="--qc:' + U.qColor(a.q) + '"><div class="rc-icon"><img src="' + U.img(a.icon) + '"' + (a.hue ? ' style="filter:hue-rotate(' + a.hue + 'deg)"' : '') + ' alt=""></div>' +
        '<div class="rc-main"><b style="color:' + U.qColor(a.q) + '">' + a.name + ' <em class="lv">' + (lv ? U.lvText(lv) : '未布置') + '</em></b>' +
        (has ? bpTag(a.id) : '<span class="danger small">需【' + D.items[a.bpId].name + '】</span>') +
        '<div class="small">' + (lv ? '当前:<span class="ok">' + effText(now) + '</span>' : '<span class="muted">' + a.desc + '</span>') + '</div>' +
        (next && has ? '<div class="muted small">' + (lv ? '下一级:' : '布置后:') + effText(next) + '</div>' : '') +
        (c ? '<div class="cost-line">' + K().costText(c) + '</div>' : '') + '</div>' +
        '<button class="btn small primary up-btn" data-act="arr" data-id="' + a.id + '"' + (max || !has || !K().canPay(c) ? ' disabled' : '') + '>' + (max ? '★' : lv ? '升级' : '布置') + '</button></div>';
    }).join('');
  };

  /* ---------- 炼丹 / 炼器 ---------- */
  function craftPanel(kind) {
    var p = K().craftProgress(kind), F = D.facilities[kind], lv = K().lv(kind);
    var fac = facilityCard(kind, '可炼品质:' + tierDots(lv) + (kind === 'alchemy' ? ' · 成丹率 +' + lv + '%' : ''),
      '可炼品质:' + tierDots(lv + 1) + (kind === 'alchemy' ? ' · 成丹率 +' + (lv + 1) + '%' : ''));
    var head = '<div class="card furnace ' + kind + '"><img class="furnace-img' + (p ? ' working' : '') + '" src="' + U.img(F.icon) + '" alt="">';
    if (!p) head += '<div class="fz-main"><b>' + F.name + '空闲</b><div class="muted small">' + (kind === 'alchemy' ? '持有丹方即可炼制;丹方等级越高药效越强,可一次批量炼制多炉' : '持有器图即可炼制;器图等级越高法宝越强') + '</div></div></div>';
    else head += '<div class="fz-main"><b>正在炼制:' + p.recipe.name + ((p.job.n || 1) > 1 ? ' ×' + p.job.n + ' 炉' : '') + '</b><div data-prog="' + kind + '"></div></div>' +
      '<button class="btn small primary" data-act="collect" data-k="' + kind + '" data-ready="' + kind + '">收取</button></div>';
    var list = K().recipes(kind).map(function (r) {
      var known = K().known(kind, r), lvOk = K().lvOk(kind, r), lock = st().realm < r.reqRealm, enough = I().hasAll(r.need) && st().stone >= r.stone;
      var mats = Object.keys(r.need).map(function (id) {
        var have = I().count(id), ok = have >= r.need[id];
        return '<span class="mat' + (ok ? '' : ' lack') + '" data-act="iteminfo" data-id="' + id + '">' + U.itemIcon(id, 'xs') + D.items[id].name + ' ' + have + '/' + r.need[id] + '</span>';
      }).join('');
      var outName = U.itemName(r.out[0]) + (r.special ? ' <span class="sp-tag">特殊</span>' : '') + (r.out[2] > 1 ? ' <span class="muted small">×' + r.out[1] + '~' + r.out[2] + '/炉</span>' : '');
      var reasons = [];
      if (!known) reasons.push('<span class="danger">需【' + D.items[r.bpId].name + '】</span>');
      if (!lvOk) reasons.push('<span class="danger">需' + F.name + ' ' + K().needLv(kind, r) + ' 级</span>');
      if (lock) reasons.push('<span class="danger">需 ' + D.realms[r.reqRealm].name + '</span>');
      var off = lock || !known || !lvOk;
      return '<div class="card recipe' + (off ? ' locked' : '') + '"><div class="rc-icon" data-act="iteminfo" data-id="' + r.out[0] + '">' + U.itemIcon(r.out[0]) + '</div>' +
        '<div class="rc-main"><b>' + outName + '</b>' + bpTag(r.id) +
        '<div class="mats">' + mats + '<span class="mat' + (st().stone >= r.stone ? '' : ' lack') + '"><img class="ci" src="' + U.img('icon/lingshi') + '">' + U.num(r.stone) + '</span></div>' +
        '<div class="muted small">耗时 ' + U.timeCN(r.time) + ' · 成功率 ' + U.pct(K().successRate(kind, r), 0) + (reasons.length ? ' · ' + reasons.join(' ') : '') + '</div></div>' +
        '<button class="btn small primary" data-act="craft" data-k="' + kind + '" data-id="' + r.id + '"' + (off || !enough || p ? ' disabled' : '') + '>' + (kind === 'alchemy' ? '开炉' : '炼制') + '</button></div>';
    }).join('');
    return fac + head + list;
  }
  PG.draw_alchemy = function () { return craftPanel('alchemy'); };
  PG.draw_forge = function () { return '<p class="section-tip">法宝品质由器图决定:白/绿/蓝 1 种效果,紫/金 2 种效果;炼成后可在背包中强化至 10 级(★)。</p>' + craftPanel('forge'); };

  /* 批量开炉 */
  PG.batchCraft = function (rid) {
    var r = K().recipe('alchemy', rid), max = K().maxBatch('alchemy', r), n = Math.min(max, 1);
    if (max < 1) { XX.ui.toast('材料或灵石不足', 'warn'); return; }
    function body() {
      return '<div class="batch"><div class="batch-out">' + U.itemIcon(r.out[0], 'lg', null, { g: I().bpLv(r.id) }) + '<div><b>' + U.itemName(r.out[0]) + '</b><div class="muted small">每炉产出 ' + r.out[1] + '~' + r.out[2] + ' · 成功率 ' + U.pct(K().successRate('alchemy', r), 0) + ' · 药效 ' + U.pct(I().bpMul(r.id), 0) + '</div></div></div>' +
        '<div class="batch-ctrl"><button class="btn small" data-d="-10">-10</button><button class="btn small" data-d="-1">-1</button><b class="batch-n">' + n + '</b><button class="btn small" data-d="1">+1</button><button class="btn small" data-d="10">+10</button><button class="btn small" data-d="max">最大</button></div>' +
        '<div class="muted small center">最多可炼 ' + max + ' 炉</div>' +
        '<div class="batch-cost">' + Object.keys(r.need).map(function (id) { return '<span class="mat">' + U.itemIcon(id, 'xs') + D.items[id].name + ' ×' + r.need[id] * n + '</span>'; }).join('') +
        '<span class="mat"><img class="ci" src="' + U.img('icon/lingshi') + '">' + U.num(r.stone * n) + '</span></div>' +
        '<div class="center small">总耗时 <b class="ok">' + U.timeCN(K().batchTime(r, n)) + '</b>(批量越多越省时)</div></div>';
    }
    XX.ui.modal({
      title: '批量炼丹', html: '<div id="batch-box">' + body() + '</div>',
      buttons: [{ text: '取消' }, { text: '开炉', cls: 'primary', onClick: function () { res(K().startCraft('alchemy', rid, n)); } }],
      onOpen: function (w) {
        U.$('#batch-box', w).onclick = function (e) {
          var b = e.target.closest('[data-d]'); if (!b) return;
          n = b.dataset.d === 'max' ? max : U.clamp(n + (+b.dataset.d), 1, max);
          U.$('#batch-box', w).innerHTML = body();
        };
      }
    });
  };

  /* ---------- 灵田:三个灵种按顺序自动播种,成熟自动收获 ---------- */
  PG.draw_field = function () {
    var f = st().cave.field, lv = K().lv('field'), plots = K().plots(), q = K().queue();
    var speed = XX.sys.player.arrayEff('fieldSpeed') + lv * D.field.speedPerLv;
    var html = facilityCard('field', plots + ' 块地 · 可种 ' + tierDots(lv) + ' · 生长 +' + U.pct(speed, 0),
      Math.min(D.field.maxPlots, D.field.basePlots + lv + 1) + ' 块地 · 可种 ' + tierDots(lv + 1)) +
      '<div class="card"><div class="card-title">播种顺序<span class="muted small">按 1→2→3 优先自动播种,成熟自动收获</span></div><div class="queue-row">' +
      q.map(function (sd, i) {
        return '<button class="queue-slot" data-act="queue" data-i="' + i + '"><em>' + (i + 1) + '</em>' +
          (sd ? U.itemIcon(sd, 'sm') + '<span>' + D.items[sd].name + '</span><small>×' + I().count(sd) + '</small>' : '<div class="item-icon sm empty"></div><span class="muted">未设置</span>') + '</button>';
      }).join('') + '</div></div><div class="field-grid">';
    for (var i = 0; i < D.field.maxPlots; i++) {
      var p = f.plots[i];
      if (i >= plots) html += '<div class="plot locked"><span>灵田 ' + (i - D.field.basePlots + 1) + ' 级开垦</span></div>';
      else if (!p) html += '<div class="plot empty"><span>' + (K().nextSeed() ? '待播种' : '缺少灵种') + '</span></div>';
      else {
        var crop = K().crop(p.seed);
        html += '<div class="plot grow">' + U.itemIcon(crop.out, 'sm') + '<div class="plot-name">' + D.items[crop.out].name + '</div><div data-plot="' + i + '"></div></div>';
      }
    }
    return html + '</div><p class="muted small center">收获时有 ' + U.pct(D.field.seedReturnChance, 0) + ' 概率返还灵种 · 背包满时暂停收获</p>';
  };

  /* ---------- 灵矿 ---------- */
  PG.draw_mine = function () {
    var lv = K().lv('mine'), next = Math.min(C.caveMaxLv, lv + 1);
    var ores = D.mine.ores.map(function (o) {
      return '<span class="mat' + (lv >= o.minLv ? '' : ' lack') + '" data-act="iteminfo" data-id="' + o.id + '">' + U.itemIcon(o.id, 'xs') + D.items[o.id].name + (lv >= o.minLv ? '' : '(' + o.minLv + '级)') + '</span>';
    }).join('');
    var nextOre = D.mine.ores.filter(function (o) { return o.minLv === next && next > lv; })[0];
    return facilityCard('mine', '产出 <span class="ok">' + U.num(K().minePerMin()) + '</span> 灵石/分钟', D.mine.stonePerMin[next] + ' 灵石/分钟' + (nextOre ? ',解锁' + D.items[nextOre.id].name : '')) +
      '<div class="card"><div class="card-title">矿脉储量<span class="muted small">上限 ' + D.mine.capMinutes / 60 + ' 小时产出</span></div><div data-mine="1"></div>' +
      '<div class="mats" style="margin:8px 0">伴生矿:' + ores + '</div>' +
      '<div class="btn-row"><button class="btn primary" data-act="mineCollect">收取</button></div></div>';
  };

  /* 每 0.5 秒刷新进度 */
  PG.update = function () {
    if (!root) return;
    ['alchemy', 'forge'].forEach(function (k) {
      var el = U.$('[data-prog="' + k + '"]');
      if (!el) return;
      var p = K().craftProgress(k);
      if (!p) return;
      el.innerHTML = U.bar(p.ratio, 'craft', p.ratio >= 1 ? '已完成' : '剩余 ' + U.time(p.left));
      var b = U.$('[data-ready="' + k + '"]');
      if (b) { b.disabled = p.ratio < 1; b.classList.toggle('glow', p.ratio >= 1); }
    });
    var redraw = false;
    U.$$('[data-plot]').forEach(function (el) {
      var p = st().cave.field.plots[+el.dataset.plot];
      if (!p) { redraw = true; return; }
      var r = U.clamp((Date.now() - p.start) / (p.end - p.start), 0, 1);
      el.innerHTML = U.bar(r, 'grow', U.time((p.end - Date.now()) / 1000));
      if (r >= 1) redraw = true;
    });
    if (redraw && tab === 'field') { PG._fr = (PG._fr || 0) + 1; if (PG._fr % 4 === 0) PG.draw(); }
    var mEl = U.$('[data-mine]');
    if (mEl) {
      var mp = K().minePending();
      mEl.innerHTML = U.bar(mp.mins / D.mine.capMinutes, 'mine', U.num(mp.stone) + ' 灵石' + (mp.full ? '(已满)' : ''));
    }
  };

  PG.onClick = function (e) {
    var b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
    var act = b.dataset.act;
    if (act === 'arr') res(K().upgradeArray(b.dataset.id));
    else if (act === 'fac') {
      var key = b.dataset.k, c = K().facilityCost(key), f = D.facilities[key];
      XX.ui.confirm('升级' + f.name, '<p class="center">将' + f.name + '升至 <b>' + (K().lv(key) + 1) + '</b> 级<br>消耗 ' + K().costText(c) + '</p><p class="muted small">' + f.desc + '</p>', function () { res(K().upgradeFacility(key)); }, '升级');
    } else if (act === 'craft') { if (b.dataset.k === 'alchemy') PG.batchCraft(b.dataset.id); else res(K().startCraft('forge', b.dataset.id)); }
    else if (act === 'collect') {
      var cr = K().collectCraft(b.dataset.k);
      if (cr.eq) XX.ui.modal({ title: '神兵出炉', html: XX.ui.equipDetail(cr.eq) }); else XX.ui.toast(cr.msg, cr.ok ? 'ok' : 'warn');
      PG.draw();
    }
    else if (act === 'iteminfo') XX.ui.modal({ title: '物品详情', html: XX.ui.itemInfo(b.dataset.id) });
    else if (act === 'queue') PG.chooseSeed(+b.dataset.i);
    else if (act === 'mineCollect') {
      var m = K().mineCollect();
      if (!m.ok) XX.ui.toast(m.msg);
      else XX.ui.modal({ title: '灵矿收获', html: XX.ui.rewardList(m.got, [{ icon: 'icon/lingshi', text: '灵石 ×' + U.num(m.stone) }]) });
      PG.draw();
    }
  };

  /* 设置播种顺序第 i 位 */
  PG.chooseSeed = function (i) {
    var q = K().queue();
    var html = '<div class="seed-list">' + D.field.crops.map(function (c) {
      var have = I().count(c.seed), ok = K().cropOk(c);
      return '<button class="seed' + (ok ? '' : ' off') + (q[i] === c.seed ? ' on' : '') + '" data-seed="' + c.seed + '">' + U.itemIcon(c.seed) +
        '<div><b>' + U.itemName(c.seed) + '</b> <span class="muted">×' + have + '</span><div class="muted small">' +
        (!ok ? '需灵田 ' + D.lvForTier(c.q) + ' 级' : '成熟 ' + U.timeCN(K().growTime(c)) + ' · 产出 ' + D.items[c.out].name + ' ' + c.yield[0] + '~' + c.yield[1]) + '</div></div></button>';
    }).join('') + '</div><p class="muted small">灵种可在历练中获得,或于商城购买。</p>';
    XX.ui.modal({
      title: '播种顺序 · 第 ' + (i + 1) + ' 位', html: html,
      buttons: [{ text: '清空此位', onClick: function () { q[i] = null; PG.draw(); } }, { text: '关闭' }],
      onOpen: function (w, close) {
        U.$('.seed-list', w).onclick = function (e) {
          var s = e.target.closest('.seed'); if (!s || s.classList.contains('off')) return;
          var other = q.indexOf(s.dataset.seed);
          if (other >= 0) q[other] = q[i];
          q[i] = s.dataset.seed;
          K().autoField();
          close(); PG.draw();
        };
      }
    });
  };

  PG.destroy = function () { root = null; };
  return PG;
})();

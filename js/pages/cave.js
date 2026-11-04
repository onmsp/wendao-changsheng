/* 洞府页面:阵法 / 炼丹 / 炼器 / 灵田 / 灵矿(所有设施可升级,上限 10 级,6 级起需仙玉) */
XX.pages.cave = (function () {
  var U = XX.util, D = XX.data, C = XX.config, PG = {}, tab = 'array', root = null;
  var TABS = [
    { id: 'array', name: '阵法', icon: 'icon/array' },
    { id: 'alchemy', name: '炼丹', icon: 'icon/alchemy' },
    { id: 'forge', name: '炼器', icon: 'icon/forge' },
    { id: 'field', name: '灵田', icon: 'icon/field' },
    { id: 'mine', name: '灵矿', icon: 'icon/mine' }
  ];
  var TIER = ['白', '绿', '蓝', '紫', '金'];
  function K() { return XX.sys.cave; }
  function st() { return XX.store.state; }
  function res(r) { if (r && r.msg) XX.ui.toast(r.msg, r.ok ? 'ok' : 'warn'); PG.draw(); }
  function tierTag(q) { return '<span class="tier-tag" style="--qc:' + U.qColor(q) + '">' + TIER[q] + '</span>'; }

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

  /* 设施升级卡片 */
  function facilityCard(key, effectNow, effectNext) {
    var f = D.facilities[key], lv = K().lv(key), max = lv >= C.caveMaxLv, c = K().facilityCost(key);
    return '<div class="card fac-card"><img class="fac-img" src="' + U.img(f.icon) + '" alt="">' +
      '<div class="rc-main"><b>' + f.name + ' <em class="lv">Lv.' + lv + ' / ' + C.caveMaxLv + '</em></b>' +
      '<div class="lv-pips">' + Array.apply(null, Array(C.caveMaxLv)).map(function (_, i) { return '<i class="' + (i < lv ? 'on' : '') + (i >= 5 ? ' jade' : '') + '"></i>'; }).join('') + '</div>' +
      '<div class="small">' + effectNow + '</div>' + (max ? '' : '<div class="muted small">下一级:' + effectNext + '</div>') + '</div>' +
      '<button class="btn small primary up-btn" data-act="fac" data-k="' + key + '"' + (max || !K().canPay(c) ? ' disabled' : '') + '>' +
      (max ? '已满级' : '升级<small>' + K().costText(c) + '</small>') + '</button></div>';
  }
  function tierRange(lv) { var q = D.tierByLv(lv); return TIER.slice(0, q + 1).join(''); }

  /* ---------- 阵法 ---------- */
  PG.draw_array = function () {
    var P = XX.sys.player;
    return '<p class="section-tip">阵法可永久提升自身与洞府之力,上限 ' + C.caveMaxLv + ' 级,6 级起升级需消耗仙玉。</p>' + D.arrays.map(function (a) {
      var lv = P.arrayLv(a.id), max = lv >= C.caveMaxLv, c = K().arrayCost(a.id);
      return '<div class="card row-card"><div class="rc-icon"><img src="' + U.img(a.icon) + '"' + (a.hue ? ' style="filter:hue-rotate(' + a.hue + 'deg)"' : '') + ' alt=""></div>' +
        '<div class="rc-main"><b>' + a.name + ' <em class="lv">Lv.' + lv + '</em></b><div class="muted small">' + a.desc + '</div>' +
        '<div class="small">当前:<span class="ok">+' + U.pct(a.per * lv, 0) + '</span>' + (max ? '' : ' → 下级 +' + U.pct(a.per * (lv + 1), 0)) + '</div></div>' +
        '<button class="btn small primary up-btn" data-act="arr" data-id="' + a.id + '"' + (max || !K().canPay(c) ? ' disabled' : '') + '>' +
        (max ? '圆满' : '升级<small>' + K().costText(c) + '</small>') + '</button></div>';
    }).join('');
  };

  /* ---------- 炼丹 / 炼器 ---------- */
  function craftPanel(kind) {
    var p = K().craftProgress(kind), F = D.facilities[kind], lv = K().lv(kind);
    var fac = kind === 'alchemy'
      ? facilityCard('alchemy', '可炼丹药:' + tierRange(lv) + ' · 成丹率 +' + lv + '%', '可炼 ' + tierRange(lv + 1) + ' · 成丹率 +' + (lv + 1) + '%')
      : facilityCard('forge', '可炼阶位:' + (D.tierByLv(lv) ? '1~' + D.tierByLv(lv) + ' 阶' : '无(3 级解锁)') + ' · 出金率 ' + U.pct(K().goldChance(), 0), '出金率 +2%' + (D.tierByLv(lv + 1) > D.tierByLv(lv) ? ',解锁 ' + D.tierByLv(lv + 1) + ' 阶器方' : ''));
    var head = '<div class="card furnace ' + kind + '"><img class="furnace-img' + (p ? ' working' : '') + '" src="' + U.img(F.icon) + '" alt="">';
    if (!p) head += '<div class="fz-main"><b>' + F.name + '空闲</b><div class="muted small">' + (kind === 'alchemy' ? '蓝色及以上、特殊丹药需先参悟丹方;可一次批量炼制多炉' : '炼器只炼特殊法宝,需先参悟对应图纸') + '</div></div></div>';
    else head += '<div class="fz-main"><b>正在炼制:' + p.recipe.name + ((p.job.n || 1) > 1 ? ' ×' + p.job.n + ' 炉' : '') + '</b><div data-prog="' + kind + '"></div></div>' +
      '<button class="btn small primary" data-act="collect" data-k="' + kind + '" data-ready="' + kind + '">收取</button></div>';
    var list = K().recipes(kind).map(function (r) {
      var known = K().known(kind, r), lvOk = K().lvOk(kind, r), lock = st().realm < r.reqRealm, enough = XX.sys.inv.hasAll(r.need) && st().stone >= r.stone;
      var mats = Object.keys(r.need).map(function (id) {
        var have = XX.sys.inv.count(id), ok = have >= r.need[id];
        return '<span class="mat' + (ok ? '' : ' lack') + '" data-act="iteminfo" data-id="' + id + '">' + U.itemIcon(id, 'xs') + D.items[id].name + ' ' + have + '/' + r.need[id] + '</span>';
      }).join('');
      var q = kind === 'forge' ? 3 : r.q;
      var outName = kind === 'forge' ? '<span style="color:' + U.qColor(3) + '">' + D.items[r.out[0]].name + '</span> <span class="muted small">' + r.tier + '阶 · 紫/金 · ' + r.lv + '级</span>' :
        tierTag(r.q) + U.itemName(r.out[0]) + (r.special ? ' <span class="sp-tag">特殊</span>' : '') + (r.out[2] > 1 ? ' <span class="muted small">×' + r.out[1] + '~' + r.out[2] + '/炉</span>' : '');
      var reasons = [];
      if (!known) reasons.push('<span class="danger">需【' + (kind === 'alchemy' ? r.name + '丹方' : D.items[r.out[0]].name + '图纸') + '】</span>');
      if (!lvOk) reasons.push('<span class="danger">需' + D.facilities[kind].name + ' ' + K().needLv(kind, r) + ' 级</span>');
      if (lock) reasons.push('<span class="danger">需 ' + D.realms[r.reqRealm].name + '</span>');
      var off = lock || !known || !lvOk;
      return '<div class="card recipe' + (off ? ' locked' : '') + '"><div class="rc-icon" data-act="iteminfo" data-id="' + r.out[0] + '">' + U.itemIcon(r.out[0], '', q) + '</div>' +
        '<div class="rc-main"><b>' + outName + '</b>' +
        '<div class="mats">' + mats + '<span class="mat' + (st().stone >= r.stone ? '' : ' lack') + '"><img class="ci" src="' + U.img('icon/lingshi') + '">' + U.num(r.stone) + '</span></div>' +
        '<div class="muted small">耗时 ' + U.timeCN(r.time) + ' · 成功率 ' + U.pct(K().successRate(kind, r), 0) + (reasons.length ? ' · ' + reasons.join(' ') : '') + '</div></div>' +
        '<button class="btn small primary" data-act="craft" data-k="' + kind + '" data-id="' + r.id + '"' + (off || !enough || p ? ' disabled' : '') + '>' + (kind === 'alchemy' ? '开炉' : '炼制') + '</button></div>';
    }).join('');
    return fac + head + list;
  }
  PG.draw_alchemy = function () { return craftPanel('alchemy'); };
  PG.draw_forge = function () { return '<p class="section-tip">特殊法宝自带固定特殊属性,出炉为紫品,器炉等级、悟性、气运越高越易出金品。</p>' + craftPanel('forge'); };

  /* 批量开炉 */
  PG.batchCraft = function (rid) {
    var r = K().recipe('alchemy', rid), max = K().maxBatch('alchemy', r), n = Math.min(max, 1);
    if (max < 1) { XX.ui.toast('材料或灵石不足', 'warn'); return; }
    function body() {
      return '<div class="batch"><div class="batch-out">' + U.itemIcon(r.out[0], 'lg') + '<div><b>' + U.itemName(r.out[0]) + '</b><div class="muted small">每炉产出 ' + r.out[1] + '~' + r.out[2] + ' · 成功率 ' + U.pct(K().successRate('alchemy', r), 0) + '</div></div></div>' +
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

  /* ---------- 灵田 ---------- */
  PG.draw_field = function () {
    var f = st().cave.field, lv = K().lv('field'), plots = K().plots();
    var speed = XX.sys.player.arrayVal('yuanling') + lv * D.field.speedPerLv;
    var html = facilityCard('field', plots + ' 块地 · 可种 ' + tierRange(lv) + ' 品灵植 · 生长 +' + U.pct(speed, 0),
      Math.min(D.field.maxPlots, D.field.basePlots + lv + 1) + ' 块地 · 可种 ' + tierRange(lv + 1)) +
      '<div class="field-head"><button class="btn small" data-act="plantAll">一键播种</button><button class="btn small primary" data-act="harvestAll">一键收获</button></div><div class="field-grid">';
    for (var i = 0; i < D.field.maxPlots; i++) {
      var p = f.plots[i];
      if (i >= plots) html += '<div class="plot locked"><span>灵田 ' + (i - D.field.basePlots + 1) + ' 级开垦</span></div>';
      else if (!p) html += '<button class="plot empty" data-act="plant" data-i="' + i + '"><span>+ 播种</span></button>';
      else {
        var crop = K().crop(p.seed);
        html += '<button class="plot grow" data-act="harvest" data-i="' + i + '">' + U.itemIcon(crop.out, 'sm') +
          '<div class="plot-name">' + D.items[crop.out].name + '</div><div data-plot="' + i + '"></div></button>';
      }
    }
    return html + '</div><p class="muted small center">收获时有 ' + U.pct(D.field.seedReturnChance, 0) + ' 概率返还种子</p>';
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
    U.$$('[data-plot]').forEach(function (el) {
      var p = st().cave.field.plots[+el.dataset.plot];
      if (!p) return;
      var r = U.clamp((Date.now() - p.start) / (p.end - p.start), 0, 1);
      el.innerHTML = U.bar(r, 'grow', r >= 1 ? '可收获' : U.time((p.end - Date.now()) / 1000));
      el.parentNode.classList.toggle('ripe', r >= 1);
    });
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
    else if (act === 'plant') PG.chooseSeed(+b.dataset.i);
    else if (act === 'plantAll') PG.chooseSeed(-1);
    else if (act === 'harvest') {
      var r = K().harvest(+b.dataset.i);
      if (!r) XX.ui.toast('灵植尚未成熟');
      else if (r.full) XX.ui.toast('储物袋已满', 'warn');
      else XX.ui.toast('收获 ' + r.got.map(function (g) { return D.items[g[0]].name + '×' + g[1]; }).join('、'), 'ok');
      PG.draw();
    } else if (act === 'harvestAll') {
      var all = K().harvestAll();
      if (!all.got.length) XX.ui.toast(all.full ? '储物袋已满' : '暂无成熟的灵植');
      else XX.ui.modal({ title: '灵田丰收', html: XX.ui.rewardList(all.got) });
      PG.draw();
    } else if (act === 'mineCollect') {
      var m = K().mineCollect();
      if (!m.ok) XX.ui.toast(m.msg);
      else XX.ui.modal({ title: '灵矿收获', html: XX.ui.rewardList(m.got, [{ icon: 'icon/lingshi', text: '灵石 ×' + U.num(m.stone) }]) });
      PG.draw();
    }
  };

  /* 选择灵种:i = -1 表示一键播种全部空地 */
  PG.chooseSeed = function (i) {
    var html = '<div class="seed-list">' + D.field.crops.map(function (c) {
      var have = XX.sys.inv.count(c.seed), ok = K().cropOk(c);
      return '<button class="seed' + (have && ok ? '' : ' off') + '" data-seed="' + c.seed + '">' + U.itemIcon(c.seed) +
        '<div><b>' + tierTag(c.q) + D.items[c.seed].name + '</b> <span class="muted">×' + have + '</span><div class="muted small">' +
        (!ok ? '需灵田 ' + D.lvForTier(c.q) + ' 级' : '成熟 ' + U.timeCN(K().growTime(c)) + ' · 产出 ' + D.items[c.out].name + ' ' + c.yield[0] + '~' + c.yield[1]) + '</div></div></button>';
    }).join('') + '</div><p class="muted small">种子可在历练中获得,或于商城购买。</p>';
    XX.ui.modal({
      title: i < 0 ? '一键播种' : '选择灵种', html: html, buttons: [],
      onOpen: function (w, close) {
        U.$('.seed-list', w).onclick = function (e) {
          var s = e.target.closest('.seed'); if (!s || s.classList.contains('off')) return;
          if (i < 0) { var n = K().plantAll(s.dataset.seed); XX.ui.toast(n ? '已播种 ' + n + ' 块灵田' : '没有空地或种子', n ? 'ok' : 'warn'); PG.draw(); }
          else res(K().plant(i, s.dataset.seed));
          close();
        };
      }
    });
  };

  PG.destroy = function () { root = null; };
  return PG;
})();

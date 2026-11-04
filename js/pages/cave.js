/* 洞府页面:阵法 / 炼丹 / 炼器 / 灵田 / 灵矿 */
XX.pages.cave = (function () {
  var U = XX.util, D = XX.data, PG = {}, tab = 'array', root = null;
  var TABS = [
    { id: 'array', name: '阵法', icon: 'icon/array' },
    { id: 'alchemy', name: '炼丹', icon: 'icon/alchemy' },
    { id: 'forge', name: '炼器', icon: 'icon/forge' },
    { id: 'field', name: '灵田', icon: 'icon/field' },
    { id: 'mine', name: '灵矿', icon: 'icon/mine' }
  ];
  function K() { return XX.sys.cave; }
  function st() { return XX.store.state; }
  function res(r) { if (r && r.msg) XX.ui.toast(r.msg, r.ok ? 'ok' : 'warn'); PG.draw(); }

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

  /* ---------- 阵法 ---------- */
  PG.draw_array = function () {
    var P = XX.sys.player;
    return '<p class="section-tip">布置阵法可永久提升洞府与自身之力。</p>' + D.arrays.map(function (a) {
      var lv = P.arrayLv(a.id), max = lv >= a.maxLv, cost = K().arrayCost(a.id);
      return '<div class="card row-card"><div class="rc-icon"><img src="' + U.img(a.icon) + '"' + (a.hue ? ' style="filter:hue-rotate(' + a.hue + 'deg)"' : '') + ' alt=""></div>' +
        '<div class="rc-main"><b>' + a.name + ' <em class="lv">Lv.' + lv + '</em></b><div class="muted small">' + a.desc + '</div>' +
        '<div class="small">当前:<span class="ok">+' + U.pct(a.per * lv, 0) + '</span>' + (max ? '' : ' → 下级 +' + U.pct(a.per * (lv + 1), 0)) + '</div></div>' +
        '<button class="btn small primary" data-act="arr" data-id="' + a.id + '"' + (max || st().stone < cost ? ' disabled' : '') + '>' +
        (max ? '圆满' : '升级<small><img class="ci" src="' + U.img('icon/lingshi') + '">' + U.num(cost) + '</small>') + '</button></div>';
    }).join('');
  };

  /* ---------- 炼丹 / 炼器 ---------- */
  function craftPanel(kind) {
    var p = K().craftProgress(kind), name = kind === 'alchemy' ? '丹炉' : '器炉';
    var head = '<div class="card furnace ' + kind + '"><img class="furnace-img' + (p ? ' working' : '') + '" src="' + U.img(kind === 'alchemy' ? 'icon/alchemy' : 'icon/forge') + '" alt="">';
    if (!p) head += '<div class="fz-main"><b>' + name + '空闲</b><div class="muted small">' + (kind === 'alchemy' ? '选择丹方开炉,可一次批量炼制多炉' : '炼器只能炼制特殊法宝,需先参悟对应图纸') + '</div></div></div>';
    else head += '<div class="fz-main"><b>正在炼制:' + p.recipe.name + ((p.job.n || 1) > 1 ? ' ×' + p.job.n + ' 炉' : '') + '</b><div data-prog="' + kind + '"></div></div>' +
      '<button class="btn small primary" data-act="collect" data-k="' + kind + '" data-ready="' + kind + '">收取</button></div>';
    var list = K().recipes(kind).map(function (r) {
      var known = K().known(kind, r), lock = st().realm < r.reqRealm, enough = XX.sys.inv.hasAll(r.need) && st().stone >= r.stone;
      var mats = Object.keys(r.need).map(function (id) {
        var have = XX.sys.inv.count(id), ok = have >= r.need[id];
        return '<span class="mat' + (ok ? '' : ' lack') + '" data-act="iteminfo" data-id="' + id + '">' + U.itemIcon(id, 'xs') + D.items[id].name + ' ' + have + '/' + r.need[id] + '</span>';
      }).join('');
      var outName = kind === 'forge' ? '<span style="color:' + U.qColor(3) + '">' + D.items[r.out[0]].name + '</span> <span class="muted small">紫/金 · ' + r.lv + '级</span>' :
        U.itemName(r.out[0]) + (r.out[2] > 1 ? ' <span class="muted small">×' + r.out[1] + '~' + r.out[2] + '/炉</span>' : '');
      var reason = !known ? '<span class="danger">需【' + D.items[r.out[0]].name + '图纸】</span>' : lock ? '<span class="danger">需 ' + D.realms[r.reqRealm].name + '</span>' : '';
      return '<div class="card recipe' + (lock || !known ? ' locked' : '') + '"><div class="rc-icon" data-act="iteminfo" data-id="' + r.out[0] + '">' + U.itemIcon(r.out[0], '', kind === 'forge' ? 3 : null) + '</div>' +
        '<div class="rc-main"><b>' + outName + '</b>' +
        '<div class="mats">' + mats + '<span class="mat' + (st().stone >= r.stone ? '' : ' lack') + '"><img class="ci" src="' + U.img('icon/lingshi') + '">' + U.num(r.stone) + '</span></div>' +
        '<div class="muted small">耗时 ' + U.timeCN(r.time) + ' · 成功率 ' + U.pct(K().successRate(kind, r), 0) + (reason ? ' · ' + reason : '') + '</div></div>' +
        '<button class="btn small primary" data-act="craft" data-k="' + kind + '" data-id="' + r.id + '"' + (lock || !known || !enough || p ? ' disabled' : '') + '>' + (kind === 'alchemy' ? '开炉' : '炼制') + '</button></div>';
    }).join('');
    return head + list;
  }
  PG.draw_alchemy = function () { return craftPanel('alchemy'); };
  PG.draw_forge = function () { return '<p class="section-tip">特殊法宝自带固定特殊属性,出炉为紫品,悟性、气运越高越易出金品(额外 1 条特殊属性)。</p>' + craftPanel('forge'); };

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
    var f = st().cave.field, html = '<div class="field-head"><span class="muted small">灵田 ' + f.unlocked + ' / ' + D.field.maxPlots + ' · 元灵阵加速 +' + U.pct(XX.sys.player.arrayVal('yuanling'), 0) + '</span>' +
      '<button class="btn small primary" data-act="harvestAll">一键收获</button></div><div class="field-grid">';
    for (var i = 0; i < D.field.maxPlots; i++) {
      var p = f.plots[i];
      if (i >= f.unlocked) {
        var canUnlock = i === f.unlocked;
        html += '<div class="plot locked">' + (canUnlock ? '<button class="btn small" data-act="unlock">开垦<small><img class="ci" src="' + U.img('icon/lingshi') + '">' + U.num(D.field.unlockCost[i]) + '</small></button>' : '<span>未开垦</span>') + '</div>';
      } else if (!p) {
        html += '<button class="plot empty" data-act="plant" data-i="' + i + '"><span>+ 播种</span></button>';
      } else {
        var crop = K().crop(p.seed);
        html += '<button class="plot grow" data-act="harvest" data-i="' + i + '">' + U.itemIcon(crop.out, 'sm') +
          '<div class="plot-name">' + D.items[crop.out].name + '</div><div data-plot="' + i + '"></div></button>';
      }
    }
    return html + '</div><p class="muted small center">收获时有 ' + U.pct(D.field.seedReturnChance, 0) + ' 概率返还种子</p>';
  };

  /* ---------- 灵矿 ---------- */
  PG.draw_mine = function () {
    var m = st().cave.mine, cost = D.mine.upgradeCost(m.lv), maxed = m.lv >= D.mine.maxLv;
    var ores = D.mine.ores.map(function (o) {
      return '<span class="mat' + (m.lv >= o.minLv ? '' : ' lack') + '">' + U.itemIcon(o.id, 'xs') + D.items[o.id].name + (m.lv >= o.minLv ? '' : '(Lv.' + o.minLv + ')') + '</span>';
    }).join('');
    return '<div class="card mine-card"><img class="mine-img" src="' + U.img('icon/mine') + '" alt="">' +
      '<div class="rc-main"><b>灵矿 <em class="lv">Lv.' + m.lv + '</em></b>' +
      '<div class="small">产出:<span class="ok">' + U.num(K().minePerMin()) + '</span> 灵石 / 分钟</div>' +
      '<div class="muted small">储量上限 ' + D.mine.capMinutes / 60 + ' 小时产出</div></div></div>' +
      '<div class="card"><div class="card-title">矿脉储量</div><div data-mine="1"></div>' +
      '<div class="mats" style="margin:8px 0">伴生矿:' + ores + '</div>' +
      '<div class="btn-row"><button class="btn primary" data-act="mineCollect">收取</button>' +
      '<button class="btn" data-act="mineUp"' + (maxed || st().stone < cost ? ' disabled' : '') + '>' + (maxed ? '已满级' : '升级<small><img class="ci" src="' + U.img('icon/lingshi') + '">' + U.num(cost) + '</small>') + '</button></div></div>';
  };

  /* 每秒刷新进度 */
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
    else if (act === 'craft') { if (b.dataset.k === 'alchemy') PG.batchCraft(b.dataset.id); else res(K().startCraft('forge', b.dataset.id)); }
    else if (act === 'collect') {
      var cr = K().collectCraft(b.dataset.k);
      if (cr.eq) XX.ui.modal({ title: '神兵出炉', html: XX.ui.equipDetail(cr.eq) }); else XX.ui.toast(cr.msg, cr.ok ? 'ok' : 'warn');
      PG.draw();
    }
    else if (act === 'iteminfo') XX.ui.modal({ title: '物品详情', html: XX.ui.itemInfo(b.dataset.id) });
    else if (act === 'unlock') res(K().unlockPlot());
    else if (act === 'plant') PG.chooseSeed(+b.dataset.i);
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
    } else if (act === 'mineUp') res(K().mineUpgrade());
  };

  PG.chooseSeed = function (i) {
    var html = '<div class="seed-list">' + D.field.crops.map(function (c) {
      var have = XX.sys.inv.count(c.seed), lock = st().realm < c.reqRealm;
      return '<button class="seed' + (have && !lock ? '' : ' off') + '" data-seed="' + c.seed + '">' + U.itemIcon(c.seed) +
        '<div><b>' + D.items[c.seed].name + '</b> <span class="muted">×' + have + '</span><div class="muted small">' +
        (lock ? '需 ' + D.realms[c.reqRealm].name : '成熟 ' + U.timeCN(K().growTime(c)) + ' · 产出 ' + D.items[c.out].name + ' ' + c.yield[0] + '~' + c.yield[1]) + '</div></div></button>';
    }).join('') + '</div><p class="muted small">种子可在历练中获得,或于商城购买。</p>';
    XX.ui.modal({
      title: '选择灵种', html: html, buttons: [],
      onOpen: function (w, close) {
        U.$('.seed-list', w).onclick = function (e) {
          var s = e.target.closest('.seed'); if (!s || s.classList.contains('off')) return;
          res(K().plant(i, s.dataset.seed)); close();
        };
      }
    });
  };

  PG.destroy = function () { root = null; };
  return PG;
})();

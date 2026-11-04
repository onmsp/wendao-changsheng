/* 人物页面:精美展示 + 修为 + 装备 + 全属性(可点开解释) + 纪事 */
XX.pages.character = (function () {
  var U = XX.util, D = XX.data, PG = {}, view = 'med', root = null;

  PG.render = function (el) {
    root = el;
    var st = XX.store.state, P = XX.sys.player, t = P.tpl(), rt = P.root();
    var motes = '';
    for (var i = 0; i < 14; i++) motes += '<i style="left:' + U.randInt(15, 85) + '%;animation-delay:' + U.rand(0, 6).toFixed(1) + 's"></i>';
    el.innerHTML =
      '<section class="char-show" style="--cc:' + t.color + '">' +
      '  <div class="aura"></div><div class="aura ring"></div><div class="motes up">' + motes + '</div>' +
      '  <img class="char-img view-' + view + '" id="ch-img" src="' + P.img(view) + '" alt="">' +
      '  <div class="char-plate"><div class="cp-name">' + U.esc(st.name) + '</div>' +
      '    <div class="cp-sub">' + t.name + ' · ' + t.school + '</div>' +
      '    <div class="cp-tags"><span class="realm-tag" id="ch-realm"></span><span class="root-tag" style="--rc:' + rt.color + '">' + rt.name + '</span></div>' +
      '    <div class="cp-power">战力 <b id="ch-power"></b></div></div>' +
      '  <div class="view-tabs" id="ch-views"><button data-v="stand">看板</button><button data-v="med">打坐</button><button data-v="atk">战斗</button></div>' +
      '  <div class="med-state" id="ch-medstate">打坐修炼中</div>' +
      '</section>' +
      '<section class="card cultivate">' +
      '  <div class="cult-head"><span>修为</span><span class="muted" id="ch-rate"></span></div>' +
      '  <div id="ch-expbar"></div>' +
      '  <div class="cult-row"><div class="tick-ring" id="ch-ring"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.5"/><circle class="fg" cx="18" cy="18" r="15.5"/></svg><img src="' + U.img('icon/cultivate') + '" alt=""></div>' +
      '    <div class="cult-tip" id="ch-tip"></div><button class="btn primary" id="ch-break">突破</button></div>' +
      '</section>' +
      '<section class="card"><div class="card-title">法宝装备</div><div class="equip-row" id="ch-equip"></div></section>' +
      '<section class="card"><div class="card-title">人物属性<span class="muted small">点击 ? 查看说明</span></div><div class="attr-grid" id="ch-attrs"></div>' +
      '  <div class="talent">模板天赋:' + t.bonusText + '</div></section>' +
      '<section class="card"><div class="card-title">仙途纪事</div><ul class="log" id="ch-log"></ul></section>';

    U.$$('#ch-views button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === view); });
    U.$('#ch-views').onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      view = b.dataset.v;
      U.$$('#ch-views button').forEach(function (x) { x.classList.toggle('on', x === b); });
      var img = U.$('#ch-img');
      img.style.opacity = 0;
      setTimeout(function () { img.src = P.img(view); img.className = 'char-img view-' + view; img.style.opacity = ''; }, 180);
      U.$('#ch-medstate').style.display = view === 'med' ? '' : 'none';
    };
    U.$('#ch-medstate').style.display = view === 'med' ? '' : 'none';
    U.$('#ch-break').onclick = PG.doBreak;
    U.$('#ch-attrs').onclick = function (e) {
      var b = e.target.closest('.info-dot'); if (!b) return;
      var a = D.attributes.filter(function (x) { return x.key === b.dataset.k; })[0];
      XX.ui.modal({ title: a.name, html: '<p>' + a.desc + '</p>' + (a.key === 'rate' ? PG.rateDetail() : '') });
    };
    U.$('#ch-equip').onclick = function (e) {
      var b = e.target.closest('.eq-slot'); if (!b) return;
      PG.equipInfo(b.dataset.s);
    };
    PG.full();
  };

  PG.rateDetail = function () {
    var P = XX.sys.player, st = XX.store.state, r = P.realm();
    return '<table class="tbl"><tr><td>灵根基础</td><td>' + P.root().rate + ' 点</td></tr>' +
      '<tr><td>境界加成</td><td>+' + U.pct(r.major * D.realmCurve.majorRateBonus, 0) + '</td></tr>' +
      '<tr><td>聚灵阵</td><td>+' + U.pct(P.arrayVal('juling'), 0) + '</td></tr>' +
      '<tr><td>功法参悟</td><td>+' + U.pct(st.perm.rateBonus || 0, 0) + '</td></tr>' +
      '<tr><td><b>合计</b></td><td><b>' + P.rate() + ' 点 / 3 秒</b></td></tr></table>';
  };

  PG.fmt = function (a, v) {
    if (a.fmt === 'pct') return U.pct(v);
    if (a.fmt === 'rate') return v + '/3秒';
    return U.num(v);
  };

  PG.full = function () {
    var P = XX.sys.player, st = XX.store.state, s = P.stats();
    U.$('#ch-realm').textContent = P.realm().name;
    U.$('#ch-power').textContent = U.num(P.power());
    U.$('#ch-attrs').innerHTML = D.attributes.map(function (a) {
      return '<div class="attr"><span class="an">' + a.name + '</span><b>' + PG.fmt(a, s[a.key]) + '</b><button class="info-dot" data-k="' + a.key + '">?</button></div>';
    }).join('');
    U.$('#ch-equip').innerHTML = Object.keys(D.equipSlots).map(function (k) {
      var e = st.equip[k];
      return '<button class="eq-slot" data-s="' + k + '">' + (e ? U.itemIcon(e.id, '', e.q) : '<div class="item-icon empty"></div>') +
        '<span>' + (e ? '<i style="color:' + U.qColor(e.q) + '">' + D.items[e.id].name + '</i>' : D.equipSlots[k] + '(空)') + '</span></button>';
    }).join('');
    U.$('#ch-log').innerHTML = st.log.slice(0, 12).map(function (l) { return '<li><em>' + l.t + '</em>' + l.text + '</li>'; }).join('');
    PG.update();
  };

  PG.update = function () {
    if (!root || !U.$('#ch-expbar')) return;
    var P = XX.sys.player, st = XX.store.state, need = P.expNeed(), info = P.breakInfo();
    U.$('#ch-expbar').innerHTML = U.bar(st.exp / need, 'exp big', U.num(st.exp) + ' / ' + U.num(need));
    U.$('#ch-rate').textContent = '+' + P.rate() + ' / 3秒';
    var frac = ((Date.now() - st.lastTick) % XX.config.tickMs) / XX.config.tickMs;
    U.$('#ch-ring .fg').style.strokeDashoffset = (97.4 * (1 - frac)).toFixed(1);
    var tip = '', btn = U.$('#ch-break');
    if (info.max) { tip = '已臻至境'; btn.disabled = true; }
    else if (!info.ready) {
      var left = need - st.exp;
      tip = '距「' + info.next.name + '」还需 ' + U.num(left) + ' 修为<br><span class="muted">约 ' + U.timeCN(left / P.rate() * 3) + '</span>';
      btn.disabled = true;
    } else if (info.major) {
      tip = '瓶颈!冲击<b>' + info.next.majorName + '</b>需【' + D.items[info.pill].name + '】' + (info.havePill ? '<span class="ok">✔</span>' : '<span class="danger">✘</span>') +
        '<br><span class="muted">成功率 ' + U.pct(info.chance, 0) + '</span>';
      btn.disabled = false;
    } else { tip = '修为圆满,可突破至「' + info.next.name + '」'; btn.disabled = false; }
    U.$('#ch-tip').innerHTML = tip;
    btn.classList.toggle('glow', !btn.disabled);
    if (PG._realm !== st.realm || PG._log !== st.log.length) {
      PG._realm = st.realm; PG._log = st.log.length;
      PG.full();
    }
  };

  PG.doBreak = function () {
    var r = XX.sys.player.breakthrough();
    XX.ui.toast(r.msg, r.ok ? 'ok' : 'warn');
    if (r.big) {
      var show = U.$('.char-show');
      show.classList.add('breakfx'); setTimeout(function () { show.classList.remove('breakfx'); }, 1600);
    }
    PG.full();
  };

  PG.equipInfo = function (slot) {
    var st = XX.store.state, e = st.equip[slot];
    if (!e) { XX.ui.toast('可在背包中点击装备进行穿戴'); return; }
    XX.ui.modal({
      title: D.equipSlots[slot],
      html: XX.pages.bag.equipDetail(e),
      buttons: [{ text: '卸下', onClick: function () { XX.sys.inv.unequip(slot); PG.full(); } }, { text: '关闭', cls: 'primary' }]
    });
  };

  PG.destroy = function () { root = null; };
  return PG;
})();

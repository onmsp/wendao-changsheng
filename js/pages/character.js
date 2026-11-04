/*
 * 人物页面:打坐展示(四角佩戴法宝)+ 修为吸纳特效 + 手动突破 + 可折叠属性 + 纪事
 */
XX.pages.character = (function () {
  var U = XX.util, D = XX.data, PG = {}, root = null, attrOpen = false, logOpen = false;
  var CORNERS = ['tl', 'tr', 'bl', 'br'];
  var SUMMARY = ['hp', 'atk', 'def', 'rate'];

  PG.render = function (el) {
    root = el;
    var st = XX.store.state, P = XX.sys.player, t = P.tpl(), rt = P.root();
    var motes = '';
    for (var i = 0; i < 12; i++) motes += '<i style="left:' + U.randInt(15, 85) + '%;animation-delay:' + U.rand(0, 6).toFixed(1) + 's"></i>';
    el.innerHTML =
      '<section class="char-show" id="ch-show" style="--cc:' + t.color + '">' +
      '  <div class="aura"></div><div class="aura ring"></div><div class="motes up">' + motes + '</div>' +
      '  <div class="qi-layer" id="ch-qi"></div>' +
      '  <img class="char-img view-med" id="ch-img" src="' + P.img('med') + '" alt="">' +
      CORNERS.map(function (c, i) { return '<button class="treasure ' + c + '" data-s="' + i + '"></button>'; }).join('') +
      '  <div class="char-plate">' +
      '    <div class="cp-name">' + U.esc(st.name) + '</div>' +
      '    <div class="cp-tags"><span class="realm-tag" id="ch-realm"></span><span class="root-tag" style="--rc:' + rt.color + '">' + rt.name + '</span>' +
      '      <span class="cp-sub">' + t.name + '·' + t.school + '</span></div>' +
      '  </div>' +
      '</section>' +
      '<section class="card cultivate">' +
      '  <div class="cult-main"><div class="cult-num"><span class="muted small">修为</span><b id="ch-exp"></b><em id="ch-need"></em></div>' +
      '    <div class="cult-rate"><span class="muted small">吸纳灵气</span><b id="ch-rate"></b></div></div>' +
      '  <div class="cult-row"><div class="cult-tip" id="ch-tip"></div><button class="btn primary break-btn" id="ch-break">突 破</button></div>' +
      '</section>' +
      '<section class="card fold' + (attrOpen ? ' open' : '') + '" id="ch-attrcard">' +
      '  <button class="fold-head" id="ch-attrtoggle"><span class="card-title">人物属性</span><span class="power">战力 <b id="ch-power"></b></span><i class="arrow">▾</i></button>' +
      '  <div class="attr-sum" id="ch-sum"></div>' +
      '  <div class="fold-body"><div class="attr-grid" id="ch-attrs"></div><div class="talent">模板天赋:' + t.bonusText + '</div></div>' +
      '</section>' +
      '<section class="card fold' + (logOpen ? ' open' : '') + '" id="ch-logcard">' +
      '  <button class="fold-head" id="ch-logtoggle"><span class="card-title">仙途纪事</span><span class="muted small" id="ch-loglast"></span><i class="arrow">▾</i></button>' +
      '  <div class="fold-body"><ul class="log" id="ch-log"></ul></div>' +
      '</section>';

    U.$('#ch-break').onclick = PG.doBreak;
    U.$('#ch-attrtoggle').onclick = function () { attrOpen = !attrOpen; U.$('#ch-attrcard').classList.toggle('open', attrOpen); };
    U.$('#ch-logtoggle').onclick = function () { logOpen = !logOpen; U.$('#ch-logcard').classList.toggle('open', logOpen); };
    U.$('#ch-attrs').onclick = function (e) {
      var b = e.target.closest('.info-dot'); if (!b) return;
      var a = D.attributes.filter(function (x) { return x.key === b.dataset.k; })[0];
      XX.ui.modal({ title: a.name, html: '<p>' + a.desc + '</p>' + (a.key === 'rate' ? PG.rateDetail() : '') });
    };
    U.$('#ch-show').onclick = function (e) {
      var b = e.target.closest('.treasure'); if (b) PG.treasureInfo(+b.dataset.s);
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
    if (!root) return;
    var P = XX.sys.player, st = XX.store.state, s = P.stats();
    U.$('#ch-realm').textContent = P.realm().name;
    U.$('#ch-power').textContent = U.num(P.power());
    U.$('#ch-sum').innerHTML = SUMMARY.map(function (k) {
      var a = D.attributes.filter(function (x) { return x.key === k; })[0];
      return '<div><span>' + a.name + '</span><b>' + PG.fmt(a, s[k]) + '</b></div>';
    }).join('');
    U.$('#ch-attrs').innerHTML = D.attributes.map(function (a) {
      return '<div class="attr"><span class="an">' + a.name + '</span><b>' + PG.fmt(a, s[a.key]) + '</b><button class="info-dot" data-k="' + a.key + '">?</button></div>';
    }).join('');
    CORNERS.forEach(function (c, i) {
      var e = st.equip[i], b = U.$('.treasure.' + c);
      b.innerHTML = e ? U.itemIcon(e.id, '', e.q) + '<span>' + D.items[e.id].name + '</span>' : '<div class="item-icon empty">+</div><span>法宝</span>';
      b.classList.toggle('filled', !!e);
    });
    U.$('#ch-log').innerHTML = st.log.slice(0, 20).map(function (l) { return '<li><em>' + l.t + '</em>' + l.text + '</li>'; }).join('');
    U.$('#ch-loglast').textContent = st.log[0] ? st.log[0].text.slice(0, 14) + '…' : '';
    PG._realm = st.realm; PG._log = st.log.length;
    PG.update(0);
  };

  /* 每 0.5 秒刷新;gain > 0 表示刚吸纳了修为 */
  PG.update = function (gain) {
    if (!root || !U.$('#ch-exp')) return;
    var P = XX.sys.player, st = XX.store.state, need = P.expNeed(), info = P.breakInfo();
    U.$('#ch-exp').textContent = U.num(st.exp);
    U.$('#ch-need').textContent = ' / ' + U.num(need);
    U.$('#ch-rate').textContent = P.isFull() ? '已圆满' : '+' + P.rate() + ' / 3秒';
    var tip, btn = U.$('#ch-break');
    if (PG._breaking) return;
    if (info.max) { tip = '已臻至境'; btn.disabled = true; }
    else if (!info.ready) {
      tip = '下一境界「' + info.next.name + '」<br><span class="muted">突破成功率 ' + U.pct(info.chance, 0) + '(含气运 +' + U.pct(info.luckBonus, 0) + ')</span>';
      btn.disabled = true;
    } else if (info.major) {
      tip = '瓶颈!冲击<b>' + info.next.majorName + '</b>需【' + D.items[info.pill].name + '】' + (info.havePill ? '<span class="ok">✔</span>' : '<span class="danger">✘</span>') +
        '<br><span class="muted">成功率 <b class="ok">' + U.pct(info.chance, 0) + '</b>(基础 ' + U.pct(info.base, 0) + ' · 气运 +' + U.pct(info.luckBonus, 0) + (info.talisman ? ' · 破境符 +' + U.pct(info.talisman, 0) : '') + ')</span>';
      btn.disabled = false;
    } else {
      tip = '修为圆满,可冲击「' + info.next.name + '」<br><span class="muted">成功率 <b class="ok">' + U.pct(info.chance, 0) + '</b>(基础 ' + U.pct(info.base, 0) + ' · 气运 +' + U.pct(info.luckBonus, 0) + ')</span>';
      btn.disabled = false;
    }
    U.$('#ch-tip').innerHTML = tip;
    btn.classList.toggle('glow', !btn.disabled);
    U.$('#ch-show').classList.toggle('full', P.isFull());
    if (gain > 0) PG.absorbFx(gain);
    if (PG._realm !== st.realm || PG._log !== st.log.length) PG.full();
  };

  /* 吸纳灵气特效:灵光从四周汇入人物,飘出 +修为 */
  PG.absorbFx = function (gain) {
    var layer = U.$('#ch-qi'); if (!layer || !layer.animate) return;
    var W = layer.clientWidth, H = layer.clientHeight, cx = W / 2, cy = H * 0.55;
    for (var i = 0; i < 14; i++) {
      var p = document.createElement('i');
      var ang = Math.random() * Math.PI * 2, dist = U.rand(0.42, 0.62) * Math.max(W, H);
      var sx = cx + Math.cos(ang) * dist, sy = cy + Math.sin(ang) * dist * 0.75;
      p.style.left = cx + 'px'; p.style.top = cy + 'px';
      var size = U.rand(4, 9);
      p.style.width = p.style.height = size + 'px';
      layer.appendChild(p);
      p.animate([
        { transform: 'translate(' + (sx - cx) + 'px,' + (sy - cy) + 'px) scale(.4)', opacity: 0 },
        { opacity: 1, offset: 0.25 },
        { transform: 'translate(' + ((sx - cx) * 0.3) + 'px,' + ((sy - cy) * 0.3 - 20) + 'px) scale(1)', opacity: 1, offset: 0.7 },
        { transform: 'translate(0,0) scale(.2)', opacity: 0 }
      ], { duration: U.rand(1100, 1700), delay: U.rand(0, 400), easing: 'cubic-bezier(.4,0,.6,1)', fill: 'both' }).onfinish = (function (n) { return function () { n.remove(); }; })(p);
    }
    var img = U.$('#ch-img');
    setTimeout(function () {
      if (!img.isConnected) return;
      img.classList.remove('absorb'); void img.offsetWidth; img.classList.add('absorb');
      var t = document.createElement('div');
      t.className = 'qi-gain'; t.textContent = '+' + U.num(gain) + ' 修为';
      layer.appendChild(t);
      setTimeout(function () { t.remove(); }, 1600);
    }, 1100);
  };

  PG.doBreak = function () {
    var info = XX.sys.player.breakInfo();
    var show = U.$('#ch-show');
    PG._breaking = true;
    U.$('#ch-break').disabled = true;
    U.$('#ch-tip').innerHTML = '<span class="ok">运转周天,冲击关隘……</span>';
    show.classList.add('charging');
    setTimeout(function () {
      PG._breaking = false;
      if (!root) return;
      show.classList.remove('charging');
      var r = XX.sys.player.breakthrough();
      XX.ui.toast(r.msg, r.ok ? 'ok' : 'warn');
      show.classList.add(r.ok ? 'breakfx' : 'failfx');
      setTimeout(function () { show.classList.remove('breakfx', 'failfx'); }, 1600);
      PG.full();
    }, info.major ? 1600 : 1000);
  };

  PG.treasureInfo = function (slot) {
    var st = XX.store.state, e = st.equip[slot];
    if (!e) { XX.ui.toast('在背包中点击法宝即可佩戴'); return; }
    XX.ui.modal({
      title: '法宝',
      html: XX.pages.bag.equipDetail(e),
      buttons: [{ text: '卸下', onClick: function () { XX.sys.inv.unequip(slot); PG.full(); } }, { text: '关闭', cls: 'primary' }]
    });
  };

  PG.destroy = function () { root = null; PG._breaking = false; };
  return PG;
})();

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
      '  <img class="char-img view-med" id="ch-img" src="' + P.img('med', null, true) + '" alt="">' +
      '  <div class="zoom-hint">🔍 点击查看原图</div>' +
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
      '<section class="card tech-card"><div class="card-title">功法神通<span class="muted small" id="ch-slotinfo"></span></div>' +
      '  <div class="tech-wrap"><button class="tech gongfa" data-cat="gongfa" data-i="0" id="ch-gongfa"></button>' +
      '  <div class="tech-st" id="ch-st"></div></div></section>' +
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
      var b = e.target.closest('.treasure'); if (b) { PG.treasureInfo(+b.dataset.s); return; }
      if (e.target.closest('#ch-img') || e.target.closest('.zoom-hint')) XX.ui.viewer(P.img('med', null, true), st.name + ' · 打坐');
    };
    U.$('.tech-card').onclick = function (e) {
      var b = e.target.closest('.tech'); if (!b) return;
      if (b.classList.contains('locked')) { XX.ui.toast(b.dataset.lock); return; }
      PG.chooseTech(b.dataset.cat, +b.dataset.i);
    };
    PG.full();
  };

  PG.rateDetail = function () {
    var P = XX.sys.player, st = XX.store.state, r = P.realm();
    return '<table class="tbl"><tr><td>灵根基础</td><td>' + P.root().rate + ' 点</td></tr>' +
      '<tr><td>突破累计</td><td>+' + U.pct(P.breakRate(), 0) + '</td></tr>' +
      '<tr><td>功法【' + (P.gongfa() ? P.gongfa().name : '无') + '】</td><td>+' + U.pct((P.gongfa() && P.gongfa().effects.rate) || 0, 0) + '</td></tr>' +
      '<tr><td>聚灵阵</td><td>+' + U.pct(P.arrayVal('juling'), 0) + '</td></tr>' +
      (st.perm.rateBonus ? '<tr><td>旧版功法残留</td><td>+' + U.pct(st.perm.rateBonus, 0) + '</td></tr>' : '') +
      '<tr><td>法宝聚灵</td><td>+' + U.pct(P.bonus().rate - ((P.gongfa() && P.gongfa().effects.rate) || 0) || 0, 0) + '</td></tr>' +
      '<tr><td><b>合计</b></td><td><b>' + P.rate().toFixed(2) + ' 点 / 3 秒</b></td></tr></table>';
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
      b.innerHTML = e ? U.itemIcon(e.id, '', e.q) + '<span style="color:' + U.qColor(e.q) + '">' + U.eqName(e) + '</span>' : '<div class="item-icon empty">+</div><span>法宝</span>';
      b.classList.toggle('filled', !!e);
    });
    U.$('#ch-log').innerHTML = st.log.slice(0, 20).map(function (l) { return '<li><em>' + l.t + '</em>' + l.text + '</li>'; }).join('');
    U.$('#ch-loglast').textContent = st.log[0] ? st.log[0].text.slice(0, 14) + '…' : '';
    PG.drawTech();
    PG._realm = st.realm; PG._log = st.log.length;
    PG.update(0);
  };

  /* 每 0.5 秒刷新;gain > 0 表示刚吸纳了修为 */
  PG.update = function (gain) {
    if (!root || !U.$('#ch-exp')) return;
    var P = XX.sys.player, st = XX.store.state, need = P.expNeed(), info = P.breakInfo();
    U.$('#ch-exp').textContent = U.exp(st.exp);
    U.$('#ch-need').textContent = ' / ' + U.exp(need);
    U.$('#ch-rate').textContent = '+' + P.rate().toFixed(2) + ' / 3秒';
    var tip, btn = U.$('#ch-break');
    if (PG._breaking) return;
    if (info.max) { tip = '已臻至境'; btn.disabled = true; }
    else if (!info.ready) {
      tip = '下一境界「' + info.next.name + '」,还需 ' + U.exp(need - st.exp) + ' 修为<br><span class="muted">成功率 ' + U.pct(info.chance, 0) + '(含气运 +' + U.pct(info.luckBonus, 0) + ')· 突破后修炼速度 +' + U.pct(info.rateGain, 0) + '</span>';
      btn.disabled = true;
    } else if (info.major) {
      tip = '瓶颈!冲击<b>' + info.next.majorName + '</b>需【' + D.items[info.pill].name + '】' + (info.havePill ? '<span class="ok">✔</span>' : '<span class="danger">✘</span>') +
        '<br><span class="muted">成功率 <b class="ok">' + U.pct(info.chance, 0) + '</b>(基础 ' + U.pct(info.base, 0) + ' · 气运 +' + U.pct(info.luckBonus, 0) + (info.talisman ? ' · 破境符 +' + U.pct(info.talisman, 0) : '') + ')· 修炼速度 +' + U.pct(info.rateGain, 0) + '</span>';
      btn.disabled = false;
    } else {
      tip = '修为已足,可冲击「' + info.next.name + '」<br><span class="muted">成功率 <b class="ok">' + U.pct(info.chance, 0) + '</b>(基础 ' + U.pct(info.base, 0) + ' · 气运 +' + U.pct(info.luckBonus, 0) + ')· 修炼速度 +' + U.pct(info.rateGain, 0) + '</span>';
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
      t.className = 'qi-gain'; t.textContent = '+' + U.exp(gain) + ' 修为';
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
      html: XX.ui.equipDetail(e),
      buttons: [{ text: '卸下', onClick: function () { XX.sys.inv.unequip(slot); PG.full(); } }, { text: '关闭', cls: 'primary' }]
    });
  };

  /* ---------- 功法神通 ---------- */
  function techIcon(def) { return '<div class="tech-icon q' + def.q + '" style="--qc:' + U.qColor(def.q) + '"><img src="' + U.img(def.icon) + '"' + (def.hue ? ' style="filter:hue-rotate(' + def.hue + 'deg)"' : '') + ' alt=""></div>'; }
  PG.drawTech = function () {
    var st = XX.store.state, P = XX.sys.player, slots = P.slots(), g = P.gongfa();
    U.$('#ch-slotinfo').textContent = '功法 1 · 神通 ' + slots.shentong + '/' + XX.config.techniqueSlots[XX.config.techniqueSlots.length - 1].shentong;
    U.$('#ch-gongfa').innerHTML = g ? techIcon(g) + '<span>' + g.name + '</span><em>功法</em>' : '<div class="tech-icon empty">+</div><span>功法</span>';
    var html = '';
    for (var i = 0; i < 4; i++) {
      var id = st.skills.shentong[i], def = id && D.shentong[id], lock = i >= slots.shentong;
      var lockText = i === 2 ? '元婴期解锁' : '渡劫期解锁';
      html += '<button class="tech' + (lock ? ' locked' : '') + '" data-cat="shentong" data-i="' + i + '" data-lock="' + lockText + '">' +
        (lock ? '<div class="tech-icon empty">🔒</div><span>' + lockText + '</span>' : def ? techIcon(def) + '<span>' + def.name + '</span><em>神通' + (i + 1) + '</em>' : '<div class="tech-icon empty">+</div><span>神通' + (i + 1) + '</span>') + '</button>';
    }
    U.$('#ch-st').innerHTML = html;
  };
  PG.chooseTech = function (cat, slot) {
    var st = XX.store.state, list = cat === 'gongfa' ? st.skills.learnedGongfa : st.skills.learnedShentong, src = cat === 'gongfa' ? D.gongfa : D.shentong;
    var cur = cat === 'gongfa' ? st.skills.gongfa : st.skills.shentong[slot];
    var html = '<div class="tech-list">' + list.map(function (id) {
      var d = src[id], on = id === cur, used = cat === 'shentong' && !on && st.skills.shentong.indexOf(id) >= 0;
      var info = cat === 'gongfa' ? Object.keys(d.effects).map(function (k) {
        var nm = { rate: '修炼速度', hpPct: '气血', atkPct: '攻击', defPct: '防御', mpPct: '灵力', sensePct: '神识', luck: '气运', comprehension: '悟性' }[k] || k;
        return nm + '+' + (d.effects[k] < 1 ? U.pct(d.effects[k], 0) : d.effects[k]);
      }).join(' ') : '灵力 ' + U.pct(d.cost, 0) + ' · 冷却 ' + d.cd + ' 回合';
      return '<button class="seed tech-opt' + (on ? ' on' : '') + '" data-id="' + id + '">' + techIcon(d) + '<div><b style="color:' + U.qColor(d.q) + '">' + d.name + '</b>' +
        (on ? ' <span class="ok small">运转中</span>' : used ? ' <span class="muted small">(已装配其他栏)</span>' : '') +
        '<div class="muted small">' + info + '</div><div class="small">' + d.desc + '</div></div></button>';
    }).join('') + '</div><p class="muted small center">更多' + (cat === 'gongfa' ? '功法' : '神通') + '可从历练、秘境、商城获得玉简参悟</p>';
    XX.ui.modal({
      title: cat === 'gongfa' ? '运转功法' : '装配神通 · 第' + (slot + 1) + '栏', html: html,
      buttons: cat === 'shentong' && cur ? [{ text: '卸下', onClick: function () { st.skills.shentong[slot] = null; PG.full(); } }, { text: '关闭' }] : [{ text: '关闭' }],
      onOpen: function (w, close) {
        U.$('.tech-list', w).onclick = function (e) {
          var b = e.target.closest('[data-id]'); if (!b) return;
          var id = b.dataset.id;
          if (cat === 'gongfa') st.skills.gongfa = id;
          else {
            var other = st.skills.shentong.indexOf(id);
            if (other >= 0) st.skills.shentong[other] = st.skills.shentong[slot];
            st.skills.shentong[slot] = id;
          }
          XX.ui.toast((cat === 'gongfa' ? '改为运转【' : '已装配【') + src[id].name + '】', 'ok');
          close(); PG.full();
        };
      }
    });
  };

  PG.destroy = function () { root = null; PG._breaking = false; };
  return PG;
})();

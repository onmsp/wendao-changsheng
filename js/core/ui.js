/* 通用界面组件:提示、弹窗、飘字 */
XX.ui = (function () {
  var U = XX.util, ui = {};

  ui.toast = function (msg, type) {
    var root = U.$('#toast-root');
    var el = document.createElement('div');
    el.className = 'toast ' + (type || '');
    el.innerHTML = msg;
    root.appendChild(el);
    setTimeout(function () { el.classList.add('out'); }, 1900);
    setTimeout(function () { el.remove(); }, 2400);
  };

  /*
   * 弹窗
   * opts: { title, html, cls, buttons:[{text, cls, onClick(close) -> 返回 false 则不关闭}], onOpen(el) }
   */
  ui.modal = function (opts) {
    var root = U.$('#modal-root');
    var wrap = document.createElement('div');
    wrap.className = 'modal-mask';
    var btns = (opts.buttons || [{ text: '确定', cls: 'primary' }]).map(function (b, i) {
      return '<button class="btn ' + (b.cls || '') + '" data-i="' + i + '"' + (b.disabled ? ' disabled' : '') + '>' + b.text + '</button>';
    }).join('');
    wrap.innerHTML = '<div class="modal panel-frame ' + (opts.cls || '') + '">' +
      (opts.title ? '<div class="modal-title">' + opts.title + '</div>' : '') +
      '<div class="modal-body">' + (opts.html || '') + '</div>' +
      (btns ? '<div class="modal-btns">' + btns + '</div>' : '') +
      '<button class="modal-x" aria-label="关闭">×</button></div>';
    root.appendChild(wrap);
    requestAnimationFrame(function () { wrap.classList.add('show'); });

    function close() {
      wrap.classList.remove('show');
      setTimeout(function () { wrap.remove(); }, 220);
    }
    wrap.addEventListener('click', function (e) {
      if (e.target === wrap || e.target.classList.contains('modal-x')) { close(); return; }
      var b = e.target.closest('.modal-btns .btn');
      if (b) {
        var def = (opts.buttons || [{}])[+b.dataset.i];
        var r = def && def.onClick ? def.onClick(close, wrap) : undefined;
        if (r !== false) close();
      }
    });
    if (opts.onOpen) opts.onOpen(wrap, close);
    return close;
  };

  ui.confirm = function (title, html, onYes, yesText) {
    return ui.modal({
      title: title, html: html,
      buttons: [{ text: '取消' }, { text: yesText || '确定', cls: 'primary', onClick: onYes }]
    });
  };

  /* 在元素上方飘字 */
  ui.floatText = function (anchor, text, cls) {
    if (!anchor) return;
    var el = document.createElement('div');
    el.className = 'float-text ' + (cls || '');
    el.textContent = text;
    var r = anchor.getBoundingClientRect(), app = U.$('#app').getBoundingClientRect();
    el.style.left = (r.left - app.left + r.width / 2 + U.rand(-20, 20)) + 'px';
    el.style.top = (r.top - app.top + r.height * 0.35) + 'px';
    U.$('#app').appendChild(el);
    setTimeout(function () { el.remove(); }, 1200);
  };

  /* 奖励列表 HTML:items = [[id, n], ...] */
  ui.rewardList = function (items, extra) {
    var html = '<div class="reward-list">';
    (extra || []).forEach(function (e) {
      html += '<div class="reward"><div class="item-icon q2"><img src="' + U.img(e.icon) + '" alt=""></div><span>' + e.text + '</span></div>';
    });
    items.forEach(function (p) {
      html += '<div class="reward">' + U.itemIcon(p[0], '', null, { g: p[2] }) + '<span>' + U.itemName(p[0], p[2]) + ' ×' + p[1] + '</span></div>';
    });
    return html + '</div>';
  };

  /* 物品详情弹窗(背包、商城、配方共用) */
  ui.itemInfo = function (id, extraHtml, g) {
    var it = XX.data.items[id];
    var html = '<div class="item-detail">' + U.itemIcon(id, 'lg', null, { g: g }) + '<div><div class="item-detail-name">' + U.itemName(id, g) + '</div>' +
      '<div class="muted">' + (it.bpRef ? '图纸' : it.scroll ? (it.scroll === 'gongfa' ? '功法玉简' : '技能玉简') : XX.data.itemTypes[it.type].name) + '</div></div></div>' +
      '<p class="item-desc">' + it.desc + '</p>' + (extraHtml || '');
    return html;
  };

  /*
   * 大图查看器:双指缩放 / 滚轮缩放 / 双击放大 / 拖动平移
   */
  ui.viewer = function (src, title) {
    var wrap = document.createElement('div');
    wrap.className = 'viewer';
    wrap.innerHTML = '<div class="viewer-top"><span>' + (title || '') + '</span><button class="viewer-x" aria-label="关闭">×</button></div>' +
      '<div class="viewer-stage"><img alt="" draggable="false"></div><div class="viewer-tip">双指或滚轮缩放 · 双击放大 · 拖动查看细节</div>';
    U.$('#app').appendChild(wrap);
    var img = wrap.querySelector('img'), stage = wrap.querySelector('.viewer-stage');
    img.src = src;
    var sc = 1, tx = 0, ty = 0, pts = {}, start = null, lastTap = 0;
    function apply(anim) {
      sc = U.clamp(sc, 1, 5);
      if (sc === 1) { tx = 0; ty = 0; }
      img.style.transition = anim ? 'transform .25s ease' : 'none';
      img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + sc + ')';
    }
    function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
    stage.addEventListener('pointerdown', function (e) {
      stage.setPointerCapture(e.pointerId);
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pts);
      if (ids.length === 2) start = { d: dist(pts[ids[0]], pts[ids[1]]), sc: sc };
      else start = { x: e.clientX, y: e.clientY, tx: tx, ty: ty };
      var now = Date.now();
      if (ids.length === 1 && now - lastTap < 300) { sc = sc > 1 ? 1 : 2.5; apply(true); }
      lastTap = now;
    });
    stage.addEventListener('pointermove', function (e) {
      if (!pts[e.pointerId]) return;
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pts);
      if (ids.length === 2 && start && start.d) { sc = start.sc * dist(pts[ids[0]], pts[ids[1]]) / start.d; apply(); }
      else if (ids.length === 1 && start && start.x != null && sc > 1) { tx = start.tx + e.clientX - start.x; ty = start.ty + e.clientY - start.y; apply(); }
    });
    function up(e) { delete pts[e.pointerId]; start = null; }
    stage.addEventListener('pointerup', up);
    stage.addEventListener('pointercancel', up);
    stage.addEventListener('wheel', function (e) { e.preventDefault(); sc *= e.deltaY < 0 ? 1.15 : 0.87; apply(); }, { passive: false });
    wrap.querySelector('.viewer-x').onclick = function () { wrap.classList.add('out'); setTimeout(function () { wrap.remove(); }, 200); };
    requestAnimationFrame(function () { wrap.classList.add('show'); });
  };

  /* 法宝详情 HTML(含等级、品阶、属性、特殊属性) */
  ui.equipDetail = function (e) {
    var D = XX.data, it = D.items[e.id], q = XX.config.qualities[e.q], st = XX.sys.inv.eqStats(e);
    var NAMES = { hp: '气血', mp: '灵力', atk: '攻击', def: '防御', spd: '身法', sense: '神识', crit: '暴击率', critDmg: '暴击伤害', dodge: '闪避率' };
    return '<div class="item-detail">' + U.itemIcon(e.id, 'lg', e.q, { lv: e.lv }) + '<div><div class="item-detail-name" style="color:' + q.color + '">' + U.eqName(e) + '</div>' +
      '<div class="muted">' + (it.forged ? '<span class="sp-tag">特殊</span> 炼器法宝 · 不可强化' : '普通法宝' + (it.cat ? '·' + it.cat : '') + ' · 强化 ' + U.lvText(e.lv)) + (e.bpm > 1 ? ' · 器图加成 ' + U.pct(e.bpm, 0) : '') + ' · 强度 ' + (e.pw || 0) + ' 级</div></div></div>' +
      '<p class="item-desc">' + it.desc + '</p><div class="stat-list">' +
      Object.keys(st).map(function (k) { var v = st[k]; return '<div><span>' + NAMES[k] + '</span><b>+' + (v < 1 ? U.pct(v) : U.num(v)) + '</b></div>'; }).join('') + '</div>' +
      (e.affixes && e.affixes.length ? '<div class="affix-list">' + e.affixes.map(function (a) {
        return '<div class="affix q' + e.q + '">◆ ' + XX.sys.inv.affixText(a) + '</div>';
      }).join('') + '</div>' : '');
  };

  /* 关于 / 开源出处 */
  ui.about = function () {
    var A = XX.config.about;
    ui.modal({
      title: '关于', cls: 'about-modal',
      html: '<div class="about">' +
        '<div class="about-name">问道长生</div><div class="muted small center">修仙 · 放置 · 长生 &nbsp;v' + XX.config.version + '</div>' +
        '<div class="about-box"><div><span>作者</span><b>' + A.author + '</b></div>' +
        '<div><span>开源协议</span><b>' + A.license + ' License</b></div>' +
        '<div><span>源码地址</span><a href="' + A.repo + '" target="_blank" rel="noopener">' + A.repo.replace(/^https?:\/\//, '') + '</a></div></div>' +
        '<p class="small">Copyright © ' + A.year + ' ' + A.author + '<br>本游戏(代码与图片素材)以 ' + A.license + ' 许可证开源:可自由使用、修改、分发,但须保留版权声明与许可声明。本软件按"原样"提供,不附带任何担保。</p></div>',
      buttons: [{ text: '复制源码地址', onClick: function () {
        var done = function () { ui.toast('已复制源码地址', 'ok'); };
        try { navigator.clipboard.writeText(A.repo).then(done, function () { ui.toast(A.repo); }); } catch (e) { ui.toast(A.repo); }
        return false;
      } }, { text: '好', cls: 'primary' }]
    });
  };

  /* 炼器预览:成品属性范围、固定效果(炼器界面点击法宝查看) */
  ui.equipPreview = function (id, pw, mul, extraHtml) {
    var D = XX.data, it = D.items[id], q = it.q || 0, pv = XX.sys.inv.previewEquip(id, q, pw, mul);
    var NAMES = { hp: '气血', mp: '灵力', atk: '攻击', def: '防御', spd: '身法', sense: '神识', crit: '暴击率', critDmg: '暴击伤害', dodge: '闪避率' };
    function fv(v, pct) { return pct ? U.pct(v) : U.num(v); }
    return '<div class="item-detail">' + U.itemIcon(id, 'lg', q) + '<div><div class="item-detail-name" style="color:' + U.qColor(q) + '">' + it.name + '</div>' +
      '<div class="muted">' + (it.forged ? '<span class="sp-tag">特殊</span> 炼器法宝 · 不可强化 · 最多佩戴 ' + XX.config.specialTreasureMax + ' 件' : '普通法宝') + '</div></div></div>' +
      '<p class="item-desc">' + it.desc + '</p>' +
      '<div class="muted small">成品强度 ' + pw + ' 级 · 器图倍率 ' + U.pct(mul, 0) + '(属性在范围内随机)</div><div class="stat-list">' +
      Object.keys(pv.stats).map(function (k) { var r = pv.stats[k], pct = it.stats[k] < 1; return '<div><span>' + NAMES[k] + '</span><b>+' + fv(r[0], pct) + ' ~ ' + fv(r[1], pct) + '</b></div>'; }).join('') + '</div>' +
      (pv.affixes.length ? '<div class="affix-list">' + pv.affixes.map(function (a) {
        var d = D.affixes[a.id];
        return '<div class="affix q' + q + '">◆ ' + d.name + ':' + d.desc.replace('{v}', fv(a.min, d.pct) + '~' + fv(a.max, d.pct)) + '</div>';
      }).join('') + '</div>' : pv.randomAffix ? '<div class="muted small">随机 ' + pv.affixCount + ' 条特殊效果</div>' : '') + (extraHtml || '');
  };

  return ui;
})();

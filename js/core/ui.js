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
      html += '<div class="reward">' + U.itemIcon(p[0]) + '<span>' + U.itemName(p[0]) + ' ×' + p[1] + '</span></div>';
    });
    return html + '</div>';
  };

  /* 物品详情弹窗(背包、商城、配方共用) */
  ui.itemInfo = function (id, extraHtml) {
    var it = XX.data.items[id];
    var html = '<div class="item-detail">' + U.itemIcon(id, 'lg') + '<div><div class="item-detail-name">' + U.itemName(id) + '</div>' +
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
      '<div class="muted">' + (it.forged ? '炼器法宝' : '法宝') + ' · 强化 ' + U.lvText(e.lv) + (e.bpm > 1 ? ' · 器图加成 ' + U.pct(e.bpm, 0) : '') + '</div></div></div>' +
      '<p class="item-desc">' + it.desc + '</p><div class="stat-list">' +
      Object.keys(st).map(function (k) { var v = st[k]; return '<div><span>' + NAMES[k] + '</span><b>+' + (v < 1 ? U.pct(v) : U.num(v)) + '</b></div>'; }).join('') + '</div>' +
      (e.affixes && e.affixes.length ? '<div class="affix-list">' + e.affixes.map(function (a) {
        return '<div class="affix q' + e.q + '">◆ ' + XX.sys.inv.affixText(a) + '</div>';
      }).join('') + '</div>' : '');
  };

  return ui;
})();

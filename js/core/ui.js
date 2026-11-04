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
      '<div class="muted">' + XX.data.itemTypes[it.type].name + ' · ' + XX.config.qualities[it.q || 0].name + '</div></div></div>' +
      '<p class="item-desc">' + it.desc + '</p>' + (extraHtml || '');
    return html;
  };

  return ui;
})();

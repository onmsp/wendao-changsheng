/* 通用工具函数 */
XX.util = (function () {
  var U = {};

  U.rand = function (a, b) { return a + Math.random() * (b - a); };
  U.randInt = function (a, b) { return Math.floor(a + Math.random() * (b - a + 1)); };
  U.pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  U.clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  U.chance = function (p) { return Math.random() < p; };

  /* 按权重抽取下标 */
  U.weighted = function (weights, rng) {
    rng = rng || Math.random;
    var total = weights.reduce(function (s, w) { return s + w; }, 0), r = rng() * total;
    for (var i = 0; i < weights.length; i++) { r -= weights[i]; if (r < 0) return i; }
    return weights.length - 1;
  };

  /* 可复现随机数(商城按时段刷新) */
  U.seeded = function (seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  };

  U.uid = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); };

  /* 数字格式:万 / 亿 */
  U.num = function (n) {
    n = Math.floor(n || 0);
    if (n >= 1e8) return (n / 1e8).toFixed(n >= 1e10 ? 0 : 2).replace(/\.?0+$/, '') + '亿';
    if (n >= 1e5) return (n / 1e4).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '') + '万';
    return String(n);
  };
  U.pct = function (v, d) { return (v * 100).toFixed(d == null ? 1 : d).replace(/\.0$/, '') + '%'; };

  U.time = function (sec) {
    sec = Math.max(0, Math.ceil(sec));
    var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
    var p = function (x) { return (x < 10 ? '0' : '') + x; };
    return h > 0 ? h + ':' + p(m) + ':' + p(s) : p(m) + ':' + p(s);
  };
  U.timeCN = function (sec) {
    sec = Math.floor(sec);
    var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60);
    if (h) return h + '小时' + (m ? m + '分' : '');
    if (m) return m + '分' + (sec % 60 ? sec % 60 + '秒' : '');
    return sec + '秒';
  };

  U.esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  U.$ = function (sel, root) { return (root || document).querySelector(sel); };
  U.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  U.today = function () {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  };

  U.img = function (path) { return 'assets/' + path + '.webp'; };

  /* 物品图标 HTML */
  U.itemIcon = function (id, extraCls, qOverride) {
    var it = XX.data.items[id];
    if (!it) return '<div class="item-icon"></div>';
    var qi = qOverride != null ? qOverride : (it.q || 0), q = XX.config.qualities[qi];
    var style = it.hue ? ' style="filter:hue-rotate(' + it.hue + 'deg) saturate(1.1)"' : '';
    return '<div class="item-icon q' + qi + ' ' + (extraCls || '') + '" style="--qc:' + q.color + '">' +
      '<img src="' + U.img(it.icon) + '"' + style + ' alt="">' +
      (it.badge ? '<span class="badge">' + it.badge + '</span>' : '') + '</div>';
  };
  U.itemName = function (id) {
    var it = XX.data.items[id];
    if (!it) return id;
    return '<span class="qname" style="color:' + XX.config.qualities[it.q || 0].color + '">' + it.name + '</span>';
  };
  U.qColor = function (q) { return XX.config.qualities[q || 0].color; };

  U.bar = function (ratio, cls, text) {
    ratio = U.clamp(ratio || 0, 0, 1);
    return '<div class="bar ' + (cls || '') + '"><i style="width:' + (ratio * 100).toFixed(2) + '%"></i>' +
      (text ? '<span>' + text + '</span>' : '') + '</div>';
  };

  return U;
})();

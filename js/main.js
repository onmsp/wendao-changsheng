/* 入口:屏幕切换 */
(function () {
  var cur = null;
  XX.go = function (name, opts) {
    if (cur === 'game' && name !== 'game') XX.screens.game.hide();
    XX.util.$$('.screen').forEach(function (s) { s.classList.remove('active'); });
    var el = XX.util.$('#screen-' + name);
    XX.screens[name].show(opts);
    el.classList.add('active');
    cur = name;
  };

  window.addEventListener('beforeunload', function () { if (XX.store.state) XX.store.save(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden && XX.store.state) XX.store.save(); });

  /* 预加载关键素材 */
  ['bg/start', 'bg/create', 'bg/main', 'ui/btn', 'ui/frame', 'ui/title'].forEach(function (p) {
    var i = new Image(); i.src = XX.util.img(p);
  });

  XX.go('start');
})();

/* 开始页面:踏入仙途 / 再续仙缘 / 联网(暂未开放) */
XX.screens.start = (function () {
  var U = XX.util, S = {};

  S.show = function () {
    var el = U.$('#screen-start');
    var has = XX.store.hasSave();
    var motes = '';
    for (var i = 0; i < 18; i++) {
      motes += '<i style="left:' + U.randInt(2, 98) + '%;animation-delay:' + U.rand(0, 8).toFixed(1) + 's;animation-duration:' + U.rand(7, 13).toFixed(1) + 's"></i>';
    }
    el.innerHTML =
      '<div class="start-bg"></div><div class="start-mist"></div><div class="motes">' + motes + '</div>' +
      '<div class="logo">' +
      '  <img class="logo-orn" src="' + U.img('ui/title') + '" alt="">' +
      '  <h1 class="logo-text">问道长生</h1>' +
      '  <div class="logo-sub">修 仙 · 放 置 · 长 生</div>' +
      '</div>' +
      '<div class="start-menu">' +
      '  <button class="btn plaque" id="btn-new">踏入仙途</button>' +
      '  <button class="btn plaque" id="btn-continue"' + (has ? '' : ' disabled') + '>再续仙缘</button>' +
      '  <button class="btn plaque gray" id="btn-online">联网<em>暂未开放</em></button>' +
      '</div>' +
      '<div class="start-foot">v' + XX.config.version + ' · 仙路漫漫 唯心不移' +
      '<button class="start-about" id="btn-about">© ' + XX.config.about.year + ' ' + XX.config.about.author + ' · ' + XX.config.about.license + ' 开源 · 关于</button></div>';

    U.$('#btn-new').onclick = function () {
      if (XX.store.hasSave()) {
        XX.ui.confirm('重入仙途', '<p class="center">检测到已有存档。<br>重新踏入仙途将<b class="danger">覆盖</b>原有进度,确定吗?</p>', function () {
          XX.go('create');
        }, '重新开始');
      } else XX.go('create');
    };
    U.$('#btn-continue').onclick = function () {
      if (!XX.store.load()) { XX.ui.toast('未找到存档', 'warn'); return; }
      XX.go('game', { offline: true });
    };
    U.$('#btn-about').onclick = XX.ui.about;
    U.$('#btn-online').onclick = function () { XX.ui.toast('联网玩法尚在筹备中,敬请期待'); };
  };

  return S;
})();

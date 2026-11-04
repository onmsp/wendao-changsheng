/* 游戏主界面:顶部灵石/仙玉 → 功能栏 → 页面容器;主循环 */
XX.screens.game = (function () {
  var U = XX.util, G = {}, loop = null, saveTimer = null, curPage = null;
  var NAV = [
    { id: 'character', name: '人物', icon: 'icon/char' },
    { id: 'bag', name: '背包', icon: 'icon/bag' },
    { id: 'cave', name: '洞府', icon: 'icon/cave' },
    { id: 'outing', name: '外出', icon: 'icon/outing' },
    { id: 'shop', name: '商城', icon: 'icon/shop' }
  ];

  G.show = function (opts) {
    var el = U.$('#screen-game'), st = XX.store.state, P = XX.sys.player;
    el.innerHTML =
      '<div class="game-bg"></div>' +
      '<header class="topbar">' +
      '  <div class="tb-left" id="tb-me"><div class="tb-avatar"><img src="' + P.img('avatar') + '" alt=""></div>' +
      '    <div class="tb-name"><b>' + U.esc(st.name) + '</b><span id="tb-realm"></span></div></div>' +
      '  <div class="tb-cur"><div class="cur" title="灵石"><img src="' + U.img('icon/lingshi') + '" alt=""><span id="tb-stone"></span></div>' +
      '    <div class="cur jade" title="仙玉"><img src="' + U.img('icon/xianyu') + '" alt=""><span id="tb-jade"></span></div></div>' +
      '  <button class="icon-btn gear" id="tb-gear" title="设置">⚙</button>' +
      '</header>' +
      '<main class="page" id="page"></main>' +
      '<nav class="mainnav" id="mainnav">' + NAV.map(function (n) {
        return '<button data-p="' + n.id + '"><img src="' + U.img(n.icon) + '" alt=""><span>' + n.name + '</span></button>';
      }).join('') + '</nav>';

    U.$('#mainnav').onclick = function (e) {
      var b = e.target.closest('button'); if (b) G.open(b.dataset.p);
    };
    U.$('#tb-me').onclick = function () { G.open('character'); };
    U.$('#tb-gear').onclick = G.settings;

    G.open('character');
    G.refreshTop();
    clearInterval(loop); clearInterval(saveTimer);
    loop = setInterval(G.tick, 500);
    saveTimer = setInterval(XX.store.save, XX.config.autoSaveMs);

    if (opts && opts.offline) G.offlineReport();
    if (opts && opts.welcome) {
      XX.ui.modal({
        title: '仙途伊始',
        html: '<p>道友<b>' + U.esc(st.name) + '</b>,欢迎踏入修仙界。</p>' +
          '<p class="muted">· 你身负<b style="color:#b8b2a6">五色灵根</b>,每 3 秒自动吸纳 10 点修为。<br>' +
          '· 初始赠送 500 灵石与一把长剑(记得佩戴)。<br>· 修为可一直累积,突破需手动:境界越高成功率越低,可服用本境界的突破丹(只能炼制;白 +10%,每高一品质 +5%),气运也有少量加成;失败损失 20% 修为。<br>· 开局没有任何功法与技能,可在历练、秘境、商城获得玉简,获得即自动习得。<br>· 阵法最多同时 5 个生效;历练副本有 30% 概率掉落强化石与玄铁,强化石用于强化普通法宝;图纸炼制的特殊法宝最多佩戴 2 件。<br>· 炼丹、炼器、阵法需对应图纸,图纸等级越高效果越强;灵田设置播种顺序后自动种收。<br>· 前往【洞府】种植灵草、开炉炼丹;前往【外出】历练妖兽、探索秘境。<br>· 离线期间亦会持续修炼(最多 12 小时)。</p>',
        buttons: [{ text: '开始修炼', cls: 'primary' }]
      });
    }
  };

  G.hide = function () {
    clearInterval(loop); clearInterval(saveTimer);
    if (curPage && curPage.destroy) curPage.destroy();
    curPage = null;
  };

  G.open = function (id) {
    if (curPage && curPage.destroy) curPage.destroy();
    curPage = XX.pages[id];
    U.$$('#mainnav button').forEach(function (b) { b.classList.toggle('on', b.dataset.p === id); });
    var page = U.$('#page');
    page.className = 'page page-' + id;
    page.scrollTop = 0;
    curPage.render(page);
    page.classList.add('enter');
    setTimeout(function () { page.classList.remove('enter'); }, 300);
  };

  G.refreshTop = function () {
    var st = XX.store.state, P = XX.sys.player;
    U.$('#tb-stone').textContent = U.num(st.stone);
    U.$('#tb-jade').textContent = U.num(st.jade);
    U.$('#tb-realm').textContent = P.realm().name + (P.canBreak() ? ' · 可突破' : '');
    U.$('#tb-realm').classList.toggle('full', P.canBreak());
  };

  G.tick = function () {
    if (!XX.store.state) return;
    var gain = XX.sys.player.tick(Date.now());
    G._ft = (G._ft || 0) + 1;
    if (G._ft % 6 === 0) {   // 每 3 秒处理一次自动灵田
      var fr = XX.sys.cave.autoField();
      if (fr.got.length) XX.ui.toast('灵田自动收获:' + fr.got.map(function (g) { return XX.data.items[g[0]].name + '×' + g[1]; }).join('、'), 'ok');
    }
    G.refreshTop();
    if (curPage && curPage.update) curPage.update(gain);
  };

  G.offlineReport = function () {
    var r = XX.sys.player.offline(), st = XX.store.state;
    var fr = XX.sys.cave.autoField();
    if (r.sec < 60) return;
    var mine = XX.sys.cave.minePending();
    XX.ui.modal({
      title: '闭关出关',
      html: '<p class="center">你闭关了 <b>' + U.timeCN(r.sec) + '</b>' + (r.sec >= XX.config.offlineCapHours * 3600 ? '(已达上限)' : '') + '</p>' +
        '<div class="offline-grid"><div><span>获得修为</span><b>+' + U.exp(r.gain) + '</b></div>' +
        '<div><span>当前境界</span><b>' + XX.sys.player.realm().name + '</b></div>' +
        '<div><span>灵矿待收</span><b>' + U.num(mine.stone) + ' 灵石</b></div></div>' +
        (fr.got.length ? '<div class="drop-title">灵田自动收获</div>' + XX.ui.rewardList(fr.got) : ''),
      buttons: [{ text: '好', cls: 'primary' }]
    });
    if (XX.sys.player.canBreak()) XX.ui.toast('修为已足,可前往人物页手动突破');
  };

  G.settings = function () {
    var st = XX.store.state;
    XX.ui.modal({
      title: '设置',
      html: '<p class="muted small center">存档自动保存在本浏览器中(每 5 秒)。<br>版本 v' + XX.config.version + '</p>' +
        '<p class="muted small center">© ' + XX.config.about.year + ' ' + XX.config.about.author + ' · ' + XX.config.about.license + ' 开源</p>',
      buttons: [
        { text: '关于', onClick: function () { XX.ui.about(); } },
        { text: '返回标题', onClick: function () { XX.store.save(); XX.go('start'); } },
        { text: '删除存档', cls: 'danger', onClick: function () {
          XX.ui.confirm('删除存档', '<p class="center danger">此操作不可恢复,确定删除全部进度?</p>', function () { G.hide(); XX.store.wipe(); XX.go('start'); }, '删除');
        } },
        { text: '保存', cls: 'primary', onClick: function () { XX.store.save(); XX.ui.toast('已保存'); } }
      ]
    });
  };

  return G;
})();

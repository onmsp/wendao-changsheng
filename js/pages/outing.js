/* 外出页面:历练 / 秘境(战斗演出见 battle-view.js) */
XX.pages.outing = (function () {
  var U = XX.util, D = XX.data, PG = {}, tab = 'trial', root = null;
  var auto = false, busy = false, curArea = null, BV = null, waitT = null;
  function st() { return XX.store.state; }

  PG.render = function (el) {
    root = el; busy = false; auto = false; BV = XX.battleView;
    el.innerHTML = '<div class="icon-tabs two" id="out-tabs">' +
      '<button data-t="trial"' + (tab === 'trial' ? ' class="on"' : '') + '><img src="' + U.img('icon/trial') + '" alt=""><span>历练</span></button>' +
      '<button data-t="secret"' + (tab === 'secret' ? ' class="on"' : '') + '><img src="' + U.img('icon/secret') + '" alt=""><span>秘境</span></button>' +
      '</div><div id="out-body"></div>';
    U.$('#out-tabs').onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (busy) { XX.ui.toast('战斗中,无法切换'); return; }
      tab = b.dataset.t; auto = false;
      U.$$('#out-tabs button').forEach(function (x) { x.classList.toggle('on', x === b); });
      PG.list();
    };
    PG.list();
  };

  /* ---------- 地图列表 ---------- */
  PG.list = function () {
    BV.clear(); clearTimeout(waitT); curArea = null; busy = false; auto = false;
    U.$('#out-tabs').style.display = '';
    var body = U.$('#out-body'), realm = st().realm;
    if (tab === 'trial') {
      body.innerHTML = '<p class="section-tip">斩妖除魔,获取灵石、修为与天材地宝。已胜 ' + st().outing.wins + ' 场</p>' + D.areas.map(function (a) {
        var lock = realm < a.reqRealm;
        return '<div class="map-card' + (lock ? ' locked' : '') + '" data-id="' + a.id + '">' +
          '<div class="map-bg" style="background-image:url(' + U.img('bg/' + a.bg) + ')"></div>' +
          '<div class="map-mons">' + a.monsters.map(function (m) { return '<img src="' + U.img('monster/' + D.monsters[m].img) + '" alt="">'; }).join('') + '</div>' +
          '<div class="map-info"><b>' + a.name + '</b><span class="muted small">' + a.desc + '</span>' +
          '<div class="map-drops">' + a.drops.slice(0, 5).map(function (d) { return U.itemIcon(d[0], 'xs'); }).join('') + '</div></div>' +
          '<div class="map-act">' + (lock ? '<span class="danger small">需 ' + D.realms[a.reqRealm].name + '</span>' : '<button class="btn small primary">前往</button>') + '</div></div>';
      }).join('');
      body.onclick = function (e) {
        var c = e.target.closest('.map-card'); if (!c || c.classList.contains('locked')) return;
        PG.enterArea(c.dataset.id);
      };
    } else {
      var left = XX.sys.battle.secretLeft();
      body.innerHTML = '<p class="section-tip">秘境每日可探索 <b>' + left + '</b> / ' + XX.config.secretDailyTimes + ' 次,连闯多层,通关可得仙玉与珍稀宝物。</p>' + D.secrets.map(function (s) {
        var lock = realm < s.reqRealm;
        return '<div class="map-card secret' + (lock ? ' locked' : '') + '" data-id="' + s.id + '">' +
          '<div class="map-bg" style="background-image:url(' + U.img('bg/' + s.bg) + ')"></div>' +
          '<div class="map-mons">' + s.floors.slice(-2).map(function (m) { return '<img src="' + U.img('monster/' + D.monsters[m].img) + '" alt="">'; }).join('') + '</div>' +
          '<div class="map-info"><b>' + s.name + '</b><span class="muted small">' + s.desc + '</span>' +
          '<span class="small">' + s.floors.length + ' 层 · 通关 <img class="ci" src="' + U.img('icon/xianyu') + '">' + s.reward.jade[0] + '~' + s.reward.jade[1] + ' · 已通关 ' + (st().secret.clears[s.id] || 0) + ' 次</span>' +
          '<div class="map-drops">' + s.drops.map(function (d) { return U.itemIcon(d[0], 'xs'); }).join('') + '</div></div>' +
          '<div class="map-act">' + (lock ? '<span class="danger small">需 ' + D.realms[s.reqRealm].name + '</span>' : '<button class="btn small primary"' + (left > 0 ? '' : ' disabled') + '>探索</button>') + '</div></div>';
      }).join('');
      body.onclick = function (e) {
        var c = e.target.closest('.map-card'); if (!c || c.classList.contains('locked')) return;
        if (XX.sys.battle.secretLeft() <= 0) { XX.ui.toast('今日秘境次数已用尽', 'warn'); return; }
        var s = D.secrets.filter(function (x) { return x.id === c.dataset.id; })[0];
        XX.ui.confirm('探索' + s.name, '<p class="center">消耗 1 次探索机会,连闯 ' + s.floors.length + ' 层。<br><span class="muted">失败将仅获得部分灵石。</span></p>', function () { PG.enterSecret(s.id); }, '进入秘境');
      };
    }
  };

  function setBars(pHp, pMax, pMp, pMaxMp, mHp, mMax) {
    if (!U.$('#bt-php')) return;
    U.$('#bt-php').innerHTML = U.bar(pHp / pMax, 'hp', U.num(pHp) + '/' + U.num(pMax));
    U.$('#bt-pmp').innerHTML = U.bar(pMp / pMaxMp, 'mp');
    U.$('#bt-mhp').innerHTML = U.bar(mHp / mMax, 'hp foe', U.num(mHp) + '/' + U.num(mMax));
  }

  function logLine(html, cls) {
    var ul = U.$('#bt-log'); if (!ul) return;
    var li = document.createElement('li'); li.className = cls || ''; li.innerHTML = html;
    ul.insertBefore(li, ul.firstChild);
    while (ul.children.length > 40) ul.removeChild(ul.lastChild);
  }

  /* 播放一场:fight = {monster, pStart, pMax, pMp, pMaxMp, events} */
  function play(fight, done) {
    var t = XX.sys.player.tpl();
    setBars(fight.pStart, fight.pMax, fight.pMp, fight.pMaxMp, fight.monster.maxHp, fight.monster.maxHp);
    BV.playFight(fight, {
      onImpact: function (ev) {
        setBars(ev.pHp, fight.pMax, ev.pMp, fight.pMaxMp, ev.mHp, fight.monster.maxHp);
        var isP = ev.actor === 'p';
        if (ev.type === 'dodge') logLine((isP ? fight.monster.name : '你') + '身形一闪,躲开了攻击', 'muted');
        else logLine(isP ? '你' + (ev.skill ? '掐诀施展【' + t.skill + '】' : '挥招出击') + ',造成 <b class="' + (ev.type === 'crit' ? 'crit' : '') + '">' + U.num(ev.dmg) + '</b> 伤害' + (ev.type === 'crit' ? '(暴击)' : '')
          : fight.monster.name + (ev.skill ? '妖力爆发,狂暴扑击' : '扑击') + ',你受到 <b class="hurt">' + U.num(ev.dmg) + '</b> 伤害');
      },
      done: done
    });
  }

  /* ---------- 历练 ---------- */
  PG.enterArea = function (id) {
    var area = D.areas.filter(function (a) { return a.id === id; })[0];
    curArea = area;
    U.$('#out-tabs').style.display = 'none';
    BV.mount(U.$('#out-body'), { bg: area.bg, title: area.name });
    U.$('#out-body').onclick = null;
    U.$('#bt-back').onclick = function () {
      if (busy) { auto = false; PG._exit = true; XX.ui.toast('本场结束后撤退'); return; }
      PG.list();
    };
    U.$('#bt-ctrl').innerHTML = '<button class="btn primary" id="bt-go">挑 战</button><label class="auto-tog"><input type="checkbox" id="bt-auto"> 自动历练</label>';
    U.$('#bt-go').onclick = PG.fight;
    U.$('#bt-auto').onchange = function (e) { auto = e.target.checked; if (auto && !busy) PG.fight(); };
    PG._exit = false;
    var p = XX.sys.battle.playerFighter();
    U.$('#bt-mname').textContent = '???';
    setBars(p.maxHp, p.maxHp, p.mp, p.maxMp, 1, 1);
    BV.idleFoe(D.monsters[area.monsters[0]].img);
    logLine('你来到了<b>' + area.name + '</b>,四周妖气隐现……', 'muted');
  };

  PG.fight = function () {
    if (busy || !curArea || !U.$('#bt-go')) return;
    busy = true; U.$('#bt-go').disabled = true;
    var r = XX.sys.battle.fightArea(curArea.id);
    logLine('—— 遭遇 <b>' + r.monster.name + '</b> ——', 'sep');
    play({ monster: r.monster, pStart: r.player.maxHp, pMax: r.player.maxHp, pMp: r.player.maxMp, pMaxMp: r.player.maxMp, events: r.events }, function () {
      busy = false;
      if (!U.$('#bt-go')) return;
      U.$('#bt-go').disabled = false;
      if (r.win) {
        var items = r.reward.items.map(function (g) { return U.itemName(g[0]) + '×' + g[1]; }).join(' ');
        logLine('<span class="ok">胜利!</span> 灵石 +' + r.reward.stone + ' 修为 +' + r.reward.exp + (items ? ' ' + items : ''), 'win');
        BV.foeDie();
      } else {
        logLine('<span class="danger">落败……</span> 你重伤遁走,需提升实力再来。', 'lose');
        auto = false; if (U.$('#bt-auto')) U.$('#bt-auto').checked = false;
      }
      if (PG._exit) { PG._exit = false; PG.list(); return; }
      if (auto) waitT = setTimeout(PG.fight, 1200);
    });
  };

  /* ---------- 秘境 ---------- */
  PG.enterSecret = function (id) {
    var s = D.secrets.filter(function (x) { return x.id === id; })[0];
    if (XX.sys.battle.secretLeft() <= 0) return;
    st().secret.used++;
    var res = XX.sys.battle.runSecret(id);
    XX.store.save();
    busy = true;
    U.$('#out-tabs').style.display = 'none';
    BV.mount(U.$('#out-body'), { bg: s.bg, title: s.name });
    U.$('#out-body').onclick = null;
    U.$('#bt-back').onclick = function () { XX.ui.toast('秘境之中无法退出,可点击"跳过演出"'); };
    U.$('#bt-ctrl').innerHTML = '<span class="muted small">探索进行中……</span><button class="btn small" id="bt-skip">跳过演出</button>';
    var k = 0, finished = false;
    function finish() {
      if (finished) return; finished = true;
      BV.clear(); busy = false;
      if (U.$('#bt-back')) U.$('#bt-back').onclick = PG.list;
      if (U.$('#bt-ctrl')) U.$('#bt-ctrl').innerHTML = '<button class="btn primary" id="bt-ret">返回秘境列表</button>';
      if (U.$('#bt-ret')) U.$('#bt-ret').onclick = PG.list;
      var r = res.reward, extra = [{ icon: 'icon/lingshi', text: '灵石 ×' + U.num(r.stone) }];
      if (r.jade) extra.unshift({ icon: 'icon/xianyu', text: '仙玉 ×' + r.jade });
      XX.ui.modal({
        title: res.win ? '秘境通关' : '探索失败',
        html: '<p class="center">' + (res.win ? '你一路过关斩将,击败了守关首领!' : '止步第 ' + (res.cleared + 1) + ' 层(共 ' + res.total + ' 层)') + '</p>' + XX.ui.rewardList(r.items, extra),
        buttons: [{ text: '返回', cls: 'primary', onClick: function () { if (root) PG.list(); } }]
      });
    }
    U.$('#bt-skip').onclick = finish;
    function next() {
      if (finished || !U.$('#bt-floor')) return;
      if (k >= res.fights.length) { finish(); return; }
      var f = res.fights[k++];
      U.$('#bt-floor').textContent = '第 ' + f.floor + '/' + res.total + ' 层' + (f.boss ? '·首领' : '');
      logLine('—— 第 ' + f.floor + ' 层:' + f.monster.name + ' ——', 'sep');
      play({ monster: f.monster, pStart: f.pStart, pMax: f.pMax, pMp: f.pMp, pMaxMp: f.pMaxMp, events: f.events }, function () {
        if (f.win) { logLine('<span class="ok">击败 ' + f.monster.name + '</span>,调息片刻恢复三成气血', 'win'); BV.foeDie(); }
        else logLine('<span class="danger">不敌 ' + f.monster.name + '</span>', 'lose');
        waitT = setTimeout(next, 900);
      });
    }
    next();
  };

  PG.update = function () { };
  PG.destroy = function () { if (BV) BV.clear(); clearTimeout(waitT); auto = false; busy = false; root = null; };
  return PG;
})();

/* 外出页面:历练 / 秘境,含动态战斗演出 */
XX.pages.outing = (function () {
  var U = XX.util, D = XX.data, PG = {}, tab = 'trial', root = null;
  var timers = [], auto = false, busy = false, curArea = null;
  function st() { return XX.store.state; }
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  PG.render = function (el) {
    root = el; busy = false; auto = false;
    el.innerHTML = '<div class="icon-tabs two" id="out-tabs">' +
      '<button data-t="trial"' + (tab === 'trial' ? ' class="on"' : '') + '><img src="' + U.img('icon/trial') + '" alt=""><span>历练</span></button>' +
      '<button data-t="secret"' + (tab === 'secret' ? ' class="on"' : '') + '><img src="' + U.img('icon/secret') + '" alt=""><span>秘境</span></button>' +
      '</div><div id="out-body"></div>';
    U.$('#out-tabs').onclick = function (e) {
      var b = e.target.closest('button'); if (!b || busy) { if (busy) XX.ui.toast('战斗中,无法切换'); return; }
      tab = b.dataset.t; auto = false;
      U.$$('#out-tabs button').forEach(function (x) { x.classList.toggle('on', x === b); });
      PG.list();
    };
    PG.list();
  };

  /* ---------- 地图列表 ---------- */
  PG.list = function () {
    clearTimers(); curArea = null;
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
          '<span class="small">' + s.floors.length + ' 层 · 通关:<img class="ci" src="' + U.img('icon/xianyu') + '">' + s.reward.jade[0] + '~' + s.reward.jade[1] + ' · 已通关 ' + (st().secret.clears[s.id] || 0) + ' 次</span>' +
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

  /* ---------- 战斗舞台 ---------- */
  function stageHtml(bg, title) {
    var P = XX.sys.player;
    return '<div class="battle-top"><button class="icon-btn" id="bt-back">‹</button><b>' + title + '</b><span id="bt-floor"></span></div>' +
      '<div class="battle-stage" style="background-image:url(' + U.img('bg/' + bg) + ')">' +
      '  <div class="fighter me"><div class="hpbox"><div class="fname">' + U.esc(st().name) + '</div><div id="bt-php"></div><div id="bt-pmp"></div></div>' +
      '    <img id="bt-pimg" src="' + P.img('stand') + '" alt=""></div>' +
      '  <div class="vs">VS</div>' +
      '  <div class="fighter foe"><div class="hpbox"><div class="fname" id="bt-mname"></div><div id="bt-mhp"></div></div>' +
      '    <img id="bt-mimg" alt=""></div>' +
      '  <div class="skill-flash" id="bt-skill"></div>' +
      '</div>' +
      '<div class="battle-ctrl" id="bt-ctrl"></div>' +
      '<ul class="battle-log" id="bt-log"></ul>';
  }

  function setBars(pHp, pMax, pMp, pMaxMp, mHp, mMax) {
    U.$('#bt-php').innerHTML = U.bar(pHp / pMax, 'hp', U.num(pHp) + '/' + U.num(pMax));
    if (pMaxMp != null) U.$('#bt-pmp').innerHTML = U.bar(pMp / pMaxMp, 'mp');
    U.$('#bt-mhp').innerHTML = U.bar(mHp / mMax, 'hp foe', U.num(mHp) + '/' + U.num(mMax));
  }

  function logLine(html, cls) {
    var ul = U.$('#bt-log'); if (!ul) return;
    var li = document.createElement('li'); li.className = cls || ''; li.innerHTML = html;
    ul.insertBefore(li, ul.firstChild);
    while (ul.children.length > 40) ul.removeChild(ul.lastChild);
  }

  /* 播放一场战斗:fight = {monster, pStart, pMax, pMp, pMaxMp, events} */
  function play(fight, done) {
    var P = XX.sys.player, t = P.tpl();
    var pImg = U.$('#bt-pimg'), mImg = U.$('#bt-mimg');
    mImg.src = U.img('monster/' + fight.monster.img);
    mImg.className = 'enter';
    U.$('#bt-mname').textContent = fight.monster.name;
    setBars(fight.pStart, fight.pMax, fight.pMp, fight.pMaxMp, fight.monster.maxHp, fight.monster.maxHp);
    var i = 0;
    function step() {
      if (!root || !U.$('#bt-pimg')) return;
      if (i >= fight.events.length) { later(done, 500); return; }
      var ev = fight.events[i++];
      var isP = ev.actor === 'p', atkEl = isP ? pImg : mImg, defEl = isP ? mImg : pImg;
      if (isP) { pImg.src = P.img('atk'); }
      atkEl.classList.remove('lunge'); void atkEl.offsetWidth; atkEl.classList.add('lunge');
      if (ev.skill) {
        var sk = U.$('#bt-skill');
        sk.textContent = isP ? t.skill : '妖力爆发';
        sk.className = 'skill-flash show ' + (isP ? 'me' : 'foe');
        later(function () { sk.className = 'skill-flash'; }, 700);
      }
      later(function () {
        if (!U.$('#bt-pimg')) return;
        if (ev.type === 'dodge') {
          XX.ui.floatText(defEl, '闪避', 'dodge');
          logLine((isP ? '妖兽' : '你') + '身形一闪,躲开了攻击', 'muted');
        } else {
          defEl.classList.remove('hit'); void defEl.offsetWidth; defEl.classList.add('hit');
          XX.ui.floatText(defEl, (ev.type === 'crit' ? '暴击 ' : '') + '-' + U.num(ev.dmg), ev.type === 'crit' ? 'crit' : (isP ? 'dmg' : 'hurt'));
          logLine(isP ? '你' + (ev.skill ? '施展【' + t.skill + '】' : '出手') + ',造成 <b class="' + (ev.type === 'crit' ? 'crit' : '') + '">' + U.num(ev.dmg) + '</b> 伤害' + (ev.type === 'crit' ? '(暴击)' : '')
            : fight.monster.name + (ev.skill ? '狂暴扑击' : '攻击') + ',你受到 <b class="hurt">' + U.num(ev.dmg) + '</b> 伤害');
        }
        setBars(ev.pHp, fight.pMax, ev.pMp, fight.pMaxMp, ev.mHp, fight.monster.maxHp);
      }, 220);
      later(function () { if (isP && U.$('#bt-pimg')) pImg.src = P.img('stand'); }, 520);
      later(step, 640);
    }
    later(step, 450);
  }

  /* ---------- 历练 ---------- */
  PG.enterArea = function (id) {
    var area = D.areas.filter(function (a) { return a.id === id; })[0];
    curArea = area;
    U.$('#out-body').innerHTML = stageHtml(area.bg, area.name);
    U.$('#bt-back').onclick = function () { if (busy) { auto = false; XX.ui.toast('本场结束后撤退'); PG._exit = true; return; } PG.list(); };
    U.$('#bt-ctrl').innerHTML = '<button class="btn primary" id="bt-go">挑战</button><label class="auto-tog"><input type="checkbox" id="bt-auto"> 自动历练</label>';
    U.$('#bt-go').onclick = PG.fight;
    U.$('#bt-auto').onchange = function (e) { auto = e.target.checked; if (auto && !busy) PG.fight(); };
    PG._exit = false;
    var p = XX.sys.battle.playerFighter();
    U.$('#bt-mname').textContent = '???';
    setBars(p.maxHp, p.maxHp, p.mp, p.maxMp, 1, 1);
    U.$('#bt-mimg').src = U.img('monster/' + D.monsters[area.monsters[0]].img);
    U.$('#bt-mimg').className = 'idle-foe';
    logLine('你来到了<b>' + area.name + '</b>,四周妖气隐现……', 'muted');
  };

  PG.fight = function () {
    if (busy || !curArea) return;
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
        U.$('#bt-mimg').classList.add('dead');
      } else {
        logLine('<span class="danger">落败……</span> 你重伤遁走,需提升实力再来。', 'lose');
        auto = false; if (U.$('#bt-auto')) U.$('#bt-auto').checked = false;
      }
      if (PG._exit) { PG._exit = false; PG.list(); return; }
      if (auto) later(PG.fight, 1100);
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
    U.$('#out-body').innerHTML = stageHtml(s.bg, s.name);
    U.$('#bt-back').onclick = function () { XX.ui.toast('秘境之中无法退出,请等待探索结束'); };
    U.$('#bt-ctrl').innerHTML = '<span class="muted small">探索进行中……</span><button class="btn small" id="bt-skip">跳过演出</button>';
    var k = 0;
    function finish() {
      clearTimers(); busy = false;
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
      if (k >= res.fights.length) { finish(); return; }
      var f = res.fights[k++];
      U.$('#bt-floor').textContent = '第 ' + f.floor + ' / ' + res.total + ' 层' + (f.boss ? ' · 首领' : '');
      logLine('—— 第 ' + f.floor + ' 层:' + f.monster.name + ' ——', 'sep');
      play({ monster: f.monster, pStart: f.pStart, pMax: f.pMax, pMp: f.pMp, pMaxMp: f.pMaxMp, events: f.events }, function () {
        if (f.win) { logLine('<span class="ok">击败 ' + f.monster.name + '</span>,调息片刻恢复三成气血', 'win'); U.$('#bt-mimg') && U.$('#bt-mimg').classList.add('dead'); }
        else logLine('<span class="danger">不敌 ' + f.monster.name + '</span>', 'lose');
        later(next, 700);
      });
    }
    next();
  };

  PG.update = function () { };
  PG.destroy = function () { clearTimers(); auto = false; busy = false; root = null; };
  return PG;
})();

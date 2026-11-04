/* 外出页面:历练副本 / 秘境(战斗演出见 battle-view.js) */
XX.pages.outing = (function () {
  var U = XX.util, D = XX.data, C = XX.config, PG = {}, tab = 'trial', root = null;
  var auto = false, busy = false, curArea = null, BV = null, waitT = null;
  function st() { return XX.store.state; }
  function monImg(mid) { var m = D.monsters[mid]; return '<img src="' + U.img('monster/' + m.img) + '"' + (m.hue ? ' style="filter:hue-rotate(' + m.hue + 'deg)"' : '') + ' alt="">'; }

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

  /* ---------- 掉落详情弹窗(点击物品可查看介绍)---------- */
  function dropHtml(drops, table, lvText, isSecret, area) {
    var lm = XX.sys.battle.luckMul(), luckTxt = lm > 1 ? '(已含气运加成 +' + U.pct(lm - 1, 0) + ',品质越高越难获得)' : '(品质越高越难获得)';
    function cell(d) {
      var p = Math.min(1, XX.sys.battle.dropChance(d, isSecret) * lm);
      return '<button class="drop" data-item="' + d[0] + '" data-g="' + (d[4] || '') + '">' + U.itemIcon(d[0], 'sm', null, { g: d[4] }) + '<span>' + U.itemName(d[0], d[4]) + '</span><em>' + U.pct(p, p < 0.01 ? 2 : p < 0.1 ? 1 : 0) + '</em></button>';
    }
    var html = (area ? '<div class="drop-title">基础掉落<span class="muted small">(每个副本都有)</span></div><div class="drop-grid">' + XX.sys.battle.baseDrops(area).map(cell).join('') + '</div>' : '') +
      '<div class="drop-title">可能掉落<span class="muted small">' + luckTxt + '</span></div><div class="drop-grid">' + drops.filter(function (d) { return XX.sys.battle.dropAllowed(d, isSecret); }).map(cell).join('') + '</div>';
    html += '<div class="drop-title">法宝掉落(' + lvText + ')</div><div class="tq-row">' + table.map(function (p, q) {
      var Q = C.qualities[q];
      return '<div class="tq" style="--qc:' + Q.color + '"><b>◆</b><span>' + (p ? U.pct(p, p < 0.01 ? 1 : 0) : '—') + '</span></div>';
    }).join('') + '</div><p class="muted small">品质越高效果越多(颜色由低到高:白 → 金)。</p>';
    return html;
  }
  function bindDrops(w) {
    U.$$('[data-item]', w).forEach(function (b) {
      b.onclick = function () { var g = +b.dataset.g || undefined, it = D.items[b.dataset.item];
        var ex = it && it.use && it.use.kind === 'break' ? '<div class="small ok">突破成功率 +' + U.pct(C.breakPillBonus[D.qOf(b.dataset.item, g)], 0) + '</div>' : '';
        XX.ui.modal({ title: '物品介绍', html: XX.ui.itemInfo(b.dataset.item, ex, g) }); };
    });
  }
  PG.areaInfo = function (a, isSecret) {
    var lock = st().realm < a.reqRealm;
    var mons = (isSecret ? a.floors : a.monsters).filter(function (m, i, arr) { return arr.indexOf(m) === i; });
    var html = '<p class="muted">' + a.desc + '</p><div class="mon-row">' + mons.map(function (m) {
      return '<div class="mon">' + monImg(m) + '<span>' + D.monsters[m].name + '</span></div>';
    }).join('') + '</div>' +
      '<div class="small">需求境界:<b class="' + (lock ? 'danger' : 'ok') + '">' + D.realms[a.reqRealm].name + '</b>' +
      (isSecret ? ' · ' + a.floors.length + ' 层 · 通关仙玉 ' + a.reward.jade[0] + '~' + a.reward.jade[1] : ' · 灵石 ' + a.stone[0] + '~' + a.stone[1]) + '</div>' +
      dropHtml(a.drops, isSecret ? C.treasureDrop.secret : C.treasureDrop.dungeon, (isSecret ? a.power + 1 : a.power) + ' 级', isSecret, isSecret ? null : a);
    XX.ui.modal({
      title: a.name, html: html, cls: 'area-modal',
      buttons: [{ text: '关闭' }, { text: isSecret ? '进入秘境' : '前往历练', cls: 'primary', disabled: lock, onClick: function () {
        if (isSecret) PG.trySecret(a.id); else PG.enterArea(a.id);
      } }],
      onOpen: bindDrops
    });
  };

  /* ---------- 地图列表 ---------- */
  PG.list = function () {
    BV.clear(); clearTimeout(waitT); waitT = null; curArea = null; busy = false; auto = false;
    if (!U.$('#out-tabs')) return;
    U.$('#out-tabs').style.display = '';
    var body = U.$('#out-body'), realm = st().realm;
    if (tab === 'trial') {
      body.innerHTML = '<p class="section-tip">斩妖除魔,获取灵石、材料、成品、图纸与法宝。点击地图查看掉落。已胜 ' + st().outing.wins + ' 场</p>' + D.areas.map(function (a) {
        var lock = realm < a.reqRealm;
        return '<div class="map-card' + (lock ? ' locked' : '') + '" data-id="' + a.id + '">' +
          '<div class="map-bg" style="background-image:url(' + U.img('bg/' + a.bg) + ')"></div>' +
          '<div class="map-mons">' + a.monsters.slice(0, 2).map(monImg).join('') + '</div>' +
          '<div class="map-info"><b>' + a.name + ' <em class="lv">' + a.power + '级</em></b><span class="muted small">' + a.desc + '</span>' +
          '<div class="map-drops">' + a.drops.filter(function (d) { return XX.sys.battle.dropAllowed(d, false); }).slice(0, 5).map(function (d) { return U.itemIcon(d[0], 'xs', null, { g: d[4] }); }).join('') + '<span class="small muted">· 掉落 ›</span></div></div>' +
          '<div class="map-act">' + (lock ? '<span class="danger small">需 ' + D.realms[a.reqRealm].name + '</span>' : '<button class="btn small primary" data-go="1">前往</button>') + '</div></div>';
      }).join('');
      body.onclick = function (e) {
        var c = e.target.closest('.map-card'); if (!c) return;
        var a = D.areas.filter(function (x) { return x.id === c.dataset.id; })[0];
        if (e.target.closest('[data-go]') && !c.classList.contains('locked')) PG.enterArea(a.id); else PG.areaInfo(a, false);
      };
    } else {
      var left = XX.sys.battle.secretLeft();
      body.innerHTML = '<p class="section-tip">秘境次数 <b id="sec-times">' + left + '</b> / ' + C.secretMaxTimes + ',每 ' + C.secretRegenMinutes + ' 分钟恢复 1 次<span id="sec-next"></span>。通关必得仙玉,掉落只含高品质珍宝与图纸。</p>' + D.secrets.map(function (s) {
        var lock = realm < s.reqRealm;
        return '<div class="map-card secret' + (lock ? ' locked' : '') + '" data-id="' + s.id + '">' +
          '<div class="map-bg" style="background-image:url(' + U.img('bg/' + s.bg) + ')"></div>' +
          '<div class="map-mons">' + s.floors.slice(-2).map(monImg).join('') + '</div>' +
          '<div class="map-info"><b>' + s.name + '</b><span class="muted small">' + s.desc + '</span>' +
          '<span class="small">' + s.floors.length + ' 层 · 通关 <img class="ci" src="' + U.img('icon/xianyu') + '">' + s.reward.jade[0] + '~' + s.reward.jade[1] + ' · 已通关 ' + (st().secret.clears[s.id] || 0) + ' 次</span>' +
          '<div class="map-drops">' + s.drops.filter(function (d) { return XX.sys.battle.dropAllowed(d, true); }).slice(0, 5).map(function (d) { return U.itemIcon(d[0], 'xs', null, { g: d[4] }); }).join('') + '<span class="small muted">· 掉落 ›</span></div></div>' +
          '<div class="map-act">' + (lock ? '<span class="danger small">需 ' + D.realms[s.reqRealm].name + '</span>' : '<button class="btn small primary" data-go="1">探索</button>') + '</div></div>';
      }).join('');
      body.onclick = function (e) {
        var c = e.target.closest('.map-card'); if (!c) return;
        var s = D.secrets.filter(function (x) { return x.id === c.dataset.id; })[0];
        if (e.target.closest('[data-go]') && !c.classList.contains('locked')) PG.trySecret(s.id); else PG.areaInfo(s, true);
      };
      PG.update();
    }
  };

  PG.trySecret = function (id) {
    if (XX.sys.battle.secretLeft() <= 0) { XX.ui.toast('秘境次数不足,' + U.timeCN(XX.sys.battle.secretNextIn()) + '后恢复 1 次', 'warn'); return; }
    var s = D.secrets.filter(function (x) { return x.id === id; })[0];
    XX.ui.confirm('探索' + s.name, '<p class="center">消耗 1 次探索次数(剩余 ' + XX.sys.battle.secretLeft() + '),连闯 ' + s.floors.length + ' 层。<br><span class="muted">失败将仅获得部分灵石。</span></p>', function () { PG.enterSecret(s.id); }, '进入秘境');
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
  function hitsText(ev) {
    var dmgs = ev.hits.filter(function (h) { return !h.dodge; });
    if (!dmgs.length) return '被闪避';
    return '造成 ' + dmgs.map(function (h) { return '<b class="' + (h.crit ? 'crit' : '') + '">' + U.num(h.dmg) + (h.crit ? '!' : '') + '</b>'; }).join('+') + ' 伤害';
  }

  function play(fight, done) {
    setBars(fight.pStart, fight.pMax, fight.pMp, fight.pMaxMp, fight.monster.maxHp, fight.monster.maxHp);
    BV.playFight(fight, {
      onImpact: function (ev) {
        setBars(ev.pHp, fight.pMax, ev.pMp, fight.pMaxMp, ev.mHp, fight.monster.maxHp);
        if (ev.actor === 'p') {
          var sk = ev.skill && D.shentong[ev.skill];
          var t = sk ? '你施展技能【' + sk.name + (ev.lv > 1 ? '·' + ev.lv + '级' : '') + '】' : '你' + (ev.double ? '连击' : '出手');
          if (ev.hits.length) t += ',' + hitsText(ev);
          if (ev.heal) t += ',回复气血 <b class="ok">' + U.num(ev.heal) + '</b>';
          if (ev.shield) t += ',获得护盾 <b class="ok">' + U.num(ev.shield) + '</b>';
          if (ev.status && ev.status.length) t += ' <span class="st-tag">' + ev.status.join(' ') + '</span>';
          logLine(t);
        } else {
          var pre = ev.dot ? fight.monster.name + '受灼烧 <b>' + U.num(ev.dot) + '</b>' + (ev.dotKill ? ',化为灰烬!' : ';') : '';
          if (ev.dotKill) { logLine(pre); return; }
          if (ev.stunned) { logLine(pre + fight.monster.name + '陷入眩晕,无法行动', 'muted'); return; }
          var h = ev.hits[0];
          logLine(pre + (h.dodge ? '你身形一闪,躲开了' + fight.monster.name + '的攻击' : fight.monster.name + (ev.beast ? '妖力爆发,狂暴扑击' : '扑击') + ',你受到 <b class="hurt">' + U.num(h.dmg - (ev.absorb || 0)) + '</b> 伤害' +
            (ev.absorb ? '(护盾抵挡 ' + U.num(ev.absorb) + ')' : '') + (ev.reflect ? ',反震 <b>' + U.num(ev.reflect) + '</b>' : '')), h.dodge ? 'muted' : '');
        }
      },
      done: done
    });
  }

  /* ---------- 历练副本 ---------- */
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
    U.$('#bt-ctrl').innerHTML = '<button class="btn primary" id="bt-go">挑 战</button><label class="auto-tog"><input type="checkbox" id="bt-auto"> 自动历练</label><button class="btn small ghost" id="bt-drops">掉落</button>';
    U.$('#bt-go').onclick = PG.fight;
    U.$('#bt-drops').onclick = function () { PG.areaInfo(area, false); };
    U.$('#bt-auto').onchange = function (e) { auto = e.target.checked; if (auto && !busy) PG.fight(); };
    PG._exit = false;
    var p = XX.sys.battle.playerFighter();
    setBars(p.maxHp, p.maxHp, p.mp, p.maxMp, 1, 1);
    BV.idleFoe(D.monsters[area.monsters[0]]);
    U.$('#bt-mname').textContent = '???';
    logLine('你来到了<b>' + area.name + '</b>,四周妖气隐现……', 'muted');
    PG.update();
  };

  PG.fight = function () {
    if (busy || !curArea || !U.$('#bt-go')) return;
    var cd = XX.sys.battle.cooldownLeft();
    if (cd > 0) { if (!auto) XX.ui.toast('妖兽尚未刷新,请稍候 ' + Math.ceil(cd) + ' 秒'); return; }
    busy = true; U.$('#bt-go').disabled = true;
    var r = XX.sys.battle.fightArea(curArea.id);
    logLine('—— 遭遇 <b>' + r.monster.name + '</b> ——', 'sep');
    play({ monster: r.monster, pStart: r.player.maxHp, pMax: r.player.maxHp, pMp: r.player.maxMp, pMaxMp: r.player.maxMp, events: r.events }, function () {
      busy = false;
      st().outing.cdUntil = Date.now() + C.dungeonCooldownSec * 1000;   // 演出结束后开始计算刷新
      if (!U.$('#bt-go')) return;
      if (r.win) {
        var items = r.reward.items.map(function (g) { return U.itemName(g[0], g[2]) + '×' + g[1]; }).join(' ');
        var tre = r.reward.treasure ? ' <span style="color:' + U.qColor(r.reward.treasure.q) + '">【' + r.reward.treasure.name + '】</span>' : '';
        logLine('<span class="ok">胜利!</span> 灵石 +' + r.reward.stone + ' 修为 +' + U.exp(r.reward.exp) + (items ? ' ' + items : '') + tre, 'win');
        if (r.reward.treasure && r.reward.treasure.q >= 2) XX.ui.toast('获得法宝 <span style="color:' + U.qColor(r.reward.treasure.q) + '">' + r.reward.treasure.name + '</span>', 'ok');
        BV.foeDie();
      } else {
        logLine(r.timeout ? '<span class="danger">' + C.battle.maxRounds + ' 回合未分胜负,判定失败……</span> 需提升攻击力再来。' : '<span class="danger">落败……</span> 你重伤遁走,需提升实力再来。', 'lose');
        auto = false; if (U.$('#bt-auto')) U.$('#bt-auto').checked = false;
      }
      if (PG._exit) { PG._exit = false; PG.list(); return; }
      PG.update();
    });
  };

  /* ---------- 秘境 ---------- */
  PG.enterSecret = function (id) {
    var s = D.secrets.filter(function (x) { return x.id === id; })[0];
    if (!XX.sys.battle.useSecret()) { XX.ui.toast('秘境次数不足', 'warn'); return; }
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
        html: '<p class="center">' + (res.win ? '你一路过关斩将,击败了守关首领!' : '止步第 ' + (res.cleared + 1) + ' 层(共 ' + res.total + ' 层)') + '</p>' +
          (r.treasure ? '<div class="treasure-get">' + XX.ui.equipDetail(r.treasure) + '</div>' : '') + XX.ui.rewardList(r.items, extra),
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
        else logLine(f.timeout ? '<span class="danger">' + C.battle.maxRounds + ' 回合未能击败 ' + f.monster.name + ',判定失败</span>' : '<span class="danger">不敌 ' + f.monster.name + '</span>', 'lose');
        waitT = setTimeout(next, 900);
      });
    }
    next();
  };

  /* 每 0.5 秒:刷新冷却倒计时、秘境次数 */
  PG.update = function () {
    if (!root) return;
    var go = U.$('#bt-go');
    if (go && curArea && !busy) {
      var cd = XX.sys.battle.cooldownLeft();
      go.disabled = cd > 0;
      go.innerHTML = cd > 0 ? '妖兽刷新 ' + Math.ceil(cd) + 's' : '挑 战';
      if (cd <= 0 && auto && !busy && !waitT) { waitT = setTimeout(function () { waitT = null; PG.fight(); }, 300); }
    }
    if (U.$('#sec-times')) {
      U.$('#sec-times').textContent = XX.sys.battle.secretLeft();
      var nx = XX.sys.battle.secretNextIn();
      U.$('#sec-next').textContent = nx > 0 ? '(下次恢复 ' + U.time(nx) + ')' : '(已满)';
    }
  };
  PG.destroy = function () { if (BV) BV.clear(); clearTimeout(waitT); waitT = null; auto = false; busy = false; root = null; };
  return PG;
})();

/* 战斗模拟:先完整推演,再交给界面逐步播放 */
XX.sys.battle = (function () {
  var B = {}, D = XX.data, U = XX.util;
  function st() { return XX.store.state; }

  B.playerFighter = function () {
    var s = XX.sys.player.stats();
    return {
      side: 'p', name: st().name, maxHp: s.hp, hp: s.hp, maxMp: s.mp, mp: s.mp,
      atk: s.atk, def: s.def, spd: s.spd, sense: s.sense, crit: s.crit, critDmg: s.critDmg, dodge: s.dodge
    };
  };

  B.monsterFighter = function (mid, power, mul) {
    var m = D.monsters[mid], c = D.monsterCurve;
    mul = mul || 1;
    var hp = Math.round(c.hp[0] * Math.pow(c.hp[1], power) * m.hp * mul * U.rand(0.92, 1.08));
    return {
      side: 'm', id: mid, name: (mul > 1.3 ? '【首领】' : '') + m.name, img: m.img,
      maxHp: hp, hp: hp, maxMp: 0, mp: 0,
      atk: Math.round(c.atk[0] * Math.pow(c.atk[1], power) * m.atk * Math.sqrt(mul)),
      def: Math.round(c.def[0] * Math.pow(c.def[1], power) * m.def),
      spd: Math.round((c.spd[0] + power * c.spd[1]) * m.spd),
      sense: 5 + power * 2, crit: 0.05, critDmg: 1.5, dodge: 0.03
    };
  };

  function attack(a, d) {
    var ev = { actor: a.side };
    var dodge = U.clamp(d.dodge + Math.max(0, d.spd - a.spd) * 0.002, 0, 0.4);
    var skill = false;
    if (a.side === 'p' && a.mp >= a.maxMp * 0.3 && Math.random() < 0.45) { skill = true; a.mp -= Math.round(a.maxMp * 0.3); }
    if (a.side === 'm' && Math.random() < 0.15) skill = true;
    if (Math.random() < dodge) { ev.type = 'dodge'; }
    else {
      var crit = Math.random() < U.clamp(a.crit - d.sense * 0.0005, 0.01, 0.75);
      var dmg = a.atk * a.atk / (a.atk + d.def) * U.rand(0.9, 1.1);
      if (skill) dmg *= a.side === 'p' ? 1.6 : 1.4;
      if (crit) dmg *= a.critDmg;
      dmg = Math.max(1, Math.round(dmg));
      d.hp = Math.max(0, d.hp - dmg);
      ev.type = crit ? 'crit' : 'hit'; ev.dmg = dmg;
    }
    ev.skill = skill;
    if (a.side === 'p') a.mp = Math.min(a.maxMp, a.mp + Math.round(a.maxMp * 0.08));
    return ev;
  }

  /* 推演一场战斗 */
  B.simulate = function (p, m) {
    var events = [], first = p.spd > m.spd || (p.spd === m.spd && Math.random() < 0.5) ? [p, m] : [m, p];
    for (var round = 1; round <= 30 && p.hp > 0 && m.hp > 0; round++) {
      for (var k = 0; k < 2; k++) {
        var a = first[k], d = first[1 - k];
        if (a.hp <= 0 || d.hp <= 0) continue;
        var ev = attack(a, d);
        ev.round = round; ev.pHp = p.hp; ev.mHp = m.hp; ev.pMp = p.mp;
        events.push(ev);
      }
    }
    return { win: m.hp <= 0 && p.hp > 0, events: events };
  };

  /* 掉落结算 */
  B.rollDrops = function (drops, luck) {
    var res = [];
    drops.forEach(function (d) {
      if (Math.random() < d[1] * (1 + luck / 100)) res.push([d[0], U.randInt(d[2], d[3])]);
    });
    return res;
  };

  /* 历练:一场战斗并结算奖励 */
  B.fightArea = function (areaId) {
    var area = D.areas.filter(function (a) { return a.id === areaId; })[0];
    var p = B.playerFighter(), m = B.monsterFighter(U.pick(area.monsters), area.power, 1);
    var r = B.simulate(p, m);
    r.player = { maxHp: p.maxHp, maxMp: p.maxMp };
    r.monster = { id: m.id, img: m.img, name: m.name, maxHp: m.maxHp };
    if (r.win) {
      var luck = XX.sys.player.stats().luck;
      var stone = U.randInt(area.stone[0], area.stone[1]);
      var exp = U.randInt(area.exp[0], area.exp[1]);
      st().stone += stone;
      exp = XX.sys.player.addExp(exp);
      r.reward = { stone: stone, exp: exp, items: XX.sys.inv.grant(B.rollDrops(area.drops, luck)) };
      st().outing.wins++;
    } else st().outing.losses++;
    return r;
  };

  /* 秘境:连闯多层,气血延续,每层恢复 30% */
  B.runSecret = function (sid) {
    var sec = D.secrets.filter(function (s) { return s.id === sid; })[0];
    var p = B.playerFighter(), fights = [], cleared = 0;
    for (var i = 0; i < sec.floors.length; i++) {
      var isBoss = i === sec.floors.length - 1;
      var m = B.monsterFighter(sec.floors[i], sec.power + i * 0.5, isBoss ? sec.bossMul : 1);
      var startHp = p.hp, startMp = p.mp, mMax = m.maxHp;
      var r = B.simulate(p, m);
      fights.push({ floor: i + 1, boss: isBoss, monster: { id: m.id, img: m.img, name: m.name, maxHp: mMax }, pStart: startHp, pMp: startMp, pMax: p.maxHp, pMaxMp: p.maxMp, events: r.events, win: r.win });
      if (!r.win) break;
      cleared++;
      p.hp = Math.min(p.maxHp, p.hp + Math.round(p.maxHp * 0.3));
    }
    var res = { fights: fights, cleared: cleared, total: sec.floors.length, win: cleared === sec.floors.length };
    var luck = XX.sys.player.stats().luck;
    var ratio = cleared / sec.floors.length;
    var stone = Math.round(U.randInt(sec.reward.stone[0], sec.reward.stone[1]) * ratio);
    st().stone += stone;
    res.reward = { stone: stone, jade: 0, items: [] };
    if (res.win) {
      var jade = U.randInt(sec.reward.jade[0], sec.reward.jade[1]);
      st().jade += jade;
      res.reward.jade = jade;
      res.reward.items = XX.sys.inv.grant(B.rollDrops(sec.drops, luck));
      st().secret.clears[sid] = (st().secret.clears[sid] || 0) + 1;
      XX.store.addLog('探索【' + sec.name + '】大获全胜,获得仙玉 ' + jade + '。');
    } else {
      XX.store.addLog('探索【' + sec.name + '】止步第 ' + (cleared + 1) + ' 层,狼狈退出。');
    }
    return res;
  };

  B.secretLeft = function () {
    var s = st().secret, today = U.today();
    if (s.day !== today) { s.day = today; s.used = 0; }
    return XX.config.secretDailyTimes - s.used;
  };

  return B;
})();

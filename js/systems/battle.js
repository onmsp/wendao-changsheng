/*
 * 战斗模拟:先完整推演,再交给 battle-view.js 逐步播放
 * 事件 ev:{actor:'p'|'m', skill:技能id|null, beast:妖兽大招, hits:[{dmg,crit,dodge}], heal, reflect, pHp, mHp, pMp}
 */
XX.sys.battle = (function () {
  var B = {}, D = XX.data, U = XX.util, C = XX.config;
  function st() { return XX.store.state; }

  B.playerFighter = function () {
    var P = XX.sys.player, s = P.stats(), af = P.battleAffix();
    return {
      side: 'p', name: st().name, maxHp: s.hp, hp: s.hp, maxMp: s.mp, mp: s.mp,
      atk: s.atk, def: s.def, spd: s.spd, sense: s.sense, crit: s.crit, critDmg: s.critDmg, dodge: s.dodge,
      lifesteal: af.lifesteal || 0, thorns: af.thorns || 0, double: af.double || 0, pierce: af.pierce || 0, mpRegen: 0.08 + (af.mpRegen || 0),
      shield: 0,
      skills: P.activeShentong().map(function (id) { return { id: id, lv: P.stLv(id) }; })
    };
  };

  B.monsterFighter = function (mid, power, mul) {
    var m = D.monsters[mid], c = D.monsterCurve;
    mul = mul || 1;
    var hp = Math.round(c.hp[0] * Math.pow(c.hp[1], power) * m.hp * mul * U.rand(0.92, 1.08));
    return {
      side: 'm', id: mid, name: (mul > 1.3 ? '【首领】' : '') + m.name, img: m.img, hue: m.hue || 0,
      maxHp: hp, hp: hp, maxMp: 0, mp: 0,
      atk: Math.round(c.atk[0] * Math.pow(c.atk[1], power) * m.atk * Math.sqrt(mul)),
      def: Math.round(c.def[0] * Math.pow(c.def[1], power) * m.def),
      spd: Math.round((c.spd[0] + power * c.spd[1]) * m.spd),
      sense: 5 + power * 2, crit: 0.05, critDmg: 1.5, dodge: 0.03, pierce: 0, lifesteal: 0, thorns: 0, double: 0
    };
  };
  B.monsterInfo = function (f) { return { id: f.id, img: f.img, hue: f.hue, name: f.name, maxHp: f.maxHp }; };

  function effAtk(f) { return f.atk * (1 + (f.atkUp && f.atkUp.t > 0 ? f.atkUp.v : 0)); }
  function effDef(f) { return f.def * (1 - (f.armorDown && f.armorDown.t > 0 ? f.armorDown.v : 0)); }

  function hit(a, d, mult) {
    var dodge = U.clamp(d.dodge + Math.max(0, d.spd - a.spd) * 0.002, 0, 0.4);
    if (Math.random() < dodge) return { dmg: 0, dodge: true };
    var crit = Math.random() < U.clamp(a.crit - d.sense * 0.0005, 0.01, 0.75);
    var atk = effAtk(a), def = effDef(d) * (1 - (a.pierce || 0));
    var BC = C.battle;
    /* 减伤 = 防御 / (防御 + 攻击);保底造成攻击力 15% 的伤害,避免「打不动」 */
    var dmg = Math.max(atk * atk / (atk + def), atk * BC.minDmgAtk) * U.rand(0.9, 1.1) * mult;
    if (crit) dmg *= a.critDmg;
    /* 单次伤害上限(占目标最大气血):普攻 35%、暴击 50%、技能 50%,避免「秒杀」 */
    var cap = d.maxHp * (mult > 1 ? BC.skillCap : crit ? BC.critCap : BC.hitCap);
    return { dmg: Math.max(1, Math.round(Math.min(dmg, cap))), crit: crit };
  }

  /* 玩家技能:按栏位顺序逐个判定触发概率;灵力不足或条件不满足则跳过 */
  function choose(p) {
    for (var i = 0; i < p.skills.length; i++) {
      var sk = p.skills[i], def = D.shentongAt(sk.id, sk.lv);
      if (p.mp < def.mpCost) continue;
      if (def.type === 'heal' && p.hp > p.maxHp * 0.55) continue;
      if (def.type === 'shield' && (p.hp > p.maxHp * 0.7 || p.shield > p.maxHp * 0.1)) continue;
      if (def.type === 'buff' && p.atkUp && p.atkUp.t > 0) continue;
      if (Math.random() < def.chance) return sk;
    }
    return null;
  }

  /*
   * 行动事件 ev:
   *   actor 'p'|'m';skill 技能id;lv 技能等级;hits[{dmg,crit,dodge}];heal;shield;status[] 新附加状态文字
   *   (妖兽)dot 灼烧伤害;stunned 眩晕跳过;absorb 护盾抵挡;reflect 反震;beast 妖力爆发
   */
  function act(a, d) {
    var ev = { actor: a.side, hits: [], heal: 0, reflect: 0, status: [] };
    var total = 0;
    if (a.side === 'p') {
      if (a.atkUp && a.atkUp.t > 0) a.atkUp.t--;
      var sk = choose(a), def = sk && D.shentongAt(sk.id, sk.lv);
      if (sk) {
        ev.skill = sk.id; ev.lv = sk.lv; a.mp -= def.mpCost;
        if (def.mult) {
          var n = def.type === 'multi' ? def.hits : 1;
          for (var i = 0; i < n; i++) { var h = hit(a, d, def.mult * (1 + def.overDmg)); ev.hits.push(h); total += h.dmg; }
        }
        var landed = ev.hits.some(function (h) { return !h.dodge; });
        /* 治疗类效果在同一场战斗中逐次衰减(×0.7),护盾总量不超过最大气血 50% */
        var decay = Math.pow(C.battle.healDecay, a.healUsed || 0);
        if (def.heal) ev.heal += Math.round(a.maxHp * def.heal * decay);
        if (def.drain) ev.heal += Math.round(total * def.drain * decay);
        if (def.shield) {
          ev.shield = Math.max(0, Math.min(Math.round(a.maxHp * def.shield * decay), Math.round(a.maxHp * C.battle.shieldCap) - (a.shield || 0)));
          a.shield = (a.shield || 0) + ev.shield;
        }
        if (def.heal || def.drain || def.shield) a.healUsed = (a.healUsed || 0) + 1;
        if (def.atkUp) { a.atkUp = { v: def.atkUp.pct, t: def.atkUp.turns + 1 }; ev.status.push('攻击+' + U.pct(def.atkUp.pct, 0)); }
        if (landed && def.burn) { d.burn = { dmg: Math.max(1, Math.round(effAtk(a) * def.burn.pct)), t: def.burn.turns }; ev.status.push('灼烧'); }
        if (landed && def.armor) { d.armorDown = { v: def.armor.pct, t: def.armor.turns }; ev.status.push('破甲'); }
        if (landed && def.stun && Math.random() < def.stun) { d.stunned = true; ev.status.push('眩晕'); }
      } else {
        var h1 = hit(a, d, 1); ev.hits.push(h1); total += h1.dmg;
        if (a.double && Math.random() < a.double) { var h2 = hit(a, d, 1); h2.extra = true; ev.hits.push(h2); total += h2.dmg; ev.double = true; }
      }
      if (a.lifesteal) ev.heal += Math.min(Math.round(total * a.lifesteal), Math.round(a.maxHp * C.battle.lifestealCap));
      a.mp = Math.min(a.maxMp, a.mp + Math.round(a.maxMp * a.mpRegen));
      d.hp = Math.max(0, d.hp - total);
    } else {
      /* 妖兽回合:先结算灼烧、眩晕 */
      if (a.burn && a.burn.t > 0) {
        ev.dot = a.burn.dmg; a.burn.t--;
        a.hp = Math.max(0, a.hp - ev.dot);
        if (a.hp <= 0) { ev.dotKill = true; return ev; }
      }
      if (a.armorDown && a.armorDown.t > 0) a.armorDown.t--;
      if (a.stunned) { a.stunned = false; ev.stunned = true; return ev; }
      ev.beast = Math.random() < 0.15;
      var hm = hit(a, d, ev.beast ? 1.4 : 1); ev.hits.push(hm); total = hm.dmg;
      if (d.shield && total > 0) { ev.absorb = Math.min(d.shield, total); d.shield -= ev.absorb; total -= ev.absorb; }
      if (d.thorns && hm.dmg > 0) ev.reflect = Math.max(1, Math.min(Math.round(hm.dmg * d.thorns), Math.round(a.maxHp * C.battle.thornsCap)));
      d.hp = Math.max(0, d.hp - total);
    }
    if (ev.heal) a.hp = Math.min(a.maxHp, a.hp + ev.heal);
    if (ev.reflect) a.hp = Math.max(0, a.hp - ev.reflect);
    return ev;
  }

  B.simulate = function (p, m) {
    var events = [], order = p.spd > m.spd || (p.spd === m.spd && Math.random() < 0.5) ? [p, m] : [m, p];
    var maxR = C.battle.maxRounds;
    for (var round = 1; round <= maxR && p.hp > 0 && m.hp > 0; round++) {
      for (var k = 0; k < 2; k++) {
        var a = order[k], d = order[1 - k];
        if (a.hp <= 0 || d.hp <= 0) continue;
        var ev = act(a, d);
        ev.round = round; ev.pHp = p.hp; ev.mHp = m.hp; ev.pMp = p.mp; ev.pShield = p.shield || 0;
        events.push(ev);
      }
    }
    /* 超过回合上限仍未分胜负判定为失败 */
    var win = m.hp <= 0 && p.hp > 0;
    return { win: win, timeout: !win && p.hp > 0 && m.hp > 0, events: events };
  };

  /* 实际掉率 = 基础概率 × 品质系数(品质越高按比例降低);副本不出金色,秘境只出紫/金且不出特殊道具 */
  B.dropAllowed = function (d, isSecret) {
    var it = D.items[d[0]];
    if (!it || it.noDrop) return false;
    var q = D.qOf(d[0], d[4]);
    if (isSecret) return q >= C.secretMinQ && !(it.type === 'special' && !it.scroll && !it.bpRef && !it.secretOk);
    return q <= C.dungeonMaxQ && !it.secretOk;
  };
  B.dropChance = function (d, isSecret) {
    if (!B.dropAllowed(d, isSecret)) return 0;
    return d[1] * C.tierDropMul[D.qOf(d[0], d[4])];
  };
  /* 气运掉率加成:每点 +0.5%,100 气运 ≈ +50% */
  B.luckMul = function (luck) {
    if (luck == null) luck = XX.sys.player.stats().luck;
    return 1 + C.luckDropPer * U.clamp(luck, 0, C.luckDropMaxLuck);
  };
  /* 副本基础掉落:玄铁 30%、强化石 30% */
  B.baseDrops = function (area) {
    var p = area.power;
    return C.dungeonBaseDrops.map(function (b) {
      return b[0] === 'stone_qh' ? [b[0], b[1], area.qh[0], area.qh[1]] : [b[0], b[1], 1 + Math.floor(p / 8), 2 + Math.floor(p / 6)];
    });
  };
  B.rollDrops = function (drops, luck, isSecret) {
    var res = [];
    var lm = B.luckMul(luck);
    drops.forEach(function (d) { if (Math.random() < B.dropChance(d, isSecret) * lm) res.push([d[0], U.randInt(d[2], d[3]), d[4] ? { g: d[4] } : undefined]); });
    return res;
  };

  /* 法宝掉落:table 为 5 个品阶的概率,至多掉落 1 件(从高品阶开始判定) */
  B.rollTreasure = function (table, lv) {
    var r = Math.random(), acc = 0;
    for (var q = 4; q >= 0; q--) {
      acc += table[q] || 0;
      if (r < acc) return XX.sys.inv.makeEquip(U.pick(D.treasureBases), q, lv, 1);
    }
    return null;
  };

  /* ---------- 历练副本 ---------- */
  B.cooldownLeft = function () { return Math.max(0, ((st().outing.cdUntil || 0) - Date.now()) / 1000); };
  B.fightArea = function (areaId) {
    var area = D.areas.filter(function (a) { return a.id === areaId; })[0];
    var p = B.playerFighter(), m = B.monsterFighter(U.pick(area.monsters), area.power, 1);
    var r = B.simulate(p, m);
    r.player = { maxHp: p.maxHp, maxMp: p.maxMp };
    r.monster = B.monsterInfo(m);
    if (r.win) {
      var luck = XX.sys.player.stats().luck;
      var stone = U.randInt(area.stone[0], area.stone[1]);
      st().stone += stone;
      var exp = XX.sys.player.addExp(U.randInt(area.exp[0], area.exp[1]));
      var drops = B.rollDrops(B.baseDrops(area).concat(area.drops), luck);
      r.reward = { stone: stone, exp: exp, items: XX.sys.inv.grant(drops), treasure: null };
      var eq = B.rollTreasure(C.treasureDrop.dungeon, area.power);
      if (eq && XX.sys.inv.addInstance(eq)) r.reward.treasure = eq;
      st().outing.wins++;
    } else st().outing.losses++;
    st().outing.cdUntil = Date.now() + C.dungeonCooldownSec * 1000;
    return r;
  };

  /* ---------- 秘境:连闯多层,气血延续,每层恢复 30% ---------- */
  B.secretLeft = function () {
    var s = st().secret, now = Date.now(), per = C.secretRegenMinutes * 60000;
    if (s.times >= C.secretMaxTimes) { s.last = now; return s.times; }
    var gain = Math.floor((now - s.last) / per);
    if (gain > 0) { s.times = Math.min(C.secretMaxTimes, s.times + gain); s.last = s.times >= C.secretMaxTimes ? now : s.last + gain * per; }
    return s.times;
  };
  B.secretNextIn = function () {
    var s = st().secret;
    if (B.secretLeft() >= C.secretMaxTimes) return 0;
    return (s.last + C.secretRegenMinutes * 60000 - Date.now()) / 1000;
  };
  B.useSecret = function () {
    var s = st().secret;
    if (B.secretLeft() <= 0) return false;
    if (s.times >= C.secretMaxTimes) s.last = Date.now();
    s.times--;
    return true;
  };

  B.runSecret = function (sid) {
    var sec = D.secrets.filter(function (s) { return s.id === sid; })[0];
    var p = B.playerFighter(), fights = [], cleared = 0;
    for (var i = 0; i < sec.floors.length; i++) {
      var isBoss = i === sec.floors.length - 1;
      var m = B.monsterFighter(sec.floors[i], sec.power + (D.monsterCurve.secretPlus || 0) + i * 0.5, isBoss ? sec.bossMul : 1);
      var startHp = p.hp, startMp = p.mp;
      p.atkUp = null;
      var r = B.simulate(p, m);
      fights.push({ floor: i + 1, boss: isBoss, monster: B.monsterInfo(m), pStart: startHp, pMp: startMp, pMax: p.maxHp, pMaxMp: p.maxMp, events: r.events, win: r.win, timeout: r.timeout });
      if (!r.win) break;
      cleared++;
      p.hp = Math.min(p.maxHp, p.hp + Math.round(p.maxHp * 0.3));
    }
    var res = { fights: fights, cleared: cleared, total: sec.floors.length, win: cleared === sec.floors.length };
    var luck = XX.sys.player.stats().luck, ratio = cleared / sec.floors.length;
    var stone = Math.round(U.randInt(sec.reward.stone[0], sec.reward.stone[1]) * ratio);
    st().stone += stone;
    res.reward = { stone: stone, jade: 0, items: [], treasure: null };
    if (res.win) {
      var jade = U.randInt(sec.reward.jade[0], sec.reward.jade[1]);
      st().jade += jade;
      res.reward.jade = jade;
      res.reward.items = XX.sys.inv.grant(B.rollDrops(sec.drops, luck, true));
      var eq = B.rollTreasure(C.treasureDrop.secret, sec.power + 1);
      if (eq && XX.sys.inv.addInstance(eq)) res.reward.treasure = eq;
      st().secret.clears[sid] = (st().secret.clears[sid] || 0) + 1;
      XX.store.addLog('探索【' + sec.name + '】大获全胜,获得仙玉 ' + jade + (eq ? ',得法宝【' + eq.name + '】' : '') + '。');
    } else {
      XX.store.addLog('探索【' + sec.name + '】止步第 ' + (cleared + 1) + ' 层,狼狈退出。');
    }
    return res;
  };

  return B;
})();

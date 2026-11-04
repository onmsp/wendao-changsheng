/*
 * 战斗演出(类 RPG 侧视战斗):
 *   角色动作帧 assets/char/{id}_bidle 待机 / _bwind 蓄势 / _batk 出招 / _bcast 掐诀 / _bhurt 受击(均面向右侧怪物)
 *   特效精灵 assets/vfx/slash 剑气 / circle 法阵 / burst 爆裂 / claw 爪痕(青色基调,运行时按颜色做色相旋转)
 *   普攻演出按角色 atkFx 区分;神通演出按 shentong.fx 区分
 */
XX.battleView = (function () {
  var U = XX.util, D = XX.data, V = {}, timers = [], el = {}, frames = {}, color = '#9fe0ff', atkFx = 'slash';
  var VFX_BASE_HUE = 190;
  var FXC = { fire: '#ff8a2a', thunder: '#c89bff', heal: '#7dff9a', golden: '#ffd24a', rune: '#ffd24a', foxfire: '#ff8ad0', sound: '#b48cff',
    twin: '#ff4a5a', leaf: '#7dff6a', mist: '#a060ff', heavy: '#ff5a3a', swords: '#8fd8ff', sun: '#ffb030', drain: '#ff3060',
    shield: '#ffe08a', rage: '#ff3a3a' };

  function st() { return XX.store.state; }
  function speed() { return st().battleSpeed || 1; }
  function later(fn, ms) { var t = setTimeout(fn, ms / speed()); timers.push(t); return t; }
  V.clear = function () { timers.forEach(clearTimeout); timers = []; };
  V.alive = function () { return !!(el.fx && el.fx.isConnected); };

  function hueOf(hex) {
    var r = parseInt(hex.substr(1, 2), 16) / 255, g = parseInt(hex.substr(3, 2), 16) / 255, b = parseInt(hex.substr(5, 2), 16) / 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, h = 0;
    if (!d) return 0;
    if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
    return (h * 60 + 360) % 360;
  }
  function hueRot(col) { return hueOf(col) - VFX_BASE_HUE; }

  /* ---------- 舞台 ---------- */
  V.mount = function (box, opts) {
    V.clear();
    var P = XX.sys.player, t = P.tpl();
    color = t.color; atkFx = t.atkFx || 'slash';
    ['bidle', 'bwind', 'batk', 'bcast', 'bhurt'].forEach(function (k) { frames[k] = P.img(k); var i = new Image(); i.src = frames[k]; });
    ['slash', 'circle', 'burst', 'claw'].forEach(function (k) { var i = new Image(); i.src = U.img('vfx/' + k); });
    box.innerHTML =
      '<div class="battle-top"><button class="icon-btn" id="bt-back">‹</button><b>' + opts.title + '</b><span id="bt-floor"></span></div>' +
      '<div class="battle-stage" id="bt-stage" style="background-image:url(' + U.img('bg/' + opts.bg) + ');--cc:' + color + '">' +
      '  <div class="stage-inner" id="bt-inner">' +
      '    <div class="stage-dim" id="bt-dim"></div><div class="stage-flash" id="bt-flash"></div>' +
      '    <div class="fighter me" id="bt-me"><div class="f-shadow"></div><img id="bt-pimg" src="' + frames.bidle + '" alt=""></div>' +
      '    <div class="fighter foe" id="bt-foe"><div class="f-shadow"></div><img id="bt-mimg" alt=""></div>' +
      '    <div class="fx-layer" id="bt-fx"></div>' +
      '  </div>' +
      '  <div class="hud me"><div class="fname">' + U.esc(st().name) + '</div><div id="bt-php"></div><div id="bt-pmp"></div></div>' +
      '  <div class="hud foe"><div class="fname" id="bt-mname"></div><div id="bt-mhp"></div></div>' +
      '  <div class="skill-flash" id="bt-skill"></div>' +
      '  <button class="speed-btn" id="bt-speed">×' + speed() + '</button>' +
      '</div>' +
      '<div class="battle-ctrl" id="bt-ctrl"></div>' +
      '<ul class="battle-log" id="bt-log"></ul>';
    ['stage', 'inner', 'dim', 'flash', 'me', 'foe', 'pimg', 'mimg', 'fx', 'skill', 'mname', 'speed'].forEach(function (k) { el[k] = U.$('#bt-' + k); });
    el.speed.onclick = function () { st().battleSpeed = speed() === 1 ? 2 : 1; el.speed.textContent = '×' + speed(); };
  };

  /* ---------- 基础工具 ---------- */
  function center(node) {
    var r = node.getBoundingClientRect(), f = el.fx.getBoundingClientRect();
    return { x: r.left - f.left + r.width / 2, y: r.top - f.top + r.height / 2, w: r.width, h: r.height, bottom: r.bottom - f.top, right: r.right - f.left };
  }
  function frame(k) { if (el.pimg) el.pimg.src = frames[k]; }
  function move(node, kf, dur, easing) {
    node.getAnimations().forEach(function (a) { a.cancel(); });
    return node.animate(kf, { duration: dur / speed(), easing: easing || 'ease-out', fill: 'forwards' });
  }
  function sprite(name, x, y, w, kf, dur, opt) {
    if (!V.alive()) return null;
    opt = opt || {};
    var img = new Image();
    img.src = U.img('vfx/' + name);
    img.className = 'fx-sprite';
    img.style.left = x + 'px'; img.style.top = y + 'px'; img.style.width = w + 'px';
    var h = opt.col ? hueRot(opt.col) : (opt.hue || 0);
    img.style.filter = 'hue-rotate(' + Math.round(h) + 'deg) saturate(1.4) brightness(1.15)';
    el.fx.appendChild(img);
    var a = img.animate(kf, { duration: dur / speed(), delay: (opt.delay || 0) / speed(), easing: opt.easing || 'ease-out', fill: 'both' });
    a.onfinish = function () { img.remove(); };
    return img;
  }
  /* 弹道:从 a 飞到 b(arc 为弧线高度,spin 是否旋转) */
  function travel(name, a, b, w, dur, opt) {
    opt = opt || {};
    var dx = b.x - a.x, dy = b.y - a.y, arc = opt.arc || 0, spin = opt.spin ? 720 : 0;
    var rot = opt.rot != null ? opt.rot : Math.atan2(dy, dx) * 180 / Math.PI;
    return sprite(name, a.x, a.y, w, [
      { opacity: 0, transform: 'translate(-50%,-50%) rotate(' + rot + 'deg) scale(.5)' },
      { opacity: 1, offset: .15, transform: 'translate(calc(-50% + ' + dx * 0.15 + 'px), calc(-50% + ' + (dy * 0.15 + arc * 0.5) + 'px)) rotate(' + (rot + spin * 0.15) + 'deg) scale(.9)' },
      { opacity: 1, offset: .5, transform: 'translate(calc(-50% + ' + dx * 0.5 + 'px), calc(-50% + ' + (dy * 0.5 + arc) + 'px)) rotate(' + (rot + spin * 0.5) + 'deg) scale(1)' },
      { opacity: .9, transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) rotate(' + (rot + spin) + 'deg) scale(1.1)' }
    ], dur, { col: opt.col, delay: opt.delay, easing: 'ease-in' });
  }
  function particles(x, y, n, col, mode, radius, opt) {
    if (!V.alive()) return;
    opt = opt || {};
    for (var i = 0; i < n; i++) {
      var p = document.createElement('i');
      p.className = 'fx-dot' + (opt.leaf ? ' leaf' : '');
      var s = U.rand(3, 7);
      p.style.width = (opt.leaf ? s * 2.4 : s) + 'px'; p.style.height = s + 'px';
      p.style.left = x + 'px'; p.style.top = y + 'px';
      p.style.background = col; p.style.boxShadow = '0 0 8px ' + col + ', 0 0 3px #fff';
      el.fx.appendChild(p);
      var ang = Math.random() * Math.PI * 2, r = U.rand(radius * 0.5, radius);
      var dx = Math.cos(ang) * r, dy = Math.sin(ang) * r, kf;
      if (mode === 'gather') kf = [{ transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.6)', opacity: 0 }, { opacity: 1, offset: .3 }, { transform: 'translate(0,0) scale(.3)', opacity: 0 }];
      else if (mode === 'to') kf = [{ transform: 'translate(0,0) rotate(0)', opacity: 0 }, { opacity: 1, offset: .2 }, { transform: 'translate(' + (opt.dx + U.rand(-20, 20)) + 'px,' + (opt.dy + U.rand(-30, 30)) + 'px) rotate(' + U.randInt(180, 720) + 'deg)', opacity: .2 }];
      else if (mode === 'rise') kf = [{ transform: 'translate(' + dx * 0.6 + 'px, 20px)', opacity: 0 }, { opacity: 1, offset: .3 }, { transform: 'translate(' + dx * 0.6 + 'px,' + (-radius * 1.2) + 'px)', opacity: 0 }];
      else kf = [{ transform: 'translate(0,0) scale(1.2)', opacity: 1 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.2)', opacity: 0 }];
      var a = p.animate(kf, { duration: (opt.dur || U.rand(380, 620)) / speed(), delay: ((opt.delay || 0) + U.rand(0, opt.spread || 150)) / speed(), easing: 'ease-out', fill: 'both' });
      a.onfinish = (function (node) { return function () { node.remove(); }; })(p);
    }
  }
  function ring(x, y, col, size, dur, delay, dx) {
    if (!V.alive()) return;
    var r = document.createElement('i');
    r.className = 'fx-ring';
    r.style.left = x + 'px'; r.style.top = y + 'px'; r.style.borderColor = col; r.style.boxShadow = '0 0 12px ' + col + ', inset 0 0 10px ' + col;
    el.fx.appendChild(r);
    var a = r.animate([
      { transform: 'translate(-50%,-50%) translateX(0) scale(.2)', opacity: 1, width: size * 0.4 + 'px', height: size * 0.8 + 'px' },
      { transform: 'translate(-50%,-50%) translateX(' + (dx || 0) + 'px) scale(1)', opacity: 0, width: size * 0.4 + 'px', height: size * 0.8 + 'px' }
    ], { duration: dur / speed(), delay: (delay || 0) / speed(), easing: 'ease-out', fill: 'both' });
    a.onfinish = function () { r.remove(); };
  }
  function shake(px) {
    el.inner.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(' + px + 'px,' + (-px / 2) + 'px)' },
      { transform: 'translate(' + (-px) + 'px,' + (px / 2) + 'px)' }, { transform: 'translate(' + (px / 2) + 'px,0)' }, { transform: 'translate(0,0)' }], { duration: 320 / speed() });
  }
  function flash(col, op) {
    el.flash.style.background = col;
    el.flash.animate([{ opacity: 0 }, { opacity: op || .6, offset: .2 }, { opacity: 0 }], { duration: 380 / speed() });
  }
  function skillText(text, side) {
    el.skill.textContent = text;
    el.skill.className = 'skill-flash ' + side; void el.skill.offsetWidth;
    el.skill.className = 'skill-flash show ' + side;
  }

  /* 命中反馈:逐段显示伤害 */
  function impact(ev, onImpact, big) {
    if (!V.alive()) return;
    var toFoe = ev.actor === 'p', target = toFoe ? el.mimg : el.pimg, dir = toFoe ? 1 : -1;
    var anyHit = false;
    ev.hits.forEach(function (h, i) {
      later(function () {
        if (!V.alive()) return;
        if (h.dodge) {
          target.animate([{ transform: 'none', opacity: 1 }, { transform: 'translate(' + (dir * 16) + '%, -6%)', opacity: .35, offset: .4 }, { transform: 'none', opacity: 1 }], { duration: 440 / speed() });
          XX.ui.floatText(target, '闪避', 'dodge');
          return;
        }
        anyHit = true;
        target.animate([{ filter: 'brightness(1)', transform: 'none' }, { filter: 'brightness(2.8) saturate(0)', transform: 'translateX(' + (dir * (big ? 16 : 9)) + 'px) rotate(' + (dir * 3) + 'deg)', offset: .25 }, { filter: 'brightness(1)', transform: 'none' }], { duration: 360 / speed() });
        XX.ui.floatText(target, (h.crit ? '暴击 ' : '') + '-' + U.num(h.dmg), h.crit ? 'crit' : (toFoe ? 'dmg' : 'hurt'));
        if (!toFoe) { frame('bhurt'); later(function () { frame('bidle'); }, 420); }
      }, i * 120);
    });
    later(function () {
      if (!V.alive()) return;
      if (ev.hits.some(function (h) { return !h.dodge; })) shake(big || ev.hits.some(function (h) { return h.crit; }) ? 11 : 5);
      if (ev.heal) XX.ui.floatText(toFoe ? el.pimg : el.mimg, '+' + U.num(ev.heal), 'heal');
      if (toFoe && ev.status && ev.status.length) ev.status.forEach(function (t, k) {
        later(function () { if (V.alive()) XX.ui.floatText(el.mimg, t, 'status'); }, 260 + k * 220);
      });
      if (ev.absorb) XX.ui.floatText(el.pimg, '护盾 -' + U.num(ev.absorb), 'dodge');
      if (ev.reflect) XX.ui.floatText(el.mimg, '反震 -' + U.num(ev.reflect), 'dmg');
      if (onImpact) onImpact(ev);
    }, (ev.hits.length - 1) * 120 + 40);
    return ev.hits.length * 120;
  }

  /* ---------- 玩家普攻:按职业演出 ---------- */
  function playerNormal(ev, onImpact, done) {
    var me = el.me, c0 = center(el.pimg), foe = center(el.mimg);
    var hand = { x: c0.x + c0.w * 0.25, y: c0.y - c0.h * 0.05 };
    var dashTo = { slash: 44, thrust: 34, twin: 42, heavy: 46 }[atkFx];
    frame('bwind');
    move(me, [{ transform: 'translateX(0)' }, { transform: 'translateX(-5%) scale(1.02)' }], 260);
    particles(hand.x, hand.y, 10, color, 'gather', c0.w * 0.5);
    var T = 300, hitAt;
    later(function () {
      frame('batk');
      if (atkFx === 'heavy') move(me, [{ transform: 'translateX(-5%)' }, { transform: 'translate(22%,-22%) scale(1.05)', offset: .55 }, { transform: 'translateX(46%) scale(1.08)' }], 300, 'ease-in');
      else if (dashTo) move(me, [{ transform: 'translateX(-5%)' }, { transform: 'translateX(' + dashTo + '%) scale(1.06)' }], 170, 'cubic-bezier(.2,.9,.3,1)');
      else move(me, [{ transform: 'translateX(-5%)' }, { transform: 'translateX(8%) scale(1.04)' }], 160);
    }, T);
    var f = foe, a = hand;
    switch (atkFx) {
      case 'slash':
        hitAt = T + 150;
        later(function () { sprite('slash', f.x, f.y, f.w * 1.4, [{ opacity: 0, transform: 'translate(-50%,-50%) rotate(-32deg) scale(.3,.5)' }, { opacity: 1, offset: .3, transform: 'translate(-50%,-50%) rotate(-14deg) scale(1.05,1)' }, { opacity: 0, transform: 'translate(-50%,-50%) rotate(8deg) scale(1.3,1.1)' }], 440, { col: color }); particles(f.x, f.y, 10, color, 'burst', f.w * 0.5); }, hitAt);
        break;
      case 'thrust':
        hitAt = T + 140;
        later(function () { sprite('slash', f.x - f.w * 0.1, f.y, f.w * 1.8, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.2,.25)' }, { opacity: 1, offset: .3, transform: 'translate(-50%,-50%) scale(1.1,.3)' }, { opacity: 0, transform: 'translate(-30%,-50%) scale(1.3,.2)' }], 380, { col: color }); particles(f.x, f.y, 14, '#dff6ff', 'burst', f.w * 0.6); }, hitAt);
        break;
      case 'twin':
        hitAt = T + 140;
        later(function () {
          sprite('slash', f.x, f.y, f.w * 1.2, [{ opacity: 0, transform: 'translate(-50%,-50%) rotate(35deg) scale(.3)' }, { opacity: 1, offset: .35, transform: 'translate(-50%,-50%) rotate(35deg) scale(1)' }, { opacity: 0, transform: 'translate(-50%,-50%) rotate(35deg) scale(1.2)' }], 360, { col: color });
          sprite('slash', f.x, f.y, f.w * 1.2, [{ opacity: 0, transform: 'translate(-50%,-50%) rotate(-35deg) scaleX(-1) scale(.3)' }, { opacity: 1, offset: .35, transform: 'translate(-50%,-50%) rotate(-35deg) scaleX(-1) scale(1)' }, { opacity: 0, transform: 'translate(-50%,-50%) rotate(-35deg) scaleX(-1) scale(1.2)' }], 360, { col: color, delay: 110 });
        }, hitAt);
        break;
      case 'heavy':
        hitAt = T + 300;
        later(function () {
          sprite('slash', f.x, f.y, f.h * 1.2, [{ opacity: 0, transform: 'translate(-50%,-50%) rotate(80deg) scale(.4)' }, { opacity: 1, offset: .3, transform: 'translate(-50%,-50%) rotate(85deg) scale(1.1)' }, { opacity: 0, transform: 'translate(-50%,-50%) rotate(90deg) scale(1.3)' }], 420, { col: FXC.heavy });
          sprite('circle', f.x, f.bottom - 6, f.w * 1.3, [{ opacity: 1, transform: 'translate(-50%,-50%) scale(.2,.06)' }, { opacity: 0, transform: 'translate(-50%,-50%) scale(1.4,.35)' }], 520, { col: FXC.heavy });
          particles(f.x, f.bottom - 10, 16, '#ffb070', 'burst', f.w * 0.6);
        }, hitAt);
        break;
      case 'rune':
        hitAt = T + 420;
        later(function () { travel('circle', a, f, c0.w * 0.45, 400, { col: FXC.rune, spin: true, rot: 0 }); }, T + 20);
        later(function () { sprite('burst', f.x, f.y, f.w * 1.1, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.3)' }, { opacity: 1, offset: .3, transform: 'translate(-50%,-50%) scale(1)' }, { opacity: 0, transform: 'translate(-50%,-50%) scale(1.4)' }], 420, { col: FXC.rune }); particles(f.x, f.y, 14, FXC.rune, 'burst', f.w * 0.6); }, hitAt);
        break;
      case 'fire':
        hitAt = T + 400;
        later(function () { travel('burst', a, f, c0.w * 0.42, 380, { col: FXC.fire, spin: true }); particles(a.x, a.y, 10, FXC.fire, 'to', 10, { dx: f.x - a.x, dy: f.y - a.y, dur: 400, spread: 300 }); }, T + 20);
        later(function () { sprite('burst', f.x, f.y, f.w * 1.3, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.3)' }, { opacity: 1, offset: .3, transform: 'translate(-50%,-50%) scale(1.1)' }, { opacity: 0, transform: 'translate(-50%,-50%) scale(1.5)' }], 460, { col: FXC.fire }); particles(f.x, f.y, 16, '#ffcf6a', 'burst', f.w * 0.7); }, hitAt);
        break;
      case 'foxfire':
        hitAt = T + 520;
        [-70, 0, 70].forEach(function (arc, i) { later(function () { travel('burst', a, f, c0.w * 0.28, 380, { col: FXC.foxfire, arc: arc, spin: true }); }, T + i * 90); });
        later(function () { particles(f.x, f.y, 18, FXC.foxfire, 'burst', f.w * 0.6); }, hitAt);
        break;
      case 'wave':
        hitAt = T + 460;
        [0, 1, 2].forEach(function (i) { later(function () { travel('slash', { x: a.x, y: a.y - 20 + i * 20 }, { x: f.x, y: f.y - 20 + i * 20 }, c0.w * 0.45, 340, { col: FXC.sound, rot: 90 }); }, T + i * 80); });
        later(function () { particles(f.x, f.y, 12, FXC.sound, 'burst', f.w * 0.5); }, hitAt);
        break;
      case 'sound':
        hitAt = T + 450;
        [0, 1, 2].forEach(function (i) { ring(a.x, a.y, FXC.mist, c0.h * 0.7, 520, T + i * 110, f.x - a.x); });
        later(function () { particles(f.x, f.y, 14, FXC.mist, 'burst', f.w * 0.6); }, hitAt);
        break;
      case 'leaf':
        hitAt = T + 460;
        later(function () { particles(a.x, a.y, 22, FXC.leaf, 'to', 8, { dx: f.x - a.x, dy: f.y - a.y, dur: 440, spread: 220, leaf: true }); }, T + 10);
        later(function () { sprite('burst', f.x, f.y, f.w * 1.0, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.3) rotate(0)' }, { opacity: 1, offset: .3, transform: 'translate(-50%,-50%) scale(1) rotate(30deg)' }, { opacity: 0, transform: 'translate(-50%,-50%) scale(1.3) rotate(60deg)' }], 420, { col: FXC.leaf }); }, hitAt);
        break;
    }
    var dur = 0;
    later(function () { dur = impact(ev, onImpact, atkFx === 'heavy'); }, hitAt + 20);
    later(function () {
      move(me, [{ transform: getComputedStyle(me).transform === 'none' ? 'translateX(0)' : getComputedStyle(me).transform }, { transform: 'translateX(0) scale(1)' }], 320, 'ease-in-out');
    }, hitAt + 420);
    later(function () { frame('bidle'); }, hitAt + 560);
    later(done, hitAt + 700 + (ev.hits.length - 1) * 120);
  }

  /* ---------- 玩家神通:掐诀 → 法阵 → 释放 ---------- */
  function playerSkill(ev, onImpact, done) {
    var def = D.shentong[ev.skill], fx = def.fx, col = fx === 'sword' ? color : (FXC[fx] || color), selfCast = ['heal', 'buff', 'shield'].indexOf(def.type) >= 0;
    var me = el.me, c0 = center(el.pimg), foe = center(el.mimg), hand = { x: c0.x + c0.w * 0.2, y: c0.y - c0.h * 0.12 };
    frame('bcast');
    el.dim.classList.add('on');
    skillText(def.name + (ev.lv > 1 ? ' ' + ['', '', '贰', '叁', '肆', '伍'][ev.lv] + '重' : ''), 'me');
    sprite('circle', c0.x, c0.bottom - c0.h * 0.06, c0.w * 1.2, [
      { opacity: 0, transform: 'translate(-50%,-50%) scale(.2,.07) rotate(0deg)' }, { opacity: 1, offset: .2, transform: 'translate(-50%,-50%) scale(1,.32) rotate(70deg)' },
      { opacity: 1, offset: .8, transform: 'translate(-50%,-50%) scale(1.05,.34) rotate(250deg)' }, { opacity: 0, transform: 'translate(-50%,-50%) scale(1.2,.4) rotate(320deg)' }
    ], 1700, { col: col, easing: 'linear' });
    [0, 220, 440].forEach(function (d) { later(function () { particles(hand.x, hand.y, 12, col, 'gather', c0.w * 0.8); }, d); });
    move(me, [{ transform: 'translateY(0)' }, { transform: 'translateY(-4%) scale(1.03)' }], 700, 'ease-in-out');
    var R = 760, hitAt = R + 360, big = true, f = foe;

    if (selfCast) {
      later(function () {
        sprite('circle', c0.x, c0.y, c0.w * 1.1, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.3) rotate(0)' }, { opacity: .9, offset: .4, transform: 'translate(-50%,-50%) scale(1) rotate(90deg)' }, { opacity: 0, transform: 'translate(-50%,-50%) scale(1.2) rotate(180deg)' }], 900, { col: col });
        particles(c0.x, c0.bottom - 20, 26, col, 'rise', c0.h * 0.6, { spread: 400 });
        flash(col, .25);
      }, R);
      later(function () {
        if (!V.alive()) return;
        if (onImpact) onImpact(ev);
        if (ev.heal) XX.ui.floatText(el.pimg, '+' + U.num(ev.heal), 'heal');
        if (ev.shield) later(function () { if (V.alive()) XX.ui.floatText(el.pimg, '护盾 +' + U.num(ev.shield), 'status'); }, 200);
        (ev.status || []).forEach(function (t, k) { later(function () { if (V.alive()) XX.ui.floatText(el.pimg, t, 'status'); }, 250 + k * 220); });
        if (ev.shield) el.me.classList.add('shielded');
        if (def.type === 'buff') { el.pimg.animate([{ filter: 'drop-shadow(0 0 0 #f00)' }, { filter: 'drop-shadow(0 0 22px ' + col + ') brightness(1.3)' }, { filter: 'drop-shadow(0 0 6px ' + col + ')' }], { duration: 700 / speed() }); }
      }, R + 380);
      later(function () { el.dim.classList.remove('on'); move(me, [{ transform: 'translateY(-4%) scale(1.03)' }, { transform: 'translateY(0) scale(1)' }], 320); frame('bidle'); }, R + 900);
      later(done, R + 1100);
      return;
    }
    later(function () {
      frame('batk');
      move(me, [{ transform: 'translateY(-4%) scale(1.03)' }, { transform: 'translateX(12%) scale(1.06)' }], 200, 'cubic-bezier(.2,.9,.3,1)');
      var a = center(el.pimg); a = { x: a.x + a.w * 0.25, y: a.y };
      switch (fx) {
        case 'swords':
          for (var i = 0; i < 6; i++) (function (i) {
            var x = f.x + U.rand(-f.w * 0.3, f.w * 0.3);
            sprite('slash', x, f.y - f.h * 0.9, f.w * 0.7, [{ opacity: 0, transform: 'translate(-50%,-50%) rotate(90deg) scale(.6)' }, { opacity: 1, offset: .3 }, { opacity: 1, transform: 'translate(-50%, calc(-50% + ' + f.h * 0.9 + 'px)) rotate(90deg) scale(.9)' }], 300, { col: col, delay: i * 70, easing: 'ease-in' });
          })(i);
          hitAt = R + 360;
          break;
        case 'thunder':
          later(function () { flash('#ffffff', .7); sprite('slash', f.x, f.y - f.h * 0.3, f.h * 1.6, [{ opacity: 0, transform: 'translate(-50%,-50%) rotate(92deg) scale(1,.25)' }, { opacity: 1, offset: .2, transform: 'translate(-50%,-50%) rotate(88deg) scale(1,.35)' }, { opacity: 0, transform: 'translate(-50%,-50%) rotate(90deg) scale(1.1,.2)' }], 420, { col: col }); }, 200);
          hitAt = R + 240;
          break;
        case 'rune':
          sprite('circle', f.x, f.y, f.w * 1.3, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.2) rotate(0)' }, { opacity: 1, offset: .5, transform: 'translate(-50%,-50%) scale(1) rotate(180deg)' }, { opacity: 0, transform: 'translate(-50%,-50%) scale(.6) rotate(360deg)' }], 700, { col: col });
          hitAt = R + 520;
          break;
        case 'sound': case 'mist':
          for (var k = 0; k < 5; k++) ring(a.x, a.y, col, c0.h * 0.9, 560, k * 90, f.x - a.x);
          hitAt = R + 520;
          break;
        case 'foxfire':
          [-90, -45, 0, 45, 90].forEach(function (arc, i) { travel('burst', a, f, c0.w * 0.3, 420, { col: col, arc: arc, spin: true, delay: i * 70 }); });
          hitAt = R + 600;
          break;
        case 'leaf':
          particles(a.x, a.y, 40, col, 'to', 10, { dx: f.x - a.x, dy: f.y - a.y, dur: 520, spread: 300, leaf: true });
          hitAt = R + 560;
          break;
        case 'twin':
          [35, -35, 20, -20].forEach(function (r, i) { sprite('slash', f.x, f.y, f.w * 1.3, [{ opacity: 0, transform: 'translate(-50%,-50%) rotate(' + r + 'deg) scale(.3)' }, { opacity: 1, offset: .35, transform: 'translate(-50%,-50%) rotate(' + r + 'deg) scale(1.05)' }, { opacity: 0, transform: 'translate(-50%,-50%) rotate(' + r + 'deg) scale(1.25)' }], 320, { col: col, delay: 120 + i * 90 }); });
          hitAt = R + 260;
          break;
        case 'heavy':
          move(me, [{ transform: 'translateY(-4%)' }, { transform: 'translate(25%,-30%) scale(1.08)', offset: .5 }, { transform: 'translateX(46%) scale(1.1)' }], 340, 'ease-in');
          later(function () {
            sprite('slash', f.x, f.y, f.h * 1.5, [{ opacity: 0, transform: 'translate(-50%,-50%) rotate(80deg) scale(.4)' }, { opacity: 1, offset: .3, transform: 'translate(-50%,-50%) rotate(86deg) scale(1.15)' }, { opacity: 0, transform: 'translate(-50%,-50%) rotate(90deg) scale(1.35)' }], 460, { col: col });
            [0, 120].forEach(function (d) { sprite('circle', f.x, f.bottom - 6, f.w * 1.6, [{ opacity: 1, transform: 'translate(-50%,-50%) scale(.2,.06)' }, { opacity: 0, transform: 'translate(-50%,-50%) scale(1.5,.4)' }], 560, { col: col, delay: d }); });
            flash(col, .35);
          }, 320);
          hitAt = R + 360;
          break;
        case 'drain':
          sprite('burst', f.x, f.y, f.w * 1.2, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.3)' }, { opacity: 1, offset: .3, transform: 'translate(-50%,-50%) scale(1)' }, { opacity: 0, transform: 'translate(-50%,-50%) scale(1.3)' }], 460, { col: col });
          later(function () { particles(f.x, f.y, 24, col, 'to', 10, { dx: a.x - f.x, dy: a.y - f.y, dur: 600, spread: 300 }); }, 260);
          hitAt = R + 200;
          break;
        default: /* fire / sun / sword */
          if (fx === 'sword') {
            sprite('slash', (a.x + f.x) / 2, (a.y + f.y) / 2, Math.abs(f.x - a.x) * 1.25, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.2,.6)' }, { opacity: .95, offset: .5, transform: 'translate(-50%,-50%) scale(1,.8)' }, { opacity: 0, transform: 'translate(-50%,-50%) scale(1.2,.5)' }], 420, { col: col });
            hitAt = R + 300;
          } else {
            travel('burst', a, f, c0.w * (fx === 'sun' ? 0.75 : 0.55), 360, { col: col, spin: true });
            particles(a.x, a.y, 14, col, 'to', 10, { dx: f.x - a.x, dy: f.y - a.y, dur: 380, spread: 300 });
            hitAt = R + 380;
          }
      }
    }, R);
    later(function () {
      if (!V.alive()) return;
      sprite('burst', f.x, f.y, f.w * (fx === 'sun' ? 1.9 : 1.5), [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.2) rotate(0)' }, { opacity: 1, offset: .3, transform: 'translate(-50%,-50%) scale(1.1) rotate(20deg)' }, { opacity: 0, transform: 'translate(-50%,-50%) scale(1.7) rotate(40deg)' }], 560, { col: col });
      if (fx === 'sword' || fx === 'twin') sprite('slash', f.x, f.y, f.w * 1.6, [{ opacity: 0, transform: 'translate(-50%,-50%) rotate(30deg) scale(.4)' }, { opacity: 1, offset: .3, transform: 'translate(-50%,-50%) rotate(15deg) scale(1.1)' }, { opacity: 0, transform: 'translate(-50%,-50%) rotate(0deg) scale(1.3)' }], 480, { col: col, delay: 60 });
      if (fx === 'sun' || fx === 'fire') flash(col, .4);
      particles(f.x, f.y, 22, col, 'burst', f.w * 0.8);
      impact(ev, onImpact, big);
    }, hitAt + 80);
    var end = hitAt + 80 + (ev.hits.length - 1) * 120;
    later(function () { el.dim.classList.remove('on'); move(me, [{ transform: getComputedStyle(me).transform === 'none' ? 'translateX(0)' : getComputedStyle(me).transform }, { transform: 'translateX(0) scale(1)' }], 340, 'ease-in-out'); }, end + 380);
    later(function () { frame('bidle'); }, end + 560);
    later(done, end + 700);
  }

  /* ---------- 妖兽:后仰蓄力 → 扑击 → 爪痕 ---------- */
  function monsterAct(ev, onImpact, done) {
    var foe = el.foe, mimg = el.mimg, pre = 0;
    if (ev.dot) {
      var cb = center(mimg);
      particles(cb.x, cb.y, 12, FXC.fire, 'rise', cb.h * 0.5, { spread: 200 });
      mimg.animate([{ filter: 'brightness(1)' }, { filter: 'brightness(1.6) sepia(1) saturate(4) hue-rotate(-20deg)' }, { filter: 'brightness(1)' }], { duration: 420 / speed() });
      XX.ui.floatText(mimg, '灼烧 -' + U.num(ev.dot), 'burn');
      if (onImpact && (ev.dotKill || ev.stunned)) onImpact(ev);
      if (ev.dotKill) { later(done, 600); return; }
      pre = 520;
    }
    if (ev.stunned) {
      later(function () {
        if (!V.alive()) return;
        XX.ui.floatText(mimg, '眩晕中', 'status');
        mimg.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(4deg)' }, { transform: 'rotate(0)' }], { duration: 500 / speed() });
        if (!ev.dot && onImpact) onImpact(ev);
      }, pre);
      later(done, pre + 700);
      return;
    }
    if (ev.beast) {
      pre += 520;
      skillText('妖力爆发', 'foe');
      mimg.animate([{ filter: 'drop-shadow(0 0 0 #f00)' }, { filter: 'drop-shadow(0 0 18px #ff3030) brightness(1.3)' }, { filter: 'drop-shadow(0 0 4px #f00)' }, { filter: 'drop-shadow(0 0 22px #ff3030) brightness(1.4)' }], { duration: 520 / speed() });
      var c0 = center(mimg);
      particles(c0.x, c0.y, 14, '#ff4a4a', 'gather', c0.w * 0.7);
    }
    later(function () { move(foe, [{ transform: 'translateX(0)' }, { transform: 'translateX(9%) scale(1.06)' }], 240); }, pre);
    later(function () { if (el.me && !(ev.pShield > 0)) el.me.classList.remove('shielded'); }, pre + 700);
    later(function () { move(foe, [{ transform: 'translateX(9%) scale(1.06)' }, { transform: 'translateX(-52%) scale(1.1)' }], 170, 'cubic-bezier(.2,.9,.3,1)'); }, pre + 250);
    later(function () {
      if (!V.alive()) return;
      var c = center(el.pimg);
      if (!ev.hits[0].dodge) {
        sprite('claw', c.x, c.y, c.w * (ev.beast ? 0.9 : 0.65), [{ opacity: 0, transform: 'translate(-50%,-50%) translate(30px,-30px) scale(.5)' }, { opacity: 1, offset: .3, transform: 'translate(-50%,-50%) scale(1)' }, { opacity: 0, transform: 'translate(-50%,-50%) translate(-12px,12px) scale(1.15)' }], 420, { hue: 0 });
        if (ev.beast) sprite('burst', c.x, c.y, c.w, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.3)' }, { opacity: .9, offset: .3, transform: 'translate(-50%,-50%) scale(1)' }, { opacity: 0, transform: 'translate(-50%,-50%) scale(1.4)' }], 480, { hue: 170 });
        particles(c.x, c.y, 8, '#ff5050', 'burst', c.w * 0.4);
      }
      impact(ev, onImpact, ev.beast);
    }, pre + 400);
    later(function () { move(foe, [{ transform: 'translateX(-52%) scale(1.1)' }, { transform: 'translateX(0) scale(1)' }], 320, 'ease-in-out'); }, pre + 760);
    later(done, pre + 1100);
  }

  /* ---------- 妖兽登场 / 倒下 / 待机 ---------- */
  function setFoeImg(m) {
    el.mimg.src = U.img('monster/' + m.img);
    el.mimg.style.filter = m.hue ? 'hue-rotate(' + m.hue + 'deg)' : '';
  }
  V.enterFoe = function (m) {
    setFoeImg(m);
    el.mname.textContent = m.name;
    el.foe.style.opacity = '';
    move(el.foe, [{ transform: 'translateX(40%)', opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }], 500);
  };
  V.foeDie = function () { if (V.alive()) move(el.foe, [{ opacity: 1, filter: 'none' }, { opacity: 0, transform: 'translateY(6%) scale(.9)', filter: 'grayscale(1) brightness(2.2)' }], 700); };
  V.idleFoe = function (m) { setFoeImg(m); el.foe.style.opacity = '.4'; };

  V.playFight = function (fight, hooks) {
    frame('bidle');
    V.enterFoe(fight.monster);
    var i = 0;
    function next() {
      if (!V.alive()) return;
      if (i >= fight.events.length) { later(hooks.done, 300); return; }
      var ev = fight.events[i++];
      var act = ev.actor === 'p' ? (ev.skill ? playerSkill : playerNormal) : monsterAct;
      act(ev, hooks.onImpact, function () { later(next, 140); });
    }
    later(next, 600);
  };

  return V;
})();

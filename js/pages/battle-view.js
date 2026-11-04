/*
 * 战斗演出:逐帧动作(蓄势/掐诀/出招)+ 补间位移 + 特效精灵(剑气/法阵/爆裂/爪痕)+ 粒子 + 震屏
 * 角色动作帧:assets/char/{id}_stand / _wind(蓄势) / _cast(掐诀) / _atk(出招)
 * 特效素材:assets/vfx/slash / circle / burst / claw(青色基调,按角色主色做色相旋转)
 */
XX.battleView = (function () {
  var U = XX.util, V = {}, timers = [], el = {}, frames = {}, hue = 0, color = '#9fe0ff';
  var VFX_BASE_HUE = 190;

  function st() { return XX.store.state; }
  function speed() { return st().battleSpeed || XX.config.battleSpeed || 1; }
  function later(fn, ms) { var t = setTimeout(fn, ms / speed()); timers.push(t); return t; }
  V.clear = function () { timers.forEach(clearTimeout); timers = []; };

  function hueOf(hex) {
    var r = parseInt(hex.substr(1, 2), 16) / 255, g = parseInt(hex.substr(3, 2), 16) / 255, b = parseInt(hex.substr(5, 2), 16) / 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, h = 0;
    if (!d) return 0;
    if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
    return (h * 60 + 360) % 360;
  }

  /* 搭建战斗舞台 */
  V.mount = function (box, opts) {
    V.clear();
    var P = XX.sys.player, t = P.tpl();
    color = t.color; hue = hueOf(t.color) - VFX_BASE_HUE;
    ['stand', 'wind', 'cast', 'atk'].forEach(function (k) { frames[k] = P.img(k); var i = new Image(); i.src = frames[k]; });
    ['slash', 'circle', 'burst', 'claw'].forEach(function (k) { var i = new Image(); i.src = U.img('vfx/' + k); });
    box.innerHTML =
      '<div class="battle-top"><button class="icon-btn" id="bt-back">‹</button><b>' + opts.title + '</b><span id="bt-floor"></span></div>' +
      '<div class="battle-stage" id="bt-stage" style="background-image:url(' + U.img('bg/' + opts.bg) + ');--cc:' + color + '">' +
      '  <div class="stage-inner" id="bt-inner">' +
      '    <div class="stage-dim" id="bt-dim"></div>' +
      '    <div class="fighter me" id="bt-me"><div class="f-shadow"></div><img id="bt-pimg" src="' + frames.stand + '" alt=""></div>' +
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
    ['stage', 'inner', 'dim', 'me', 'foe', 'pimg', 'mimg', 'fx', 'skill', 'mname', 'speed'].forEach(function (k) { el[k] = U.$('#bt-' + k); });
    el.speed.onclick = function () {
      st().battleSpeed = speed() === 1 ? 2 : 1;
      el.speed.textContent = '×' + speed();
    };
  };

  V.alive = function () { return !!(el.fx && el.fx.isConnected); };

  /* 元素中心(相对特效层) */
  function center(node) {
    var r = node.getBoundingClientRect(), f = el.fx.getBoundingClientRect();
    return { x: r.left - f.left + r.width / 2, y: r.top - f.top + r.height / 2, w: r.width, h: r.height, bottom: r.bottom - f.top };
  }

  function move(node, kf, dur, easing) {
    node.getAnimations().forEach(function (a) { a.cancel(); });
    return node.animate(kf, { duration: dur / speed(), easing: easing || 'ease-out', fill: 'forwards' });
  }

  /* 特效精灵 */
  function sprite(name, x, y, w, kf, dur, opt) {
    if (!V.alive()) return;
    opt = opt || {};
    var img = new Image();
    img.src = U.img('vfx/' + name);
    img.className = 'fx-sprite';
    img.style.left = x + 'px'; img.style.top = y + 'px'; img.style.width = w + 'px';
    var h = opt.hue != null ? opt.hue : hue;
    img.style.filter = 'hue-rotate(' + Math.round(h) + 'deg) saturate(1.3) brightness(1.1)';
    el.fx.appendChild(img);
    var a = img.animate(kf, { duration: dur / speed(), delay: (opt.delay || 0) / speed(), easing: opt.easing || 'ease-out', fill: 'both' });
    a.onfinish = function () { img.remove(); };
    return img;
  }

  /* 粒子:gather 汇聚 / burst 迸发 */
  function particles(x, y, n, col, mode, radius) {
    if (!V.alive()) return;
    for (var i = 0; i < n; i++) {
      var p = document.createElement('i');
      p.className = 'fx-dot';
      var s = U.rand(3, 7);
      p.style.width = p.style.height = s + 'px';
      p.style.left = x + 'px'; p.style.top = y + 'px';
      p.style.background = col; p.style.boxShadow = '0 0 8px ' + col + ', 0 0 3px #fff';
      el.fx.appendChild(p);
      var ang = Math.random() * Math.PI * 2, r = U.rand(radius * 0.5, radius);
      var dx = Math.cos(ang) * r, dy = Math.sin(ang) * r;
      var kf = mode === 'gather'
        ? [{ transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.6)', opacity: 0 }, { opacity: 1, offset: .3 }, { transform: 'translate(0,0) scale(.3)', opacity: 0 }]
        : [{ transform: 'translate(0,0) scale(1.2)', opacity: 1 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.2)', opacity: 0 }];
      var a = p.animate(kf, { duration: U.rand(380, 620) / speed(), delay: U.rand(0, 150) / speed(), easing: 'ease-out', fill: 'both' });
      a.onfinish = (function (node) { return function () { node.remove(); }; })(p);
    }
  }

  function shake(px) {
    el.inner.animate([
      { transform: 'translate(0,0)' }, { transform: 'translate(' + px + 'px,' + (-px / 2) + 'px)' },
      { transform: 'translate(' + (-px) + 'px,' + (px / 2) + 'px)' }, { transform: 'translate(' + (px / 2) + 'px,0)' }, { transform: 'translate(0,0)' }
    ], { duration: 320 / speed() });
  }

  function skillText(text, side) {
    el.skill.textContent = text;
    el.skill.className = 'skill-flash ' + side;
    void el.skill.offsetWidth;
    el.skill.className = 'skill-flash show ' + side;
  }

  /* 命中/闪避反馈 */
  function impact(ev, targetImg, dir, big, onImpact) {
    if (!V.alive()) return;
    if (ev.type === 'dodge') {
      targetImg.animate([
        { transform: 'none', opacity: 1 }, { transform: 'translate(' + (dir * 18) + '%, -8%)', opacity: .35, offset: .4 }, { transform: 'none', opacity: 1 }
      ], { duration: 460 / speed(), easing: 'ease-out' });
      XX.ui.floatText(targetImg, '闪避', 'dodge');
    } else {
      targetImg.animate([
        { filter: 'brightness(1)', transform: 'none' },
        { filter: 'brightness(2.8) saturate(0)', transform: 'translateX(' + (dir * (big ? 16 : 9)) + 'px) rotate(' + (dir * 3) + 'deg)', offset: .25 },
        { filter: 'brightness(1)', transform: 'none' }
      ], { duration: 380 / speed() });
      shake(big || ev.type === 'crit' ? 10 : 5);
      XX.ui.floatText(targetImg, (ev.type === 'crit' ? '暴击 ' : '') + '-' + U.num(ev.dmg), ev.type === 'crit' ? 'crit' : (dir > 0 ? 'dmg' : 'hurt'));
    }
    if (onImpact) onImpact(ev);
  }

  /* ---------- 玩家:普攻(蓄势 → 冲刺出招 → 剑气)---------- */
  function playerNormal(ev, onImpact, done) {
    var me = el.me, pimg = el.pimg, c0 = center(pimg);
    pimg.src = frames.wind;
    move(me, [{ transform: 'translateX(0) scale(1)' }, { transform: 'translateX(-6%) scale(1.03)' }], 280);
    particles(c0.x + c0.w * 0.1, c0.y - c0.h * 0.05, 12, color, 'gather', c0.w * 0.6);
    later(function () {
      pimg.src = frames.atk;
      move(me, [{ transform: 'translateX(-6%) scale(1.03)' }, { transform: 'translateX(44%) scale(1.07)' }], 170, 'cubic-bezier(.2,.9,.3,1)');
    }, 300);
    later(function () {
      if (!V.alive()) return;
      var c = center(el.mimg);
      sprite('slash', c.x - c.w * 0.05, c.y, c.w * 1.45, [
        { opacity: 0, transform: 'translate(-50%,-50%) rotate(-32deg) scale(.3,.5)' },
        { opacity: 1, offset: .3, transform: 'translate(-50%,-50%) rotate(-14deg) scale(1.05,1)' },
        { opacity: 0, transform: 'translate(-50%,-50%) rotate(8deg) scale(1.3,1.1)' }
      ], 440);
      particles(c.x, c.y, 10, color, 'burst', c.w * 0.5);
      impact(ev, el.mimg, 1, false, onImpact);
    }, 440);
    later(function () { move(me, [{ transform: 'translateX(44%) scale(1.07)' }, { transform: 'translateX(0) scale(1)' }], 320, 'ease-in-out'); }, 860);
    later(function () { pimg.src = frames.stand; }, 1080);
    later(done, 1200);
  }

  /* ---------- 玩家:功法(掐诀 → 法阵 → 灵气汇聚 → 出招轰击)---------- */
  function playerSkill(ev, onImpact, done) {
    var me = el.me, pimg = el.pimg, c0 = center(pimg), t = XX.sys.player.tpl();
    pimg.src = frames.cast;
    el.dim.classList.add('on');
    skillText(t.skill, 'me');
    sprite('circle', c0.x, c0.bottom - c0.h * 0.06, c0.w * 1.15, [
      { opacity: 0, transform: 'translate(-50%,-50%) scale(.2,.07) rotate(0deg)' },
      { opacity: 1, offset: .2, transform: 'translate(-50%,-50%) scale(1,.32) rotate(70deg)' },
      { opacity: 1, offset: .8, transform: 'translate(-50%,-50%) scale(1.05,.34) rotate(250deg)' },
      { opacity: 0, transform: 'translate(-50%,-50%) scale(1.2,.4) rotate(320deg)' }
    ], 1750, { easing: 'linear' });
    sprite('circle', c0.x + c0.w * 0.12, c0.y - c0.h * 0.08, c0.w * 0.5, [
      { opacity: 0, transform: 'translate(-50%,-50%) scale(.1) rotate(0deg)' },
      { opacity: .9, offset: .4, transform: 'translate(-50%,-50%) scale(1) rotate(-120deg)' },
      { opacity: 0, transform: 'translate(-50%,-50%) scale(1.3) rotate(-260deg)' }
    ], 950, { easing: 'linear' });
    [0, 220, 440].forEach(function (d) {
      later(function () { if (V.alive()) particles(c0.x + c0.w * 0.12, c0.y - c0.h * 0.08, 12, color, 'gather', c0.w * 0.8); }, d);
    });
    move(me, [{ transform: 'translateY(0)' }, { transform: 'translateY(-4%) scale(1.03)' }], 700, 'ease-in-out');
    later(function () {
      if (!V.alive()) return;
      pimg.src = frames.atk;
      move(me, [{ transform: 'translateY(-4%) scale(1.03)' }, { transform: 'translateX(14%) scale(1.06)' }], 200, 'cubic-bezier(.2,.9,.3,1)');
      var a = center(pimg), b = center(el.mimg), dx = b.x - a.x, dy = b.y - a.y;
      sprite('burst', a.x, a.y, a.w * 0.5, [
        { opacity: .3, transform: 'translate(-50%,-50%) scale(.4) rotate(0deg)' },
        { opacity: 1, transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(1) rotate(400deg)' }
      ], 320, { easing: 'ease-in' });
      sprite('slash', (a.x + b.x) / 2, (a.y + b.y) / 2, Math.abs(dx) * 1.2, [
        { opacity: 0, transform: 'translate(-50%,-50%) scale(.2,.6)' },
        { opacity: .95, offset: .5, transform: 'translate(-50%,-50%) scale(1,.8)' },
        { opacity: 0, transform: 'translate(-50%,-50%) scale(1.2,.5)' }
      ], 420);
    }, 820);
    later(function () {
      if (!V.alive()) return;
      var c = center(el.mimg);
      sprite('burst', c.x, c.y, c.w * 1.5, [
        { opacity: 0, transform: 'translate(-50%,-50%) scale(.2) rotate(0deg)' },
        { opacity: 1, offset: .3, transform: 'translate(-50%,-50%) scale(1.1) rotate(20deg)' },
        { opacity: 0, transform: 'translate(-50%,-50%) scale(1.7) rotate(40deg)' }
      ], 560);
      sprite('slash', c.x, c.y, c.w * 1.6, [
        { opacity: 0, transform: 'translate(-50%,-50%) rotate(30deg) scale(.4)' },
        { opacity: 1, offset: .3, transform: 'translate(-50%,-50%) rotate(15deg) scale(1.1)' },
        { opacity: 0, transform: 'translate(-50%,-50%) rotate(0deg) scale(1.3)' }
      ], 480, { delay: 60 });
      particles(c.x, c.y, 22, color, 'burst', c.w * 0.8);
      impact(ev, el.mimg, 1, true, onImpact);
    }, 1120);
    later(function () { el.dim.classList.remove('on'); move(me, [{ transform: 'translateX(14%) scale(1.06)' }, { transform: 'translateX(0) scale(1)' }], 340, 'ease-in-out'); }, 1480);
    later(function () { pimg.src = frames.stand; }, 1700);
    later(done, 1820);
  }

  /* ---------- 妖兽:后仰蓄力 → 扑击 → 爪痕 ---------- */
  function monsterAct(ev, onImpact, done) {
    var foe = el.foe, mimg = el.mimg, pre = 0;
    if (ev.skill) {
      pre = 520;
      skillText('妖力爆发', 'foe');
      mimg.animate([
        { filter: 'drop-shadow(0 0 0 #f00)' }, { filter: 'drop-shadow(0 0 18px #ff3030) brightness(1.3)' },
        { filter: 'drop-shadow(0 0 4px #f00)' }, { filter: 'drop-shadow(0 0 22px #ff3030) brightness(1.4)' }
      ], { duration: 520 / speed() });
      var c0 = center(mimg);
      particles(c0.x, c0.y, 14, '#ff4a4a', 'gather', c0.w * 0.7);
    }
    later(function () { move(foe, [{ transform: 'translateX(0)' }, { transform: 'translateX(9%) scale(1.06)' }], 240); }, pre);
    later(function () { move(foe, [{ transform: 'translateX(9%) scale(1.06)' }, { transform: 'translateX(-50%) scale(1.1)' }], 170, 'cubic-bezier(.2,.9,.3,1)'); }, pre + 250);
    later(function () {
      if (!V.alive()) return;
      var c = center(el.pimg);
      sprite('claw', c.x, c.y, c.w * (ev.skill ? 1.0 : 0.75), [
        { opacity: 0, transform: 'translate(-50%,-50%) translate(30px,-30px) scale(.5)' },
        { opacity: 1, offset: .3, transform: 'translate(-50%,-50%) scale(1)' },
        { opacity: 0, transform: 'translate(-50%,-50%) translate(-12px,12px) scale(1.15)' }
      ], 420, { hue: 0 });
      if (ev.skill) sprite('burst', c.x, c.y, c.w * 1.1, [
        { opacity: 0, transform: 'translate(-50%,-50%) scale(.3)' }, { opacity: .9, offset: .3, transform: 'translate(-50%,-50%) scale(1)' }, { opacity: 0, transform: 'translate(-50%,-50%) scale(1.4)' }
      ], 480, { hue: 170 });
      particles(c.x, c.y, 8, '#ff5050', 'burst', c.w * 0.4);
      impact(ev, el.pimg, -1, ev.skill, onImpact);
    }, pre + 400);
    later(function () { move(foe, [{ transform: 'translateX(-50%) scale(1.1)' }, { transform: 'translateX(0) scale(1)' }], 320, 'ease-in-out'); }, pre + 760);
    later(done, pre + 1100);
  }

  /* 妖兽登场 / 倒下 */
  V.enterFoe = function (img, name) {
    el.mimg.src = U.img('monster/' + img);
    el.mname.textContent = name;
    move(el.foe, [{ transform: 'translateX(40%)', opacity: 0, filter: 'none' }, { transform: 'translateX(0)', opacity: 1, filter: 'none' }], 500);
  };
  V.foeDie = function () {
    move(el.foe, [{ opacity: 1, filter: 'none' }, { opacity: 0, transform: 'translateY(6%) scale(.9)', filter: 'grayscale(1) brightness(2.2)' }], 700);
  };
  V.idleFoe = function (img) {
    el.mimg.src = U.img('monster/' + img);
    el.foe.style.opacity = '.4';
  };

  /*
   * 播放一场战斗
   * hooks.onImpact(ev):命中时刷新血条/日志;hooks.done():播放结束
   */
  V.playFight = function (fight, hooks) {
    el.foe.style.opacity = '';
    V.enterFoe(fight.monster.img, fight.monster.name);
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

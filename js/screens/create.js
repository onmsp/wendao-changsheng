/* 创建角色:道号(随机/手动)、性别、角色模板,预览看板/打坐/战斗 */
XX.screens.create = (function () {
  var U = XX.util, D = XX.data, C = {};
  var sel = { gender: 'male', id: 'm1', view: 'stand' };

  C.randomName = function (gender) {
    var N = D.names, sfx = gender === 'female' ? N.femaleSuffix : N.maleSuffix;
    var second = gender === 'female' ? N.female : N.male;
    var a = U.pick(N.first), b = U.pick(second);
    while (b === a) b = U.pick(second);
    return a + b + U.pick(sfx);
  };

  function list() { return D.characters.filter(function (c) { return c.gender === sel.gender; }); }
  function cur() { return D.characters.filter(function (c) { return c.id === sel.id; })[0]; }

  C.show = function () {
    var el = U.$('#screen-create');
    sel = { gender: 'male', id: 'm1', view: 'stand' };
    el.innerHTML =
      '<div class="create-bg"></div>' +
      '<div class="create-head"><button class="icon-btn" id="cr-back">‹</button><div class="head-title">踏入仙途</div><span></span></div>' +
      '<div class="preview">' +
      '  <div class="aura"></div><div class="aura ring"></div>' +
      '  <img class="preview-img" id="cr-img" alt="">' +
      '  <div class="preview-name" id="cr-pname"></div>' +
      '  <div class="view-tabs" id="cr-views">' +
      '    <button data-v="stand" class="on">看板</button><button data-v="med">打坐</button><button data-v="atk">战斗</button>' +
      '  </div>' +
      '</div>' +
      '<div class="create-panel">' +
      '  <div class="gender-tabs" id="cr-gender"><button data-g="male" class="on">男 修</button><button data-g="female">女 修</button></div>' +
      '  <div class="avatar-row" id="cr-avatars"></div>' +
      '  <div class="tpl-info" id="cr-info"></div>' +
      '  <div class="form-row"><label>道号</label><input id="cr-name" maxlength="8" placeholder="请输入道号"><button class="icon-btn dice" id="cr-dice" title="随机道号">🎲</button></div>' +
      '  <div class="form-row root-row"><label>灵根</label><span class="root-tag" style="--rc:' + D.roots[0].color + '">' + D.roots[0].name + '</span><span class="muted">修行速度 ' + D.roots[0].rate + ' 点 / 3 秒</span><button class="info-dot" id="cr-root">?</button></div>' +
      '  <button class="btn plaque wide" id="cr-go">开 启 仙 途</button>' +
      '</div>';

    U.$('#cr-name').value = C.randomName(sel.gender);
    U.$('#cr-back').onclick = function () { XX.go('start'); };
    U.$('#cr-dice').onclick = function () {
      U.$('#cr-name').value = C.randomName(sel.gender);
      U.$('#cr-dice').classList.remove('spin'); void U.$('#cr-dice').offsetWidth; U.$('#cr-dice').classList.add('spin');
    };
    U.$('#cr-gender').onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      sel.gender = b.dataset.g; sel.id = list()[0].id;
      U.$$('#cr-gender button').forEach(function (x) { x.classList.toggle('on', x === b); });
      U.$('#cr-name').value = C.randomName(sel.gender);
      renderAvatars(); renderPreview();
    };
    U.$('#cr-views').onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      sel.view = b.dataset.v;
      U.$$('#cr-views button').forEach(function (x) { x.classList.toggle('on', x === b); });
      renderPreview();
    };
    U.$('#cr-root').onclick = function () {
      XX.ui.modal({
        title: '灵根资质',
        html: '<p class="muted">初入仙途者皆为五色灵根,可通过【洗灵液】逐阶提升。</p><table class="tbl"><tr><th>灵根</th><th>修行速度</th></tr>' +
          D.roots.map(function (r) { return '<tr><td style="color:' + r.color + '">' + r.name + '</td><td>' + r.rate + ' 点 / 3 秒</td></tr>'; }).join('') + '</table>'
      });
    };
    U.$('#cr-go').onclick = function () {
      var name = U.$('#cr-name').value.trim();
      if (!name) { XX.ui.toast('请先取一个道号', 'warn'); return; }
      if (name.length > 8) { XX.ui.toast('道号最多 8 个字', 'warn'); return; }
      var t = cur();
      XX.ui.confirm('确认踏入仙途', '<div class="confirm-char"><img src="' + U.img('char/' + t.id + '_avatar') + '" alt=""><div><b>' + U.esc(name) + '</b><br><span class="muted">' + t.name + ' · ' + t.school + '</span><br><span class="muted">五色灵根 · 10 点/3 秒</span></div></div>', function () {
        XX.store.newGame({ name: name, gender: sel.gender, charId: t.id });
        XX.go('game', { welcome: true });
      }, '踏入仙途');
    };
    renderAvatars(); renderPreview();
  };

  function renderAvatars() {
    U.$('#cr-avatars').innerHTML = list().map(function (c) {
      return '<button class="avatar-pick' + (c.id === sel.id ? ' on' : '') + '" data-id="' + c.id + '" style="--cc:' + c.color + '">' +
        '<img src="' + U.img('char/' + c.id + '_avatar') + '" alt=""><span>' + c.name + '</span></button>';
    }).join('');
    U.$('#cr-avatars').onclick = function (e) {
      var b = e.target.closest('.avatar-pick'); if (!b) return;
      sel.id = b.dataset.id;
      renderAvatars(); renderPreview();
    };
  }

  function renderPreview() {
    var t = cur(), img = U.$('#cr-img');
    img.classList.remove('show');
    img.className = 'preview-img view-' + sel.view;
    img.onload = function () { img.classList.add('show'); };
    img.src = U.img('char/' + t.id + '_' + sel.view);
    if (img.complete && img.naturalWidth) requestAnimationFrame(function () { img.classList.add('show'); });
    U.$('.preview').style.setProperty('--cc', t.color);
    U.$('#cr-pname').innerHTML = '<b>' + t.name + '</b><span>' + t.school + '</span>';
    U.$('#cr-info').innerHTML = '<p>' + t.desc + '</p><p class="bonus">天赋:' + t.bonusText + '</p>';
  }

  return C;
})();

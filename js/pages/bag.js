/* 背包页面:初始 50 格,普通物品 99 一组,装备/特殊一件一格 */
XX.pages.bag = (function () {
  var U = XX.util, D = XX.data, PG = {}, filter = 'all', root = null;
  var STAT_NAMES = { hp: '气血', mp: '灵力', atk: '攻击', def: '防御', spd: '身法', sense: '神识', crit: '暴击率', critDmg: '暴击伤害', dodge: '闪避率' };

  PG.render = function (el) {
    root = el;
    el.innerHTML =
      '<div class="bag-head card"><div><b>储物袋</b> <span id="bag-cap" class="muted"></span></div>' +
      '<button class="btn small" id="bag-sort">整理</button></div>' +
      '<div class="subtabs" id="bag-filter">' +
      [['all', '全部'], ['pill', '丹药'], ['material', '材料'], ['equip', '法宝'], ['special', '特殊']].map(function (f) {
        return '<button data-f="' + f[0] + '"' + (f[0] === filter ? ' class="on"' : '') + '>' + f[1] + '</button>';
      }).join('') + '</div>' +
      '<div class="bag-grid" id="bag-grid"></div>' +
      '<p class="muted small center">普通物品每格可叠放 99 个,法宝与特殊物品每件独占一格</p>';
    U.$('#bag-sort').onclick = function () { XX.sys.inv.sort(); PG.draw(); XX.ui.toast('整理完毕'); };
    U.$('#bag-filter').onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      filter = b.dataset.f;
      U.$$('#bag-filter button').forEach(function (x) { x.classList.toggle('on', x === b); });
      PG.draw();
    };
    U.$('#bag-grid').onclick = function (e) {
      var c = e.target.closest('.slot[data-i]'); if (c) PG.detail(+c.dataset.i);
    };
    PG.draw();
  };

  PG.draw = function () {
    if (!root) return;
    var bag = XX.store.state.bag, html = '';
    U.$('#bag-cap').textContent = bag.slots.length + ' / ' + bag.cap + '(可扩展至 ' + XX.sys.player.bagMax() + ')';
    bag.slots.forEach(function (sl, i) {
      var it = D.items[sl.id];
      if (filter !== 'all' && it.type !== filter) return;
      var q = sl.q != null ? sl.q : D.qOf(sl.id, sl.g);
      html += '<button class="slot" data-i="' + i + '" style="--qc:' + U.qColor(q) + '">' + U.itemIcon(sl.id, '', q, { g: sl.g, lv: it.type === 'equip' ? sl.lv : 0 }) +
        (sl.n ? '<span class="cnt">' + sl.n + '</span>' : '') + (sl.lv != null && it.type === 'equip' ? '<span class="cnt lv">' + sl.lv + '级</span>' : '') + '</button>';
    });
    if (filter === 'all') for (var k = bag.slots.length; k < bag.cap; k++) html += '<div class="slot empty"></div>';
    U.$('#bag-grid').innerHTML = html;
  };

  PG.equipDetail = function (e) { return XX.ui.equipDetail(e); };

  PG.detail = function (i) {
    var st = XX.store.state, sl = st.bag.slots[i];
    if (!sl) return;
    var it = D.items[sl.id], inv = XX.sys.inv, btns = [];
    var html;
    if (it.type === 'equip') {
      html = PG.equipDetail(sl);
      var worn = st.equip.filter(function (x) { return x; }).length;
      html += '<div class="muted small" style="margin-top:8px">已佩戴法宝 ' + worn + ' / ' + st.equip.length + ' · 特殊法宝 ' + inv.specialEquipped() + ' / ' + XX.config.specialTreasureMax + '</div>';
      if (!inv.isSpecial(sl)) btns.push({ text: '强化', onClick: function () { PG.enhance(sl, function () { PG.draw(); }); } });
      btns.push({ text: '佩戴', cls: 'primary', onClick: function () {
        if (inv.firstFreeTreasure() >= 0) { inv.equip(i); XX.ui.toast('已佩戴 ' + U.eqName(sl), 'ok'); PG.draw(); }
        else PG.chooseReplace(i);
      } });
    } else {
      var gtxt = it.qByGrade ? '<div class="small ok">' + (sl.g || 1) + ' 级丹方炼制 · 药效 ' + U.pct(inv.gMul(sl), 0) + '</div>' : sl.g > 1 ? '<div class="small ok">' + sl.g + ' 级图纸炼制 · 药效 ' + U.pct(inv.gMul(sl), 0) + '</div>' : '';
      if (sl.id === 'sp_xiling') gtxt = '<div class="small ok">' + (sl.g || 1) + ' 级丹方炼制 · 最高可洗至' + D.roots.filter(function (r) { return r.grade === 5 - (sl.g || 1); })[0].name + ' · 当前转化度 ' + U.pct(st.rootProg || 0, 0) + '</div>';
      if (it.use && it.use.kind === 'break') gtxt = '<div class="small ok">突破成功率 +' + U.pct(XX.config.breakPillBonus[D.qOf(sl.id, sl.g)], 0) + '(' + D.realmMajors[it.use.major].name + '期突破时可选服)</div>';
      if (it.use && it.use.kind === 'attr') gtxt += '<div class="small muted">本境界已服用 ' + XX.sys.player.attrUsed(sl.id) + ' / ' + XX.sys.player.attrCap() + '</div>';
      html = XX.ui.itemInfo(sl.id, gtxt + (sl.n ? '<div class="muted small">持有:' + inv.count(sl.id) + '</div>' : ''), sl.g);
      if (it.use && it.use.kind !== 'break') {
        btns.push({ text: '使用', cls: 'primary', onClick: function () { PG.useMsg(inv.use(i, 1)); } });
        if (sl.n > 1 && (it.use.kind === 'exp' || it.use.kind === 'timed' || it.use.kind === 'rootProg' || it.use.kind === 'attr')) btns.push({ text: '使用 ×' + Math.min(10, sl.n), onClick: function () { PG.useMsg(inv.use(i, 10)); } });
      }
    }
    var price = inv.price(sl);
    btns.unshift({ text: '出售' + (sl.n > 1 ? '1个' : '') + '<small>' + price + '灵石</small>', onClick: function () {
      var got = inv.sell(i, 1); XX.ui.toast('出售获得灵石 ×' + got); PG.draw();
    } });
    if (sl.n > 1) btns.unshift({ text: '全部出售<small>' + price * sl.n + '灵石</small>', cls: 'ghost', onClick: function () {
      var got = inv.sell(i, sl.n); XX.ui.toast('出售获得灵石 ×' + got); PG.draw();
    } });
    XX.ui.modal({ title: '物品详情', html: html, buttons: btns, cls: 'item-modal' });
  };

  /* 4 件法宝已满:选择替换哪一件 */
  PG.chooseReplace = function (i) {
    var st = XX.store.state;
    var html = '<p class="muted small center">法宝位已满,选择要替换的法宝</p><div class="replace-list">' + st.equip.map(function (e, k) {
      var es = XX.sys.inv.eqStats(e);
      return '<button class="seed" data-k="' + k + '">' + U.itemIcon(e.id, '', e.q, { lv: e.lv }) + '<div><b style="color:' + U.qColor(e.q) + '">' + U.eqName(e) + '</b> <span class="muted small">' + U.lvText(e.lv) + '</span><div class="muted small">' +
        Object.keys(es).map(function (s) { var v = es[s]; return STAT_NAMES[s] + '+' + (v < 1 ? U.pct(v) : U.num(v)); }).join(' ') + '</div></div></button>';
    }).join('') + '</div>';
    XX.ui.modal({
      title: '替换法宝', html: html, buttons: [{ text: '取消' }],
      onOpen: function (w, close) {
        U.$('.replace-list', w).onclick = function (e) {
          var b = e.target.closest('[data-k]'); if (!b) return;
          XX.sys.inv.equip(i, +b.dataset.k); XX.ui.toast('法宝已替换', 'ok'); PG.draw(); close();
        };
      }
    });
  };

  /* 法宝强化面板(背包与人物页共用) */
  PG.enhance = function (e, onDone) {
    var inv = XX.sys.inv;
    if (inv.isSpecial(e)) { XX.ui.toast('特殊法宝无法强化,只能炼制', 'warn'); return; }
    function body() {
      var max = (e.lv || 1) >= XX.config.maxLv, c = max ? null : inv.enhanceCost(e), nx = { lv: (e.lv || 1) + 1, bs: e.bs };
      var cur = inv.eqStats(e), next = max ? null : inv.eqStats(nx);
      return '<div class="enh">' + XX.ui.equipDetail(e) +
        (max ? '<p class="center star">★ 已强化至满级</p>' : '<div class="enh-next"><div class="muted small">强化至 ' + U.lvText(e.lv + 1) + '(基础属性 +20%)</div>' +
          Object.keys(cur).map(function (k) { return '<span>' + STAT_NAMES[k] + ' ' + (cur[k] < 1 ? U.pct(cur[k]) : U.num(cur[k])) + ' → <b class="ok">' + (next[k] < 1 ? U.pct(next[k]) : U.num(next[k])) + '</b></span>'; }).join('') +
          '<div class="enh-cost">消耗 灵石 ' + U.num(c.stone) + ' · 强化石 ' + c.qh + '(持有 ' + inv.count('stone_qh') + ')</div></div>') + '</div>';
    }
    XX.ui.modal({
      title: '法宝强化', html: '<div id="enh-box">' + body() + '</div>',
      buttons: [{ text: '关闭' }, { text: '强化', cls: 'primary', onClick: function (close, w) {
        var r = inv.enhance(e); XX.ui.toast(r.msg, r.ok ? 'ok' : 'warn');
        U.$('#enh-box', w).innerHTML = body(); if (onDone) onDone();
        return false;
      } }]
    });
  };

  PG.useMsg = function (msg) {
    if (msg) XX.ui.toast(msg, 'ok');
    PG.draw();
  };

  PG.update = function () { };
  PG.destroy = function () { root = null; };
  return PG;
})();

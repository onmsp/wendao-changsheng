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
    U.$('#bag-cap').textContent = bag.slots.length + ' / ' + bag.cap;
    bag.slots.forEach(function (sl, i) {
      var it = D.items[sl.id];
      if (filter !== 'all' && it.type !== filter) return;
      var q = sl.q != null ? sl.q : it.q;
      html += '<button class="slot" data-i="' + i + '" style="--qc:' + U.qColor(q) + '">' + U.itemIcon(sl.id, '', q) +
        (sl.n ? '<span class="cnt">' + sl.n + '</span>' : '') + '</button>';
    });
    if (filter === 'all') for (var k = bag.slots.length; k < bag.cap; k++) html += '<div class="slot empty"></div>';
    U.$('#bag-grid').innerHTML = html;
  };

  PG.equipDetail = function (e) {
    var it = D.items[e.id];
    return '<div class="item-detail">' + U.itemIcon(e.id, 'lg', e.q) + '<div><div class="item-detail-name" style="color:' + U.qColor(e.q) + '">' + it.name + '</div>' +
      '<div class="muted">法宝 · ' + XX.config.qualities[e.q].name + '</div></div></div>' +
      '<p class="item-desc">' + it.desc + '</p><div class="stat-list">' +
      Object.keys(e.stats).map(function (k) {
        var v = e.stats[k];
        return '<div><span>' + STAT_NAMES[k] + '</span><b>+' + (v < 1 ? U.pct(v) : v) + '</b></div>';
      }).join('') + '</div>';
  };

  PG.detail = function (i) {
    var st = XX.store.state, sl = st.bag.slots[i];
    if (!sl) return;
    var it = D.items[sl.id], inv = XX.sys.inv, btns = [];
    var html;
    if (it.type === 'equip') {
      html = PG.equipDetail(sl);
      var worn = st.equip.filter(function (x) { return x; }).length;
      html += '<div class="muted small" style="margin-top:8px">已佩戴法宝 ' + worn + ' / ' + st.equip.length + '</div>';
      btns.push({ text: '佩戴', cls: 'primary', onClick: function () {
        if (inv.firstFreeTreasure() >= 0) { inv.equip(i); XX.ui.toast('已佩戴 ' + it.name, 'ok'); PG.draw(); }
        else PG.chooseReplace(i);
      } });
    } else {
      html = XX.ui.itemInfo(sl.id, sl.n ? '<div class="muted small">持有:' + inv.count(sl.id) + '</div>' : '');
      if (it.use && it.use.kind !== 'break') {
        btns.push({ text: '使用', cls: 'primary', onClick: function () { PG.useMsg(inv.use(i, 1)); } });
        if (sl.n > 1 && it.use.kind === 'exp') btns.push({ text: '使用 ×' + Math.min(10, sl.n), onClick: function () { PG.useMsg(inv.use(i, 10)); } });
      }
    }
    var price = Math.round(it.price * (sl.q != null ? D.equipQualityMul[sl.q] : 1));
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
      return '<button class="seed" data-k="' + k + '">' + U.itemIcon(e.id, '', e.q) + '<div><b style="color:' + U.qColor(e.q) + '">' + D.items[e.id].name + '</b><div class="muted small">' +
        Object.keys(e.stats).map(function (s) { var v = e.stats[s]; return STAT_NAMES[s] + '+' + (v < 1 ? U.pct(v) : v); }).join(' ') + '</div></div></button>';
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

  PG.useMsg = function (msg) {
    if (msg) XX.ui.toast(msg, 'ok');
    PG.draw();
  };

  PG.update = function () { };
  PG.destroy = function () { root = null; };
  return PG;
})();

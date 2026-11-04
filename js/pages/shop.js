/* 仙玉商城:仅可使用仙玉,每 12 小时刷新 */
XX.pages.shop = (function () {
  var U = XX.util, D = XX.data, PG = {}, root = null;

  PG.render = function (el) {
    root = el;
    el.innerHTML = '<div class="shop-head card"><img class="shop-icon" src="' + U.img('icon/shop') + '" alt="">' +
      '<div><b>仙玉商城</b><div class="muted small">仅收仙玉 · 每日 0:00 / 12:00 刷新</div></div>' +
      '<div class="shop-timer"><span class="muted small">刷新倒计时</span><b id="sh-timer"></b></div></div>' +
      '<div class="shop-grid" id="sh-grid"></div>' +
      '<p class="muted small center">价格随品阶(白→金)与品类递增 · 仙玉可通过秘境通关、大境界突破获得</p>';
    U.$('#sh-grid').onclick = function (e) {
      var info = e.target.closest('[data-info]');
      if (info) { XX.ui.modal({ title: '物品详情', html: XX.ui.itemInfo(info.dataset.info) }); return; }
      var b = e.target.closest('[data-buy]'); if (!b || b.disabled) return;
      var r = XX.sys.shop.buy(+b.dataset.buy);
      XX.ui.toast(r.msg, r.ok ? 'ok' : 'warn');
      PG.draw();
    };
    PG.draw();
  };

  PG.draw = function () {
    if (!root) return;
    PG._period = XX.sys.shop.period();
    var jade = XX.store.state.jade;
    U.$('#sh-grid').innerHTML = XX.sys.shop.offers().map(function (x) {
      var it = D.items[x.o.item], out = x.left <= 0;
      return '<div class="offer' + (out ? ' soldout' : '') + '" style="--qc:' + U.qColor(it.q) + '">' +
        '<div class="offer-icon" data-info="' + x.o.item + '">' + U.itemIcon(x.o.item) + (x.o.n > 1 ? '<span class="cnt">×' + x.o.n + '</span>' : '') + '</div>' +
        '<div class="offer-name">' + U.itemName(x.o.item) + '</div>' +
        '<div class="offer-cat">' + D.shopCatName[D.shopCategory(x.o.item)] + ' · ' + XX.config.qualities[it.q || 0].short + '</div>' +
        '<div class="muted small">限购 ' + Math.max(0, x.left) + '/' + x.o.stock + '</div>' +
        '<button class="btn small primary" data-buy="' + x.slot + '"' + (out || jade < x.price ? ' disabled' : '') + '>' +
        (out ? '已售罄' : '<img class="ci" src="' + U.img('icon/xianyu') + '">' + x.price) + '</button></div>';
    }).join('');
  };

  PG.update = function () {
    if (!root) return;
    U.$('#sh-timer').textContent = U.time(XX.sys.shop.secondsToRefresh());
    if (PG._period !== XX.sys.shop.period()) PG.draw();
  };

  PG.destroy = function () { root = null; };
  return PG;
})();

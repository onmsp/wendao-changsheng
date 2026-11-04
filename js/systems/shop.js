/* 仙玉商城:每 12 小时(本地时间 0 点 / 12 点)刷新货架 */
XX.sys.shop = (function () {
  var S = {}, D = XX.data, U = XX.util;
  var PERIOD = XX.config.shopRefreshHours * 3600 * 1000;
  function st() { return XX.store.state; }
  function localNow() { return Date.now() - new Date().getTimezoneOffset() * 60000; }

  S.period = function () { return Math.floor(localNow() / PERIOD); };
  S.secondsToRefresh = function () { return ((S.period() + 1) * PERIOD - localNow()) / 1000; };

  /* 确保当前时段货架已生成 */
  S.ensure = function () {
    var sh = st().shop, per = S.period();
    if (sh.period === per && sh.offers) return;
    var rng = U.seeded(per * 7919 + st().created % 100000);
    var pool = D.shop.pool.map(function (o, i) { return { o: o, i: i }; })
      .filter(function (x) { return !x.o.reqRealm || st().realm >= x.o.reqRealm; });
    var picked = [];
    while (picked.length < D.shop.slots && pool.length) {
      var k = U.weighted(pool.map(function (x) { return x.o.w; }), rng);
      picked.push(pool[k].i); pool.splice(k, 1);
    }
    sh.period = per; sh.offers = picked; sh.bought = {};
  };

  S.offers = function () {
    S.ensure();
    return st().shop.offers.map(function (pi, slot) {
      var o = D.shop.pool[pi];
      return { slot: slot, o: o, left: o.stock - (st().shop.bought[slot] || 0) };
    });
  };

  S.buy = function (slot) {
    S.ensure();
    var o = D.shop.pool[st().shop.offers[slot]];
    var left = o.stock - (st().shop.bought[slot] || 0);
    if (left <= 0) return { ok: false, msg: '本期已售罄' };
    if (st().jade < o.price) return { ok: false, msg: '仙玉不足' };
    if (!XX.sys.inv.canAdd(o.item, o.n)) return { ok: false, msg: '储物袋空间不足' };
    st().jade -= o.price;
    st().shop.bought[slot] = (st().shop.bought[slot] || 0) + 1;
    XX.sys.inv.add(o.item, o.n);
    return { ok: true, msg: '购得 ' + D.items[o.item].name + ' ×' + o.n };
  };

  return S;
})();

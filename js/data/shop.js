/*
 * 仙玉商城货架池:每 12 小时按时段随机抽取 slots 件上架(仅可使用仙玉)
 * item:物品id;n:每份数量;price:仙玉价格;stock:本期限购;w:抽取权重;reqRealm:可选,境界不足不上架
 */
XX.data.shop = {
  slots: 8,
  pool: [
    { item: 'pill_juqi', n: 5, price: 10, stock: 5, w: 10 },
    { item: 'pill_yangyuan', n: 2, price: 25, stock: 3, w: 7 },
    { item: 'pill_peiyuan', n: 2, price: 20, stock: 3, w: 6 },
    { item: 'seed_ninglu', n: 10, price: 6, stock: 5, w: 8 },
    { item: 'seed_zhu', n: 5, price: 10, stock: 3, w: 6 },
    { item: 'seed_chiyan', n: 5, price: 15, stock: 3, w: 5 },
    { item: 'seed_ziyun', n: 3, price: 30, stock: 2, w: 3 },
    { item: 'core_yao', n: 3, price: 25, stock: 3, w: 5 },
    { item: 'ore_cold', n: 5, price: 15, stock: 3, w: 5 },
    { item: 'ore_star', n: 2, price: 35, stock: 2, w: 3 },
    { item: 'sp_stonebag', n: 1, price: 15, stock: 5, w: 6 },
    { item: 'sp_pouch', n: 1, price: 60, stock: 1, w: 4 },
    { item: 'sp_talisman', n: 1, price: 40, stock: 2, w: 4 },
    { item: 'gf_changchun', n: 1, price: 60, stock: 1, w: 3 },
    { item: 'gf_taixuan', n: 1, price: 150, stock: 1, w: 2, reqRealm: 4 },
    { item: 'st_huoqiu', n: 1, price: 40, stock: 1, w: 3 },
    { item: 'st_huichun', n: 1, price: 50, stock: 1, w: 3 },
    { item: 'st_zhangxin', n: 1, price: 100, stock: 1, w: 2, reqRealm: 3 },
    { item: 'bp_jianxia', n: 1, price: 120, stock: 1, w: 2, reqRealm: 3 },
    { item: 'bp_qiankun', n: 1, price: 120, stock: 1, w: 2, reqRealm: 3 },
    { item: 'pill_zhuji', n: 1, price: 120, stock: 1, w: 3, reqRealm: 6 },
    { item: 'pill_wudao', n: 1, price: 120, stock: 1, w: 2 },
    { item: 'pill_ningjin', n: 1, price: 300, stock: 1, w: 2, reqRealm: 11 },
    { item: 'pill_huaying', n: 1, price: 600, stock: 1, w: 1, reqRealm: 15 },
    { item: 'milk_wannian', n: 1, price: 80, stock: 2, w: 2, reqRealm: 15 },
    { item: 'sp_xiling', n: 1, price: 280, stock: 1, w: 1.5 }
  ]
};

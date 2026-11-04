/*
 * 仙玉商城:每 12 小时按时段随机抽取 slots 件上架(仅可使用仙玉)
 * 价格 = 品类基价 × 品阶倍率 × 数量(白 绿 蓝 紫 金 获取难度依次递增)
 *   品类基价 catBase:材料/种子 1,普通丹药 3,突破丹 12,丹方 10,器图/阵图 12,功法 16,技能 12,其他特殊 6
 *   品阶倍率 tierMul:白 1 / 绿 2.5 / 蓝 6 / 紫 15 / 金 40
 * pool:item 物品id;g 品级(突破丹/属性丹);n 每份数量;stock 本期限购;w 抽取权重;reqRealm/maxRealm 可选,境界范围外不上架;price 可选,覆盖公式
 * 只上架紫色及以下品质(config.shopMaxQ),储物袋等 noShop 物品不上架
 */
XX.data.shop = {
  slots: 10,
  tierMul: [1, 2.5, 6, 15, 40],
  catBase: { material: 1, seed: 1, pill: 3, breakPill: 12, recipe: 10, blueprint: 12, gongfa: 16, shentong: 12, special: 6 },
  /* 境界系数:后期物品价格随所需境界上涨(1 + reqRealm / 8) */
  realmK: 8,
  pool: [
    { item: 'seed_ninglu', n: 10, stock: 3, w: 8, maxRealm: 12 },
    { item: 'seed_zhu', n: 5, stock: 3, w: 6, maxRealm: 16 },
    { item: 'seed_chiyan', n: 5, stock: 3, w: 5 },
    { item: 'seed_ziyun', n: 3, stock: 2, w: 3, reqRealm: 6 },
    { item: 'stone_qh', n: 5, stock: 3, w: 6 },
    { item: 'ore_iron', n: 10, stock: 3, w: 6 },
    { item: 'ore_iron_g', n: 3, stock: 3, w: 4 },
    { item: 'core_yao', n: 3, stock: 3, w: 5, maxRealm: 20 },
    { item: 'ore_cold', n: 5, stock: 3, w: 4, maxRealm: 20 },
    { item: 'ore_star', n: 2, stock: 2, w: 3, reqRealm: 6 },
    { item: 'core_xuan', n: 1, stock: 2, w: 2, reqRealm: 9 },
    { item: 'milk_wannian', n: 1, stock: 2, w: 2, reqRealm: 13 },
    { item: 'herb_jiuye', n: 1, stock: 2, w: 2, reqRealm: 21 },
    { item: 'ore_xujin', n: 1, stock: 2, w: 2, reqRealm: 25 },
    { item: 'core_dao', n: 1, stock: 2, w: 2, reqRealm: 29 },
    { item: 'ore_tianjing', n: 1, stock: 2, w: 2, reqRealm: 33 },
    { item: 'stone_jie', n: 1, stock: 2, w: 2, reqRealm: 37 },
    { item: 'pill_juqi', n: 5, stock: 3, w: 8, maxRealm: 12 },
    { item: 'pill_julingsan', n: 2, stock: 3, w: 6 },
    { item: 'pill_yangyuan', n: 2, stock: 3, w: 5, maxRealm: 20 },
    { item: 'pill_julingdan', n: 1, stock: 2, w: 2, reqRealm: 6 },
    { item: 'pill_ningyuan', n: 1, stock: 2, w: 1.5, reqRealm: 13 },
    { item: 'pill_tongxuan', n: 1, stock: 1, w: 1.2, reqRealm: 21 },
    { item: 'pill_attr_hp', g: 1, n: 1, stock: 2, w: 2, reqRealm: 2 },
    { item: 'pill_attr_atk', g: 1, n: 1, stock: 2, w: 2, reqRealm: 2 },
    { item: 'pill_attr_def', g: 1, n: 1, stock: 2, w: 2, reqRealm: 2 },
    { item: 'pill_attr_mp', g: 1, n: 1, stock: 2, w: 2, reqRealm: 2 },
    { item: 'pill_attr_hp', g: 2, n: 1, stock: 1, w: 1, reqRealm: 13 },
    { item: 'pill_attr_atk', g: 2, n: 1, stock: 1, w: 1, reqRealm: 13 },
    { item: 'sp_stonebag', n: 1, stock: 5, w: 6 },
    { item: 'gf_yinqi', n: 1, stock: 1, w: 4, maxRealm: 16 },
    { item: 'gf_tuna', n: 1, stock: 1, w: 3, maxRealm: 16 },
    { item: 'gf_changchun', n: 1, stock: 1, w: 2, reqRealm: 2 },
    { item: 'gf_liehuo', n: 1, stock: 1, w: 1.5, reqRealm: 4 },
    { item: 'gf_taixuan', n: 1, stock: 1, w: 1, reqRealm: 6 },
    { item: 'gf_jingang', n: 1, stock: 1, w: 1, reqRealm: 9 },
    { item: 'gf_zixia', n: 1, stock: 1, w: 0.5, reqRealm: 13 },
    { item: 'gf_xuanming', n: 1, stock: 1, w: 0.4, reqRealm: 21 },
    { item: 'st_huoqiu', n: 1, stock: 1, w: 3 },
    { item: 'st_huichun', n: 1, stock: 1, w: 3 },
    { item: 'st_jinzhong', n: 1, stock: 1, w: 2 },
    { item: 'st_zhangxin', n: 1, stock: 1, w: 2, reqRealm: 3 },
    { item: 'st_kuangbao', n: 1, stock: 1, w: 1.5, reqRealm: 3 },
    { item: 'st_wanjian', n: 1, stock: 1, w: 0.8, reqRealm: 10 },
    { item: 'st_jiutian', n: 1, stock: 1, w: 0.5, reqRealm: 14 },
    { item: 'st_xuehai', n: 1, stock: 1, w: 0.4, reqRealm: 23 },
    { item: 'rp_attr_hp', n: 1, stock: 1, w: 1.2, reqRealm: 2 },
    { item: 'rp_attr_atk', n: 1, stock: 1, w: 1.2, reqRealm: 2 },
    { item: 'rp_attr_def', n: 1, stock: 1, w: 1.2, reqRealm: 2 },
    { item: 'rp_attr_mp', n: 1, stock: 1, w: 1.2, reqRealm: 2 },
    { item: 'rp_kuangxue', n: 1, stock: 1, w: 1.5, reqRealm: 4 },
    { item: 'rp_julingdan', n: 1, stock: 1, w: 1.5, reqRealm: 6 },
    { item: 'rp_wudao', n: 1, stock: 1, w: 0.6, reqRealm: 9 },
    { item: 'rp_fuyuan', n: 1, stock: 1, w: 0.6, reqRealm: 9 },
    { item: 'rp_xiling', n: 1, stock: 1, w: 0.5, reqRealm: 11 },
    { item: 'rp_ningyuan', n: 1, stock: 1, w: 0.6, reqRealm: 13 },
    { item: 'rp_tongxuan', n: 1, stock: 1, w: 0.5, reqRealm: 21 },
    { item: 'bp_shehun', n: 1, stock: 1, w: 1.5, reqRealm: 2 },
    { item: 'bp_qiankun', n: 1, stock: 1, w: 1.5, reqRealm: 2 },
    { item: 'bp_jianxia', n: 1, stock: 1, w: 1, reqRealm: 6 },
    { item: 'bp_zhaohun', n: 1, stock: 1, w: 0.6, reqRealm: 11 },
    { item: 'ap_qingmu', n: 1, stock: 1, w: 1.2, reqRealm: 2 },
    { item: 'ap_lingquan', n: 1, stock: 1, w: 1.2, reqRealm: 2 },
    { item: 'ap_ruijin', n: 1, stock: 1, w: 1.2, reqRealm: 2 },
    { item: 'ap_houtu', n: 1, stock: 1, w: 1.2, reqRealm: 2 },
    { item: 'ap_changchun', n: 1, stock: 1, w: 1.2, reqRealm: 2 },
    { item: 'ap_xingdou', n: 1, stock: 1, w: 0.8, reqRealm: 6 },
    { item: 'ap_tiangang', n: 1, stock: 1, w: 0.8, reqRealm: 6 },
    { item: 'ap_xuanwu', n: 1, stock: 1, w: 0.8, reqRealm: 6 },
    { item: 'ap_hushan', n: 1, stock: 1, w: 0.8, reqRealm: 6 },
    { item: 'ap_jiutian', n: 1, stock: 1, w: 0.4, reqRealm: 13 },
    { item: 'ap_zhuxian', n: 1, stock: 1, w: 0.4, reqRealm: 13 },
    { item: 'ap_liangyi', n: 1, stock: 1, w: 0.4, reqRealm: 13 },
    { item: 'ap_zaohua', n: 1, stock: 1, w: 0.4, reqRealm: 13 }
  ]
};
/* 突破丹:各大境界的白/绿品质(只在对应大境界上架) */
(function () {
  var starts = [0, 9, 13, 17, 21, 25, 29, 33, 37];
  starts.forEach(function (r, mi) {
    var end = mi < 8 ? starts[mi + 1] - 1 : 40;
    XX.data.shop.pool.push({ item: 'pill_brk' + mi, g: 1, n: 1, stock: 2, w: 3, reqRealm: r, maxRealm: end });
    XX.data.shop.pool.push({ item: 'pill_brk' + mi, g: 2, n: 1, stock: 1, w: 1.5, reqRealm: r, maxRealm: end });
    if (mi >= 1) XX.data.shop.pool.push({ item: 'rp_brk' + mi, n: 1, stock: 1, w: 0.8, reqRealm: r, maxRealm: end });
  });
  /* 商城只上架紫色及以下、且未标记 noShop 的物品 */
  XX.data.shop.pool = XX.data.shop.pool.filter(function (o) {
    var it = XX.data.items[o.item];
    return it && !it.noShop && XX.data.qOf(o.item, o.g) <= XX.config.shopMaxQ;
  });
})();

/* 品类判定 */
XX.data.shopCategory = function (id) {
  var it = XX.data.items[id];
  if (/^seed_/.test(id)) return 'seed';
  if (/^rp_/.test(id)) return 'recipe';
  if (/^bp_|^ap_/.test(id)) return 'blueprint';
  if (/^gf_/.test(id)) return 'gongfa';
  if (/^st_/.test(id)) return 'shentong';
  if (it.type === 'pill') return it.use && it.use.kind === 'break' ? 'breakPill' : 'pill';
  if (it.type === 'material') return 'material';
  return 'special';
};
XX.data.shopCatName = { material: '材料', seed: '灵种', pill: '丹药', breakPill: '突破丹', recipe: '丹方', blueprint: '图纸', gongfa: '功法', shentong: '技能', special: '奇物' };
/* 计算价格 */
XX.data.shopPrice = function (o) {
  if (o.price) return o.price;
  var S = XX.data.shop;
  return Math.max(1, Math.round(S.catBase[XX.data.shopCategory(o.item)] * S.tierMul[XX.data.qOf(o.item, o.g)] * o.n * (1 + (o.reqRealm || 0) / S.realmK)));
};

/*
 * 仙玉商城:每 12 小时按时段随机抽取 slots 件上架(仅可使用仙玉)
 * 价格 = 品类基价 × 品阶倍率 × 数量(白 绿 蓝 紫 金 获取难度依次递增)
 *   品类基价 catBase:材料/种子 1,普通丹药 3,突破丹 12,丹方 10,图纸 12,功法 16,神通 12,其他特殊 6
 *   品阶倍率 tierMul:白 1 / 绿 2.5 / 蓝 6 / 紫 15 / 金 40
 * pool:item 物品id;n 每份数量;stock 本期限购;w 抽取权重;reqRealm 可选,境界不足不上架;price 可选,填写则覆盖公式
 */
XX.data.shop = {
  slots: 10,
  tierMul: [1, 2.5, 6, 15, 40],
  catBase: { material: 1, seed: 1, pill: 3, breakPill: 12, recipe: 10, blueprint: 12, gongfa: 16, shentong: 12, special: 6 },
  pool: [
    { item: 'seed_ninglu', n: 10, stock: 3, w: 8 },
    { item: 'seed_zhu', n: 5, stock: 3, w: 6 },
    { item: 'seed_chiyan', n: 5, stock: 3, w: 5 },
    { item: 'seed_ziyun', n: 3, stock: 2, w: 3, reqRealm: 6 },
    { item: 'core_yao', n: 3, stock: 3, w: 5 },
    { item: 'ore_cold', n: 5, stock: 3, w: 4 },
    { item: 'ore_star', n: 2, stock: 2, w: 3, reqRealm: 6 },
    { item: 'core_xuan', n: 1, stock: 2, w: 2, reqRealm: 9 },
    { item: 'milk_wannian', n: 1, stock: 2, w: 2, reqRealm: 13 },
    { item: 'pill_juqi', n: 5, stock: 3, w: 8 },
    { item: 'pill_julingsan', n: 2, stock: 3, w: 6 },
    { item: 'pill_yangyuan', n: 2, stock: 3, w: 5 },
    { item: 'pill_peiyuan', n: 2, stock: 2, w: 4 },
    { item: 'pill_julingdan', n: 1, stock: 2, w: 2, reqRealm: 6 },
    { item: 'pill_zhuji', n: 1, stock: 1, w: 3, reqRealm: 6 },
    { item: 'pill_ningjin', n: 1, stock: 1, w: 2, reqRealm: 11 },
    { item: 'pill_huaying', n: 1, stock: 1, w: 1, reqRealm: 15 },
    { item: 'sp_stonebag', n: 1, stock: 5, w: 6 },
    { item: 'sp_pouch', n: 1, stock: 1, w: 4 },
    { item: 'sp_talisman', n: 1, stock: 2, w: 3 },
    { item: 'sp_xiling', n: 1, stock: 1, w: 0.6 },
    { item: 'rp_kuangxue', n: 1, stock: 1, w: 2, reqRealm: 4 },
    { item: 'rp_julingdan', n: 1, stock: 1, w: 2, reqRealm: 6 },
    { item: 'rp_ningjin', n: 1, stock: 1, w: 1.5, reqRealm: 9 },
    { item: 'rp_huaying', n: 1, stock: 1, w: 1, reqRealm: 13 },
    { item: 'rp_wudao', n: 1, stock: 1, w: 0.8, reqRealm: 9 },
    { item: 'bp_jianxia', n: 1, stock: 1, w: 1.5, reqRealm: 3 },
    { item: 'bp_qiankun', n: 1, stock: 1, w: 1.5, reqRealm: 3 },
    { item: 'bp_zhaohun', n: 1, stock: 1, w: 1, reqRealm: 9 },
    { item: 'gf_tuna', n: 1, stock: 1, w: 3 },
    { item: 'gf_changchun', n: 1, stock: 1, w: 2, reqRealm: 2 },
    { item: 'gf_taixuan', n: 1, stock: 1, w: 1, reqRealm: 6 },
    { item: 'st_huoqiu', n: 1, stock: 1, w: 3 },
    { item: 'st_huichun', n: 1, stock: 1, w: 3 },
    { item: 'st_jinzhong', n: 1, stock: 1, w: 2 },
    { item: 'st_zhangxin', n: 1, stock: 1, w: 2, reqRealm: 3 },
    { item: 'st_wanjian', n: 1, stock: 1, w: 0.8, reqRealm: 10 }
  ]
};

/* 品类判定 */
XX.data.shopCategory = function (id) {
  var it = XX.data.items[id];
  if (/^seed_/.test(id)) return 'seed';
  if (/^rp_/.test(id)) return 'recipe';
  if (/^bp_/.test(id)) return 'blueprint';
  if (/^gf_/.test(id)) return 'gongfa';
  if (/^st_/.test(id)) return 'shentong';
  if (it.type === 'pill') return it.use && it.use.kind === 'break' ? 'breakPill' : 'pill';
  if (it.type === 'material') return 'material';
  return 'special';
};
XX.data.shopCatName = { material: '材料', seed: '灵种', pill: '丹药', breakPill: '突破丹', recipe: '丹方', blueprint: '图纸', gongfa: '功法', shentong: '神通', special: '奇物' };
/* 计算价格 */
XX.data.shopPrice = function (o) {
  if (o.price) return o.price;
  var S = XX.data.shop, it = XX.data.items[o.item];
  return Math.max(1, Math.round(S.catBase[XX.data.shopCategory(o.item)] * S.tierMul[it.q || 0] * o.n));
};

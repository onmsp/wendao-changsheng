/*
 * 丹方 / 器方
 * 所有配方都对应一张「图纸」(丹方 rp_ / 器图 bp_ / 阵图 ap_,自动生成),图纸 5 级,等级决定成品效果(config.bpEffect);
 *   突破丹、属性丹的品质(颜色)直接由丹方等级决定(1级白 … 5级金)。重复获得图纸 +5 经验。base:true 开局即掌握。
 * q:配方品质(决定所需丹炉/器炉等级 = q×2+1);bpQ:图纸物品自身的品质(用于掉落规则,不填则同 q)
 * need:每炉材料(炼丹只用灵草/灵果/妖丹/灵乳等,不用矿石);stone:每炉灵石;time:自动计算(白 1 分钟,每高一品质 +1 分钟,特殊丹药 ×2);rate:基础成功率;out:[物品id, 最少, 最多];reqRealm:解锁境界序号
 *   境界序号:0炼气一层 9筑基 13金丹 17元婴 21化神 25炼虚 29合体 33大乘 37渡劫
 * 批量炼丹:耗时 = time × (1 + (N-1) × batchTimeFactor)
 */
XX.data.batchTimeFactor = 0.5;
XX.data.alchemyRecipes = [
  /* —— 白 —— */
  { id: 'a_juqi', name: '聚气丹', q: 0, base: true, out: ['pill_juqi', 2, 3], need: { herb_ninglu: 3 }, stone: 10, rate: 0.95, reqRealm: 0 },
  { id: 'a_julingsan', name: '聚灵散', q: 0, base: true, out: ['pill_julingsan', 1, 2], need: { herb_ninglu: 4, wood_ling: 1 }, stone: 30, rate: 0.9, reqRealm: 1 },
  { id: 'a_brk0', name: '筑基丹', q: 0, base: true, out: ['pill_brk0', 1, 2], need: { herb_ninglu: 6, fruit_zhu: 2, wood_ling: 2 }, stone: 200, rate: 0.85, reqRealm: 3 },
  /* —— 绿 —— */
  { id: 'a_yangyuan', name: '养元丹', q: 1, base: true, out: ['pill_yangyuan', 1, 2], need: { herb_chiyan: 2, fruit_zhu: 1 }, stone: 120, rate: 0.85, reqRealm: 3 },
  { id: 'a_jingang', name: '金刚丹', q: 1, base: true, out: ['pill_jingang', 1, 2], need: { herb_chiyan: 2, wood_ling: 2 }, stone: 120, rate: 0.85, reqRealm: 4 },
  { id: 'a_attr_hp', name: '气血丹', q: 1, out: ['pill_attr_hp', 1, 2], need: { fruit_zhu: 3, herb_ninglu: 5 }, stone: 300, rate: 0.85, reqRealm: 2 },
  { id: 'a_attr_atk', name: '力元丹', q: 1, out: ['pill_attr_atk', 1, 2], need: { core_yao: 2, herb_chiyan: 2 }, stone: 300, rate: 0.85, reqRealm: 2 },
  { id: 'a_attr_def', name: '铁骨丹', q: 1, out: ['pill_attr_def', 1, 2], need: { core_yao: 2, wood_ling: 4 }, stone: 300, rate: 0.85, reqRealm: 2 },
  { id: 'a_attr_mp', name: '灵元丹', q: 1, out: ['pill_attr_mp', 1, 2], need: { fruit_zhu: 2, herb_ninglu: 5 }, stone: 300, rate: 0.85, reqRealm: 2 },
  { id: 'a_brk1', name: '凝金丹', q: 1, out: ['pill_brk1', 1, 1], need: { herb_ziyun: 3, herb_chiyan: 5, core_yao: 3 }, stone: 2000, rate: 0.75, reqRealm: 9 },
  /* —— 蓝 —— */
  { id: 'a_kuangxue', name: '狂血丹', q: 2, out: ['pill_kuangxue', 1, 2], need: { fruit_zhu: 3, core_yao: 1 }, stone: 400, rate: 0.8, reqRealm: 8 },
  { id: 'a_julingdan', name: '聚灵丹', q: 2, out: ['pill_julingdan', 1, 1], need: { herb_ziyun: 4, herb_chiyan: 3 }, stone: 1500, rate: 0.75, reqRealm: 9 },
  { id: 'a_brk2', name: '化婴丹', q: 2, out: ['pill_brk2', 1, 1], need: { herb_ziyun: 8, core_yao: 4, core_xuan: 1 }, stone: 8000, rate: 0.65, reqRealm: 13 },
  /* —— 紫 —— */
  { id: 'a_ningyuan', name: '凝元丹', q: 3, out: ['pill_ningyuan', 1, 2], need: { milk_wannian: 1, herb_ziyun: 3 }, stone: 3000, rate: 0.7, reqRealm: 13 },
  { id: 'a_wudao', name: '悟道丹', q: 3, special: true, out: ['pill_wudao', 1, 1], need: { herb_ziyun: 4, core_xuan: 1, milk_wannian: 1 }, stone: 3000, rate: 0.6, reqRealm: 12 },
  { id: 'a_fuyuan', name: '福缘丹', q: 3, special: true, out: ['pill_fuyuan', 1, 1], need: { herb_ziyun: 4, fruit_zhu: 5, core_xuan: 1 }, stone: 3000, rate: 0.6, reqRealm: 12 },
  { id: 'a_xiling', name: '洗灵液', q: 3, special: true, out: ['sp_xiling', 2, 3], need: { milk_wannian: 1, herb_ziyun: 4, core_xuan: 2 }, stone: 8000, rate: 0.6, reqRealm: 12 },
  { id: 'a_brk3', name: '凝神丹', q: 3, out: ['pill_brk3', 1, 1], need: { milk_wannian: 3, core_xuan: 3, bamboo_lei: 2 }, stone: 30000, rate: 0.6, reqRealm: 17 },
  { id: 'a_tongxuan', name: '通玄丹', q: 3, out: ['pill_tongxuan', 1, 2], need: { herb_jiuye: 2, milk_wannian: 2 }, stone: 20000, rate: 0.65, reqRealm: 21 },
  /* —— 金(突破丹丹方本身为紫色,副本可得)—— */
  { id: 'a_brk4', name: '炼虚丹', q: 4, bpQ: 3, out: ['pill_brk4', 1, 1], need: { herb_jiuye: 4, bamboo_lei: 3, core_xuan: 4 }, stone: 80000, rate: 0.55, reqRealm: 21 },
  { id: 'a_brk5', name: '合体丹', q: 4, bpQ: 3, out: ['pill_brk5', 1, 1], need: { herb_wudaocha: 4, herb_jiuye: 3, core_xuan: 4 }, stone: 150000, rate: 0.5, reqRealm: 25 },
  { id: 'a_brk6', name: '大乘丹', q: 4, bpQ: 3, out: ['pill_brk6', 1, 1], need: { core_dao: 4, herb_wudaocha: 4 }, stone: 300000, rate: 0.5, reqRealm: 29 },
  { id: 'a_brk7', name: '渡劫丹', q: 4, bpQ: 3, out: ['pill_brk7', 1, 1], need: { herb_longxue: 4, core_dao: 3 }, stone: 600000, rate: 0.45, reqRealm: 33 },
  { id: 'a_brk8', name: '飞升丹', q: 4, bpQ: 3, out: ['pill_brk8', 1, 1], need: { herb_leihua: 5, herb_longxue: 4 }, stone: 1000000, rate: 0.4, reqRealm: 37 },
  { id: 'a_taixu', name: '太虚丹', q: 4, out: ['pill_taixu', 1, 1], need: { herb_wudaocha: 3, core_dao: 2 }, stone: 80000, rate: 0.6, reqRealm: 29 },
  { id: 'a_jiuzhuan', name: '九转金丹', q: 4, out: ['pill_jiuzhuan', 1, 1], need: { herb_busi: 1, herb_longxue: 3 }, stone: 300000, rate: 0.5, reqRealm: 33 }
];

/*
 * 炼器:炼制特殊法宝(白~金),需持有对应器图;q 品质,需器炉等级 ≥ q×2+1;pw 法宝强度基准
 * 特殊法宝最多同时佩戴 2 件,不可强化;器图等级越高成品越强
 */
XX.data.forgeRecipes = [
  /* 白 */
  { id: 'f_qingfeng', base: true, out: ['eq_qingfeng', 1, 1], need: { ore_iron: 6, wood_ling: 3 }, stone: 200, rate: 0.95, reqRealm: 0, pw: 2 },
  { id: 'f_yunwen', base: true, out: ['eq_yunwen', 1, 1], need: { ore_iron: 4, herb_ninglu: 6 }, stone: 200, rate: 0.95, reqRealm: 0, pw: 2 },
  { id: 'f_qingxin', out: ['eq_qingxin', 1, 1], need: { ore_iron: 4, jade_raw: 3 }, stone: 300, rate: 0.95, reqRealm: 1, pw: 2 },
  { id: 'f_tayun', out: ['eq_tayun', 1, 1], need: { ore_iron: 5, wood_ling: 4 }, stone: 300, rate: 0.95, reqRealm: 1, pw: 2 },
  /* 绿 */
  { id: 'f_shehun', out: ['eq_shehun', 1, 1], need: { ore_iron: 8, jade_raw: 4, core_yao: 1 }, stone: 800, rate: 0.85, reqRealm: 3, pw: 5 },
  { id: 'f_qiankun', out: ['eq_qiankun', 1, 1], need: { jade_raw: 8, ore_cold: 3 }, stone: 800, rate: 0.85, reqRealm: 3, pw: 5 },
  { id: 'f_bishui', out: ['eq_bishui', 1, 1], need: { ore_cold: 4, wood_ling: 6 }, stone: 800, rate: 0.85, reqRealm: 3, pw: 5 },
  { id: 'f_xuangui', out: ['eq_xuangui', 1, 1], need: { ore_cold: 5, core_yao: 2 }, stone: 800, rate: 0.85, reqRealm: 4, pw: 5 },
  /* 蓝 */
  { id: 'f_jianxia', out: ['eq_jianxia', 1, 1], need: { ore_cold: 8, ore_star: 2, core_yao: 3 }, stone: 3000, rate: 0.75, reqRealm: 7, pw: 9 },
  { id: 'f_zhenhun', out: ['eq_zhenhun', 1, 1], need: { ore_iron_g: 6, ore_star: 2, jade_raw: 6 }, stone: 3000, rate: 0.75, reqRealm: 7, pw: 9 },
  { id: 'f_jiuxiao', out: ['eq_jiuxiao', 1, 1], need: { ore_star: 3, wood_ling: 10, core_yao: 2 }, stone: 3000, rate: 0.75, reqRealm: 8, pw: 9 },
  { id: 'f_luohun', out: ['eq_luohun', 1, 1], need: { ore_star: 3, ore_cold: 6, jade_raw: 6 }, stone: 3000, rate: 0.75, reqRealm: 8, pw: 9 },
  /* 紫 */
  { id: 'f_zhaohun', out: ['eq_zhaohun', 1, 1], need: { core_xuan: 2, ore_star: 4, wood_ling: 20 }, stone: 10000, rate: 0.65, reqRealm: 11, pw: 13 },
  { id: 'f_kunlun', out: ['eq_kunlun', 1, 1], need: { core_xuan: 2, ore_star: 5, jade_raw: 20 }, stone: 10000, rate: 0.65, reqRealm: 11, pw: 13 },
  { id: 'f_zidian', out: ['eq_zidian', 1, 1], need: { ore_youming: 3, ore_star: 5, core_xuan: 1 }, stone: 12000, rate: 0.65, reqRealm: 13, pw: 14 },
  { id: 'f_liuli', out: ['eq_liuli', 1, 1], need: { crystal_xuehun: 2, jade_raw: 20, core_xuan: 1 }, stone: 12000, rate: 0.65, reqRealm: 13, pw: 14 },
  /* 金 */
  { id: 'f_fantian', out: ['eq_fantian', 1, 1], need: { ore_youming: 4, core_xuan: 3, scale_long: 1 }, stone: 40000, rate: 0.55, reqRealm: 15, pw: 17 },
  { id: 'f_linglong', out: ['eq_linglong', 1, 1], need: { ore_youming: 6, bamboo_lei: 4, scale_long: 1 }, stone: 50000, rate: 0.5, reqRealm: 17, pw: 19 },
  { id: 'f_zijin', out: ['eq_zijin', 1, 1], need: { bamboo_lei: 6, milk_wannian: 3, feather_feng: 1 }, stone: 50000, rate: 0.5, reqRealm: 17, pw: 19 },
  { id: 'f_dinghai', out: ['eq_dinghai', 1, 1], need: { ore_xujin: 4, crystal_xuehun: 4, feather_feng: 1 }, stone: 100000, rate: 0.5, reqRealm: 21, pw: 22 },
  { id: 'f_donghuang', out: ['eq_donghuang', 1, 1], need: { ore_xujin: 6, ore_youming: 6, scale_long: 1 }, stone: 120000, rate: 0.5, reqRealm: 25, pw: 26 },
  { id: 'f_zhuxianjian', out: ['eq_zhuxianjian', 1, 1], need: { core_dao: 4, ore_xujin: 6, ore_hundun: 1 }, stone: 250000, rate: 0.45, reqRealm: 29, pw: 30 },
  { id: 'f_taiji', out: ['eq_taiji', 1, 1], need: { ore_tianjing: 6, crystal_xing: 4, ore_xianjin: 1 }, stone: 500000, rate: 0.45, reqRealm: 33, pw: 34 },
  { id: 'f_hundunzhu', out: ['eq_hundunzhu', 1, 1], need: { stone_jie: 6, ore_hundun: 2, herb_busi: 1 }, stone: 900000, rate: 0.4, reqRealm: 37, pw: 38 }
];
(function () {
  XX.data.forgeRecipes.forEach(function (r) {
    var it = XX.data.items[r.out[0]];
    r.q = it.q; r.name = it.name;
  });
  /* 耗时:白 1 分钟,每高一个品质 +1 分钟;特殊丹药双倍(config.craftMinutes / craftSpecialMul) */
  var C = XX.config;
  XX.data.alchemyRecipes.concat(XX.data.forgeRecipes).forEach(function (r) {
    r.time = C.craftMinutes[r.q] * 60 * (r.special ? C.craftSpecialMul : 1);
  });
})();

/*
 * 自动生成图纸物品
 * bpRef:{kind:'alchemy'|'forge'|'array', id};获得时自动掌握或增加图纸经验(不进入背包)
 */
XX.data.bpPrefix = { alchemy: 'rp_', forge: 'bp_', array: 'ap_' };
XX.data.bpKindName = { alchemy: '丹方', forge: '器图', array: '阵图' };
XX.data.makeBlueprints = function (kind, list) {
  var D = XX.data;
  list.forEach(function (r) {
    var id = D.bpPrefix[kind] + r.id.replace(/^[afr]_/, '');
    var q = r.bpQ != null ? r.bpQ : r.q;
    r.bpId = id;
    D.items[id] = { name: D.bpKindName[kind] + '·' + r.name, type: 'special', bpRef: { kind: kind, id: r.id }, icon: kind === 'forge' ? 'item/blueprint' : 'item/jadeslip',
      hue: kind === 'array' ? 120 : (kind === 'alchemy' ? 30 : 0), q: q, price: 40 * Math.pow(2.5, q), badge: kind === 'alchemy' ? '丹' : kind === 'forge' ? '器' : '阵',
      desc: '图纸。首次获得即掌握【' + r.name + '】,重复获得转化为图纸经验 +' + XX.config.bpExpPerDup + '。图纸等级越高,成品效果越强(1级100% → 5级200%)' +
        (kind === 'alchemy' && D.items[r.out[0]] && D.items[r.out[0]].qByGrade ? ',丹药品质随丹方等级提升(1级白 → 5级金)' : '') + '。' };
  });
};
XX.data.makeBlueprints('alchemy', XX.data.alchemyRecipes);
XX.data.makeBlueprints('forge', XX.data.forgeRecipes);

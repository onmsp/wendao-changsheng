/*
 * 丹方 / 器方
 * 所有配方都对应一张「图纸」(丹方 rp_ / 器图 bp_ / 阵图 ap_,自动生成),图纸分 5 级,等级决定成品效果倍率(config.bpEffect);
 *   重复获得图纸自动转化为图纸经验 +5。base:true 的配方开局即掌握 1 级图纸。
 * 炼丹:q 为丹药品质(0白 1绿 2蓝 3紫 4金),需丹炉等级 ≥ q×2+1;蓝色及以上、特殊丹药(special)需获得丹方
 * need:每炉材料;stone:每炉灵石;time:每炉耗时(秒);rate:基础成丹率;out:[物品id, 最少, 最多]
 * reqRealm:解锁境界序号(0炼气一层 9筑基初期 13金丹初期 17元婴初期)
 * 批量:一次开 N 炉,材料/灵石 ×N,耗时 = time × (1 + (N-1) × batchTimeFactor)
 */
XX.data.batchTimeFactor = 0.5;
XX.data.alchemyRecipes = [
  /* —— 白 —— */
  { id: 'a_juqi', name: '聚气丹', q: 0, base: true, out: ['pill_juqi', 2, 3], need: { herb_ninglu: 3 }, stone: 10, time: 300, rate: 0.95, reqRealm: 0 },
  { id: 'a_julingsan', name: '聚灵散', q: 0, base: true, out: ['pill_julingsan', 1, 2], need: { herb_ninglu: 4, wood_ling: 1 }, stone: 30, time: 600, rate: 0.9, reqRealm: 1 },
  /* —— 绿 —— */
  { id: 'a_yangyuan', base: true, name: '养元丹', q: 1, out: ['pill_yangyuan', 1, 2], need: { herb_chiyan: 2, fruit_zhu: 1 }, stone: 120, time: 900, rate: 0.85, reqRealm: 3 },
  { id: 'a_peiyuan', base: true, name: '培元丹', q: 1, out: ['pill_peiyuan', 1, 2], need: { herb_ninglu: 5, fruit_zhu: 2 }, stone: 150, time: 900, rate: 0.85, reqRealm: 3 },
  { id: 'a_jingang', base: true, name: '金刚丹', q: 1, out: ['pill_jingang', 1, 2], need: { herb_chiyan: 2, ore_iron: 3 }, stone: 120, time: 900, rate: 0.85, reqRealm: 4 },
  { id: 'a_zhuji', base: true, name: '筑基丹', q: 1, out: ['pill_zhuji', 1, 1], need: { fruit_zhu: 5, herb_chiyan: 5, core_yao: 2 }, stone: 2000, time: 1800, rate: 0.6, reqRealm: 6 },
  /* —— 蓝(需丹方)—— */
  { id: 'a_kuangxue', name: '狂血丹', q: 2, out: ['pill_kuangxue', 1, 2], need: { fruit_zhu: 3, core_yao: 1 }, stone: 400, time: 1200, rate: 0.8, reqRealm: 8 },
  { id: 'a_julingdan', name: '聚灵丹', q: 2, out: ['pill_julingdan', 1, 1], need: { herb_ziyun: 4, herb_chiyan: 3 }, stone: 1500, time: 1800, rate: 0.75, reqRealm: 9 },
  { id: 'a_pojing', name: '破境丹', q: 2, special: true, out: ['pill_pojing', 1, 1], need: { herb_ziyun: 3, core_yao: 3, jade_raw: 3 }, stone: 1500, time: 2400, rate: 0.7, reqRealm: 8 },
  { id: 'a_ningjin', name: '凝金丹', q: 2, out: ['pill_ningjin', 1, 1], need: { herb_ziyun: 6, core_xuan: 1, ore_star: 2 }, stone: 8000, time: 3600, rate: 0.5, reqRealm: 11 },
  /* —— 紫(需丹方)—— */
  { id: 'a_ningyuan', name: '凝元丹', q: 3, out: ['pill_ningyuan', 1, 2], need: { milk_wannian: 1, herb_ziyun: 3 }, stone: 3000, time: 2400, rate: 0.7, reqRealm: 13 },
  { id: 'a_wudao', name: '悟道丹', q: 3, special: true, out: ['pill_wudao', 1, 1], need: { herb_ziyun: 4, core_xuan: 1, ore_star: 1 }, stone: 3000, time: 3600, rate: 0.6, reqRealm: 12 },
  { id: 'a_fuyuan', name: '福缘丹', q: 3, special: true, out: ['pill_fuyuan', 1, 1], need: { herb_ziyun: 4, jade_raw: 5, core_xuan: 1 }, stone: 3000, time: 3600, rate: 0.6, reqRealm: 12 },
  { id: 'a_xiling', name: '洗灵液', q: 3, special: true, out: ['sp_xiling', 2, 3], need: { milk_wannian: 1, herb_ziyun: 4, core_xuan: 2 }, stone: 8000, time: 3600, rate: 0.6, reqRealm: 12 },
  { id: 'a_huaying', name: '化婴丹', q: 3, out: ['pill_huaying', 1, 1], need: { milk_wannian: 3, herb_ziyun: 10, core_xuan: 3 }, stone: 30000, time: 7200, rate: 0.45, reqRealm: 15 },
  /* —— 金(需丹方)—— */
  { id: 'a_ningshen', name: '凝神丹', q: 4, out: ['pill_ningshen', 1, 1], need: { milk_wannian: 5, crystal_xuehun: 4, scale_long: 1 }, stone: 80000, time: 10800, rate: 0.4, reqRealm: 19 }
];

/*
 * 炼器:炼制白~金品质法宝,需持有对应器图;q 品质,需器炉等级 ≥ q×2+1;pw 法宝强度基准(数值随之成长)
 */
XX.data.forgeRecipes = [
  { id: 'f_qingfeng', base: true, out: ['eq_qingfeng', 1, 1], need: { ore_iron: 6, wood_ling: 3 }, stone: 200, time: 600, rate: 0.95, reqRealm: 0, pw: 2 },
  { id: 'f_yunwen', base: true, out: ['eq_yunwen', 1, 1], need: { ore_iron: 4, herb_ninglu: 6 }, stone: 200, time: 600, rate: 0.95, reqRealm: 0, pw: 2 },
  { id: 'f_shehun', out: ['eq_shehun', 1, 1], need: { ore_iron: 8, jade_raw: 4, core_yao: 1 }, stone: 800, time: 1200, rate: 0.85, reqRealm: 3, pw: 5 },
  { id: 'f_qiankun', out: ['eq_qiankun', 1, 1], need: { jade_raw: 8, ore_cold: 3 }, stone: 800, time: 1200, rate: 0.85, reqRealm: 3, pw: 5 },
  { id: 'f_jianxia', out: ['eq_jianxia', 1, 1], need: { ore_cold: 8, ore_star: 2, core_yao: 3 }, stone: 3000, time: 2400, rate: 0.75, reqRealm: 7, pw: 9 },
  { id: 'f_zhenhun', out: ['eq_zhenhun', 1, 1], need: { ore_iron_g: 6, ore_star: 2, jade_raw: 6 }, stone: 3000, time: 2400, rate: 0.75, reqRealm: 7, pw: 9 },
  { id: 'f_zhaohun', out: ['eq_zhaohun', 1, 1], need: { core_xuan: 2, ore_star: 4, wood_ling: 20 }, stone: 10000, time: 3600, rate: 0.65, reqRealm: 11, pw: 13 },
  { id: 'f_kunlun', out: ['eq_kunlun', 1, 1], need: { core_xuan: 2, ore_star: 5, jade_raw: 20 }, stone: 10000, time: 3600, rate: 0.65, reqRealm: 11, pw: 13 },
  { id: 'f_fantian', out: ['eq_fantian', 1, 1], need: { ore_youming: 4, core_xuan: 3, scale_long: 1 }, stone: 40000, time: 7200, rate: 0.55, reqRealm: 15, pw: 17 },
  { id: 'f_linglong', out: ['eq_linglong', 1, 1], need: { ore_youming: 6, bamboo_lei: 4, scale_long: 1 }, stone: 50000, time: 7200, rate: 0.5, reqRealm: 17, pw: 18 },
  { id: 'f_zijin', out: ['eq_zijin', 1, 1], need: { bamboo_lei: 6, milk_wannian: 3, feather_feng: 1 }, stone: 50000, time: 7200, rate: 0.5, reqRealm: 17, pw: 18 }
];
(function () {
  XX.data.forgeRecipes.forEach(function (r) {
    var it = XX.data.items[r.out[0]];
    r.q = it.q; r.name = it.name;
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
    r.bpId = id;
    D.items[id] = { name: D.bpKindName[kind] + '·' + r.name, type: 'special', bpRef: { kind: kind, id: r.id }, icon: kind === 'forge' ? 'item/blueprint' : 'item/jadeslip',
      hue: kind === 'array' ? 120 : (kind === 'alchemy' ? 30 : 0), q: r.q, price: 40 * Math.pow(2.5, r.q), badge: kind === 'alchemy' ? '丹' : kind === 'forge' ? '器' : '阵',
      desc: '图纸。首次获得即掌握【' + r.name + '】,重复获得转化为图纸经验 +' + XX.config.bpExpPerDup + '。图纸等级越高,成品效果越强(1级100% → 5级200%)。' };
  });
};
XX.data.makeBlueprints('alchemy', XX.data.alchemyRecipes);
XX.data.makeBlueprints('forge', XX.data.forgeRecipes);

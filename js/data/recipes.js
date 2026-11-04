/*
 * 丹方 / 器方
 * 炼丹:q 为丹药品阶(0白 1绿 2蓝 3紫 4金),需丹炉等级 ≥ q×2+1;
 *       蓝色及以上、以及特殊丹药(special:true)需要先参悟「丹方」(自动生成物品 rp_丹方id,副本/秘境低概率掉落)
 * need:每炉材料;stone:每炉灵石;time:每炉耗时(秒);rate:基础成丹率;out:[物品id, 最少, 最多]
 * reqRealm:解锁境界序号(0炼气一层 9筑基初期 13金丹初期 17元婴初期)
 * 批量:一次开 N 炉,材料/灵石 ×N,耗时 = time × (1 + (N-1) × batchTimeFactor)
 */
XX.data.batchTimeFactor = 0.5;
XX.data.alchemyRecipes = [
  /* —— 白 —— */
  { id: 'a_juqi', name: '聚气丹', q: 0, out: ['pill_juqi', 2, 3], need: { herb_ninglu: 3 }, stone: 10, time: 300, rate: 0.95, reqRealm: 0 },
  { id: 'a_julingsan', name: '聚灵散', q: 0, out: ['pill_julingsan', 1, 2], need: { herb_ninglu: 4, wood_ling: 1 }, stone: 30, time: 600, rate: 0.9, reqRealm: 1 },
  /* —— 绿 —— */
  { id: 'a_yangyuan', name: '养元丹', q: 1, out: ['pill_yangyuan', 1, 2], need: { herb_chiyan: 2, fruit_zhu: 1 }, stone: 120, time: 900, rate: 0.85, reqRealm: 3 },
  { id: 'a_peiyuan', name: '培元丹', q: 1, out: ['pill_peiyuan', 1, 2], need: { herb_ninglu: 5, fruit_zhu: 2 }, stone: 150, time: 900, rate: 0.85, reqRealm: 3 },
  { id: 'a_jingang', name: '金刚丹', q: 1, out: ['pill_jingang', 1, 2], need: { herb_chiyan: 2, ore_iron: 3 }, stone: 120, time: 900, rate: 0.85, reqRealm: 4 },
  { id: 'a_zhuji', name: '筑基丹', q: 1, out: ['pill_zhuji', 1, 1], need: { fruit_zhu: 5, herb_chiyan: 5, core_yao: 2 }, stone: 2000, time: 1800, rate: 0.6, reqRealm: 6 },
  /* —— 蓝(需丹方)—— */
  { id: 'a_kuangxue', name: '狂血丹', q: 2, out: ['pill_kuangxue', 1, 2], need: { fruit_zhu: 3, core_yao: 1 }, stone: 400, time: 1200, rate: 0.8, reqRealm: 8 },
  { id: 'a_julingdan', name: '聚灵丹', q: 2, out: ['pill_julingdan', 1, 1], need: { herb_ziyun: 4, herb_chiyan: 3 }, stone: 1500, time: 1800, rate: 0.75, reqRealm: 9 },
  { id: 'a_pojing', name: '破境丹', q: 2, special: true, out: ['pill_pojing', 1, 1], need: { herb_ziyun: 3, core_yao: 3, jade_raw: 3 }, stone: 1500, time: 2400, rate: 0.7, reqRealm: 8 },
  { id: 'a_ningjin', name: '凝金丹', q: 2, out: ['pill_ningjin', 1, 1], need: { herb_ziyun: 6, core_xuan: 1, ore_star: 2 }, stone: 8000, time: 3600, rate: 0.5, reqRealm: 11 },
  /* —— 紫(需丹方)—— */
  { id: 'a_ningyuan', name: '凝元丹', q: 3, out: ['pill_ningyuan', 1, 2], need: { milk_wannian: 1, herb_ziyun: 3 }, stone: 3000, time: 2400, rate: 0.7, reqRealm: 13 },
  { id: 'a_wudao', name: '悟道丹', q: 3, special: true, out: ['pill_wudao', 1, 1], need: { herb_ziyun: 4, core_xuan: 1, ore_star: 1 }, stone: 3000, time: 3600, rate: 0.6, reqRealm: 12 },
  { id: 'a_fuyuan', name: '福缘丹', q: 3, special: true, out: ['pill_fuyuan', 1, 1], need: { herb_ziyun: 4, jade_raw: 5, core_xuan: 1 }, stone: 3000, time: 3600, rate: 0.6, reqRealm: 12 },
  { id: 'a_huaying', name: '化婴丹', q: 3, out: ['pill_huaying', 1, 1], need: { milk_wannian: 3, herb_ziyun: 10, core_xuan: 3 }, stone: 30000, time: 7200, rate: 0.45, reqRealm: 15 },
  /* —— 金(需丹方)—— */
  { id: 'a_xisui', name: '洗髓丹', q: 4, special: true, out: ['pill_xisui', 1, 1], need: { scale_long: 1, milk_wannian: 3, crystal_xuehun: 2 }, stone: 50000, time: 7200, rate: 0.5, reqRealm: 17 },
  { id: 'a_ningshen', name: '凝神丹', q: 4, out: ['pill_ningshen', 1, 1], need: { milk_wannian: 5, crystal_xuehun: 4, scale_long: 1 }, stone: 80000, time: 10800, rate: 0.4, reqRealm: 19 }
];

/*
 * 炼器:只能炼制「特殊法宝」,需先使用对应图纸掌握器方
 * tier:阶位 1~4,需器炉等级 ≥ tier×2+1;lv:法宝等级;出炉为紫品,有概率出金(受器炉等级/悟性/气运影响)
 */
XX.data.forgeRecipes = [
  { id: 'f_jianxia', name: '青冥剑匣', tier: 1, out: ['eq_jianxia', 1, 1], need: { ore_cold: 8, ore_star: 2, core_yao: 3 }, stone: 1500, time: 1800, rate: 0.75, reqRealm: 4, lv: 5 },
  { id: 'f_qiankun', name: '乾坤镯', tier: 1, out: ['eq_qiankun', 1, 1], need: { jade_raw: 10, ore_cold: 5, core_yao: 3 }, stone: 1500, time: 1800, rate: 0.75, reqRealm: 4, lv: 5 },
  { id: 'f_zhenhun', name: '镇魂钟', tier: 1, out: ['eq_zhenhun', 1, 1], need: { ore_iron: 20, ore_star: 2, jade_raw: 5 }, stone: 1500, time: 1800, rate: 0.75, reqRealm: 5, lv: 6 },
  { id: 'f_zhaohun', name: '招魂幡', tier: 2, out: ['eq_zhaohun', 1, 1], need: { core_xuan: 2, ore_star: 4, wood_ling: 20 }, stone: 6000, time: 3600, rate: 0.65, reqRealm: 10, lv: 11 },
  { id: 'f_kunlun', name: '昆仑镜', tier: 2, out: ['eq_kunlun', 1, 1], need: { core_xuan: 2, ore_star: 5, jade_raw: 20 }, stone: 6000, time: 3600, rate: 0.65, reqRealm: 11, lv: 12 },
  { id: 'f_fantian', name: '翻天印', tier: 3, out: ['eq_fantian', 1, 1], need: { ore_youming: 4, core_xuan: 3, ore_star: 6 }, stone: 20000, time: 5400, rate: 0.55, reqRealm: 15, lv: 16 },
  { id: 'f_linglong', name: '玲珑宝塔', tier: 4, out: ['eq_linglong', 1, 1], need: { ore_youming: 6, bamboo_lei: 4, scale_long: 1 }, stone: 50000, time: 7200, rate: 0.5, reqRealm: 18, lv: 19 },
  { id: 'f_zijin', name: '紫金葫芦', tier: 4, out: ['eq_zijin', 1, 1], need: { bamboo_lei: 6, milk_wannian: 3, feather_feng: 1 }, stone: 50000, time: 7200, rate: 0.5, reqRealm: 18, lv: 19 }
];
/* 炼器出金(天品)的基础概率;器炉每级 +2%,悟性每点 +0.5%,气运每点 +0.3% */
XX.data.forgeGoldChance = 0.08;

/* 自动生成「丹方」物品:蓝色及以上或特殊丹药 */
(function () {
  var D = XX.data;
  D.alchemyRecipes.forEach(function (r) {
    r.needRecipe = r.q >= 2 || !!r.special;
    if (!r.needRecipe) return;
    var out = D.items[r.out[0]];
    D.items['rp_' + r.id.slice(2)] = { name: r.name + '丹方', type: 'special', icon: 'item/jadeslip', hue: [0, 0, 180, 260, 30][r.q], q: r.q, price: 60 * Math.pow(2.5, r.q), badge: '方',
      desc: '记载【' + r.name + '】炼制之法' + (r.special ? '(特殊丹药)' : '') + '。参悟后永久掌握,需丹炉 ' + (r.q * 2 + 1) + ' 级方可炼制。' + (out ? '丹效:' + out.desc : ''),
      use: { kind: 'recipe', recipe: r.id } };
  });
})();

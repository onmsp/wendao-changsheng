/*
 * 丹方 / 器方
 * need:所需材料 {物品id: 数量};stone:每炉灵石;time:每炉耗时(秒);rate:基础成功率;out:产出 [物品id, 最少, 最多]
 * reqRealm:解锁境界序号(0炼气一层 9筑基初期 13金丹初期 17元婴初期)
 * 炼丹支持批量:一次开 N 炉,材料/灵石 ×N,耗时 = time × (1 + (N-1) × batchTimeFactor)
 */
XX.data.batchTimeFactor = 0.5;
XX.data.alchemyRecipes = [
  { id: 'a_juqi', name: '聚气丹', out: ['pill_juqi', 2, 4], need: { herb_ninglu: 3 }, stone: 20, time: 20, rate: 0.95, reqRealm: 0 },
  { id: 'a_peiyuan', name: '培元丹', out: ['pill_peiyuan', 1, 2], need: { herb_ninglu: 4, fruit_zhu: 1 }, stone: 80, time: 40, rate: 0.85, reqRealm: 2 },
  { id: 'a_yangyuan', name: '养元丹', out: ['pill_yangyuan', 1, 3], need: { herb_chiyan: 3, fruit_zhu: 2 }, stone: 150, time: 60, rate: 0.8, reqRealm: 4 },
  { id: 'a_zhuji', name: '筑基丹', out: ['pill_zhuji', 1, 1], need: { herb_ziyun: 3, fruit_zhu: 3, core_yao: 2 }, stone: 600, time: 180, rate: 0.6, reqRealm: 7 },
  { id: 'a_wudao', name: '悟道丹', out: ['pill_wudao', 1, 1], need: { herb_ziyun: 4, core_yao: 4, ore_star: 1 }, stone: 1500, time: 300, rate: 0.5, reqRealm: 9 },
  { id: 'a_ningjin', name: '凝金丹', out: ['pill_ningjin', 1, 1], need: { herb_ziyun: 8, core_xuan: 2, ore_star: 3 }, stone: 5000, time: 600, rate: 0.5, reqRealm: 11 },
  { id: 'a_huaying', name: '化婴丹', out: ['pill_huaying', 1, 1], need: { milk_wannian: 3, herb_ziyun: 10, core_xuan: 3 }, stone: 15000, time: 900, rate: 0.45, reqRealm: 15 },
  { id: 'a_ningyuan', name: '凝元丹', out: ['pill_ningyuan', 1, 2], need: { milk_wannian: 1, crystal_xuehun: 1, herb_ziyun: 3 }, stone: 8000, time: 600, rate: 0.6, reqRealm: 17 },
  { id: 'a_ningshen', name: '凝神丹', out: ['pill_ningshen', 1, 1], need: { milk_wannian: 5, crystal_xuehun: 4, scale_long: 1 }, stone: 40000, time: 1200, rate: 0.4, reqRealm: 19 }
];

/*
 * 炼器:只能炼制「特殊法宝」,需先使用对应图纸掌握器方
 * lv:法宝等级;q:基础品阶(3 紫),有概率出金(受悟性/气运影响)
 */
XX.data.forgeRecipes = [
  { id: 'f_jianxia', name: '青冥剑匣', out: ['eq_jianxia', 1, 1], need: { ore_cold: 8, ore_star: 2, core_yao: 3 }, stone: 1500, time: 180, rate: 0.75, reqRealm: 4, lv: 5 },
  { id: 'f_qiankun', name: '乾坤镯', out: ['eq_qiankun', 1, 1], need: { jade_raw: 10, ore_cold: 5, core_yao: 3 }, stone: 1500, time: 180, rate: 0.75, reqRealm: 4, lv: 5 },
  { id: 'f_zhenhun', name: '镇魂钟', out: ['eq_zhenhun', 1, 1], need: { ore_iron: 20, ore_star: 2, jade_raw: 5 }, stone: 1500, time: 180, rate: 0.75, reqRealm: 5, lv: 6 },
  { id: 'f_zhaohun', name: '招魂幡', out: ['eq_zhaohun', 1, 1], need: { core_xuan: 2, ore_star: 4, wood_ling: 20 }, stone: 6000, time: 360, rate: 0.65, reqRealm: 10, lv: 11 },
  { id: 'f_kunlun', name: '昆仑镜', out: ['eq_kunlun', 1, 1], need: { core_xuan: 2, ore_star: 5, jade_raw: 20 }, stone: 6000, time: 360, rate: 0.65, reqRealm: 11, lv: 12 },
  { id: 'f_fantian', name: '翻天印', out: ['eq_fantian', 1, 1], need: { ore_youming: 4, core_xuan: 3, ore_star: 6 }, stone: 20000, time: 600, rate: 0.55, reqRealm: 15, lv: 16 },
  { id: 'f_linglong', name: '玲珑宝塔', out: ['eq_linglong', 1, 1], need: { ore_youming: 6, bamboo_lei: 4, scale_long: 1 }, stone: 50000, time: 900, rate: 0.5, reqRealm: 18, lv: 19 },
  { id: 'f_zijin', name: '紫金葫芦', out: ['eq_zijin', 1, 1], need: { bamboo_lei: 6, milk_wannian: 3, feather_feng: 1 }, stone: 50000, time: 900, rate: 0.5, reqRealm: 18, lv: 19 }
];
/* 炼器出金(天品)的基础概率,悟性每点 +0.5%,气运每点 +0.3% */
XX.data.forgeGoldChance = 0.12;

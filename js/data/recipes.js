/*
 * 丹方 / 器方
 * need:所需材料 {物品id: 数量};stone:消耗灵石;time:耗时(秒);rate:基础成功率;out:产出 [物品id, 最少, 最多]
 * reqRealm:解锁所需境界序号(见 realms.js,0=炼气一层,9=筑基初期,13=金丹初期)
 */
XX.data.alchemyRecipes = [
  { id: 'a_juqi', name: '聚气丹', out: ['pill_juqi', 2, 4], need: { herb_ninglu: 3 }, stone: 30, time: 20, rate: 0.95, reqRealm: 0 },
  { id: 'a_peiyuan', name: '培元丹', out: ['pill_peiyuan', 1, 2], need: { herb_ninglu: 4, fruit_zhu: 1 }, stone: 80, time: 40, rate: 0.85, reqRealm: 2 },
  { id: 'a_yangyuan', name: '养元丹', out: ['pill_yangyuan', 1, 3], need: { herb_chiyan: 3, fruit_zhu: 2 }, stone: 150, time: 60, rate: 0.8, reqRealm: 4 },
  { id: 'a_zhuji', name: '筑基丹', out: ['pill_zhuji', 1, 1], need: { herb_ziyun: 3, fruit_zhu: 3, core_yao: 2 }, stone: 600, time: 180, rate: 0.6, reqRealm: 7 },
  { id: 'a_wudao', name: '悟道丹', out: ['pill_wudao', 1, 1], need: { herb_ziyun: 4, core_yao: 4, ore_star: 1 }, stone: 1500, time: 300, rate: 0.5, reqRealm: 9 },
  { id: 'a_ningjin', name: '凝金丹', out: ['pill_ningjin', 1, 1], need: { herb_ziyun: 8, core_xuan: 2, ore_star: 3 }, stone: 5000, time: 600, rate: 0.5, reqRealm: 11 }
];

XX.data.forgeRecipes = [
  { id: 'f_qingfeng', name: '青锋剑', out: ['eq_qingfeng', 1, 1], need: { ore_iron: 5, wood_ling: 2 }, stone: 60, time: 30, rate: 0.95, reqRealm: 0 },
  { id: 'f_yunwen', name: '云纹道袍', out: ['eq_yunwen', 1, 1], need: { herb_ninglu: 4, wood_ling: 3 }, stone: 60, time: 30, rate: 0.95, reqRealm: 0 },
  { id: 'f_qingyu', name: '青玉佩', out: ['eq_qingyu', 1, 1], need: { jade_raw: 2, ore_iron: 2 }, stone: 80, time: 30, rate: 0.9, reqRealm: 1 },
  { id: 'f_xuantie', name: '玄铁重剑', out: ['eq_xuantie', 1, 1], need: { ore_iron: 12, ore_cold: 3, wood_ling: 3 }, stone: 300, time: 90, rate: 0.8, reqRealm: 4 },
  { id: 'f_hantie', name: '寒铁法衣', out: ['eq_hantie', 1, 1], need: { ore_cold: 6, core_yao: 1 }, stone: 300, time: 90, rate: 0.8, reqRealm: 4 },
  { id: 'f_ziling', name: '紫灵佩', out: ['eq_ziling', 1, 1], need: { jade_raw: 5, core_yao: 2 }, stone: 300, time: 90, rate: 0.8, reqRealm: 5 },
  { id: 'f_chiyan', name: '赤焰剑', out: ['eq_chiyan', 1, 1], need: { ore_star: 3, ore_cold: 8, core_yao: 4 }, stone: 1500, time: 240, rate: 0.65, reqRealm: 9 },
  { id: 'f_xuanwu', name: '玄武宝甲', out: ['eq_xuanwu', 1, 1], need: { ore_star: 3, ore_cold: 10, core_xuan: 1 }, stone: 1500, time: 240, rate: 0.65, reqRealm: 9 },
  { id: 'f_xingchen', name: '星辰坠', out: ['eq_xingchen', 1, 1], need: { ore_star: 4, jade_raw: 8, core_xuan: 1 }, stone: 1500, time: 240, rate: 0.65, reqRealm: 10 }
];

/* 炼器品质概率权重(会受悟性、气运修正) */
XX.data.forgeQualityWeights = [50, 30, 13, 5, 1.6, 0.4];

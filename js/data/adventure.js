/*
 * 外出:历练副本 & 秘境(当前开放至元婴期)
 * power:妖兽强度(≈ 同等境界序号),同时决定掉落法宝的强度
 * drops:[物品id, 基础概率, 最少, 最多]
 *   实际概率 = 基础概率 × config.tierDropMul[物品品质](白1 绿1/2 蓝1/4 紫1/8 金1/16,品质越高按比例降低)
 *   副本:掉落低品质成品、材料、图纸、玉简,不出现金色;秘境:只掉紫/金品质,不掉特殊道具
 *   法宝掉落概率统一见 config.treasureDrop
 */
XX.data.areas = [
  { id: 'qinglan', name: '青岚山', bg: 'battle', power: 0, reqRealm: 0, monsters: ['wolf', 'spider'],
    desc: '宗门山脚的灵兽出没之地,适合初入仙途者磨砺。', stone: [4, 8], exp: [3, 6],
    drops: [['herb_ninglu', 0.5, 1, 2], ['ore_iron', 0.5, 1, 2], ['wood_ling', 0.35, 1, 2], ['seed_ninglu', 0.3, 1, 2], ['pill_juqi', 0.08, 1, 2],
      ['rp_juqi', 0.03, 1, 1], ['bp_qingfeng', 0.02, 1, 1], ['bp_yunwen', 0.02, 1, 1], ['ap_juling', 0.02, 1, 1], ['st_huoqiu', 0.02, 1, 1], ['gf_tuna', 0.015, 1, 1], ['sp_pouch', 0.01, 1, 1]] },
  { id: 'heishui', name: '黑水泽', bg: 'battle', power: 3, reqRealm: 2, monsters: ['spider', 'python'],
    desc: '瘴气弥漫的沼泽,毒物横行。', stone: [10, 16], exp: [6, 10],
    drops: [['fruit_zhu', 0.6, 1, 2], ['seed_zhu', 0.3, 1, 1], ['jade_raw', 0.4, 1, 2], ['core_yao', 0.2, 1, 1], ['seed_chiyan', 0.16, 1, 1], ['ore_iron_g', 0.2, 1, 1], ['ore_iron', 0.4, 1, 2],
      ['pill_yangyuan', 0.06, 1, 1], ['rp_julingsan', 0.03, 1, 1], ['rp_yangyuan', 0.03, 1, 1], ['bp_shehun', 0.02, 1, 1], ['ap_jinguang', 0.03, 1, 1],
      ['st_huichun', 0.02, 1, 1], ['st_jinzhong', 0.03, 1, 1], ['gf_changchun', 0.02, 1, 1], ['sp_pouch', 0.01, 1, 1]] },
  { id: 'chiyan', name: '赤焰谷', bg: 'battle', power: 6, reqRealm: 5, monsters: ['boar', 'tiger'],
    desc: '地火喷涌的山谷,赤炎花生于岩缝之间。', stone: [20, 30], exp: [10, 16],
    drops: [['herb_chiyan', 0.7, 1, 2], ['seed_chiyan', 0.3, 1, 1], ['ore_cold', 0.5, 1, 2], ['core_yao', 0.36, 1, 1], ['ore_iron_g', 0.3, 1, 1], ['pill_jingang', 0.08, 1, 1],
      ['rp_peiyuan', 0.04, 1, 1], ['rp_jingang', 0.04, 1, 1], ['rp_zhuji', 0.04, 1, 1], ['bp_qiankun', 0.04, 1, 1], ['ap_shafa', 0.04, 1, 1],
      ['st_zhangxin', 0.03, 1, 1], ['st_kuangbao', 0.03, 1, 1], ['gf_liehuo', 0.02, 1, 1], ['rp_kuangxue', 0.02, 1, 1], ['rp_pojing', 0.016, 1, 1], ['sp_talisman', 0.02, 1, 1]] },
  { id: 'guzhan', name: '上古战场', bg: 'battle', power: 9, reqRealm: 8, monsters: ['ghost', 'golem'],
    desc: '上古大能陨落之地,阴魂不散,遗宝犹存。', stone: [35, 50], exp: [16, 24],
    drops: [['herb_ziyun', 0.6, 1, 1], ['seed_ziyun', 0.3, 1, 1], ['ore_star', 0.4, 1, 1], ['core_yao', 0.5, 1, 2], ['ore_iron_g', 0.3, 1, 2], ['pill_zhuji', 0.04, 1, 1],
      ['rp_julingdan', 0.03, 1, 1], ['bp_jianxia', 0.03, 1, 1], ['bp_zhenhun', 0.03, 1, 1], ['ap_yuanling', 0.06, 1, 1], ['ap_jubao', 0.03, 1, 1],
      ['st_shiling', 0.03, 1, 1], ['st_pojia', 0.03, 1, 1], ['rp_ningjin', 0.02, 1, 1], ['sp_stonebag', 0.03, 1, 1]] },
  { id: 'leiming', name: '雷鸣峰', bg: 'battle', power: 12, reqRealm: 11, monsters: ['eagle', 'tiger'],
    desc: '终年雷霆不息,雷鹰盘旋于峰顶。', stone: [60, 85], exp: [25, 35],
    drops: [['herb_ziyun', 0.8, 1, 2], ['ore_star', 0.6, 1, 2], ['core_xuan', 0.4, 1, 1], ['ore_iron_g', 0.4, 1, 2], ['pill_julingdan', 0.06, 1, 1],
      ['st_wanjian', 0.03, 1, 1], ['gf_taixuan', 0.03, 1, 1], ['gf_jingang', 0.03, 1, 1], ['rp_ningjin', 0.03, 1, 1], ['ap_hushan', 0.03, 1, 1], ['bp_jianxia', 0.03, 1, 1], ['sp_talisman', 0.04, 1, 1]] },
  { id: 'wanyao', name: '万妖岭', bg: 'battle', power: 15, reqRealm: 14, monsters: ['beast', 'python', 'tiger'],
    desc: '妖族盘踞的万里山岭,凶险莫测。', stone: [100, 140], exp: [40, 60],
    drops: [['core_xuan', 0.9, 1, 1], ['ore_star', 0.8, 1, 2], ['ore_youming', 0.4, 1, 1], ['milk_wannian', 0.3, 1, 1], ['pill_ningjin', 0.04, 1, 1],
      ['rp_ningyuan', 0.06, 1, 1], ['rp_huaying', 0.04, 1, 1], ['rp_xiling', 0.04, 1, 1], ['rp_wudao', 0.04, 1, 1], ['bp_zhaohun', 0.04, 1, 1], ['bp_kunlun', 0.04, 1, 1],
      ['ap_xingdou', 0.03, 1, 1], ['st_jiutian', 0.03, 1, 1], ['gf_zixia', 0.02, 1, 1]] },
  { id: 'xuesha', name: '血煞魔域', bg: 'secret', power: 18, reqRealm: 17, monsters: ['xuelang', 'minggu'],
    desc: '元婴修士方可涉足的魔域,血煞之气侵蚀神魂。', stone: [160, 220], exp: [60, 90],
    drops: [['crystal_xuehun', 1, 1, 1], ['ore_youming', 0.9, 1, 2], ['core_xuan', 0.9, 1, 2], ['milk_wannian', 0.5, 1, 1], ['pill_huaying', 0.03, 1, 1],
      ['gf_jiuzhuan', 0.03, 1, 1], ['st_xuanwu', 0.04, 1, 1], ['st_tianhuo', 0.03, 1, 1], ['rp_fuyuan', 0.04, 1, 1], ['ap_liangyi', 0.03, 1, 1]] },
  { id: 'tianlei', name: '天雷泽', bg: 'battle', power: 20, reqRealm: 19, monsters: ['leipeng', 'mojiao'],
    desc: '天雷日夜轰击的沼泽,孕育天雷竹与万年灵乳。', stone: [250, 340], exp: [90, 130],
    drops: [['bamboo_lei', 1, 1, 2], ['milk_wannian', 0.8, 1, 1], ['crystal_xuehun', 0.8, 1, 1], ['ore_youming', 0.6, 1, 2], ['pill_ningyuan', 0.1, 1, 1],
      ['st_tianhuo', 0.04, 1, 1], ['rp_ningyuan', 0.06, 1, 1], ['bp_zhaohun', 0.04, 1, 1]] }
];

/* 秘境:floors 为逐层妖兽,最后一层为首领(bossMul 加成);reward.jade 为通关仙玉;掉落只含紫/金品质 */
XX.data.secrets = [
  { id: 'luoxia', name: '落霞秘境', bg: 'secret', power: 4, reqRealm: 4, floors: ['wolf', 'python', 'boar'], bossMul: 1.6,
    desc: '晚霞深处的上古洞天,传闻藏有前辈遗留的丹方与图纸。', reward: { jade: [1, 3], stone: [150, 250] },
    drops: [['core_xuan', 1.6, 1, 1], ['ore_youming', 0.8, 1, 1], ['milk_wannian', 0.4, 1, 1], ['pill_ningyuan', 0.4, 1, 1], ['rp_xiling', 0.2, 1, 1], ['rp_ningyuan', 0.16, 1, 1],
      ['rp_wudao', 0.16, 1, 1], ['rp_fuyuan', 0.16, 1, 1], ['bp_zhaohun', 0.16, 1, 1], ['bp_kunlun', 0.16, 1, 1], ['ap_xingdou', 0.12, 1, 1], ['ap_liangyi', 0.12, 1, 1], ['gf_zixia', 0.1, 1, 1], ['st_jiutian', 0.1, 1, 1]] },
  { id: 'taixu', name: '太虚古殿', bg: 'secret', power: 10, reqRealm: 9, floors: ['golem', 'ghost', 'eagle', 'tiger'], bossMul: 1.7,
    desc: '漂浮于虚空的古殿,殿中石傀守护着无尽传承。', reward: { jade: [3, 5], stone: [600, 1000] },
    drops: [['core_xuan', 2, 1, 2], ['ore_youming', 1.2, 1, 1], ['milk_wannian', 0.8, 1, 1], ['pill_ningyuan', 0.6, 1, 1], ['rp_xiling', 0.3, 1, 1], ['rp_huaying', 0.24, 1, 1],
      ['rp_wudao', 0.2, 1, 1], ['bp_zhaohun', 0.2, 1, 1], ['bp_kunlun', 0.2, 1, 1], ['ap_xingdou', 0.16, 1, 1], ['gf_jiuzhuan', 0.12, 1, 1], ['st_xuanwu', 0.12, 1, 1],
      ['scale_long', 0.3, 1, 1], ['bp_fantian', 0.12, 1, 1], ['ap_zhuxian', 0.08, 1, 1]] },
  { id: 'jiuyou', name: '九幽魔窟', bg: 'secret', power: 14, reqRealm: 13, floors: ['ghost', 'python', 'tiger', 'eagle', 'beast'], bossMul: 1.6,
    desc: '直通九幽的魔窟,上古魔兕镇守最深处。', reward: { jade: [5, 8], stone: [2500, 4000] },
    drops: [['ore_youming', 2, 1, 2], ['crystal_xuehun', 1.2, 1, 1], ['milk_wannian', 1.2, 1, 1], ['pill_huaying', 0.4, 1, 1], ['rp_huaying', 0.4, 1, 1], ['rp_xiling', 0.4, 1, 1],
      ['rp_ningyuan', 0.3, 1, 1], ['st_tianhuo', 0.2, 1, 1], ['ap_liangyi', 0.2, 1, 1], ['scale_long', 0.5, 1, 1], ['feather_feng', 0.4, 1, 1],
      ['bp_fantian', 0.2, 1, 1], ['rp_ningshen', 0.15, 1, 1], ['ap_hunyuan', 0.1, 1, 1], ['gf_taishang', 0.1, 1, 1]] },
  { id: 'xingxu', name: '天外星墟', bg: 'secret', power: 19, reqRealm: 17, floors: ['xuelang', 'minggu', 'leipeng', 'tiger', 'mojiao'], bossMul: 1.6,
    desc: '天外陨星坠落形成的废墟,星辰之力与远古凶兽并存。', reward: { jade: [8, 12], stone: [8000, 12000] },
    drops: [['crystal_xuehun', 2, 1, 2], ['bamboo_lei', 1.6, 1, 2], ['scale_long', 1.2, 1, 1], ['feather_feng', 1, 1, 1], ['pill_huaying', 0.6, 1, 1],
      ['bp_linglong', 0.3, 1, 1], ['bp_zijin', 0.3, 1, 1], ['ap_zhuxian', 0.2, 1, 1], ['ap_hunyuan', 0.2, 1, 1], ['rp_ningshen', 0.3, 1, 1],
      ['gf_taishang', 0.2, 1, 1], ['st_zhanxian', 0.12, 1, 1], ['st_xuanwu', 0.3, 1, 1], ['rp_xiling', 0.6, 1, 1]] }
];

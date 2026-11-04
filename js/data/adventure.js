/*
 * 外出:历练副本 & 秘境(当前开放至元婴期)
 * power:妖兽强度(≈ 同等境界序号),同时决定掉落法宝的等级
 * reqRealm:进入所需境界序号
 * drops:[物品id, 概率, 最少, 最多];法宝掉落概率统一见 config.treasureDrop
 * 秘境掉落的实际概率 = 填写概率 × config.secretTierDropMul[物品品阶](品阶越高越难获得)
 * 丹方(rp_)、图纸(bp_)、功法(gf_)、神通(st_)均为低概率掉落
 */
XX.data.areas = [
  { id: 'qinglan', name: '青岚山', bg: 'battle', power: 0, reqRealm: 0, monsters: ['wolf', 'spider'],
    desc: '宗门山脚的灵兽出没之地,适合初入仙途者磨砺。', stone: [4, 8], exp: [3, 6],
    drops: [['herb_ninglu', 0.5, 1, 2], ['ore_iron', 0.4, 1, 2], ['wood_ling', 0.35, 1, 2], ['seed_ninglu', 0.3, 1, 2], ['st_huoqiu', 0.01, 1, 1], ['gf_tuna', 0.008, 1, 1], ['sp_pouch', 0.005, 1, 1]] },
  { id: 'heishui', name: '黑水泽', bg: 'battle', power: 3, reqRealm: 2, monsters: ['spider', 'python'],
    desc: '瘴气弥漫的沼泽,毒物横行。', stone: [10, 16], exp: [6, 10],
    drops: [['fruit_zhu', 0.3, 1, 2], ['seed_zhu', 0.15, 1, 1], ['jade_raw', 0.25, 1, 2], ['core_yao', 0.1, 1, 1], ['seed_chiyan', 0.08, 1, 1], ['st_huichun', 0.01, 1, 1], ['st_jinzhong', 0.01, 1, 1], ['gf_changchun', 0.006, 1, 1], ['sp_pouch', 0.006, 1, 1]] },
  { id: 'chiyan', name: '赤焰谷', bg: 'battle', power: 6, reqRealm: 5, monsters: ['boar', 'tiger'],
    desc: '地火喷涌的山谷,赤炎花生于岩缝之间。', stone: [20, 30], exp: [10, 16],
    drops: [['herb_chiyan', 0.35, 1, 2], ['seed_chiyan', 0.15, 1, 1], ['ore_cold', 0.25, 1, 2], ['core_yao', 0.18, 1, 1], ['sp_talisman', 0.02, 1, 1], ['st_zhangxin', 0.008, 1, 1], ['st_kuangbao', 0.008, 1, 1], ['gf_liehuo', 0.006, 1, 1], ['rp_kuangxue', 0.004, 1, 1], ['rp_pojing', 0.003, 1, 1]] },
  { id: 'guzhan', name: '上古战场', bg: 'battle', power: 9, reqRealm: 8, monsters: ['ghost', 'golem'],
    desc: '上古大能陨落之地,阴魂不散,遗宝犹存。', stone: [35, 50], exp: [16, 24],
    drops: [['herb_ziyun', 0.2, 1, 1], ['seed_ziyun', 0.08, 1, 1], ['ore_star', 0.1, 1, 1], ['core_yao', 0.3, 1, 2], ['sp_stonebag', 0.03, 1, 1], ['st_shiling', 0.008, 1, 1], ['st_pojia', 0.005, 1, 1], ['rp_julingdan', 0.004, 1, 1], ['rp_ningjin', 0.003, 1, 1], ['bp_jianxia', 0.003, 1, 1]] },
  { id: 'leiming', name: '雷鸣峰', bg: 'battle', power: 12, reqRealm: 11, monsters: ['eagle', 'tiger'],
    desc: '终年雷霆不息,雷鹰盘旋于峰顶。', stone: [60, 85], exp: [25, 35],
    drops: [['herb_ziyun', 0.3, 1, 2], ['ore_star', 0.18, 1, 2], ['core_xuan', 0.07, 1, 1], ['sp_talisman', 0.04, 1, 1], ['st_wanjian', 0.005, 1, 1], ['gf_jingang', 0.004, 1, 1], ['rp_ningjin', 0.004, 1, 1], ['rp_wudao', 0.002, 1, 1], ['bp_zhaohun', 0.002, 1, 1]] },
  { id: 'wanyao', name: '万妖岭', bg: 'battle', power: 15, reqRealm: 14, monsters: ['beast', 'python', 'tiger'],
    desc: '妖族盘踞的万里山岭,凶险莫测。', stone: [100, 140], exp: [40, 60],
    drops: [['core_xuan', 0.16, 1, 1], ['ore_star', 0.25, 1, 2], ['ore_youming', 0.05, 1, 1], ['milk_wannian', 0.03, 1, 1], ['st_jiutian', 0.003, 1, 1], ['gf_zixia', 0.002, 1, 1], ['rp_ningyuan', 0.003, 1, 1], ['rp_huaying', 0.002, 1, 1], ['bp_fantian', 0.002, 1, 1]] },
  { id: 'xuesha', name: '血煞魔域', bg: 'secret', power: 18, reqRealm: 17, monsters: ['xuelang', 'minggu'],
    desc: '元婴修士方可涉足的魔域,血煞之气侵蚀神魂。', stone: [160, 220], exp: [60, 90],
    drops: [['crystal_xuehun', 0.22, 1, 1], ['ore_youming', 0.18, 1, 2], ['core_xuan', 0.22, 1, 2], ['milk_wannian', 0.08, 1, 1], ['gf_jiuzhuan', 0.002, 1, 1], ['st_xuanwu', 0.003, 1, 1], ['rp_fuyuan', 0.002, 1, 1], ['rp_xisui', 0.001, 1, 1]] },
  { id: 'tianlei', name: '天雷泽', bg: 'battle', power: 20, reqRealm: 19, monsters: ['leipeng', 'mojiao'],
    desc: '天雷日夜轰击的沼泽,孕育天雷竹与万年灵乳。', stone: [250, 340], exp: [90, 130],
    drops: [['bamboo_lei', 0.2, 1, 2], ['milk_wannian', 0.14, 1, 1], ['crystal_xuehun', 0.14, 1, 1], ['scale_long', 0.02, 1, 1], ['st_tianhuo', 0.003, 1, 1], ['gf_taishang', 0.001, 1, 1], ['rp_ningshen', 0.001, 1, 1]] }
];

/* 秘境:floors 为逐层妖兽,最后一层为首领(bossMul 加成);reward.jade 为通关仙玉 */
XX.data.secrets = [
  { id: 'luoxia', name: '落霞秘境', bg: 'secret', power: 4, reqRealm: 4, floors: ['wolf', 'python', 'boar'], bossMul: 1.6,
    desc: '晚霞深处的上古洞天,传闻藏有前辈遗留的丹方与图纸。', reward: { jade: [1, 3], stone: [150, 250] },
    drops: [['pill_yangyuan', 0.5, 1, 2], ['seed_ziyun', 0.2, 1, 2], ['sp_pouch', 0.15, 1, 1], ['rp_kuangxue', 0.1, 1, 1], ['rp_julingdan', 0.08, 1, 1], ['rp_pojing', 0.06, 1, 1],
      ['bp_jianxia', 0.1, 1, 1], ['bp_qiankun', 0.1, 1, 1], ['bp_zhenhun', 0.08, 1, 1], ['gf_taixuan', 0.05, 1, 1], ['sp_xiling', 0.05, 1, 1]] },
  { id: 'taixu', name: '太虚古殿', bg: 'secret', power: 10, reqRealm: 9, floors: ['golem', 'ghost', 'eagle', 'tiger'], bossMul: 1.7,
    desc: '漂浮于虚空的古殿,殿中石傀守护着无尽传承。', reward: { jade: [3, 5], stone: [600, 1000] },
    drops: [['pill_zhuji', 0.2, 1, 1], ['rp_ningjin', 0.12, 1, 1], ['rp_wudao', 0.06, 1, 1], ['rp_fuyuan', 0.06, 1, 1], ['gf_jingang', 0.08, 1, 1], ['st_jinshen', 0.08, 1, 1],
      ['st_pojia', 0.08, 1, 1], ['bp_zhaohun', 0.08, 1, 1], ['bp_kunlun', 0.08, 1, 1], ['sp_xiling', 0.06, 1, 1]] },
  { id: 'jiuyou', name: '九幽魔窟', bg: 'secret', power: 14, reqRealm: 13, floors: ['ghost', 'python', 'tiger', 'eagle', 'beast'], bossMul: 1.6,
    desc: '直通九幽的魔窟,上古魔兕镇守最深处。', reward: { jade: [5, 8], stone: [2500, 4000] },
    drops: [['ore_youming', 0.3, 1, 2], ['pill_ningjin', 0.1, 1, 1], ['rp_huaying', 0.1, 1, 1], ['rp_ningyuan', 0.08, 1, 1], ['gf_zixia', 0.06, 1, 1], ['st_jiutian', 0.06, 1, 1],
      ['st_tianhuo', 0.04, 1, 1], ['bp_fantian', 0.06, 1, 1], ['sp_xiling', 0.08, 1, 1]] },
  { id: 'xingxu', name: '天外星墟', bg: 'secret', power: 19, reqRealm: 17, floors: ['xuelang', 'minggu', 'leipeng', 'tiger', 'mojiao'], bossMul: 1.6,
    desc: '天外陨星坠落形成的废墟,星辰之力与远古凶兽并存。', reward: { jade: [8, 12], stone: [8000, 12000] },
    drops: [['scale_long', 0.25, 1, 1], ['feather_feng', 0.2, 1, 1], ['rp_xisui', 0.1, 1, 1], ['rp_ningshen', 0.06, 1, 1], ['gf_taishang', 0.05, 1, 1], ['st_xuanwu', 0.06, 1, 1],
      ['bp_linglong', 0.08, 1, 1], ['bp_zijin', 0.08, 1, 1], ['sp_xiling', 0.1, 1, 1]] }
];

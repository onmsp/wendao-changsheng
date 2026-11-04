/*
 * 角色模板
 * 图片规则:assets/char/{id}_stand.webp(看板) / _med.webp(打坐) / _atk.webp(战斗) / _avatar.webp(头像)
 * skill:战斗中施展的功法名称
 * bonus:模板天赋,作为属性加成(百分比字段以 Pct 结尾)
 */
XX.data.characters = [
  { id: 'm1', skill: '青锋剑诀', gender: 'male', name: '青锋剑客', school: '剑修', color: '#7fc8ff',
    desc: '白衣负剑,一剑西来。剑心通明,出手凌厉。', bonus: { atkPct: 0.08, crit: 0.03 }, bonusText: '攻击 +8%,暴击率 +3%' },
  { id: 'm2', skill: '九宫困阵', gender: 'male', name: '玉衡书生', school: '阵修', color: '#9fe0b0',
    desc: '折扇轻摇,胸藏万千阵纹。阵道天才,悟性过人。', bonus: { comprehension: 6, arrayDiscount: 0.15 }, bonusText: '悟性 +6,阵法升级花费 -15%' },
  { id: 'm3', skill: '丹火焚天', gender: 'male', name: '丹霞药师', school: '丹修', color: '#ffc46b',
    desc: '袖藏丹炉,火候精纯。丹道一途,无出其右。', bonus: { alchemyRate: 0.12, comprehension: 2 }, bonusText: '炼丹成功率 +12%,悟性 +2' },
  { id: 'm4', skill: '裂地狂刀', gender: 'male', name: '烈刀狂客', school: '体修', color: '#ff7a6b',
    desc: '一刀破万法。以肉身证道,气血如龙。', bonus: { hpPct: 0.15, defPct: 0.08 }, bonusText: '气血 +15%,防御 +8%' },
  { id: 'm5', skill: '幽冥魔音', gender: 'male', name: '幽冥魔君', school: '魔修', color: '#c58cff',
    desc: '一曲魔音乱人心神。亦正亦邪,杀伐果断。', bonus: { critDmg: 0.25, mpPct: 0.10 }, bonusText: '暴击伤害 +25%,灵力 +10%' },
  { id: 'f1', skill: '霜华剑舞', gender: 'female', name: '霜月仙子', school: '剑修', color: '#a8dcff',
    desc: '霜华满袖,剑若惊鸿。冰魄剑心,身法飘逸。', bonus: { spdPct: 0.12, crit: 0.02 }, bonusText: '身法 +12%,暴击率 +2%' },
  { id: 'f2', skill: '狐火燎原', gender: 'female', name: '灵狐少女', school: '妖修', color: '#ffa8c8',
    desc: '青丘灵狐相伴左右,福缘深厚,机灵百变。', bonus: { luck: 8, dodge: 0.03 }, bonusText: '气运 +8,闪避率 +3%' },
  { id: 'f3', skill: '天籁琴音', gender: 'female', name: '素琴仙娥', school: '音修', color: '#c9b4ff',
    desc: '七弦一动,天地同悲。以音入道,神识绵长。', bonus: { mpPct: 0.15, sensePct: 0.15 }, bonusText: '灵力 +15%,神识 +15%' },
  { id: 'f4', skill: '赤焰双斩', gender: 'female', name: '赤焰剑姬', school: '双剑', color: '#ff6b7a',
    desc: '双剑赤焰,快意恩仇。剑走偏锋,招招致命。', bonus: { crit: 0.05, atkPct: 0.05 }, bonusText: '暴击率 +5%,攻击 +5%' },
  { id: 'f5', skill: '青莲缚灵', gender: 'female', name: '碧落医仙', school: '医修', color: '#8fe3a0',
    desc: '药王谷传人,青莲在手,妙手回春。', bonus: { hpPct: 0.08, fieldYield: 1, alchemyRate: 0.05 }, bonusText: '气血 +8%,灵田收获 +1,炼丹成功率 +5%' }
];

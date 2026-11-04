/* 人物属性定义与说明(人物页点击 ? 查看) */
XX.data.attributes = [
  { key: 'hp', name: '气血', group: '战斗', fmt: 'int', desc: '肉身生命之本。战斗中气血归零即落败。随境界提升、法衣与丹药增长。' },
  { key: 'mp', name: '灵力', group: '战斗', fmt: 'int', desc: '体内储存的真元。战斗中灵力充足时会施展功法,造成 160% 伤害并消耗灵力。' },
  { key: 'atk', name: '攻击', group: '战斗', fmt: 'int', desc: '神通与法器的杀伤力。伤害 = 攻击² ÷ (攻击 + 敌方防御),浮动 ±10%。' },
  { key: 'def', name: '防御', group: '战斗', fmt: 'int', desc: '护体罡气与法衣的坚韧程度。防御越高,受到的伤害越低。' },
  { key: 'spd', name: '身法', group: '战斗', fmt: 'int', desc: '遁速与反应。身法高者先手出招,并略微提高闪避。' },
  { key: 'sense', name: '神识', group: '战斗', fmt: 'int', desc: '神魂之力。每 10 点神识提高 0.5% 暴击率,并可降低被敌人暴击的概率。' },
  { key: 'crit', name: '暴击率', group: '战斗', fmt: 'pct', desc: '攻击时造成暴击的概率,上限 75%。' },
  { key: 'critDmg', name: '暴击伤害', group: '战斗', fmt: 'pct', desc: '暴击时造成的伤害倍率,基础 150%。' },
  { key: 'dodge', name: '闪避率', group: '战斗', fmt: 'pct', desc: '完全躲开敌人攻击的概率,上限 40%。' },
  { key: 'comprehension', name: '悟性', group: '修行', fmt: 'int', desc: '参悟大道的天赋。每点悟性提高 0.5% 炼丹、炼器成功率,并提高炼器出极品的概率。' },
  { key: 'luck', name: '气运', group: '修行', fmt: 'int', desc: '冥冥中的福缘。每点气运提高 1% 突破成功率(大小境界皆可),并提高 1% 历练与秘境掉落概率。' },
  { key: 'rate', name: '修炼速度', group: '修行', fmt: 'rate', desc: '打坐时每 3 秒自动吸纳的修为 = 灵根基础速度 × (1 + 境界加成 + 聚灵阵 + 功法加成)。修为满后需手动突破,否则不再增长。' },
  { key: 'lifespan', name: '寿元', group: '修行', fmt: 'int', desc: '当前境界可享的寿数(年)。境界越高,寿元越长。' }
];

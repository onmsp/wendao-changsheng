# 问道长生 · 修仙放置游戏 v0.1.1

直接双击 `index.html` 即可在浏览器中游玩(纯前端,无需服务器、无需联网)。存档保存在浏览器本地(localStorage),每 5 秒自动保存。

## 目录结构

```
index.html              入口(按顺序加载下列脚本)
css/
  base.css              变量、按钮、面板、弹窗、进度条、物品图标
  screens.css           开始页 / 创建角色 / 主界面框架
  pages.css             人物 / 背包 / 洞府 / 外出 / 商城
js/
  data/                 ★ 数据层:改数值、加内容只动这里
    config.js           全局配置(初始灵石/仙玉均为 0、背包 50 格、堆叠 99、法宝 4 件、商城 12 小时刷新、离线上限…)
    roots.js            灵根(五色 10 / 四色 13 / 三色 17 / 两色 23 / 单色 30,每 3 秒)
    realms.js           境界(炼气→渡劫)与数值曲线
    attributes.js       人物属性与说明文字
    characters.js       10 个角色模板(男女各 5)
    names.js            随机道号词库
    items.js            全部物品(材料/丹药/装备/特殊)
    recipes.js          丹方、器方
    cave.js             阵法、灵田、灵矿
    monsters.js         妖兽图鉴
    adventure.js        历练地图、秘境
    shop.js             仙玉商城货架池
  core/                 工具函数、存档、通用 UI(弹窗/提示)
  systems/              玩法逻辑(人物、背包、洞府、战斗、商城)
  screens/              开始页、创建角色、主界面
  pages/                主界面下的 5 个功能页 + battle-view.js(战斗动作演出与特效)
assets/
  char/   {id}_stand 看板 / _med 打坐 / _wind 蓄势 / _cast 掐诀 / _atk 出招 / _avatar 头像
  vfx/    slash 剑气 / circle 法阵 / burst 爆裂 / claw 爪痕(青色基调,程序按角色主色变色)
  bg/     背景      icon/  功能图标      item/  物品图标
  monster/ 妖兽     ui/    按钮、边框、标题装饰
```

## 常见扩展

**新增物品**:在 `js/data/items.js` 的 `XX.data.items` 里加一条:

```js
pill_xxx: { name: '新丹药', type: 'pill', icon: 'item/pill_red', hue: 90, q: 2, price: 50,
            desc: '说明文字', use: { kind: 'exp', pct: 0.2, min: 100 } },
```

- `type`:material / pill 可堆叠(99 一格);equip(法宝)/ special 一件占一格。法宝不分部位,任意 4 件可同时佩戴
- `icon` + `hue`:复用已有图标并旋转色相,即可得到不同颜色的新物品;`badge` 可加角标
- `use.kind`:exp(加修为)、perm(永久属性)、buff、bag(扩容)、stone(灵石)、root(洗灵根)、break(突破丹)

**新增丹方/器方**:`js/data/recipes.js` 追加一条即可在洞府中出现。
**新增历练地图或秘境**:`js/data/adventure.js` 追加,掉落表填物品 id。
**商城上架**:`js/data/shop.js` 的 `pool` 中追加,`w` 为抽中权重。
**新增角色**:`js/data/characters.js` 追加,并在 `assets/char/` 放入同名 6 张图(stand/med/wind/cast/atk/avatar)。

## 0.1.1 更新
- 初始灵石、仙玉为 0
- 创建角色只展示看板立绘;人物页只展示打坐形象,4 件法宝显示在四角
- 修炼去掉进度条,每 3 秒直接增加修为并播放灵气汇聚特效
- 所有突破改为手动,成功率受气运影响(每点 +1%)
- 战斗改为连贯动作演出:蓄势→冲刺出招→剑气命中;功法为掐诀→法阵→灵气汇聚→轰击;支持 ×2 倍速
- 功能栏移到屏幕底部;人物属性折叠显示;全面适配手机屏幕(含刘海屏安全区)

## 素材规格

| 类型 | 尺寸 | 格式 |
|---|---|---|
| 看板立绘 | ≤640×960 透明底 | webp |
| 打坐/战斗 | ≤720×720 透明底 | webp |
| 头像 | 256×256 | webp |
| 竖版背景 | 720×1280 | webp |
| 横版战斗背景 | 1280×720 | webp |
| 图标 | 128~160 方形透明底 | webp |

# Mix解决方案

## 稳定版本(v0.4.5)

- [js开发版下载](http://mixteam.github.io/mixsln/dist/mixsln.debug.js)
- [js压缩版下载](http://mixteam.github.io/mixsln/dist/mixsln.js)
- [css下载（ios6默认主题样式）](http://mixteam.github.io/mixsln/dist/mixsln.css)
- [css下载（无主题样式）](http://mixteam.github.io/mixsln/dist/mixsln-notheme.css)

## 文档

* [用Mix快速开发WebApp](https://github.com/mixteam/mixsln/blob/master/doc/tutorial.md)
* [开发者向导](https://github.com/mixteam/mixsln/blob/master/doc/guide.md)
* [插件的使用和开发](https://github.com/mixteam/mixsln/blob/master/doc/plugin.md)
* [API手册](https://github.com/mixteam/mixsln/blob/master/doc/api.md)

## 解决了哪些问题？

1. 全局导航
2. 生命周期
3. 转场效果
4. 触摸手势
5. 页面滚动

## 有哪些主要的特性？

1. 只需用业务代码，即可轻松搭建WebApp。
2. 灵活的插件机制，易于二次开发，扩展业务功能。
3. 对第三方框架友好，不强奸开发者喜好。
4. 为各平台提供统一方案，保证兼容性。

## 版本更新

### v0.4.5

- 修复scroll的bug  
- 更新pullbounce插件

### v0.4.4

- 增加app.navigation.replace接口
- 修复创建导航栏按钮的bug
- 修复scroll的一个api命名的bug
- 修正触发forward/backward的时机

### v0.4.3

- 增加view继承的功能，增加侧边栏滑出的插件（合并自feature_v0.4_003分支）
- 更新转场效果（合并自feature_v0.4_002分支）
- 修改loading插件
- 增加没有主题样式的CSS文件(mixsln-notheme.css)
- 头部导航栏样式调整
- bug修复

### v0.4.2

- 增加主题样式，提供ios6默认主题，ios6亮色主题，以及简单主题
- 修改pullbonce插件
- 修复bug

### v0.4.1

- 优化页面生命周期
- 优化转场动画
- 更新文档至0.4.x

### v0.4.0（未发布）

- 重构系统模块
- 优化gesture的算法
- 优化scroll的算法

### v0.3.6

- 修复切换导航时的bug

### v0.3.5

- 新增stateStorage，可以在浏览器刷新后，仍旧保持导航状态。
- 更新文档和演示
- 更改page的ready和unload时机
- 修复lazyload和scrollpos两个插件的bug
- 修复切换导航时的bug
- 修复样式的bug

### v0.3.3

- 重构view的代码
- 修复插件的bug
- 修复demo的bug

### v0.3.2

- 更改模板的加载时机
- 重构AbstractPage的代码，变为view
- 修复插件的bug
- 更新demo

### v0.3.1

- 新增multitpl和domfind的插件
- 重构page的代码
- 更新转场动画
- 更新模板渲染的引擎
- 修复其它bug

### v0.3.0

- 重构目录结构
- 更新导航的API
- 更新scroll的bounce算法
- 更新文档

### v0.2.0

- 重构组件
- 导航模块化
- 完善demo

### v0.1.2

- 更新样式
- 更新组件
- 更新模块结构

### v0.1.0

- 新增demo
- gesture和scroll模块化

## 计划

### v0.4.x

- 动态加载机制
- 主题换肤功能
- 提供Grunt工具
- 修复bug

### v0.5.0

- 优化gesture和scroll算法
- 加入shake算法
- pad的适配

### 未定

- windows phone的适配


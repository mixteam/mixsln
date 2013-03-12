# 用MIX快速开发WebApp

## 获取代码（v0.3.x）

**框架代码**

* [v0.3.0 调试版](https://raw.github.com/mixteam/mixsln/v0.3.0/mixsln-debug.js)
* [v0.3.0 压缩版](https://raw.github.com/mixteam/mixsln/v0.3.0/mixsln.js)
* [CSS样式表](https://raw.github.com/mixteam/mixsln/v0.3.0/mixsln.css)

**以下js库可选**

* [mustache模版引擎](https://raw.github.com/mixteam/mixsln/v0.3.0/lib/mustache.js)
* [zepto v1.0rc](https://raw.github.com/mixteam/mixsln/v0.3.0/lib/zepto.js)


## 启动应用（App）

首先新建一个HTML项目页面，并引入框架代码：

	<link type="text/css" rel="styleSheet" href="mixsln.css"/>
	<script src="zepto.js" type="text/javascript"></script>
	<script src="mustache.js" type="text/javascript"></script>
	<script src="mixsln.js" type="text/javascript"></script>

我们推荐使用`mustache`以及`zepto`，当然你可以根据喜好使用不同的模版引擎和基础库。

复制以下这段HTML代码到到body中：

	<div class="viewport">
		<header class="titlebar">
			<ul>
				<li>Title</li>
				<li><button class="back">Back Btn</button></li>
				<li><button class="func">Func Btn</button></li>
			</ul>
		</header>
		<section class="content">
			<div>
				<div class="active"></div>
				<div class="inactive"></div>
			</div>
		</section>
		<footer class="toolbar"></footer>
	</div>

最后启动App：

	<script type="text/javascript">
		app.config.viewport = document.querySelector('.viewport');
		app.config.enableTitlebar = true;
		app.config.enableScroll = true;
		app.config.enableTransition = true;
		app.start();
	</script>

完整的HTML代码：

	<!DOCTYPE HTML>
	<html>
	<head>
	<meta charset="utf-8" />
	<title>A demo of HTML5 app</title>
	<link type="text/css" rel="styleSheet" href="mixsln.css"/>
	</head>
	<body>
	<div class="viewport">
		<header class="titlebar">
			<ul>
				<li>Title</li>
				<li><button class="back">Back Btn</button></li>
				<li><button class="func">Func Btn</button></li>
			</ul>
		</header>
		<section class="content">
			<div>
				<div class="active"></div>
				<div class="inactive"></div>
			</div>
		</section>
		<footer class="toolbar"></footer>
	</div>
	
	<script src="zepto.js" type="text/javascript"></script>
	<script src="mustache.js" type="text/javascript"></script>
	<script src="mixsln.js" type="text/javascript"></script>
	<script type="text/javascript">
		app.config.viewport = document.querySelector('.viewport');
		app.config.enableTitlebar = true;
		app.config.enableScroll = true;
		app.config.enableTransition = true;
		app.start();
	</script>
	</body>
	</html>


## 创建页面（Page）

在MIX中，页面指的是一个特定的功能，比如列表页面、详情页面等，即由唯一的路由指向唯一的页面。
页面包括了处理逻辑的JS，组织结构的模版，以及展示样式的CSS。它们的相互关系可以被灵活的指定。
例如有如下目录结构:

	- [demoapp]
		- [assets]
			- list.css
		- [templates]
			- list.tpl
		- [pages]
			- list.js
		- mixsln.js
		- mixsln.css
		- zepto.js
		- mustache.js
		- index.html
	

`list.tpl`内容如下：

	<ul>
		{{#items}}
		<li>{{name}}</li>
		{{/items}}
	</ul>

`list.js`用来定义一个页面的处理逻辑：

	(function(app){
		var listPage = app.page.define({
			name : 'list',				// 指定唯一名称
			title : '搜索列表',			// 在标题栏上显示的标题
			route : 'list\\/(P<word>[^\\/]+)\\/(P<page>\d+)\\/?',	// 指定唯一路由（Perl风格）
			template : './templates/list.tpl',	// 需要加载的模版
			buttons : [				// 设置标题栏上的按钮
				{					// 左侧返回按钮的文本，操作不可变更
					type : 'back',			
					text : '返回'
				},
				{					// 右侧功能按钮的文本和操作
					type : 'func',		
					text : '下一页',
					handler : function(e) {
						// 点击按钮的句柄
						app.navigation.push('list/' + encodeURIComponent(listPage._word) + '/' + listPage._page)
					}
				}
			],

			_data : null,
			_word : null,
			_page : 1,
			
			ready : function() {
				// 在页面已经准备好时，可以进行后续操作
				// 获取路由中的参数
				var navigation = app.navigation;
				this._word = navigation.getParameter('word');
				this._page = navigation.getParameter('page');
				// 准备数据，当然也可以通过ajax获取。
				this._data = {items:[
					{name:'hanquan'},
					{name:'zhuxun'},
					{name:'xuanji'},
					{name:'jiangcheng'}
				]};	
				
				// 调用fill方法，可以把数据渲染到模版上，最终生成可见的页面
				this.fill(data, function() {	
					// 渲染完模版后，可以继续进行绑定事件等操作
					// TODO
				});
			},

			unload : function() {
				// 在页面被卸载时，可以进行收尾工作
				// 比如解绑事件，缓存数据等等
			}
		})
	})(window['app']);

最后把list页面相关的文件引入到项目中

	<script src="zepto.js" type="text/javascript"></script>
	<script src="mustache.js" type="text/javascript"></script>
	<script src="mixsln.js" type="text/javascript"></script>
	<!--##list页面的代码-->
	<link type="text/css" rel="styleSheet" href="assets/list.css"/>
	<script src="pages/list.js" type="text/javascript"></script>
	<!--//list页面的代码-->
	<script type="text/javascript">
		app.config.viewport = document.querySelector('.viewport');
		app.config.enableTitlebar = true;
		app.config.enableScroll = true;
		app.config.enableTransition = true;
		app.start();
	</script>

## 路由规则

MIX中每个页面拥有唯一的路由，路由语法为Perl风格的正则表达式。
该路由规则最重要的是获取参数的语法，采用`(P<name>regexp)`的语法来声明参数。例如上述list页面的路由规则为`list\\/(P<word>[^\\/]+)\\/(P<page>\d+)\\/?`，它可以匹配诸如`list/iphone/1`，`list/衣服/2`等路径（hash）。

## 页面的生命周期

MIX中每个页面都拥有自己的生命周期，分别是`define`，`ready`和`unload`。当用`app.page.define`方法定义一个页面时，处于`define`阶段，该阶段页面会被初始化并配置到路由规则集中。当路由规则匹配到该页面时，页面处于`ready`阶段，此时可以针对该页面进行操作。当路由匹配到下一个页面时，当前页面处于`unload`阶段，同理，下一个页面处于`ready`阶段。`ready`和`unload`阶段是个环，一个页面总是先从`define`进入到`ready`，此后到`unload`，再回到`ready`，以此类推。

## 重要的对象

### app.page

用于定义页面、获取页面。

### app.component

用于获取组件，以及当前的活动区域。

### app.navigation

用于获取路由的参数，以及执行前进后退操作。
	

	

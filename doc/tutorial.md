# 十分钟快速开发WebApp

## 获取代码（v0.3.x）

**解决方案代码**

* [v0.3.3 调试版](https://raw.github.com/mixteam/mixsln/v0.3.3/mixsln-debug.js)
* [v0.3.3 压缩版](https://raw.github.com/mixteam/mixsln/v0.3.3/mixsln.js)
* [CSS样式表](https://raw.github.com/mixteam/mixsln/v0.3.3/mixsln.css)

**以下js框架可选**

* [mustache模版引擎](https://raw.github.com/mixteam/mixsln/v0.3.3/lib/mustache.js)
* [zepto v1.0rc](https://raw.github.com/mixteam/mixsln/v0.3.3/lib/zepto.js)


## 启动应用（App）

首先新建一个HTML项目页面，并引入框架代码：

	<link type="text/css" rel="styleSheet" href="mixsln.css"/>
	<script src="zepto.js" type="text/javascript"></script>
	<script src="mustache.js" type="text/javascript"></script>
	<script src="mixsln.js" type="text/javascript"></script>

我们推荐使用`mustache`以及`zepto`，当然你可以根据喜好使用不同的模版引擎和基础库。

复制以下这段HTML代码到到body中：

	<div class="viewport">
		<header class="navibar">
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

最后增加这段JS，来启动App：

	<script type="text/javascript">
		app.config.viewport = document.querySelector('.viewport');
		app.config.enableNavibar = true;
		app.config.enableScroll = true;
		app.config.enableTransition = true;
		app.config.templateEngine = {
			compile : function(text) {
				return Mustache.compile(text);
			},
		
			render : function(compiled, data) {
				return compiled(data);
			}
		}
		app.start();
	</script>

完整的代码：

	<!DOCTYPE HTML>
	<html>
	<head>
	<meta charset="utf-8" />
	<title>A demo of HTML5 app</title>
	<link type="text/css" rel="styleSheet" href="mixsln.css"/>
	</head>
	<body>
	<div class="viewport">
		<header class="navibar">
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
		app.config.templateEngine = {
			compile : function(text) {
				return Mustache.compile(text);
			},
		
			render : function(compiled, data) {
				return compiled(data);
			}
		}
		app.start();
	</script>
	</body>
	</html>


## 创建页面（Page）

在MIX中，页面会完成一系列的功能或交互，并且由唯一的路由指向唯一的页面，它是一个特殊的视图（View）。

例如有如下目录结构:

	- [demoapp]
		- [assets]
			- hello.css
		- [templates]
			- hello.tpl
		- [pages]
			- hello.js
		- mixsln.js
		- mixsln.css
		- zepto.js
		- mustache.js
		- index.html
	

`hello.tpl`是页面的`html模板`，内容如下：

	<h1>hello, <em>{{name}}</em></h1>

`hello.js`中定义了一个名为`helloworld`的页面：

	(function(app){
		app.page.define({
			name : 'helloworld',	// 指定唯一名称
			title : '你好',			// 在标题栏上显示的标题
			route : 'hello\\/(P<name>[^\\/]+)\\/?',	// 指定唯一路由（Perl风格）
			template : './templates/hello.tpl',	// 需要加载的模版
			buttons : [				// 设置标题栏上的按钮
				{					// 左侧返回按钮的文本
					type : 'back',			
					text : '返回'
				},
				{					// 右侧功能按钮的文本和操作
					type : 'func',		
					text : '问候',
					handler : function(e) {
						// 点击按钮的句柄
						if (var name = prompt('输入要问候人的名字')) {
							app.navigation.push('hello/' + encodeURIComponent(name))
						}
					}
				}
			],
			
			ready : function() {
				// 在页面已经准备好时，可以进行后续操作
				// 获取路由中的参数
				var name = app.navigation.getParameter('name'),
					data = {name:name}
					;
				
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

最后把hello页面相关的文件引入到项目中

	<script src="zepto.js" type="text/javascript"></script>
	<script src="mustache.js" type="text/javascript"></script>
	<script src="mixsln.js" type="text/javascript"></script>
	<!--##hello页面的代码-->
	<link type="text/css" rel="styleSheet" href="assets/hello.css"/>
	<script src="pages/hello.js" type="text/javascript"></script>
	<!--//hello页面的代码-->
	<script type="text/javascript">
		app.config.viewport = document.querySelector('.viewport');
		app.config.enableNavibar  = true;
		app.config.enableScroll = true;
		app.config.enableTransition = true;
		app.config.templateEngine = {
			compile : function(text) {
				return Mustache.compile(text);
			},
		
			render : function(compiled, data) {
				return compiled(data);
			}
		}
		app.start();
	</script>

## 重要的对象

### app.view

用于定义视图、获取视图

### app.page

用于定义页面、获取页面。

### app.component

用于获取组件，以及当前的活动区域。

### app.navigation

用于获取路由的参数，以及执行前进后退操作。

### app.plugin

包含自定义的插件
	

	

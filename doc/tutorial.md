# 十分钟快速开发WebApp

## 获取代码（v0.4.x）

- [js开发版下载](https://raw.github.com/mixteam/mixsln/master/dist/mixsln-debug.js)
- [js压缩版下载](https://raw.github.com/mixteam/mixsln/master/dist/mixsln.js)
- [css下载](https://raw.github.com/mixteam/mixsln/master/dist/mixsln.css)

## Hello World

首先新建一个HTML项目页面，并引入框架代码：

	<script src="mixsln.js"></script>

编写页面代码，输出"Hello World"：

	app.definePage({
		name: 'helloworld',
		title: '你好',
		startup: function() {
			this.html('<h1>Hello World!</h1>');
		}
	});
	app.start();

## 使用模板

用模板来输出`Hello World!`。

我们选择[Mustache](https://github.com/janl/mustache.js)模板引擎以及[Zepto](https://github.com/madrobby/zepto)，并引入进来

	<script src="mustache.js"></script>
	<script src="zepto.js"></script>

新建一个`helloworld.tpl`的模板文件，内容如下：

	<h1>Hello World!</h1>
	<div><input type="text" id="name"><button>say</button></div>

在`app.definePage`之前增加一段模板引擎的配置

	app.config.templateEngine = {
		load: function(url, callback) {
			$.get(url, callback);
		},
		compile : function(text) {
			return Mustache.compile(text);
		},
		render : function(compiled, data) {
			return compiled(data);
		}
	}

修改下`Hello World`的页面。在页面中提供一个输入框，输入名字点击按钮后，会改变Hash值。

	app.definePage({
		name: 'helloworld',
		title: '你好',
		template: './helloworld.tpl', // 需要加载的模版，路径相对于HTML文件
		startup: function() {
			var that = this,
				html = this.template({}) //经编译后，template字段会变成一个可渲染的函数
				;

			this.html(html);

			// 通过this.el来获取页面中的元素
			this.el.querySelector('button').addEventListener('click', function(e) {
				var name = that.el.querySelector('#name').value;
				if (name) {
					app.navigation.push('hello/' + name);	// 改变Hash值
				}
			});
		}
	});

比如在文本框中输入`zhuxun`，点击按钮后，网页的Hash会变为`hello/zhuxun`。

## 使用路由

通过`Hello World`中的输入框，我们可以改变Hash值，例如`hello/zhuxun`。此时我希望获取其中的`zhuxun`，并把它动态输出到页面中。这样就需要用到路由的功能。
	
新建一个`hellobuddy.tpl`的模板文件，内容如下：

	<h1>Hello, <em>{{name}}</em></h1>

重点是编写`Hello Buddy`的页面代码。

	app.definePage({
		name : 'hellobuddy',
		title : '你好啊',
		template : './hellobuddy.tpl',
		route : 'hello\\/(P<name>[^\\/]+)\\/?',	// 设置路由（Perl风格），name为参数名
		
		startup : function() {
			var name = app.navigation.getParameter('name'),// 获取路由中的`name`参数值
				html = this.template({name:name})
				;
			
			this.html(html);
		}
	})

刷新后，页面上会输出`Hello, zhuxun`。

## 使用默认主题（iOS）

此默认主题中，包含了顶部导航栏，底部工具栏，页面滚动以及转场等。

引入框架CSS：

	<link type="text/css" rel="styleSheet" href="mixsln.css"/>

在body中插入一段HTML：

	<div class="viewport">
		<header class="navbar">
			<ul>
				<li></li>
				<li><button class="back"></button></li>
				<li><button class="func"></button></li>
			</ul>
		</header>
		<section class="content"></section>
		<footer class="toolbar"></footer>
	</div>

往`app.start`传入配置：

	app.start({
		enableNavbar: true,
		enableToolbar: true,
		enableScroll: true,
		enableTransition: true
	});


## 上文涉及的方法索引

### app.definePage()

用于定义页面

### app.navigation.push()

前进操作（会改变Hash）

### page.html()

填充页面

### page.template()

渲染模板

### page.el

页面的根结点
	

	

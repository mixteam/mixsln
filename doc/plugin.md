# 插件的使用和开发

我们把核心内容做的足够简单，把灵活性留给插件。使开发者能通过插件完成更加复杂的功能。

## 开发自定义插件

### 引用插件

系统默认产出了不少插件，包括`DOM事件绑定（domevent）`，`图片懒加载（lazyload）`，`多模板（multitpl）`等，这些插件必须在`view`和`page`定义之前别引入，且需先引入插件的基础库`plugins/init.js`。

### 定义插件

所有插件的定义，必须在视图和页面的定义之前完成。以`domevent`插件为例（下同）：

首先需要在**app.plugin**的命名空间下注册一个插件：

	app.plugin.domevent = {
		// 插件方法
	}

如果插件没有任何方法，也可以简单写成`app.plugin.domevent = true`。

### 使用插件

插件只能在页面中开启，当某个页面启用这个插件时，只需要设置`plugins`字段，例如：


	app.page.define({
		name: 'list',
		//...
		plugins: {
			domevent: true
		}
		//...
	})

如果插件需要一些配置，可以设置为：

	plugins : {
		lazyload : {
			dataAttr : 'dataimg'
		}
	}

也可以在页面的全局配置中来启用插件，例如：

	app.page.global.plugins = {
		multiTemplate: true,
		domfind: true
	}

### 时机

插件有个生效和失效的时机，分别是页面ready时和页面unload时，于此对应的委托方法是`on`和`off`。

	app.plugin.domevent = {
		_options : null,

		on : function(page, options) {
			// 在页面ready方法之前执行
		},

		off : function(page,  options) {
			// 在页面unload方法之前执行
		}
	}

这两个委托方法会传递两个参数，第一个参数为当前的page对象，第二个参数是配置项。它有两个作用域，分别是`options.page`和`options.state`。前者是在page中定义的，例如上面对`lazyload`插件的配置，可以通过`options.page.dataAttr`来获取。后者是在当前状态下的配置，无法预先定义，但可以读写。

### 可扩展的方法

有时，只是定义插件的方法还不够，需要给视图或页面扩展方法。例如，在`domevent`中，需要给页面扩展一个`delegate`对象和一个`undelegate`对象，以便页面中能按需绑定和解绑DOM事件。

### 完整的示例

	(function(win, app){
		var doc = win.document,
			$ = win.Zepto || win.$
			;
	
		app.page.fn.delegate = function(event, selector, calllback) {
			// 扩展了一个绑定事件的方法
			var options = app.plugin.domevent._options, 
				cache = options.page.cache,
				content = $(app.component.getActiveContent())
				;
	
			if (arguments.length === 3) {
				cache.push([event, selector, calllback]);
			} else if (arguments.length === 3) {
				Object.each(arguments[0], function(callback, event) {
					cache.push([event, selector, callback]);
				});
			}
	
			content.on.apply(content, arguments);
		}
	
		app.page.fn.undelegate = function(event, selector, calllback) {
			// 扩展了一个解绑事件的方法
			var content = $(app.component.getActiveContent())
	
			content.off.apply(content, arguments);
		}
	
		app.plugin.domevent = {
			_options : null,
	
			on : function(page, options) {
				var that = this
					;
	
				that._options = options;	// 保存这个配置项
				options.page.cache = [];	// 在页面配置项中定义一个事件的缓存队列
	
				Object.each(page.events, function(ev) {	// 遍历页面中的events字段，来预先绑定一些事件
					var handler = ev[2];
	
					if (Object.isTypeof(handler, 'string')) {
						handler = page[handler];
					}
	
					page.delegate(ev[0], ev[1], function(e) {
						handler.call(this, e, page);
					});
				});
			},
	
			off : function(page,  options) {
				var options = this._options
					;
	
				Object.each(options.page.cache, function(dv) {	// 遍历事件的缓存队列，解绑所有事件
					page.undelegate(dv[0], dv[1], dv[2]);
				});
	
				delete options.page.cache;
			}
		}
	})(window, window['app'])

### 技巧和原则

编写插件的前提，是能深入理解Mix解决方案的设计思想和内部功能。有些内部功能并不推荐应用开发者来调用，但是作为插件开发者，则需要知悉并运用。

1. 理清楚options中的页面配置项和状态配置项的区别，就好比理清楚页面和状态的区别一样。
2. 页面的生命周期和插件的生命周期息息相关。
3. 适当对视图和页面进行扩展，有利于开发者使用插件的功能。
4. 阅读系统组件的代码，配合系统组件完成一些复杂的功能。

## 一些预置的插件

### domfind

给页面扩展一个`find`方法，能方便获取当前页面中的DOM节点。**需zepto支持**。

**插件配置**

	plugins : {
		domfind : true
	}

**页面方法**

	page.find(selector);

### domevent

让页面能够通过定义，绑定DOM事件，并在页面退出时，自动解绑这些事件。**需zepto支持**。

**插件配置**

	plugins : {
		domevent : true
	}

**页面字段**

	events : [
		[event, selector, callback],
		//...
	]

`callback`可以是一个函数，也可以是页面对象中某方法名。

**页面方法**

	delegate(event, selector, callback);
	undelegate(event, selector, callback);


### inlineTemplate

让视图和页面支持内敛的模板文本，无需通过url加载模板文件。

**插件配置**

	plugins : {
		inlineTemplate : true
	}

**视图/页面字段**

	template : '<div>{{name}}</div>';

### lazyload

让页面中的图片支持延迟加载。

**插件配置**

	plugins : {
		lazyload : {
			dataAttr : 'data-src'	// img元素上保存图片地址的属性名，默认为data-src
		}
	}

**插件方法**

	check();	// 检查当前可视区域内图片的加载，需在内容渲染完成后，调用该方法

### multiTemplate

让页面支持多模板

**插件配置**

	plugins : {
		multiTemplate : true
	}

**视图/页面字段**

	templates : {
		main: './templates/layout.tpl',
		list: './templates/list.tpl',
	}

	或

	templates : './templates/all.tpl'

当加载一个模板文件时，可以用如下方法来设置多个模板片段

	<script id="layout" type="text/template">
		<div id="list"></div>
	</script>

	<script id="layout" type="text/template">
		<ul><!-- 内容 --></ul>
	</script>

**视图/页面方法**

	renderMultiTemplate(dataSet, callback);
	renderSingleTemplate(name, datas, callback);

在多模板的模式下，调用页面的`fill`、`renderTemplate`或者`renderMultiTemplate`，需要传递一个数据集合对象。该对象的每个字段指定的是相应模板的数据，并且最终渲染出以`main`模板为结构的HTML代码。例如：

	this.fill({
		main : {
			name : 'terry'
		},
		list : {
			records: [1,2,3,4]
		}
	})

`list`模板的渲染结果会自动添加到`main`模板中`id`为`list`的DOM元素中。

而`renderSingleTemplate`则是渲染单个模板。例如：

	this.renderSingleTemplate('list', {records: [1,2,3,4]});

### scrollpos

让页面记忆滚动位置

**插件配置**

	plugins : {
		scrollpos : true
	}

### stateStorage

让网页刷新后，仍保持导航的状态

**插件配置**

引用即生效

**插件方法**

	save() // 保存当前的状态到会话中
	load() // 从会话中恢复当前的状态
	saveAll() // 保存所有状态
	loadAll() // 加载所有状态
# 开发者向导

## 索引

1. 解决方案

	* 什么是解决方案？
	* 为什么是解决方案？
	* 解决了哪些问题？
	* 有哪些主要的特性？

2. 结构

	* 导航
	* 状态
	* 视图
	* 页面

3. 配置

4. 导航

	* 导航栏
	* 导航操作

5. 状态

6. 视图

	* 定义视图
	* 重载父类方法
	* 获取视图
	* 扩展视图

7. 页面

	* 定义页面
	* 全局配置
	* 获取页面
	* 扩展页面
	* 默认页面
	* 生命周期
	* 页面和状态

8. 插件

## 解决方案

### 什么是解决方案？

解决方案`Solution`就是针对某些已经体现出的，或者可以预期的问题，不足，缺陷，需求等等，所提出的一个解决问题的方案（建议书、计划表），同时能够确保加以有效的执行（来自于[百度百科](http://baike.baidu.com/view/1038216.htm)）。

**Mix的解决方案，就是针对WebApp/OPOA的统一解决方案。**

### 为什么是解决方案？

和框架相比，解决方案会针对特定的场景或应用来给出相应的技术方案或者特性支持。目前业界的框架，都会专一于某个领域的问题，比如MVC框架（Backbone、AngularJS、EmberJS）、底层兼容性框架（jQuery、Zepto、jQ.Mobi）、模版引擎（JSTemplate，Mustache）、特性增强（iScroll）。在这些框架基础上，开发者如果要开发应用，仍需耗费一定精力，来巧妙的组合它们。而解决方案，帮组开发者完成了“组合”的工作来完成某种应用的开发。

Mix解决方案，是针对WebApp的统一解决方案。它能帮组开发者快速开发应用，把精力集中于业务逻辑，而少关心WebApp的各种特性。它不仅解决了组合各种框架的难题，而且，还让这种组合能随不同开发者的喜好，低耦合的来选取不同的元素。


### 解决了哪些问题？

1. 全局导航
2. 页面管理
3. 转场效果
4. 触摸手势
5. 页面滚动

### 有哪些主要的特性？

1. 只需用业务代码，即可轻松搭建WebApp。
2. 灵活的插件机制，易于二次开发，扩展业务功能。
3. 对第三方框架友好，不强奸开发者喜好。
4. 为各平台提供统一方案，保证兼容性。

## 结构

### 导航

Mix的导航，实际上包括两个概念，一个是`导航栏`，一个是`导航操作`。

**导航栏**

导航栏（NavigationBar）负责提供后退操作（左侧按钮）、标题显示、自定义操作（右侧按钮）。它在整个应用中是统一的，每个页面可以变更标题和按钮点击后的句柄。

**导航操作**

导航操作（Navigation）可分为前进和后退。前进可以是前进到一个指定状态（state），或者是下一个状态。后退是回到上一个状态。

### 状态

状态(state)对象包含了每次导航操作的所有相关属性。其中包括路由值、路由参数、GET数据、POST数据。另外，你也可以向状态对象中储存关键数据来保证在前进/后退时状态不丢失。

### 视图

视图（View）是数据/模板的最小单位。它可以被用于创建组件或片段，例如翻页组件、列表片段等。视图可以互相组合、嵌套来完成更加复杂的视图。视图之间，用API互调的方式通信。

### 页面

页面（Page），是一个特殊的视图。它占据整个视图区域，呈现内容并提供交互。每个页面还可以添加多个视图。同时，它还是导航操作的响应入口。每一次导航操作，会让当前页面退出视图区域，让下一个页面进入视图区域。

## 配置

**app.config**

这个命名空间提供基础的配置项，用于开启/关闭功能或设置代理方法。所有配置必须在启动应用前完成。配置项如下：

**viewport**

	app.config.viewport = document.querySelector('div.viewport');

配置视图区域。一个应用的视图区域是唯一的。

**enableNavibar**

	app.config.enableNavibar = true

开启/关闭导航栏。在一些特殊场景下，可能需要关闭导航栏（比如客户端内嵌App），只需要设置false。无法在应用运行期间执行开启/关闭操作。

**enableScroll**

	app.config.enableScroll = true

开启/关闭页面滚动。无法在应用运行期间执行开启/关闭操作。

**enableTransition**

	app.config.enableTransition = true

开启/关闭转场效果。无法在应用运行期间执行开启/关闭操作。


**templateEngine**

	app.config.templateEngine = {
		/**
		 * @param {string} text
		 * @return a compiled object
		 */
		compile : function(text) {
			// TODO compile;
			return Mustache.compile(text);
		},
		/**
		 * @param {object} compiled
		 * @param {object} data
		 * @return a renderd string
		 */
		render : function(compiled, data) {
			// TODO render
			return compiled(data);
		}
	}

配置模板引擎的代理方法`compile`和`render`。如果未设置`compile`代理，编译结果直接返回text。如果未设置`render`代理，渲染结果直接返回`compiled`。

##导航

### 导航栏

导航栏可分为3个部分，左侧的后退按钮，中间的标题，和右侧的自定义按钮。

后退按钮默认的动作是后退操作，同时可以设置是否在没法后退的情况下自动隐藏（默认为true）。自定义按钮，可以设置它的点击句柄。两个按钮，都有onShow和onHide的事件代理，在显示和隐藏时调用。

对导航栏的定义都在每个页面中完成，具体方法可以参加下面 **定义页面** 部分。

### 导航操作

导航操作，分为前进和后退。这两个操作会让当前页面退出视区，让下一个页面进入视区。

**app.navigation**

这个命名空间，包含了对导航以及状态的操作。

**push**

前进操作。当`push`方法参数为空时，为**进入下一个页面**，等同于`history.forward`；当`push`方法指定参数时，为**导航到指定页面**，等同于`location.href='#xxx'`。

**pop**

`pop`方法，无需参数，为**后退到上一个页面**，等同于`history.back`。

以上操作同浏览器的前进/后退的行为保持一致。

	app.navigation.push('hello/world', // 路由值
	{// 第二个参数可选
		args : {_t:Date.now()},		// 会以“!”分割附加在路由值后，用getArugment方法获取
		datas : {content:'a long text'}	// 会直接传递给下一个状态，用getData方法获取
	});

以上操作，会使得hash值变为`#hello/wolrd!_t=123456789`。

## 状态

一次导航操作，对应一个状态。

**app.navigation**

这个命名空间，包含了对导航以及状态的操作。跟状态相关的操作包括`getParameter`，`getArgument`,`getData`，`getPageName`，`getRouteName`，`getState`。其中`getState`方法可以获取整个状态对象。对于每一个产生过的状态，都会加入到状态栈中，当执行回退或前进操作时，栈中状态会被重新取出来做为当前状态。

## 视图

**app.view**

这个命名空间，包含了定义视图、获取视图、扩展视图等功能。视图被当作数据/模板的最小集合，所以它不拥有生命周期，对视图的操作都通过调用API来进行。

### 定义视图

**define(properties)**

视图的定义，实际上是定义一个View的子类。

	app.view.define({
		name: 'defaultView',
		template: './templates/default.tpl',

		initialize : function() {
			this.constructor.superclass.initialize.apply(this, arguments);
		},

		render: function(){
			return this.renderTemplate({});
		}
	});

上面是最简单的一段视图定义，它指定了视图名，模板以及一个方法。其中`name`是必选字段，`template`是可选字段。当一个视图不需要模板的时候，它就是若干方法的集合。`initialize`作为视图的初始化方法，必须调用父类的`initialize`方法。除了初始化方法以及父类的方法，其他方法可以随意定义，上述例子的`render`方法直接返回一个模板渲染后的字符串。

### 重载父类方法


**super.loadTemplate(url, callback)**

加载一个模板，并通过`callback`传递模板文本。	

**super.compileTemplate(text, callback)**

编译一个模板。在有`callback`时，通过其传递编译后的对象；如无，则直接返回。

**super.renderTemplate(datas, callback)**

渲染一个模板。在有`callback`时，通过其传递渲染后的文本；如无，则直接返回。


如果需要重载以上三个方法，必须使得方法参数、返回值以及行为保持与原方法一致。建议通过阅读源码来达到目的。

以下对`loadTemplate`的重载，是把视图的`template`字段当作内敛模板（文本）来使用。

	loadTemplate: function(text, callback) {
		var that = this
			;
	
		if (arguments.length === 1) {
			callback = arguments[0];
			text = that.template;
		}
	
		callback(text);
	}

### 获取视图

**get(name)**

根据视图的名字，可以直接返回该视图。

### 扩展视图

**fn**

这个对象用于扩展视图的方法。

	app.view.fn.render = function(){
		return this.renderTemplate({});
	}

当通过上述技巧定义了`render`方法后，所有视图都将拥有这个方法。

### 使用视图

由于视图没有自己的生命周期，所以必须将视图添加到页面或者其他视图中，才能使用它。例如：


	app.view.define({
		name: 'listView',
		views : {
			items : new app.view.get('itemsView'),
			search : new app.view.get('searchView')
		}
	});


	app.page.define({
		name: 'searchList',
		views : {
			list : new app.view.get('listView')
		}
	});


以上两段代码，分别在一个视图和一个页面中，添加了部分视图。当视图被添加到页面中后，页面的生命周期能帮助视图来完成模板预加载的功能。为此，在视图的方法中，无需调用`loadTemplate`和`comipleTemplate`方法，即可使用`renderTemplate`方法。


## 页面

**app.page**

这个命名空间，包含了定义页面、获取页面、扩展页面等功能。页面，是个特殊的视图。它是View的一个子类，拥有View的所有功能。同时，因为页面还担负起了设置导航栏、定义路由规则、建立生命周期、填充活动区域、启用插件等功能。一个页面，就是一个完整的功能集合，这也表明了，页面是无法相互嵌套的。

### 定义页面

**define(properties)**

	app.page.define({
		name: 'index',
		title: '首页',
		route: '|index',
		template: './templates/index.tpl',
		views: {
			searchForm: new app.view.get('searchFormView')
		},
		buttons: [
			{
				type : 'back',
				text : '返回'
			},
			{
				type : 'func',
				text : '菜单',
				handler : function(e) {
					// TODO
				}
			}
		],

		ready: function() {
			// implement super.ready
			var that = this,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
				content = app.component.getActiveContent(),
				e_searchForm, v_searchForm = that.views.searchForm;

			
			this.fill({}, function() {
				e_searchForm = content.querySelector('#J-searchForm')；
				e_searchForm.innerHTML = v_searchForm.render();
			});
		},

		unload: function() {
			// implement super.unload
		}
	});

以上是最简单的一段页面定义。在页面已经准备好的前提下，渲染了一个首页模板，并添加了搜索表单的视图。

1. 给页面取个名字

	设置`name`字段，且全局唯一。

2. 给页面呈现标题

	设置`title`字段，或覆盖`getTitle`方法。`getTitle`的存在方便通过参数值来拼接标题。

3. 配置路由
	
	设置`route`字段，采用Perl风格的参数语法。该路由规则最重要的是获取参数的语法，采用`(P<name>regexp)`的Perl语法来声明参数。例如有路由规则为`hello\\/(P<name>[^\\/]+)\\/?`，它可以匹配诸如`hello/terry`，`hello/world`，并可以通过`app.navigation.getParameter`方法来获取`name`参数的值。

4. 给定模板

	设置`template`字段，默认该字段的值是相对于当前URL的路径。可选。

5. 组合视图

	设置`views`字段，添加需要用到的视图到页面中（必须是实例对象）。可选。

6. 导航栏按钮

	设置`buttons`字段，它是一个数组，数组内的元素描述了回退按钮和功能按钮的行为。目前仅支持一个回退按钮和一个功能按钮，以下是可以配置的字段：
	
	* text 按钮文本
	* type 按钮类型（back或func）
	* onChange 按钮切换时的句柄
	* handler 按钮点击时的句柄
	* autoHide 按钮是否自动隐藏（只适用于回退按钮）

7. 页面进入

	覆盖`ready`方法，在页面进入活动区域且模板加载完毕后，会执行`ready`方法。

8. 页面退出

	覆盖`unload`方法，在页面退出活动区域，会执行`unload`方法。

9. 获得活动区域

	调用`app.component.getActiveContent`方法，需要获得页面渲染的活动区域是调用该方法，并不建议从document查找页面DOM。

10. 填充活动区域

	调用`fill`方法，当需要渲染模板并填充到活动区域时，可以调用该方法。该方法提供一个回调函数，表明内容已经填充完毕。

### 全局配置

定义页面的各个字段（非方法），支持通过`app.page.global`这个全局属性来配置。例如：

	app.page.global.views = {
		copyRight : new app.view.get('copyRightView')
	}

又或者

	app.page.global.buttons = [
		{type:'back', text: '返回'}
	]

`global`中的定义字段会和page对象中的该字段进行合并。在它是一个数组时，进行`concat`操作；在它是一个对象时，进行`extend`操作。且`page`对象中的配置优先级高于`global`中的配置。页面的全局配置可以和应用配置放在一起，作为一个基础的配置文件。

### 获取页面

**get(name)**

根据页面名称，获取页面对象。


### 扩展页面

**fn**

这个对象用于扩展页面的方法。

	app.page.fn.find = function(){
		var e = $(app.component.getActiveContent());

		return e.find.apply(e, arguments);
	}

当通过上述技巧定义了`find`方法后，所有页面都将拥有这个方法。

**注意**，因为Page是View的子类，所以在`app.view.fn`上扩展的方法，同样会继承至每个page对象。

### 默认页面

在一个应用中，可能需要显示友好的404页面。为此，可以用默认页面来完成404页面。在定义页面时，如果不提供`route`字段时，表示为默认页面，即任何不能匹配的路由都会进入到该默认页面中。**建议每个应用都设置一个默认页面，且默认页面只能有一个**。

### 生命周期

每个页面都拥有自己的生命周期，分别是`define`，`load`，`ready`和`unload`。当用`app.page.define`方法定义一个页面时，处于`define`阶段，该阶段页面会被初始化并配置到路由规则集中；当路由规则匹配到该页面时，页面会进入`load`阶段，此时会加载并编译页面中声明的模版；之后页面处于`ready`阶段，此时可以针对该页面进行操作。当路由匹配到下一个页面时，当前页面处于`unload`阶段，同理，下一个页面处于`ready`阶段。`load`，`ready`和`unload`是可以循环的。一个页面总是先从`define`进入到`load`，此后到`ready`，再由`unload`回到`load`，以此类推。

### 页面和状态

页面（page）和状态（state）是有区别的。页面指的是功能集合，而状态指的是每次进入页面时的数据集合。例如一个搜索结果页面，依照搜索的关键字不同，进入的是同一个页面对象，但获得的是不同的状态对象。

## 插件

**app.plugin**

这个命名空间用来存放所有自定义的插件。详细内容请移步[插件文档](plugin.md)


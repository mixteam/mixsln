# 开发者向导

## 索引

1. 解决方案

	* 什么是解决方案？
	* 为什么是解决方案？
	* 解决了哪些问题？
	* 有哪些主要的特性？

2. 应用结构

	* 导航
	* 状态
	* 视图
	* 页面

3. 配置应用

4. 使用导航

	* 导航栏
	* 导航操作

5. 获取状态

6. 定义视图

7. 定义页面

8. 编写插件

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

## 应用结构

### 导航

Mix的导航，实际上包括两个概念，一个是`导航栏`，一个是`导航操作`。

**导航栏**

导航栏（NavigationBar）负责提供后退操作（左侧按钮）、标题显示、自定义操作（右侧按钮）。它在整个应用中是统一的，每个页面可以变更标题和自定义按钮点击句柄。

**导航操作**

导航操作（Navigation）可分为前进和后退。前进可以是前进到一个指定状态（state），或者是下一个状态。后退是回到上一个状态。

### 状态

状态(state)对象包含了每次导航操作的所有相关属性。其中有，路由值、路由参数、GET数据、POST数据。另外，你也可以想状态对象中储存关键数据来保证在前进/后退时状态不丢失。

### 视图

视图（View）是数据/模板/事件/操作的最小单位。它可以被用于创建组件或片段，例如翻页组件、列表片段等。视图可以互相组合、嵌套来完成更加复杂的视图。视图之间，用API互调的方式通信，当然也可以另外建立消息通讯机制。

### 页面

页面，是一个特殊的视图。它占据整个视图区域，呈现内容并提供交互。每个页面自成一个视图，也可以由多个视图来组成。同时，它还是导航操作的响应入口。每一次导航操作，会让当前页面退出视图区域，让下一个页面进入视图区域。

## 配置应用

Mix提供简单的配置项，用于开启/关闭功能，或设置代理方法。所有配置必须在启动应用前完成。配置项如下：


### viewport

	app.config.viewport = document.querySelector('div.viewport');

配置视图区域。整个应用的视图区域是唯一的，且最好是最外层的dom节点。

### enableNavibar

	app.config.enableNavibar = true

开启/关闭导航栏。在一些特殊场景下，可能需要关闭导航栏（比如客户端内嵌App），只需要设置false。但，无法在应用运行期间执行开启/关闭操作。

### enableScroll

	app.config.enableScroll = true

开启/关闭页面滚动。无法在应用运行期间执行开启/关闭操作。

### enableTransition

	app.config.enableTransition = true

开启/关闭转场效果。无法在应用运行期间执行开启/关闭操作。


### templateEngine

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

##使用导航

### 导航栏

导航栏可分为3个部分，左侧的后退按钮，中间的标题，和右侧的自定义按钮。

后退按钮默认的动作是后退操作，同时可以设置是否在没法后退的情况下，自动隐藏（默认为true）。自定义按钮，可以设置它的点击句柄。两个按钮，都有onShow和onHide的事件代理，在显示和隐藏时调用。

对导航栏的定义都在每个页面中完成，具体方法可以参加下面 **定义页面** 部分。

### 导航操作

导航操作，分为前进和后退。这两个操作会让当前页面退出视区，让下一个页面进入视区。

**app.navigation**

这个命名空间，包含了对导航以及状态的操作。其中`push`方法是前进操作，`pop`方法是后退操作。当`push`方法参数为空时，为**进入下一个页面**，等同于`history.forward`；当`push`方法指定参数时，为**导航到指定页面**，等同于`location.href='#xxx'`。`pop`方法，无需参数，为**后退到上一个页面**，等同于`history.back`。

Mix的导航操作，和浏览器的前进/后退是保持一致的。

	app.navigation.push('hello/world', // 路由值，可以用getParameter方法获取其中的参数
	{// 这部分可选
		args : {_t:Date.now()},		// 会以“!”分割附加在路由值后，用getArugment方法获取
		datas : {content:'a long text'}	// 会直接传递给下一个状态，用getData方法获取
	});
	// 以上操作，会使得hash值变为#hello/wolrd!_t=123456789

## 获取状态

一次导航操作，对应一个状态。

**app.navigation**

这个命名空间，包含了对导航以及状态的操作。跟状态相关的操作包括`getParameter`，`getArgument`,`getData`，`getPageName`，`getRouteName`，`getState`。其中`getState`方法可以获取整个状态对象，在开发过程中，可以给这个对象添加更多属性，以便能在前进/后退时，保持关键的状态。具体可参考[API文档](api.md)

## 定义视图

**app.view**





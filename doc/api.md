# API手册（v0.4.x）

##app

### start(config)

* @param {object} [config]

启动App。config的字段同`app.config`

### setTemplate(id, tpl)

* @param {string} id
* @param {string|function} tpl

设置模板

### extendView(properties)

* @param {object} properties
* @return {Class} a child class of View

扩展视图

### getView(name)

* @param {string} name
* @return {View} an instance of View

获得名为name的视图实例

### definePage(properties)

* @param {object} properties
* @return {Page} an instance of Page

定义页面

### definePageMeta(properties)

* @param {object} properties

定义页面元数据

### getPage(name)

* @param {string} name
* @return {Page} an instance of Page

获得名为name的页面实例

### loadResource(urls, type, callback)

* @param {string|array} urls
* @param {string} type - `js/css`
* @param {function} callback

依次加载urls中的资源（JS/CSS）文件，完成后调用callback。

##app.config

### viewport

* @var {HTMLElement}

设置视觉区域节点，默认为class是`viewport`的HTMLElement或者`document.body`。

### enableMessageLog

* @var {boolean}
 
设置在控制台输出消息日志，默认为`false`

### enableContent

* @var {boolean|object}

设置页面内容区域节点，默认为class是`content`的HTMLElement或者和视觉区域节点相同。

当设置成object时，有以下字段：

	wrapEl: 视觉区域节点
	cacheLength: 缓存页面内容的长度，默认为5

### enableNavbar

* @var {boolean|object}

设置是否启用导航栏，默认为`false`。

当设置成object时，有以下字段：

	wrapEl: 导航栏节点，默认为class是`navbar`的HTMLElement。

### enableToolbar

* @var {boolean|object}

设置是否启用工具栏，默认为false。

当设置成object时，有以下字段：

	wrapEl: 工具栏节点，默认为class是`toolbar`的HTMLElement。


### enableScroll

* @var {boolean}

设置是否启用页内滚动，默认为false

### enableTransition

* @var {boolean}

设置是否启用转场效果，默认为false

### templateEngine

* @var {object}

定义模版引擎的load、compile和render代理方法：

**load(url, callback)**

* @param {string} url
* @param {function} callback

该代理方法，需要通过callback的回调传递模板文本

**compile(text)**

* @param {string} url
* @return {function} a compiled function

该代理方法，需要返回一个被编译过后的函数

**render(compiled, datas)**

* @param {function} a compiled function
* @param {object} a set of data
* @return {string} a rendered result

该代理方法，需要返回渲染后的结果

##app.navigation

### push(fragment, options)

* @param {string} fragment
* @param {object} [options]

（导航）前进操作。fragment指定Hash片段，`options`可指定以下参数：

	transition: 转场动画，backward/forward
	type: 传递参数的类型，GET/POST
	data: 参数键值对

### pop()

（导航）后退操作。

### resolveFragment(name, params)

* @param {string} name
* @param {object} params
* @return {string} a hash fragment

返回处理后的Hash片段。例如有个名为`index`的路由，其正则表达式为`index/(P<name>\w+)`，那么resolveFragment('index', {name:'test'})的返回值为`index/test`。

### getReferer()

* @return {string} a referer

获得上一个页面的地址。

### getParameter(name)

* @param {string} name
* @return {string} a value

获取路由中名为name的参数值以及通过GET/POST传递过来的名为name的参数值。

### getParemters()

* @return {object} a set of values

获取所有参数键值对。

### setData(name, value)

* @param {string} name
* @param {*} value

设置GET/POST的参数值。

### setTitle(title)

* @param {string} title

设置标题的内容。支持HTML片段。

### setButton(options)

* @param {object} options

设置导航栏的按钮，options的参数如下：

	id: 按钮的id
	class: 按钮的class
	text: 按钮的文本
	bg: 按钮的背景样式（style.background）
	icon: 按钮的图标（button中设置img标签）
	hide: 是否隐藏
	handler: 按钮点击的句柄

### setToolbar(options)

* @param {object} options

设置工具栏，options的参数如下：

	html: 插入到工具栏的HTML片段
	el: 插入到工具栏中的DOM节点
	height: 工具栏的高度

##app.scroll

### getScrollHeight()

* @return {Number} height

获取页面区域的滚动高度

### getScrollTop()

* @return {Number} height

获取页面区域的滚动位置

### refresh()

刷新页面区域

### offset(el)

* @param {HTMLElement} element
* @return {object} a rectangle object

返回页面区域内某元素的矩阵数据，包括`top/bottom/width/height/left/right`

### scrollTo(y)

* @param {Number} y value

滚动到页面中的某位置

### scrollToElement(el)

* @param {HTMLElement} element

滚动到页面中的某元素

### getBoundaryOffset()

* @return {object} a offset object

获取页面区域回弹时的偏移值

### getViewHeight()

* @return {Number} height

获得页面区域的可见区域高度

### stopBounce()

出现回弹时，停止回弹

### resumeBounce()

恢复回弹

### addEventListener(name, handler, isBubble)

* @param {string} a event name
* @param {function} a event handler
* @param {boolean} if bubble

绑定事件，事件包括：

	scrollstart: 滚动开始（只在enableScroll=true时有效）
	scrollend: 滚动结束
	pulldown: 上边界下拉（只在enableScroll=true时有效）
	pullup: 下边界上拉（只在enableScroll=true时有效）
	bouncestart: 边界回弹开始（只在enableScroll=true时有效）
	bounceend: 边界回弹结束（只在enableScroll=true时有效）

### removeEventListener(name, handler)

* @param {string} a event name
* @param {function} a event handler

解绑事件。

## app.module.Animation

提供调用Transition动画。

### doTransition(element, properties, options)

* @param {HTMLElement} a element
* @param {object} the element's properties
* @param {object} the transition's options

让一个HTML元素执行transition动画。`properties`是元素的样式集，支持`transform`的属性。`options`是`transition`的参数（duration，timingFunction，delay以及callback）。

	Animation.doTransition(body, {
		backgroundColor: 'red',
		translate:[100, 100]
	}, {
		duration: '0.4s',
		timingFunction: 'ease',
		callback: transitionEnd 
	})

### translate(element, duration, timingFunction, delay, x, y, callback)

* @param {HTMLElement} a element
* @param {string} the duration of movement
* @param {string} the timingFunction of movement
* @param {string} the delay of movement
* @param {number} the x of coordinate
* @param {number} the y of coordinate
* @param {function} a callback function

让一个HTML元素进行平移动画。

### genCubicBezier(a, b)

* @param {number} a 
* @param {number} b
* @return a array

生成贝塞尔函数。

### makeTranslateString(x, y)

* @param {number} the x of coordinate
* @param {number} the y of coordinate
* @return a string

返回`translate`的字符串。

### getTransformOffset(element)

* @param {HTMLElement}
* @return a x/y object

返回HTML元素的平移位置（X/Y）

## app.module.Collection

提供集合的数据模型。目前只支持pop和push方法。

### new Collection(arrayData)

* @param {array} arrayData
* @param {Collection} a collection object

实例化一个集合对象。

### length

* @var {number} the length of collection

集合模型的值长度（只读）。

### pop()

* @return {*} value

从集合模型的栈顶弹出一个值。

### push(value)

* @param {*}  value

往集合模型的栈顶压入一个值。

## app.module.Content

UI模块。提供多个节点的缓存机制。

### new Content(wrapEl, options)

* @param {HTMLElement} wrapEl
* @param {object} [options]

实例化一个Content对象。options可配置的参数如下：

	- cacheLength: 节点缓存数量，默认为1。

### setClassName()

设置当前状态下DOM节点的class。

### getActive()

* @return {HTMLElement} the current active node

返回当前激活状态的节点。

### getNext()

* @return {HTMLElement} the next node

返回当前激活节点的下一个节点。

### getPrevious()

* @return {HTMLElement} the previous node

返回当前激活节点的上一个节点。

### next()

激活下一个节点。

### previous()

激活上一个节点。

### html(str)

* @param {string} a html string

设置当前激活节点的HTML。

## app.module.Event

提供发布/订阅者模式的模型。

### addEventListener(type, handler)

* @param {string} a event type
* @param {function} a event handler

监听事件。

### removeEventListener(type, handler)

* @param {string} a event type
* @param {function} a event handler

取消监听事件。

### dispatchEvent(e)

* @param {object} a event object

分发一个事件。`e`对象必须包含字段`type`。

## app.module.MessageScope

## app.module.Model

## app.module.Navbar

## app.module.Navigation

## app.module.Page

## app.module.Scroll

## app.module.StateStack

## app.module.Template

## app.module.Toolbar

## app.module.Transition

## app.module.View

## 模块依赖关系图

![模块依赖关系图](./_res/dependencies.png)









	



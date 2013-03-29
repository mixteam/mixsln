# API手册

##app

### start()

启动App。

##app.config

### viewport

* @var {HTMLElement}

设置项目的视区元素

### enableTitlebar

* @var {boolean} [false]

设置是否启用标题栏，默认为false

### enableScroll

* @var {boolean} [false]

设置是否启用页内滚动，默认为false

### enableTransition

* @var {boolean} [false]

设置是否启用转场效果，默认为false

### templateEngine

* @var {object}

定义模版引擎的compile和render方法。

##app.page

### define(properties)

* @param {object} properties
* @return a page object

定义一个页面

### abstract(properties)

* @param {object} properties
* @return a abstract page

定义一个虚页面（虚基类），该页面不会被实例化。而其他页面可以扩展此虚页面的方法和属性。因此不推荐在虚页面中设置`route`。

### get(name)

* @param {string} name
* @return {Page} a page object

获取指定name的页面

### each(delegate)

* @param {function} delegate

遍历当前已经定义的页面

##app.component

### get(name)

* @param {string} name
* @return {HTMLElement} a component element

获取指定name的组件元素

### getActiveContent()

* @return {HTMLElement} the current actived content

获取当前活动的内容区

##app.navigation

### getParameter(name)

* @param {string} name
* @return {string} a value

获取指定name的路由参数值

### getArgument(name)

* @param {string} name
* @return {string} a value

获取指定name的GET值（参见push方法）

### getData(name)

* @param {string} name
* @return {string} a value

获取指定name的POST值（参见push方法）

### getPageName()

* @retrun {string} the name of the current page

返回当前页面的名称

### getRouteName()

* @retrun {string} the name of the current route

返回当前路由的名称

### getState()

* @return {object} the current state

获取当前导航的状态

### push(fragment, options)

* @param {string} fragment
* @param {object} [options]

（导航）前进操作。fragment指定路径，可传递GET和POST数据，分别对应options.args和options.datas。

### pop()

（导航）后退操作。

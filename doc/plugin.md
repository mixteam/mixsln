# 插件的使用和开发

插件是二次开发的切入口。适合高级用户来对系统进行扩展。插件的使用主要分为几个场景：

- 应用场景。应用启动时，转场时等
- 页面场景。页面定义时，页面进入时等
- 视图场景。视图扩展时，视图渲染时等

要使用插件，必须引入这些插件的js文件。插件的js文件位于`dist/plugins`下。

## 开发自定义插件

### 命名

所有插件都定义在`app.plugin`这个命名空间下，例如：

	app.plugin.domevent = {
		//...
	}

`domevent`即为插件名，在视图或页面中使用。例如：


	app.definePage({
		name: 'home',
		plugins: {
			domevent: true
		}
	})

### 切入点

想让插件在系统中发挥作用，就需要切人几个关键点（时机）。目前系统提供了12个切入点，供插件开发。

**onAppStart**

- 时机：整个应用运行之前。
- 参数：无。

借由在插件对象中编写名为`onAppStart`的方法，即可（下同）。例如：

	app.plugin.domevent = {
		onAppStart: function() {
			console.log(app.config)
		}
	}

**onViewRender**

- 时机：视图执行`render`方法之前。
- 参数：该视图的实例、该视图中对插件的配置项。

假如在视图中，设置了某个插件的配置项：

	app.extendView({
		name: 'listView',
		plugins: {
			domevent: {
				live: true
			}
		}
	})

那么，通过onViewRender的第二个参数，即可获得这个配置（下同），例如：

	app.plugin.domevent = {
		onViewRender: function(view, option) {
			console.log(option.live);
		}
	}

**onViewDestory**

- 时机：视图执行`destory`方法之前。
- 参数：该视图的实例、该视图中对插件的配置项。

**onPageDefine**

- 时机：完成页面定义。
- 参数：该页面的实例、该页面中对插件的配置项。

页面定义的时候，可获得该页面的实例（全局唯一）和页面中的配置项。例如：


	app.plugin.domevent = {
		onPageDefine: function(page, options) {
			console.log(option.live);
		}
	}

**onPageStartup**

- 时机：页面执行`startup`方法之前。
- 参数：该页面的实例，当前状态对插件的配置项。

在页面运行时，配置项是属于当前状态（关于状态的知识，请参考[开发者向导](guide.md)）的，它继承于页面中对插件的配置。所以，在页面运行时变更配置项都会保存在当前状态中。

**onPageShow**

- 时机：页面执行`show`方法之前。
- 参数：该页面的实例，当前状态对插件的配置项。

**onPageHide**

- 时机：页面执行`hide`方法之前。
- 参数：该页面的实例，当前状态对插件的配置项。

**onPageTeardown**

- 时机：页面执行`teardown`方法之前。
- 参数：该页面的实例，当前状态对插件的配置项。

**onNavigationSwitch**

- 时机：页面转场之前。
- 参数：当前状态对插件的配置项。

**onNavigationSwitchEnd**

- 时机：页面转场完成后。
- 参数：当前状态对插件的配置项。

**onDomReady**

- 时机：页面转场后且页面执行完`startup`方法之后。
- 参数：当前状态对插件的配置项。

### 扩展View和Page的方法

当View或者Page需要一些公共方法时，可以用更加便捷的方法在插件中进行扩展。例如:

	app.module.View.fn.delegate = function() {
		// TODO
	}

	app.module.Page.fn.do = function() {
		// TODO
	}

### 技巧和原则

编写插件的前提，是需要深入理解Mix解决方案的架构。有些模块并不推荐应用开发者来调用，但是作为插件开发者，则需要知悉并运用。

1. 熟悉配置项的工作原理。
2. 熟悉切入点的运作时机。
3. 适当扩展视图和页面方法。
4. 阅读系统组件的代码，配合系统组件完成一些复杂的功能。

## 一些预置的插件

插件的使用，可参见[demo](http://mixteam.github.io/mixsln/demo/webapp/)。

### domevent

在页面中支持事件的绑定和解绑。**需zepto支持**。

**应用场景**

视图渲染/销毁、页面进入/退出

**插件配置**

	plugins : {
		domevent : true
	}

**在视图或页面中增加events字段**

	events : [
		[event, selector, callback],
		//...
	]

`callback`可以是一个函数，也可以是页面对象中某方法名。其中上下文是当前页面的实例。

**扩展的视图和页面方法**

	delegateEvents(event, selector, callback);
	undelegateEvents(event, selector, callback);
	
### lazyload

让页面中的图片支持懒加载。

**应用场景**

页面显示/隐藏

**插件配置**

	plugins : {
		lazyload : {
			dataAttr : 'data-src'
		}
	}

`dataAttr`用来设置img元素上保存图片地址的属性名，如果`lazyload`设置为true，则默认为`data-src`。

**插件提供的方法**

	app.plugin.lazyload.check();

检查当前页面内图片的加载，需在内容渲染完成后，调用一次方法

### scrollpos

让页面记忆滚动位置（在每次滚动完成后，会被记录）

**应用场景**

页面显示/隐藏

**插件配置**

	plugins : {
		scrollpos : true
	}

**插件提供的方法**

	app.plugin.scrollpos.reset();

恢复页面记忆的滚动位置。

### stateStorage

保存导航的历史堆栈以及状态列表。

**应用场景**

应用启动，页面转场

**插件配置**

无

**插件方法**

	app.plugin.stateStorage.save() // 保存当前的状态到会话中
	app.plugin.stateStorage.load() // 从会话中恢复当前的状态
	app.plugin.stateStorage.saveAll() // 保存所有状态
	app.plugin.stateStorage.loadAll() // 加载所有状态

### loading

显示loading的遮罩层。

**应用场景**

页面转场

**插件配置**

无

**插件方法**

	app.plugin.loading.show() // 显示遮罩层，并返回一个id
	app.plugin.loading.hide(id) // 隐藏遮罩层，只有当所有的show都执行过hide后才会隐藏

### pullbonce

页面滚动的上拉和下拉。只要当开启了`app.config.enableScroll`才有用

**应用场景**

页面显示/隐藏

**插件配置**

	plugins: {
		pullbounce: {
			onPullDown: function(callback) {
				// 页面下拉后触发
				// ... 继续操作
				callback(); // 完成操作后，执行callback
			},
			onPullUp: function(callback) {
				// 页面上拉后触发
				// ... 继续操作
				callback(); // 完成操作后，执行callback
			}
		}
	}

onPullDown和onPullUp的值，也可以当前的page的方法名。


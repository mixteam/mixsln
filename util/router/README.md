## mix.core.util.Router

提供路由功能


模块依赖
---------------
Reset, Class, History


extend
------------------

Router.extend(properties, [classProperties]) 
 
创建一个自定义的路由类。 可以通过 routes 定义路由动作键值对，当匹配了 URL 片段便执行定义的动作。 

```js
		var router = require('router'),
		routerInstance = router.extend({
			routes : {
				'' : 'test',
				'!:page/:p' : 'page'
			},
			test : function(){
				console.log(arguments);
			},
			page : function(){
				console.log(arguments);
			}
		});
```
routes
------------------

routes 将带参数的 URLs 映射到路由实例的方法上，这与 视图 的 事件键值对 非常类似。 路由可以包含参数，:param，它在斜线之间匹配 URL 组件。 路由也支持通配符，*splat，可以匹配多个 URL 组件。

当访问者点击浏览器后退按钮，或者输入 URL ，如果匹配一个路由，此时会触发一个基于动作名称的 事件， 其它对象可以监听这个路由并接收到通知。 下面的示例中，用户访问 #!shoes/2 将从路由中触发 route:page 事件（或Router实例中的page方法）。 

```js
	routes: {
		"!:type/:p":"page"
	}
	router.bind("route:page", function(type,p) {
		//
	});
```

initialize
------------------

实例化一个路由对象，你可以直接传入 routes 键值对象作为参数。 如果定义该参数， 它们将被传入 initialize 构造函数中初始化。
该方法内须调用routerInstance.superclass.initialize.apply(this,arguments);详情参考Class.js

route
------------------

router.route(route, name, callback) 

为路由对象手动创建路由，route 参数可以是 路由字符串 或 正则表达式。 每个捕捉到的被传入的路由或正则表达式，都将作为参数传入回调函数（callback）。 一旦路由匹配，name 参数会触发 “route:name” 事件。 

```js
	var router = require('router'),
	routerInstance = router.extend({
		initialize: function(options) {
			routerInstance.superclass.initialize.apply(this,arguments);
			// 匹配 #page/10,10传入到回调函数中
			this.route("page/:number", "page", function(number){
				console.log(number);  //10
			});
		}
	});
```

navigate
------------------

router.navigate(fragment, [triggerRoute])

手动到达应用程序中的某个位置。 传入 triggerRoute 以执行路由动作函数。 

```js
openPage: function(pageNumber) {
  this.document.pages.at(pageNumber).open();
  this.navigate("page/" + pageNumber);
}
或
app.navigate("help/troubleshooting", true);

```






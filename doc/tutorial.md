# 用MIX快速开发WebApp

## 获取代码（v0.3.x）

## 启动应用（App）

## 创建页面（Page）

在MIX中，页面指的是一个特定的功能，比如列表页面、详情页面等，即由唯一的路由指向唯一的页面。
页面包括了处理逻辑的JS，组织结构的模版，以及展示样式的CSS。它们的相互关系可以被灵活的指定。
例如某目录下，包含了三个文件：

	list.css
	list.tpl
	list.js

`list.tpl`内容如下：

	<link rel="stylesheet" type="text/css" href="./list.css">
	<ul>
		{{#items}}
		<li>{{name}}</li>
		{{/items}}
	</ul>

其中便引用了`list.css`来作为样式表。同时，`list.js`通过简单的配置，可快速开发一个页面：

	(function(app){
		var listPage = app.page.define({
			name : 'list',				// 指定唯一名称
			title : '搜索列表',			// 在标题栏上显示的标题
			route : 'list\\/(P<word>[^\\/]+)\\/(P<page>\d+)\\/?',	// 指定唯一路由（Perl风格）
			template : './list.tpl',	// 需要加载的模版
			buttons : [					// 设置标题栏上的按钮
				{
					type : 'back',		// 左侧返回按钮的文本，操作不可变更
					text : '返回'
				},
				{
					type : 'func',		// 右侧功能按钮的文本和操作
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

## 重要的对象

### app.page

用于定义页面、获取页面。

### app.component

用于获取组件，以及当前的活动区域。

### app.navigation

用于获取路由的参数，以及执行前进后退操作。
	

	

(function(app, undef){
	app.definePage({
		name: 'index',
		title: '首页',
		template: [
			'<section id="index">',
				'<ul>',
					'<li><a data-fragment="list/iphone">商品列表</a></li>',
					'<li><a data-fragment="detail/26265052346">商品详情</a></li>',
				'</ul>',
			'</section>'
		].join(''),

		buttons: [
			{
				type: 'back',
				text: '淘宝网',
				autoHide: false,
				handler: function(e) {
					location.href = 'http://m.taobao.com'
				}
			},
			{
				id: 'search',
				type: 'func',
				text: '搜索',
				handler: function() {
					app.navigation.push('search');
				}
			}
		],

		events: [
			['click', 'a[data-fragment]', '_clickHandler']
		],

		plugins: {
			domevent: true
		},

		_clickHandler: function(e) {
			var $el = $(e.srcElement);
			app.navigation.push($el.attr('data-fragment'));
		},

		startup: function() {
			this.html(this.template());
		}
	});
})(window['app']);
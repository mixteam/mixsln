(function(app, undef) {
	var searchbar = app.getView('searchbar');

	app.definePage({
		name: 'detail',
		title: '商品详情',
		route: 'detail\\/(P<pid>\\d+)\\/?',
		template: './pages/detail/detail.tpl',
		buttons: [
			{
				type: 'back',
				text: '搜索列表'
			},
			{
				id: 'comment',
				type: 'func',
				text: '评论',
				handler: function() {
					alert('go comment');
				}
			},
			{
				id: 'shop',
				type: 'func',
				text: '店铺',
				handler: function() {
					alert('go shop');
				}
			}
		],
		toolbar: {
			height: 50,
			el: searchbar.el
		},
		views: {
			searchbar: searchbar,
		},
		plugins: {
			domevent: true
		},

		startup : function() {
			// implement super.startup
			var pid = app.navigation.getParameter('pid'),
				html = this.template({}),
				searchbar = this.views.searchbar
				;

			console.log(app.navigation.getParameter('a'))
			console.log(app.navigation.getParameter('b'))

			this.html(html);
			searchbar.render();
		},

		teardown : function() {
			// implement super.teardown
			this.views.searchbar.destory();
		}
	});

})(window['app']);
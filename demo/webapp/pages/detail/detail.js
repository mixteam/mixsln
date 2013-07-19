(function(app, undef) {

	app.definePage({
		name: 'detail',
		title: '商品详情',
		route: 'detail\\/(P<pid>\\d+)\\/?',
		template: './pages/detail/detail.tpl',
		resources: {
			'js': ['./views/searchbar/searchbar.js'],
			'css': ['./pages/detail/detail.css']
		},
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
			height: 50
		},
		plugins: {
			domevent: true,
			dynamic: true
		},

		startup : function() {
			// implement super.startup
			var pid = app.navigation.getParameter('pid'),
				html = this.template()
				;

			this.html(html);
		},

		show: function() {
			var searchbar = this.searchbarView = app.getView('searchbar');

			app.navigation.setToolbar({el: searchbar.el});
			searchbar.render();
		},

		hide: function() {
			this.searchbarView.destory();
		},

		teardown : function() {
			// implement super.teardown
		}
	});

})(window['app']);
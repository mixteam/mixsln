(function(app, undef) {

	app.definePage({
		name: 'detail',
		title: '商品详情',
		route: 'detail\\/(P<pid>\\d+)\\/?',
		template: './pages/detail/detail.tpl',
		buttons: [
			{
				type: 'back',
				text: '搜索列表'
			}
		],
		toolbar: 50,
		views: {
			searchbar: app.getView('searchbar'),
		},
		plugins: {
			domevent: true
		},


		startup : function() {
			// implement super.startup
			var that = this,
				pid = app.navigation.getParameter('pid')
				;

			that.template({}, function(html) {
				that.html(html);
				app.navigation.setToolbar(that.views.searchbar.el);
				that.views.searchbar.render();
			});
		},

		teardown : function() {
			// implement super.teardown
			this.views.searchbar.destory();
		}
	});

})(window['app']);
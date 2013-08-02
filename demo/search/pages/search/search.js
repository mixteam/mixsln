(function(app, undef) {

	app.definePage({
		name: 'search',
		title: '搜索商品',
		route: 'search\/?',

		buttons : [
			{
				type: 'back',
				text: '返回'
			}
		],
		
		startup : function() {
			// implement super.startup
			var searchbar = this.searchbarView = app.getView('searchbar');

			this.html('<div id="tbh5v0"></div>');
			this.$el.find('#tbh5v0').append(searchbar.el);

			searchbar.render();
		},

		teardown : function() {
			// implement super.teardown
			this.searchbarView.destroy();
		}
	});

})(window['app']);
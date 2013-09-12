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
			},
			{
				id: 'comment',
				type: 'func',
				text: '评论',
				handler: function() {
					this.commentView.slideIn();
				}
			},
			{
				id: 'pic',
				type: 'func',
				text: '图文',
				handler: function() {
					this.picView.slideIn();
				}
			}
		],

		toolbar: {
			height: 50
		},

		plugins: {
			domevent: true
		},

		startup : function() {
			// implement super.startup
			var pid = app.navigation.getParameter('pid'),
				html = this.template()
				;

			this.html(html);
		},

		show: function() {
			var searchbar = this.searchbarView = app.getView('searchbar'),
				comment = this.commentView = app.getView('comment'),
				pic = this.picView = app.getView('pic');

			app.navigation.setToolbar({el: searchbar.el});
			searchbar.render();
			comment.render();
			pic.render();
		},

		hide: function() {
			this.searchbarView.destory();
		},

		teardown : function() {
			// implement super.teardown
		}
	});

})(window['app']);
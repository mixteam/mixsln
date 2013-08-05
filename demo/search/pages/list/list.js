(function(app, undef) {
	
	app.definePage({
		name : 'list',
		title : '搜索列表',
		route : 'list\\/(P<word>[^\\/]+)\\/?',
		template : './pages/list/list.tpl',

		buttons : [
			{
				type : 'back',
				text : '返回'
			}
		],

		plugins : {
			dynamic: true,
			lazyload: true,
			scrollpos: true,
			pullbounce: {
				onPullDown: '_onPullDownHandler',
				onPullUp: '_onPullUpHandler'
			}
		},

		_onPullDownHandler : function(callback) {
			this.searchitemsView.pageno = 1;
			this.searchitemsView.render({pageno: 1}, function() {
				callback();
				setTimeout(function(){
					app.plugin.lazyload.check();
				}, 500);
			});
		},

		_onPullUpHandler : function(callback) {
			this.searchitemsView.renderMore(function() {
				callback();
				setTimeout(function(){
					app.plugin.lazyload.check();
				}, 500);
			});
		},

		startup : function() {
			// implement super.startup
			var that = this,
				word = decodeURIComponent(app.navigation.getParameter('word')),
				searchbar = this.searchbarView = app.getView('searchbar'),
				searchitems = this.searchitemsView = app.getView('searchitems'),
				html = this.template();
				;

			app.navigation.setTitle('"' + word + '" 的搜索列表');
			this.html(html);
			this.$el.find('.searchform').append(searchbar.el);
			this.$el.find('.searchcontent').append(searchitems.el);

			searchbar.render(word);
			searchitems.render({searchWord: word, pageno: 1}, function() {
				that.$el.find('#J_pullRefresh, #J_pullUpdate').css('visibility', 'visible');
				setTimeout(function(){
					app.plugin.lazyload.check();	
				}, 500);
			});
		},

		teardown : function() {
			// implement super.teardown
			var searchbar = this.searchbarView,
				searchitems = this.searchitemsView
				;

			searchbar.destroy();
			searchitems.destroy();
		}
	});

})(window['app']);
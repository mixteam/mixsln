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

		events: [
			['click', '.searchnav .prev', '_onPageNavHandler'],
			['click', '.searchnav .next', '_onPageNavHandler']
		],

		plugins : {
			dynamic: true,
			lazyload: true,
			scrollpos: true,
			domevent: true,
			pullbounce: {
				onPullDown: '_onPullDownHandler'
				//onPullUp: '_onPullUpHandler'
			}
		},

		_onPageNavHandler : function(e) {
			var el = e.srcElement,
				pageno = this.searchitemsView.pageno;

			if (el.className === 'prev' && pageno > 1) {
				pageno--;
			} else if (el.className === 'next') {
				pageno++;
			} else {
				pageno = 0;
			}

			if (pageno) {
				app.navigation.replace('list/' + this.searchitemsView.word, {
					data: {
						pn: pageno
					}
				})
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

		startup: function() {
			// implement super.startup
			var	searchbar = this.searchbarView = app.getView('searchbar'),
				searchitems = this.searchitemsView = app.getView('searchitems'),
				html = this.template();

			this.html(html);

			this.$el.find('.searchform').append(searchbar.el);
			this.$el.find('.searchcontent').append(searchitems.el);
		},

		show : function() {
			// implement super.show
			var that = this,
				word = decodeURIComponent(app.navigation.getParameter('word')),
				pageno = app.navigation.getParameter('pn') || 1,
				searchbar = this.searchbarView,
				searchitems = this.searchitemsView,
				html = this.template();
				;

			app.navigation.setTitle('"' + word + '" 的搜索列表');

			searchbar.render(word);
			searchitems.render({searchWord: word, pageno: parseInt(pageno)}, function() {
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
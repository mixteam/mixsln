(function(app, undef) {
	app.definePage({
		name : 'list',
		title : '搜索列表',
		route : 'list\\/(P<word>[^\\/]+)\\/?',
		template : './pages/list/list.tpl',

		events : [
			['submit', '#J_topSearchForm', '_submitFormHandler']
		],

		buttons : [
			{
				type : 'back',
				text : '返回'
			},
			{
				id : 'filter',
				type : 'func',
				text : '筛选',
				handler : function(e) {
					var btn = e.srcElement;
					if (btn.innerText === '筛选') {
						app.navigation.setButton({
							id: 'filter',
							text: '完成'
						});
					} else if (btn.innerText === '完成') {
						app.navigation.setButton({
							id: 'filter',
							text: '筛选'
						});
					}
				}
			}
		],

		plugins : {
			domevent: true,
			lazyload: true,
			scrollpos: true,
			pullbounce: {
				top: 50,
				bottom: 50,
				onPullDown: function(offset) {
					var that = this,
						span = this.$el.find('#J_pullRefresh span'),
						text = span.text();

					if (offset > 50 && text !== '松开即刷新') {
						span.text('松开即刷新');
					} else if (offset < 50 && text !== '下拉可刷新'){
						span.text('下拉可刷新');
					}

					return function(callback) {
						that.refresh(callback);
					}
				},

				onPullUp: function(offset) {
					var that = this,
						span = this.$el.find('#J_pullRefresh span'),
						text = span.text();

					if (offset > 50 && text !== '松开即加载更多') {
						span.text('松开即加载更多');
					} else if (offset < 50 && text !== '上拉可加载更多'){
						span.text('上拉可加载更多');
					}

					return function(callback) {
						that.more(callback);
					}
				},

				onPullEnd: function(type, callback) {
					type === 'pulldown'?this.refresh(callback):this.more(callback);
				}	
			}
		},

		_submitFormHandler : function(e, that) {
			e.preventDefault();

			var word = this.$el.find('#J_topSearchForm .c-form-search input').val()
				;

			app.navigation.push('list/' + encodeURIComponent(word) + '/');
		},

		refresh : function(callback) {
			this.searchItemsView.pageno = 1;
			this.searchItemsView.render(function() {
				callback();
				setTimeout(function(){
					app.plugin.lazyload.check();	
				}, 500);
			});
		},

		more : function(callback) {
			this.searchItemsView.renderMore(function() {
				callback();
				setTimeout(function(){
					app.plugin.lazyload.check();
				}, 500);
			});
		},

		startup : function() {
			// implement super.startup
			var that = this,
				word = decodeURIComponent(app.navigation.getParameter('word'))
				searchItems = this.searchItemsView = app.getView('searchItems')
				;

			searchItems.word = word;
			searchItems.pageno = 1;
			app.navigation.setTitle('"' + word + '" 的搜索列表');
			
			var html = this.template({searchWord: word});
			this.html(html);
			this.$el.find('.searchcontent').append(searchItems.el);
			searchItems.render(function() {
				that.$el.find('#J_pullRefresh, #J_pullUpdate').css('visibility', 'visible');
				setTimeout(function(){
					app.plugin.lazyload.check();	
				}, 500);
			});
		},

		teardown : function() {
			// implement super.teardown
			var that = this,
				searchItems = that.searchItemsView
				;

			searchItems.destroy();
		}
	});

})(window['app']);
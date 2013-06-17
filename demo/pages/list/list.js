(function(app, undef) {
	app.definePage({
		name : 'list',
		title : '搜索列表',
		route : 'list\\/(P<word>[^\\/]+)\\/?',
		template : './pages/list/list.tpl',

		events : [
			['submit', '#J_topSearchForm', '_submitFormHandler']
		],

		views : {
			searchItems : app.getView('searchItems')
		},

		buttons : [
			{
				type : 'back',
				text : '返回'
			},
			{
				type : 'func',
				text : '筛选',
				handler : function(e) {
					alert('TODO filter');
				}
			}
		],

		plugins : {
			domevent: true,
			lazyload: true,
			scrollpos: true
		},

		_submitFormHandler : function(e, that) {
			e.preventDefault();

			var word = this.content.$el.find('#J_topSearchForm .c-form-search input').val()
				;

			this.navigation.push('list/' + encodeURIComponent(word) + '/');
		},

		_renderItems : function(callback) {
			var that = this,
				searchItems = that.views.searchItems,
				searchContent = that.content.$el.find('.searchcontent')
				;

			searchItems.render(function(dom) {
				searchContent.html('').append(dom);
				callback && callback();
			});
		},

		startup : function() {
			// implement super.startup
			var that = this,
				word = decodeURIComponent(that.navigation.getParameter('word')),
				searchItems = that.views.searchItems
				;

			searchItems.word = word;
			searchItems.pageno = 1;
			that.navigation.setTitle('"' + word + '" 的搜索列表');
			
			that.template({searchWord: word}, function(html) {
				that.content.html(html);
				that._renderItems(function() {
					//app.plugin.scrollpos.reset();
					//app.plugin.lazyload.check();
				});
			});
		},

		teardown : function() {
			// implement super.teardown
			var that = this,
				searchItems = that.views.searchItems
				;

			searchItems.destroy();
		}
	});

})(window['app']);
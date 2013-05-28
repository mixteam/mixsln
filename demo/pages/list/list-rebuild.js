(function(app, undef) {
	var SearchItems = app.view.get('searchItems'),

		listPage = app.page.define({
			name : 'list',
			title : '搜索列表',
			route : 'list\\/(P<word>[^\\/]+)\\/?',
			template : './pages/list/list.tpl',

			events : [
				['submit', '#J_topSearchForm', '_submitFormHandler']
			],

			views : {
				 searchItems: new SearchItems()
			},

			buttons : [
				{
					type : 'back',
					text : '返回'
				},
				{
					type : 'func',
					text : '下一页',
					handler : function(e) {
						listPage.nextPage();
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

				var word = that.viewport.$el.find('#J_topSearchForm .c-form-search input').val()
					;

				that.navigation.push('list/' + encodeURIComponent(word) + '/');
			},

			ready : function() {
				// implement super.load
				var that = this,
					word = decodeURIComponent(that.navigation.getParameter('word')),
					html = that.template.render({searchWord : word}),
					searchItems = that.views.searchItems
					;


				that.navigation.setTitle('"' + word + '" 的搜索列表');
				that.viewport.fill(html);

				searchItems.$el = that.viewport.$el.find('.searchcontent');
				searchItems.word = word;
				searchItems.page = 1;
				searchItems.render(function() {
					app.plugin.scrollpos.reset();
					app.plugin.lazyload.check();
				});
			},

			unload : function() {
				// implement super.unload
				var that = this,
					searchItems = that.views.searchItems
					;

				searchItems.destroy();
			},

			nextPage : function() {
				var that = this,
					searchItems = that.views.searchItems

				searchItems.page++;
				searchItems.render(function() {
					app.plugin.scrollpos.reset(0);
					app.plugin.lazyload.check();
				});
			}
		})
	;

})(window['app']);
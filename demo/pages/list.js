(function(app, undef) {
	var SearchItems = app.view.get('searchItems'),

		listPage = app.page.define({
			name : 'list',
			title : '搜索列表',
			route : 'list\\/(P<word>[^\\/]+)\\/?',
			template : './templates/list.tpl',

			events : [
				['submit', '#J_topSearchForm', '_submitFormHandler']
			],

			views : {
				searchItems : new SearchItems()
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
				lazyload : true,
				scrollpos : true
			},

			_renderItems : function(callback) {
				var that = this,
					searchItems = that.views.searchItems,
					searchContent = that.find('.searchcontent')
					;

				searchItems.render(function(dom) {
					searchContent.html('').append(dom);
					callback && callback();
				});
			},

			_submitFormHandler : function(e, that) {
				var word = that.find('#J_topSearchForm .c-form-search input').val()
					;

				e.preventDefault();
				navigation.push('list/' + encodeURIComponent(word) + '/');
			},

			getTitle : function() {
				return '"' + this.views.searchItems.word + '" 的搜索列表'
			},

			ready : function() {
				// implement super.load
				var that = this,
					navigation = app.navigation,
					searchItems = that.views.searchItems
					;

				searchItems.word = decodeURIComponent(navigation.getParameter('word'));
				searchItems.page = 1;
				that.layout();
			},

			unload : function() {
				// implement super.unload
				var that = this,
					searchItems = that.views.searchItems
					;

				searchItems.destroy();
			},

			layout : function() {
				var that = this,
					searchItems = that.views.searchItems,
					data = {searchWord : searchItems.word}
					;

				that.fill(data);
				that._renderItems(function() {
					app.plugin.scrollpos.reset();
					app.plugin.lazyload.check();
				});
			},

			nextPage : function() {
				var that = this,
					searchItems = that.views.searchItems

				searchItems.page++;
				this._renderItems(function() {
					app.plugin.scrollpos.reset(0);
					app.plugin.lazyload.check();
				});
			}
		})
	;

})(window['app']);
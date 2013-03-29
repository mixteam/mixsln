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
			scrollpos : true,
			domfind : true,
			domevent : true
		},

		_fillContent : function() {
			var that = this,
				searchItems = that.views.searchItems;

			searchItems.render(function(html) {
				that.find('.searchcontent').html(html);
				app.plugin.lazyload.check();
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
		},

		layout : function() {
			var that = this,
				searchItems = that.views.searchItems

			that.fill({
				searchWord : searchItems.word
			}, that._fillContent.bind(that));
		},

		nextPage : function() {
			var that = this,
				searchItems = that.views.searchItems

			searchItems.page++;
			this._fillContent();
		}
	});

})(window['app']);
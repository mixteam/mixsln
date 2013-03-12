(function(app, undef) {
	var listPage = app.page.define({
		name : 'list',
		title : '搜索列表',
		route : 'list\\/(P<word>[^\\/]+)\\/?',
		template : './list/list.tpl',
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
			lazyload : {
				itemSelector : '#J_SearchList > ul > li',
				itemHeight : 123,
				viewHeightPatch : -86
			},

			scrollpos : true
		},

		_searchWord : null,
		_searchPage : 1,
		_scrollPos : 0,

		_loadDatas : function(callback) {
			var that = this,
				searchWord = that._searchWord,
				searchPage = that._searchPage,
				url = 'http://s.m.taobao.com/search_turn_page_iphone.htm?q=' + encodeURIComponent(searchWord) + '&sst=1&wlsort=5&abtest=5&page=' + searchPage
				;

			$.ajax({
				url : url,
				dataType : 'jsonp',
				success : function(json) {
					json.searchWord = searchWord;
					callback(json);
				}
			});
		},

		_fillContent : function() {
			var that = this;

			that._loadDatas(function(datas) {
				that.fill(datas);
			});	
		},

		_bindEvents : function() {
			var that = this,
				navigation = app.navigation,
				scroll = app.component.get('scroll'),
				content = $(app.component.getActiveContent())
				;

			// implement super.ready
			content.on('click', '#J_SearchList a', function(e) {
				var el = this
					;
				e.preventDefault();
				navigation.push('detail/' + el.getAttribute('dataid') + '/');
			});

			content.on('submit', '#J_topSearchForm', function(e) {
				var word = content.find('#J_topSearchForm .c-form-search input').val()
					;

				e.preventDefault();
				navigation.push('list/' + encodeURIComponent(word) + '/');
			});
		},

		_unbindEvents : function() {
			var that = this,
				content = $(app.component.getActiveContent())
				;

			// implement super.ready
			content.off('click', '#J_SearchList a');
			content.off('submit', '#J_topSearchForm');
		},

		getTitle : function() {
			return '"' + this._searchWord + '" 的搜索列表'
		},

		ready : function() {
			// implement super.load
			var that = this,
				navigation = app.navigation
				;

			that._searchWord = decodeURIComponent(navigation.getParameter('word'));
			that._searchPage = 1;

			that._fillContent();
			that._bindEvents();
		},

		unload : function() {
			// implement super.unload
			var that = this
				;

			that._unbindEvents();
		},

		nextPage : function() {
			this._searchPage++;
			this._fillContent();
		}
	});

})(window['app']);
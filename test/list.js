(function(app, undef) {
	var listApp = app.init({
		name : 'list',
		title : '搜索列表',
		route : 'list\\/(P<word>[^\\/]+)\\/?',
		template : './list.tpl',
		buttons : [
			{
				type : 'backStack',
				text : '返回',
				autoHide : true
			},
			{
				type : 'rightExtra',
				text : '下一页',
				handler : function(e) {
					listApp.nextPage();
				}
			}
		],
		_navigation : null,
		_searchWord : null,
		_searchPage : 1,

		_loadDatas : function(callback) {
			var that = this,
				searchWord = that._searchWord,
				searchPage = that._searchPage,
				url = 'http://s.wapa.taobao.com/search_turn_page_iphone.htm?q=' + encodeURIComponent(searchWord) + '&sst=1&wlsort=5&abtest=5&page=' + searchPage
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
			var that = this,
				navigation = that._navigation;

			that._loadDatas(function(datas) {
				navigation.fill(datas, function() {
					that._bindEvents();
				});
			});	
		},

		_bindEvents : function() {
			var that = this,
				navigation = that._navigation,
				viewport = $(app.getViewport())
				;

			// implement super.ready
			viewport.find('#J_SearchList').on('click', 'a', function(e) {
				var el = this
					;
				e.preventDefault();
				navigation.push('detail/' + el.getAttribute('dataid') + '/');
			});

			viewport.find('#J_topSearchForm').on('submit', function(e) {
				var word = viewport.find('#J_topSearchForm .c-form-search input').val()
					;

				e.preventDefault();
				navigation.push('list/' + encodeURIComponent(word) + '/');
			});
		},

		getTitle : function() {
			return '"' + this._searchWord + '" 的搜索列表'
		},

		ready : function(navigation) {
			// implement super.load
			var that = this
				;

			that._navigation = navigation;
			that._searchWord = decodeURIComponent(navigation.getParameter('word'));
			that._searchPage = 1;
			that._fillContent();
		},

		unload : function() {
			// implement super.unload
		},

		nextPage : function() {
			var that = this,
				navigation = that._navigation;

			that._searchPage++;
			that._fillContent();
		}
	});

})(window['app']);
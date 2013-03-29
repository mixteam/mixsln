(function(app, undef) {
	app.view.define({
		name : 'searchItems',
		template : './templates/searchItems.tpl',

		events : [
			['click', 'a', '_itemClickHandler']
		],

		word : null,
		page : 1,

		_itemClickHandler : function(e, that) {
			var el = this
				;

			e.preventDefault();
			app.navigation.push('detail/' + el.getAttribute('dataid') + '/');
		},

		_getSearchItems : function(callback) {
			var that = this,
				word = that.word,
				page = that.page,
				url = 'http://s.m.taobao.com/search_turn_page_iphone.htm?q=' + encodeURIComponent(word) + '&sst=1&wlsort=5&abtest=5&page=' + page
				;

			$.ajax({
				url : url,
				dataType : 'jsonp',
				success : function(json) {
					callback(json);
				}
			});
		},

		render : function(callback) {
			var that = this
				;

			that._getSearchItems(function(datas) {
				that.renderDatas(datas, callback);
			});
		}
	});

})(window['app']);
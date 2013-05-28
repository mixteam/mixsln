(function(app, undef) {
	app.view.extend({
		name : 'searchItems',
		template : './pages/list/searchItems.tpl',
		word : null,
		page : 1,

		events: [
			['click', 'a', '_itemClickHandler']
		],

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
			// implement super.render
			var that = this,
				word = that.word,
				page = that.page,
				url = 'http://s.m.taobao.com/search_turn_page_iphone.htm?q=' + encodeURIComponent(word) + '&sst=1&wlsort=5&abtest=5&page=' + page
				;

			$.ajax({
				url : url,
				dataType : 'jsonp',
				success : function(json) {
					var html = that.template.render(datas);
					that.$el.html(html);
					callback && callback();
				}
			});
		},

		destroy : function() {
			// implement super.destroy
		}
	});

})(window['app']);
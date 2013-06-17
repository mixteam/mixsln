(function(app, undef) {
	app.extendView({
		name : 'searchItems',
		template : './pages/list/searchItems.tpl',
		word : null,
		pageno : 1,

		events: [
			['click', 'a', '_itemClickHandler']
		],

		_itemClickHandler : function(e) {
			e.preventDefault();
			this.navigation.push('detail/' + e.srcElement.getAttribute('dataid') + '/');
		},

		_getSearchItems : function(callback) {
			var that = this,
				word = that.word,
				pageno = that.pageno,
				url = 'http://s.m.taobao.com/search_turn_page_iphone.htm?q=' + encodeURIComponent(word) + '&sst=1&wlsort=5&abtest=5&page=' + pageno
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
				that.template(datas, function(html) {
					that.$el = $(html);
					app.plugin.domevent.delegateEvents(that.$el, that.events, that);
					callback(that.$el);
				});
			});
		},

		destroy : function() {
			app.plugin.domevent.undelegateEvents(this.$el);
		}
	});

})(window['app']);
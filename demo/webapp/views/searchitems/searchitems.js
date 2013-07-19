(function(app, undef) {
	app.extendView({
		name : 'searchitems',
		el: 'div#J_searchList.search-list > ul',
		template : './views/searchitems/searchitems.tpl',
		word : null,
		pageno : 1,

		events: [
			['click', 'a', '_itemClickHandler']
		],

		resources: {
			css: ['./views/searchitems/searchitems.css']
		},

		plugins: {
			domevent: true,
			dynamic: true
		},

		_itemClickHandler : function(e) {
			e.preventDefault();
			var fragment = app.navigation.resolveFragment('detail', {pid:e.srcElement.getAttribute('dataid')});
			app.navigation.push(fragment);
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

		render : function(data, callback) {
			// implement super.render
			var that = this
				;

			data.searchWord && (this.word = data.searchWord);
			data.pageno && (this.pageno = data.pageno);

			that._getSearchItems(function(datas) {
				var html = that.template(datas);
				that.$el.find('ul').html(html);
				callback && callback();
			});
		},

		renderMore : function(callback) {
			var that = this
				;

			that.pageno++;

			that._getSearchItems(function(datas) {
				var html = that.template(datas);
				that.$el.find('ul').append(html);
				callback && callback();
			});
		},

		destroy : function() {
			// implement super.destory
		}
	});

})(window['app']);
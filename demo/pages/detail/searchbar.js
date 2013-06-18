(function(app, undef) {
	app.extendView({
		name: 'searchbar',
		el: 'div#tbh5v0',
		template: './pages/detail/searchbar.tpl',
		events: [
			['submit', '#J_searchForm', '_submitFormHandler']
		],
		plugins: {
			domevent: true
		},
		_submitFormHandler : function(e) {
			e.preventDefault();
			var word = this.$el.find('#J_searchForm .bton-keyword').val();
			app.navigation.push('list/' + encodeURIComponent(word) + '/');
		},
		render: function() {
			var that = this;
			this.template({}, function(html) {
				that.$el.html(html);
			});
		},
		destory: function() {

		}
	});
})(window['app']);
(function(app, undef){

	app.extendView({
		name: 'searchbar',
		el: 'div#J_topSearch',
		template: './views/searchbar/searchbar.tpl',
		events: [
			['submit', '', '_submitFormHandler']
		],
		resources: {
			css: ['./views/searchbar/searchbar.css']
		},
		plugins: {
			domevent: true,
			dynamic: true
		},

		_submitFormHandler : function(e) {
			e.preventDefault();
			var word = this.$el.find('.c-form-search input').val(),
				fragment = app.navigation.resolveFragment('list', {word: word});
				
			app.navigation.push(fragment);
		},

		render: function(searchWord) {
			var html = this.template({searchWord:searchWord || ''});
			this.$el.html(html);
		},

		destroy: function() {
			//
		}
	});
	
})(window['app']);
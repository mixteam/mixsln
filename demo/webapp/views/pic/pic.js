(function(app, undef){

	app.extendView({
		parent: 'slideview',
		name: 'pic',
		el: 'div',

		render: function(searchWord) {
			this.$el.css({
				'background': '#FFF',
				'height': '100%'
			});
			var html = '';
			for (var i = 0; i < 100; i++) {
				html += '<li>图文' + (i + 1) + '</li>';
			}
			this.$el.html('<ul>' + html + '</ul>');
		},

		show: function() {
			app.navigation.setTitle('图文详情');

			app.navigation.setButton({
				type: 'func',
				text: '搜索',
				handler: function() {
					app.navigation.push('search');
				}
			});
		},

		destroy: function() {
			//
		}
	});
	
})(window['app']);
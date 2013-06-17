(function(app, undef){
	app.definePage({
		name: 'index',
		title: '首页',
		route: 'index\\/[^\\/]+\\/?',
		buttons: [
			{
				type: 'back',
				text: '返回'
			},
			{
				id: 'search',
				type: 'func',
				text: '搜索',
				handler: '_searchClickHandler'
			}
		],

		_searchClickHandler: function() {
			app.navigation.push('');
		},

		startup: function() {
			this.html('index');
		}
	});
})(window['app']);
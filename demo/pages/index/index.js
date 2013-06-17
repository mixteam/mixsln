(function(app, undef){
	app.definePage({
		name: 'index',
		title: '首页',
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
		route: 'index\\/[^\\/]+\\/?',

		_searchClickHandler: function() {
			this.navigation.push('');
		},

		startup: function() {
			this.content.html('index');
		}
	});
})(window['app']);
(function(app, undef) {

	app.definePage({
		name: 'red',
		title: 'red',
		route: 'red\\/?',

		buttons : [
			{
				type : 'back',
				text : '后退'
			},
			{
				type: 'func',
				text: '前进',
				handler: function() {
					app.navigation.push('green');
				}
			}
		],

		startup : function() {
			this.html('<div id="red-view"></div>');
		}
	});

})(window['app']);
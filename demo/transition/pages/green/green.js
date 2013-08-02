(function(app, undef) {
	
	app.definePage({
		name : 'green',
		title : 'green',
		route : 'green\\/?',

		buttons : [
			{
				type : 'back',
				text : '后退'
			},
			{
				type: 'func',
				text: '前进',
				handler: function() {
					app.navigation.push('red');
				}
			}
		],

		startup : function() {
			this.html('<div id="green-view"></div>');
		}
	});

})(window['app']);
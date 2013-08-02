api.navigation.ready(function() {
	alert('isReady');
});

function nav_setTitle() {
	var s = ['title1', 'title2', 'title3'];

	api.navigation.setTitle(s[Math.floor(Math.random()*3)]);
}

function nav_switch() {
	var s = ['title4', 'title5', 'title6'],
		t = ['pop', 'push'];

	api.navigation.switch(s[Math.floor(Math.random()*3)], t[Math.floor(Math.random()*2)]);
}

function nav_reset() {
	api.navigation.reset(function() {
		alert('successs');
	});
}

function nav_setButton() {
	var o = [{
			id: 'back1',
			type: 'back',
			text: '返回1',
			handler: function() {
				alert('返回1')
			}
		},
		{
			id: 'back1',
			type: 'back',
			text: '返回2',
			handler: function() {
				alert('返回2')
			}
		},
		{
			id: 'func1',
			type: 'func',
			text: '功能1',
			handler: function() {
				alert('功能1')
			}
		},
		{
			id: 'func2',
			type: 'func',
			text: '功能2',
			handler: function() {
				alert('功能2')
			}
		},
		{
			id: 'func1',
			type: 'func',
			text: '功能1改',
			handler: function() {
				alert('功能1改')
			}
		},
		{
			id: 'func2',
			type: 'func',
			text: '功能2改',
			handler: function() {
				alert('功能2改')
			}
		}
	];

	api.navigation.setButton(o[Math.floor(Math.random()*6)]);
}
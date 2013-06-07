function testButton() {
	var Navbar = app.module.Navbar,
		activeEl = document.querySelector('.viewport .active');

	activeEl.innerHTML = '<header>'+
		'<ul>'+
			'<li></li>'+
			'<li></li>'+
			'<li></li>'+
		'</ul>'+
	'</header>';

	var nb = new Navbar(activeEl.querySelector('header'), {
			backWrapEl : activeEl.querySelector('ul li:first-child'),
			titleWrapEl : activeEl.querySelector('ul li:nth-child(2)'),
			funcWrapEl : activeEl.querySelector('ul li:last-child'),
		}),
		backOpt = {
			type: 'back',
			'class': 'back',
			text: '返回',
			handler: function() {
				nb.setButton({
					type: 'back',
					text: '首页'
				})
			}
		},
		btn1Opt = {
			id: 'btn1',
			type: 'func',
			text: '显示按钮2',
			handler: function() {
				nb.setButton({
					id: 'btn2',
					hide: false
				});
			}
		},
		btn2Opt = {
			id: 'btn2',
			type: 'func',
			text: '增加按钮3/4',
			hide: true,
			handler: function() {
				nb.setButton(btn3Opt);
				nb.setButton(btn4Opt);
			}
		},
		btn3Opt = {
			id: 'btn3',
			type: 'func',
			text: '移除按钮1',
			handler: function() {
				nb.removeButton('btn1');
			}
		},
		btn4Opt = {
			id: 'btn4',
			type: 'func',
			text: '移除所有',
			handler: function() {
				nb.removeButton();
			}
		}
		;

	nb.setTitle('demo');
	nb.setButton(backOpt);
	nb.setButton(btn1Opt);
	nb.setButton(btn2Opt);
}
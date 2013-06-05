(function(win, app, undef) {

var doc = win.document,
	anim = app.module.Animation,
	TYPE_XY = {
		'L': 'x',
		'R': 'x',
		'T': 'y',
		'B': 'y'
	},
	TYPE_IO = {
		'I': -1,
		'O': 1
	}
	;


var Transition = {
	TYPE : {
		LEFT_IN: 'LI',
		LEFT_OUT: 'LO',
		RIGHT_IN: 'RI',
		RIGHT_OUT: 'RO',
		TOP_IN: 'TI',
		TOP_OUT: 'TO',
		BOTTOM_IN: 'BI',
		BOTTOM_OUT: 'BO'
	},

	move: function(element, offsetX, offsetY, callback) {
		var offset = anim.getTransformOffset(element)
			;

		anim.doTransition(element,
			'0.4s', 'ease', '0s',
			offset.x + offsetX, offset.y + offsetY,
			callback
		)
	},

	slide: function(element, type, offset, callback) {
		var TYPE = this.TYPE, xy, io,
			originXY = anim.getTransformOffset(element),
			newXY = {
				x: originXY.x,
				y: originXY.y
			}
			;

		type = type.split('');
		xy = TYPE_XY[type[0]];
		io = TYPE_IO[type[1]];

		if (type[1] === 'I') {
			originXY[xy] += io * offset;
		} else {
			newXY[xy] += io * offset;
		}

		element.style.webkitTransition = '';
		element.style.webkitTransform = anim.makeTranslateString(originXY.x, originXY.y);

		setTimeout(function() {
			anim.doTransition(element,
				'0.4s', 'ease', '0s',
				newXY.x, newXY.y,
				callback
			);
		}, 10);		
	},

	float: function(element, type, offset, callback) {
		var TYPE = this.TYPE, xy, io,
			originXY = anim.getTransformOffset(element),
			newXY = {
				x: originXY.x,
				y: originXY.y
			},
			opacity
			;

		type = type.split('');
		xy = TYPE_XY[type[0]];
		io = TYPE_IO[type[1]];

		if (type[1] === 'I') {
			originXY[xy] += io * offset;
			opacity = 0;
		} else {
			newXY[xy] += io * offset;
			opacity = 1;
		}

		element.style.webkitTransition = '';
		element.style.webkitTransform = anim.makeTranslateString(originXY.x, originXY.y);
		element.style.opacity = opacity;

		setTimeout(function() {
			element.style.webkitTransition = '-webkit-transform 0.4s ease 0s, opacity 0.4s ease 0s';
			element.style.webkitTransform = anim.makeTranslateString(newXY.x, newXY.y);
			element.style.opacity = opacity === 1?0:1;

			callback && setTimeout(callback, 400);
		}, 10);	
	},

	fadeIn: function(element, options) {

	},

	fadeOut: function(element, options) {

	},


	zoomIn: function(element, options) {

	},

	zoomOut: function(element, options) {

	}
}

app.module.Transition = Transition;

})(window, window['app']||(window['app']={module:{},plugin:{}}));
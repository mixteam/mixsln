//@require animation

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

		element.style.webkitBackfaceVisibility = 'hidden';
		element.style.webkitTransformStyle = 'preserve-3d';

		anim.translate(element,
			'0.4s', 'ease', '0s',
			offset.x + offsetX, offset.y + offsetY,
			function() {
				element.style.webkitBackfaceVisibility = 'initial';
				element.style.webkitTransformStyle = 'flat';
				callback && callback();
			}
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
		element.style.webkitBackfaceVisibility = 'hidden';
		element.style.webkitTransformStyle = 'preserve-3d';

		anim.translate(element,
			'0.4s', 'ease', '0s',
			newXY.x, newXY.y,
			function() {
				element.style.webkitBackfaceVisibility = 'initial';
				element.style.webkitTransformStyle = 'flat';
				callback && callback();
			}
		);		
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
		element.style.webkitBackfaceVisibility = 'hidden';
		element.style.webkitTransformStyle = 'preserve-3d';

		anim.doTransition(element, {
			opacity: opacity === 1?0:1,
			translate: [newXY.x, newXY.y]
		}, {
			duration: '0.4s',
			timingFunction: 'ease',
			callback : function() {
				element.style.webkitBackfaceVisibility = 'initial';
				element.style.webkitTransformStyle = 'flat';
				callback && callback();
			}
		});
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
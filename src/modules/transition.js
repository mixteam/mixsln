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
	TYPE_RATIO = {
		'L': -1,
		'R': 1,
		'T': -1,
		'B': 1
	}
	;

function anime(element, type, delegate, callback) {
	var TYPE = this.TYPE, xy, ratio,
		offset = anim.getTransformOffset(element),
		from = {
			translate: {
				x: offset.x,
				y: offset.y
			}
		},
		to = {
			translate: {
				x: offset.x,
				y: offset.y
			}
		}
		;

	type = type.split('');
	delegate(from, to, type[0], type[1]);

	for (var p in from) {
		if (p === 'translate') {
			element.style.webkitTransition = '';
			element.style.webkitTransform = anim.makeTranslateString(from[p].x, from[p].y);
		} else {
			element.style[p] = from[p];
		}
	}
	to.translate = [to.translate.x, to.translate.y];
	
	element.style.webkitBackfaceVisibility = 'hidden';
	element.style.webkitTransformStyle = 'preserve-3d';

	anim.doTransition(element, to, {
		duration: '0.4s',
		timingFunction: 'ease',
		callback : function() {
			element.style.webkitBackfaceVisibility = 'initial';
			element.style.webkitTransformStyle = 'flat';
			element.style.webkitTransition = '';
			callback && callback();
		}
	});	 
}


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
				element.style.webkitTransition = '';
				callback && callback();
			}
		)
	},

	slide: function(element, type, offset, callback) {
		anime(element, type, function(from, to, type1, type2) {
			var xy = TYPE_XY[type1],
				ratio = TYPE_RATIO[type1];

			if (type2 === 'I') {
				from.translate[xy] += ratio * offset;
			} else {
				to.translate[xy] += ratio * offset;
			}
		}, callback);		
	},

	float: function(element, type, offset, callback) {
		anime(element, type, function(from, to, type1, type2) {
			var xy = TYPE_XY[type1],
				ratio = TYPE_RATIO[type1];

			if (type2 === 'I') {
				from.translate[xy] += ratio * offset;
				from.opacity = 0;
				to.opacity = 1;
			} else {
				to.translate[xy] += ratio * offset;
				from.opacity = 1;
				to.opacity = 0;
			}
		}, callback);
	},

	fadeIn: function(element, callback) {
		anime(element, 'FI', function(from, to, type1, type2) {
			if (type2 === 'I') {
				from.opacity = 0;
				to.opacity = 1;
			} else {
				from.opacity = 1;
				to.opacity = 0;
			}
		}, callback);
	},

	fadeOut: function(element, options) {
		anime(element, 'FO', function(from, to, type1, type2) {
			if (type2 === 'I') {
				from.opacity = 0;
				to.opacity = 1;
			} else {
				from.opacity = 1;
				to.opacity = 0;
			}
		}, callback);
	},


	zoomIn: function(element, options) {

	},

	zoomOut: function(element, options) {

	}
}

app.module.Transition = Transition;

})(window, window['app']||(window['app']={module:{},plugin:{}}));
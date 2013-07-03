(function(win, app, undef) {

var MATRIX3D_REG = /^matrix3d\(\d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, ([-\d.]+), ([-\d.]+), [-\d.]+, \d+\)/,
	MATRIX_REG = /^matrix\(\d+, \d+, \d+, \d+, ([-\d.]+), ([-\d.]+)\)$/,
	TRANSFORM_REG = /^(translate|rotate|scale)(X|Y|Z|3d)?|(matrix)(3d)?|(perspective)|(skew)(X|Y)?$/i,

    isAndroid = (/android/gi).test(navigator.appVersion),
    isIOS = (/iphone|ipad/gi).test(navigator.appVersion),
    has3d = 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix()
    ;

function addPx(v) {
	v += '';

	if (v.indexOf('px') < 0 && v.indexOf('%') < 0 && v !== '0') {
		v += 'px';
	}
	return v;
}

function addDeg(v) {
	v += '';

	if (v.indexOf('deg') < 0 & v !== '0') {
		v += 'deg';
	}

	return v;
}

function toCamelCase(str, sep) {
	sep || (sep = '-');

	str.replace(new RegExp(sep + '[a-z]', 'g'), function(v) {
		return v.split(sep)[1].toUpperCase();
	})

	return str;
}

function toDelimiterCase(str, sep) {
	sep || (sep = '-');

	return str.replace(/[a-z][A-Z]/g, '$1' + sep +'$2').toLowerCase();
}

function str2ms(s) {
	var unit = (/ms|s|m|h$/).exec(s)[0],
		convert = {ms:1, s:1000, m:60000, h:3600000};

	return parseFloat(s) * convert[unit];
}

var Animation = {
    translate: function(element, duration, timingFunction, delay, x, y, callback) {
	    this.doTransition(element, {
	    	translate: [x, y]
	    }, {
	    	duration: duration,
	    	timingFunction: timingFunction,
	    	delay: delay,
	    	callback: callback
	    });
    },

    doTransition: function(element, properties, options) {
    	var postfix = [options.duration, options.timingFunction || 'ease', options.delay || '0s'].join(' '),
    		matches, transform = '', transition = [], styles = {}
    		;

    	for (var p in properties) {
    		var v = properties[p];
    		if ((matches = p.match(TRANSFORM_REG))) {
	    		if (!(v instanceof Array)) {
	    			v = [v];
	    		}

    			var a = matches[1] || matches[3] || matches[5] || matches[6],
    				b = matches[2] || matches[4] || matches[7] || ''
    				;

    			if (a === 'translate' && b === '' && has3d) {
    				b = '3d';
    				v.push(0);
    			}
    			if (a === 'translate') {
    				v = v.map(addPx);
    			} else if (a === 'rotate' || a === 'skew') {
    				v = v.map(addDeg);
    			}
    			transform += a + b + '(' + v.join(',') + ')';
    		} else {
    			transition.push(toDelimiterCase(p) + ' ' + postfix);
    			styles[p] = v;
    		}

    		transform && transition.push('-webkit-transform ' + postfix);
    	}

    	var isTransitionEnd = false;
    	function webkitTransitionEnd(e){
    		if (isTransitionEnd) return;
	    	element.removeEventListener('webkitTransitionEnd', webkitTransitionEnd, false);
	        if(e && e.srcElement !== element) return;
	        isTransitionEnd = true;
	        setTimeout(options.callback, 10);
	    }
    	options.callback && element.addEventListener('webkitTransitionEnd', webkitTransitionEnd, false);
	    //setTimeout(webkitTransitionEnd, str2ms(options.duration) * 1.5);
    	setTimeout(function() {
	    	element.style.webkitTransition = transition.join(', ');
	    	if (transform.length) {
	    		element.style.webkitTransform = transform;
	    	}
	    	for (var p in styles) {
	    		element.style[p] = styles[p];
	    	}
    	}, 10);
    },

    genCubicBezier: function(a, b) {
		return [[(a / 3 + (a + b) / 3 - a) / (b - a), (a * a / 3 + a * b * 2 / 3 - a * a) / (b * b - a * a)],
        	[(b / 3 + (a + b) / 3 - a) / (b - a), (b * b / 3 + a * b * 2 / 3 - a * a) / (b * b - a * a)]];
    },

    makeTranslateString: function(x, y) {
		x = addPx(x);
		y = addPx(y);

	    if (has3d) {
	        return 'translate3d(' + x + ', ' + y + ', 0)';
	    } else {
	        return 'translate(' + x + ', ' + y + ')';
	    }
    },

    getTransformOffset: function(el) {
	    var offset = {
	    		x: 0,
	    		y: 0
	    	}, 
	    	transform = getComputedStyle(el).webkitTransform, 
	    	matchs, reg;

	    if (transform !== 'none') {
	    	reg = transform.indexOf('matrix3d') > -1 ? MATRIX3D_REG : MATRIX_REG;
	        if((matchs = transform.match(reg))) {
	            offset.x = parseInt(matchs[1]) || 0;
	            offset.y = parseInt(matchs[2]) || 0;
	        }
	    }

	    return offset;
    }
}

app.module.Animation = Animation;

})(window, window['app']||(window['app']={module:{},plugin:{}}));
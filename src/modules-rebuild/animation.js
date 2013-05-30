(function(win, app, undef) {

var MATRIX3D_REG = /^matrix3d\(\d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, ([-\d.]+), ([-\d.]+), [-\d.]+, \d+\)/,
	MATRIX_REG = /^matrix\(\d+, \d+, \d+, \d+, ([-\d.]+), ([-\d.]+)\)$/,
    TRANSITION_NAME = '-webkit-transform',

    appVersion = navigator.appVersion,
    isAndroid = (/android/gi).test(appVersion),
    isIOS = (/iphone|ipad/gi).test(appVersion),
    has3d = 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix()
    ;

var Animation = {
    doTransition: function(el, time, timeFunction, delay, x, y, callback) {
    	if (callback) {
		    function transitionEnd(e){
		        if(e && (e.srcElement !== el || e.propertyName !== TRANSITION_NAME)) {
		            return;
		        }
		        el.removeEventListener('webkitTransitionEnd', transitionEnd, false);
		        //el.style.webkitTransition = '';
		        callback && callback();   // 延迟执行callback。解决立即取消动画造成的bug
		    }
		    el.addEventListener('webkitTransitionEnd', transitionEnd, false);
		    //setTimeout(transitionEnd, parseFloat(time) * 1000);
		}

	    el.style.webkitTransition = [TRANSITION_NAME, time, timeFunction, delay].join(' ');
	    el.style.webkitTransform = this.makeTranslateString(x, y);
    },

    genCubicBezier: function(a, b) {
		return [[(a / 3 + (a + b) / 3 - a) / (b - a), (a * a / 3 + a * b * 2 / 3 - a * a) / (b * b - a * a)],
        	[(b / 3 + (a + b) / 3 - a) / (b - a), (b * b / 3 + a * b * 2 / 3 - a * a) / (b * b - a * a)]];
    },

    makeTranslateString: function(x, y) {
		x += '';
		y += '';

		if (x.indexOf('%') < 0 && x !== '0') {
			x += 'px';
		}
		if (y.indexOf('%') < 0 && y !== '0') {
			y += 'px';
		}

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
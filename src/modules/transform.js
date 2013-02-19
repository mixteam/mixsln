define(function(require, exports, module) {
var MATRIX3D_REG = /^matrix3d\(\d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, ([\d-]+), ([-\d]+), [\d-]+, \d+\)/,
	MATRIX_REG = /^matrix\(\d+, \d+, \d+, \d+, ([-\d]+), ([-\d]+)\)$/,
    TRANSITION_NAME = '-webkit-transform',

    appVersion = navigator.appVersion,
    isAndroid = (/android/gi).test(appVersion),
    isIOS = (/iphone|ipad/gi).test(appVersion),
    has3d = 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix()
    ;

function quadratic2cubicBezier(a, b) {
    return [[(a / 3 + (a + b) / 3 - a) / (b - a), (a * a / 3 + a * b * 2 / 3 - a * a) / (b * b - a * a)],
        [(b / 3 + (a + b) / 3 - a) / (b - a), (b * b / 3 + a * b * 2 / 3 - a * a) / (b * b - a * a)]];
}

function getTransformX(el) {
    var transform, matchs;

    transform = getComputedStyle(el).webkitTransform;

    if (transform !== 'none') {
        if((matchs = transform.match(MATRIX3D_REG))) {
            return parseInt(matchs[1]) || 0;
        } else if((matchs = transform.match(MATRIX_REG))) {
            return parseInt(matchs[1]) || 0;
        }
    }

    return 0;
}

function getTransformY(el) {
    var transform, matchs;

    transform = getComputedStyle(el).webkitTransform;

    if (transform !== 'none') {
        if((matchs = transform.match(MATRIX3D_REG))) {
            return parseInt(matchs[2]) || 0;
        } else if((matchs = transform.match(MATRIX_REG))) {
            return parseInt(matchs[2]) || 0;
        }
    }

    return 0;
}

function getTranslate(x, y) {
	x += '';
	y += '';

	if (x.indexOf('%') < 0 && x !== '0') {
		x += 'px';
	}
	if (y.indexOf('%') < 0 && y !== '0') {
		y += 'px';
	}

    if (isIOS && has3d) {
        return 'translate3d(' + x + ', ' + y + ', 0)';
    } else {
        return 'translate(' + x + ', ' + y + ')';
    }
}

function waitTransition(el, time, callback) {
    var isEnd = false;

    function transitionEnd(e){
        if(isEnd || 
            e && (e.srcElement !== el || e.propertyName !== TRANSITION_NAME)) {
            return;
        }

        isEnd = true;
        el.style.webkitTransition = 'none';
        el.removeEventListener('webkitTransitionEnd', transitionEnd, false);

        callback && setTimeout(callback, 50);   // 延迟执行callback。解决立即取消动画造成的bug
    }

    el.addEventListener('webkitTransitionEnd', transitionEnd, false);
    setTimeout(transitionEnd, parseFloat(time) * 1000);

}

function doTransition(el, time, timeFunction, delay, x, y, callback) {
	waitTransition(el, time, callback);
    el.style.webkitTransition = [TRANSITION_NAME, time, timeFunction, delay].join(' ');
    el.style.webkitTransform = getTranslate(x, y);

}

exports.getY = getTransformY;
exports.getX = getTransformX;
exports.getTranslate = getTranslate;
exports.getBezier = quadratic2cubicBezier;
exports.start = doTransition;
})
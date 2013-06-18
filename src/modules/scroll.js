//@require gesture
//@require animation

(function(win, app, undef) {

var doc = win.document,
	docEl = doc.documentElement,
	anim = app.module.Animation,
	element, offset, minScrollTop, maxScrollTop,
	panFixRatio = 2,
	cancelScrollEnd = false,
	stopBounce = false,
	prevented = false
	;

function getMinScrollTop(el) {
	return 0 - (el.bounceTop || 0);
}

function getMaxScrollTop(el) {
    // var parentStyle = getComputedStyle(el.parentNode),
    //     maxTop = 0 - el.offsetHeight + parseInt(parentStyle.height) - 
    //             parseInt(parentStyle.paddingTop) - 
    //             parseInt(parentStyle.paddingBottom);

    var rect = el.getBoundingClientRect(),
    	pRect = el.parentNode.getBoundingClientRect(),
    	maxTop = 0 - rect.height + pRect.height
    	;

    if (maxTop > 0) maxTop = 0;

    return maxTop + (el.bounceBottom || 0);
}

function fireEvent(element, eventName, extra) {
	var event = doc.createEvent('HTMLEvents');
	event.initEvent(eventName, false, true);
	for (var p in extra) {
		event[p] = extra[p];
	}
    element.dispatchEvent(event);
}

function touchstartHandler(e) {
	if (stopBounce) return;

	var parentElement = e.srcElement;

	while (!parentElement.boundScrollEvent) {
		parentElement = parentElement.parentNode || parentElement.offsetParent;
	}

	element = parentElement.boundScrollElement;

	if (!element) return;

	element.style.webkitBackfaceVisibility = 'hidden';
	element.style.webkitTransformStyle = 'preserve-3d';
	element.style.webkitTransition = '';
	element.style.webkitTransform = getComputedStyle(element).webkitTransform;
}

function touchmoveHandler(e) {	
	e.preventDefault();
	return false;
}

function touchendHandler(e) {
	// TODO
}

function panstartHandler(e) {
	if (stopBounce || !element) return;

	offset = anim.getTransformOffset(element);
	minScrollTop = getMinScrollTop(element);
	maxScrollTop = getMaxScrollTop(element);
	panFixRatio = 2.5;
	stopBounce = false;
	cancelScrollEnd = false;	
}

function panHandler(e) {
	if (stopBounce || !element) return;

    var y = offset.y + e.displacementY
        ;

    if(y > minScrollTop) {
    	y = minScrollTop + (y - minScrollTop) / panFixRatio;
    	panFixRatio *= 1.003;
    	if (panFixRatio > 4) panFixRatio = 4;
    } else if(y < maxScrollTop) {
    	y = maxScrollTop - (maxScrollTop - y) / panFixRatio;
    	panFixRatio *= 1.003;
    	if (panFixRatio > 4) panFixRatio = 4;
    }

    if ((getBoundaryOffset(y))) {
    	if (y > minScrollTop) {
    		var name = 'pulldown';
    	} else if (y < maxScrollTop) {
    		var name = 'pullup';
    	}
    	fireEvent(element, name);
    }

    element.style.webkitTransition = '';
    element.style.webkitTransform = anim.makeTranslateString(offset.x, y);
}

function panendHandler(e) {
	if (stopBounce || !element) return;

	var y = anim.getTransformOffset(element).y
	if (getBoundaryOffset(y)) {
		bounceEnd();
	} else {
		scrollEnd();
	}
}

function getBoundaryOffset(y) {
	if(y > minScrollTop) {
        return y - minScrollTop;
    } else if (y < maxScrollTop){
        return maxScrollTop - y;
    }
}

function touchBoundary(y) {
	if (y > minScrollTop) {
		y = minScrollTop;
	} else if (y < maxScrollTop) {
		y = maxScrollTop;
	}

	return y;
}

function bounceStart(v) {
	if (stopBounce || !element) return;

    var s0 = anim.getTransformOffset(element).y,
    	a = 0.008 * ( v / Math.abs(v));
    	t = v / a;
    	s = s0 + t * v / 2
    	;

    fireEvent(element, 'bouncestart');

    anim.translate(element, 
    	t.toFixed(0) + 'ms', 'cubic-bezier(' + anim.genCubicBezier(-t, 0) + ')', '0s', 
    	offset.x, s.toFixed(0),
		bounceEnd
    );
}

function bounceEnd() {
	if (stopBounce || !element) return;

	var y = anim.getTransformOffset(element).y;
	y = touchBoundary(y);

    anim.translate(element, 
    	'0.4s', 'ease-in-out', '0s', 
    	offset.x, y,
    	function() {
    		fireEvent(element, 'bounceend');
    		scrollEnd();
    	}
    );
}

function flickHandler(e) {
	if (stopBounce || !element) return;
	
    var s0 = anim.getTransformOffset(element).y,
        v, a, t, s,
        _v, _s, _t
        ;

    cancelScrollEnd = true;

    if(s0 > minScrollTop || s0 < maxScrollTop) {
    	bounceStart(v);
    } else {
    	v = e.velocityY;
        if (v > 1.5) v = 1.5;
        if (v < -1.5) v = -1.5;
        a = 0.0015 * ( v / Math.abs(v));
		t = v / a;
        s = s0 + t * v / 2;

        if (s > minScrollTop) {
    	    _s = minScrollTop - s0;
            _t = (v - Math.sqrt(-2 * a *_s + v * v)) / a;
            _v = v - a * _t;

	        anim.translate(element, 
	        	_t.toFixed(0) + 'ms', 'cubic-bezier(' + anim.genCubicBezier(-t, -t + _t) + ')', '0s', 
	        	offset.x, minScrollTop,
	        	function() {
	        		bounceStart(_v)
	        	}
	        );
            
        } else if (s < maxScrollTop) {
            _s = maxScrollTop - s0;
            _t = (v + Math.sqrt(-2 * a * _s + v * v)) / a;
            _v = v - a * _t;

	        anim.translate(element, 
	        	_t.toFixed(0) + 'ms', 'cubic-bezier(' + anim.genCubicBezier(-t, -t + _t) + ')', '0s', 
	        	offset.x, maxScrollTop,
	        	function() {
	        		bounceStart(_v)
	        	}
	        );
        } else {
	        anim.translate(element, 
	        	t.toFixed(0) + 'ms', 'cubic-bezier(' + anim.genCubicBezier(-t, 0) + ')', '0s', 
	        	offset.x, s.toFixed(0),
	        	scrollEnd
	        );
        }
	}
}

function scrollEnd() {
	if (stopBounce || !element) return;
	
	cancelScrollEnd = false;

	setTimeout(function() {
		if (!cancelScrollEnd) {
			element.style.webkitBackfaceVisibility = 'initial';
			element.style.webkitTransformStyle = 'flat';
			fireEvent(element, 'scrollend');
		}
	}, 10);
}

var Scroll = {
	enable: function(element, options) {
		var parentElement = element.parentNode || element.offsetParent
			;

	    if (!prevented) {
	    	prevented = true;
	    	docEl.addEventListener('touchmove', touchmoveHandler, false);
	    }

	    if (!parentElement.boundScrollEvent) {
	    	parentElement.boundScrollEvent = true;
			parentElement.addEventListener('touchstart', touchstartHandler, false);
			parentElement.addEventListener('touchend', touchendHandler, false);
		    parentElement.addEventListener('panstart', panstartHandler, false);
		    parentElement.addEventListener('pan', panHandler, false);
		    parentElement.addEventListener('panend', panendHandler, false);
		    parentElement.addEventListener('flick', flickHandler, false);
	    }
	    parentElement.boundScrollElement = element;

	    if (!element.refresh) {
	    	element.getScrollHeight = function() {
	    		return element.scrollHeight - (element.bounceTop||0) - (element.bounceBottom||0);
	    	}

		    element.getScrollTop = function() {
		    	var offset = anim.getTransformOffset(element);
	    		return -(offset.y + (element.bounceTop||0));
	    	}

		    element.refresh = function() {
		        element.style.height = 'auto';
		        element.style.height = element.offsetHeight + 'px';
		    }

		    element.scrollTo = function(y) {
		    	var x = anim.getTransformOffset(element).x;
		    	y = touchBoundary(-y - (element.bounceTop || 0));
				element.style.webkitTransition = '';
		        element.style.webkitTransform = anim.makeTranslateString(x, y);
		    }

		    element.scollToElement = function(el) {
		    	
		    }

		    element.getBoundaryOffset = function() {
			    var y = anim.getTransformOffset(element).y;
			    return getBoundaryOffset(y);
		    }

		    element.getViewHeight = function() {
		    	return getMinScrollTop(element) - getMaxScrollTop(element);
		    }

		    element.stopBounce = function() {
		    	stopBounce = true;

		    	var y = anim.getTransformOffset(element).y,
		    		minScrollTop = getMinScrollTop(element),
		    		maxScrollTop = getMaxScrollTop(element),
		    		_y
		    		;

		    	if (y > minScrollTop + (element.bounceTop||0)) {
		    		_y = minScrollTop + (element.bounceTop||0);
		    	} else if (y < maxScrollTop - (element.bounceBottom||0)) {
		    		_y = maxScrollTop - (element.bounceBottom||0);
		    	}

		    	if (_y != null) {
		    		anim.translate(element,
		    			'0.4s', 'ease-in-out', '0s',
		    			offset.x, _y);
		    	}
		    }

		    element.resumeBounce = function() {
		    	stopBounce = false;

		    	var y = anim.getTransformOffset(element).y,
		    		minScrollTop = getMinScrollTop(element),
		    		maxScrollTop = getMaxScrollTop(element),
		    		_y
		    		;

		    	if (y > minScrollTop) {
		    		_y = minScrollTop;
		    	} else if (y < maxScrollTop){
		    		_y = maxScrollTop;
		    	}

		    	if (_y != null) {
		    		anim.translate(element,
		    			'0.4s', 'ease-in-out', '0s',
		    			offset.x, _y);
		    	}
		    }
		}

		if (options) {
			element.bounceTop = options.bounceTop;
			element.bounceBottom = options.bounceBottom;
		} else {
			element.bounceTop = 0;
			element.bounceBottom = 0;
		}
		element.scrollTo(0);

	    return element;
	},

	disable: function(element) {
		var parentElement = element.parentNode || element.offsetParent;

		if (parentElement.boundScrollElement === element) {
			parentElement.boundScrollElement = null;
		}
	}
}

app.module.Scroll = Scroll;

})(window, window['app']||(window['app']={module:{},plugin:{}}));
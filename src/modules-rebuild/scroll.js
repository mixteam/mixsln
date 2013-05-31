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
    var parentStyle = getComputedStyle(el.parentNode),
        maxTop = 0 - el.offsetHeight + parseInt(parentStyle.height) - 
                parseInt(parentStyle.paddingTop) - 
                parseInt(parentStyle.paddingBottom);

    if (maxTop > 0) maxTop = 0;
    return maxTop + (el.bounceBottom || 0);
}

function fireEvent(element, eventName) {
	var event = doc.createEvent('HTMLEvents');
	event.initEvent(eventName, false, true);
    element.dispatchEvent(event);
}

function touchstartHandler(e) {
	var parentElement = e.srcElement;

	while (!parentElement.boundScrollEvent) {
		parentElement = parentElement.parentNode || parentElement.offsetParent;
	}

	element = parentElement.boundScrollElement;
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
	offset = anim.getTransformOffset(element);
	minScrollTop = getMinScrollTop(element);
	maxScrollTop = getMaxScrollTop(element);
	panFixRatio = 2.5;
}

function panHandler(e) {
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

    if (checkBoundary(y) != null) {
    	fireEvent(element, 'panbounce');
    }

    element.style.webkitTransition = '';
    element.style.webkitTransform = anim.makeTranslateString(offset.x, y);
}

function panendHandler(e) {
	var y = checkBoundary();
	y != null ? bounceEnd(y) : scrollEnd();
}

function checkBoundary(y) {
    var _y;

	(y != null) || (y = anim.getTransformOffset(element).y);

    if(y > minScrollTop) {
        _y = minScrollTop;
    } else if (y < maxScrollTop){
        _y = maxScrollTop;
    }

    return _y;
}

function bounceStart(v) {
    var s0 = anim.getTransformOffset(element).y,
    	a = 0.008 * ( v / Math.abs(v));
    	t = v / a;
    	s = s0 + t * v / 2
    	;

    fireEvent(element, 'bouncestart');

    anim.doTransition(element, 
    	t.toFixed(0) + 'ms', 'cubic-bezier(' + anim.genCubicBezier(-t, 0) + ')', '0s', 
    	offset.x, s.toFixed(0),
    	function() {
    		var y = checkBoundary();
    		y != null ? bounceEnd(y) : scrollEnd();
    	}
    );
}

function bounceEnd(y) {
	if (stopBounce) return;

    anim.doTransition(element, 
    	'0.4s', 'ease-in-out', '0s', 
    	offset.x, y,
    	function() {
    		fireEvent(element, 'bounceend');
    		scrollEnd();
    	}
    );
}

function flickHandler(e) {
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

	        anim.doTransition(element, 
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

	        anim.doTransition(element, 
	        	_t.toFixed(0) + 'ms', 'cubic-bezier(' + anim.genCubicBezier(-t, -t + _t) + ')', '0s', 
	        	offset.x, maxScrollTop,
	        	function() {
	        		bounceStart(_v)
	        	}
	        );
        } else {
	        anim.doTransition(element, 
	        	t.toFixed(0) + 'ms', 'cubic-bezier(' + anim.genCubicBezier(-t, 0) + ')', '0s', 
	        	offset.x, s.toFixed(0),
	        	scrollEnd
	        );
        }
	}
}

function scrollEnd() {
	cancelScrollEnd = false;

	setTimeout(function() {
		if (!cancelScrollEnd) {
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
			parentElement.addEventListener('touchend', touchstartHandler, false);
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

	    	element.setScrollTop = function(y) {
	    		var minScrollTop = getMinScrollTop(element),
	    			maxScrollTop = getMaxScrollTop(element),
	    			offset = anim.getTransformOffset(element)
	    			;

		        y = -y;

		        if (y < maxScrollTop) {
		            y = maxScrollTop;
		        } else if (y > minScrollTop) {
		            y = minScrollTop;
		        }
				element.style.webkitTransition = '';
		        element.style.webkitTransform = anim.makeTranslateString(offset.x, y);
	    	}

		    element.refresh = function() {
		        element.style.height = 'auto';
		        element.style.height = element.offsetHeight + 'px';
		    }

		    element.scrollTo = function(y) {

		    }

		    element.outOfBoundary = function() {
			    var y = anim.getTransformOffset(element).y;

			    if(y > minScrollTop) {
			        return y - minScrollTop;
			    } else if (y < maxScrollTop){
			        return maxScrollTop - y;
			    }
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
		    		anim.doTransition(element,
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
		    		anim.doTransition(element,
		    			'0.4s', 'ease-in-out', '0s',
		    			offset.x, _y);
		    	}
		    }
		}

		if (options) {
			element.bounceTop = options.bounceTop;
			element.bounceBottom = options.bounceBottom;
			element.setScrollTop(getMinScrollTop(element));
		}

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
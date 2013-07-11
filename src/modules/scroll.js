//@require gesture
//@require animation

(function(win, app, undef) {

var doc = win.document,
	docEl = doc.documentElement,
	anim = app.module.Animation,
	element, panFixRatio = 2,
	cancelScrollEnd = false,
	lockTouched = 0;
	stopBounce = false,
	prevented = false
	;

function getMinScrollTop(el) {
	return 0 - (el.bounceTop || 0);
}

function getMaxScrollTop(el) {
    var rect = el.getBoundingClientRect(),
    	pRect = el.parentNode.getBoundingClientRect(),
    	minTop = getMinScrollTop(el),
    	maxTop = 0 - rect.height + pRect.height
    	;

    return Math.min(maxTop + (el.bounceBottom || 0), minTop);
}

function getBoundaryOffset(el, y) {
	if(y > el.minScrollTop) {
        return y - el.minScrollTop;
    } else if (y < el.maxScrollTop){
        return el.maxScrollTop - y;
    }
}

function touchBoundary(el, y) {
	if (y > el.minScrollTop) {
		y = el.minScrollTop;
	} else if (y < el.maxScrollTop) {
		y = el.maxScrollTop;
	}
	return y;
}

function fireEvent(el, eventName, extra) {
	var event = doc.createEvent('HTMLEvents');
	event.initEvent(eventName, true, true);
	for (var p in extra) {
		event[p] = extra[p];
	}
    el.dispatchEvent(event);
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

	element.transformOffset = anim.getTransformOffset(element);
	element.minScrollTop = getMinScrollTop(element);
	element.maxScrollTop = getMaxScrollTop(element);
	panFixRatio = 2.5;
	stopBounce = false;
	cancelScrollEnd = false;
	fireEvent(element, 'scrollstart');
}

function panHandler(e) {
	if (stopBounce || !element) return;

    var y = element.transformOffset.y + e.displacementY
        ;

    if(y > element.minScrollTop) {
    	y = element.minScrollTop + (y - element.minScrollTop) / panFixRatio;
    	panFixRatio *= 1.003;
    	if (panFixRatio > 4) panFixRatio = 4;
    } else if(y < element.maxScrollTop) {
    	y = element.maxScrollTop - (element.maxScrollTop - y) / panFixRatio;
    	panFixRatio *= 1.003;
    	if (panFixRatio > 4) panFixRatio = 4;
    }

    if ((getBoundaryOffset(element, y))) {
    	if (y > element.minScrollTop) {
    		var name = 'pulldown';
    	} else if (y < element.maxScrollTop) {
    		var name = 'pullup';
    	}
    	fireEvent(element, name);
    }

    element.style.webkitTransition = '';
    element.style.webkitTransform = anim.makeTranslateString(element.transformOffset.x, y);
}

function panendHandler(e) {
	if (stopBounce || !element) return;

	var y = anim.getTransformOffset(element).y
	if (getBoundaryOffset(element, y)) {
		bounceEnd();
	} else {
		scrollEnd();
	}
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
    	element.transformOffset.x, s.toFixed(0),
		bounceEnd
    );
}

function bounceEnd() {
	if (stopBounce || !element) return;

	var y = anim.getTransformOffset(element).y;
	y = touchBoundary(element, y);

    anim.translate(element, 
    	'0.4s', 'ease-in-out', '0s', 
    	element.transformOffset.x, y,
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

    if(s0 > element.minScrollTop || s0 < element.maxScrollTop) {
    	bounceStart(v);
    } else {
    	v = e.velocityY;
        if (v > 1.5) v = 1.5;
        if (v < -1.5) v = -1.5;
        a = 0.0015 * ( v / Math.abs(v));
		t = v / a;
        s = s0 + t * v / 2;

        if (s > element.minScrollTop) {
    	    _s = element.minScrollTop - s0;
            _t = (v - Math.sqrt(-2 * a *_s + v * v)) / a;
            _v = v - a * _t;

	        anim.translate(element, 
	        	_t.toFixed(0) + 'ms', 'cubic-bezier(' + anim.genCubicBezier(-t, -t + _t) + ')', '0s', 
	        	element.transformOffset.x, element.minScrollTop,
	        	function() {
	        		bounceStart(_v)
	        	}
	        );
            
        } else if (s < element.maxScrollTop) {
            _s = element.maxScrollTop - s0;
            _t = (v + Math.sqrt(-2 * a * _s + v * v)) / a;
            _v = v - a * _t;

	        anim.translate(element, 
	        	_t.toFixed(0) + 'ms', 'cubic-bezier(' + anim.genCubicBezier(-t, -t + _t) + ')', '0s', 
	        	element.transformOffset.x, element.maxScrollTop,
	        	function() {
	        		bounceStart(_v)
	        	}
	        );
        } else {
	        anim.translate(element, 
	        	t.toFixed(0) + 'ms', 'cubic-bezier(' + anim.genCubicBezier(-t, 0) + ')', '0s', 
	        	element.transformOffset.x, s.toFixed(0),
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
			element.style.webkitTransition = '';
			fireEvent(element, 'scrollend');
		}
	}, 10);
}

var Scroll = {
	enable: function(el, options) {
		var parentElement = el.parentNode || el.offsetParent
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
	    parentElement.boundScrollElement = el;

		if (options) {
			el.bounceTop = options.bounceTop;
			el.bounceBottom = options.bounceBottom;
		} else {
			el.bounceTop = 0;
			el.bounceBottom = 0;
		}

		var x = anim.getTransformOffset(el).x,
			y = - el.bounceTop;

		el.style.webkitTransition = '';
		el.style.webkitTransform = anim.makeTranslateString(x, y);
	},

	disable: function(el) {
		var parentElement = el.parentNode || el.offsetParent, offset;

		if (parentElement.boundScrollElement === el) {
			offset = anim.getTransformOffset(el);
			element = parentElement.boundScrollElement = null;
			setTimeout(function() {
				el.style.webkitTransition = '';
				el.style.webkitTransform = anim.makeTranslateString(offset.x, offset.y);
			}, 50);
			
		}
	},

	getScrollHeight: function(el) {
		return el.getBoundingClientRect().height - (el.bounceTop||0) - (el.bounceBottom||0);
	},

    getScrollTop: function(el) {
    	var offset = anim.getTransformOffset(el);
		return -(offset.y + (el.bounceTop||0));
	},

    refresh: function(el) {
        el.style.height = 'auto';
        el.style.height = el.offsetHeight + 'px';
        el.offset = anim.getTransformOffset(el);
        el.minScrollTop = getMinScrollTop(el);
        el.maxScrollTop = getMaxScrollTop(el);
        this.scrollTo(el, -el.offset.y - el.bounceTop);
    },

    offset: function(el, child) {
    	var elRect = el.getBoundingClientRect(),
    		childRect = child.getBoundingClientRect(),
    		offsetRect = {
	        	top: childRect.top - ((el.bounceTop || 0) + elRect.top),
	        	left: childRect.left - elRect.left,
	        	right: elRect.right - childRect.right,
	        	width: childRect.width,
	        	height: childRect.height
	        };

	    offsetRect.bottom = offsetRect.top + childRect.height;
	    return offsetRect;
    },

    scrollTo: function(el, y) {
    	var x = anim.getTransformOffset(el).x,
    		y = -y - (el.bounceTop || 0);

    	y = touchBoundary(el, y);
		el.style.webkitTransition = '';
        el.style.webkitTransform = anim.makeTranslateString(x, y);
    },

    scollToElement: function(el, child) {
    	var offset = this.offset(el, child);
    	this.scrollTo(el, offset.top);
    },

    getViewHeight: function(el) {
    	return el.parentNode.getBoundingClientRect().height;
    },

    getBoundaryOffset: function(el) {
	    var y = anim.getTransformOffset(el).y;
	    return getBoundaryOffset(el, y);
    },

    stopBounce: function(el) {
    	stopBounce = true;

    	var offset = anim.getTransformOffset(el),
    		minScrollTop = getMinScrollTop(el),
    		maxScrollTop = getMaxScrollTop(el),
    		y = null
    		;

    	if (offset.y > minScrollTop + (el.bounceTop||0)) {
    		y = minScrollTop + (el.bounceTop||0);
    	} else if (offset.y < maxScrollTop - (el.bounceBottom||0)) {
    		y = maxScrollTop - (el.bounceBottom||0);
    	}

    	if (y != null) {
    		anim.translate(el,
    			'0.4s', 'ease-in-out', '0s',
    			offset.x, y);
    	}
    },

    resumeBounce: function(el) {
    	stopBounce = false;

    	var offset = anim.getTransformOffset(el),
    		minScrollTop = getMinScrollTop(el),
    		maxScrollTop = getMaxScrollTop(el),
    		y
    		;

    	if (offset.y > minScrollTop) {
    		y = minScrollTop;
    	} else if (offset < maxScrollTop){
    		y = maxScrollTop;
    	}

    	if (y != null) {
    		anim.translate(el,
    			'0.4s', 'ease-in-out', '0s',
    			offset.x, y);
    	}
    }
}

app.module.Scroll = Scroll;

})(window, window['app']||(window['app']={module:{},plugin:{}}));
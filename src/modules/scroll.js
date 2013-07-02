//@require gesture
//@require animation

(function(win, app, undef) {

var doc = win.document,
	docEl = doc.documentElement,
	anim = app.module.Animation,
	element, offset, minScrollTop, maxScrollTop,
	panFixRatio = 2,
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
	fireEvent(element, 'scrollstart');
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

	    if (!el.refresh) {
	    	el.getScrollHeight = function() {
	    		return this.getBoundingClientRect().height - (this.bounceTop||0) - (this.bounceBottom||0);
	    	}

		    el.getScrollTop = function() {
		    	var offset = anim.getTransformOffset(this);
	    		return -(offset.y + (this.bounceTop||0));
	    	}

		    el.refresh = function() {
		        this.style.height = 'auto';
		        this.style.height = this.offsetHeight + 'px';
		        offset = anim.getTransformOffset(this);
		        minScrollTop = getMinScrollTop(this);
		        maxScrollTop = getMaxScrollTop(this);
		        this.scrollTo( -offset.y - this.bounceTop);
		    }

		    el.offset = function(el) {
		    	var elRect = el.getBoundingClientRect(), 
		    		elementRect = this.getBoundingClientRect(),
		    		offsetRect = {
			        	top: elRect.top - (this.bounceTop + elementRect.top),
			        	bottom: elRect.top - (this.bounceTop + elementRect.top) + elRect.height,
			        	left: elRect.left - elementRect.left,
			        	right: elementRect.right - elRect.right,
			        	width: elRect.width,
			        	height: elRect.height
			        };

			    return offsetRect;
		    }

		    el.scrollTo = function(y) {
		    	var x = anim.getTransformOffset(this).x,
		    		y = -y - (this.bounceTop || 0);

		    	y = touchBoundary(y);
				this.style.webkitTransition = '';
		        this.style.webkitTransform = anim.makeTranslateString(x, y);
		    }

		    el.scollToElement = function(el) {
		    	var offset = this.offset(el);
		    	this.scrollTo(offset.top);
		    }

		    el.getBoundaryOffset = function() {
			    var y = anim.getTransformOffset(this).y;
			    return getBoundaryOffset(y);
		    }

		    el.getViewHeight = function() {
		    	return this.parentNode.getBoundingClientRect().height;
		    }

		    el.stopBounce = function() {
		    	stopBounce = true;

		    	var y = anim.getTransformOffset(this).y,
		    		minScrollTop = getMinScrollTop(this),
		    		maxScrollTop = getMaxScrollTop(this),
		    		_y
		    		;

		    	if (y > minScrollTop + (this.bounceTop||0)) {
		    		_y = minScrollTop + (this.bounceTop||0);
		    	} else if (y < maxScrollTop - (this.bounceBottom||0)) {
		    		_y = maxScrollTop - (this.bounceBottom||0);
		    	}

		    	if (_y != null) {
		    		anim.translate(this,
		    			'0.4s', 'ease-in-out', '0s',
		    			offset.x, _y);
		    	}
		    }

		    el.resumeBounce = function() {
		    	stopBounce = false;

		    	var y = anim.getTransformOffset(this).y,
		    		minScrollTop = getMinScrollTop(this),
		    		maxScrollTop = getMaxScrollTop(this),
		    		_y
		    		;

		    	if (y > minScrollTop) {
		    		_y = minScrollTop;
		    	} else if (y < maxScrollTop){
		    		_y = maxScrollTop;
		    	}

		    	if (_y != null) {
		    		anim.translate(this,
		    			'0.4s', 'ease-in-out', '0s',
		    			offset.x, _y);
		    	}
		    }
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
	}
}

app.module.Scroll = Scroll;

})(window, window['app']||(window['app']={module:{},plugin:{}}));
(function(win, app, undef) {

var doc = win.document,
	docEl = doc.documentElement,
	anim = app.module.Animation,
	prevented = false
	;

function getMaxScrollTop(el) {
    var parentStyle = getComputedStyle(el.parentNode)
        ;

    var maxTop = 0 - el.offsetHeight + parseInt(parentStyle.height) - 
                parseInt(parentStyle.paddingTop) - 
                parseInt(parentStyle.paddingBottom)/* - 
                parseInt(parentStyle.marginTop) - 
                parseInt(parentStyle.marginBottom)*/;

    if (maxTop > 0) maxTop = 0;
    
    return maxTop;
}


var Scroll = {
	enable: function(element) {
		var parentElement = element.parentNode || element.offsetParent,
			offset = anim.getTransformOffset(element),
			maxScrollTop = getMaxScrollTop(element),
			scroll = Object.create(null),
			cancelScrollEnd = false
			;

		function touchstartHandler(e) {
			element.style.webkitTransition = '';
			element.style.webkitTransform = getComputedStyle(element).webkitTransform;
		}

		function panstartHandler(e) {
			offset = anim.getTransformOffset(element);
		}

		function panHandler(e) {
	        var y = offset.y + e.displacementY
	            ;
	        
	        if(y > 0) {
	        	y /= 2;
	        } else if(y < maxScrollTop) {
	        	y += (maxScrollTop - y) / 2;
	        }

	        element.style.webkitTransition = '';
	        element.style.webkitTransform = anim.makeTranslateString(offset.x, y);
		}

		function panendHandler(e) {
	        var y = anim.getTransformOffset(element).y,
	            _y = null
	            ;

	        if(y > 0) {
	            _y = 0;
	        } else if (y < maxScrollTop){
	            _y = maxScrollTop;
	        }

	        if (_y != null) {
	            anim.doTransition(element, 
	            	'0.4s', 'ease-in-out', '0s', 
	            	offset.x, _y,
	            	scrollEnd
	            );
	        } else {
	            scrollEnd();
	        }
		}

		function flickHandler(e) {
	        var s0 = anim.getTransformOffset(element).y,
	            v, a, t, s,
	            _v, _s, _t
	            ;

	        cancelScrollEnd = true;

	        function bounceStart() {
		        var s0 = anim.getTransformOffset(element).y,
		        	v = _v,
		        	a = 0.008 * ( v / Math.abs(v));
		        	t = v / a;
		        	s = s0 + t * v / 2
		        	;

		        anim.doTransition(element, 
		        	t.toFixed(0) + 'ms', 'cubic-bezier(' + anim.genCubicBezier(-t, 0) + ')', '0s', 
		        	offset.x, s.toFixed(0),
		        	bounceEnd
		        );
	        }

	        function bounceEnd() {
	        	var y = anim.getTransformOffset(element).y,
	        		_y;

	        	if (y > 0) {
	        		_y = 0;
	        	} else if (y < maxScrollTop) {
		            _y = maxScrollTop;
	        	}

	        	if (_y != null) {
		            anim.doTransition(element, 
		            	'0.4s', 'ease-in-out', '0s', 
		            	offset.x, _y,
		            	scrollEnd
		            );
		        } else {
		        	scrollEnd();
		        }
	        }

	        console.log(s0, maxScrollTop);
	        if(s0 > 0 || s0 < maxScrollTop) {
	        	v = e.velocityY;
		        a = 0.08 * (v / Math.abs(v));
		        t = v / a;
		        s = s0 + t * v / 2;

		        anim.doTransition(element, 
		        	t.toFixed(0) + 'ms', 'cubic-bezier(' + anim.genCubicBezier(-t, 0) + ')', '0s', 
		        	offset.x, s.toFixed(0),
		        	bounceEnd
		        );
	        } else {
	        	v = e.velocityY;
		        if (v > 1.5) v = 1.5;
		        if (v < -1.5) v = -1.5;
		        a = 0.0015 * ( v / Math.abs(v));
				t = v / a;
		        s = s0 + t * v / 2;

		        if (s > 0) {
		    	    _s = 0 - s0;
		            _t = (v - Math.sqrt(-2 * a *_s + v * v)) / a;
		            _v = v - a * _t;

			        anim.doTransition(element, 
			        	_t.toFixed(0) + 'ms', 'cubic-bezier(' + anim.genCubicBezier(-t, -t + _t) + ')', '0s', 
			        	offset.x, 0,
			        	bounceStart
			        );
		            
		        } else if (s < maxScrollTop) {
		            _s = maxScrollTop - s0;
		            _t = (v + Math.sqrt(-2 * a * _s + v * v)) / a;
		            _v = v - a * _t;

			        anim.doTransition(element, 
			        	_t.toFixed(0) + 'ms', 'cubic-bezier(' + anim.genCubicBezier(-t, -t + _t) + ')', '0s', 
			        	offset.x, maxScrollTop,
			        	bounceStart
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
					offset = anim.getTransformOffset(element);

					var event = doc.createEvent('HTMLEvents');
					event.initEvent('scrollend', false, true);
				    element.dispatchEvent(event);
				}
			}, 10);
		}

	    if (!prevented) {
	    	prevented = true;
	    	docEl.addEventListener('touchmove', function(e) {
	    		e.preventDefault();
	    		return false;
	    	}, false)
	    }

	    if (!parentElement.boundScrollEvent) {
	    	parentElement.boundScrollEvent = true;
			parentElement.addEventListener('touchstart', touchstartHandler, false);
		    parentElement.addEventListener('panstart', panstartHandler, false);
		    parentElement.addEventListener('pan', panHandler, false);
		    parentElement.addEventListener('panend', panendHandler, false);
		    parentElement.addEventListener('flick', flickHandler, false);
	    }

	    Object.defineProperty(element, 'scrollHeight', {
	    	get : function() {
	    		return element.scrollHeight;
	    	}
	    });

	    Object.defineProperty(element, 'scrollTop', {
	    	get : function() {
	    		return offset.y;
	    	},

	    	set : function(y) {
		        y = -y;

		        if (y < maxScrollTop) {
		            y = maxScrollTop;
		        } else if (y > 0) {
		            y = 0;
		        }
				element.style.webkitTransition = '';
		        element.style.webkitTransform = anim.makeTranslateString(offset.x, y);
	    	}
	    });

	    element.refresh = function() {
	        element.style.height = 'auto';
	        element.style.height = element.offsetHeight + 'px';
	        maxScrollTop = getMaxScrollTop(element);
	    }

	    element.scrollTo = function(y) {

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
define(function(require, exports, module) {

require('reset');

var win = window,
    doc = win.document,
    navigator = win.navigator,

    Class = require('class'),
    Gesture = require('./gesture'),
    transform = require('./transform'),
    prevented = false
    ;

function getMaxScrollTop(el) {
    var parentEl = el.parentNode,
        parentStyle = getComputedStyle(parentEl)
        ;

    var maxTop = 0 - el.scrollHeight + parentEl.offsetHeight - 
                parseInt(parentStyle.paddingTop) - 
                parseInt(parentStyle.paddingBottom)/* - 
                parseInt(parentStyle.marginTop) - 
                parseInt(parentStyle.marginBottom)*/;

    if (maxTop > 0) maxTop = 0;
    
    return maxTop;
}

var Scroll = Class.create({
    initialize : function(element) {
        var that = this
            ;

        that._wrap = element;
        that._scroller = element.children[0];
        that._gesture = new Gesture(that._scroller);
        that._originalY = null;
        that._scrollTop = null;
        that._scrollHeight = null;
        that._refreshed = false;

        that._preventBodyTouch = that._preventBodyTouch.bind(that);
        that._onTouchStart = that._onTouchStart.bind(that);
        that._onPanStart = that._onPanStart.bind(that);
        that._onPan = that._onPan.bind(that);
        that._onPanEnd = that._onPanEnd.bind(that);
        that._onFlick = that._onFlick.bind(that);
    },

    enable : function() {
        var that = this,
            scroller = that._scroller
            ;

        that._gesture.enable();

        scroller.addEventListener('touchstart', that._onTouchStart, false);
        scroller.addEventListener('panstart', that._onPanStart, false);
        scroller.addEventListener('pan', that._onPan, false);
        scroller.addEventListener('panend', that._onPanEnd, false);
        scroller.addEventListener('flick', that._onFlick, false);

        if (!prevented) {
            prevented = true;
            doc.body.addEventListener('touchmove', that._preventBodyTouch, false);
        }
    },

    disable : function() {
        var that = this,
            scroller = that._scroller
            ;

        that._gesture.disable();

        scroller.removeEventListener('touchstart', that._onTouchStart, false);
        scroller.removeEventListener('panstart', that._onPanStart, false);
        scroller.removeEventListener('pan', that._onPan, false);
        scroller.removeEventListener('panend', that._onPanEnd, false);
        scroller.removeEventListener('flick', that._onFlick, false);

        if (prevented) {
            prevented = false;
            doc.body.removeEventListener('touchmove', that._preventBodyTouch, false);
        }
    },

    refresh : function() {
        this._refreshed = true;
    },

    _preventBodyTouch : function(e) {
        e.preventDefault();
        return false;
    },

    _onTouchStart : function(e) {
        var that = this,
            scroller = that._scroller
            ;

        scroller.style.webkitTransition = 'none';
        scroller.style.webkitTransform = getComputedStyle(scroller).webkitTransform;

        if (that._refreshed) {
            that._refreshed = false;
            scroller.style.height = 'auto';
            scroller.style.height = that._scrollHeight = scroller.offsetHeight + 'px';
        }
    },

    _onPanStart : function(e) {
        var that = this,
            scroller = that._scroller
            ;

        that._originalY = transform.getY(scroller);
    },

    _onPan : function(e) {
        var that = this,
            scroller = that._scroller,
            maxScrollTop = getMaxScrollTop(scroller),
            originalY = that._originalY,
            scrollTop = that._scrollTop = originalY + e.displacementY
            ;

        
        if(scrollTop > 0) {
            scroller.style.webkitTransform = transform.getTranslate(0, scrollTop / 2);
        } else if(scrollTop < maxScrollTop) {
            scroller.style.webkitTransform = transform.getTranslate(0, (maxScrollTop - scrollTop) / 2 + scrollTop);
        } else {
            scroller.style.webkitTransform = transform.getTranslate(0, scrollTop);
        }
    },

    _onPanEnd : function(e) {
        var that = this,
            scroller = that._scroller,
            scrollTop = that._scrollTop,
            maxScrollTop = getMaxScrollTop(scroller),
            translateY = null
            ;

        if(scrollTop > 0) {
            scrollTop = translateY = 0;
        }

        if(scrollTop < maxScrollTop) {
            scrollTop = translateY = maxScrollTop;
        }

        if (translateY != null) {
            transform.start(scroller, '0.4s', 'ease-out', '0s', 0, translateY);
        }
    },

    _onFlick : function(e) {
        var that = this,
            scroller = that._scroller,
            scrollTop = that._scrollTop,
            maxScrollTop = getMaxScrollTop(scroller)
            ;

        if(scrollTop < maxScrollTop || scrollTop > 0)
            return;

        var s0 = transform.getY(scroller), v0 = e.valocityY;

        if(v0 > 1.5) v0 = 1.5;
        if(v0 < -1.5) v0 = -1.5;
        
        var a = 0.0015 * (v0 / Math.abs(v0)),
            t = v0 / a,
            s = s0 + t * v0 / 2
            ;

        if( s > 0 || s < maxScrollTop) {
            var sign = s > 0 ? 1 : -1,
                edge = s > 0 ? 0 : maxScrollTop
                ;

            s = (s - edge) / 2 + edge;
            t = (sign * Math.sqrt(2*a*(s-s0)+v0*v0)-v0)/a;
            v = v0 - a * t;
            
            transform.start(
                scroller, 
                t.toFixed(0) + 'ms', 'cubic-bezier(' + transform.getBezier(-v0/a, -v0/a+t) + ')', '0s',
                0, s.toFixed(0), 
                function() {
                    v0 = v;
                    s0 = s;
                    a = 0.0045 * (v0 / Math.abs(v0));
                    t = -v0 / a;
                    s = edge;

                    transform.start(
                        scroller,
                        (0-t).toFixed(0) + 'ms', 'cubic-bezier(' + transform.getBezier(-t, 0) + ')', '0s',
                        0, s.toFixed(0)
                    );
                }
            );
        } else {
            transform.start(
                scroller,
                t.toFixed(0) + 'ms', 'cubic-bezier(' + transform.getBezier(-t, 0) + ')', '0s',
                0, s.toFixed(0)
            );
        }
    }
});

return Scroll;
});

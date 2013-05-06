(function(win, app, undef) {

var util = app.util,
    Gesture = app._module.gesture,
    Transform = app._module.transform,
    prevented = false,
    doc = win.document
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

function Scroll(element) {
    var that = this
        ;

    that._wrap = element;
    that._scroller = element.children[0];
    that._gesture = new Gesture(that._scroller);
    that._originalX = null;
    that._originalY = null;
    that._currentY = null;
    that._scrollHeight = null;
    that._scrollEndHandler = null;
    that._scrollEndCancel = false;
    that._refreshed = false;

    that._preventBodyTouch = util.bindContext(that._preventBodyTouch, that);
    that._onTouchStart = util.bindContext(that._onTouchStart, that);
    that._onPanStart = util.bindContext(that._onPanStart, that);
    that._onPan = util.bindContext(that._onPan, that);
    that._onPanEnd = util.bindContext(that._onPanEnd, that);
    that._onFlick = util.bindContext(that._onFlick, that);
    that._onScrollEnd = util.bindContext(that._onScrollEnd, that);
}

var proto = {
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
        this._scroller.style.height = 'auto';
        this._refreshed = true;
    },

    getHeight : function() {
        return this._scroller.offsetHeight;
    },

    getTop : function() {
        return -Transform.getY(this._scroller);
    },

    to : function(top) {
        var that = this,
            scroller = that._scroller,
            left = Transform.getX(scroller),
            maxScrollTop = getMaxScrollTop(scroller)
            ;

        top = -top;

        if (top < maxScrollTop) {
            top = maxScrollTop;
        } else if (top > 0) {
            top = 0;
        }

        scroller.style.webkitTransform = Transform.getTranslate(left, top);
        that._onScrollEnd();
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
            that._scrollHeight = scroller.offsetHeight;
            scroller.style.height = that._scrollHeight + 'px';
        }
    },

    _onPanStart : function(e) {
        var that = this,
            scroller = that._scroller
            ;

        that._originalX = Transform.getX(scroller);
        that._originalY = Transform.getY(scroller);
    },

    _onPan : function(e) {
        var that = this,
            scroller = that._scroller,
            maxScrollTop = getMaxScrollTop(scroller),
            originalX = that._originalX,
            originalY = that._originalY,
            currentY = that._currentY = originalY + e.displacementY
            ;

        
        if(currentY > 0) {
            scroller.style.webkitTransform = Transform.getTranslate(originalX, currentY / 2);
        } else if(currentY < maxScrollTop) {
            scroller.style.webkitTransform = Transform.getTranslate(originalX, (maxScrollTop - currentY) / 2 + currentY);
        } else {
            scroller.style.webkitTransform = Transform.getTranslate(originalX, currentY);
        }
    },

    _onPanEnd : function(e) {
        var that = this,
            scroller = that._scroller,
            originalX = that._originalX,
            currentY = that._currentY,
            maxScrollTop = getMaxScrollTop(scroller),
            translateY = null
            ;

        if(currentY > 0) {
            translateY = 0;
        }

        if(currentY < maxScrollTop) {
            translateY = maxScrollTop;
        }

        if (translateY != null) {
            Transform.start(scroller, '0.4s', 'ease-out', '0s', originalX, translateY, that._onScrollEnd);
        } else {
            that._onScrollEnd();
        }
    },

    _onFlick : function(e) {
        var that = this,
            scroller = that._scroller,
            originalX = that._originalX,
            currentY = that._currentY,
            maxScrollTop = getMaxScrollTop(scroller)
            ;

        that._scrollEndCancel = true;

        if(currentY < maxScrollTop || currentY > 0)
            return;

        var s0 = Transform.getY(scroller), v0 = e.valocityY;

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
            
            Transform.start(
                scroller, 
                t.toFixed(0) + 'ms', 'cubic-bezier(' + Transform.getBezier(-v0/a, -v0/a+t) + ')', '0s',
                originalX, s.toFixed(0), 
                function() {
                    v0 = v;
                    s0 = s;
                    a = 0.0045 * (v0 / Math.abs(v0));
                    t = -v0 / a;
                    s = edge;

                    Transform.start(
                        scroller,
                        (0-t).toFixed(0) + 'ms', 'cubic-bezier(' + Transform.getBezier(-t, 0) + ')', '0s',
                        originalX, s.toFixed(0),
                        that._onScrollEnd
                    );
                }
            );
        } else {
            Transform.start(
                scroller,
                t.toFixed(0) + 'ms', 'cubic-bezier(' + Transform.getBezier(-t, 0) + ')', '0s',
                originalX, s.toFixed(0),
                that._onScrollEnd
            );
        }
    },

    _onScrollEnd : function() {
        var that = this
            ;

        that._scrollEndCancel = false;
        setTimeout(function() {
            if (!that._scrollEndCancel) {
                that._scrollEndHandler && that._scrollEndHandler();
                
            }
        }, 10);
    }
}
util.extend(Scroll.prototype, proto);

app._module.scroll = Scroll;

})(window, window['app']||(window['app']={}));

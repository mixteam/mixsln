define(function(require, exports, module) {

require('reset');

var win = window,
    doc = win.document,
    Class = require('class'),
    gestrue = require('./gesture'),
    MATRIX3D_REG = /^matrix3d\(\d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, ([\d-]+), ([-\d]+), [\d-]+, \d+\)/,
    MATRIX_REG = /^matrix\(\d+, \d+, \d+, \d+, ([-\d]+), ([-\d]+)\)$/,
    prevented = false
    ;

function quadratic2cubicBezier(a, b) {
    return [[(a / 3 + (a + b) / 3 - a) / (b - a), (a * a / 3 + a * b * 2 / 3 - a * a) / (b * b - a * a)],
        [(b / 3 + (a + b) / 3 - a) / (b - a), (b * b / 3 + a * b * 2 / 3 - a * a) / (b * b - a * a)]];
}

function waitTransition(element, propertyName, callback) {
    function eventHandler(e){
        if(e.srcElement !== element || e.propertyName != propertyName) {
            return;
        }
        callback();
        element.removeEventListener('webkitTransitionEnd', eventHandler, false);
    }

    element.addEventListener('webkitTransitionEnd', eventHandler, false);
}

function getMaxScrollTop(element) {
    return 0 - element.scrollHeight + element.parentNode.offsetHeight;
}

function getTransformY(el) {
    var transform, matchs;

    transform = getComputedStyle(el).webkitTransform;

    if (transform !== 'none') {
        if((matchs = transform.match(/^matrix3d\(\d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, ([\d-]+), ([-\d]+), [\d-]+, \d+\)/))) {
            return parseInt(matchs[2]) || 0;
        } else if((matchs = transform.match(/^matrix\(\d+, \d+, \d+, \d+, ([-\d]+), ([-\d]+)\)$/))) {
            return parseInt(matchs[2])||0;
        }
    }

    return 0;
}

var Scroll = Class.create({
    initialize : function(element) {
        var that = this
            ;

        that._el = element;
        that._gesture = gestrue(element);
        that._originalY = null;
        that._currentY = null;

        that._onTouchStart = that._onTouchStart.bind(that);
        that._onPanStart = that._onPanStart.bind(that);
        that._onPan = that._onPan.bind(that);
        that._onPanEnd = that._onPanEnd.bind(that);
        that._onFlick = that._onFlick.bind(that);

        element.addEventListener('touchstart', that._onTouchStart, false);
        element.addEventListener('panstart', that._onPanStart, false);
        element.addEventListener('pan', that._onPan, false);
        element.addEventListener('panend', that._onPanEnd, false);
        element.addEventListener('flick', that._onFlick, false);

        if (!prevented) {
            prevented = true;
            doc.body.addEventListener('touchmove',function(e){
                e.preventDefault();
            }, false);
        }
    },

    _onTouchStart : function(e) {
        var that = this,
            el = that._el
            ;

        el.style.webkitTransition = 'none';
        el.style.webkitTransform = getComputedStyle(el).webkitTransform;
    },

    _onPanStart : function(e) {
        var that = this,
            el = that._el
            ;

        that._originalY = getTransformY(el);
    },

    _onPan : function(e) {
        var that = this,
            el = that._el,
            maxScrollTop = getMaxScrollTop(el),
            originalY = that._originalY,
            currentY
            ;

        currentY = that._currentY = originalY + e.displacementY;
        
        if(currentY > 0) {
            el.style.webkitTransform = 'translate3d(0,' + (currentY / 2) + 'px,0)';
        } else if(currentY < maxScrollTop) {
            el.style.webkitTransform = 'translate3d(0,' + ((maxScrollTop - currentY) / 2 + currentY) + 'px,0)';
        } else {
            el.style.webkitTransform = 'translate3d(0,' + currentY + 'px,0)';
        }
    },

    _onPanEnd : function(e) {
        var that = this,
            el = that._el,
            currentY = that._currentY,
            maxScrollTop = getMaxScrollTop(el),
            translateY = null
            ;

        if(currentY > 0) {
            translateY = 0;
        }

        if(currentY < maxScrollTop) {
            translateY = maxScrollTop;
        }

        if (translateY != null) {
            el.style.webkitTransition = '-webkit-transform 0.4s ease-out 0s';
            el.style.webkitTransform = 'translate3d(0,' + translateY + ',0)';
            waitTransition(el, '-webkit-transform', function(){
                el.style.webkitTransition = 'none';
            });
        }
    },

    _onFlick : function(e) {
        var that = this,
            el = that._el,
            currentY = that._currentY,
            maxScrollTop = getMaxScrollTop(el)
            ;

        if(currentY < maxScrollTop || currentY > 0)
            return;

        var s0 = getTransformY(el), v0 = e.valocityY;

        if(v0 > 1.5) v0 = 1.5;
        if(v0 < -1.5) v0 = -1.5;
        
        var a = 0.0015 * (v0 / Math.abs(v0)),
            t = v0/a,
            s = s0 + t*v0/2
            ;

        if( s > 0 || s < maxScrollTop) {
            var sign = s > 0 ? 1 : -1,
                edge = s > 0 ? 0 : maxScrollTop
                ;

            s = edge
            t = (sign * Math.sqrt(2*a*(s-s0)+v0*v0)-v0)/a;
            v = v0 - a * t;
            
            el.style.webkitTransition = '-webkit-transform ' + t.toFixed(0) + 'ms cubic-bezier('+quadratic2cubicBezier(-v0/a,-v0/a+t)+') 0s';
            el.style.webkitTransform = 'translate3d(0,' + s.toFixed(0) + 'px,0)';
            waitTransition(el, '-webkit-transform', function(){
                v0 = v;
                s0 = s;
                a = 0.0045*(v0 / Math.abs(v0));
                t = v0/a;
                s = s0 + t*v0/2;

                el.style.webkitTransition = '-webkit-transform ' + t.toFixed(0) + 'ms cubic-bezier('+quadratic2cubicBezier(-t,0)+') 0s';
                el.style.webkitTransform = 'translate3d(0,' + s.toFixed(0) + 'px,0)';
                waitTransition(el, '-webkit-transform',function(){
                    el.style.webkitTransition = '-webkit-transform 0.4s ease-out 0s';
                    el.style.webkitTransform = 'translate3d(0,' + edge + 'px,0)';
                    waitTransition(el, '-webkit-transform', function(){
                        el.style.webkitTransition = 'none';
                    });
                });
            });
        } else {
            el.style.webkitTransition = '-webkit-transform ' + t.toFixed(0) + 'ms cubic-bezier('+ quadratic2cubicBezier(-t,0) + ') 0s';
            el.style.webkitTransform = 'translate3d(0,' + s.toFixed(0) + 'px,0)';
        }
    }
});

return function(element) {
    return new Scroll(element);
}

});

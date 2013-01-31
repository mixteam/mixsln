define(function(require, exports, module) {

require('reset');

var win = window,
    doc = win.document,
    navigator = win.navigator,

    Class = require('class'),
    gestrue = require('./gesture'),
    MATRIX3D_REG = /^matrix3d\(\d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, ([\d-]+), ([-\d]+), [\d-]+, \d+\)/,
    MATRIX_REG = /^matrix\(\d+, \d+, \d+, \d+, ([-\d]+), ([-\d]+)\)$/,

    appVersion = navigator.appVersion,
    isAndroid = (/android/gi).test(appVersion),
    isIOS = (/iphone|ipad/gi).test(appVersion),
    has3d = 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix(),
    prevented = false
    ;

function quadratic2cubicBezier(a, b) {
    return [[(a / 3 + (a + b) / 3 - a) / (b - a), (a * a / 3 + a * b * 2 / 3 - a * a) / (b * b - a * a)],
        [(b / 3 + (a + b) / 3 - a) / (b - a), (b * b / 3 + a * b * 2 / 3 - a * a) / (b * b - a * a)]];
}

function getMaxScrollTop(el) {
    var parentEl = el.parentNode,
        parentStyle = getComputedStyle(parentEl)
        ;


    return 0 - el.scrollHeight + parentEl.offsetHeight - 
                parseInt(parentStyle.paddingTop) - 
                parseInt(parentStyle.paddingBottom) - 
                parseInt(parentStyle.marginTop) - 
                parseInt(parentStyle.marginBottom);
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

function getTranslate(x, y) {
    if (false) {
        return 'translate3d(' + x + 'px, ' + y + 'px, 0)';
    } else {
        return 'translate(' + x + 'px, ' + y + 'px)';
    }
}

function waitTransition(el, propertyName, callback) {
    var parentEl = el.parentNode;

    function eventHandler(e){
        if(e.srcElement !== el || e.propertyName != propertyName) {
            return;
        }

        // el.style.webkitBackfaceVisibility = 'initial';
        // el.style.webkitTransformStyle = 'flat';
        el.style.webkitTransition = 'none';
        el.removeEventListener('webkitTransitionEnd', eventHandler, false);

        callback && callback();
    }

    el.addEventListener('webkitTransitionEnd', eventHandler, false);
}

function doTransition(el, time, timeFunction, delay, x, y, callback) {
    var propertyName = '-webkit-transform',
        parentEl = el.parentNode;

    // el.style.webkitBackfaceVisibility = 'hidden';
    // el.style.webkitTransformStyle = 'preserve-3d';
    el.style.webkitTransition = [propertyName, time, timeFunction, delay].join(' ');
    el.style.webkitTransform = getTranslate(x, y);

    waitTransition(el, propertyName, callback);
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

        element.style.webkitBackfaceVisibility = 'hidden';
        element.style.webkitTransformStyle = 'preserve-3d';
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

    getElement : function() {
        return that._el;
    },

    _onTouchStart : function(e) {
        var that = this,
            el = that._el
            ;

        el.style.webkitTransition = 'none';
        el.style.webkitTransform = getComputedStyle(el).webkitTransform;
        el.style.height = 'auto';
        el.style.height = el.offsetHeight + 'px';
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
            el.style.webkitTransform = getTranslate(0, currentY / 2);
        } else if(currentY < maxScrollTop) {
            el.style.webkitTransform = getTranslate(0, (maxScrollTop - currentY) / 2 + currentY);
        } else {
            el.style.webkitTransform = getTranslate(0, currentY);
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
            doTransition(el, '0.4s', 'ease-out', '0s', 0, translateY);

            // el.style.webkitTransition = '-webkit-transform 0.4s ease-out 0s';
            // el.style.webkitTransform = getTranslate(0, translateY);
            // waitTransition(el, '-webkit-transform');
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
            
            doTransition(
                el, 
                t.toFixed(0) + 'ms', 'cubic-bezier(' + quadratic2cubicBezier(-v0/a, -v0/a+t) + ')', '0s',
                0, s.toFixed(0), 
                function() {
                    v0 = v;
                    s0 = s;
                    a = 0.0045*(v0 / Math.abs(v0));
                    t = v0/a;
                    s = s0 + t*v0/2;

                    doTransition(
                        el,
                        t.toFixed(0) + 'ms', 'cubic-bezier(' + quadratic2cubicBezier(-t, 0) + ')', '0s',
                        0, s.toFixed(0),
                        function() {
                            doTransition(el, '0.4s', 'ease-out', '0s', 0, edge);
                        }
                    );
                }
            );

            // el.style.webkitTransition = '-webkit-transform ' + t.toFixed(0) + 'ms cubic-bezier(' + quadratic2cubicBezier(-v0/a, -v0/a+t) + ') 0s';
            // el.style.webkitTransform = getTranslate(0, s.toFixed(0));
            // waitTransition(el, '-webkit-transform', function(){
            //     v0 = v;
            //     s0 = s;
            //     a = 0.0045*(v0 / Math.abs(v0));
            //     t = v0/a;
            //     s = s0 + t*v0/2;

            //     el.style.webkitTransition = '-webkit-transform ' + t.toFixed(0) + 'ms cubic-bezier(' + quadratic2cubicBezier(-t, 0) + ') 0s';
            //     el.style.webkitTransform = getTranslate(0, s.toFixed(0));
            //     waitTransition(el, '-webkit-transform', function(){
            //         el.style.webkitTransition = '-webkit-transform 0.4s ease-out 0s';
            //         el.style.webkitTransform = getTranslate(0, edge);
            //         waitTransition(el, '-webkit-transform', function(){
            //             el.style.webkitTransition = 'none';
            //         });
            //     });
            // });
        } else {
            doTransition(
                el,
                t.toFixed(0) + 'ms', 'cubic-bezier(' + quadratic2cubicBezier(-t, 0) + ')', '0s',
                0, s.toFixed(0)
            );
            // el.style.webkitTransition = '-webkit-transform ' + t.toFixed(0) + 'ms cubic-bezier(' + quadratic2cubicBezier(-t, 0) + ') 0s';
            // el.style.webkitTransform = getTranslate(0, s.toFixed(0));
        }
    }
});

return function(element) {
    return new Scroll(element);
}

});

(function(win, app, undef) {


function Animation() {

}

var animationProto = {
    doTransition: function(el, time, timeFunction, delay, x, y, callback) {},
    getTranslate: function(x, y) {},
    getBezier: function(a, b) {},
    getTransform: function(el) {}

}

app.module.Animation = Animation;

})(window, window['app']||(window['app']={module:{},plugin:{}}));
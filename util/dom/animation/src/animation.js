//     Zepto.js
//     (c) 2010-2012 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

define(function(require, exports, module) {

var Selector = require('selector')

//CSS3
;(function($){
    var prefix = '', eventPrefix, endEventName, endAnimationName,
        vendors = { Webkit: 'webkit', Moz: '', O: 'o', ms: 'MS' },
        document = window.document, testEl = document.createElement('div'),
        supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
        clearProperties = {}

    function downcase(str) { return str.toLowerCase() }
    function normalizeEvent(name) { return eventPrefix ? eventPrefix + name : downcase(name) }

    $.each(vendors, function(vendor, event){
        if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
            prefix = '-' + downcase(vendor) + '-'
            eventPrefix = event
            return false
        }
    })

    clearProperties[prefix + 'transition-property'] =
        clearProperties[prefix + 'transition-duration'] =
            clearProperties[prefix + 'transition-timing-function'] =
                clearProperties[prefix + 'animation-name'] =
                    clearProperties[prefix + 'animation-duration'] = ''

    $.fx = {
        off: (eventPrefix === undefined && testEl.style.transitionProperty === undefined),
        cssPrefix: prefix,
        transitionEnd: normalizeEvent('TransitionEnd'),
        animationEnd: normalizeEvent('AnimationEnd')
    }

    $.fn.animate = function(properties, duration, ease, callback){
        if ($.isObject(duration))
            ease = duration.easing, callback = duration.complete, duration = duration.duration
        if (duration) duration = duration / 1000
        return this.anim(properties, duration, ease, callback)
    }

    $.fn.anim = function(properties, duration, ease, callback){
        var transforms, cssProperties = {}, key, that = this, wrappedCallback, endEvent = $.fx.transitionEnd
        if (duration === undefined) duration = 0.4
        if ($.fx.off) duration = 0

        if (typeof properties == 'string') {
            // keyframe animation
            cssProperties[prefix + 'animation-name'] = properties
            cssProperties[prefix + 'animation-duration'] = duration + 's'
            endEvent = $.fx.animationEnd
        } else {
            // CSS transitions
            for (key in properties)
                if (supportedTransforms.test(key)) {
                    transforms || (transforms = [])
                    transforms.push(key + '(' + properties[key] + ')')
                }
                else cssProperties[key] = properties[key]

            if (transforms) cssProperties[prefix + 'transform'] = transforms.join(' ')
            if (!$.fx.off && typeof properties === 'object') {
                cssProperties[prefix + 'transition-property'] = Object.keys(properties).join(', ')
                cssProperties[prefix + 'transition-duration'] = duration + 's'
                cssProperties[prefix + 'transition-timing-function'] = (ease || 'linear')
            }
        }

        wrappedCallback = function(event){
            if (typeof event !== 'undefined') {
                if (event.target !== event.currentTarget) return // makes sure the event didn't bubble from "below"
                $(event.target).unbind(endEvent, arguments.callee)
            }
            $(this).css(clearProperties)
            callback && callback.call(this)
        }
        if (duration > 0) this.bind(endEvent, wrappedCallback)

        setTimeout(function() {
            that.css(cssProperties)
            if (duration <= 0) setTimeout(function() {
                that.each(function(){ wrappedCallback.call(this) })
            }, 0)
        }, 0)

        return this
    }

    testEl = null
})(Selector)

//normal animation
;(function($){
    var document = window.document, docElem = document.documentElement,
        origShow = $.fn.show, origHide = $.fn.hide, origToggle = $.fn.toggle,
        speeds = { _default: 400, fast: 200, slow: 600 }

    function translateSpeed(speed) {
        return typeof speed == 'number' ? speed : (speeds[speed] || speeds._default)
    }

    function anim(el, speed, opacity, scale, callback) {
        if (typeof speed == 'function' && !callback) callback = speed, speed = undefined
        var props = { opacity: opacity }
        if (scale) {
            props.scale = scale
            el.css($.fx.cssPrefix + 'transform-origin', '0 0')
        }
        return el.anim(props, translateSpeed(speed) / 1000, null, callback)
    }

    function hide(el, speed, scale, callback) {
        return anim(el, speed, 0, scale, function(){
            origHide.call($(this))
            callback && callback.call(this)
        })
    }

    $.fn.show = function(speed, callback) {
        origShow.call(this)
        if (speed === undefined) speed = 0
        else this.css('opacity', 0)
        return anim(this, speed, 1, '1,1', callback)
    }

    $.fn.hide = function(speed, callback) {
        if (speed === undefined) return origHide.call(this)
        else return hide(this, speed, '0,0', callback)
    }

    $.fn.toggle = function(speed, callback) {
        if (speed === undefined || typeof speed == 'boolean') return origToggle.call(this, speed)
        else return this[this.css('display') == 'none' ? 'show' : 'hide'](speed, callback)
    }

    $.fn.fadeTo = function(speed, opacity, callback) {
        return anim(this, speed, opacity, null, callback)
    }

    $.fn.fadeIn = function(speed, callback) {
        var target = this.css('opacity')
        if (target > 0) this.css('opacity', 0)
        else target = 1
        return origShow.call(this).fadeTo(speed, target, callback)
    }

    $.fn.fadeOut = function(speed, callback) {
        return hide(this, speed, null, callback)
    }

    $.fn.fadeToggle = function(speed, callback) {
        var hidden = this.css('opacity') == 0 || this.css('display') == 'none'
        return this[hidden ? 'fadeIn' : 'fadeOut'](speed, callback)
    }

    //there is a bug in raw zepto.js here.
    $.extend($.fn, {
        speeds: speeds
    })

})(Selector)

});
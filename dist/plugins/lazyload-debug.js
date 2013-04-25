(function(win, app) {
    var doc = win.document, navigator = win.navigator, appVersion = navigator.appVersion, isAndroid = /android/gi.test(appVersion), isIOS = /iphone|ipad/gi.test(appVersion), scroll;
    function getScrollTop() {
        if (scroll) {
            return scroll.fn.getScrollTop();
        } else {
            return doc.body.scrollTop;
        }
    }
    function getScrollHeight() {
        if (scroll) {
            return scroll.fn.getScrollHeight();
        } else {
            return doc.body.scrollHeight;
        }
    }
    function getViewHeight() {
        if (scroll) {
            return scroll.offsetHeight;
        } else {
            return doc.body.clientHeight;
        }
    }
    app.plugin.lazyload = {
        _options: null,
        _startScrollTime: 0,
        _endScrollTime: 0,
        _scrollFlickTime: 200,
        _getParent: function(node) {
            return node.offsetParent || node.parentNode;
        },
        _getOffset: function(img) {
            var content = app.component.getActiveContent(), cStyle = getComputedStyle(img), offsetHeight = parseFloat(img.getAttribute("height") || img.offsetHeight || cStyle.height), offsetParent, offsetTop = parseFloat(img.offsetTop), offsetContent = 0;
            if (!scroll) {
                offsetParent = this._getParent(content);
                while (offsetParent && offsetParent != doc.body) {
                    offsetContent += parseFloat(offsetParent.offsetTop);
                    offsetParent = this._getParent(offsetParent);
                }
            }
            offsetParent = this._getParent(img);
            while (offsetParent && offsetParent != content) {
                offsetTop += parseFloat(offsetParent.offsetTop || 0);
                offsetParent = this._getParent(offsetParent);
            }
            return {
                top: offsetTop + offsetContent,
                bottom: offsetTop + offsetHeight + offsetContent
            };
        },
        _checkStart: function() {
            this._startScrollTime = Date.now();
        },
        _checkEnd: function() {
            var that = this;
            this._endScrollTime = Date.now();
            if (this._endScrollTime - this._startScrollTime < this._scrollFlickTime) {
                if (isIOS) {
                    window.addEventListener("scroll", this.check);
                } else {
                    var scrollTop = doc.body.scrollTop, scrollId = setInterval(function() {
                        if (scrollTop === doc.body.scrollTop) {
                            clearInterval(scrollId);
                            that.check();
                        } else {
                            scrollTop = doc.body.scrollTop;
                        }
                    }, 50);
                }
            } else {
                this.check();
            }
        },
        check: function() {
            var options = this._options, dataAttr = options.page.dataAttr || "data-src", content = app.component.getActiveContent(), imgs = content.querySelectorAll("img[" + dataAttr + "]"), viewportTop = getScrollTop(), viewportBottom = getScrollTop() + getViewHeight();
            for (var i = 0; i < imgs.length; i++) {
                var img = imgs[i], offset = this._getOffset(img), src;
                if (offset.top > viewportTop && offset.top < viewportBottom || offset.bottom > viewportTop && offset.bottom < viewportBottom) {
                    src = img.getAttribute(dataAttr);
                    if (src) {
                        img.setAttribute("src", src);
                        img.removeAttribute(dataAttr);
                    }
                }
            }
        },
        on: function(page, options) {
            this._options = options;
            scroll = app.component.get("scroll");
            this._checkStart = this._checkStart.bind(this);
            this._checkEnd = this._checkEnd.bind(this);
            this.check = this.check.bind(this);
            if (scroll) {
                app.component.on("scrollEnd", this.check);
            } else {
                doc.addEventListener("touchstart", this._checkStart, false);
                doc.addEventListener("touchend", this._checkEnd, false);
            }
        },
        off: function(page, options) {
            if (scroll) {
                app.component.off("scrollEnd", this.check);
            } else {
                doc.removeEventListener("touchstart", this._checkStart, false);
                doc.removeEventListener("touchend", this._checkEnd, false);
            }
        }
    };
})(window, window["app"]);
(function(win, app) {
    var doc = win.document, scroll;
    function getScrollTop() {
        return scroll.fn.getScrollTop();
    }
    function getScrollHeight() {
        return scroll.fn.getScrollHeight();
    }
    function scroll2(pos) {
        scroll.fn.scrollTo(pos);
    }
    app.plugin.scrollpos = {
        _options: null,
        _setPos: function(pos) {
            this._options.pos = pos != null ? pos : getScrollTop();
        },
        _transitonEnd: function() {
            this._options.transitonEnd = true;
        },
        once: function() {
            var options = this._options;
            if (!options.first) {
                this._setPos(0);
            } else {
                options.first = false;
            }
            if (options.transitonEnd) {
                scroll2(options.pos);
            } else {
                app.component.once("forwardTransitionEnd backwardTransitionEnd", function() {
                    scroll2(options.pos);
                });
            }
        },
        on: function(page, options) {
            this._options = options;
            options.first = true;
            options.transitonEnd = false;
            scroll = app.component.get("scroll");
            app.component.on("scrollEnd", this._setPos, this);
            app.component.on("forwardTransitionEnd backwardTransitionEnd", this._transitonEnd, this);
            page.on("rendered", this.once, this);
        },
        off: function(page, options) {
            app.component.off("scrollEnd", this._setPos, this);
            app.component.off("forwardTransitionEnd backwardTransitionEnd", this._transitonEnd, this);
            page.off("rendered", this.once, this);
        }
    };
})(window, window["app"]);
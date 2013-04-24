(function(win, app) {
    var doc = win.document, scroll;
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
    function scroll2(pos) {
        if (scroll) {
            scroll.fn.scrollTo(pos);
        } else {
            scrollTo(0, pos);
        }
    }
    app.plugin.scrollpos = {
        _options: null,
        _setPos: function(pos) {
            this._options.state.pos = typeof pos === "number" ? pos : getScrollTop();
        },
        _transitonEnd: function() {
            this._options.page.transitonEnd = true;
        },
        reset: function(pos) {
            var options = this._options, move = app.navigation.getState().move;
            function resetPos() {
                scroll2(options.state.pos);
            }
            if (pos != null) {
                this._setPos(pos);
                resetPos();
            } else {
                if (options.page.transitonEnd) {
                    resetPos();
                } else {
                    app.component.once(move + "TransitionEnd", resetPos);
                }
            }
        },
        on: function(page, options) {
            scroll = app.component.get("scroll");
            this._options = options;
            this._options.page.transitonEnd = false;
            this._setPos = this._setPos.bind(this);
            app.component.on("forwardTransitionEnd backwardTransitionEnd", this._transitonEnd, this);
            if (scroll) {
                app.component.on("scrollEnd", this._setPos);
            } else {
                doc.addEventListener("touchend", this._setPos);
            }
        },
        off: function(page, options) {
            app.component.off("forwardTransitionEnd backwardTransitionEnd", this._transitonEnd, this);
            if (scroll) {
                app.component.off("scrollEnd", this._setPos);
            } else {
                doc.removeEventListener("touchend", this._setPos);
            }
        }
    };
})(window, window["app"]);
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
        reset: function(pos) {
            var options = this._options;
            if (pos != null) {
                this._setPos(pos);
            }
            scroll2(options.state.pos);
        },
        on: function(page, options) {
            scroll = app.component.get("scroll");
            this._options = options;
            this._setPos = this._setPos.bind(this);
            if (scroll) {
                app.component.on("scrollEnd", this._setPos);
            } else {
                doc.addEventListener("touchend", this._setPos);
            }
        },
        off: function(page, options) {
            if (scroll) {
                app.component.off("scrollEnd", this._setPos);
            } else {
                doc.removeEventListener("touchend", this._setPos);
            }
        }
    };
})(window, window["app"]);
(function(win, app) {
    var doc = win.document, scroll;
    function getScrollTop() {
        return scroll.fn.getScrollTop();
    }
    function getScrollHeight() {
        return scroll.fn.getScrollHeight();
    }
    function getViewHeight() {
        return scroll.offsetHeight;
    }
    app.plugin.lazyload = {
        _options: null,
        once: function() {
            var options = this._options, items = doc.querySelectorAll(options.itemSelector), scrollTop = getScrollTop(), scrollHeight = getScrollHeight(), itemHeight = options.itemHeight, viewHeight = getViewHeight() + options.viewHeightPatch, start, end;
            start = Math.floor(scrollTop / itemHeight);
            end = Math.ceil((scrollTop + viewHeight) / itemHeight);
            for (var i = start; i < end && i < items.length; i++) {
                var item = items[i], img = item.querySelector("img[data-src]"), src = img.getAttribute("data-src");
                if (src) {
                    img.setAttribute("src", src);
                    img.setAttribute("data-src", "");
                }
            }
        },
        on: function(page, options) {
            this._options = options;
            options.dataAttr || (options.dataAttr = "data-src");
            scroll = app.component.get("scroll");
            app.component.on("scrollEnd", this.once, this);
            page.on("rendered", this.once, this);
        },
        off: function(page, options) {
            app.component.off("scrollEnd", this.once, this);
            page.off("rendered", this.once, this);
        }
    };
})(window, window["app"]);
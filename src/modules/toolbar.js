(function(win, app, undef) {

var doc = win.document
	;


function Toolbar(wrapEl, options) {
	options || (options = {});

	this._wrapEl = wrapEl;
    this.set(options);
}

var ToolbarProto = {
    set: function(options) {
        options || (options = {});
        this._wrapEl.innerHTML = '';
        options.html && (this._wrapEl.innerHTML = options.html);
        options.el && (this._wrapEl.appendChild(options.el));
        options.height && (this._wrapEl.style.height = options.height + 'px');
    },

    show: function(options) {
        options && this.set(options);
    	this._wrapEl.style.display = '';
    },

    hide: function() {
    	this._wrapEl.style.display = 'none';
    }
}

for (var p in ToolbarProto) {
	Toolbar.prototype[p] = ToolbarProto[p];
}

app.module.Toolbar = Toolbar;

})(window, window['app']||(window['app']={module:{},plugin:{}}));
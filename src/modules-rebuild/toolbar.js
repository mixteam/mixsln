(function(win, app, undef) {

var doc = win.document
	;


function Toolbar(wrapEl, options) {
	options || (options = {});

	this._wrapEl = wrapEl;
	options.html && (this._wrapEl.innerHTML = options.html);
	options.height && (this._wrapEl.style.height = options.height + 'px');
}

var ToolbarProto = {
    show: function(html, options) {
    	options || (options = {});
		html && (this._wrapEl.innerHTML = html);
		options.height && (this._wrapEl.style.height = options.height + 'px');
    	this._wrapEl.style.display = '';
    	return this._wrapEl;
    },

    hide: function() {
    	this._wrapEl.style.display = 'none';
    	return this._wrapEl;
    }
}

for (var p in ToolbarProto) {
	Toolbar.prototype[p] = ToolbarProto[p];
}

app.module.Toolbar = Toolbar;

})(window, window['app']||(window['app']={module:{},plugin:{}}));
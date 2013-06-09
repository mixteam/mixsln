(function(win, app, undef) {

var doc = win.document
	;


function Toolbar(wrapEl, options) {
	options || (options = {});

	this._wrapEl = wrapEl;
}

var ToolbarProto = {
    
}

for (var p in ToolbarProto) {
	Toolbar.prototype[p] = ToolbarProto[p];
}

app.module.Toolbar = Toolbar;

})(window, window['app']||(window['app']={module:{},plugin:{}}));
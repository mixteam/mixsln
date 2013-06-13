(function(win, app, undef) {

var doc = win.document
	;

function _setButton(btn, options) {
	(options.id != null) && btn.setAttribute('id', options.id);
	(options['class'] != null) && (btn.className = options['class']);
	(options.text != null) && (btn.innerHTML = options.text);
	(options.bg != null) && (btn.style.background = options.bg);
	(options.icon != null) && (btn.innerHTML = '<img src="' + options.icon + '" border="0" />');
	(options.hide === true) ? (btn.style.display = 'none'):(btn.style.display = '');
	if (options.handler) {
		btn.handler && btn.removeEventListener('click', btn.handler, false);
		btn.addEventListener('click', (btn.handler = options.handler), false);
	}
}

function Navbar(wrapEl, options) {
	options || (options = {});

	this._wrapEl = wrapEl;
	this._animWrapEl = options.animWrapEl;
	this._backWrapEl = options.backWrapEl;
	this._funcWrapEl = options.funcWrapEl;
	this._titleWrapEl = options.titleWrapEl;
}

var NavbarProto = {
    setTitle: function(title) {
    	this._titleWrapEl && (this._titleWrapEl.innerHTML = title);
    },

    setButton: function(options) {
    	var wrap, btn;
    	if (options.type === 'back') {
    		wrap = this._backWrapEl;
    		btn = wrap.querySelector('button');
    	} else if (options.type === 'func') {
    		wrap = this._funcWrapEl;
    		btn = wrap.querySelector('#' + options.id);
    	} else if (options.id) {
    		btn = this._wrapEl.querySelector('#' + options.id);
    		btn && (wrap = btn.parentNode);
    	}

		if (!btn && wrap) {
			btn = doc.createElement('button');
			wrap.appendChild(btn);
		}
		_setButton(btn, options);
    },

    getButton: function(id) {
    	return this._funcWrapEl.querySelector('button#' + id);
    },

    removeButton: function(id) {
    	if (!id) {
    		var btns = this._funcWrapEl.querySelectorAll('button');
    		for (var i = 0; i < btns.length; i++) {
    			this.removeButton(btns[i]);
    		}
    	} else {
	    	if (typeof id === 'string') {
	    		var btn = this.getButton(id);
	    	} else if (id instanceof HTMLElement) {
	    		var btn = id;
	    	}
			if (btn) {
				btn.handler && btn.removeEventListener('click', btn.handler);
				btn.parentNode.removeChild(btn);
			}
		}
    }
}

for (var p in NavbarProto) {
	Navbar.prototype[p] = NavbarProto[p];
}

app.module.Navbar = Navbar;

})(window, window['app']||(window['app']={module:{},plugin:{}}));
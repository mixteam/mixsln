;(function(win, app, undef) {

var doc = win.document
	;

function _setButton(btn, options) {
	(options.id != null) && btn.setAttribute('data-id', options.id);
	(options['class'] != null) && (btn.className = options['class']);
	(options.text != null) && (btn.innerHTML = options.text);
	(options.bg != null) && (btn.style.background = options.bg);
	(options.icon != null) && (btn.innerHTML = '<img src="' + options.icon + '" border="0" width="100%" height="100%" />');
	(options.hide === true) ? (btn.style.display = 'none'):(btn.style.display = '');
	options.onChange && options.onChange.call(btn, options);
	if (options.handler) {
		btn.handler && btn.removeEventListener('click', btn.handler, false);
		btn.addEventListener('click', (btn.handler = options.handler), false);
	}
}

function Navbar(wrapEl) {
	this.wrapEl = wrapEl;
	this.wrapEl.appendChild(this.animWrapEl = doc.createElement('ul'));
	this.animWrapEl.appendChild(this.titleWrapEl = doc.createElement('li'));
	this.animWrapEl.appendChild(this.backWrapEl = doc.createElement('li'));	
	this.animWrapEl.appendChild(this.funcWrapEl = doc.createElement('li'));
}

var NavbarProto = {
    setTitle: function(title) {
    	if (typeof title === 'string') {
    		this.titleWrapEl.innerHTML = title;
    	} else if (title instanceof HTMLElement) {
    		this.titleWrapEl.innerHTML = '';
    		this.titleWrapEl.appendChild(title);
    	}
    },

    setButton: function(options) {
    	var wrap, btn;
    	if (options.type === 'back') {
    		wrap = this.backWrapEl;
    		btn = wrap.querySelector('a');
    	} else if (options.type === 'func') {
    		wrap = this.funcWrapEl;
    		btn = wrap.querySelector('a[data-id="' + options.id + '"]');
    	} else if (options.id) {
    		btn = this.wrapEl.querySelector('a[data-id="' + options.id + '"]');
    		btn && (wrap = btn.parentNode);
    	}

		if (!btn && wrap) {
			btn = doc.createElement('a');
			btn.className = options.type;
			wrap.appendChild(btn);
		}
		_setButton(btn, options);
    },

    getButton: function(id) {
    	return this.wrapEl.querySelector('a[data-id="' + id + '"]');
    },

    removeButton: function(id) {
    	function remove(btn) {
			if (btn) {
				btn.handler && btn.removeEventListener('click', btn.handler);
				btn.parentNode.removeChild(btn);
			}
    	}

    	if (!id) {
    		var btns = this.funcWrapEl.querySelectorAll('a');
    		for (var i = 0; i < btns.length; i++) {
    			remove(btns[i]);
    		}
    	} else {
	    	if (typeof id === 'string') {
	    		var btn = this.getButton(id);
	    	} else if (id instanceof HTMLElement) {
	    		var btn = id;
	    	}
	    	remove(btn);
		}
    }
}

for (var p in NavbarProto) {
	Navbar.prototype[p] = NavbarProto[p];
}

app.module.Navbar = Navbar;

})(window, window['app']||(window['app']={module:{},plugin:{}}))
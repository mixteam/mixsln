(function(win, app, undef) {

var Message = app.module.MessageScope
	;

function NavBar(wrapEl, options) {
	options || (options = {});

	this._wrapEl = wrapEl;
	this._options = options;

	if (!options.backWrapEl) {
		options.backWrapEl = wrapEl.querySelector('back-wrap');
	}

	if (!options.funcWrapEl) {
		options.funcWrapEl = wrapEl.querySelector('func-wrap');
	}

	if (!options.titleWrapEl) {
		options.titleWrapEl = wrapEl.querySelector('title-wrap');
	}
}

var NavBarProto = {
    setTitle: function(title) {
    	this._options.titleWrapEl.innerHTML = title;
    },

    setButton: function(options) {
    	var backWrapEl = this._options.backWrapEl,
    		backBtnEl = backWrapEl.querySelector('button'),
    		funcWrapEl = this._options.funcWrapEl
    		;

    	if (options.type === 'back') {
    		options.hide == null || (options.hide = false);

    		options.id && backWrapEl.setAttribute('id', options.id);
    		options.text && (backWrapEl.innerText = options.text);
    		options.bg && (backWrapEl.style.background = options.bg);
    		if (options.icon) {
    			
    		}
    		if (options.handler) {
    			!backWrapEl.handler && backWrapEl.addEventListener('click', function(e) {
    				backWrapEl.handler.apply(this, arguments);
    			}, false);
    			backWrapEl.handler = handler;
    		}
    		options.hide ? (backWrapEl.style.display = 'none'):(backWrapEl.style.display = '');
    	} else if (options.type === 'func') {

    	}
    },

    getButton: function(id) {

    }
}

for (var p in NavBarProto) {
	NavBar.prototype[p] = NavBarProto[p];
}

app.module.NavBar = NavBar;

})(window, window['app']||(window['app']={module:{},plugin:{}}));
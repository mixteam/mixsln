// --------------------------------
// Thanks to:
//	-http://backbonejs.org
//	-http://underscorejs.org
(function(win, app, undef) {


var util = app.util,
    Message = app._module.message,
	loc = win.location
	;

function Router() {
    var that = this,
        msgContext = new Message('router');
        ;

    Message.mixto(this, msgContext);

    that._handlers = [];
    that._options = {};
    that._changeHanlder = util.bindContext(that._changeHanlder, that);
}

var proto = {
    _getHash: function(){
		return loc.hash.slice(1) || '';
    },

    _setHash: function(fragment) {
		loc.hash = fragment;
    },

    _resetHandler : function() {
    	var that = this,
    		handlers = that._handlers
    		;

		util.each(handlers, function(handler) {
			handler.matched = false;
		});
    },

    _changeHanlder : function() {
    	var that = this
    		;

    	that._resetHandler();
    	that.match();
    },

    start: function(options) {
    	var that = this,
    		fragment
    		;

		if(Router.started) return false;
        Router.started = true;

		win.addEventListener('hashchange', that._changeHanlder, false);

		options = util.extend(that._options, options || {});
		
		if (options.firstMatch !== false) {
            that.match();
        }

		return true;
    },

    stop: function() {
    	var that = this
    		;

    	if (!Router.started) return false;
    	
    	win.removeEventListener('hashchange', that._changeHanlder, false);
		Router.started = false;

    	that._options = {};
    	that._handlers = [];
        that._fragment = null;

    	return true;
    },

    match: function() {
    	var that = this,
            options = that._options,
    		handlers = that._handlers,
    		handler, fragment, unmatched = true
			;

		if (!Router.started) return;

		fragment = that._fragment = that._getHash();

		for (var i = 0; i < handlers.length; i++) {
			handler = handlers[i];

			if(!handler.matched && 
					handler.route.test(fragment)) {
                unmatched = false;
				handler.matched = true;
				handler.callback(fragment);

				if (handler.last) break;
			}
		}

        unmatched && that.trigger('unmatched', fragment);
    },

    add: function(route, callback, last) {
    	var that = this,
    		handlers = that._handlers
    		;

		handlers.push({
			route: route, 
			callback: callback, 
			matched : false, 
			last : !!last
		});
    },

    remove : function(route, callback) {
    	var that = this,
    		handlers = that._handlers
    		;

    	for (var i = 0; i < handlers.length; i++) {
    		var handler = handlers[i]
    			;

    		if (handler.route.source === route.source && 
    				(!callback || handler.callback === callback)) {
    			return handlers.splice(i, 1);
    		}
    	}
    },

    navigate: function(fragment) {
    	var that =  this,
    		fragment
    		;

		if (!Router.started) return;

		fragment || (fragment = '');

		if (that._fragment !== fragment) {
			that._setHash(fragment);
		}
    }
};

util.extend(Router.prototype, proto);

Router.started = false;
Router.instance = new Router;

app._module.router = Router;

})(window, window['app']||(window['app']={}));


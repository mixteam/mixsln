// --------------------------------
// Thanks to:
//	-http://backbonejs.org
//	-http://underscorejs.org
define(function(require, exports, module) {

require('reset');

var Class = require('class'),
	Message = require('message'),
	routeStripper = /^[#\/]/,

	win = window,
	doc = win.document,
	loc = win.location,
	his = win.history
	;

var History = Class.create({
	Implements : Message,

	initialize : function(){
		var that = this
			;

		Message.prototype.initialize.call(that, 'history');

		that._handlers = [];
		that._matchs = [];
		// bind function
		that._changeHanlder = Function.binded(that._changeHanlder, that);
	},

    _getHash: function(){
		return loc.hash.slice(1) || '';
    },

    _updateHash: function(fragment, replace) {
		if (replace) {
			loc.replace(loc.toString().replace(/(javascript:|#).*$/, '') + '#' + fragment);
		} else {
			loc.hash = fragment;
		}
    },

    _getFragment: function(fragment, forcePushState){
		var that = this
			;

		if(fragment == null) {
			if (that._hasPushState || forcePushState) {
				fragment = loc.pathname;
				var search = loc.search;
				if (search) fragment += search;
			} else {
				fragment = that._getHash();
			}
		}
		if(!fragment.indexOf(that._options.root)) 
			fragment = fragment.substr(that._options.root.length);
		return fragment.replace(routeStripper, '');
    },

    _cacheMatchs : function() {

    },

    _resetMatchs : function() {
    	var that = this,
    		handlers = that._handlers
    		;

		handlers.forEach(function(handler) {
			handler.matched = false;
		});
    },

    _changeHanlder : function(events) {
    	var that = this
    		;

    	that._resetMatchs();
    	that.match();
    },

    start: function(options) {
    	var that = this,
    		fragment
    		;

		if(History.started) throw new Error("history has already been started");
		History.started = true;
		
		that._options         = Object.extend({}, {root: '/'}, options || {});
		that._wantsHashChange = that._options.hashChange !== false;  //默认为true
		that._wantsPushState  = !!that._options.pushState;  //默认为false
		that._hasPushState    = !!(that._options.pushState && his && his.pushState);  //不支持pushState永远为false
		
		if(that._hasPushState){
			win.addEventListener('popstate', that._changeHanlder, false);
		}
		else if(that._wantsHashChange && ('onhashchange' in win)){
			win.addEventListener('hashchange', that._changeHanlder, false);
		}
		
		var atRoot  = loc.pathname == that._options.root;
		
		if (that._wantsHashChange && 
				that._wantsPushState && 
				!that._hasPushState && 
				!atRoot){

			fragment = that._getFragment(null, true);
			loc.replace(that._options.root + '#' + that._fragment);
			return true;

		} else if (that._wantsPushState && 
					that._hasPushState && 
					atRoot && 
					loc.hash){

			fragment = that._getFragment();
			his.replaceState({}, 
				doc.title, 
				loc.protocol + '//' + loc.host + that._options.root + that._fragment
			);

		}
		if(!that._options.silent) {
			return that.match(fragment);
		}
    },

    stop: function() {
    	var that = this
    		;

    	if (!History.started) return;

		win.removeEventListener('popstate', that._changeHanlder, false);
		win.removeEventListener('hashchange', that._changeHanlder, false);
		History.started = false;
    },

    match: function(fragment) {
    	var that = this,
			fragment,
			handlers = that._handlers
			;

		if (!History.started) return;

		that._fragment = fragment = fragment || that._getFragment();

		handlers.forEach(function(handler) {
			if(!handler.matched && 
				handler.route.test(fragment)) {
				handler.matched = true;
				handler.callback(fragment);
			}
		});
    },

    route: function(route, callback) {
    	var that = this,
    		handlers = that._handlers
    		;

		handlers.push({route: route, callback: callback, matched : false});
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

    navigate: function(fragment, options) {
    	var that =  this,
    		fragment
    		;

		if (!History.started) return false;

		if (!options || options === true) 
			options = {trigger: options};

		fragment = (fragment || '').replace(routeStripper, '');

		if (that._fragment == fragment) return;
		
		if (that._hasPushState){
			if (fragment.indexOf(that._options.root) != 0) 
				fragment = that._options.root + fragment;

			his[options.replace ? 'replaceState' : 'pushState']({}, doc.title, fragment);
		} else if (that._wantsHashChange){
			that._updateHash(fragment, options.replace);
		} else {
			loc.assign(that._options.root + fragment);
		}

		if(options.trigger) that.match(fragment);
    }
});

History.started = false;
History.singleton = new History;

module.exports = History;

});


//@require message

;(function(win, app, undef) {

function StateStack() {
	var that = this;

	that.move = null;
	that.transition = null;
	that.datas = null;

	that._states = [];
	that._stateIdx = 0;
	that._stateLimit = 100;
}

var StateStackProto = {
	reset: function() {
		var that = this;

		that.move = null;
		that.transition = null;
		that.datas = null;
		that.type = null;

		that._states = [];
		that._stateIdx = 0;
		that._stateLimit = 100;
	},

	pushState: function(name, fragment, params, args) {
		var that = this,				
			states = that._states,
			stateIdx = that._stateIdx,
			stateLimit = that._stateLimit,
			stateLen = states.length,
			move = that.move,
			transition = that.transition,
			datas = that.datas,
			type = that.type,

			prev = states[stateIdx - 1],
			next = states[stateIdx + 1],
			cur = {
				name : name,
				fragment : fragment,
				type: type,
				params : params || {},
				datas : datas || {}
			}
			;

		for (var p in args) {
			cur.datas[p] = args[p];
		}

		if (move == null) {
			if (!datas && StateStack.isEquals(prev, cur)) {
				transition = move = 'backward';
			} else {
				transition = move = 'forward';
			}
		}

		if (move === 'backward') {
			if (stateIdx === 0 && stateLen > 0) {
				states.unshift(cur);
			} else if (stateIdx > 0) {
				stateIdx--;
				cur = prev;
			}
		} else if (move === 'forward') {
			if (stateIdx === stateLimit - 1) {
				states.shift();
				states.push(cur);
				cur.referer = location.href.replace(/#[^#]*/, '#' + states[stateIdx - 1].fragment);
			} else if (stateIdx === 0 && stateLen === 0) {
				states.push(cur);
				cur.referer = document.referer || '';
			} else if (!datas && StateStack.isEquals(next, cur)){
				stateIdx++;
				cur = next;
			} else if (StateStack.isEquals(states[stateIdx], cur)){
				cur = states[stateIdx];
			} else {
				stateIdx++;
				states.splice(stateIdx);
				states.push(cur);
				cur.referer = location.href.replace(/#[^#]*/, '#' + states[stateIdx - 1].fragment);
			}
		}

		cur.move = move;
		cur.transition = transition;
		cur.index = stateIdx;

		that.move = null;
		that.transition = null;
		that.datas = null;
		that._stateIdx = stateIdx;

		return cur;
	},

	getState: function() {
		return this._states[this._stateIdx];
	},

	getIndex: function() {
		return this._stateIdx;
	}
}

for (var p in StateStackProto) {
	StateStack.prototype[p] = StateStackProto[p];
}

StateStack.isEquals = function(state1, state2) {
	if (!state1 || !state2) return false;

	if (state1.name !== state2.name || 
			state1.fragment !== state2.fragment)
		return false;

	return true;
}

var NAMED_REGEXP = /\:([a-z0-9_-][a-z0-9_-]*)/gi,
	SPLAT_REGEXP = /\*([a-z0-9_-][a-z0-9_-]*)/gi,
	PERL_REGEXP = /P\<([a-z0-9_-][a-z0-9_-]*?)\>/gi,
	ARGS_SPLITER = '?',
	his = win.history,
	loc = win.location,
	Message = app.module.MessageScope
	;

function convertParams(routeText) {
	return routeText.replace(NAMED_REGEXP, '(P<$1>[^\\/]*?)')
				.replace(SPLAT_REGEXP, '(P<$1>.*?)');
}

function extractNames(routeText) {
	var matched = routeText.match(PERL_REGEXP),
		names = {}
		;


	matched && matched.forEach(function(name, i) {
		names[name.replace(PERL_REGEXP, '$1')] = i;
	});

	return names;
}

function extractArgs(str) {
	if (!str) return {};

	var split = str.split('&'),
		args = {}
		;

	split.forEach(function(pair) {
		if (pair) {
			var s = pair.split('=')
				;

			args[s[0]] = s[1];
		}
	});

	return args;
}

function parseRoute(routeText) {
	routeText = routeText.replace(PERL_REGEXP, '');

	return new RegExp('^(' + routeText + ')$');
}


function getFragment() {
	return loc.hash.slice(1) || '';
}

function setFragment(fragment) {
	loc.hash = fragment;
}

function Navigation() {
	var that = this;

	that._started = false;
	that._routes = {};
	that._stack = new StateStack();

	Message.mixto(this, 'navigation');
}

var NavigationProto = {
	getStack: function() {
		return this._stack;
	},

	handleEvent: function() {
    	var that = this,
    		routes = that._routes,
    		route, fragment, defaultRoute,
    		unmatched = true
			;

		if (!that._started) return;

		fragment = getFragment();

		for (var name in routes) {
			route = routes[name];

			if (route['default']) {
				defaultRoute = route;
			} else if(route.routeReg.test(fragment.split(ARGS_SPLITER)[0])) {
                unmatched = false;
				route.callback(fragment);
				if (route.last) break;
			}
		}

		if (unmatched && defaultRoute) {
			defaultRoute.callback(fragment);
		}
	},

	addRoute: function(name, routeText, options) {
		var that = this,
			routeNames, routeReg
			;

		if (arguments.length === 1) {
			options = arguments[0];
			name = null;
			routeText = null;
		}

		options || (options = {});

		function routeHandler(fragment, params, args) {
			var state = that._stack.pushState(name, fragment, params, args);
			options.callback && options.callback(state);
			that.trigger(state.move, state);
		}

		if (options['default']) {
			that._routes[name] = {
				'default' : true,
				callback: function(fragment) {
					var args = extractArgs(fragment.split(ARGS_SPLITER)[1] || '');
					routeHandler(fragment, {}, args);
				}
			}
		} else if (name && routeText) {
			routeText = convertParams(routeText);
			routeNames = extractNames(routeText);
			routeReg = parseRoute(routeText);

			that._routes[name] = {
				routeText: routeText,
				routeReg: routeReg,
				callback: function(fragment) {
					var split = fragment.split(ARGS_SPLITER),
						matched = split[0].match(routeReg).slice(2),
						args = extractArgs(split[1] || ''),
						params = {}
						;

					for (var name in routeNames) {
						params[name] = matched[routeNames[name]];
					}

					routeHandler(fragment, params, args);
				},
				last: !!options.last
			}
		}
	},

	removeRoute: function(name) {
		if (this._routes[name]) {
			delete this._routes[name];
		}
	},

	hasRoute: function(name) {
		return !!this._routes[name];
	},

	start: function() {
		if(this._started) return false;

	    this._started = true;
		win.addEventListener('hashchange', this, false);
		this.handleEvent();
		return true;
	},

	stop: function() {
    	if (!this._started) return false;
    	
    	this._routes = {};
    	this._stack.reset();
    	this._started = false;
    	win.removeEventListener('hashchange', this, false);
    	return true;
	},

	push: function(fragment, options) {
		var that = this,
			stack = that._stack,
			state = stack.getState(),
			args = []
			;

		options || (options = {});
		stack.move = 'forward';
		stack.transition = 'forward';

		if (fragment != null) {
			if (!state || state.fragment !== fragment || 
					options.data) {

				options.type || (options.type = 'GET');
				options.data || (options.data = {});

				if (options.type.toUpperCase() === 'GET') {
					for (var key in options.data) {
						args.push(key + '=' + options.data[key]);
					}
				}

				if (options.type.toUpperCase() === 'POST') {
					stack.datas = options.data;
				}

				if (options.transition === 'backward') {
					stack.transition = 'backward';
				}

				stack.type = options.type.toUpperCase();
				setFragment(fragment + (args.length ? ARGS_SPLITER + args.join('&') : ''));
			}
		} else {
			his.forward();
		}
	},

	pop: function(options) {
		var that = this,
			stack = that._stack,
			stateIdx = stack.getIndex()
			;

		if (stateIdx === 0) return;

		stack.move = 'backward';
		stack.transition = 'backward';

		if (options && options.transition === 'forward') {
			stack.transition = 'forward';
		}

		his.back();
	},

	resolve: function(name, params) {
		var route = this._routes[name], routeText, resolved = '';

		if (route) {
			routeText = route.routeText;
			resolved = routeText.replace(/\(P<[a-z0-9_-][a-z0-9_-]*?>.*?\)/g, function(m) {
				PERL_REGEXP.lastIndex = 0;
				var name = PERL_REGEXP.exec(m)[1];
				return params[name] || 'undefined';
			}).replace('\\/?', '').replace('\\', '');
		}

		return resolved;
	}
}

for (var p in NavigationProto) {
	Navigation.prototype[p] = NavigationProto[p];
}

Navigation.instance = new Navigation();

app.module.StateStack = StateStack;
app.module.Navigation = Navigation;

})(window, window['app']||(window['app']={module:{},plugin:{}}))
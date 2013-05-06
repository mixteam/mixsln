// --------------------------------
// Thanks to:
//	-http://backbonejs.org
//	-http://underscorejs.org
(function(win, app, undef) {

var util = app.util,
	Message = app._module.message,
	Router = app._module.router,
	NAMED_REGEXP = /\:(\w\w*)/g,
	SPLAT_REGEXP = /\*(\w\w*)/g,
	PERL_REGEXP = /P\<(\w\w*?)\>/g,
	ARGS_SPLITER = '!',
	his = win.history
	;

function Navigate(options) {
	var that = this,
		msgContext = new Message('navigate');
		;

	Message.mixto(that, msgContext);

	that._move = null;
	that._datas = null;
	that._routes = {};

	that._states = [];
	that._stateIdx = 0;
	that._stateLimit = options.stateLimit || 100;

	that._router = options.useRouter;
}
	
var proto = {
	_convertParams : function(routeText) {
		return routeText.replace(NAMED_REGEXP, '(P<$1>[^\\/]*?)')
					.replace(SPLAT_REGEXP, '(P<$1>.*?)');
	},

	_extractNames : function(routeText) {
		var matched = routeText.match(PERL_REGEXP),
			names = {}
			;

		matched && util.each(matched, function(name, i) {
			names[name.replace(PERL_REGEXP, '$1')] = i;
		});

		return names;
	},

	_extractArgs : function(args) {
		var split = args.split('&')
			;

		args = {};
		util.each(split, function(pair) {
			if (pair) {
				var s = pair.split('=')
					;

				args[s[0]] = s[1];
			}
		});

		return args;
	},

	_parseRoute : function(routeText) {
		routeText = routeText.replace(PERL_REGEXP, '');

		return new RegExp('^(' + routeText + ')(' + ARGS_SPLITER + '.*?)?$');
	},

	_stateEquals : function(state1, state2) {
		if (!state1 || !state2) return false;

		if (state1.name !== state2.name || 
				state1.fragment !== state2.fragment)
			return false;

		return true;
	},

	_pushState : function(name, fragment, params, args) {
		var that = this,				
			states = that._states,
			stateIdx = that._stateIdx,
			stateLimit = that._stateLimit,
			stateLen = states.length,
			move = that._move,
			transition = that._transition,
			datas = that._datas,

			prev = states[stateIdx - 1],
			next = states[stateIdx + 1],
			cur = {
				name : name,
				fragment : fragment,
				params : params || {},
				args : args || {},
				datas : datas || {}
			}
			;

		if (move == null) {
			if (!datas && that._stateEquals(prev, cur)) {
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
			} else if (stateIdx === 0 && stateLen === 0) {
				states.push(cur);
			} else if (!datas && that._stateEquals(next, cur)){
				stateIdx++;
				cur = next;
			} else if (that._stateEquals(states[stateIdx], cur)){
				cur = states[stateIdx];
			} else {
				stateIdx++;
				states.splice(stateIdx);
				states.push(cur);
			}
		}

		cur.move = move;
		cur.transition = transition;

		that._move = null;
		that._datas = null;
		that._stateIdx = stateIdx;

		that.trigger(move, cur);

		return cur;
	},

	getState : function() {
		var that = this
			;

		return that._states[that._stateIdx];
	},

	getStateIndex : function() {
		var that = this
			;

		return that._stateIdx;
	},

	addRoute : function(name, routeText, options) {
		var that = this,
			callback,
			routeNames, routeReg
			;

		if (arguments.length === 1) {
			options = arguments[0];
			name = null;
			routeText = null;
		}

		options || (options = {});

		if (options['default']) {
			that._router.on('unmatched', function(fragment) {
				var state = that._pushState(name, fragment);
				options.callback && options.callback(state);
			});
		} else if (name && routeText) {
			routeText = that._convertParams(routeText);
			routeNames = that._extractNames(routeText);
			routeReg = that._parseRoute(routeText);

			that._routes[name] = routeReg;
			
			that._router.add(routeReg, function(fragment) {
				var matched = fragment.match(routeReg).slice(2),
					args = that._extractArgs(matched.pop() || ''),
					params = {}, state
					;

				util.each(routeNames, function(index, key) {
					params[key] = matched[index];
				});				

				state = that._pushState(name, fragment, params, args);
				options.callback && options.callback(state);
			}, options.last);
		}
	},

	removeRoute : function(name) {
		var that = this,
			routeReg = that._routes[name]
			;

		routeReg && that._router.remove(routeReg);
	},

	forward : function(fragment, options) {
		var that = this,
			states = that._states,
			stateIdx = that._stateIdx,
			cur = states[stateIdx] || {},
			args = []
			;

		that._move = 'forward';
		that._transition = 'forward';

		options || (options = {});

		if (fragment) {
			if (options.datas || cur.fragment !== fragment) {
				if (options.args) {
					util.each(options.args, function(value, key) {
						args.push(key + '=' + value)
					});
				}

				if (options.datas) {
					that._datas = options.datas;
				}

				if (options.transition === 'backward') {
					that._transition = 'backward';
				}

				that._router.navigate(fragment + (args.length ? ARGS_SPLITER + args.join('&') : ''));
			}
		} else {
			his.forward();
		}
	},

	backward : function(options) {
		var that = this,
			stateIdx = that._stateIdx
			;

		if (stateIdx === 0) return;

		that._move = 'backward';
		that._transition = 'backward';

		options || (options = {});

		if (options.transition === 'forward') {
			that._transition = 'forward';
		}

		his.back();
	}
}
util.extend(Navigate.prototype, proto);

Navigate.instance = new Navigate({
	useRouter : Router.instance
});

app._module.navigate = Navigate;

})(window, window['app']||(window['app']={}));

// --------------------------------
// Thanks to:
//	-http://backbonejs.org
//	-http://underscorejs.org
define(function(require, exports, module) {

require('reset');

var Class = require('class'),
	history = require('history').singleton,
	namedParam    = /\:\w+/g,
	splatParam    = /\*\w+/g,
	escapeRegExp  = /[-[\]{}()+?.,\\^$|#\s]/g,
	appRegExp = /^[^#\/\!]*/

	win = window,
	doc = win.document,
	his = win.history,
	head = doc.getElementsByTagName('head')[0],
	loc = win.location,
	
	Router = Class.create({
		initialize : function(options){
			var that = this
				;

			that._options = Object.extend({
				root : location.pathname.replace(/[^\/]+\.[^\/]+$/, ''),
				appPath : 'apps/',
				defaultApp : 'index',
				maxStateLen : 100
			}, options || {});

			that._started = false;
			that._states = [];
			that._stateIdx = -1;
			that._move = null;
		},

		_routeToRegExp : function(route) {
			route = route.replace(escapeRegExp, '\\$&')
				.replace(namedParam, '([^\/]+)')
				.replace(splatParam, '(.*?)');
			return new RegExp('^' + route + '(!.*?)?$');
		},

		_extractParamKeys : function(route) {
			var matched = route.match(namedParam),
				keys = {}
				;

			matched && Object.each(matched, function(key, i) {
				keys[key.substring(1)] = i;
			});

			return keys;
		},

		_extractParameters : function(route, fragment) {
			var matched;
			if ((matched = route.exec(fragment))) {
				return matched.slice(1);
			}
		},

		_extractArguments : function(fragment) {
			var split = fragment.split('&'),
				args = {}
				;

			if (split.length) {
				Object.each(split, function(pair) {
					var sp = pair.split('=')
						;

					args[sp[0]] = sp[1];
				});
			}

			return args;
		},

		_pushState : function(appname, args, fragment) {
			var that = this,
				options = that._options,
				root = options.root,
				appPath = options.appPath,
				maxStateLen = options.maxStateLen,

				states = that._states,
				stateIdx = that._stateIdx,
				prev = states[stateIdx - 1],
				last = states[stateIdx],
				next = states[stateIdx + 1],

				cur, move = that._move
				;

			// TODO 当使用浏览器的前进后退时，判断forward和backward会有点小问题
			that._move = null;
			if ((move && move === 'backward') || (!move &&
					prev && prev.fragment === fragment)) {
				move = 'backward';

				if (stateIdx == 0) {
					states.pop();
				} else {
					stateIdx--;
				}

				if (prev) {
					cur = prev;
				} else {
					cur = {
						appname : appname,
						params : [],
						args : args,
						fragment : fragment
					};
					states.push(cur);
				}
			} else if ((move && move ==='forward') || (!move &&
						!next || next.fragment === fragment)) {
				move = 'forward';

				if (stateIdx == maxStateLen - 1) {
					states.shift();
				} else {
					stateIdx++;
				}

				if (next) {
					cur = next;
				} else {
					cur = {
						appname : appname,
						params : [],
						args : args,
						fragment : fragment
					};
					states.push(cur);
				}
			}

			that._stateIdx = stateIdx;

			if (!last || last.appname != cur.appname) {
				cur.appentry = [root, appPath, appname, 'entry.js']
							.join('/').replace(/\/{2,}/g, '/');

				console.log(cur.appentry);

				history.trigger('navigator:' + move, cur.appname, cur.appentry);				
			}
		},

		_replaceState : function(name, params, paramKeys) {
			var that = this,
				states = this._states,
				stateIdx = this._stateIdx,
				cur = this._states[stateIdx]
				;

			cur.params = params || [];
			cur.paramKeys = cur.paramKeys || paramKeys || {};

			history.trigger('navigator:route', cur.appname, name);
		},

		getState : function() {
			var that = this,
				states = this._states,
				stateIdx = this._stateIdx
				;

			return this._states[stateIdx];
		},

		addRoute : function(route, name) {
			var that = this,
				paramKeys = that._extractParamKeys(route),
				route = that._routeToRegExp(route)
				;

			history.route(route, function (fragment) {
				var split = fragment.split('!'),
					params = that._extractParameters(route, split[0])
					;

				params && that._replaceState(name, params, paramKeys);
			});
		},

		removeRoute : function(route) {
			var that = this,
				route = that._routeToRegExp(route)
				;

			history.remove(route);
		},

		forward : function(fragment, argsObj) {
			var that = this,
				states = that._states,
				stateIdx = that._stateIdx,
				cur = states[stateIdx],
				args = []
				;

			that._move = 'forward';

			if (fragment) {
				if (!cur || argsObj || cur.fragment !== fragment) {
					if (argsObj) {
						Object.each(argsObj, function(value, key) {
							args.push(key + '=' + value)
						});
					}

					states.splice(stateIdx + 1);
					history.navigate(fragment + (args.length ? '!' + args.join('&') : ''));
				}
			} else {
				his.forward();
			}
		},

		backward : function() {
			var that = this,
				stateIdx = that._stateIdx
				;

			if (stateIdx < 1) return;

			that._move = 'backward';
			his.back();
		},

		start : function(config) {
			var that = this,
				options = Object.extend(that._options, config || {}),
				root = options.root,
				defaultApp = options.defaultApp
				;

			if (that._started) return;

			if (root.charAt(root.length - 1) !== '/') {
				options.root = root = root + '/';
			}			

			history.route(appRegExp, function(fragment) {
				var split = fragment.split('!'),
					appname = appRegExp.exec(split[0])[0] || defaultApp,
					args = that._extractArguments(split[1] || '')
					;

				that._pushState(appname, args, split[0]);
			});

			that._started = history.start({
				root : root,
				hashChange : true
			});
		}
	})
	;

Router.singleton = new Router;

module.exports = Router;

});

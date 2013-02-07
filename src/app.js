define(function(require, exports, module) {

require('reset');

var win = window,
	doc = win.document,

	Class = require('class'),
	router = require('router').singleton,
	navigate = require('navigate').singleton,
	Gesture = require('gesture'),
	Scroll = require('scroll'),
	Transition = require('transition'),
	AppPage = require('page'),

	app = {
		theme : 'ios',
		routePrefix : 0, // 0 - no prefix, 1 - use app.name, 'any string' - use 'any string'
		routePrefixSep : '\/',
		components : {}
	},
	componentFunction = {
		_isEnabled : false,

		enable : function() {
			if (this._module && !this._isEnabled) {
				this._module.enable();
				this._isEnabled = true;
			}
		},

		disable : function() {
			if (this._module && this._isEnabled) {
				this._module.disable();
				this._isEnabled = false;
			}
		}
	},

	pages = {}
	;

	function initXback(el) {
		var comps = app.components,
			xBack
			;

		el || (el = doc.querySelector('*[is="x-back"]'));

		if (el) {
			function preventClick(e) {
				navigate.backward();
				e.preventDefault();
				return false;
			}

			function changeVisibility() {
				var el = xBack._module,
					visibility = navigate.getStateIndex() < 1 ? 'hidden' : ''
					;

				if (el.style.visibility !== visibility) {
					el.style.visibility = visibility;
				}
			}

			xBack = comps['xBack'] = {
				_module : el,
				_isEnabled : false,
				_isAutoHide : el.getAttribute('autoHide') === 'true' ? true : false,

				enable : function() {
					var that = this,
						module = that._module
						;

					if (module && !that._isEnabled) {
						that._isEnabled = true;
						module.addEventListener('click', preventClick, false);
						that.autoHide(that._isAutoHide);
					}
				},

				disable : function() {
					var that = this,
						module = that._module
						;

					if (module && that._isEnabled) {
						that._isEnabled = false;
						el.removeEventListener('click', preventClick);
						that.autoHide = false;
					}
				},

				autoHide : function(is) {
					var that = this,
						module = that._module
						;

					if (module) {
						that._isAutoHide = is;

						if (is) {
							changeVisibility();
							navigate.on('forward backward', changeVisibility);
						} else {
							module.style.visibility = '';
							navigate.off('forward backward', changeVisibility);
						}
					}
				}
			};

			xBack.enable();
		}
	}

	function initXScroll(el) {
		var comps = app.components,
			xScroll
			;

		el || (el = doc.querySelector('*[is="x-scroll"]'));

		if (el) {
			el.className += (el.className?' ':'') + 'scrollport';

			xScroll = comps['xScroll'] = Object.extend({
				_module : app.ui.scroll(el),

				getViewport : function() {
					return this._module.getElement();
				}
			}, componentFunction);
			xScroll.enable();
		}
	}

	function initXTransition(el) {
		var comps = app.components,
			xTransition
			;

		el || (el = doc.querySelector('*[is="x-transition"]'));

		if (el) {
			el.className += (el.className?' ':'') + 'transitionport';

			xTransition = comps['xTransition'] = Object.extend({
				_module : app.ui.transition(el),

				getViewport : function() {
					var that = this,
						isEnabled = that._isEnabled
						;

					if (isEnabled) {
						return this._module.getActivePort();
					} else {
						return that._module.getElement();
					}
				}
			}, componentFunction);

			xTransition.enable();
		}
	}

	function initXViewport(el) {
		var comps = app.components,
			xViewport
			;

		el || (el = doc.querySelector('*[is="x-viewport"]'));

		if (el) {
			el.className += (el.className?' ':'') + 'viewport';

			xViewport = comps['xViewport'] = {
				_module : el,
				_content : null,
				_isEnabled : false,
				_isEnableScroll : el.getAttribute('enableScroll') === 'true' ? true : false,
				_isEnableTransition : el.getAttribute('enableTransition') === 'true' ? true : false,

				enable : function() {
					var that = this,
						module = that._module,
						subport
						;

					if (module && !that._isEnabled) {
						that._isEnabled = true;
						subport = doc.createElement('div');
						module.appendChild(subport);

						if (that._isEnableScroll) {
							module.style.overflowY = 'hidden';
							module.style.height = '100%'
							initXScroll(subport);
						}

						if (that._isEnableTransition) {
							module.style.overflowX = 'hidden';
							module.style.width = '100%';
							initXTransition(subport);
						}

						that._content = subport;
					}
				},

				disable : function() {
					var that = this,
						module = that._module
						;

					if (module && that._isEnabled) {
						that._isEnabled = false;
					}
				},

				getViewport : function() {
					var that = this,
						comps = app.components
						;

					if (that._isEnableTransition) {
						return comps['xTransition'].getViewport();
					} else if (that._isEnableScroll) {
						return comps['xScroll'].getViewport();
					} else {
						return that._content;
					}

				}
			};

			xViewport.enable();
		}
	}

	function initNavigateAction() {
		var curApp = null,
			comps = app.components,
			xTransition = comps['xTransition']
			;

		function switchAppPage(state) {
			var appName = state.name.split('.')[0]
				;

			if (curApp !== appName) {
				var lastPage = pages[curApp],
					curPage = pages[appName]
					;

				curApp = appName;
				lastPage && lastPage.trigger('unload');
				curPage && curPage.trigger('ready', state);
			}
		}

		function doTransition(state) {
			var module = xTransition._module
				;

			module.once(state.move + 'TransitionEnd', function() {
				switchAppPage(state);
			});
			module[state.move]();
			//switchAppPage(state);
		}
			
		navigate.on('forward backward', xTransition?doTransition:switchAppPage);
	}

	Object.extend(app, {
		init : function(page) {
			var that = this,
				name = page.name,
				routes = page.routes || {}
				;

			delete page.name;
			delete page.routes;

			var appPage = new AppPage(name, {
				routePrefix : app.routePrefix,
				routePrefixSep : app.routePrefixSep,
				routes : routes
			});
			
			Object.extend(appPage, page);

			pages[name] = appPage;
		},

		getViewport : function() {
			var comps = app.components;

			return comps['xViewport'].getViewport();
		},

		router : router,
		navigate : navigate,

		ui : {
			gesture : function(element) {
				return new Gesture(element);
			},
			scroll : function(element) {
				return new Scroll(element);
			},
			transition : function(element) {
				return new Transition(element);
			}
		}
	});

	initXback();
	initXScroll();
	initXTransition();
	initXViewport();
	initNavigateAction();

	win['app'] = app;
});

require('mix/sln/0.1.0/app');
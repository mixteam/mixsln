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
				_isAutoHide : false,

				enable : function() {
					var that = this,
						module = that._module
						;

					if (module && !that._isEnabled) {
						that._isEnabled = true;
						module.addEventListener('click', preventClick, false);
						that.autoHide(el.getAttribute('autoHide') === 'true'?true:false);
					}
				},

				disable : function() {
					var that = this,
						module = that._module
						;

					if (module && that._isEnabled) {
						that._isEnabled = false;
						el.removeEventListener('click', preventClick);
						that.autoHide(false)
					}
				},

				autoHide : function(is) {
					var that = this,
						module = that._module
						;

					if (module && that._isAutoHide !== is) {
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

	function initXHeader(el) {
		var comps = app.components,
			xHeader
			;

		el || (el = doc.querySelector('*[is="x-header"]'));

		if (el) {
			el.className += (el.className?' ':'') + 'headerport';

			function setContent(el, content) {
				if (content != null) {
					var isType = Object.isTypeof(content);
					if (isType === 'string') {
						el.innerHTML = content;
					} else  {
						if (isType !== 'array') {
							content = [content];
						}

						el.innerHTML = '';
						Object.each(content, function(item) {
							el.appendChild(item);
						});
					}
				}
			}

			xHeader = comps['xHeader'] = {
				_module : el,
				_isEnabled : false,

				enable : function() {
					if (this._module && !this._isEnabled) {
						this._isEnabled = true;
					}
				},

				disable : function() {
					if (this._module && this._isEnabled) {
						this._isEnabled = false;
					}
				},

				change : function(contents, movement) {
					var that = this,
						isEnabled = that._isEnabled,
						module = that._module,
						wrap
						;

					if (isEnabled && module) {
						wrap = module.querySelector('.wrap');
						wrap.style.cssText = '-webkit-transform: translate(' + (movement === 'backward'?'-':'') + '50px, 0); opacity: 0;';
						that.set(contents);
						setTimeout(function() {
							wrap.style.cssText = '-webkit-transition:0.4s ease; -webkit-transition-property: -webkit-transform opacity; -webkit-transform: translate(0, 0); opacity: 1;';
							setTimeout(function() {
								wrap.style.cssText = '';
							}, 400)
						}, 10);

					}
				},

				set : function(contents) {
					var that = this,
						isEnabled = that._isEnabled,
						module = that._module,
						center = contents.center,
						left = contents.left,
						right = contents.right
						;

					if (isEnabled && module) {
						setContent(module.querySelector('.center'), center);
						setContent(module.querySelector('.left'), left);
						setContent(module.querySelector('.right'), right);
					}
				}
			};

			xHeader.enable();
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
			xBack = comps['xBack'],
			xHeader = comps['xHeader'],
			xTransition = comps['xTransition']
			;

		function switchAppPage(appName, state) {
			var lastPage = pages[curApp],
				curPage = pages[appName]
				;

			curApp = appName;
			lastPage && lastPage.trigger('unload');
			curPage && curPage.trigger('ready', state);
		}

		function parseButtons(page) {
			var buttons = []
				;

			Object.each(page.header.buttons, function(button) {
				if (button.type === 'backStack') {
					xBack._module.innerText = button.text;
					xBack.autoHide(button.autoHide);
				} else if (button.type === 'rightExtra') {
					var el = document.createElement('button')
						;

					el.innerText = button.text;
					el.addEventListener('click', button.handler, false);
					buttons.push(el);
				}
			});

			return buttons;

		}

		function setHeader(appName, state) {
			var lastPage = pages[curApp],
				curPage = pages[appName],
				buttons = parseButtons(curPage)
				;

			if (!lastPage) {
				xHeader.set({
					center: curPage.getTitle(),
					right: buttons
				});
			} else {
				xHeader.change({
					center: curPage.getTitle(),
					right: buttons
				}, state.transition);
			}
		}

		function doTransition(appName, state) {
			xTransition._module.once(state.transition + 'TransitionEnd', function() {
				switchAppPage(appName, state);
			});
			xTransition._module[state.transition]();
		}

		function handler(state) {
			var appName = state.name.split('.')[0]
				;

			if (curApp !== appName) {

				setHeader(appName, state);

				if (xTransition) {
					doTransition(appName, state);
				} else {
					switchAppPage(appName, state);
				}
			}
		}
			
		navigate.on('forward backward', handler);
	}

	Object.extend(app, {
		init : function(properties) {
			var that = this,
				name = properties.name;

			var Page = AppPage.extend(properties),
				page = new Page({
					routePrefix : app.routePrefix,
					routePrefixSep : app.routePrefixSep
				});

			return (pages[name] = page);
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
	initXHeader();
	initXScroll();
	initXTransition();
	initXViewport();
	initNavigateAction();

	win['app'] = app;
});

require('mix/sln/0.1.0/app');
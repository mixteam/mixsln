//@require message
//@require navigation
//@require template
//@require view
//@require page
//@require navbar
//@require toolbar
//@require content
//@require scroll
//@require transition


(function(win, app, undef) {

var doc = win.document,
	$ = win['$']
	;

var StateStack = app.module.StateStack,
	Message = app.module.MessageScope,
	Navigation = app.module.Navigation,
	Template = app.module.Template,
	View = app.module.View,
	Page = app.module.Page,
	Navbar = app.module.Navbar,
	Toolbar = app.module.Toolbar,
	Content = app.module.Content,
	Scroll = app.module.Scroll,
	Animation = app.module.Animation,
	Transition = app.module.Transition,
	hooks = Message.get('hooks');
	;

app.config = {
	viewport : null,
	enableMessageLog: false,
	enableNavbar : false,
	enableToolbar : false,
	enableContent: true,
	enableScroll : false,
	enableTransition : false,
	templateEngine : null
}

function q(selector, el) {
	el || (el = doc);
	return el.querySelector(selector);
}

// Config Initial
void function () {
	hooks.on('app:start', function() {
		var config = app.config;

		Navbar || (config.enableNavbar = false);
		Toolbar || (config.enableToolbar = false);
		Scroll || (config.enableScroll = false);
		Transition || (config.enableTransition = false);

		config.enableNavbar === true && (config.enableNavbar = {});
		config.enableToolbar === true && (config.enableToolbar = {});
		config.enableScroll === true && (config.enableScroll = {});
		config.enableTransition === true && (config.enableTransition = {});
		typeof config.enableContent !== 'object' && (config.enableContent = {});
	});
}();

// Message Initial
void function () {
}();


//DOM Event Initial
void function() {
	var orientationEvent = 'onorientationchange' in win?'orientationchange':'resize';
	window.addEventListener(orientationEvent, function(e){
		setTimeout(function() {
			hooks.trigger('orientaion:change');
		}, 10);
	}, false);
}();

// Navigation Initial
void function() {
	var navigation = Navigation.instance;

	hooks.on('page:define', function(page) {
		name = page.name;
		route = page.route;

		if (!route) {
			route = {name: name, 'default': true}
		} else if (typeof route === 'string') {
			route = {name: name, text: route}
		}

		navigation.addRoute(route.name, route.text, {
			'default': route['default'],
			callback: route.callback,
			last: route.last
		});
	});

	hooks.on('app:start', function() {
		var lastState, lastPage;

		navigation.on('forward backward', function(state) {
			var page = Page.get(state.name)
			
			hooks.trigger('navigation:switch', state, page, {
				lastState: lastState,
				lastPage: lastPage,
				isSamePage: lastPage && (lastPage.name === page.name),
				isSameState: lastState && StateStack.isEquals(lastState, state)
			});
			lastState = state;
			lastPage = page;
		});
	});
}();

// UI Initial
void function () {
	var config = app.config;

	hooks.on('navigation:switch', function(state, page, options){
		var c_navbar = config.enableNavbar,
			c_toolbar = config.enableToolbar,
			c_content = config.enableContent,
			c_transition = config.enableTransition,
			c_scroll = config.enableScroll,
			move = state.move,
			transition = state.transition
			;

		if (c_navbar) {
			var i_navbar = c_navbar.instance;

			i_navbar.setTitle(page.title);
			i_navbar.removeButton();

			if (page.buttons) {
				page.buttons.forEach(function(button) {
					var handler = button.handler;

					if (button.type === 'back') {
						if (button.autoHide !== false && state.index < 1) {
							button.hide = true;
						}
						if (!handler) {
							handler = button.handler = function() {
								app.navigation.pop();
							}
						}
					}

					if (typeof handler === 'string') {
						handler = page[handler];
					}
					button.handler = function() {
						handler.apply(page, arguments);
					}

					i_navbar.setButton(button);
				});
			}

			if (!options.isSamePage && c_navbar.titleWrapEl.parentNode === c_navbar.backWrapEl.parentNode && 
					c_navbar.titleWrapEl.parentNode === c_navbar.funcWrapEl.parentNode) {
				Transition.float(c_navbar.titleWrapEl.parentNode, transition === 'backward'?'LI':'RI', 50);
			}
		}

		if (c_toolbar) {
			var i_toolbar = c_toolbar.instance;
			page.toolbar?i_toolbar.show(page.toolbar):i_toolbar.hide();
		}

		if (!options.isSamePage) {
			var i_content = c_content.instance;
			
			move === 'backward' ? i_content.previous() : i_content.next();

			if (c_scroll) {
				config.viewport.className += ' enableScroll';
				Scroll.disable(c_scroll.wrapEl);
				c_scroll.wrapEl = i_content.getActive();
				Scroll.enable(c_scroll.wrapEl, page.scroll);
			}

			if (c_transition) {
				config.viewport.className += ' enableTransition';
				var offsetX = c_transition.wrapEl.offsetWidth * (transition === 'backward'?1:-1),
					className = c_transition.wrapEl.className += ' ' + transition,
					activeEl = i_content.getActive()
					;

				Transition.move(c_transition.wrapEl, offsetX, 0, function() {
					c_transition.wrapEl.className = className.replace(' ' + transition, '');
					c_transition.wrapEl.style.left = (-Animation.getTransformOffset(c_transition.wrapEl).x) + 'px';
					i_content.setClassName();
				});
			} else {
				i_content.setClassName();
			}
		}
	});

	hooks.on('navigation:switch orientaion:change', function() {
		var c_navbar = config.enableNavbar,
			c_toolbar = config.enableToolbar,
			c_content = config.enableContent
			;

		var offsetHeight = config.viewport.offsetHeight;
		if (c_navbar) {
			offsetHeight -= c_navbar.wrapEl.offsetHeight;
		}
		if (c_toolbar) {
			offsetHeight -= c_toolbar.wrapEl.offsetHeight;
		}
		c_content.wrapEl.style.height = offsetHeight + 'px';
	});

	hooks.on('app:start', function() {
		var c_navbar = config.enableNavbar,
			c_toolbar = config.enableToolbar,
			c_content = config.enableContent, i_content,
			c_transition = config.enableTransition,
			c_scroll = config.enableScroll
			;

		config.viewport || (config.viewport = q('.viewport'));

		c_content.wrapEl || (c_content.wrapEl = q('section.content', config.viewport));	
		c_content.cacheLength || (c_content.cacheLength = 5);
		i_content = c_content.instance = new Content(c_content.wrapEl, {
			cacheLength: c_content.cacheLength
		});

		if (c_navbar) {
			config.viewport.className += ' enableNavbar';
			c_navbar.wrapEl || (c_navbar.wrapEl = q('header.navbar', config.viewport));
			c_navbar.titleWrapEl || (c_navbar.titleWrapEl = q('header.navbar > ul > li:first-child', config.viewport));
			c_navbar.backWrapEl || (c_navbar.backWrapEl = q('header.navbar > ul > li:nth-child(2)', config.viewport));
			c_navbar.funcWrapEl || (c_navbar.funcWrapEl = q('header.navbar > ul > li:last-child', config.viewport));
			c_navbar.instance = new Navbar(c_navbar.wrapEl, c_navbar);
		}

		if (c_toolbar) {
			config.viewport.className += ' enableToolbar';
			c_toolbar.wrapEl || (c_toolbar.wrapEl = q('footer.toolbar', config.viewport));
			c_toolbar.instance = new Toolbar(c_toolbar.wrapEl, c_toolbar);
		}

		if (c_scroll) {
			c_scroll.wrapEl = i_content.getActive();
		}

		if (c_transition) {
			c_transition.wrapEl = i_content.getActive().parentNode;
		}
	});
}();

//Template Initial
void function () {
	var templatCaches = {};

	function compileTemplate(tpl) {
		if (typeof tpl === 'string') {
			var template = new Template();

			if (templatCaches[tpl]) {
				return templatCaches[tpl];
			} else if (tpl.match(/\.tpl$/g)) {
				return (templatCaches[tpl] = function(datas, callback) {
					if (!template.compileTemplate) {
						template.load(tpl, function(text) {
							template.compile(text);
							callback(template.render(datas));
						});
					} else {
						var html = template.render(datas);
						callback(html);
						return html;
					}
				});
			} else {
				template.compile(tpl);
				return (templatCaches[tpl] = function(datas, callback) {
					var html = template.render(datas);
					callback(html);
					return html;
				});
			}
		} else if (typeof tpl === 'function'){
			return tpl;
		} else if (typeof tpl === 'object') {
			for (var name in tpl) {
				tpl[name] = compileTemplate(tpl[name]);
			}
			return tpl;
		}
	}

	hooks.on('view:extend', function(view) {
		if (view.prototype.template) {
			view.prototype.template = compileTemplate(view.prototype.template);
		}
	});

	hooks.on('page:define', function(page) {
		if (page.template) {
			page.template = compileTemplate(page.template);
		}
	});
}();


//Plugin Initial
void function () {

	hooks.on('app:start', function() {
		for (var name in app.plugin) {
			var plugin = app.plugin[name];
			plugin.onAppStart && plugin.onAppStart();
		}
	});

	hooks.on('view:render', function(view) {
		if (view.plugins) {
			for (var name in view.plugins) {
				var plugin = app.plugin[name], pluginOpt = view.plugins[name]
					;

				pluginOpt === true && (pluginOpt = view.plugins[name] = {});
				if (plugin && pluginOpt) {
					plugin.onViewRender && plugin.onViewRender(view, pluginOpt);
				}
			}
		}
	});

	hooks.on('view:destory', function(view) {
		if (view.plugins) {
			for (var name in view.plugins) {
				var plugin = app.plugin[name], pluginOpt = view.plugins[name]
					;

				if (plugin && pluginOpt) {
					plugin.onViewTeardown && plugin.onViewTeardown(view, pluginOpt);
				}
			}
		}
	});

	hooks.on('navigation:switch', function(state, page) {
		if (page.plugins) {
			for (var name in page.plugins) {
				var plugin = app.plugin[name], pluginOpt = page.plugins[name]
					;

				if (plugin && pluginOpt) {
					state.plugins || (state.plugins = {});
					state.plugins[name] || (state.plugins[name] = {});
					if (typeof pluginOpt === 'object') {
						for (var p in pluginOpt) {
							state.plugins[name][p] = pluginOpt[p];
						}
					}
					plugin.onNavigationSwitch && plugin.onNavigationSwitch(page, state.plugins[name]);
				}
			}
		}
	});

	hooks.on('page:startup', function(state, page) {
		if (page.plugins) {
			for (var name in page.plugins) {
				var plugin = app.plugin[name], pluginOpt = state.plugins[name]
					;

				if (plugin && pluginOpt) {
					plugin.onPageStartup && plugin.onPageStartup(page, pluginOpt);
				}
			}
		}
	});

	hooks.on('page:teardown', function(state, page) {
		if (page.plugins) {
			for (var name in page.plugins) {
				var plugin = app.plugin[name], pluginOpt = state.plugins[name]
					;

				if (plugin && page.plugins[name]) {
					plugin.onPageTeardown && plugin.onPageTeardown(page, pluginOpt);
				}
			}
		}
	});
}();

//View Intial
void function () {
	hooks.on('view:extend', function(view) {
		var render = view.prototype.render,
			destory = view.prototype.destory
			;

		view.prototype.render = function() {
			hooks.trigger('view:render', this, arguments);
			render.apply(this, arguments);
		}

		view.prototype.destory = function() {
			hooks.trigger('view:destory', this, arguments);
			destory.apply(this, arguments);
		}
	});
}();

//Page Initial
void function () {
	var config = app.config;

	hooks.on('page:define', function(page) {
		page.html = function(html) {
			config.enableContent.instance.html(html);
		}

		Object.defineProperty(page, 'el', {
			get: function() {
				return config.enableContent.instance.getActive();
			}
		});

		if ($) {
			Object.defineProperty(page, '$el', {
				get: function() {
					return $(config.enableContent.instance.getActive());
				}
			});
		}
	});

	hooks.on('navigation:switch', function(state, page, options) {
		var lastDataFragment = page.el.getAttribute('data-fragment'),
			curDataFragment = state.fragment;

		if (lastDataFragment === curDataFragment) {
			return;
		}
		page.el.setAttribute('data-fragment', curDataFragment);

		if (options.lastState && options.lastPage) {
			hooks.trigger('page:teardown', options.lastState, options.lastPage);
			options.lastPage.teardown();
		}
		hooks.trigger('page:startup', state, page);
		page.startup();
	});
}();

app.start = function() {
	// var placeholder = doc.createElement('div');
	// placeholder.style.cssText = 'width:100%;height:200%;'
	// doc.body.appendChild(placeholder);
	// doc.body.style.height = "200%";

	// setTimeout(scrollTo, 0, 0, 1);
	setTimeout(function(){
		//doc.body.removeChild(placeholder);
		hooks.trigger('app:start');
		Navigation.instance.start();
	}, 500);
}

app.extendView = function(properties) {
	var ChildView = View.extend(properties);
	hooks.trigger('view:extend', ChildView);
	return ChildView;
}

app.getView = function(name) {
	return new (View.get(name));
}

app.definePage = function(properties) {
	var page = Page.define(properties);
	hooks.trigger('page:define', page);
	return page;
}

app.getPage = function(name) {
	return Page.get(name);
}

app.navigation = {
	push: function(fragment, options) {
		Navigation.instance.push(fragment, options);
	},

	pop: function() {
		Navigation.instance.pop();
	},

	getParameter: function(name) {
		var stack = Navigation.instance.getStack(),
			state = stack.getState();

		return state.params[name] || state.args[name] || state.datas[name];
	},

	getData: function(name) {
		var stack = Navigation.instance.getStack(),
			state = stack.getState();

		return state.datas[name];
	},

	setData: function(name, value) {
		var stack = Navigation.instance.getStack(),
			state = stack.getState();

		state.datas[name] = value;
	},

	setTitle: function(title) {
		if (app.config.enableNavbar) {
			app.config.enableNavbar.instance.setTitle(title);
		}
	},

	setButton: function(options) {
		if (app.config.enableNavbar) {
			app.config.enableNavbar.instance.setButton(options);
		}
	}
}

})(window, window['app']||(window['app']={module:{},plugin:{}}));
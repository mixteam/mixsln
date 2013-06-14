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

var Message = app.module.Message,
	Navigation = app.module.Navigation,
	Template = app.module.Template,
	View = app.module.View,
	Page = app.module.Page,
	Navbar = app.module.Navbar,
	Toolbar = app.module.Toolbar,
	Content = app.module.Content,
	Scroll = app.module.Scroll,
	Animation = app.module.Animation,
	Transition = app.module.Transition
	;

var hooks = {
	extendView: [],
	definePage: [],
	switchNavigation: [],
	changeOrientation: [],
	appStart: []
};

app.config = {
	viewport : null,
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
	hooks.appStart.push(function() {
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

	})
}();

// Message Initial
void function () {
	hooks.appStart.push(function() {

	});
}();

// Navigation Initial

void function() {
	var H_definePage = hooks.definePage,
		H_switchNavigation = hooks.switchNavigation,
		navigation = Navigation.instance;

	H_definePage.push(function(page) {
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

	hooks.appStart.push(function() {
		navigation.on('forward backward', function(state) {
			var page = Page.get(state.name);
			H_switchNavigation.forEach(function(func) {
				func(state, page);
			});
		});
	});
}();

// UI Initial
void function () {
	var H_switchNavigation = hooks.switchNavigation,
		H_changeOrientation = hooks.changeOrientation;

	function refreshContent() {
		var config = app.config
			c_navbar = config.enableNavbar,
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
	}

	H_switchNavigation.push(function(state, page){
		var config = app.config,
			c_navbar = config.enableNavbar,
			c_toolbar = config.enableToolbar,
			transition = state.transition
			;

		if (c_navbar) {
			var i_navbar = c_navbar.instance;

			i_navbar.setTitle(page.title);
			i_navbar.removeButton();

			if (page.buttons) {
				page.buttons.forEach(function(button) {
					if (button.type === 'back' && button.autoHide !== false && state.index <= 1) {
						button.hide = true;
					}
					i_navbar.setButton(button);
				});
			}

			if (c_navbar.titleWrapEl.parentNode === c_navbar.backWrapEl.parentNode && 
					c_navbar.titleWrapEl.parentNode === c_navbar.funcWrapEl.parentNode) {
				Transition.float(c_navbar.titleWrapEl.parentNode, transition === 'backward'?'LI':'RI', 50);
			}
		}

		if (c_toolbar) {
			var i_toolbar = c_toolbar.instance;
			page.toolbar?i_toolbar.show(page.toolbar):i_toolbar.hide();
		}
	});

	H_switchNavigation.push(refreshContent);
	H_changeOrientation.push(refreshContent);

	hooks.appStart.push(function() {
		var config = app.config,
			c_navbar = config.enableNavbar,
			c_toolbar = config.enableToolbar,
			c_content = config.enableContent
			;

		config.viewport || (config.viewport = q('.viewport'));

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

		c_content.wrapEl || (c_content.wrapEl = q('section.content', config.viewport));	
		c_content.cacheLength || (c_content.cacheLength = 5);
		c_content.instance = new Content(c_content.wrapEl, {
			cacheLength: c_content.cacheLength
		});
	});
}();

//Animation Initial

void function () {
	var H_switchNavigation = hooks.switchNavigation;

	H_switchNavigation.push(function(state, page){
		var config = app.config,
			i_content = config.enableContent.instance,
			c_transition = config.enableTransition,
			c_scroll = config.enableScroll,
			move = state.move,
			transition = state.transition
			;

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
				activeEl = i_content.getActive(),
				index = parseInt(activeEl.getAttribute('index'))
				;

			if (transition === 'backward' && index === c_content.cacheLength - 1) {
				console.log('moveback');
			} else if (transition === 'forward' && index === 0) {
				console.log('movefor');
			}

			Transition.move(c_transition.wrapEl, offsetX, 0, function() {
				c_transition.wrapEl.className = className.replace(' ' + transition, '');
				c_transition.wrapEl.style.left = (-Animation.getTransformOffset(c_transition.wrapEl).x) + 'px';
				i_content.setClassName();
			});
		} else {
			i_content.setClassName();
		}

	});

	hooks.appStart.push(function() {
		var config = app.config,
			i_content = config.enableContent.instance,
			c_transition = config.enableTransition,
			c_scroll = config.enableScroll
			;

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
	hooks.appStart.push(function() {
		
	});
}();

//View Intial
void function () {
	hooks.appStart.push(function() {
		
	});
}();

//Page Initial
void function () {
	var H_switchNavigation = hooks.switchNavigation,
		config = app.config,
		navigation = Navigation.instance,

		protoExtension = {
			navigation: {
				push: function(fragment, options) {
					navigation.push(fragment, options);
				},

				pop: function() {
					navigation.pop();
				},

				getParameter: function(name) {
					var stack = navigation.getStack(),
						state = stack.getState();

					return state.params[name] || state.args[name] || state.datas[name];
				},

				getData: function(name) {
					var stack = navigation.getStack(),
						state = stack.getState();

					return state.datas[name];
				},

				setData: function(name, value) {
					var stack = navigation.getStack(),
						state = stack.getState();

					state.datas[name] = value;

				},

				setTitle: function(title) {
					if (config.enableNavbar) {
						config.enableNavbar.instance.setTitle(title);
					}
				},

				setButton: function(options) {
					if (config.enableNavbar) {
						config.enableNavbar.instance.setButton(options);
					}
				}
			},

			content: {
				html: function(html) {
					config.enableContent.instance.html(html);
				}
			}
		}

	Object.defineProperty(protoExtension.content, 'el', {
		get: function() {
			return i_content.getActive();
		}
	});

	if ($) {
		Object.defineProperty(protoExtension.content, '$el', {
			get: function() {
				return $(i_content.getActive());
			}
		});
	}

	for (var p in protoExtension) {
		Page.prototype[p] = protoExtension[p];
	}

	H_switchNavigation.push(function(state, page) {
		page.startup();
	});

	hooks.appStart.push(function() {
		
	});
}();

//Plugin Initial
void function () {
	hooks.appStart.push(function() {
		
	});
}();

app.start = function() {
	hooks.appStart.forEach(function(func) {
		func();
	});
	Navigation.instance.start();
}

app.extendView = function(properties) {
	var view = View.extend(properties);

	hooks.extendView.forEach(function(func) {
		func(view);
	})

	return view;
}

app.definePage = function(properties) {
	var page = Page.define(properties);

	hooks.definePage.forEach(function(func) {
		func(page);
	});

	return page;
}

})(window, window['app']||(window['app']={module:{},plugin:{}}));
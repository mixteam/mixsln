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
	Transition = app.module.Transition
	;

var hooks = {
	extendView: [],
	definePage: [],
	switchNavigation: []
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

var ConfigInitial = (function () {
	return function() {
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

	}
})();

var MessageInitial = (function () {
	return function() {

	}
})();

var NavigationInitial = (function() {
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

		navigation.instance.addRoute(route.name, route.text, {
			'default': route['default'],
			callback: route.callback,
			last: route.last
		});
	});

	return function() {
		navigation.on('forward backward', function(state) {
			var page = Page.get(state.name);
			H_switchNavigation.forEach(function(func) {
				func(state, page);
			});
		});
	}
})();

var UIInitial = (function () {
	var H_switchNavigation = hooks.switchNavigation;

	H_switchNavigation.push(function(state, page){
		var config = app.config,
			c_navbar = config.enableNavbar,
			c_toolbar = config.enableToolbar
			;

		if (c_navbar) {
			var i_navbar = c_navbar.instance;

			i_navbar.setTitle(page.title);
			i_navbar.removeButton();

			if (page.buttons) {
				page.buttons.forEach(function(button) {
					i_navbar.setButton(button);
				});
			}

			if (c_navbar.titleWrapEl.parentNode === c_navbar.backWrapEl.parentNode && 
					c_navbar.titleWrapEl.parentNode === c_navbar.funcWrapEl.parentNode) {
				Transition.float(c_navbar.titleWrapEl.parentNode, transition === 'backward' ? 'RI' : 'LI', 50);
			}
		}

		if (c_toolbar && page.toolbar) {
			i_navbar.show(page.toolbar);
		} else {
			i_navbar.hide();
		}
	});

	return function() {
		var config = app.config,
			c_navbar = config.enableNavbar,
			c_toolbar = config.enableToolbar,
			c_content = config.enableContent
			;

		config.viewport || (config.viewport = q('.viewport'));

		if (c_navbar) {
			c_navbar.wrapEl || (c_navbar.wrapEl = q('header.navbar', config.viewport));
			c_navbar.titleWrapEl || (c_navbar.titleWrapEl = q('header.navbar > ul > li:nth-child(2)', config.viewport));
			c_navbar.backWrapEl || (c_navbar.backWrapEl = q('header.navbar > ul > li:nth-child(2)', config.viewport));
			c_navbar.funcWrapEl || (c_navbar.funcWrapEl = q('header.navbar > ul > li:last-child', config.viewport));
			c_navbar.instance = new Navbar(c_navbar.wrapEl, c_navbar);
		}

		if (c_toolbar) {
			c_toolbar.wrapEl || (c_toolbar.wrapEl = q('footer.toolbar', config.viewport));
			c_toolbar.instance = new Toolbar(c_toolbar.wrapEl, c_toolbar);
		}

		c_content.wrapEl || (c_content.wrapEl = q('section.content', config.viewport));	
		c_content.cacheLength || (c_content.cacheLength = 3);
		c_content.instance = new Content(c_content.wrapEl, {
			cacheLength: c_content.cacheLength
		});
	}
})();

var AnimInitial = (function () {
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
			Scroll.disable(c_scroll.wrapEl);
			c_scroll.wrapEl = i_content.getActive();
			Scroll.enable(c_scroll.wrapEl, page.scroll);
		}

		if (c_transition) {
			var offsetX = c_transition.wrapEl.offsetWidth * (transition === 'backward'?1:-1),
				className = c_transition.wrapEl.className += ' ' + transition
				;

			Transition.move(c_transition.wrapEl, offsetX, 0, function() {
				c_transition.wrapEl.className = className.replace(' ' + transition, '');
				i_content.setClassName();
			});
		} else {
			i_content.setClassName();
		}

	});

	return function() {
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
	}
})();

var TemplateInitial = (function () {
	return function() {
		
	}
})();

var ViewIntial = (function () {
	return function() {
		
	}
})();

var PageInitial = (function () {
	var H_switchNavigation = hooks.switchNavigation,

		config = app.config,
		i_content = config.enableContent.instance,
		c_navbar = config.enableNavbar,
		c_toolbar = config.enableNavbar,
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
					if (c_navbar) {
						c_navbar.instance.setTitle(title);
					}
				},

				setButton: function(options) {
					if (c_navbar) {
						c_navbar.instance.setButton(options);
					}
				}
			},

			content: {
				html: function(html) {
					i_content.html(html);
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

	return function() {
		
	}
})();

var PluginInitial = (function () {
	return function() {
		
	}
})();

app.start = function() {}

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
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

var doc = win.document
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
	defineView: [],
	definePage : [],
	navigation: []
};

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

		config.enableNavbar === 'true' && (config.enableNavbar = {});
		config.enableToolbar === 'true' && (config.enableToolbar = {});
		config.enableContent === 'true' && (config.enableContent = {});
		config.enableScroll === 'true' && (config.enableScroll = {});
		config.enableTransition === 'true' && (config.enableTransition = {});
	}
})();

var MessageInitial = (function () {
	return function() {

	}
})();

var NavigationInitial = (function() {
	var H_definePage = hooks.definePage,
		H_navigation = hooks.navigation,
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
			H_navigation.forEach(function(func) {
				func(state, page);
			});
		});
	}
})();

var UIInitial = (function () {
	var H_navigation = hooks.navigation;

	H_navigation.push(function(state, page){
		var config = app.config,
			c_navbar = config.enableNavbar,
			c_toolbar = config.enableToolbar,
			c_content = config.enableContent,
			c_transition = config.enableTransition,
			c_scroll = config.enableScroll
			;

		var move = state.move,
			transition = state.transition,
			contentMove
			;

		if (c_navbar) {
			c_navbar.instance.setTitle(page.title);
			c_navbar.removeButton();
			page.buttons && page.buttons.forEach(function(button) {
				c_navbar.setButton(button);
			});

			if (c_navbar.animWrapEl) {
				var type = transition === 'backward' ? 'RI' : 'LI',
					offset = 50;

				Transition.float(c_navbar.animWrapEl, type, offset);
			}
		}

		if (c_toolbar) {
			if (page.toolbar) {
				c_toolbar.instance.show(page.toolbar);
			} else {
				c_toolbar.instance.hide();
			}
		}

		if (c_content) {
			c_transition && (c_transition.wrapEl = c_content.cacheWrapEl);

			if (c_scroll) {
				Scroll.disable(c_scroll.wrapEl);
				c_scroll.wrapEl = (move === 'backward' ? c_content.instance.getPrevious() : c_content.instance.getNext())
			}

			contentMove = function() {
				move === 'backward' ? c_content.instance.previous() : c_contentinstance.next();
			}
		}

		if (c_scroll) {
			Scroll.enable(c_scroll.wrapEl, page.scroll || {});
		}

		if (c_transition) {
			var offsetX = c_transition.wrapEl.offsetWidth * (transition === 'backward'?1:-1);
				className = c_transition.wrapEl.className += ' ' + transition;

			Transition.move(c_transition.wrapEl, offsetX, 0, function() {
				c_transition.wrapEl.className = className.replace(' ' + transition, '');
				contentMove && contentMove();
			});
		} else {
			contentMove && contentMove();
		}

	});

	return function() {
		var config = app.config;

		config.viewport || (config.viewport = q('.viewport'));

		if (config.enableNavbar) {
			var c_navbar = config.enableNavbar;
			c_navbar.wrapEl || (c_navbar.wrapEl = q('header.navbar', config.viewport));
			c_navbar.animWrapEl || (c_navbar.animWrapEl = q('header.navbar > ul', config.viewport));
			c_navbar.titleWrapEl || (c_navbar.titleWrapEl = q('header.navbar > ul > li:nth-child(2)', config.viewport));
			c_navbar.backWrapEl || (c_navbar.backWrapEl = q('header.navbar > ul > li:nth-child(2)', config.viewport));
			c_navbar.funcWrapEl || (c_navbar.funcWrapEl = q('header.navbar > ul > li:last-child', config.viewport));
			c_navbar.instance = new Navbar(c_navbar.wrapEl, c_navbar);
		}

		if (config.enableToolbar) {
			var c_toolbar = config.enableToolbar;
			c_toolbar.wrapEl || (c_toolbar.wrapEl = q('footer.toolbar', config.viewport));
			c_toolbar.instance = new Toolbar(c_toolbar.wrapEl, c_toolbar);
		}

		if (config.enableContent) {
			var c_content = config.enableContent;
			c_content.wrapEl || (c_content.wrapEl = q('section.content', config.viewport));
			c_content.cacheWrapEl || (c_content.cacheWrapEl = q('section.content > div', content.viewport));
			c_content.cacheLength || (c_content.cacheLength = 5);
			c_content.instance = new Content(c_content.wrapEl, c_content);
		}

		if (config.enableTransition) {
			var c_transition = config.enableTransition;
			c_transition.wrapEl || (c_content.wrapEl = q('section.content > div', config.viewport));
		}

		if (config.enableScroll) {
			var c_scroll = config.enableScroll;
			c_scroll.wrapEl || (c_scroll.wrapEl = q('section.content > div', config.viewport));
		}
	}
})();

var AnimInitial = (function () {
	return function() {
		
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
	return function() {
		
	}
})();

var PluginInitial = (function () {
	return function() {
		
	}
})();


app.config = {
	viewport : null,
	enableNavbar : false,
	enableToolbar : false,
	enableContent: false,
	enableScroll : false,
	enableTransition : false,
	templateEngine : null
}

app.start = function() {}

app.extendView = function(properties) {
	var view = View.extend(properties);
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
define(function(require, exports, module) {

require('reset');

var win = window,
	doc = win.document,

	Class = require('class'),
	router = require('router').singleton,
	navigate = require('navigate').singleton,

	Page = require('./modules/page'),
	Component = require('./modules/component'),
	Navigation = require('./modules/navigation')

	app = {}
	;

	function initComponent() {
		var viewport = app.config.viewport,
			titlebar = viewport.querySelector('header.titlebar'),
			backBtn = titlebar.querySelector('button.back'),
			funcBtn = titlebar.querySelector('button.func')
			content = viewport.querySelector('section.content'),
			toolbar = viewport.querySelector('footer.toolbar')
			;

		Component.initViewport(viewport);

		if (app.config.enableTitlebar) {
			Component.initTitlebar(titlebar);
			Component.initBackBtn(backBtn);
			Component.initFuncBtn(funcBtn);
		}

		Component.initContent(content);

		if (app.config.enableScroll) {
			Component.initScroll(content);
		}

		if (app.config.enableTransition) {
			Component.initTransition(content);
		}

		if (app.config.enableToolbar) {
			Component.initToolbar();
		}

	}

	function initNavigation() {
		var curNav,
			titlebar = Component.get('titlebar'),
			backBtn = Component.get('backBtn'),
			funcBtn = Component.get('funcBtn'),
			funcBtnHandler = null,
			content = Component.get('content'),
			transition = Component.get('transition')
			;

		Component.on('backBtnClick', function (el) {
			navigate.backward();
		});
		Component.on('funcBtnClick', function(el) {
			funcBtnHandler && funcBtnHandler(el);
		});

		function setButtons(navigation) {
			var appName = navigation.appName,
				page = Page.get(appName),
				buttons = page.buttons
				;

			backBtn.fn.hide();
			funcBtn.fn.hide();

			buttons && Object.each(buttons, function(item) {
				var type = item.type;

				switch (type) {
					case 'back':
						backBtn.fn.setText(item.text);
						if (navigate.getStateIndex() >= 1) {
							backBtn.fn.show();
						}
						break;
					case 'func':
						funcBtn.fn.setText(item.text);
						funcBtnHandler = item.handler;
						funcBtn.fn.show();
						break;
					default:
						break;
				}
			});
		}

		function setTitlebar(navigation) {
			var appName = navigation.appName,
				transition = navigation.state.transition,
				page = Page.get(appName),
				title = page.getTitle()
				;

			titlebar.fn.change(title, transition);
		}

		function switchNavigation(newNav) {
			if (app.config.enableTransition) {
				transition.fn[newNav.state.transition]();		
			} else {
				content.fn.switchActive();
				content.fn.setClass();
			}

			curNav && curNav.unload();
			newNav.ready();
			newNav.compile();
			curNav = newNav;
		}

		navigate.on('forward backward', function (state) {
			var navigation = new Navigation(state)
				;

			switchNavigation(navigation);
			
			if (app.config.enableTitlebar) {
				setButtons(navigation);
				setTitlebar(navigation);
			}
		});

		Page.each(function(page) {
			var name = page.name,
				route = page.route
				;

			if (!route) {
				route = {name : 'default', 'default' : true}
			} else if (Object.isTypeof(route, 'string')) {
				route = {name : 'anonymous', text : route}
			}

			navigate.addRoute(name + '.' + route.name, route.text, route);

			page.on('rendered', function(html) {
				var scroll = Component.get('scroll'),
					active = Component.getActiveContent()
					;

				active && (active.innerHTML = html);
				scroll && scroll.fn.refresh();
			});
		});
	}

	Object.extend(app, {
		config : {
			viewport : null,
			theme : 'iOS',
			routePrefix : 0, // 0 - no prefix, 1 - use app.name, 'any string' - use 'any string'
			routePrefixSep : '\/',
			enableTitlebar : false,
			enableScroll : false,
			enableTransition : false,
			enableToolbar : false
		},
		page : Page,
		component : Component,
		plugin : {},

		loadFile : function(url, callback) {
			var xhr = new win.XMLHttpRequest()
				;

			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4 &&
						((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304)) {
					callback(xhr.responseText);
				}
			}
			xhr.open('GET', url, true);
			xhr.send();
		},

		start : function() {
			initComponent();
			initNavigation();
			app.plugin.init && app.plugin.init();
			router.start();
		}
	});

	win['app'] = app;
});

require('app');
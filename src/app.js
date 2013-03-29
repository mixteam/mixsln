define(function(require, exports, module) {

require('reset');

var win = window,
	doc = win.document,

	Class = require('class'),
	router = require('router').singleton,
	navigate = require('navigate').singleton,

	View = require('./modules/view'),
	Page = require('./modules/page'),
	Component = require('./modules/component'),
	Navigation = require('./modules/navigation')

	app = {}
	;

	function initComponent() {
		var viewport = app.config.viewport,
			navibar = viewport.querySelector('header.navibar'),
			backBtn = navibar.querySelector('li:nth-child(2) button'),
			funcBtn = navibar.querySelector('li:nth-child(3) button')
			content = viewport.querySelector('section.content'),
			toolbar = viewport.querySelector('footer.toolbar')
			;

		Component.initViewport(viewport);

		if (app.config.enableNavibar) {
			Component.initNavibar(navibar);
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
		var navibar = Component.get('navibar'),
			backBtn = Component.get('backBtn'),
			funcBtn = Component.get('funcBtn'),
			backBtnHandler = null,
			funcBtnHandler = null,
			content = Component.get('content'),
			transition = Component.get('transition')
			;

		Component.on('backBtnClick', function () {
			if (backBtnHandler) {
				backBtnHandler();
			} else {
				navigate.backward();
			}
		});
		Component.on('funcBtnClick', function() {
			funcBtnHandler && funcBtnHandler();
		});

		function setButtons(navigation) {
			var pageName = navigation.pageName,
				page = Page.get(pageName),
				buttons = page.buttons
				;

			backBtn.fn.hide();
			funcBtn.fn.hide();

			buttons && Object.each(buttons, function(item) {
				var type = item.type,
					isShow = false;

				switch (type) {
					case 'back':
						backBtn.fn.setText(item.text);
						backBtnHandler = item.handler;
						if (item.autoHide === false || 
								navigate.getStateIndex() >= 1) {
							backBtn.fn.show();
							isShow = true;
						}
						break;
					case 'func':
						funcBtn.fn.setText(item.text);
						funcBtnHandler = item.handler;
						funcBtn.fn.show();
						isShow = true;
						break;
					default:
						break;
				}

				if (isShow && item.onshow) {
					item.onshow.call(backBtn);
				}
			});
		}

		function setNavibar(navigation) {
			var pageName = navigation.pageName,
				transition = navigation.state.transition,
				page = Page.get(pageName),
				title = page.getTitle()
				;

			navibar.fn.change(title, transition);
		}

		function switchNavigation(navigation) {
			if (app.config.enableTransition) {
				transition.fn[navigation.state.transition]();
			} else {
				content.fn.switchActive();
				content.fn.toggleClass();
			}

			if (app.navigation._cur) {
				app.navigation._cur.unload();
			}
			app.navigation._cur = navigation;
			navigation.ready();
			//navigation.compile();
			
		}

		navigate.on('forward backward', function (state) {
			var navigation = new Navigation(state)
				;

			switchNavigation(navigation);
			if (app.config.enableNavibar) {
				setButtons(navigation);
				setNavibar(navigation);
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

			page.on('rendered', function(content) {
				var scroll = Component.get('scroll'),
					active = Component.getActiveContent()
					;

				active && (active.innerHTML = content);
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
			enableToolbar : false,
			templateEngine : null
		},
		view : View,
		page : Page,
		component : Component,
		navigation : Navigation,
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
(function(win, app, undef) {

var doc = win.document,

	router = app._module.router.instance,
	navigate = app._module.navigate.instance,

	View = app._module.view,
	Page = app._module.page,
	Component = app._module.component,
	Navigation = app._module.navigation
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
		Component.initContent(content);

		if (app.config.enableTransition) {
			Component.initTransition(content);
		}

		if (app.config.enableToolbar) {
			Component.initToolbar();
		}
	}

	function initNavigation() {
		var content = Component.get('content'),
			transition = Component.get('transition')
			;

		win.addEventListener(window.onpagehide?'pagehide':'unload', function() {
			app.hybrid.resetNavigationBar();
		}, false);

		doc.addEventListener('navigation.back', function() {
			navigate.backward();
		}, false);

		function setNavibar(navigation, move) {
			var pageName = navigation.pageName,
				transition = navigation.state.transition,
				page = Page.get(pageName),
				title = page.getTitle()
				;

			move ? app.hybrid.switchNavigationBar(title, transition, doc.location.href) :
					app.hybrid.setTitle(title);
		}

		function switchContent(navigation, callback) {
			if (app.config.enableTransition) {
				transition.fn[navigation.state.transition]();
				Component.once('forwardTransitionEnd backwardTransitionEnd', callback);
			} else {
				if (content) {
					content.fn.switchActive();
					content.fn.toggleClass();
				}
				callback();
			}
		}

		function switchNavigation(navigation) {
			if (app.navigation._cur) {
				app.navigation._cur.unload();
			}
			app.navigation._cur = navigation;
		}

		function loadNavigation(navigation) {
			navigation.load(function() {
				navigation.ready();
			});
		}

		navigate.on('forward backward', function (state) {
			var navigation = new Navigation(state)
				;

			switchNavigation(navigation);
			switchContent(navigation, function() {
				loadNavigation(navigation);	
			});
		});
	}


	app.hybrid = {
		resetNavigationBar : function (successCallback, failedCallback) {
			if (!window.callObjMethod) return failedCallback && failedCallback();
			var p = {};
			callObjMethod('TBNavigationBar', 'resetNavigationBar', p, successCallback, failedCallback);
		},

		switchNavigationBar : function (navTitle, type, token, successCallback, failedCallback) {
			if (!window.callObjMethod) return failedCallback && failedCallback();
			var p = {
				title : navTitle,
				type : type,
				t : token
			};
			
			callObjMethod('TBNavigationBar', 'setNavigationBar', p, successCallback, failedCallback);
		},

		setTitle : function (navTitle, successCallback, failedCallback) {
			if (!window.callObjMethod) return failedCallback && failedCallback();
			var p = {
				title : navTitle
			};

			callObjMethod('TBNavigationBar', 'setNavigationTitle', p, successCallback, failedCallback);
		},

		isReady : function (successCallback, failedCallback) {
			if (!window.callObjMethod) return failedCallback && failedCallback();
			var p = {};
			callObjMethod('TBNavigationBar', 'isReady', p, successCallback, failedCallback);
		}
	}

	app.config = {
		viewport : null,
		theme : 'iOS',
		routePrefix : 0, // 0 - no prefix, 1 - use app.name, 'any string' - use 'any string'
		routePrefixSep : '\/',
		enableNavibar : false,
		enableScroll : false,
		enableTransition : false,
		enableToolbar : false,
		templateEngine : null
	}
		
	app.loadFile = function(url, callback) {
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
	}

	app.start = function() {
		initComponent();
		initNavigation();
		app.plugin.init && app.plugin.init();
		app.hybrid.isReady(function() {
			router.start();	
		}, function() {
			router.start();
		});
	}
})(window, window['app']||(window['app']={_module:{},plugin:{}}));

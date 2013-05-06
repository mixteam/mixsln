(function(win, app, undef) {

var util = app.util,
    Message = app._module.message,
    navigate = app._module.navigate.instance,
    View = app.view,

    STATUS = {
		'DEFINED' : 0,
		'UNLOADED' : 1,
		'LOADED' : 2,
		'READY' : 3
	},
	pages = {}
	;

function Page() {
	var that = this,
		name = that.name,
		msgContext = new Message('page.' + name)
		;

	Message.mixto(this, msgContext);
	View.apply(that, arguments);
	that.status = STATUS.DEFINED;
}

var proto = {
	getTitle : function() {
		//can overrewite
		return this.title;
	},

	fill : function(datas, callback) {
		var that = this, html
			;

		if (util.isTypeof(datas, 'string')) {
			html = datas;
		} else {
			html = that.renderTemplate(datas);
		}

		app.component.fillActiveContent(html);
		callback && callback();
	},

	ready : function() {/*implement*/},
	unload : function() {/*implement*/}
}

util.inherit(Page, View);
util.extend(Page.prototype, proto);

Page.STATUS = STATUS;
Page.global = {};
Page.fn = {};
var isExtend = false;
function extendPageFn() {
	if (!isExtend) {
		isExtend = true;
		util.extend(Page.prototype, Page.fn);
	}
}
Page.define = function(properties) {
	extendPageFn();

	function ChildPage() {
		Page.apply(this, arguments);
		this.initialize && this.initialize.apply(this, arguments);
	}
	util.inherit(ChildPage, Page);
	util.extend(ChildPage.prototype, properties);

	var	iPage = new ChildPage(),
		name, route
		;

	util.each(Page.global, function(val, name) {
		var type = util.isTypeof(val);

		switch (type){
			case 'array':
				iPage[name] = val.slice(0).concat(iPage[name] || []);
				break;
			case 'object':
				iPage[name] = util.extend(val, iPage[name] || {});
				break;
			case 'string':
			case 'number':
				(iPage[name] == null) && (iPage[name] = val);
				break;
		}
	});

	name = iPage.name;
	route = iPage.route;

	if (!route) {
		route = {name: 'default', 'default': true}
	} else if (util.isTypeof(route, 'string')) {
		route = {name: 'anonymous', text: route}
	}

	navigate.addRoute(name + '.' + route.name, route.text, route);

	return (pages[iPage.name] = iPage);
}
Page.get = function(name) {
	return pages[name];
}
Page.each = function(delegate) {
	util.each(pages, delegate);
}

app.page = app._module.page = Page;

})(window, window['app']||(window['app']={}));
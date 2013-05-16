(function(win, app, undef) {

var util = app.util,
	viewIdx = 0,
	views = {}
	;

function View() {
	var that = this,
		name = that.name
		;

	that._vid = name + '-' + Date.now() + '-' + (viewIdx++);
	that.views || (that.views = {});
}

var proto = {
	loadTemplate: function(url, callback) {
		// can overwrite
		var that = this
			;

		if (arguments.length === 1) {
			callback = arguments[0];
			url = that.template;
		}

		if (url) {
			util.loadFile(url, callback);
		} else {
			callback();
		}
	},

	compileTemplate: function(text, callback) {
		// can overwrite
		var that = this,
			engine = app.config.templateEngine
			;

		if (engine && engine.compile && util.isTypeof(text, 'string')) {
			text = engine.compile(text);
		}

		if (callback) {
			callback(text);
		} else {
			return text;
		}
	},

	renderTemplate: function(datas, callback) {
		// can overwrite
		var that = this,
			engine = app.config.templateEngine,
			compiledTemplate = that.compiledTemplate,
			content = ''
			;

		if (engine && engine.render && util.isTypeof(datas, 'object') && compiledTemplate) {
			content = engine.render(compiledTemplate, datas);
		} else {
			content = compiledTemplate;
		}

		if (callback) {
			callback(content);
		} else {
			return content;
		}
	}
}
util.extend(View.prototype, proto);

View.fn = {};
var isExtend = false;
function extendViewFn() {
	if (!isExtend) {
		isExtend = true;
		util.extend(View.prototype, View.fn);
	}
}
View.define = function(properties) {
	extendViewFn();

	function ChildView() {
		View.apply(this, arguments);
		this.initialize && this.initialize.apply(this, arguments);
	}
	util.inherit(ChildView, View);
	util.extend(ChildView.prototype, properties);
	

	return (views[properties.name] = ChildView);
}
View.get = function(name) {
	return views[name];
}
View.each = function(delegate) {
	util.each(views, delegate);
}

app.view = app._module.view = View;

})(window, window['app']||(window['app']={_module:{},plugin:{}}));
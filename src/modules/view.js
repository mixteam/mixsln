define(function(require, exports, module) {
require('reset');

var win = window,
    doc = win.document,
    Class = require('class'),

	views = {},
	vAutoIdx = 0,
	View = Class.create({
		initialize: function() {
			var that = this,
				name = that.name
				;

			that._vid = name + '-' + Date.now() + '-' + (vAutoIdx++);
			that.views || (that.views = {});
		},

		loadTemplate: function(url, callback) {
			// can overwrite
			var that = this
				;

			if (arguments.length === 1) {
				callback = arguments[0];
				url = that.template;
			}

			url && app.loadFile(url, callback);
		},

		compileTemplate: function(text, callback) {
			// can overwrite
			var that = this,
				engine = app.config.templateEngine
				;

			if (engine && engine.compile && Object.isTypeof(text, 'string')) {
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

			if (engine && engine.render && Object.isTypeof(datas, 'object')) {
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
	});

View.fn = {};
var isExtend = false;
function extendViewFn() {
	if (!isExtend) {
		isExtend = true;
		Object.extend(View.prototype, View.fn);
	}
}
View.define = function(properties) {
	extendViewFn();
	
	var cView = View.extend(properties);
	return (views[properties.name] = cView);
}
View.get = function(name) {
	return views[name];
}
View.each = function(callback) {
	Object.each(views, callback);
}

return View;
});
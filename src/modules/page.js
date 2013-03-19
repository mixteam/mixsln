define(function(require, exports, module) {
require('reset');

var win = window,
    doc = win.document,
    Class = require('class'),
    Message = require('message'),

    STATUS = {
		'UNKOWN' : 0,
		'UNLOADED' : 0,
		'READY' : 1,
		'COMPILED' : 2,
	},
	abstracts = {},
	pages = {},
	Page = Class.create({
		Implements : Message,

		initialize : function() {
			var that = this,
				name = that.name
				;

			Message.prototype.initialize.call(that, 'app.' + name);

			that.status = STATUS.UNKOWN;

			that.ready = that.ready.bind(that);
			that.unload = that.unload.bind(that);

			that.on('ready', that.ready);
			that.on('unloaded', that.unload);
		},

		getTitle : function() {
			//can overrewite
			return this.title;
		},

		loadTemplate : function(url, callback) {
			// can overwrite
			var that = this
				;

			if (arguments.length === 1) {
				callback = arguments[0];
				url = that.template;
			}

			url && app.loadFile(url, callback);
		},

		compileTemplate : function(text, callback) {
			// can overwrite
			var that = this,
				engine = app.config.templateEngine
				;

			if (engine && Object.isTypeof(text, 'string')) {
				text = engine.compile(text);
			}

			if (callback) {
				callback(text);
			} else {
				return text;
			}
		},

		renderTemplate : function(datas, callback) {
			// can overwrite
			var that = this,
				engine = app.config.templateEngine,
				compiledTemplate = that.compiledTemplate,
				content = ''
				;

			if (engine && Object.isTypeof(datas, 'object')) {
				content = engine.render(compiledTemplate, datas);
			} else {
				content = compiledTemplate;
			}

			if (callback) {
				callback(content);
			} else {
				return content;
			}
		},

		fill : function(datas, callback) {
			var that = this
				;

			function _fill() {
				that.renderTemplate(datas, function(content) {
					that.trigger('rendered', content);
					callback && callback();
				});
			}

			if (!that.compiledTemplate) {
				that.once('compiled', _fill);
			} else {
				_fill();
			}
		},

		ready : function(navigation) {/*implement*/},
		unload : function() {/*implement*/}
	});

Page.STATUS = STATUS;
Page.global = {};
Page.fn = {};
Page.abstract = function(properties) {
	return (abstracts[properties.name] = properties);
}
Page.define = function(properties) {
	var cPage, iPage;

	if (properties.Implements) {
		var Implements = properties.Implements;
		Object.isTypeof(Implements, 'string') && 
			(Implements = properties.Implements = [Implements]);
		Object.each(properties.Implements, function(name, i) {
			abstracts[name] && (Implements[i] = abstracts[name]);
		});
	}

	cPage = Page.extend(properties);
	cPage.implement(Page.fn);
	iPage = new cPage();

	Object.each(Page.global, function(val, name) {
		var type = Object.isTypeof(val);

		switch (type){
			case 'array':
				iPage[name] = val.slice(0).concat(iPage[name] || []);
				break;
			case 'object':
				iPage[name] = Object.extend(val, iPage[name] || {});
				break;
			case 'string':
			case 'number':
				(iPage[name] == null) && (iPage[name] = val);
				break;
		}
	});
	return (pages[iPage.name] = iPage);
}

Page.get = function(name) {
	return pages[name];
}

Page.each = function(callback) {
	Object.each(pages, callback);
}

return Page;

});
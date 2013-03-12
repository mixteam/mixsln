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
				engine;

			if ((engine = win['Mustache'])) {
				that.compiledTemplate = engine.compile(text);
				callback(that.compiledTemplate);
			}
		},

		renderTemplate : function(datas, callback) {
			// can overwrite
			var that = this,
				compiledTemplate = that.compiledTemplate,
				content = compiledTemplate(datas)
				;

			callback(content);
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

Page.fn = {};

Page.define = function(properties) {
	var cPage = Page.extend(properties),
		page
		;

	cPage.implement(Page.fn);
	page = new cPage();
	return (pages[page.name] = page);
}

Page.get = function(name) {
	return pages[name];
}

Page.each = function(callback) {
	Object.each(pages, callback);
}

return Page;

});
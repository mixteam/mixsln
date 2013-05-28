(function(win, app, undef) {

var doc = win.document
	;

function Template(url) {
	this.url = url;
}

var TemplateProto = {
	load: function(url, callback) {
		// can overwrite
		var that = this,
			engine = app.config.templateEngine
			;

		if (arguments.length === 1) {
			callback = arguments[0];
			url = that.url;
		} else {
			that.url = url;
		}

		function loaded(text) {
			callback && callback(text);
		}

		if (engine && engine.load && typeof url === 'string') {
			engine.load(url, loaded);
		} else {
			loaded(url);
		}
	},

	compile: function(text) {
		// can overwrite
		var that = this,
			engine = app.config.templateEngine
			;

		that.originTemplate = text;

		if (engine && engine.compile && typeof text === 'string') {
			that.compiledTemplate = engine.compile(text);
		} else {
			that.compiledTemplate = text;
		}

		return that.compiledTemplate;
	},

	render: function(datas) {
		// can overwrite
		var that = this,
			engine = app.config.templateEngine,
			compiledTemplate = that.compiledTemplate
			;

		if (engine && engine.render && typeof datas === 'object' && compiledTemplate) {
			that.content = engine.render(compiledTemplate, datas);
		} else {
			that.content = compiledTemplate;
		}

		return that.content;
	}
}

for (var p in TemplateProto) {
	Template.prototype[p] = TemplateProto[p];
} 

app.module.Template = Template;

})(window, window['app']||(window['app']={module:{},plugin:{}}));
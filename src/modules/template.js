;(function(win, app, undef) {

var doc = win.document
	;

function Template() {
}

var TemplateProto = {
	load: function(url, callback) {
		var engine = Template.engine
			;

		if (engine.load && typeof url === 'string') {
			engine.load(url, callback);
		} else {
			callback && callback(url);
		}
	},

	compile: function(text) {
		var engine = Template.engine;

		this.originTemplate = text;

		if (engine.compile && typeof text === 'string') {
			this.compiledTemplate = engine.compile(text);
		} else {
			this.compiledTemplate = function() {return text};
		}

		return this.compiledTemplate;
	},

	render: function(datas) {
		var engine = Template.engine,
			compiledTemplate = this.compiledTemplate
			;

		if (engine.render && compiledTemplate && typeof datas === 'object') {
			this.content = engine.render(compiledTemplate, datas);
		} else {
			this.content = compiledTemplate?compiledTemplate(datas):Object.prototype.toString.call(datas);
		}

		return this.content;
	}
}

for (var p in TemplateProto) {
	Template.prototype[p] = TemplateProto[p];
} 

Template.engine = {}

app.module.Template = Template;

})(window, window['app']||(window['app']={module:{},plugin:{}}))
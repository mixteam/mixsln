function testTemplate() {
	app.config.templateEngine = {
		load: function(url, callback) {
			$.get(url, callback);
		},

		compile : function(text) {
			return Mustache.compile(text);
		},

		render : function(compiled, data) {
			return compiled(data);
		}
	}

	var template = new app.module.Template('../test/template.tpl')
		;

	template.load(function(text) {
		template.compile(text);
		var html = template.render({name:'World'});

		console.log(html);
	})
}
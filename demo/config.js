app.config.enableNavbar = true;
app.config.enableToolbar = true;
app.config.enableScroll = true;
app.config.enableTransition = true;
app.config.templateEngine = {
	compile : function(text) {
		return Mustache.compile(text);
	},

	render : function(compiled, data) {
		return compiled(data);
	}
}

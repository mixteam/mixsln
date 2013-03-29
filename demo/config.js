app.config.viewport = document.querySelector('.viewport');
app.config.enableNavibar = true;
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
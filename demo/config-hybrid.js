app.config.viewport = document.querySelector('.viewport');
app.config.enableNavibar = false;
app.config.enableScroll = false;
app.config.enableTransition = true;
app.config.templateEngine = {
	compile : function(text) {
		return Mustache.compile(text);
	},

	render : function(compiled, data) {
		return compiled(data);
	}
}

app.page.global.plugins = {
	domfind : true,
	domevent : true
}
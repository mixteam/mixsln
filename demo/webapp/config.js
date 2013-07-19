app.config.enableMessageLog = true;
app.config.enableNavbar = true;
app.config.enableToolbar = true;
app.config.enableScroll = true;
app.config.enableTransition = true;
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

// app.definePageMeta({
// 	"name" : "list",
// 	"route" : "list\\/(P<word>[^\\/]+)\\/?",
// 	"js": ["./pages/list/searchItems.js", "./pages/list/list.js"],
// 	"css": ["./pages/list/list.css"]
// });

// app.definePageMeta({
// 	"name" : "detail",
// 	"route" : "detail\\/(P<pid>\\d+)\\/?",
// 	"js": ["./pages/detail/searchbar.js", "./pages/detail/detail.js"],
// 	"css": ["./pages/detail/detail.css"]
// });



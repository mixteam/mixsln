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
// 	"name" : "search",
// 	"route" : "search\/?",
// 	"js": ["./views/searchbar/searchbar.js", "./pages/search/search.js"],
// 	"css": ["./views/searchbar/searchbar.css", "./pages/search/search.css"]
// });

// app.definePageMeta({
// 	"name" : "list",
// 	"route" : "list\\/(P<word>[^\\/]+)\\/?",
// 	"js": ["./views/searchbar/searchbar.js", "./views/searchitems/searchitems.js", "./pages/list/list.js"],
// 	"css": ["./views/searchbar/searchbar.css", "./views/searchitems/searchitems.css", "./pages/list/list.css"]
// });

// app.definePageMeta({
// 	"name" : "detail",
// 	"route" : "detail\\/(P<pid>\\d+)\\/?",
// 	"js": ["./views/searchbar/searchbar.js", "./pages/detail/detail.js"],
// 	"css": ["./views/searchbar/searchbar.css", "./pages/detail/detail.css"]
// });



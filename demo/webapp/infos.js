(function(app, undef) {
	app.definePageMeta({
		"name" : "detail",
		"route" : "detail\\/(P<pid>\\d+)\\/?",
		"js": ["./pages/detail/searchbar.js", "./pages/detail/detail.js"],
		"css": ["./pages/detail/detail.css"]
	});
})(window['app']);
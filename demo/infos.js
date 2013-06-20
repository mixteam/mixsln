(function(app, undef) {
	app.definePageMeta({
		"name" : "detail",
		"title" : "商品详情",
		"route" : "detail\\/(P<pid>\\d+)\\/?",
		"js": ["./pages/detail/searchbar.js", "./pages/detail/detail.js"],
		"css": ["./pages/detail/detail.css"]
	});
})(window['app']);
(function(app, undef) {
	app.config.pageBasePath = './pages';

	app.definePageMeta({
		"name" : "detail",
		"title" : "商品详情",
		"route" : "detail\\/(P<pid>\\d+)\\/?",
		"js": ["searchbar.js", "detail.js"],
		"css": ["detail.css"],
		"tpl": ["searchbar.tpl", "detail.tpl"]
	});
})(window['app']);
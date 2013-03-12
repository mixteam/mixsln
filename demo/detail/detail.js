(function(app, undef) {

	var detailApp = app.page.define({
		name : 'detail',
		title : '商品详情',
		route : 'detail\\/(P<pid>\\d+)\\/?',
		buttons : [
			{
				type : 'back',
				text : '搜索'
			},
			{
				type : 'func',
				text : '查看评论',
				handler : function(e) {
					alert('TODO');
				}
			}
		],

		_pid : 0,

		/*
		_loadDatas : function(callback) {
			var that = this,
				pid = that._pid,
				url = 'http://a.wapa.taobao.com/i' + pid + '.htm'
				;

			$.get(url, function(text) {
				var dom = $(text)
					;

				callback({
					html : dom.find('#J_detailCont').html()
				});
			})
		},
		*/

		loadTemplate : function(callback) {
			// overwrite super.loadTemplate
			var text = '<link href="http://a.tbcdn.cn/mw/app/detail/h5/detail-fresh.css" type="text/css" rel="stylesheet" /><div id="tbh5v0"><section id="J_detailCont" style="padding:10px;"><section class="d-info"><h1>金牌卖家 正品保证 Apple/苹果 iPhone 5代 V版三网 真假配件攻略</h1><ul class="d-cul"><li class="dic-fli"><label>促销:</label><ins class="red dc-promo">￥4300.00-5900.00<span class="coins"></span></ins><span class="gray12"><span class="di-org">狠实惠</span></span></li><li><label>原价:</label><span class="gray12"><del class="dc-origin">￥5000.00-6600.00</del></span></li><li class="dc-area"><label>运费:</label><span class="dc-delivery">快递:20.00元 EMS:30.00元 平邮:30.00元</span><span class="font12">至 <span class="di-gy">杭州</span></span></li><li><label>月销:</label>3320 件 <span id="J_integral" class="gray12"></span></li></ul></section><section class="d-search"><form id="J_searchForm"><input type="text" name="q" placeholder="请输入宝贝关键字" class="bton-keyword" value=""><input class="bton-search" name="search-bton" type="submit" value=""></form></section></section></div>';
			//text += '<section class="d-search"><form id="J_searchForm"><input type="text" name="q" placeholder="请输入宝贝关键字" class="bton-keyword" value=""><input class="bton-search" name="search-bton" type="submit" value=""></form></section>';
			callback(text);
		},

		ready : function() {
			var that = this,
				navigation = app.navigation,
				pid = this._pid = navigation.getParameter('pid'),
				content = $(app.component.getActiveContent())
				;

			// implement super.ready
			that.fill({}, function() {
				content.find('#J_searchForm').on('submit', function(e) {
					var word = content.find('#J_searchForm .bton-keyword').val()
						;

					e.preventDefault();
					navigation.push('list/' + encodeURIComponent(word) + '/');
				});
			});
		},

		unload : function() {
			// implement super.unload
		}
	});

})(window['app']);
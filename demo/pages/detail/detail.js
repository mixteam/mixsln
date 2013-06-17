(function(app, undef) {

	app.definePage({
		name : 'detail',
		title : '商品详情',
		route : 'detail\\/(P<pid>\\d+)\\/?',
		template: ['<div id="tbh5v0">',
			'<section id="J_detailCont" style="padding:10px;">',
				'<section class="d-info">',
					'<h1>金牌卖家 正品保证 Apple/苹果 iPhone 5代 V版三网 真假配件攻略</h1>',
					'<ul class="d-cul">',
						'<li class="dic-fli">',
							'<label>促销:</label>',
							'<ins class="red dc-promo">',
								'￥4300.00-5900.00<span class="coins"></span>',
							'</ins>',
							'<span class="gray12">',
								'<span class="di-org">狠实惠</span>',
							'</span>',
						'</li>',
						'<li>',
							'<label>原价:</label>',
							'<span class="gray12">',
								'<del class="dc-origin">￥5000.00-6600.00</del>',
							'</span>',
						'</li>',
						'<li class="dc-area">',
							'<label>运费:</label>',
							'<span class="dc-delivery">快递:20.00元 EMS:30.00元 平邮:30.00元</span>',
							'<span class="font12">至 <span class="di-gy">杭州</span></span>',
						'</li>',
						'<li>',
							'<label>月销:</label>3320 件 ',
							'<span id="J_integral" class="gray12"></span>',
						'</li>',
						'<li>',
							'<a href="http://www.taobao.com">去淘宝网</a>',
						'</li>',
					'</ul>',
				'</section>',
				'<section class="d-search">',
					'<form id="J_searchForm">',
						'<input type="text" name="q" placeholder="请输入宝贝关键字" class="bton-keyword" value="">',
						'<input class="bton-search" name="search-bton" type="submit" value="">',
					'</form>',
				'</section>',
			'</section>',
		'</div>'].join(''),
		
		buttons : [
			{
				type: 'back',
				text: '搜索列表'
			}
		],

		events : [
			['submit', '#J_searchForm', '_submitFormHandler']
		],

		plugins: {
			domevent: true
		},

		_submitFormHandler : function(e) {
			e.preventDefault();
			var word = this.$el.find('#J_searchForm .bton-keyword').val();
			app.navigation.push('list/' + encodeURIComponent(word) + '/');
		},

		startup : function() {
			// implement super.startup
			var that = this,
				pid = app.navigation.getParameter('pid')
				;

			that.template({}, function(html) {
				that.html(html);
			});
		},

		teardown : function() {
			// implement super.teardown
		}
	});

})(window['app']);
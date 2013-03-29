<div class="search-list" id="J_SearchList">
	<ul>
		{{#listItem}}
		<li>
			<div class="list-item">
				<div class="p">
					<a href="#" dataid="{{itemNumId}}">
						<img class="p-pic" src="http://a.tbcdn.cn/mw/app/searchlist/h5/images/error.png" data-src="{{img}}">
					</a>
				</div>
				<div class="d">
					<h3 class="d-title">
						<a href="#" dataid="{{itemNumId}}">{{name}}</a>
					</h3>
					<p class="d-price"><em class="h">￥{{price}}</em></p>
					<p class="d-main">
						<span class="d-num">运费{{freight}}</span>
						<span class="d-area">{{area}}</span>
						<span class="d-num">{{act}}</span>
					</p>
				</div>
			</div>
		</li>
		{{/listItem}}
	</ul>
</div>
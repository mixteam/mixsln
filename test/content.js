function testContent() {
	var Content = app.module.Content,
		activeEl = document.querySelector('.viewport .active'),
		ss = document.styleSheets[0];

	activeEl.innerHTML = '<button class="prev">前一个</button><button class="next">后一个</button><div></div>';
	activeEl.setAttribute('id', 'testContent');

	var content = new Content(activeEl, {
		cacheWrapEl: activeEl.querySelector('div'),
		cacheLength: 5
	});

	activeEl.querySelector('button.prev').addEventListener('click', function() {
		var date = new Date();
		content.previous();
		content.html(date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds());
	});

	activeEl.querySelector('button.next').addEventListener('click', function() {
		var date = new Date();
		content.next();
		content.html(date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds());
	});

	ss.addRule('#testContent > div', 'display:-webkit-box');
	ss.addRule('#testContent > div > div', 'width:100px; height:30px; border:1px solid #999;');
	ss.addRule('#testContent > div > div.active', 'background-color:red');
	ss.addRule('#testContent > div > div.inactive', 'background-color:#EEE');
	ss.addRule('#testContent > div > div.next', 'background-color:yellow');
	ss.addRule('#testContent > div > div.prev', 'background-color:green');
}
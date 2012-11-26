define(function(require, exports, module) {
	var Message = require('message'),
		msg = new Message(),
		doc = window.document,
		e_btn = doc.getElementById('btn'),
		e_log = doc.getElementById('log')
	;

	function log(msg) {
		e_log.innerHTML += msg.toString() + '<br />';
	}

	e_btn.onclick = function(e) {
		msg.trigger('btnClick', e);
	}

	msg.on('btnClick', function() {
		log('clicked!');
	});

	msg.on('btnClick', function() {
		log('oooooooh, yeeeeeeee!');
	});

});
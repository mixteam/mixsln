(function(win, app){
	var doc = win.document,
		ss = win.sessionStorage,
		navigate = require('navigate').singleton,
		SS_PREIX = 'mix_storage_001_'
		;

	navigate.on('forward backward', function() {
		app.plugin.stateStorage.saveAll();
	});

	app.plugin.stateStorage = {
		saveAll: function() {
			var strStateIdx = navigate._stateIdx + '',
				strStateLen = navigate._states.length + ''
				;

			ss.setItem(SS_PREIX + 'state_index', navigate._stateIdx);
			ss.setItem(SS_PREIX + 'state_length', navigate._states.length);
			navigate._states.forEach(function(state, i) {
				ss.setItem(SS_PREIX + 'state_item[' + i + ']', JSON.stringify(state));
			});
		},

		save: function() {
			var stateIdx = navigate._stateIdx,
				state = navigate._states[stateIdx]
				;

			ss.setItem(SS_PREIX + 'state_item[' + stateIdx + ']', JSON.stringify(state));
		},

		loadAll: function() {
			var len, i;

			navigate._stateIdx = parseInt(ss.getItem(SS_PREIX + 'state_index') || 0);
			len = parseInt(ss.getItem(SS_PREIX + 'state_length') || 0);

			for (i = 0;i < len; i++) {
				navigate._states[i] = JSON.parse(ss.getItem(SS_PREIX + 'state_item[' + i + ']') || '{}');
			}
		},

		load: function() {
			var stateIdx = navigate._stateIdx
				;

			navigate._states[stateIdx] = JSON.parse(ss.getItem(SS_PREIX + 'state_item[' + stateIdx + ']') || '{}');
		},

		clear: function() {
			var len = navigate._stateLimit;

			ss.removeItem(SS_PREIX + 'state_index');
			ss.removeItem(SS_PREIX + 'state_length');

			for (var i = 0; i < len; i++) {
				ss.removeItem(SS_PREIX + 'state_item[' + i + ']');
			}
		}
	};

	app.plugin.stateStorage.loadAll();
})(window, window['app']);
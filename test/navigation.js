function testNavigation() {
	var navigation = app.module.Navigation.instance,
		stack =  navigation.getStack();

	function test1(p) {
		log('test default', stack.getState());
	}

	function test2(p) {
		log('test 2', stack.getState());
	}

	function test3(p) {
		log('test 3', stack.getState());
	}

	navigation.addRoute('test default', null, {
		callback: test1,
		'default': true
	});

	navigation.addRoute('test2', 'test2\\/(P<p1>\\d+)', {
		callback: test2,
	});

	navigation.addRoute('test3', 'test3\\/(P<p2>\\w+)', {
		callback: test3,
	});

	log(navigation.resolveFragment('test2', {p1:'1234'}));

	navigation.start();

	var steps = [
		function() {
			navigation.push('abcd');
		},

		function() {
			navigation.push('dcba');
		},

		function() {
			navigation.pop();
		},

		function() {
			navigation.push('test2/1234');
		},

		function() {
			navigation.push('test2/2345', {
				type: 'GET',
				data: {
					a: 1,
					b: 2
				}
			});
		},

		function() {
			navigation.push('test3/1234');
		},

		function() {
			navigation.push('test3/abcd', {
				type: 'POST',
				data: {
					c: 3,
					d: 4
				}
			});
		},

		function() {
			navigation.pop();
		},

		function() {
			navigation.push();
		},

		function() {
			navigation.stop();
		},

		function() {
			navigation.pop();
		}
	];

	navigation.on('forward backward', function() {
		if (steps.length) {
			setTimeout(function() {
				steps.shift()();
			}, 500);
		}
	});

	steps.shift()();
}
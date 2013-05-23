function testMessage() {

var Message = app.module.MessageScope,
	msg = new Message('global'), a = {b:1}, b = {c:2};

function test11(p) {
	console.log('test 1-1', p);
}

function test12(p) {
	console.log('test 1-2', p);
}

function test13(p) {
	console.log('test 1-3', p, this.b);
}

function test2(p) {
	console.log('test 2', p, this.c);
}

function after_test2() {
	console.log('after test2');
}

msg.on('test1', test11);

msg.on('test1', test12);

msg.trigger('test1', 'test1');

msg.off('test1', test12);

msg.on('test1', test13, a);

msg.trigger('test1', 'test2');

msg.off();

msg.trigger('test1');

Message.mixto(b, 'global');

b.on('test2', test2, b);

b.after('test2', after_test2);

b.trigger('test2', 'test3');
}
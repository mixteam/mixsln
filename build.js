var fs = require("fs"), 
	path = require("path"),
	util = require('util'),
	spawn = require('child_process').spawn, 
	exec = require('child_process').exec,
	
	options = {
		builder : false
	}
	;

function jsBuilder() {
	var debug = [], release = []
	
	debug.push(fs.readFileSync('./lib/cjs-debug.js'));
	debug.push(fs.readFileSync('./lib/mix-debug.js'));
	debug.push(fs.readFileSync('./dist/app-debug.js'));
	
	release.push(fs.readFileSync('./lib/cjs.js'));
	release.push(fs.readFileSync('./lib/mix.js'));
	release.push(fs.readFileSync('./dist/app.js'));
	
	fs.writeFileSync('./mixsln-debug.js', debug.join('\r\n'));
	fs.writeFileSync('./mixsln.js', release.join('\r\n'));
}

function cssBuilder() {
	var css = [];
	
	css.push(fs.readFileSync('./assets/base.css'));
	css.push(fs.readFileSync('./assets/x.css'));
	
	fs.writeFileSync('./mixsln.css', css.join('\r\n'));
}

function main(args) {
	if (args && args instanceof Array){
		while (args.length > 0) {
			var v = args.shift();
			switch(v) {
				case '--js':
					options.builder = jsBuilder;
					break;
				case '--css':
					options.builder = cssBuilder;
					break;
				default:
					break;
			}
		}
	}else if (args && typeof args === 'object') {
		for (var k in args) {
			options[k] = args[k];
		}
	}

	options.builder();
}

if (require.main === module) {
	main(process.argv.slice(2));
} else {
	module.exports = main;
}
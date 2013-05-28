var path = require('path'),
	fs = require('fs')
	;

var concatTask = {
		options: {
			banner: '/*! <%= context.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
			separator: '\n',
			stripBanners: true
		},
		
		main: {
			src: [
				'<%= context.srcPath %>/<%= context.modulePath %>/util.js',
				'<%= context.srcPath %>/<%= context.modulePath %>/message.js',
				'<%= context.srcPath %>/<%= context.modulePath %>/router.js',
				'<%= context.srcPath %>/<%= context.modulePath %>/navigate.js',
				'<%= context.srcPath %>/<%= context.modulePath %>/gesture.js',
				'<%= context.srcPath %>/<%= context.modulePath %>/transform.js',
				'<%= context.srcPath %>/<%= context.modulePath %>/scroll.js',
				'<%= context.srcPath %>/<%= context.modulePath %>/component.js',
				'<%= context.srcPath %>/<%= context.modulePath %>/view.js',
				'<%= context.srcPath %>/<%= context.modulePath %>/page.js',
				'<%= context.srcPath %>/<%= context.modulePath %>/navigation.js',
				'<%= context.srcPath %>/app.js'
			],
			dest: '<%= context.distPath %>/<%= context.name %>.js'
		},

		hybrid: {
			src: [
				'<%= context.srcPath %>/<%= context.modulePath %>/util.js',
				'<%= context.srcPath %>/<%= context.modulePath %>/message.js',
				'<%= context.srcPath %>/<%= context.modulePath %>/router.js',
				'<%= context.srcPath %>/<%= context.modulePath %>/navigate.js',
				'<%= context.srcPath %>/<%= context.modulePath %>/gesture.js',
				'<%= context.srcPath %>/<%= context.modulePath %>/transform.js',
				'<%= context.srcPath %>/<%= context.modulePath %>/scroll.js',
				'<%= context.srcPath %>/<%= context.modulePath %>/component.js',
				'<%= context.srcPath %>/<%= context.modulePath %>/view.js',
				'<%= context.srcPath %>/<%= context.modulePath %>/page.js',
				'<%= context.srcPath %>/<%= context.modulePath %>/navigation.js',
				'<%= context.srcPath %>/app-hybrid.js'
			],
			dest: '<%= context.distPath %>/<%= context.name %>-hybrid.js'
		},

		rebuild: {
			src: [
				'<%= context.srcPath %>/<%= context.modulePath %>-rebuild/message.js',
				'<%= context.srcPath %>/<%= context.modulePath %>-rebuild/model.js',
				'<%= context.srcPath %>/<%= context.modulePath %>-rebuild/view.js',
				'<%= context.srcPath %>/<%= context.modulePath %>-rebuild/template.js',
				'<%= context.srcPath %>/<%= context.modulePath %>-rebuild/navigation.js',
				'<%= context.srcPath %>/<%= context.modulePath %>-rebuild/page.js',
				'<%= context.srcPath %>/<%= context.modulePath %>-rebuild/gesture.js',
				'<%= context.srcPath %>/<%= context.modulePath %>-rebuild/animation.js',
				'<%= context.srcPath %>/<%= context.modulePath %>-rebuild/scroll.js',
				'<%= context.srcPath %>/<%= context.modulePath %>-rebuild/transition.js',
				'<%= context.srcPath %>/<%= context.modulePath %>-rebuild/navbar.js',
				'<%= context.srcPath %>/<%= context.modulePath %>-rebuild/viewport.js',
				'<%= context.srcPath %>/<%= context.modulePath %>-rebuild/application.js',
			],
			dest: '<%= context.distPath %>/<%= context.name %>-rebuild.js'
		}
	},

	uglifyTask = {
		main: {
			files: {
				'<%= context.distPath %>/<%= context.name %>.min.js': '<%= concat.main.dest %>'
			}
		},

		plugin: {
			files : [{
				expand: true,
				cwd: '<%= context.srcPath %>/<%= context.pluginPath %>/',
				src: ['*.js'],
				dest: '<%= context.distPath %>/<%= context.pluginPath %>/',
				ext: '.min.js'
			}]
		}
	},

	cssminTask = {
		options: {
			banner: '/*! <%= context.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
			report: 'min'
		},
		main: {
			src : [
				'<%= context.assetPath %>/base.css',
				'<%= context.assetPath %>/x.css'
			],
			dest: '<%= context.distPath %>/<%= context.name %>.css'
		}
	},


	watchTask = {
		'main_js' : {
			files: ['<%= concat.main.src %>'],
			tasks: ['concat:main', 'uglify:main']
		},

		'rebuild_js' : {
			files: ['<%= concat.rebuild.src %>'],
			tasks: ['concat:rebuild']
		},

		'plugin_js' :  {
			files: ['<%= context.srcPath %>/<%= context.pluginPath %>/*.js'],
			tasks: ['uglify:plugin']
		},

		'css' : {
			files: ['<%= cssmin.main.src %>'],
			tasks: ['cssmin']
		}
	}
	;


function prepareTask(grunt, callback) {
	var context = grunt.file.readJSON('package.json');

	context.srcPath = 'src';
	context.distPath = 'dist';
	context.modulePath = 'modules';
	context.pluginPath = 'plugins';
	context.assetPath = 'assets';

	callback(grunt, context);
}

function runTask(grunt, context) {
	grunt.initConfig({
		context: context,
		uglify: uglifyTask,
		concat: concatTask,
		watch: watchTask,
		cssmin: cssminTask
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-cssmin');

	grunt.registerTask('dist', ['concat', 'uglify', 'cssmin']);
	grunt.registerTask('dev', ['watch']);

	grunt.registerTask('default', ['dist']);

};

module.exports = function(grunt) {
	prepareTask(grunt, runTask);
}
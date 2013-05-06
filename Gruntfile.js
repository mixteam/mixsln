var path = require('path'),
	fs = require('fs')
	;

var uglifyTask = {
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

	concatTask = {
		options: {
			banner: '/*! <%= context.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
			separator: '\n',
			stripBanners: true
		},
		main: {
			src: [
				'<%= context.srcPath %>/<%= context.modulePath %>/app.js',
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
		}
	},

	watchTask = {
		'main_js' : {
			files: ['<%= concat.main.src %>'],
			tasks: ['concat', 'uglify:main']
		},

		'plugin_js' :  {
			files: ['<%= context.srcPath %>/<%= context.pluginPath %>/*.js'],
			tasks: ['uglify:plugin']
		},

		'css' : {
			files: ['<%= cssmin.main.src %>'],
			tasks: ['cssmin']
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
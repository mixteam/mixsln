var path = require('path'),
	fs = require('fs')
	;


function runTask(grunt) {
	var context = grunt.file.readJSON('package.json');
	context.srcPath = 'src';
	context.distPath = 'dist';
	context.modulePath = 'modules';
	context.pluginPath = 'plugins';
	context.assetPath = 'assets';

	var depconcatTask = {
			options: {
				separator: '\n'
			},
		
			js: {
				options : {
					except: ['dualgesture.js'],
				},
				src: ['<%= context.srcPath %>/<%= context.modulePath %>-rebuild/*.js'],
				dest: '<%= context.distPath %>/<%= context.name %>-rebuild.js'
			},

			css: {
				src: ['<%= context.assetPath %>/*.css'],
				dest: '<%= context.distPath %>/<%= context.name %>.css'
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
				report: 'min'
			},
			main: {
				files: {
					'<%= context.distPath %>/<%= context.name %>.min.css' : '<%= depconcat.css.dest %>'
				}
			}
		},


		watchTask = {
			'main_js' : {
				files: ['<%= concat.main.src %>'],
				tasks: ['concat:main', 'uglify:main']
			},

			'rebuild_js' : {
				files: ['<%= depconcat.js.src %>'],
				tasks: ['depconcat:js']
			},

			'plugin_js' :  {
				files: ['<%= context.srcPath %>/<%= context.pluginPath %>/*.js'],
				tasks: ['uglify:plugin']
			},

			'css' : {
				files: ['<%= depconcat.css.src %>'],
				tasks: ['depconcat:css', 'cssmin:main']
			}
		}
		;


	grunt.initConfig({
		context: context,
		depconcat: depconcatTask,
		concat: concatTask,
		uglify: uglifyTask,
		watch: watchTask,
		cssmin: cssminTask
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-depconcat');

	grunt.registerTask('dist', ['concat', 'depconcat', 'uglify', 'cssmin']);
	grunt.registerTask('dev', ['watch']);
	
	grunt.registerTask('default', ['dist']);

};

module.exports = function(grunt) {
	runTask(grunt);
}
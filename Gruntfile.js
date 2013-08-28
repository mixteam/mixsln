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
	context.themePath = 'themes';
	context.defaultTheme = 'ios6-default';

	var depconcatTask = {
			options: {
				separator: '\n'
			},
		
			js: {
				options : {
					except: ['dualgesture.js', 'matrix.js'],
				},
				src: ['<%= context.srcPath %>/<%= context.modulePath %>/*.js'],
				dest: '<%= context.distPath %>/<%= context.name %>.js'
			},

			css: {
				src: ['<%= context.assetPath %>/base.css', '<%= context.assetPath %>/<%= context.themePath %>/<%= context.defaultTheme %>.css'],
				dest: '<%= context.distPath %>/<%= context.name %>.css'
			},

			notheme_css: {
				src: ['<%= context.assetPath %>/base.css'],
				dest: '<%= context.distPath %>/<%= context.name %>-notheme.css'
			}
		},

		uglifyTask = {
			main: {
				files: {
					'<%= context.distPath %>/<%= context.name %>.min.js': '<%= depconcat.js.dest %>'
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
					'<%= context.distPath %>/<%= context.name %>.min.css' : '<%= depconcat.css.dest %>',
					'<%= context.distPath %>/<%= context.name %>-notheme.min.css' : '<%= depconcat.notheme_css.dest %>'
				}
			}
		},

		lessTask = {
			options: {
				paths: ['<%= context.assetPath %>/<%= context.themePath %>/source']
			},
			main: {
				files: [{
					expand: true,
					cwd: '<%= context.assetPath %>/<%= context.themePath %>/source/',
					src: ['*.less'],
					dest: '<%= context.assetPath %>/<%= context.themePath %>/',
					ext: '.css'
				}]
			}
		},


		watchTask = {
			'main_js' : {
				files: ['<%= depconcat.js.src %>'],
				tasks: ['depconcat:js', 'uglify:main']
			},

			'plugin_js' :  {
				files: ['<%= context.srcPath %>/<%= context.pluginPath %>/*.js'],
				tasks: ['uglify:plugin']
			},

			'main_css' : {
				files: ['<%= context.assetPath %>/base.css'],
				tasks: ['depconcat:css', 'cssmin:main']
			},

			'theme_css' : {
				files: ['<%= context.assetPath %>/<%= context.themePath %>/*/*.less'],
				tasks: ['less', 'depconcat:css', 'depconcat:notheme_css', 'cssmin:main']
			}
		}
		;


	grunt.initConfig({
		context: context,
		depconcat: depconcatTask,
		uglify: uglifyTask,
		watch: watchTask,
		less: lessTask,
		cssmin: cssminTask
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-depconcat');

	grunt.registerTask('dist', ['less', 'depconcat', 'uglify', 'cssmin']);
	grunt.registerTask('dev', ['watch']);
	
	grunt.registerTask('default', ['dist']);

};

module.exports = function(grunt) {
	runTask(grunt);
}
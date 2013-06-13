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
					except: ['dualgesture.js', 'matrix.js'],
				},
				src: ['<%= context.srcPath %>/<%= context.modulePath %>/*.js'],
				dest: '<%= context.distPath %>/<%= context.name %>.js'
			},

			css: {
				src: ['<%= context.assetPath %>/*.css'],
				dest: '<%= context.distPath %>/<%= context.name %>.css'
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
					'<%= context.distPath %>/<%= context.name %>.min.css' : '<%= depconcat.css.dest %>'
				}
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

			'css' : {
				files: ['<%= depconcat.css.src %>'],
				tasks: ['depconcat:css', 'cssmin:main']
			}
		}
		;


	grunt.initConfig({
		context: context,
		depconcat: depconcatTask,
		uglify: uglifyTask,
		watch: watchTask,
		cssmin: cssminTask
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-depconcat');

	grunt.registerTask('dist', ['depconcat', 'uglify', 'cssmin']);
	grunt.registerTask('dev', ['watch']);
	
	grunt.registerTask('default', ['dist']);

};

module.exports = function(grunt) {
	runTask(grunt);
}
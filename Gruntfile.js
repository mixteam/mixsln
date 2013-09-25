'use strict';

module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		srcPath: 'src',
		distPath: 'dist',
		modulePath: 'modules',
		pluginPath: 'plugins',
		assetPath: 'assets',
		themePath: 'themes',
		defaultTheme: 'ios6-default',

		clean: ['<%= distPath%>/*'],

		depconcat: {
			options: {
				separator: '\n'
			},
		
			js: {
				options : {
					except: ['dualgesture.js', 'matrix.js'],
				},
				src: ['<%= srcPath %>/<%= modulePath %>/*.js'],
				dest: '<%= distPath %>/<%= pkg.name %>.debug.js'
			},

			css: {
				src: ['<%= assetPath %>/base.css', '<%= assetPath %>/<%= themePath %>/<%= defaultTheme %>.css'],
				dest: '<%= distPath %>/<%= pkg.name %>.debug.css'
			},

			notheme_css: {
				src: ['<%= assetPath %>/base.css'],
				dest: '<%= distPath %>/<%= pkg.name %>-notheme.debug.css'
			}
		},

		uglify: {
			main: {
				files: {
					'<%= distPath %>/<%= pkg.name %>.js': '<%= depconcat.js.dest %>'
				}
			},

			plugin: {
				files : [{
					expand: true,
					cwd: '<%= srcPath %>/<%= pluginPath %>/',
					src: ['*.js'],
					dest: '<%= distPath %>/<%= pluginPath %>/',
					ext: '.js'
				}]
			}
		},

		less: {
			options: {
				paths: ['<%= assetPath %>/<%= themePath %>/source']
			},
			main: {
				files: [{
					expand: true,
					cwd: '<%= assetPath %>/<%= themePath %>/source/',
					src: ['*.less'],
					dest: '<%= assetPath %>/<%= themePath %>/',
					ext: '.debug.css'
				}]
			}
		},

		cssmin: {
			options: {
				report: 'min'
			},
			main: {
				files: {
					'<%= distPath %>/<%= pkg.name %>.css' : '<%= depconcat.css.dest %>',
					'<%= distPath %>/<%= pkg.name %>-notheme.css' : '<%= depconcat.notheme_css.dest %>'
				}
			}
		},

		watch: {
			'main_js' : {
				files: ['<%= depconcat.js.src %>'],
				tasks: ['depconcat:js', 'uglify:main']
			},

			'plugin_js' :  {
				files: ['<%= srcPath %>/<%= pluginPath %>/*.js'],
				tasks: ['uglify:plugin']
			},

			'main_css' : {
				files: ['<%= assetPath %>/base.css'],
				tasks: ['depconcat:css', 'cssmin:main']
			},

			'theme_css' : {
				files: ['<%= assetPath %>/<%= themePath %>/*/*.less'],
				tasks: ['less', 'depconcat:css', 'depconcat:notheme_css', 'cssmin:main']
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-depconcat');

	grunt.registerTask('dist', ['clean','less', 'depconcat', 'uglify', 'cssmin']);
	grunt.registerTask('dev', ['watch']);
	
	grunt.registerTask('default', ['dist']);
};
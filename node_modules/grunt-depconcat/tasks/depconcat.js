/*
 * grunt-depconcat
 * https://github.com/terrykingcha/grunt-depconcat
 *
 * Copyright (c) 2013 tERry.K
 * Licensed under the MIT license.
 */
var path = require('path'),
    util = require('util');

'use strict';

module.exports = function(grunt) {

  function analyse(tree) {
    var opptree = {}, counttree = {}, queue = [], src = [],
        filepath, deplist, depfile;

    for (var filepath in tree) {
      deplist = tree[filepath];

      for (var i = 0; i < deplist.length; i++) {
        depfile = deplist[i];
        opptree[depfile] || (opptree[depfile] = []);
        opptree[depfile].push(filepath);
      }

      !(counttree[filepath] = tree[filepath].length) && queue.push(filepath);
    }

    while(queue.length) {
        var cur = queue.shift();
        src.push(cur);

        if(opptree[cur]) {
          opptree[cur].forEach(function(dep){
            if(--counttree[dep] === 0)
              queue.push(dep);
          });
        }
    }

    return src;
  }

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('depconcat', 'Concat depended files', function() {
    var JS_REQUIRE_TEMPLATE = '\\/\\/@require ([\\w\\.]+)',
        CSS_REQUIRE_TEMPLATE = '@import url\\(["\']?([\\w\\.]+)["\']?\\);?'
        ;
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
          separator: grunt.util.linefeed,
          requireTemplate: null,
          ext: null,
          except: [],
        });

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      options.ext || (options.ext = f.dest.match(/\.[a-z]+$/i)[0]);

      if (!options.requireTemplate) {
        if (options.ext === '.css') {
          var requireTemplate = CSS_REQUIRE_TEMPLATE;
        } else {
          var requireTemplate = JS_REQUIRE_TEMPLATE;
        }
      } else if (typeof options.requireTemplate === 'string'){
        var requireTemplate = options.requireTemplate;
      }

      requireTemplate && (options.requireTemplate = new RegExp(requireTemplate, 'gi'));

      if (f.src) {
        // Concat specified files.
        var tree = {};

        f.src.filter(function(filepath) {
          // Warn on and remove invalid source files.
          if (!grunt.file.exists(filepath)) {
            grunt.log.warn('Source file "' + filepath + '" not found.');
            return false;
          } else {
            for (var i = 0; i < options.except.length; i++) {
              var e = options.except[i];
              if (!(e instanceof RegExp)) {
                e = options.except[i] = new RegExp(options.except[i] + '$');
              }
              if (filepath.match(e)) return false;
            }
            return true;
          }
        }).forEach(function(filepath) {
          // Read file source.
          var file = grunt.file.read(filepath), 
              matches = file.match(options.requireTemplate) || []
              ;

          matches = matches.map(function(match) {
              options.requireTemplate.lastIndex = 0;
              var depfilepath = options.requireTemplate.exec(match)[1];

              if (!depfilepath.match(/\.\w+$/)) {
                depfilepath = depfilepath + options.ext;
              }

              return path.normalize(path.join(path.dirname(filepath), depfilepath));
          });

          tree[path.normalize(filepath)] = matches;
        });

      } else if (f.tree) {

        if (typeof f.tree === 'string') {
          var tree = grunt.file.readJSON(f.tree).
              names = Object.keys(tree),
              treeDir = path.dirname(f.tree);

          names.forEach(function(filepath) {
            tree[path.normalize(path.join(treeDir, filepath))] = tree[filepath].map(function(depfile) {
              return path.normalize(path.join(treeDir, depfile));
            });
            delete tree[filepath];
          });
        } else {
          var tree = f.tree;
        }
      }

      var sortedSrc = analyse(tree).map(function(filepath) {
        // Read file source.
        return grunt.file.read(filepath).replace(options.requireTemplate, '');
      });

      grunt.file.write(f.dest, sortedSrc.join(grunt.util.linefeed));
      grunt.log.writeln('Dest File "' + f.dest + '" created.');
    });
  });

};

var testacular = require('testacular');

/*global module:false*/
module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-recess');

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/*\n' + ' * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %>\n' + ' * <%= pkg.homepage %>\n' + ' * MIT License, http://www.opensource.org/licenses/MIT\n' + ' */'
    },
    concat: {
      basic: {
        src: ['<banner:meta.banner>', 'common/src/*.js', 'modules/**/src/*.js'],
        dest: 'build/<%= pkg.name %>.js'
      },
      ieshiv: {
        src: ['<banner:meta.banner>', 'common/ieshiv/src/*.js'],
        dest: 'build/<%= pkg.name %>-ieshiv.js'
      }
    },
    min: {
      basic: {
        src: ['<banner:meta.banner>', '<config:concat.basic.dest>'],
        dest: 'build/<%= pkg.name %>.min.js'
      },
      ieshiv: {
        src: ['<banner:meta.banner>', '<config:concat.ieshiv.dest>'],
        dest: 'build/<%= pkg.name %>-ieshiv.min.js'
      }
    },
    recess: {
      basic: {
        src: 'common/**/*.less',
        dest: 'build/<%= pkg.name %>.css',
        options: {
          compile: true
        }
      },
      min: {
        src: '<config:recess.basic.dest>',
        dest: 'build/<%= pkg.name %>.min.css',
        options: {
          compress: true
        }
      }
    },
    test: {
      files: ['modules/**/test/*.js']
    },
    watch: {
      files: ['modules/**/*.coffee', 'modules/**/*.js', 'common/**/*.js'],
      tasks: 'coffee concat:basic test'
    },
  });

  // Default task.
  grunt.registerTask('default', 'coffee concat min recess:basic recess:min test');

  grunt.registerTask('server', 'start testacular server', function() {
    //Mark the task as async but never call done, so the server stays up
    var done = this.async();
    testacular.server.start('test/test-config.js');
  });

  grunt.registerTask('test', 'run tests (make sure server task is run first)', function() {
    var done = this.async();
    grunt.utils.spawn({
      cmd: 'testacular-run',
      args: ['test/test-config.js'],
    }, function(error, result, code) {
      if (error) {
        grunt.warn(error + "\n" + "Make sure the testacular server is online: run `grunt server`.\n"+
          "Also make sure you have a browser open to http://localhost:8080/.\n");
        //the testacular runner somehow modifies the files if it errors(??).
        //this causes grunt's watch task to re-fire itself constantly,
        //unless we wait for a sec
        setTimeout(done, 1000);
      } else {
        grunt.log.write(result.stdout);
        done();
      }
    });
  });

  grunt.registerTask('coffee', 'compile coffee files', function() {
    var done = this.async();
    grunt.utils.spawn({
      cmd: 'coffee',
      args: ['-cb', 'modules']
    }, function(error, result, code) {
      if (error) grunt.warn(error.stderr);
      else grunt.log.write(result.stdout);
      done();
    });
  });
};
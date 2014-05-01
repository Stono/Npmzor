'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          require: 'test/blanket'
        },
        src: ['test/**/*.js']
      },
      unit: {
        options: {
          reporter: 'spec'
        },
        src: ['test/unit/**/*.js']
      },
      integration: {
        options: {
          reporter: 'spec'
        },
        src: ['test/integration/**/*.js']
      },
      coverage: {
        options: {
           reporter: 'html-cov',
           quiet: true,
           captureFile: 'coverage.html'
        },
        src: ['test/**/*.js']
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib: {
        src: [
          'lib/**/*.js',
          'app.js'
        ]
      },
      test: {
        src: ['test/**/*.js']
      },
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib: {
        files: '<%= jshint.lib.src %>',
        tasks: ['jshint:lib', 'mochaTest:unit', 'mochaTest:integration']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'mochaTest:unit', 'mochaTest:integration']
      }
    },
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-blanket');
  grunt.loadNpmTasks('grunt-notify');

  // Default task.
  grunt.registerTask('default', ['jshint', 'mochaTest']);

};

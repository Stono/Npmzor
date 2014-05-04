'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    shell: {
      coverage: {
        command: './node_modules/.bin/istanbul cover ./node_modules/mocha/bin/_mocha -- -R spec test/**/*.js && cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js'
      }
    },
    mochaTest: {
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
      acceptance: {
        options: {
          reporter: 'spec'
        },
        src: ['test/acceptance/**/*.js']
      },
      coverage: {
        options: {
           reporter: 'html-cov',
           quiet: true,
           captureFile: 'coverage/coverage.html'
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
        tasks: ['jshint:lib', 'mochaTest:unit', 'mochaTest:integration', 'mochaTest:acceptance']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'mochaTest:unit', 'mochaTest:integration', 'mochaTest:acceptance']
      }
    },
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-blanket');
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-shell');

  // Default task.
  grunt.registerTask('default', ['jshint', 'mochaTest:unit', 'mochaTest:integration', 'mochaTest:acceptance']);
  grunt.registerTask('travis', ['jshint', 'mochaTest:unit', 'mochaTest:integration', 'shell:coverage']);
};

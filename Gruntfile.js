module.exports = function(grunt) {

  grunt.initConfig({
    coffee: {
      compile: {
        files: {
          'lib/describer.js': 'src/describer.litcoffee'
        }
      }
    },
    browserify: {
      dist: {
        files: {
          'dist/uberjson.hyperdescribe.js': 'index.js',
        }
      }
    },
    uglify: {
      my_target: {
        files: {
          'dist/uberjson.hyperdescribe.min.js': 'dist/uberjson.hyperdescribe.js'
        }
      }
    },
    docco: {
      options: {
        layout : "linear",
        output : "docs/"
      },
      all: {
        files: {
          src: ['src/**/*.litcoffee']
        }
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-docco-multi');

  // Custom task to parse UBER doc
  grunt.registerTask('describeExample', 'Describe example', function() {
    var uberDoc = require('./examples/uber_example'),
        parser = require('./lib/describer')
        results = parser(uberDoc);
    grunt.log.writeln('Describe UBER example');
    grunt.file.write('./examples/uberjson.hyperdescribe.json', JSON.stringify(results, null, 2));
  });

  grunt.registerTask( "build", ["coffee", "browserify", "uglify", "describeExample", "docco"] );
}
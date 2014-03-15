var parseUber = function() {
  var uberDoc = require('examples/uber_example'),
      parser = require('lib/parser')
      results = parser(uberDoc);


}

module.exports = function(grunt) {

  grunt.initConfig({
    coffee: {
      compile: {
        files: {
          'lib/parser.js': 'src/parser.litcoffee'
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
    }
  })

  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Custom task to parse UBER doc
  grunt.registerTask('parseExample', 'Parse example', function() {
    var uberDoc = require('./examples/uber_example'),
        parser = require('./lib/parser')
        results = parser(uberDoc);
    grunt.log.writeln('Parsing example UBER doc');
    grunt.file.write('./examples/uberjson.hyperdescribe.json', JSON.stringify(results, null, 2));
  });

  grunt.registerTask( "build", ["coffee", "browserify", "uglify", "parseExample"] );
}
var parser = require('./lib/parser'),
    example = require('./examples/full_example');

HyperdescribeUberJSON = module.exports = {
  name: 'uber+json',
  mediaType: 'application/vnd.amundsen-uber+json',
  parser: parser,
  builder: null
}
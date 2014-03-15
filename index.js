var parser = require('./lib/parser');

HyperdescribeUberJSON = module.exports = {
  name: 'uber+json',
  mediaType: 'application/vnd.amundsen-uber+json',
  parser: parser,
  builder: function(x) { return x }
}
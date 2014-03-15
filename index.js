var describer = require('./lib/describer');

HyperdescribeUberJSON = module.exports = {
  name: 'uber+json',
  mediaType: 'application/vnd.amundsen-uber+json',
  describer: describer,
  builder: function(x) { return x }
}
Hyperdescribe for UBER+JSON Media Type
======================================

This is a library for converting from UBER to Hyperdescribe and back

## Usage

To install:

```javascript
npm install hyperdescribe-uber-json
```

To use:

```javascript
var uberDoc = require('./examples/uber_example.js'),
    HyperdescribeUberJSON = require('hyperdescribe-uber-json'),
    parsed = HyperdescribeUberJSON.parser(uberDoc);
```

## Browser Version

There is also a browser version in the `dist` directory.

* [Development](dist/uberjson.hyperdescribe.js)
* [Production](dist/uberjson.hyperdescribe.min.js)

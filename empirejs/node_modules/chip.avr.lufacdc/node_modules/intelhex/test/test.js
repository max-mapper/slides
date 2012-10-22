var
  assert    = require('assert'),
  intelhex  = require('../index');

// Sanity test
var sanity = intelhex(':101AB0000001000400050002000300010000000016:00000001FF');

sanity.on('data', function(d) {
  assert.strictEqual(
    d.bytes.join(''),
    '0104050203010000'
  );
});

var timeout = setTimeout(function() {
  assert.ok(false, 'End was never called')
}, 100)

sanity.on('end', function() {
  clearTimeout(timeout);
});
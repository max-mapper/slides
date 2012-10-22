var EventEmitter = require('events').EventEmitter;

var parse = module.exports = function(string, fn) {
  var
    ev      = new EventEmitter();
    parts   = string.split(':');

  string = string.replace(/[\r\n]/g,'');

  process.nextTick(function() {
    parts.forEach(function(line) {
      if (!line) {
        return;
      }

      var data = {
        size      : parseInt(line.substring(0,2), 16),
        // TODO: test this
        address   : parseInt(line.substring(2, 6), 16),
        type      : parseInt(line.substring(6,8), 16),
        bytes     : []
      };

      switch (data.type) {
        // Data record
        case 0:
          for (var i = 0, p = 0; i<data.size*2; i+=2, p++) {
            var byte = parseInt(line.substring(i+8, i+10), 16);
            data.bytes.push(byte);
          }
          data.checksum = parseInt(line.substring(8 + data.size*2,8 + data.size*2 + 2), 16);
          ev.emit('data', data);
        break;

        // End of file
        case 1:
          ev.emit('end');
        break;

        // Extended Segment Address Record
        case 2:
          ev.emit('error', new Error('TODO: Extended segment Address record'));
        break;

        // Start Segment Address Record
        case 3:
          ev.emit('error', new Error('TODO: Start Segment Address Record'));
        break;

        // Extended Linear Address Record
        case 4:
          ev.emit('error', new Error('TODO: Extended Linear Address Record'));
        break;

        // Start Linear Address Record
        case 5:
          ev.emit('error', new Error('TODO: Start Linear Address Record'));
        break;

        // Invalid format
        default:
          ev.emit('error', new Error('Invalid Intel Hex format'));
        break;
      }
    });
  });

  return ev;
};
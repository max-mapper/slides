var
  intelhex = require('intelhex'),
  Stream   = require('stream').Stream,
  util     = require('util');

var out = module.exports = {};

var d = function(c) {
  return (c + '').charCodeAt(0);
};

out.Flasher = function(serialport, options) {
  var that = this;
  this.options = options || {};
  this.sp = serialport;

  if (this.options.debug) {
    this.sp.on('data', function(d) {
      process.stdout.write(' -> ');

      for (var i=0; i<d.length; i++) {
        var c = d.toString().substring(i, i+1);
        if (c.charCodeAt(0) < 32 || c.charCodeAt(0) > 126) {
          c = '.';
        }

        process.stdout.write(c + ' [' + d.readUInt8(i).toString(16) + '] ');
      }
      process.stdout.write('\n');
    });
  }

  this.c = function(value, fn) {
    that.cmds.push({
      value : value,
      callback : function(data) {
        fn && fn(data);
      }
    });
    return this;
  }

  this.flashChunkSize = 0;
  this.bytes = [];
  this.cmds = [];
};

out.Flasher.prototype = {
  run : function(fn) {
    var that = this;
    process.nextTick(function() {
      if (that.running) { return; }
      var cmd = that.cmds.shift();

      if (cmd) {
        running = true;
        that.options.debug && process.stdout.write('Send: ' + cmd.value);
        that.sp.once('data', function(d) {
          that.running = false;
          cmd.callback(d);

          process.nextTick(function() {
            if (that.cmds.length > 0) {
              that.run(fn);
            } else {
              fn && fn();
            }
          });
        });

        that.sp.write(cmd.value);
      }
    });
  },

  prepare : function(fn) {
    var that = this;
    this.c('S', function(d) {
          if (d.toString() !== 'LUFACDC') {
            fn(new Error('Invalid device signature'));
          }
        })
        .c('V')
        .c('v')
        .c('p')
        .c('a')
        .c('b', function(d) {
          that.flashChunkSize = d.readUInt8(2);
        })
        .c('t')
        .c('TD')
        .c('P')
        .c('F')
        .c('F')
        .c('F')
        .c('N')
        .c('N')
        .c('N')
        .c('Q')
        .c('Q')
        .c('Q')
        .c([d('A'), 0x03, 0xfc])
        .c([d('g'), 0x00, 0x01, d('E')])
        .c([d('A'), 0x03, 0xff])
        .c([d('g'), 0x00, 0x01, d('E')])
        .c([d('A'), 0x03, 0xff])
        .c([d('g'), 0x00, 0x01, d('E')])
        .c([d('A'), 0x03, 0xff])
        .c([d('g'), 0x00, 0x01, d('E')])

    this.run(function() {
      fn(null, that);
    });
  },

  erase : function(fn) {
    this.c('e', function() {
      fn && fn();
    }) // erase

    this.run();
  },

  program : function(fullString, fn) {

    var
      that = this,
      converter,
      bytes = [];

    this.totalBytes = 0;

    this.c([d('A'), 0x00, 0x00], function() {
      converter = intelhex(fullString);

      converter.on('data', function(data) {

        that.totalBytes+=data.bytes.length;
        // buffer the bytes so we can push them in the expected size on 'end'
        Array.prototype.push.apply(bytes, data.bytes);
      });

      converter.on('end', function() {
        that.options.debug && console.log('programming', bytes.length, 'bytes');
        that.chunksSent = [];

        for (var i=0; i<bytes.length; i+=that.flashChunkSize) {
          var chunk = bytes.slice(i, i+that.flashChunkSize);
          that.chunksSent.push(chunk);
          that.c([d('B'), 0x00, chunk.length, d('F')].concat(chunk));
        }
      });

      converter.on('error', function(err) {
        throw err;
      });
    });

    this.run(function() { fn && fn() });
  },

  verify : function(fn) {
    var that = this;
    // compare flash on device with the chunks we sent
    this.c([d('A'), 0x00, 0x00], function() {

      var
        index = 0,
        compare = function(deviceData) {

          var localChunk = that.chunksSent[index];
          index++;

          if (index >= that.chunksSent.length) {
            fn && fn();
            return;
          }

          // Quick check to make sure the lengths match
          if (localChunk.length !== deviceData.length) {
            fn(new Error(
              "Flashed content length differs! local:" + localChunk.length +
              'vs device: ' + d.length
            ));
          }

          localChunk.forEach(function(val, idx) {
            if (val !== deviceData.readUInt8(idx)) {
              fn(new Error('Firmware on the device does not match local data'));
            }
          });

          process.nextTick(function() {
            var readSize = that.flashChunkSize;
            that.options.debug && console.log(that.totalBytes - index*that.flashChunkSize);
            if (that.totalBytes - index*that.flashChunkSize < that.flashChunkSize) {
              readSize = that.totalBytes - index*that.flashChunkSize;
            }
            that.c([d('g'), 0x00, readSize, d('F')], compare);
            that.run();
          });
        };

      that.options.debug && console.log('\n\nVerifying flash..')

      that.c([d('g'), 0x00, that.flashChunkSize, d('F')], compare);
      that.run();
    });
    that.run();
  },

  fuseCheck :  fuseCheck = function(fn) {
    this.options.debug && console.log('checking fuses');
    // fuse check
    this.c('F')
        .c('F')
        .c('F')
        .c('N')
        .c('N')
        .c('N')
        .c('Q')
        .c('Q')
        .c('Q')
        .c('L')
        .c('E');

    this.run(function() {
      fn();
    });
  }
};

out.init = function(serialport, fn) {
  var flasher = new out.Flasher(serialport);
  flasher.prepare(fn);
};
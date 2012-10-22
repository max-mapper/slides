var
  serialport = require('serialport'),
  glob       = require('glob'),
  EventEmitter = require('events').EventEmitter,
  async = require('async');


var serial = module.exports = new EventEmitter();

serial.pollInterval = 500;
var found = false;
serial.search = function(fn) {

  this.emit('searching');

  var
    that = this,
    poll = function poll() {
      if (found) { return; }


      var sp;
      glob('/dev/tty.usb*', function(err, matches) {


        if (matches && matches.length) {
          async.forEach(matches, function(match, collect) {

            if (found) {
              return collect();
            }
            // attempt to create a serial port
            try {
              sp = new serialport.SerialPort(match, {
                parser : serialport.parsers.readline('\n')
              });

            } catch (e) {
              console.log('ERROR', e.message);
              // catch problems with busy ports
              return collect();
            }

            sp.on('data', function(data) {
              if (data.toString() === 'tpad') {

                sp.removeAllListeners();

                sp.once('data', function(config) {
                  collect({
                    serialport : sp,
                    tpad : JSON.parse(config)
                  });
                });

                sp.on('close', function() {
                  that.emit('disconnected');
                  found = false;
                  that.emit('searching');
                  setTimeout(poll, that.pollInterval);
                });

              } else {
                collect();
              }
            });

          }, function(sp) {

            if (found) {
              return;
            } else if (!sp) {
              setTimeout(poll, that.pollInterval);
            } else {
              found = true;
              fn && fn(null, sp);
            }
          });
        } else {
          setTimeout(poll, that.pollInterval);
        }
      });
    };

    poll();
};

serial.init = function() {
  var that = this;
  process.nextTick(function() {
    that.search(function(err, data) {
      that.emit('connected', data);
    });
  });
};

var
  fs      = require('fs'),
  path    = require('path'),
  request = require('request'),
  async   = require('async'),
  EM      = require('events').EventEmitter,
  exec    = require('child_process').exec,
  semver  = require('semver'),
  lufacdc = require('chip.avr.lufacdc'),
  SerialPort = require('serialport').SerialPort;

function error() {
  console.log(arguments);
}

var firmware = module.exports = function(options) {
  options = options || {};
  var
    firmwareFolder = options.location || __dirname + '/tpad-firmware';

  // TODO: ensure you can specify a firmware dir
  if (!options.location) {
    firmware.fetch(options, function(err, hexData) {
      firmware.flash(hexData, options);
    });
  } else {
    var hexFilePath = path.resolve(options.location);
    console.log('Using firmware', hexFilePath);
    fs.readFile(hexFilePath, function(err, data) {
      firmware.flash(data.toString(), options);
    });
  }
};


firmware.fetch = function(options, fn) {

  // get the latest firmware
  console.log('finding the latest firmware');
  request('https://api.github.com/repos/tmpvar/tpad-firmware/git/refs/tags', function(err, res) {
    if (err) {
      return fn(err);
    }

    var data    = JSON.parse(res.body);

    // find the latest version
    data.sort(function(a, b) {
      return (semver.gt(a, b)) ? -1 : 1;
    });

    var latest = data[0];
    var tag = latest.ref.replace('refs/tags/', '');
    var tpad = options.tpad.name;

    var url = 'https://raw.github.com/tmpvar/tpad-firmware/' + tag +
          '/tpad/' + tpad + '/' + tpad + '.hex';

    console.log('fetching', url)
    request(url, function(err, res) {
      if (err) {
        return fn(err);
      }

      fn(null, res.body.toString());
    });
  });
};

// Basically wait for the known tpad connection to drop
// wait 2 seconds then run chip.avr.lufacdc's flash mechanism
firmware.waitForReset = function(options, fn) {

  // attempt a software reset (as of firmware 0.0.2)
  if (options.tpad.version && semver.gte(options.tpad.version, '0.0.2')) {
    process.stdout.write('tpad is resetting')
    options.serialport.write('!');
  } else {
    console.log(' ** Please press reset on the device **');
  }

  var state = 0;
  setTimeout(function tick() {
    fs.exists(options.serialport.port, function(e) {

      // ready to go!
      if (!e) {
        process.stdout.write('.')
        state = 1;
        setTimeout(tick, 100);
      } else if (state === 1) {
        options.serialport.close();
        setTimeout(function() {
          fn();
        }, 500);
      } else {
        setTimeout(tick, 100);
      }
    });
  }, 100);
};

firmware.flash = function(hexData, options, fn) {
  firmware.waitForReset(options, function(err) {
    if (err) {
      fn && fn(err);
      return;
    }

    var sp = new SerialPort(options.serialport.port);

    sp.on('open', function() {
      lufacdc.init(sp, function (err, flasher) {
        if (err) {
          throw err;
        }

        console.log('\nerasing chip')
        flasher.erase(function() {

          console.log('programming');
          flasher.program(hexData, function(err) {
            if (err) throw err;

            console.log('verifying')
            flasher.verify(function(err) {
              if (err) {
                throw err
              }
              flasher.fuseCheck(function(err) {
                if (err) throw err;
                console.log('OK!');
                process.exit();
              });
            });
          });
        });
      });
    });
  });
};
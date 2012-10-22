var EventEmitter = require('events').EventEmitter
  , color = require('color')
  , serial = require('./serial')
  , Button = require('./button');

function Tpad(config) {

  var that = this, states = {};
  this.serialport = config.serialport;
  this.activationThreshold = config.activationThreshold || 4000;
  this.config = config.tpad;
  this.buttons = [];

  //
  // Hook up serialport events
  //
  this.serialport.on('data', function(data) {
    that.onSerialLine(data);
  });

  //
  // Add Buttons
  //
  for (var i=0; i<config.tpad.pads; i++) {
    this.buttons.push(new Button(i, config.serialport));
  }

  var ret = function(index, color) {
    if (color) {
      that.buttons[index].color(color);

    // shortcut for setting all of the pads
    // to a color
    } else if (index.length) {
      ret.color(index);
    }
    return typeof index !== 'undefined' ? that.buttons[index] : that;
  };

  ret.color = function(color) {
    that.buttons.forEach(function(button) {
      button.color(color);
    });
  };

  ret.animate = function(interval, pads, fn) {
    this.stop();

    var index = 0;
    this.timer = setInterval(function() {
      fn && fn(that.buttons[pads[index]]);
      index++;
      if (index >= pads.length) {
        index = 0;
      }
    }, interval);
  };

  ret.stop = function() {
    clearInterval(this.timer);
  }

  ret.each = function(fn) {
    fn && that.buttons.forEach(fn);
  }

  ret.config = that.config;
  ret.activationThreshold = this.activationThreshold;
  return ret;
};

Tpad.prototype = {

  //
  // Handle incoming lines from serial
  //
  onSerialLine : function(line) {
    // parse the line into parts
    var
      parts = line.split(','),
      button = parseInt(parts[0], 10),
      value = parseInt(parts[1], 10);

    // emit the current pressure
    this.buttons[button].emit('raw', value);
  }
};

module.exports = function (options) { return new Tpad(options) };

module.exports.init = function (options, cb) {
  if (!cb) {
    cb = options
    options = {}
  }
  serial.init()

  var spinnerTimer = function () {}

  if (!options.noOutput) {
  var spinner = "|/-\\", spinnerPos = 0, spinnerTimer;
    serial.on('searching', function() {
      process.stdout.write('searching  ');
      spinnerTimer = setInterval(function() {
        process.stdout.write(spinner[spinnerPos]);
        spinnerPos++;
        if (spinnerPos >= spinner.length) {
          spinnerPos = 0;
        }
      }, 50);
    });
  }

  serial.on('connected', function(config) {
    clearInterval(spinnerTimer)

    if (!options.noOutput) {
      console.log('\n\nconnected to a', config.tpad.name, 'with', config.tpad.pads, 'pads')
    }

    var currentSerialPort = config.serialport
    var tpad = new Tpad(config)

    cb(null, tpad)
  });

  serial.on('disconnected', function() {
    if (!options.noOutput) {
      console.log('disconnected');
    }
  });

}

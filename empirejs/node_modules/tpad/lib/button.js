var
  EventEmitter = require('events').EventEmitter,
  color        = require('color');

var Button = module.exports = function Button(index, serialport) {
  EventEmitter.call(this);

  this.index = index;
  this.history = [];
  this.serialport = serialport;

  this.init();
};

Button.prototype = new EventEmitter();
Button.prototype.activationThreshold = 4000;
Button.prototype.value = 0;

Button.prototype.init = function() {
  var that = this;

  this.currentColor = color('#000');

  this.on('raw', function(value) {
    var event = false;
    if (!that.pressed && value > that.activationThreshold) {
      event = 'press';
      that.pressed = true;
    } else if (that.pressed && value < that.activationThreshold) {
      event = 'depress';
      that.pressed = false;
    }

    that.history.unshift(value);
    that.history.length = 5;

    that.value = value;
    that.emit('pressure', this);

    if (event) {
      that.emit(event, this);
    }
  });
};

Button.prototype.color = function() {
  var args = [];

  Array.prototype.push.apply(args, arguments);

  if (args.length === 0) {
    return this.currentColor;
  }

  var rgb;

  if (args.length === 1) {
    args = args.shift();
  }

  // handle color objects directly
  if (args && args.rgbArray) {
    this.currentColor = args;
    rgb = args.rgb();
  } else if (typeof args === 'string') {
    this.currentColor = color(args);
    rgb = this.currentColor.rgb();
  } else if (args.length === 3) {
    this.currentColor = color().rgb(args);
    rgb = this.currentColor.rgb();
  } else {
    return this.currentColor;
  }

  if (this.serialport) {
    this.serialport.write([this.index, rgb.r, rgb.g, rgb.b].join(',') + '\n');
  }
  return this.currentColor;
};

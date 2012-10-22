try {
  var midi = require('midi');
} catch (e) {
  console.log('WARNING: midi module not found, it will not work!');
  module.exports = function() {};
  return;
}
var MAX = 18000;
var output = new midi.output();
output.getPortCount();
output.getPortName(0);
output.openPort(0);

var state = {0:false, 1:false, 2: false, 3: false };

module.exports = function(tpad) {

  var handlePress = function(pad) {
    if (!state[pad.index]) {
      var velocity = Math.floor(63.5 + ((pad.value-tpad.activationThreshold)/(18000-tpad.activationThreshold))*63.5);

      if (velocity > 127) { velocity = 127; }

      output.sendMessage([
        144,
        60+pad.index,
        velocity
      ]);

      state[pad.index] = true
      pad.color('#00FF00');
      pad.once('depress', handleDepress);
    }
  };

  var handleDepress = function(pad) {
    if (state[pad.index]) {

      output.sendMessage([128, 60+pad.index, 127]);

      state[pad.index] = false;
      pad.color('#000000');
      pad.once('press', handlePress);
    }
  };

  tpad.each(function(pad, i) {
    pad.once('press', handlePress);
  });
};
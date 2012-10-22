var tpad = require('../lib/tpad')
  , color = require('color')
  ;

tpad.init(function (err, tpad) {
  function initStats() {
    return {
      0: {values: [], last: 0},
      1: {values: [], last: 0},
      2: {values: [], last: 0},
      3: {values: [], last: 0}
    }
  }
  
  var padstats = initStats()
  
  function average(ary) {
    var sum = 0
    for (var i = 0; i < ary.length; i++) {
        sum += parseInt(ary[i])
    }
    return sum/(ary.length)
  }
  
  function difference(num1, num2) {
    num1 = Math.abs(num1)
    num2 = Math.abs(num2)
    return (num1 > num2) ? num1 - num2 : num2 - num1
  }
  
  function translate(n, sourceLow, sourceHigh, targetLow, targetHigh) { 
    return (n - sourceLow) / (sourceHigh - sourceLow) * (targetHigh - targetLow) + targetLow
  }
  
  var bucketsize = 5
  var colorchangethreshhold = 5
  var lowerpressure = 2000
  var upperpressure = 18000
  var lastTouch

  tpad.each(function(pad, index) {
    
    setInterval(function() {
      if ( (new Date() - lastTouch) > 200 ) {
        pad.color('#609FFF')
        padstats = initStats()
      }
    }, 199)
    
    pad.on('pressure', function(p) {
      lastTouch = new Date()
      var bucket = padstats[p.index]
      if (bucket.values.length > bucketsize) bucket.values.pop()
      if (p.value < lowerpressure) p.value = lowerpressure
      if (p.value > upperpressure) p .value = upperpressure
      var num = translate(p.value, lowerpressure, upperpressure, 0, 255)
      num = Math.floor(num)
      bucket.values.unshift(num)
      var avg = Math.floor(average(bucket.values))
      var val = bucket.last
      if (difference(avg, bucket.last) > colorchangethreshhold) val = avg
      var c = color({r: val, g: 255 - val, b: 255})
      console.log(val, c.hexString())
      p.color(c.hexString())
      bucket.last = val
    });
    
    pad.on('depress', function(p) {
      padstats = initStats()
    });

  });

});

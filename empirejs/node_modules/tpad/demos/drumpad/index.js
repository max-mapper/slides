var tpad = require('../../lib/tpad')
var color = require('color')
var _ = require('underscore')
var debounceMilliseconds = 100

tpad.init(function (err, tpad) {
  tpad.each(function(pad, index) {
    pad.on('pressure', _.throttle(function(p) {
      
    }, debounceMilliseconds))
  })
})

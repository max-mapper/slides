var tpad = require('../lib/tpad');

tpad.init(function (err, tpad) {
  if (err) throw err

  var colors = 
      [ 'CC0033'
      , '990099'
      , '66CC66'
      , '333399'
      , '00E5EE'
      ]
    
  var pnum = 0
    , cindex = 0
    ;
  tpad.animate(300, [0,1,2,3], function(pad) {
    tpad.color('000') // turn all the lights off
    pad.color(colors[cindex]) // turn the current pad to a color
    pnum += 1
    if (pnum === 4) {
      pnum = 0
      if (cindex === colors.length - 1) cindex = 0
      else cindex += 1
    }
  });
})

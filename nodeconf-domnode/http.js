// before
  var request = new XMLHttpRequest()
  var offset = 0
  request.open("GET", "http://html5zombo.com", true)
  request.onreadystatechange = function() {
    if (request.responseText.length > offset) {
      console.log(res.responseText.slice(this.offset))
      offset = res.responseText.length
    }
  }
  request.send(null)

// after
  var request = require('request')
  request('http://html5zombo.com')
    .on('data', console.log)


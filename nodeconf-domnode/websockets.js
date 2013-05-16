// before

  // server
  io.sockets.on('connection', function (socket) {
    var pizza = fs.createReadStream('pizza.txt')
    pizza.on('data', function(chunk) {
      socket.emit('pizza', chunk)
    })
    pizza.on('end', function() {
      socket.emit('pizza', null)
    })
  })

// after

  // client
  var shoe = require('shoe')
  shoe('/pizza')
    .on('data', console.log)
  
  // server
  shoe(function (stream) {
    fs.createReadStream('pizza.txt')
      .pipe(stream)
  })

  // see also
  // https://github.com/dominictarr/mux-demux
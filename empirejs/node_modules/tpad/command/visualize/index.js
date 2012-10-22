var
  http = require('http'),
  socketio = require('socket.io'),
  path = require('path'),
  basedir = __dirname + '/public',
  fs = require('fs'),
  server = http.createServer(function(req, res) {
    if (req.url.indexOf('..') > -1) {
      return;
    }

    if (req.url === '/') {
      req.url = 'index.html';
    }

    var file = path.join(basedir, req.url);

    fs.stat(file, function(err) {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
      } else {
        var stream = new fs.createReadStream(file);
        stream.pipe(res);
      }
    })
  }),
  io,
  spawn = require('child_process').spawn;

module.exports = function(tpad, spawnBrowser) {
  if (!io) {
    io = socketio.listen(server);
    io.set('log level', 0);
  }

  io.sockets.on('connection', function(socket) {

    // send configuration data
    socket.emit('tpad::config', tpad.config);
  });

  server.listen(1024);

  (spawnBrowser !== false) && spawn('open', ['http://localhost:1024/']);

  var time = 0;
  tpad.each(function(pad) {
    pad.on('pressure', function() {
      var now = Date.now();
      if (pad.value === 0 || now - time > 1000/20) {
        io.sockets.emit('tpad::pressure', [pad.index, pad.value].join(','));
        time=now;
      }
    })
  });
};

module.exports.stop = function() {
  console.log(server);
  server.close();
}


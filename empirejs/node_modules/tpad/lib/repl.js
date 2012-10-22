var repl = require('repl'), start = repl.start;

repl.start = function(data) {

  var server = start.call(this, '');
  server.stop = function() {
    server.rli.close();
  }

  server.updatePrompt = function(config) {
    this.prompt = config.name + ' v' + (config.version || '') + '> ';
    this.displayPrompt();
  };

  return server;
};


module.exports = repl;
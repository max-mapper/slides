var
  glob = require('glob'),
  path = require('path');

module.exports = function(repl) {
  glob(__dirname + '/*', function(err, matches) {
    matches.forEach(function(match) {
      if (match !== 'index.js') {
        var name = path.basename(match);
        var command = require(match);
        repl.context[name] = function() {
          var args = [];
          Array.prototype.push.apply(args, arguments);
          args.unshift(repl.context.tpad);
          command.apply(command, args);
        }
      }
    });
  });
};
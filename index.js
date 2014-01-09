var jade = require('jade');
var sysPath = require('path');
var umd = require('umd-wrapper');
var progeny = require('progeny');

function JadeCompiler(cfg) {
  if (cfg == null) cfg = {};
  var defaultBaseDir = sysPath.join(cfg.paths.root, 'app');
  var config = cfg.plugins && cfg.plugins.jade;
  this.basedir = (config && config.basedir) || defaultBaseDir;
  this.getDependencies = progeny({rootPath: this.basedir});
}

JadeCompiler.prototype.brunchPlugin = true;
JadeCompiler.prototype.type = 'template';
JadeCompiler.prototype.extension = 'jade';

JadeCompiler.prototype.compile = function(data, path, callback) {
  var compiled, error, result;
  try {
    compiled = jade.compileClient(data, {
      compileDebug: false,
      filename: path,
      basedir: this.basedir,
      pretty: this.pretty
    });
    return result = umd(compiled);
  } catch (_error) {
    error = _error;
  } finally {
    callback(error, result);
  }
};

JadeCompiler.prototype.include = [sysPath.join(__dirname, 'node_modules', 'jade', 'runtime.js')];

module.exports = JadeCompiler;

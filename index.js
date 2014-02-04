var jade = require('jade');
var sysPath = require('path');
var umd = require('umd-wrapper');
var progeny = require('progeny');

// perform a deep cloning of an object
function clone(obj) {
  if (null == obj || "object" != typeof obj) return obj;
  var copy = obj.constructor();
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
  }
  return copy;
}

function JadeCompiler(cfg) {
  if (cfg == null) cfg = {};
  var defaultBaseDir = sysPath.join(cfg.paths.root, 'app');
  var config = (cfg.plugins && cfg.plugins.jade && cfg.plugins.jade.options)
               || (cfg.plugins && cfg.plugins.jade);

  // cloning is mandatory because config is not mutable
  this.options = clone(config) || {}

  this.options.compileDebug = false;
  this.options.client = true;
  this.options.basedir = (config && config.basedir) || defaultBaseDir;

  this.getDependencies = progeny({rootPath: this.options.basedir});
}

JadeCompiler.prototype.brunchPlugin = true;
JadeCompiler.prototype.type = 'template';
JadeCompiler.prototype.extension = 'jade';

JadeCompiler.prototype.compile = function(data, path, callback) {
  var compiled, error, result;
  try {
    // cloning is mandatory because Jade changes it
    options = clone(this.options);
    options.filename = path;
    compiled = jade.compileClient(data, options);
    return result = umd(compiled);
  } catch (_error) {
    error = _error;
  } finally {
    callback(error, result);
  }
};

JadeCompiler.prototype.include = [sysPath.join(__dirname, 'node_modules', 'jade', 'runtime.js')];

module.exports = JadeCompiler;

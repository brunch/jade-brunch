'use strict';

const jade = require('jade');
const sysPath = require('path');
const umd = require('umd-wrapper');
const progeny = require('progeny');

// perform a deep cloning of an object
const clone = (obj) => {
  if (null == obj || 'object' !== typeof obj) return obj;
  const copy = obj.constructor();
  for (const attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
  }
  return copy;
};

class JadeCompiler {
  constructor(cfg) {
    if (cfg == null) cfg = {};
    const defaultBaseDir = sysPath.join(cfg.paths.root, 'app');
    const jade = cfg.plugins && cfg.plugins.jade;
    const config = (jade && jade.options) || jade;

    // Allow runtime to be excluded
    if (config && config.noRuntime) {
      this.include = [];
    }

    // cloning is mandatory because config is not mutable
    this.options = clone(config) || {};
    this.options.compileDebug = false;
    this.options.client = true;
    this.options.basedir = (config && config.basedir) || defaultBaseDir;

    this.getDependencies = progeny({
      rootPath: this.options.basedir,
      reverseArgs: true
    });
  }

  compile(params) {
    const data = params.data;
    const path = params.path;

    const options = clone(this.options);
    options.filename = path;

    return new Promise((resolve, reject) => {
      let result, error;
      try {
        let compiled;
        // cloning is mandatory because Jade changes it
        if (options.preCompile === true) {
          const precompiled = jade.compile(data, options)();
          compiled = JSON.stringify(precompiled);
        } else {
          compiled = jade.compileClient(data, options);
        }
        result = umd(compiled);
      } catch (_error) {
        error = _error;
      } finally {
        if (error) return reject(error);
        resolve(result);
      }
    });
  }
}

let jadePath = require.resolve('jade');

while (sysPath.basename(jadePath) !== 'jade') {
  jadePath = sysPath.dirname(jadePath);
}

JadeCompiler.prototype.include = [
  sysPath.join(jadePath, 'runtime.js')
];

JadeCompiler.prototype.brunchPlugin = true;
JadeCompiler.prototype.type = 'template';
JadeCompiler.prototype.extension = 'jade';

module.exports = JadeCompiler;

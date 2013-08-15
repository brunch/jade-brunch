jade = require 'jade'
sysPath = require 'path'
umd = require 'umd-wrapper'
progeny = require 'progeny'

module.exports = class JadeCompiler
  brunchPlugin: yes
  type: 'template'
  extension: 'jade'

  constructor: (@config) ->
    @config.paths.base = sysPath.join(@config.paths.root, 'app') unless @config.paths.base?
    @getDependencies = progeny rootPath: @config.paths.base

  compile: (data, path, callback) ->
    try
      compiled = jade.compile data,
        compileDebug: no,
        client: yes,
        filename: path,
        basedir: @config.paths.base,
        pretty: !!@config.plugins?.jade?.pretty
      result = umd compiled
    catch err
      error = err
    finally
      callback error, result

  # Add '../node_modules/jade/jade.js' to vendor files.
  include: [
    (sysPath.join __dirname, '..', 'vendor', 'runtime.js')
  ]

jade = require 'jade'
sysPath = require 'path'
umd = require 'umd-wrapper'
progeny = require 'progeny'

module.exports = class JadeCompiler
  brunchPlugin: yes
  type: 'template'
  extension: 'jade'

  constructor: (@config) ->
    @getDependencies = progeny rootPath: @config.paths.root

  compile: (data, path, callback) ->
    try
      compiled = jade.compile data,
        compileDebug: no,
        client: yes,
        filename: path,
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

jade = require 'jade'
sysPath = require 'path'

module.exports = class JadeCompiler
  compilerType: 'template'
  extension: 'jade'

  constructor: (@config) ->
    null

  compile: (data, path, callback) ->
    try
      content = jade.compile data, 
        compileDebug: no,
        client: yes,
        filename: path
      result = "module.exports = #{content};"
    catch err
      error = err
    finally
      callback error, result

  # Add '../node_modules/jade/jade.js' to vendor files.
  include: ->
    [(sysPath.join '..', 'node_modules', 'jade', 'jade.js')]

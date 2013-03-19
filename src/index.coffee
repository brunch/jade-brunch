jade = require 'jade'
sysPath = require 'path'

module.exports = class JadeCompiler
  brunchPlugin: yes
  type: 'template'
  extension: 'jade'
  _dependencyRegExp: /^ *(?:include|extends) (.*)/

  constructor: (@config) ->
    return

  compile: (data, path, callback) ->
    try
      content = jade.compile data,
        compileDebug: no,
        client: yes,
        filename: path,
        pretty: !!@config.plugins?.jade?.pretty
      result = "module.exports = #{content};"
    catch err
      error = err
    finally
      callback error, result

  # Add '../node_modules/jade/jade.js' to vendor files.
  include: [
    (sysPath.join __dirname, '..', 'vendor', 'runtime.js')
  ]

  getDependencies: (data, path, callback) =>
    parent = sysPath.dirname path
    dependencies = data
      .split('\n')
      .map (line) =>
        line.match(@_dependencyRegExp)
      .filter (match) =>
        match?.length > 0
      .map (match) =>
        match[1]
      .filter (path) =>
        !!path
      .map (path) =>
        if sysPath.extname(path) isnt ".#{@extension}"
          path + ".#{@extension}"
        else
          path
      .map (path) =>
        if path.charAt(0) is '/'
          sysPath.join @config.paths.root, path[1..]
        else
          sysPath.join parent, path
    process.nextTick =>
      callback null, dependencies

var expect = require('chai').expect;
var Plugin = require('./');
var jade = require('jade');
var sysPath = require('path');
var fs = require('fs');

describe('Plugin', function() {
  var plugin;

  beforeEach(function() {
    plugin = new Plugin({paths: {root: '.'}});
  });

  it('should be an object', function() {
    expect(plugin).to.be.ok;
  });

  it('should has #compile method', function() {
    expect(plugin.compile).to.be.an.instanceof(Function);
  });

  it('should compile and produce valid result', function(done) {
    var content = 'doctype html';
    var expected = '<!DOCTYPE html>';

    plugin.compile({data: content, path: 'template.jade'}).then(data => {
      expect(eval(data)()).to.equal(expected);
      done();
    }, error => expect(error).not.to.be.ok);
  });

  describe('runtime', function() {

    it('should include jade/runtime.js', function(){
      expect(plugin.include).to.match(/jade\/runtime\.js$/);
    });

    it('jade/runtime.js should exist', function(){
      expect(fs.existsSync(plugin.include[0])).to.be.ok;
    });

  });


  describe('getDependencies', function() {
    it('should output valid deps', function(done) {
      var content = "\
include valid1\n\
include valid1.jade\n\
include ../../test/valid1\n\
include ../../test/valid1.jade\n\
include /valid3\n\
extends valid2\n\
extends valid2.jade\n\
include ../../test/valid2\n\
include ../../test/valid2.jade\n\
extends /valid4\n\
";

      var expected = [
        sysPath.join('valid1.jade'),
        sysPath.join('app', 'valid3.jade'),
        sysPath.join('valid2.jade'),
        sysPath.join('app', 'valid4.jade'),
      ];

      // progeny now only outputs actually found files by default
      fs.mkdirSync('app');
      expected.forEach(function(file) {
        fs.writeFileSync(file, 'div');
      });

      plugin.getDependencies(content, 'template.jade', function(error, dependencies) {
        expect(error).not.to.be.ok;
        expect(dependencies).to.have.members(expected);

        // clean up temp fixture files
        expected.forEach(function(file) {
          fs.unlinkSync(file);
        });
        fs.rmdirSync('app');

        done();
      });
    });
  });

  describe('getDependenciesWithOverride', function() {
    it('should output valid deps', function(done) {

      var content = "\
include /valid3\n\
extends /valid4\n\
";

      var expected = [
        sysPath.join('custom', 'valid3.jade'),
        sysPath.join('custom', 'valid4.jade'),
      ];

      // progeny now only outputs actually found files by default
      fs.mkdirSync('custom');
      expected.forEach(function(file) {
        fs.writeFileSync(file, 'div');
      });

      plugin = new Plugin({paths: {root: '.'}, plugins: {jade: {basedir: 'custom'}}});

      plugin.getDependencies(content, 'template.jade', function(error, dependencies) {
        expect(error).not.to.be.ok;
        expect(dependencies).to.have.members(expected);

        // clean up temp fixture files
        expected.forEach(function(file) {
          fs.unlinkSync(file);
        });
        fs.rmdirSync('custom');

        done();
      });
    });
  });

});

var jade = require('jade');
var sysPath = require('path');

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
    var content = '!!! 5';
    var expected = '<!DOCTYPE html>';

    plugin.compile(content, 'template.jade', function(error, data) {
      expect(error).not.to.be.ok;
      expect(eval(data)()).to.equal(expected);
      done();
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
        sysPath.join('..', '..', 'test', 'valid1.jade'),
        sysPath.join('app', 'valid3.jade'),
        sysPath.join('valid2.jade'),
        sysPath.join('..', '..', 'test', 'valid2.jade'),
        sysPath.join('app', 'valid4.jade'),
      ];

      plugin.getDependencies(content, 'template.jade', function(error, dependencies) {
        expect(error).not.to.be.ok;
        expect(dependencies).to.eql(expected);
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

      plugin = new Plugin({paths: {root: '.'}, plugins: {jade: {basedir: 'custom'}}});

      plugin.getDependencies(content, 'template.jade', function(error, dependencies) {
        expect(error).not.to.be.ok;
        expect(dependencies).to.eql(expected);
        done();
      });
    });
  });

});

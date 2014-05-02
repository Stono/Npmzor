'use strict';
var assert     = require('assert');
var http       = require('http');
var HttpUtil   = require('../../lib/httpUtil').HttpUtil;
var mockConfig = require('../mockConfig');
var fs         = require('fs');

describe('HTTP Utilities (getHttpOpts)', function() {

  it('Should not return proxy options if none are configured', function(done) {
    var config        = mockConfig.getNoProxyConfig();

    var httpUtil      = new HttpUtil(config, null);
    var expected      = getOptsExpectedWithNoProxy();

    var result = httpUtil.getHttpOpts('http://registry.npmjs.org/mkdirp');
    assert.equal(JSON.stringify(expected), JSON.stringify(result));
    done();

  });

  it('Should return proxy options for http if only http configured', function(done) {
    var config   = mockConfig.getHttpProxyConfig();

    var httpUtil = new HttpUtil(config, null);
    var expected = getOptsExpectedWithProxy('http');

    var result   = httpUtil.getHttpOpts('http://registry.npmjs.org/mkdirp');
    assert.equal(JSON.stringify(expected), JSON.stringify(result));
    done();
  });

  it('Should return proxy options for https if only https configured', function(done) {
    var config   = mockConfig.getHttpsProxyConfig();

    var httpUtil = new HttpUtil(config, null);
    var expected = getOptsExpectedWithProxy('https');

    var result   = httpUtil.getHttpOpts('https://registry.npmjs.org/mkdirp');
    assert.equal(JSON.stringify(expected), JSON.stringify(result));
    done();
  });

  it('Should not return proxy options for http when only https configured', function(done) {
    var config   = mockConfig.getHttpsProxyConfig();

    var httpUtil = new HttpUtil(config, null);
    var expected = getOptsExpectedWithNoProxy();

    var result   = httpUtil.getHttpOpts('http://registry.npmjs.org/mkdirp');
    assert.equal(JSON.stringify(expected), JSON.stringify(result));
    done();
  });

  it('Should not return proxy options for https when only http configured', function(done) {
    var config   = mockConfig.getHttpProxyConfig();

    var httpUtil = new HttpUtil(config, null);
    var expected = getOptsExpectedWithNoProxy();

    var result   = httpUtil.getHttpOpts('https://registry.npmjs.org/mkdirp');
    assert.equal(JSON.stringify(expected), JSON.stringify(result));
    done();
  });

  it('Should return http proxy options for a http url even if both are configured', function(done) {
    var config   = mockConfig.getBothProxyConfig();

    var httpUtil = new HttpUtil(config, null);
    var expected = getOptsExpectedWithProxy('http');

    var result   = httpUtil.getHttpOpts('http://registry.npmjs.org/mkdirp');
    assert.equal(JSON.stringify(expected), JSON.stringify(result));
    done();
  });

  it('Should return https proxy options for a https url even if both are configured', function(done) {
    var config   = mockConfig.getBothProxyConfig();

    var httpUtil = new HttpUtil(config, null);
    var expected = getOptsExpectedWithProxy('https');

    var result   = httpUtil.getHttpOpts('https://registry.npmjs.org/mkdirp');
    assert.equal(JSON.stringify(expected), JSON.stringify(result));
    done();
  });

  var getOptsExpectedWithProxy = function(protocol) {
    return {
      method: 'GET',
      path: protocol + '://registry.npmjs.org/mkdirp',
      port: 8080,
      hostname: 'proxy.sdc.hp.com', 
      headers: {
        Host: 'registry.npmjs.org',
        'User-Agent': 'NPMZor',
        Accept: '*/*',
        'Proxy-Connection': ''
      }
    };
  };
  var getOptsExpectedWithNoProxy = function() {
    return {
      method: 'GET', 
      path: '/mkdirp', 
      port: null, 
      hostname: 'registry.npmjs.org'
    };
  };

});

describe('HTTP Utilities (getJsonUrl)', function() {
  var server,
      config = mockConfig.getNoProxyConfig();

  before(function(done) {
    server = http.createServer(function (req, res) {
      res.writeHead(200, {'Content-Type': 'application/json'});
      fs.createReadStream(__dirname + '/../data/sample-requests/mkdirp').pipe(res);
    }).listen(config.port, done);
  });

  after(function() {
    server.close();
  });

  it('Should get a url and return a valid JSON object', function(done) {
    var httpUtil  = new HttpUtil(config, http);
    httpUtil.getJsonUrl(config.url, function(err, json) {
      assert.equal(err, null);
      assert.equal(json._id, 'mkdirp');
      done();
    });
  });

});


describe('HTTP Utilities (getBinaryUrl)', function() {
  var server,
      config = mockConfig.getNoProxyConfig();

  before(function(done) {
    server = http.createServer(function (req, res) {
      res.setHeader('Content-type', 'application/octet-stream');
      fs.createReadStream(__dirname + '/../data/sample-files/simple-empty-app-0.0.1.tgz').pipe(res);
    }).listen(config.port, done);
  });

  after(function() {
    server.close();
  });

  it('Should get a tgz file and save it to a temporary location', function(done) {
    var httpUtil  = new HttpUtil(config, http);
    var target    = config.temp + '/test-package.tgz';
    if(fs.existsSync(target)) {
      fs.unlinkSync(target);
    }
    httpUtil.getBinaryUrl(config.url, target, function(err) {
      assert.equal(err, null);
      done();
    });
  });

});
'use strict';
var assert   = require('assert');
var http     = require('http');
var HttpUtil = require('../../lib/httpUtil').HttpUtil;

var getNoProxyConfig = function() {
  var config = require('../../config');
  config.http.proxy = {
  };
  return config;
};

var getHttpProxyConfig = function() {
  var config = require('../../config');
  config.http.proxy = {
    http: {
      hostname: 'proxy.sdc.hp.com',
      port: 8080,
      protocol: 'http'
    }
  };
  return config;
};

var getHttpsProxyConfig = function() {
  var config = require('../../config');
  config.http.proxy = {
    https: {
      hostname: 'proxy.sdc.hp.com',
      port: 8080,
      protocol: 'https'
    }
  };
  return config;
};

var getBothProxyConfig = function() {
  var config = require('../../config');
  config.http.proxy = {
    http: {
      hostname: 'proxy.sdc.hp.com',
      port: 8080,
      protocol: 'http'
    },
    https: {
      hostname: 'proxy.sdc.hp.com',
      port: 8080,
      protocol: 'https'
    }
  };
  return config;
};

describe('httpUtil.getHttpOpts', function() {

  it('Should not return proxy options if none are configured', function(done) {
    var config        = getNoProxyConfig();

    var httpUtil      = new HttpUtil(config, null);
    var expected      = getOptsExpectedWithNoProxy();

    var result = httpUtil.getHttpOpts('http://registry.npmjs.org/mkdirp');
    assert.equal(JSON.stringify(expected), JSON.stringify(result));
    done();

  });

  it('Should return proxy options for http if only http configured', function(done) {
    var config   = getHttpProxyConfig();

    var httpUtil = new HttpUtil(config, null);
    var expected = getOptsExpectedWithProxy('http');

    var result   = httpUtil.getHttpOpts('http://registry.npmjs.org/mkdirp');
    assert.equal(JSON.stringify(expected), JSON.stringify(result));
    done();
  });

  it('Should return proxy options for https if only https configured', function(done) {
    var config   = getHttpsProxyConfig();

    var httpUtil = new HttpUtil(config, null);
    var expected = getOptsExpectedWithProxy('https');

    var result   = httpUtil.getHttpOpts('https://registry.npmjs.org/mkdirp');
    assert.equal(JSON.stringify(expected), JSON.stringify(result));
    done();
  });

  it('Should not return proxy options for http when only https configured', function(done) {
    var config   = getHttpsProxyConfig();

    var httpUtil = new HttpUtil(config, null);
    var expected = getOptsExpectedWithNoProxy();

    var result   = httpUtil.getHttpOpts('http://registry.npmjs.org/mkdirp');
    assert.equal(JSON.stringify(expected), JSON.stringify(result));
    done();
  });

  it('Should not return proxy options for https when only http configured', function(done) {
    var config   = getHttpProxyConfig();

    var httpUtil = new HttpUtil(config, null);
    var expected = getOptsExpectedWithNoProxy();

    var result   = httpUtil.getHttpOpts('https://registry.npmjs.org/mkdirp');
    assert.equal(JSON.stringify(expected), JSON.stringify(result));
    done();
  });

  it('Should return http proxy options for a http url even if both are configured', function(done) {
    var config   = getBothProxyConfig();

    var httpUtil = new HttpUtil(config, null);
    var expected = getOptsExpectedWithProxy('http');

    var result   = httpUtil.getHttpOpts('http://registry.npmjs.org/mkdirp');
    assert.equal(JSON.stringify(expected), JSON.stringify(result));
    done();
  });

  it('Should return https proxy options for a https url even if both are configured', function(done) {
    var config   = getBothProxyConfig();

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

describe('httpUtil.getUrl', function() {
  var server,
      serverReturns,
      endpoint = 'http://127.0.0.1:9615';

  before(function(done) {
    server = http.createServer(function (req, res) {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(serverReturns);
    }).listen(9615);
    done();
  });

  after(function(done) {
    server.close();
    done();
  });

  it('Should get a url and return a valid JSON object', function(done) {
    serverReturns = '{"myobject":"value"}';
    var config    = getNoProxyConfig();
    var httpUtil  = new HttpUtil(config, http);
    httpUtil.getJsonUrl(endpoint, function(err, json) {
      assert.equal(err, null);
      assert.equal(serverReturns, JSON.stringify(json));
      assert.equal(json.myobject, 'value');
      done();
    });
  });

});
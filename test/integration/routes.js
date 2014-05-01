'use strict';
var assert     = require('assert');
var http       = require('http');
var restler    = require('restler');
var _          = require('lodash');
var mockConfig = require('../mockConfig');

describe('Routing Configuration (routes)', function() {
  var server,
      endpoint = 'http://127.0.0.1:9615';

  before(function(done) {
    var routes = new require('../../lib/routes').Routes(mockConfig.getNoProxyConfig());
    server = http.createServer(routes.requestHandler);
    server.listen(9615, done);
  });

  after(function(done) {
    server.close(done);
  });

  var urls = [
    { url: 'readable-stream', code: 200 },
    { url: 'readable_stream', code: 200 },
    { url: 'r34dable_stream', code: 200 },
    { url: 'readable-stream/-/readable-stream-1.0.27-1.tgz', code: 200 },
    { url: 'readable-stream/-/readable-stream.tgz', code: 404 },
    { url: 'readable-stream/-/readable-stream.zip', code: 404 },
    { url: 'readable-stream/readable-stream.tgz', code: 404 }
  ];

  _.forEach(urls, function(url) {
    it('Should return status ' + url.code + ' for ' + url.url, function(done) {
      restler.get(endpoint + '/' + url.url)
      .on('complete', function(result, res) {
        assert.equal(result instanceof Error, false, result.toString());
        assert.equal(res.statusCode, url.code);
        done();
      });
    });
  });
  
});


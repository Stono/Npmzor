'use strict';
var assert     = require('assert');
var http       = require('http');
var http       = require('http');

describe('routes', function() {
  var server,
      endpoint = 'http://127.0.0.1:9615';

  before(function(done) {
    var routes = new require('../../lib/routes').Routes();
    server = http.createServer(routes.requestHandler);
    server.listen(9615);
    done();
  });

  after(function(done) {
    server.close();
    done();
  });

  var validUrls = [
    'readable-stream',
    'readable-stream/-/readable-stream-1.0.27-1.tgz'
  ];

  validUrls.forEach(function(url) {
    it('Should return status 200 for ' + url, function(done) {
      http.get(endpoint + '/' + url, function (res) {
        assert.equal(200, res.statusCode);
        done();
      });
    });
  });
  
});
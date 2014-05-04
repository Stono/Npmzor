'use strict';
var restler    = require('restler');
var assert     = require('assert');
var http       = require('http');
var fs         = require('fs');

var config     = require('../../config');
var crypto     = require('../../lib/crypto');
/*
 * Decided to have these tests hit the actual
 * npmjs.org registry, as then we know fo' sho'
 * that all is good.
 * However they're set to skip because Travis shouldn't
 * be hitting external stuff really. Just enable it if
 * you want to test that the app works against an actual repo
 */
describe('NPMZor against registry.npmjs.org', function() {
  
  // process.env.ENV = 'test';
  var endPoint = config.url;
  config.registries = ['http://registry.npmjs.org'];
  
  before(function(done) {
    require('../../app.js');
    done();
  });
  
  this.timeout(3000);

  it('Should return a valid index page', function(done) {
    restler.json(endPoint + '/deride')
    .on('complete', function(result, res) {
      assert.equal(result instanceof Error, false, result);
      assert.equal(res.statusCode, 200, 'Incorrect status code returned: ' + res.statusCode);
      assert.equal(result._id, 'deride', 'Result returned did not have an _id of deride');
      done();
    });
  });
  
  it('Should return a valid specific version page', function(done) {
    restler.json(endPoint + '/deride/0.1.0')
    .on('complete', function(result, res) {
      assert.equal(result instanceof Error, false);
      assert.equal(result.name, 'deride');
      assert.equal(result.version, '0.1.0');
      assert.equal(res.statusCode, 200);
      done();
    });
  });

  it('Should return a 404 when requestinga package version that doesnt exist', function(done) {
   restler.get(endPoint + '/deride/-/deride-0.0.7.tgz')
    .on('complete', function(result, res) {
      assert.equal(result instanceof Error, false);
      assert.equal(res.statusCode, 404);
      done();
    });
  });
  
  it('Should return a module when the request is valid', function(done) {
    var target  = '/tmp/' + Date.now().toString(12);
    var file    = fs.createWriteStream(target);
    http.get(endPoint + '/deride/-/deride-0.1.0.tgz', function(response) {
      response.pipe(file);
      file.on('finish', function() {
        file.close(function() {
          crypto.sha1(target, function(error, sum) {
            assert.equal(sum, 'e00f8de0eeb0da49ae51ad926742d4ab44fc1c32');
            done();
          });
        });
      });
    });
  });

  it('Should return a 404 on an invalid index page', function(done) {
    restler.get(endPoint + '/this-repo-doesnt-exist')
    .on('complete', function(result, res) {
      assert.equal(result instanceof Error, false);
      assert.equal(res.statusCode, 404);
      done();
    });
  });
  
});

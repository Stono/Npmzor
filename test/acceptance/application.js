'use strict';
var restler    = require('restler');
var assert     = require('assert');
var config     = require('../../config');
/*
 * Decided to have these tests hit the actual
 * npmjs.org registry, as then we know fo' sho'
 * that all is good.
 */
describe('NPMZor', function() {
  
  // process.env.ENV = 'test';
  var endPoint = 'http://127.0.0.1:' + config.port;

  before(function() {
    require('../../app.js');
  });
  
  it('It should return a valid index page', function(done) {
    restler.get(endPoint + '/deride')
    .on('complete', function(result, res) {
      assert.equal(result instanceof Error, false);
      assert.equal(res.statusCode, 200);
      done();
    });
  });
  
  it('It should return a 404 on an invalid index page', function(done) {
    restler.get(endPoint + '/this-repo-doesnt-exist')
    .on('complete', function(result, res) {
      assert.equal(result instanceof Error, false);
      assert.equal(res.statusCode, 404);
      done();
    });
  });
  
});
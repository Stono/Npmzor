'use strict';
var restler    = require('restler');
var assert     = require('assert');
var http       = require('http');
var fs         = require('fs');

var config     = require('../../config');
var testUtil   = new require('../testUtil').TestUtil(config);
var crypto     = require('../../lib/crypto');
/*
 * Decided to have these tests hit the actual
 * npmjs.org registry, as then we know fo' sho'
 * that all is good.
 * However they're set to skip because Travis shouldn't
 * be hitting external stuff really. Just enable it if
 * you want to test that the app works against an actual repo
 */
describe('NPMZor outside in', function() {
  
  var endPoint = config.url,
      app,
      fakeNpmEndpoint;
      
  var retStatus = 200,
      contentType = 'application/json',
      content;
      
  config.registries = ['http://127.0.0.1:6699'];

  beforeEach(function() {
    testUtil.clearCache();
  });
  
  before(function(done) {
    testUtil.clearAll();
    app = require('../../app.js');
    
    fakeNpmEndpoint = http.createServer(function (req, res) {
      res.writeHead(retStatus, {'Content-Type': contentType});
      res.end(content);
    }).listen(6699, function() {
      setTimeout(function() {
        done();
      }, 1000);
    });
  });
  
  after(function() {
    testUtil.clearAll();
    fakeNpmEndpoint.close();
    app().close();
  });
  
  this.timeout(3000);

  it('Should return a valid index page', function(done) {
    content = fs.readFileSync(__dirname + '/../data/sample-requests/mkdirp').toString();
    restler.json(endPoint + '/mkdirp')
    .on('complete', function(result, res) {
      assert.equal(result instanceof Error, false, result);
      assert.equal(res.statusCode, 200, 'Incorrect status code returned: ' + res.statusCode);
      assert.equal(result._id, 'mkdirp', 'Result returned did not have an _id of deride');
      done();
    });
  });
  
  it('Should return a valid specific version page', function(done) {
    content = fs.readFileSync(__dirname + '/../data/sample-requests/mkdirp').toString();
    restler.json(endPoint + '/mkdirp/0.1.0')
    .on('complete', function(result, res) {
      assert.equal(result instanceof Error, false);
      assert.equal(result.name, 'mkdirp');
      assert.equal(result.version, '0.1.0');
      assert.equal(res.statusCode, 200);
      done();
    });
  });

  it('Should return a 404 when requestinga package version that doesnt exist', function(done) {
    content = null;
    retStatus = 404;
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
    retStatus   = 200;
    content     = fs.readFileSync(__dirname + '/../data/sample-files/simple-empty-app-0.0.1.tgz');
    http.get(endPoint + '/deride/-/deride-0.1.0.tgz', function(response) {
      response.pipe(file);
      file.on('finish', function() {
        file.close(function() {
          crypto.sha1(target, function(error, sum) {
            assert.equal(sum, '4c3f6548fef5305e6ef5029ed7c34c992a707820');
            done();
          });
        });
      });
    });
  });

  it.only('Should accept a TGZ module PUT to it', function(done) {
    var sampleTgz = __dirname + '/../data/sample-files/simple-empty-app-0.0.1.tgz';
    restler.put(endPoint + '/simple-empty-app', {
      multipart: true,
      data: {
        package: restler.file(sampleTgz, null, 592, null, 'application/octet-stream')
      }
    }).on('complete', function(data, res) {
      assert.equal(data.response, 'simple-empty-app version 0.0.1 recieved and indexed.');
      assert.equal(res.statusCode, 200);
      done();
    });
  });
  
  it('Should return a 404 on an invalid index page', function(done) {
    content = null;
    retStatus = 404;
    restler.get(endPoint + '/this-repo-doesnt-exist')
    .on('complete', function(result, res) {
      assert.equal(result instanceof Error, false);
      assert.equal(res.statusCode, 404);
      done();
    });
  });
  
});

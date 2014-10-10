'use strict';
var assert      = require('assert');
var fs          = require('fs');
var deride      = require('deride');
var _           = require('lodash');

var NpmRegistry = require('../../lib/npmRegistry').NpmRegistry;
var HttpUtil    = require('../../lib/httpUtil').HttpUtil;
var mockConfig  = require('../mockConfig');

describe('NPM Registry (npmRegistry)', function() {
  var endpoint   = 'some-fake-endpoint';
  var sampleData = JSON.parse(fs.readFileSync(__dirname + '/../data/sample-requests/mkdirp'));
  var config     = mockConfig.getNoProxyConfig();

  it('Should return the path of a tgz package that has been downloaded', function(done) {
    var httpUtil   = deride.wrap(new HttpUtil(config));
    httpUtil.setup.getBinaryUrl.toCallbackWith([
      undefined, 
      'useless junk'
    ]);

    var npmRegistry = new NpmRegistry(config, httpUtil, endpoint);
    npmRegistry.getModule('simple-empty-app', 'simple-empty-app', '0.0.1', function(err, pathToTemp) {
      assert.equal(err, undefined, err);
      assert.notEqual(pathToTemp, undefined);
      assert.notEqual(pathToTemp, null);
      httpUtil.expect.getBinaryUrl.called.once('getBinaryUrl was not called the expected amount of times.');
      done();
    });
  });

  it('Should proxy package index requests to the external registry and return valid JSON', function(done) {
    var httpUtil   = deride.wrap(new HttpUtil(config));
    httpUtil.setup.getJsonUrl.toCallbackWith([
      undefined, 
      _.clone(sampleData, true)
    ]);

    var npmRegistry = new NpmRegistry(config, httpUtil, endpoint);
    npmRegistry.getModuleIndex('mkdirp', null, function(err, json) {
      assert.equal(err, undefined, err);
      assert.equal(json._id, 'mkdirp');
      httpUtil.expect.getJsonUrl.called.once('expectgetJsonUrl was not called the expected amount of times.');
      done();
    });
  });

    
  it('Should rewrite result with address of this registry', function(done) {
    var httpUtil   = deride.wrap(new HttpUtil(config));
    httpUtil.setup.getJsonUrl.toCallbackWith([
      undefined, 
      _.clone(sampleData, true)
    ]);

    var npmRegistry = new NpmRegistry(config, httpUtil, endpoint);
    npmRegistry.getModuleIndex('mkdirp', null, function(err, json) {
      assert.equal(err, undefined, err);
      assert.notEqual(json, undefined);
      httpUtil.expect.getJsonUrl.called.once('getJsonUrl was caled more than once!');
      assert(JSON.stringify(json).indexOf('registry.npmjs.org') === -1, 'registry.npmjs.org was still found in the data');
      assert(JSON.stringify(json).indexOf(config.url) > -1, config.url + ' was not found in the data');
      assert.equal(json.versions['0.0.5'].dist.tarball, config.url + '/mkdirp/-/mkdirp-0.0.5.tgz');
      done();
    });

  });


});

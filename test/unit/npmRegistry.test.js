'use strict';
var assert      = require('assert');
var NpmRegistry = require('../../lib/npmRegistry').NpmRegistry;
var HttpUtil    = require('../../lib/httpUtil').HttpUtil;
var http        = require('http');
var mockConfig  = require('../mockConfig');
var fs          = require('fs');
var deride      = require('deride');

describe('NPM Registry (npmRegistry)', function() {
  var endpoint = 'http://127.0.0.1:9615';

  var sampleData = {
    packageIndex: JSON.parse(fs.readFileSync(__dirname + '/../data/sample-requests/mkdirp'))
  };


  it('Should proxy package index requests to the external registry and return valid JSON', function(done) {
    var config      = mockConfig.getNoProxyConfig();
    var httpUtil    = deride.wrap(new HttpUtil(config, http));
    httpUtil.setup.getJsonUrl.toCallbackWith([
      undefined, 
      sampleData.packageIndex
    ]);

    var npmRegistry = new NpmRegistry(config, httpUtil, endpoint);
    npmRegistry.getModuleIndex('mkdirp', function(err, json) {
      assert.equal(err, undefined, err);
      assert.equal(json._id, 'mkdirp');
      httpUtil.expect.getJsonUrl.called.once('expectgetJsonUrl was called more than once.');
      done();
    });
  });

    
  it('Should rewrite result with address of this registry', function(done) {
    var config      = mockConfig.getNoProxyConfig();
    var httpUtil    = deride.wrap(new HttpUtil(config, http));
    httpUtil.setup.getJsonUrl.toCallbackWith([
      undefined, 
      sampleData.packageIndex
    ]);

    var npmRegistry = new NpmRegistry(config, httpUtil, endpoint);
    npmRegistry.getModuleIndex('mkdirp', function(err, json) {
      assert.equal(err, undefined, err);
      assert.notEqual(json, undefined);
      httpUtil.expect.getJsonUrl.called.once();
      assert(JSON.stringify(json).indexOf('registry.npmjs.org') === -1, 'registry.npmjs.org was still found in the data');
      assert(JSON.stringify(json).indexOf(config.url) > -1, config.url + ' was not found in the data');
      done();
    });

  });


});
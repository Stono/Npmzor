'use strict';
var deride  = require('deride');
var assert  = require('assert');
var fs      = require('fs');
var NpmRepo = require('../lib/npmRepo').NpmRepo;

describe('npmRepo', function() {

  it('Should proxy package index requests to the external repository', function() {
    var mockHttp     = deride.stub(['get']);
    var mockResponse = {
      statusCode: 200,
      body: fs.readFileSync(__dirname + '/data/sample-requests/mkdirp').toString()
    };
    mockHttp.setup.get.toReturn(mockResponse);
    var npmRepo = new NpmRepo('http://registry.npmjs.org', mockHttp);
    npmRepo.getModuleIndex('mkdirp', function(err, json){
      assert.equal(json, mockResponse.body);
    });
  });
});
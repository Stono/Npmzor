'use strict';
var http        = require('http');
var assert      = require('assert');
var NpmRepo     = require('../../lib/npmRepo').NpmRepo;
var RepoManager = require('../../lib/repoManager').RepoManager;
var HttpUtil    = require('../../lib/httpUtil').HttpUtil;

var mockConfig  = require('../mockConfig').getNoProxyConfig();

describe('Repo Manager', function() {

  it('Should accept a new Npm Repository', function(done) {
    var httpUtil    = new HttpUtil(mockConfig, http);
    var npmRepo     = new NpmRepo(httpUtil, 'http://127.0.0.1');
    var repoManager = new RepoManager(mockConfig);
    repoManager.addRepo(npmRepo);
    assert(repoManager.getRepo('http://127.0.0.1') !== undefined);
    done();
  });
  
});
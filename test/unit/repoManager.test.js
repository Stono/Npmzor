'use strict';
var http        = require('http');
var assert      = require('assert');
var NpmRepo     = require('../../lib/npmRepo').NpmRepo;
var RepoManager = require('../../lib/repoManager').RepoManager;
var HttpUtil    = require('../../lib/httpUtil').HttpUtil;

var mockConfig  = require('../mockConfig').getNoProxyConfig();

describe('Repo Manager', function() {

  var repoManager;
  var npmRepo;
  var repoRoot = 'http://127.0.0.1';

  beforeEach(function() {
    var httpUtil = new HttpUtil(mockConfig, http);
    npmRepo      = new NpmRepo(httpUtil, repoRoot);
    repoManager  = new RepoManager(mockConfig);    
  });
  
  it('Should accept a new Repository', function(done) {
    repoManager.addRepo(npmRepo, function(err) {
      assert.equal(err, null);
      repoManager.getRepo(repoRoot, function(err, repo) {
        assert.equal(err, null);
        assert.equal(repo, npmRepo);
        done();
      });      
    });
  });
  
  it('Should not accept a Repository that already exists', function(done) {
    repoManager.addRepo(npmRepo, function(err) {
      assert.equal(err, null);
      repoManager.addRepo(npmRepo, function(err) {
        assert(err !== undefined);
        done();
      });      
    });
  });
  
});
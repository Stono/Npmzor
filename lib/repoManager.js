'use strict';
/*
 * This class handles the aggregation of mutliple
 * npm repositories.  The idea is the they are added
 * in order of importance, and the first repo
 * to return a result will be returned
 */
var RepoManager = function(config) {
  var log = new require('../lib/logger').Logger(config, 'RepoManager');
  var repos = {};
  
  var addRepo = function(repo, callback) {
    if (repos[repo.getRoot()] !== undefined) {
      callback('Registry already exists!');
      return;
    }
    repos[repo.getRoot()] = repo;
    log.debug(repo.getRoot() +' has been added.');
    callback(null);
  };
  
  var getRepo = function(root, callback) {
    callback(null, repos[root]);
  };
  
  return Object.freeze({
    addRepo: addRepo,
    getRepo: getRepo
  });

};

module.exports = {
  RepoManager: RepoManager
};
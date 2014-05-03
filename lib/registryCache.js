'use strict';
/*
 * Handles the caching of NPM Registry calls
 * DB needs to be a mongodb api compatible provider
 * For example mongodb or tingodb
 */
var RegistryCache = function(db) {
  var indexCollection = db.collection('npm_registry_index');
  
  var addIndex = function(jsonContents, callback) {
    indexCollection.insert({
      _id: jsonContents._id,
      dateAdded: Date.now(),
      contents: {}
    }, {w:1}, callback);
  };
  
  var getIndex = function(name, callback) {
    indexCollection.findOne({_id: name}, callback);
  };
  
  return Object.freeze({
    addIndex: addIndex,
    getIndex: getIndex
  });

};

module.exports = {
  RegistryCache: RegistryCache
};
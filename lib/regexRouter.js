'use strict';
var RegexRouter = function() {
  var url = require('url');
  
  var routing = {
    get: [],
    post: [],
    put: [],
    'delete': []
  };
  
  var setHandler = function(method, match, target) {
    routing[method].push({
      regex: match,
      target: target
    });    
  };

  var get = function(match, target) {
    setHandler('get', match, target);
  };
  
  var put = function(match, target) {
    setHandler('put', match, target);
  };
  
  var post = function(match, target) {
    setHandler('post', match, target);
  };
  
  var del = function(match, target) {
    setHandler('delete', match, target);
  };
  
  var getPath = function(requestUrl) {
    var path = url.parse(requestUrl).path;
    return (path[0] === '/') ? path.substring(1) : path;
  };
  
  var handleMatches = function(anyMatch, currentKey, matches, req, res) {
    if (matches) {
      matches = matches.splice(1, matches.length);
      matches = [req, res].concat(matches);
      currentKey.target.apply(currentKey.target, matches);
      return true;
    }
    return anyMatch;
  };
  
  var route = function(req, res, callback) {
    var routingKeys = routing[req.method.toString().toLowerCase()];
    var anyMatch = false;
    for (var i=0; i<routingKeys.length; i++) {
      var currentKey = routingKeys[i];
      var parsedUrl  = getPath(req.url);
      var matches    = parsedUrl.match(currentKey.regex);
      anyMatch       = handleMatches(anyMatch, currentKey, matches, req, res);
    }
    callback((anyMatch) ? null : 'Failed to match any route');
  };
  
  return Object.freeze({
    get: get,
    put: put,
    post: post,
    'delete': del,
    route: route
  });
  
};

module.exports = {
  RegexRouter: RegexRouter
};
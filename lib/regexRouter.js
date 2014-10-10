'use strict';
var RegexRouter = function(config) {
  var url = require('url');
  var log      = new require('./logger').Logger(config, 'RegexRouter');
  
  var routing = {
    get: [],
    post: [],
    put: [],
    'delete': [],
    exclude: []
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
  
  var exclude = function(match) {
    routing.exclude.push({
      regex: match 
    });
  };

  var getPath = function(requestUrl) {
    var path = url.parse(requestUrl).path;
    return (path[0] === '/') ? path.substring(1) : path;
  };
  
  var handleMatches = function(anyMatch, currentKey, matches, req, res) {
    if (matches) {
      matches = matches.splice(1, matches.length);
      matches = [req, res].concat(matches);
      log.debug('Matched by: ' + currentKey.regex);
      currentKey.target.apply(currentKey.target, matches);
      return true;
    }
    return anyMatch;
  };

  var isExcluded = function(path) {
    var exclusionKeys = routing.exclude;
    for(var i=0; i<exclusionKeys.length; i++) {
      var currentKey = exclusionKeys[i];
      var matches    = path.match(currentKey.regex);
      if(matches) {
        log.debug('Excluded by: ' + currentKey.regex); 
        return true; 
      }
    }
    return false;
  };
  
  var doRouting = function(req, res, callback) {
    var parsedUrl = getPath(req.url);
    var anyMatch  = false;
    var routingKeys = routing[req.method.toString().toLowerCase()];
    for (var i=0; i<routingKeys.length; i++) {
      var currentKey = routingKeys[i];
      var matches    = parsedUrl.match(currentKey.regex);
      anyMatch       = handleMatches(anyMatch, currentKey, matches, req, res);
      if(anyMatch) {
        break;
      }
    }
    callback((anyMatch) ? null : 'Failed to match any route');
  };

  var route = function(req, res, callback) {
    var parsedUrl   = getPath(req.url);

    if(isExcluded(parsedUrl)) { 
      callback('Route was in the exclusion list');
    } else {
      doRouting(req, res, callback);
    }
  };
  
  return Object.freeze({
    get: get,
    put: put,
    post: post,
    'delete': del,
    exclude: exclude,
    route: route
  });
  
};

module.exports = {
  RegexRouter: RegexRouter
};

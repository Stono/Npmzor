'use strict';
var url = require('url');
var _   = require('lodash');

var HttpUtil = function(config, http, fsUtil) {
  var log = new require('../lib/logger').Logger(config, 'HttpUtil');
  http = http || require('http');
  fsUtil = fsUtil || new require('./fsUtil').FileUtil(config);
  
  var isPartialMatch = function(host, item, found) {
    if(item.indexOf('*') !== -1) {
      var noStars = item.replace('*', '');
      if (host.indexOf(noStars) > -1) { found = true }
    }
    return found;
  };
  
  var isExactMatch = function(host, item, found) {
    if(host === item) { found = true }
    return found;
  };
  
  var isInNoProxy = function(host) {
    var found = false;
    if(!config.http.proxy.noProxy) { return false; }
    _.forEach(config.http.proxy.noProxy.split(','), function(item) {
      found = isExactMatch(host, item, found);
      found = isPartialMatch(host, item, found);
    });
    return found;
  };
  
  /* Returns the correct opts for the remote
   * query, ie using proxy
   */
  var getHttpOpts = function(requestUrl) {
    var target  = url.parse(requestUrl);
    var isHttps = (target.protocol === 'https:');
    var opts;
    var proxyConfig = config.http.proxy[(isHttps ? 'https' : 'http')];
    
    if(proxyConfig && !isInNoProxy(target.hostname)) {
      opts = {
        method: 'GET',
        path: requestUrl,
        port: proxyConfig.port,
        hostname: proxyConfig.hostname, 
        headers: {
          Host: target.hostname,
          'User-Agent': 'NPMZor',
          Accept: '*/*',
          'Proxy-Connection': ''
        }
      };
    } else {
      opts = {
        method: 'GET', 
        path: target.path, 
        port: target.port, 
        hostname: target.hostname
      };
    }
    return opts;
  };

  var getJsonUrl = function(requestUrl, callback) {
    var opts   = getHttpOpts(requestUrl);
    log.debug('GET: ' + requestUrl);
    http.get(opts, function(res) {
      if (res.statusCode === 404) {
        callback('Remote server returned 404');
        return;
      }
      var body = '';
      res.on('data', function(chunk) {
        body += chunk;
      });
      res.on('end', function() {
        var parsedResponse = JSON.parse(body);
        callback(undefined, parsedResponse);
      });
    });
  };

  var getBinaryUrl = function(requestUrl, target, callback) {
    var opts     = getHttpOpts(requestUrl);
    log.debug('GET: ' + requestUrl);
    http.get(opts, function(res) {
      if (res.statusCode === 404) {
        callback('Remote server returned 404');
        return;
      }
      var file = fsUtil.createWriteStream(target);
      res.pipe(file);
      file.on('finish', function() {
        log.debug(requestUrl + ' saved to ' + target);
        file.close(callback);
      }).on('error', function(err) {
        fsUtil.exists(target, function() {
            fsUtil.unlink(target);
        });
        callback(err);
      });
    });
  };
  
  return Object.freeze({
    getHttpOpts: getHttpOpts,
    getJsonUrl: getJsonUrl,
    getBinaryUrl: getBinaryUrl
  });

};

module.exports = {
  HttpUtil: HttpUtil
};
'use strict';
var url = require('url');
var fs  = require('fs');

var HttpUtil = function(config, http) {
  var log = new require('../lib/logger').Logger(config, 'HttpUtil');

  /* Returns the correct opts for the remote
   * query, ie using proxy
   */
  var getHttpOpts = function(requestUrl) {
    var target  = url.parse(requestUrl);
    var isHttps = (target.protocol === 'https:');
    var opts;
    var proxyConfig = config.http.proxy[(isHttps ? 'https' : 'http')];
    if(proxyConfig) {
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
      var file = fs.createWriteStream(target);
      res.pipe(file);
      file.on('finish', function() {
        file.close(callback);
      }).on('error', function(err) {
        fs.exists(target, function() {
            fs.unlink(target);
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
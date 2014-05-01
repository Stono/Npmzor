'use strict';
var url = require('url');

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
      var body = '';
      res.on('data', function(chunk) {
        body += chunk;
      });
      res.on('end', function() {
        var parsedResponse = JSON.parse(body);
        callback(null, parsedResponse);
      });
    });
  };

  return Object.freeze({
    getHttpOpts: getHttpOpts,
    getJsonUrl: getJsonUrl
  });

};

module.exports = {
  HttpUtil: HttpUtil
};
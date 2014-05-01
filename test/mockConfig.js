'use strict';

var MockConfig = function() {
  var getNoProxyConfig = function() {
    var config = require('../config');
    config.http.proxy = {
    };
    return config;
  };

  var getHttpProxyConfig = function() {
    var config = require('../config');
    config.http.proxy = {
      http: {
        hostname: 'proxy.sdc.hp.com',
        port: 8080,
        protocol: 'http'
      }
    };
    return config;
  };

  var getHttpsProxyConfig = function() {
    var config = require('../config');
    config.http.proxy = {
      https: {
        hostname: 'proxy.sdc.hp.com',
        port: 8080,
        protocol: 'https'
      }
    };
    return config;
  };

  var getBothProxyConfig = function() {
    var config = require('../config');
    config.http.proxy = {
      http: {
        hostname: 'proxy.sdc.hp.com',
        port: 8080,
        protocol: 'http'
      },
      https: {
        hostname: 'proxy.sdc.hp.com',
        port: 8080,
        protocol: 'https'
      }
    };
    return config;
  };

  return Object.freeze({
    getNoProxyConfig: getNoProxyConfig,
    getHttpProxyConfig: getHttpProxyConfig,
    getHttpsProxyConfig: getHttpsProxyConfig,
    getBothProxyConfig: getBothProxyConfig
  });

};

module.exports = new MockConfig();
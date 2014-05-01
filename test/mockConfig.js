'use strict';
var _ = require('lodash');

var MockConfig = function() {

  var config = _.merge({}, require('../config'));
    
  var getNoProxyConfig = function() {
    config.registries = [];
    config.http.proxy = {};
    return config;
  };

  var getHttpProxyConfig = function() {
    config.registries = [];
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
    config.registries = [];
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
    config.registries = [];
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
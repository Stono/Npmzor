var _ = require('lodash');

var productionConfig = require('../production/production');
var devConfig = {
  port: 8080,
  http: {
    proxy: {
      http: {
        hostname: 'proxy.sdc.hp.com',
        port: 8080,
        protcol: 'http'
      },
      https: {
        hostname: 'proxy.sdc.hp.com',
        port: 8080,
        protocol: 'http'
      }
    }
  }
};

module.exports = _.merge({}, productionConfig, devConfig);
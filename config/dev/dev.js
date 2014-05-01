var _ = require('lodash');

var testConfig = require('../test/test');
var devConfig = {
  port: 8080,
  logging: {
    console: true,
    file: false
  },
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

module.exports = _.merge({}, testConfig, devConfig);
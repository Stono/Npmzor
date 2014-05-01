var _ = require('lodash');

var productionConfig = require('../production/production');
var devConfig = {
  http: {
    proxy: {
      address: 'proxy.sdc.hp.com',
      port: 8080
    }
  }
};

module.exports = _.merge({}, productionConfig, devConfig);
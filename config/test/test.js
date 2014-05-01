var _ = require('lodash');

var productionConfig = require('../production/production');
var testConfig = {
  port: 9615,
  logging: {
    console: true,
    file: false
  },
  http: {
    proxy: {}
  }
};

module.exports = _.merge({}, productionConfig, testConfig);
var _ = require('lodash');

var productionConfig = require('../production/production');
var testConfig = {
  port: 8080,
  url: 'http://127.0.0.1:8080',
  logging: {
    console: false,
    file: false
  }
};

module.exports = _.merge({}, productionConfig, testConfig);

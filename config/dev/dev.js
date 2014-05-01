var _ = require('lodash');

var testConfig = require('../test/test');
var devConfig = {
  port: 8080,
  logging: {
    console: false,
    file: false
  }
};

module.exports = _.merge({}, testConfig, devConfig);
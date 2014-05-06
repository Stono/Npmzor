var _ = require('lodash');

var productionConfig = require('../production/production');
var devConfig = {
  logging: {
    console: true,
    file: false
  }
};

module.exports = _.merge({}, productionConfig, devConfig);

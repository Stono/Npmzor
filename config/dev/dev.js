var _ = require('lodash');

var productionConfig = require('../production/production');
var devConfig = {
  logging: {
    console: true,
    file: false
  }
};

devConfig = _.merge({}, productionConfig, devConfig);
module.exports = devConfig;

var _ = require('lodash');

var productionConfig = require('../production/production');
var testConfig = {
  port: 8080,
  url: 'http://127.0.0.1:8080',
  temp: '/tmp/npmzor/temp',
  db: '/tmp/npmzor/db/' + (process.env.ENV || 'dev'),
  internal: {
    tgz: '/tmp/npmzor/internal'
  },
  cache: {
    // Timeout is in seconds
    tgz: '/tmp/npmzor/cache'
  },
  logging: {
    console: false,
    file: false
  }
};

module.exports = _.merge({}, productionConfig, testConfig);

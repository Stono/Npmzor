var _ = require('lodash');

var productionConfig = require('../production/production');
var localConfig = {
  port: 8080,
  url: 'http://127.0.0.1:8080',
  temp: '/tmp/npmzor/temp',
  db: '/tmp/npmzor/db/' + (process.env.ENV || 'local'),
  internal: {
    tgz: '/tmp/npmzor/internal'
  },
  cache: {
    // Timeout is in seconds
    tgz: '/tmp/npmzor/cache'
  },
  logging: {
    console: true,
    file: false
  }
};
localConfig = _.merge({}, productionConfig, localConfig);
localConfig.http.proxy = {};
module.exports = localConfig;

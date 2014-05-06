var os = require("os");
var path = require('path');

var appRoot = path.dirname(module.parent.filename).split('/config/')[0];

var productionConfig = {
  port: 80,
  url: 'http://' +  os.hostname(),
  temp: '/tmp',
  db: appRoot + '/db/' + (process.env.ENV || 'dev'),
  internal: {
    tgz: appRoot + '/internal'
  },
  cache: {
    // Timeout is in seconds
    timeout: (60 * 60),
    tgz: appRoot + '/cache'
  },
  logging: {
    console: true,
    file: true
  },
  http: {
    proxy: {}
  },
  registries: [
    'http://registry.npmjs.org'
  ]
};

var extractUrl = function(url) {
  var urlRegex = /^(.*):\/\/([a-z\-.0-9]+):?([0-9]+)?(.*)$/;
  var extract  = url.match(urlRegex);
  return {
    hostname: extract[2],
    port: extract[3],
    protocol: extract[1]
  };
};

// Now we need to detect environment proxies
if(process.env.http_proxy) {
  productionConfig.http.proxy.http = extractUrl(process.env.http_proxy);
};
if(process.env.https_proxy) {
  productionConfig.http.proxy.https = extractUrl(process.env.https_proxy);
};
if (process.env.no_proxy) {
  productionConfig.http.proxy.noProxy =  process.env.noProxy;
};
module.exports = productionConfig;

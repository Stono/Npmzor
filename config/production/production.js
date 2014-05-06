var os = require("os");
var path = require('path');

var productionConfig = {
  port: 80,
  url: 'http://' +  os.hostname(),
  temp: '/tmp/npmzor',
  db: '/var/lib/npmzor/' + (process.env.ENV || 'dev'),
  internal: {
    tgz: '/var/cache/npmzor/internal'
  },
  cache: {
    // Timeout is in seconds
    timeout: (60 * 60),
    tgz: '/var/cache/npmzor/cache'
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

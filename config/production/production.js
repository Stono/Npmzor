var os = require("os");

var productionConfig = {
  port: 80,
  logging: {
    console: false,
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
  var urlRegex = /^(.*):\/\/([a-z\-.]+):?([0-9]+)?(.*)$/;
  var extract  = process.env.http_proxy.match(urlRegex);
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

// Set the full url of this registry
productionConfig.url = 'http://' + os.hostname() + ':' + productionConfig.port;

module.exports = productionConfig;
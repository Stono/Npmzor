var ProductionConfig = {
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

module.exports = ProductionConfig;
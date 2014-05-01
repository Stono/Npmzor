var ProductionConfig = {
  port: 80,
  logging: {
    console: false,
    file: true
  },
  http: {
    proxy: {}
  }
};

module.exports = ProductionConfig;
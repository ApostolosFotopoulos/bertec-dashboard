console.log({ NODE_ENV: process.env.NODE_ENV });

switch (process.env.NODE_ENV) {
  case 'production':
    module.exports = require('./webpack.production');
    break;
  case 'development':
    module.exports = require('./webpack.development');
    break;
  default:
    module.exports = require('./webpack.development');
}
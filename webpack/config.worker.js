var _ = require('lodash');
var path = require('path');
var webpack = require('webpack');

var sharedConfig = require('./config.shared');

module.exports = _.merge(sharedConfig, {
  entry: {
    'chatkit.worker': './src/index.ts'
  },
  output: {
    library: "Chatkit",
    path: path.join(__dirname, "../dist/worker"),
    filename: "chatkit.worker.js"
  },
  resolve: {
    alias: {
      ['pusher-platform$']: path.resolve(__dirname, '../node_modules/pusher-platform/worker')
    }
  }
});

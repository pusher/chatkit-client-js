var _ = require('lodash');
var path = require('path');
var webpack = require('webpack');

var sharedConfig = require('./config.shared');

module.exports = _.merge(sharedConfig, {
  entry: {
    'chatkit': './src/index.ts'
  },
  output: {
    library: "Chatkit",
    path: path.join(__dirname, "../dist/web"),
    filename: "chatkit.js",
    libraryTarget: "umd"
  }
});

var _ = require('lodash');
var path = require('path');

var sharedConfig = require('./config.shared');

module.exports = _.merge(sharedConfig, {
  entry: {
    'chatkit': './src/index.ts'
  },
  output: {
    library: "Chatkit",
    libraryTarget:"commonjs2",
    path: path.join(__dirname, "../dist/react-native"),
    filename: "chatkit.js"
  },
  resolve: {
    alias: {
      ['pusher-platform$']: path.resolve(__dirname, '../node_modules/pusher-platform/react-native')
    }
  }
})

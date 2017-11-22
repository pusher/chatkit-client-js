var webpack = require('webpack');

module.exports = {
  entry: {
    'chatkit': './src/index.ts'
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: `ts-loader?${ JSON.stringify({ logInfoToStdOut: true }) }`,
        exclude: [/node_modules/, /dist/, /example/]
      }
    ],
  },
};

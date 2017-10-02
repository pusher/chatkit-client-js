const webpack = require('webpack');

module.exports = {
  entry: {
    'chatkit': './src/index.ts'
  },
  output: {
    filename: 'target/[name].js',
    libraryTarget: 'umd',
    library: 'Chatkit',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: `ts-loader?${ JSON.stringify({ logInfoToStdOut: true }) }`,
        exclude: [/node_modules/, /target/ ]
      }
    ],
  },
};

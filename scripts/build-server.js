'use strict';

const path = require('path');
// const rimraf = require('rimraf');
const webpack = require('webpack');
const NodemonPlugin = require('nodemon-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

const isProduction = process.env.NODE_ENV === 'production';

const config = {
  target: 'node',
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
  entry: path.resolve(__dirname, '../server/api.server.js'),
  output: {
    path: path.resolve(__dirname, '../build'),
    filename: 'server.js',
  },
  stats: 'errors-only',
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.mjs$/,
        type: 'javascript/auto',
      },
      {
        test: /\.client.(js|jsx|ts|tsx)?$/,
        use: [
          {
            loader: require.resolve('../plugin/ReactFlightWebpackLoader'),
          },
          {
            loader: 'babel-loader?cacheDirectory',
          },
        ],
        exclude: [/node_modules/],
      },
      {
        test: /\.(js|jsx|ts|tsx)?$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },

  plugins: [
    new NodemonPlugin({
      watch: path.resolve(__dirname, '../build'),
      nodeArgs: ['--conditions=react-server'],
      env: {
        NODE_ENV: 'development',
      },
    }),
  ],
};

module.exports = config;

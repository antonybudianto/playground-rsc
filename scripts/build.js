'use strict';

const path = require('path');
// const rimraf = require('rimraf');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactServerWebpackPlugin = require('react-server-dom-webpack/plugin');

const isProduction = process.env.NODE_ENV === 'production';
// rimraf.sync(path.resolve(__dirname, '../build'));

const config = {
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
  entry: [path.resolve(__dirname, '../src/index.client.js')],
  output: {
    path: path.resolve(__dirname, '../build'),
    filename: 'main.js',
  },
  stats: 'minimal',
  module: {
    rules: [
      {
        test: /\.[j|t]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-react',
                {
                  runtime: 'automatic',
                },
              ],
              '@babel/preset-env',
              '@babel/preset-typescript',
            ],
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, '../public/index.html'),
    }),
    new ReactServerWebpackPlugin({isServer: false}),
  ],
};

module.exports = config;

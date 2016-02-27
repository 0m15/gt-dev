var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: './app/index.js',

  output: {
    path: path.resolve(__dirname, "assets"),
    publicPath: "/assets/",
    filename: "app.js",
    contentBase: path.resolve(__dirname)
  },

  resolve: {
    extensions: ['', '.js']
  },

  // plugins: [
  //   new ExtractTextPlugin('app.css')
  // ],

  module: {
    loaders: [
      {
        test: /\.js$/, 
        exclude: /node_modules/, 
        loader: "babel-loader",
        query: {
          presets: ['es2015', 'react']
        }
      },
      {
        test: /\.css$/,
        loaders: ["style-loader", "css-loader"]
      },
      {
        test: /\.mp3$/,
        loaders: ["url-loader"]
      }
    ]
  }
}
var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    app: './app/index.js',
    vr: './app/vr/index.js'
  },

  output: {
    path: path.resolve(__dirname, "assets"),
    publicPath: "/assets/",
    filename: "[name].js",
    contentBase: path.resolve(__dirname)
  },

  resolve: {
    extensions: ['', '.js']
  },

  plugins: [
    //new ExtractTextPlugin('app.css')
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV||'production')
      }
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //       warnings: false
    //   }
    // })
  ],

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
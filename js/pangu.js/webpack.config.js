var path = require('path');
var TerserPlugin = require('terser-webpack-plugin');

var entryPath = './browser/pangu.js';

module.exports = {
  target: 'web',
  // mode: 'development',
  mode: 'production',
  entry: {
    'pangu': entryPath,
    'pangu.min': entryPath
  },
  output: {
    path: path.resolve(__dirname, 'dist/browser/'),
    filename: '[name].js',
    library: 'pangu',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules|node/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            presets: [
              [
                "@babel/preset-env",
                {
                  "modules": "umd"
                }
              ]
            ]
          }
        }
      }
    ]
  },
  devtool: false,
  optimization: {
    minimizer: [
      new TerserPlugin({
        include: /\.min\.js$/
      })
    ],
  }
}

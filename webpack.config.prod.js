const path = require('path')
const webpack  = require('webpack')

const webpackConfig = {
  entry: {
    app: ['babel-polyfill', path.join(__dirname, '/src/main.js') ]
  },
   output: {
    path: path.join(__dirname, 'public'),
    filename: '[name].js'
  },
  module: {
    rules:[
      {
        loader: ['babel-loader'],
        test: /\.js?$/,
        include: [path.join(__dirname, 'src')]
      },
      {
        test: /\.scss$/,
        include: [path.join(__dirname, 'src')],
        use: ['style-loader','css-loader', 'sass-loader']
      }
    ]
  },
  resolve: {
    modules: ['node_modules'],
    extensions: [ '.js']
  }
}

module.exports = webpackConfig
const webpack = require('webpack');
module.exports = {
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader'
            // options: {
            //   implementation: require("sass"), // 指定使用sass（Dart Sass）
            // },
          }
        ]
      }
    ]
  },
  configureWebpack: {
    plugins: [new webpack.ProgressPlugin()]
  }
};

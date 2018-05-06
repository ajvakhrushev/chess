const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: [
    `${__dirname}/src/scripts/index.ts`,
    `${__dirname}/src/styles/index.scss`
  ],
  output: {
    filename: 'index.js',
    path: `${__dirname}/dist`
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.s?css$/,
        use: [
          {loader: 'style-loader'},
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              ident: 'postcss',
              plugins: () => [
                require('autoprefixer')(),
              ]
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              includePaths: [`${__dirname}/src/styles`]
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: false,
      hash: true,
      template: `${__dirname}/src/index.html`,
      filename: 'index.html'
    })
  ],
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
    modules: [`${__dirname}/node_modules`, `${__dirname}/src`],
  },
  resolveLoader: {
    modules: [`${__dirname}/node_modules`]
  },
  watch: true,
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  }
};
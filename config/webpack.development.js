const { merge } = require('webpack-merge');
const webpack = require('webpack');
const common = require('./webpack.common');

module.exports = merge(common,{
  mode: 'development',

  devtool: 'source-map',

  devServer: {
    historyApiFallback: true,
    compress: true,
    hot: true,
    port: 1337
  },

  module: {
    rules: [
      {
				test: /\.css$/,
				use: [
					'vue-style-loader',
					{
						loader: 'css-loader',
						options: {
							esModule: false
						}
					}
				]
			},
			{
				test: /\.(png|j?g|svg|gif)?$/,
				use: 'file-loader'
			}
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.ProvidePlugin({
			Vue: [ 'vue/dist/vue.esm.js' ]
		})
  ],

  performance: {
    maxEntrypointSize: 312000,
    maxAssetSize: 312000
  }
})
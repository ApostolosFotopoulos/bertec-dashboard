const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const VueLoaderPlugin = require("vue-loader/lib/plugin")
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: [
    './src/main.js',
	],
	devtool: 'inline-source-map',
  output: {
		filename: '[name].js',
		path: path.resolve(__dirname, '../dist'),
		chunkFilename: '[id].[chunkhash].js'
  },
  devServer: {
    contentBase: '../dist',
  },
	module: {
    rules:[{
			test: /\.js$/,
			exclude: /(node_modules)/,
			use: {
				loader: "babel-loader"
			}
		},{
			test: /\.vue$/,
			loader: "vue-loader"
		},{
			test: /\.css$/,
			use:[
				"vue-style-loader",
				{
					loader: "css-loader",
					options: {
						esModule: false
					}
				}
			]
		},
    {
      test: /\.(png|j?g|svg|gif)?$/,
      use: 'file-loader',
    },]
	},
	plugins:[
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, '/public/index.html'),
      filename: 'index.html',
      inject: true,
      publicPath: process.env.NODE_ENV === 'production'
      ? './'
      : '/'
		}),
		new VueLoaderPlugin(),
	],
	performance: {
		hints: false,
		maxEntrypointSize: 512000,
		maxAssetSize: 512000
	}
}

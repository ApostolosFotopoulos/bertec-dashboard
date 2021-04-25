const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const webpack = require('webpack');

module.exports = {
	mode: 'development',
	entry: [ 'webpack-dev-server/client?http://0.0.0.0:8080', './src/main.js' ],
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, '../dist'),
		chunkFilename: '[id].[chunkhash].js'
	},
	devServer: {
		publicPath: '/',
		hot: true,
		contentBase: '../dist'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				use: {
					loader: 'babel-loader'
				}
			},
			{
				test: /\.vue$/,
				loader: 'vue-loader'
			},
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
	resolve: {
		symlinks: true,
		alias: {
			vue$: 'vue/dist/vue.esm.js'
		}
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, '../public/index.html'),
			filename: 'index.html',
			inject: true
		}),
		new webpack.HotModuleReplacementPlugin(),
		new VueLoaderPlugin(),
		new webpack.ProvidePlugin({
			Vue: [ 'vue/dist/vue.esm.js' ]
		})
	],
	optimization: {
		splitChunks: {
			minSize: 10000,
			maxSize: 250000
		}
	}
};

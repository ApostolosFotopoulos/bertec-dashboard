const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const VueLoaderPlugin = require("vue-loader/lib/plugin")
const webpack = require('webpack')

module.exports = {
	mode: "development",
	entry: [
    'webpack-dev-server/client?http://0.0.0.0:8080',
    './src/main.js',
  ],
	output: {
    path: path.resolve(__dirname, '../dist'),
    filename: './electron.js',
    publicPath: '/',
  },
	devServer: {
    publicPath: '/',
    hot: true,
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
				"css-loader"
			]
		},
    {
      test: /\.(png|j?g|svg|gif)?$/,
      use: 'file-loader',
    },]
	},
	plugins:[
		new VueLoaderPlugin(),
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, '/public/index.html'),
      filename: 'index.html',
      inject: true,
    }),
    new webpack.HotModuleReplacementPlugin(),
	]
}
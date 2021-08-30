const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const path = require('path');

module.exports = {

  entry: path.resolve(__dirname, '../renderer/src/main.js'),
  
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'js/bundle-[hash].js',
  },

  resolve: {
    extensions: ['.vue','.js','.ts','.tsx','.json', '.css', '.html'],
    symlinks: true,
		alias: {
			vue$: 'vue/dist/vue.esm.js'
		}
  },

  module: {
    rules: [
      {
        test: /\.vue$/,
        exclude: /node_modules/,
        loader: 'vue-loader',
      },
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [{
          loader: "ts-loader",
          options: {
            compilerOptions: {
              noEmit: false,
            },
          },
        }],
      },
    ]
  },

  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname,'../renderer/public/index.html'),
      filename: 'index.html',
      inject: true,
    })
  ],
}
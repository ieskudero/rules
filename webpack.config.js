var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
var webpack = require('webpack');

const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

var devMode = true;

module.exports = {
    entry: {
		main: './main.js', 
		css: './main.css'
	},
    devtool: 'inline-source-map',
    output: {
        path: path.resolve(__dirname, './dist'),
		filename: '[name].js',
		library: ['library', '[name]'],
    	libraryTarget: "umd",
    },
	resolve: {
		alias: {
			handlebars: 'handlebars/dist/handlebars.js'
		}
	},
    devServer: {
		contentBase: path.join(__dirname, 'dist'),		
		writeToDisk: true,
		compress: true,
		port: 9000		
    },
	module: {
		rules: [ 
			{
				test: /\.html$/,
				use: {
					loader: 'html-loader',
					options: {
						minimize: false,
						sources: true
					}
				}
			},
			{
				test: /\.css$/,
				use: [{
						loader: MiniCssExtractPlugin.loader,
						options: {}
					}, {
						loader: 'css-loader',
						options: {
							sourceMap: devMode
						}
					}
				]
			}, 
			{
				test: /\.hbs$/,
				use: [{
					loader: 'html-loader',
					options: {
						minimize: false
					}
				}]
			},
			{
				test: /\.(gif|png|jpe?g|svg)$/i,
				use: [{
						loader: 'image-webpack-loader',
						options: {
							bypassOnDebug: true, // webpack@1.x
							disable: true // webpack@2.x and newer
						}
					}, {
						loader: 'url-loader',
						options: {
							limit: 8192
						}
					}
				]
			}, {
				test: /\.(ttf|woff2)$/,
				use: [{
					loader: 'file-loader',
					options: {
						name: '[name].[ext]',
						outputPath: 'fonts/'
					}
				}]
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./main.html",
			filename: "./index.html"
		}),
		new MiniCssExtractPlugin({
			filename: "[name].css",
			chunkFilename: "[id].css"
		}),
		new webpack.DefinePlugin({
			'process.env.MEDIATOR_JS_COV': JSON.stringify('development')
		}),
		new MonacoWebpackPlugin({
			languages: ['html', 'javascript', 'css']
		})
	],
	optimization: {
		minimize: false
	},
	devtool: 'source-map'
};
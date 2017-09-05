/**
 * Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 var webpack = require('webpack');

 module.exports = {
 	entry: {
		'Main': './src/Main.js',
		'Fallback' : 'src/Fallback.js',
		'vendor' : ['aframe', 'aframe-auto-detect-controllers-component', 'aframe-look-at-component', '@ekolabs/aframe-spritesheet-component/dist/aframe-spritesheet-component']
	},
	output: {
		filename: './build/[name].js',
		chunkFilename: './build/[id].js',
		sourceMapFilename : '[file].map',
	},
	resolve: {
		modules : [/*'third_party',*/'node_modules', '../third-party/Tone.js', './node_modules/tone','src', '.', 'third_party'],
	},
	plugins: [
		new webpack.optimize.CommonsChunkPlugin({name :'vendor', filename :'./build/vendor.bundle.js'})
	],
	/*plugins: [
		new webpack.optimize.UglifyJsPlugin({
			minimize: false,
			compress: false
		})
		],*/
		module: {
			loaders: [
			{ test: /\.(glsl|vert|frag)$/, loader: 'shader-loader' },
			{
				test: /\.js$/,
				// exclude: /((node_modules\/(?![(@ekolabs\/aframe\-spritesheet\-component)|(nosleep\.js)|(webvr\-ui)]))|Tone\.js)/,
				exclude: /(node_modules|Tone\.js)/,
				loader: 'babel-loader',
				query: {
					presets: ['es2015']
				}
			},
			{
				test: /\.scss$/,
				loader: 'style-loader!css-loader!autoprefixer-loader!sass-loader'
			},
			{
				test: /\.json$/,
				loader: 'json-loader'
			},
			{
				test: /\.(png|gif|svg|woff|woff2|eot|ttf)$/,
				loader: 'url-loader',
			}
			]
		},
		// devtool: '#source-map'
	};

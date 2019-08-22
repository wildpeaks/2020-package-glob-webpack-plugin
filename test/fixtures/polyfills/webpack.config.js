/* eslint-env node */
'use strict';
const {join} = require('path');
const GlobPlugin = require('../../..');
const StatsPlugin = require('../../StatsPlugin.js');

module.exports = {
	watch: false,
	cache: false,
	mode: 'development',
	target: 'web',
	context: __dirname,
	output: {
		filename: '[name].js',
		path: join(__dirname, 'dist')
	},
	performance: {
		hints: false
	},
	plugins: [
		new GlobPlugin({
			entries: './src/node_modules/apps/*.js',
			polyfills: [
				'./src/polyfill1.js',
				'thirdparty-polyfill'
			]
		}),
		new StatsPlugin()
	]
};

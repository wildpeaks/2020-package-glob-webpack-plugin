/* eslint-env node */
'use strict';
const {join} = require('path');
const GlobEntriesPlugin = require('../../..');
const StatsPlugin = require('../../StatsPlugin.js');

module.exports = {
	watch: true,
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
		new GlobEntriesPlugin({
			entries: './src/*.js'
		}),
		new StatsPlugin()
	]
};

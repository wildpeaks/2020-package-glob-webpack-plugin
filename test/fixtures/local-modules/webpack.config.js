/* eslint-env node */
'use strict';
const {join} = require('path');
const GlobEntryPlugin = require('../../..');
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
		new GlobEntryPlugin('./src/node_modules/apps/*.js'),
		new StatsPlugin()
	]
};

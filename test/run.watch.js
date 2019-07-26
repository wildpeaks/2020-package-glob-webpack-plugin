/* eslint-env node */
'use strict';
const webpack = require('webpack');
const GlobEntryPlugin = require('..');

if (process.argv.length < 4){
	console.log('Not enough arguments');
	process.exitCode = 1;
	return;
}
const inputFolder = process.argv[2];
const outputFolder = process.argv[3];

webpack({
	mode: 'development',
	target: 'web',
	context: inputFolder,
	output: {
		filename: '[name].js',
		path: outputFolder
	},
	performance: {
		hints: false
	},
	plugins: [
		new GlobEntryPlugin('./src/*.js')
	]
})
.watch(
	{
		aggregateTimeout: 300,
		poll: 1000
	},
	(err, _stats) => {
		if (err){
			console.log('Build: Error');
		} else {
			console.log('Build: OK');
		}
	}
);

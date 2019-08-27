/* eslint-env node, mocha */
/* eslint-disable no-invalid-this */
/* eslint-disable prefer-arrow-callback */
'use strict';
const {deepStrictEqual, strictEqual} = require('assert');
const {join} = require('path');
const webpack = require('webpack');

const GlobPlugin = require('..');
const {resetSingle, TestPlugin} = require('./shared.js');


it('Single: Local Modules', function(done){
	this.slow(8000);
	this.timeout(12000);

	const folder = join(__dirname, 'fixtures/local-modules');
	resetSingle(folder);
	const testplugin = new TestPlugin();

	webpack({
		mode: 'development',
		target: 'web',
		context: folder,
		output: {
			filename: '[name].js',
			path: join(folder, 'dist')
		},
		plugins: [
			new GlobPlugin({
				entries: './src/node_modules/apps/*.js'
			}),
			testplugin
		]
	}, (_err, _stats) => {}); // eslint-disable-line no-empty-function

	setTimeout(() => {
		done();
	}, 5000);

	setTimeout(() => {
		strictEqual(testplugin.builds.length >= 1, true, `At least one build`);
		deepStrictEqual(
			testplugin.builds[0],
			{
				input: {
					'module-1': './src/node_modules/apps/module-1.js',
					'module-2': './src/node_modules/apps/module-2.js',
					'module-3': './src/node_modules/apps/module-3.js'
				},
				output: {
					'module-1': {
						chunks: ['module-1'],
						assets: ['module-1.js']
					},
					'module-2': {
						chunks: ['module-2'],
						assets: ['module-2.js']
					},
					'module-3': {
						chunks: ['module-3'],
						assets: ['module-3.js']
					}
				}
			},
			'First build'
		);
	}, 4000);
});

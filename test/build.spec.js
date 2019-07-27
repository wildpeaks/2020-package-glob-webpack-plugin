/* eslint-env node, mocha */
/* eslint-disable no-invalid-this */
/* eslint-disable prefer-arrow-callback */
'use strict';
const {join} = require('path');
const {deepStrictEqual} = require('assert');
const webpack = require('webpack');
const {createFolder, deleteFolder, getFiles} = require('./shared');
const GlobEntryPlugin = require('..');

const fixturesFolder = join(__dirname, 'fixtures');
const outputFolder = join(__dirname, '../out-build');


/**
 * @param {webpack.Configuration} config
 */
function compile(config){
	return new Promise((resolve, reject) => {
		webpack(config, (err, stats) => {
			if (err){
				reject(err);
			} else {
				resolve(stats);
			}
		});
	});
}


/**
 * @param {Object} options
 * @returns {String[]}
 */
async function testFixture(fixtureId, {plugin, target = 'web', mode = 'development'}){
	const rootFolder = join(fixturesFolder, fixtureId);
	const config = {
		mode,
		target,
		context: rootFolder,
		output: {
			filename: '[name].js',
			path: outputFolder
		},
		performance: {
			hints: false
		},
		plugins: [
			plugin
		]
	};
	const stats = await compile(config);
	deepStrictEqual(stats.compilation.errors, []);

	const actualFiles = await getFiles(outputFolder);
	return actualFiles;
}


describe('Build once', function(){
	beforeEach(async function(){
		await deleteFolder(outputFolder);
		await createFolder(outputFolder);
	});

	it('basic', async function(){
		this.slow(2000);
		const actualFiles = await testFixture('basic', {
			plugin: new GlobEntryPlugin('./src/*.js')
		});
		const expectedFiles = ['basic-1.js', 'basic-2.js', 'basic-3.js'];
		deepStrictEqual(actualFiles.sort(), expectedFiles.sort(), 'Generated files');
	});

	it('local-modules', async function(){
		this.slow(2000);
		const actualFiles = await testFixture('local-modules', {
			plugin: new GlobEntryPlugin('./src/node_modules/apps/*.js')
		});
		const expectedFiles = ['module-1.js', 'module-2.js', 'module-3.js'];
		deepStrictEqual(actualFiles.sort(), expectedFiles.sort(), 'Generated files');
	});
});

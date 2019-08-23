/* eslint-env node, mocha */
/* eslint-disable no-invalid-this */
/* eslint-disable prefer-arrow-callback */
'use strict';
const {deepStrictEqual, strictEqual} = require('assert');
const {readFileSync, renameSync, writeFileSync} = require('fs');
const {join} = require('path');
const WebpackRunner = require('./WebpackRunner.js');
const runner = new WebpackRunner('watch-renamed');


after(async function(){
	await runner.stop();
});


it('Watch: Renamed', async function(){
	this.slow(50000);
	this.timeout(90000);

	runner.resetWatch();
	runner.start();

	let throws = false;
	try {
		await runner.waitUntilBuild(1);
	} catch(e){
		throws = true;
	}
	strictEqual(throws, false, `First build runs`);
	deepStrictEqual(
		runner.builds[0],
		{
			input: {
				'initial-1': './src/initial-1.js',
				'initial-2': './src/initial-2.js'
			},
			output: {
				'initial-1': {
					chunks: ['initial-1'],
					assets: ['initial-1.js']
				},
				'initial-2': {
					chunks: ['initial-2'],
					assets: ['initial-2.js']
				}
			}
		},
		'First build output'
	);

	renameSync(
		join(runner.folder, 'src/initial-1.js'),
		join(runner.folder, 'src/renamed-1.js')
	);

	throws = false;
	if (runner.isWindows){
		try {
			await runner.waitUntilBuild(2);
		} catch(e){
			throws = true;
		}
		strictEqual(throws, true, `Renaming isn't enough to trigger a rebuild`);
		writeFileSync(
			join(runner.folder, 'src/renamed-1.js'),
			readFileSync(
				join(runner.folder, 'src/renamed-1.js'),
				'utf8'
			),
			'utf8'
		);
	}

	throws = false;
	try {
		await runner.waitUntilBuild(2);
	} catch(e){
		throws = true;
	}
	if (runner.isWindows){
		strictEqual(throws, false, `Saving unmodified contents triggers a rebuild`);
	} else {
		strictEqual(throws, false, `Second build didn't timeout`);
	}

	deepStrictEqual(
		runner.builds[1],
		{
			input: {
				'renamed-1': './src/renamed-1.js',
				'initial-2': './src/initial-2.js'
			},
			output: {
				'renamed-1': {
					chunks: ['renamed-1'],
					assets: ['renamed-1.js']
				},
				'initial-2': {
					chunks: ['initial-2'],
					assets: ['initial-2.js']
				}
			}
		},
		'Second build output'
	);
});

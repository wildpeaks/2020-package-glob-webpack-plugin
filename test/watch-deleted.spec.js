/* eslint-env node, mocha */
/* eslint-disable no-invalid-this */
/* eslint-disable prefer-arrow-callback */
'use strict';
const {deepStrictEqual, strictEqual} = require('assert');
const {readFileSync, unlinkSync, writeFileSync} = require('fs');
const {join} = require('path');
const WebpackRunner = require('./WebpackRunner.js');
const runner = new WebpackRunner('watch-deleted');


after(async function(){
	await runner.stop();
});


it('Watch: Deleted', async function(){
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

	try {
		unlinkSync(join(runner.folder, 'src/initial-1.js'));
	} catch(e){} // eslint-disable-line no-empty

	throws = false;
	if (runner.isWindows){
		try {
			await runner.waitUntilBuild(2);
		} catch(e){
			throws = true;
		}
		strictEqual(throws, true, `Deleting an entry doesn't trigger a rebuild`);

		writeFileSync(
			join(runner.folder, 'src/initial-2.js'),
			readFileSync(
				join(runner.folder, 'src/initial-2.js'),
				'utf8'
			),
			'utf8'
		);
		throws = false;
	}

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
				'initial-2': './src/initial-2.js'
			},
			output: {
				'initial-2': {
					chunks: ['initial-2'],
					assets: ['initial-2.js']
				}
			}
		},
		'Second build'
	);
});

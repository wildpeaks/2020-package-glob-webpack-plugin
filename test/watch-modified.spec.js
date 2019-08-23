/* eslint-env node, mocha */
/* eslint-disable no-invalid-this */
/* eslint-disable prefer-arrow-callback */
'use strict';
const {strictEqual, deepStrictEqual} = require('assert');
const {readFileSync, writeFileSync} = require('fs');
const {join} = require('path');
const WebpackRunner = require('./WebpackRunner.js');
const runner = new WebpackRunner('watch-modified');


after(async function(){
	await runner.stop();
});


it('Watch: Modified', async function(){
	this.slow(8000);
	this.timeout(60000);

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

	const contentsBefore = readFileSync(join(runner.folder, 'dist/initial-2.js'), 'utf8');
	strictEqual(contentsBefore.includes('MODIFIED BY SCRIPT'), false, `First build doesn't contain the modified code`);

	writeFileSync(join(runner.folder, 'src/initial-2.js'), `console.log("MODIFIED BY SCRIPT");\n`, 'utf8');

	throws = false;
	try {
		await runner.waitUntilBuild(2);
	} catch(e){
		throws = true;
	}
	strictEqual(throws, false, `Second build runs`);
	deepStrictEqual(
		runner.builds[1],
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
		'Second build output'
	);

	const contentsAfter = readFileSync(join(runner.folder, 'dist/initial-2.js'), 'utf8');
	strictEqual(contentsAfter.includes('MODIFIED BY SCRIPT'), true, 'Second build contains the modified code');
});

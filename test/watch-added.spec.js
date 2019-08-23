/* eslint-env node, mocha */
/* eslint-disable no-invalid-this */
/* eslint-disable prefer-arrow-callback */
'use strict';
const {deepStrictEqual, strictEqual} = require('assert');
const {writeFileSync} = require('fs');
const {join} = require('path');
const WebpackRunner = require('./WebpackRunner.js');
const runner = new WebpackRunner('watch-added');


after(async function(){
	await runner.stop();
});


it('Watch: Added', async function(){
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

	writeFileSync(join(runner.folder, 'src/added-3.js'), `console.log("ADDED 3");`, 'utf8');
	writeFileSync(join(runner.folder, 'src/added-4.js'), `console.log("ADDED 4");`, 'utf8');

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
				'initial-2': './src/initial-2.js',
				'added-3': './src/added-3.js',
				'added-4': './src/added-4.js'
			},
			output: {
				'initial-1': {
					chunks: ['initial-1'],
					assets: ['initial-1.js']
				},
				'initial-2': {
					chunks: ['initial-2'],
					assets: ['initial-2.js']
				},
				'added-3': {
					chunks: ['added-3'],
					assets: ['added-3.js']
				},
				'added-4': {
					chunks: ['added-4'],
					assets: ['added-4.js']
				}
			}
		},
		'Second build output'
	);
});

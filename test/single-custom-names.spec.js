/* eslint-env node, mocha */
/* eslint-disable no-invalid-this */
/* eslint-disable prefer-arrow-callback */
'use strict';
const {deepStrictEqual, strictEqual} = require('assert');
const WebpackRunner = require('./WebpackRunner.js');
const runner = new WebpackRunner('custom-names');


after(async function(){
	await runner.stop();
});


it('Single: Custom Names', async function(){
	this.slow(8000);
	this.timeout(60000);

	runner.resetSingle();
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
				'custom-basic-1': './src/basic-1.js',
				'custom-basic-2': './src/basic-2.js',
				'custom-basic-3': './src/basic-3.js'
			},
			output: {
				'custom-basic-1': {
					chunks: ['custom-basic-1'],
					assets: ['custom-basic-1.js']
				},
				'custom-basic-2': {
					chunks: ['custom-basic-2'],
					assets: ['custom-basic-2.js']
				},
				'custom-basic-3': {
					chunks: ['custom-basic-3'],
					assets: ['custom-basic-3.js']
				}
			}
		},
		'First build output'
	);
});

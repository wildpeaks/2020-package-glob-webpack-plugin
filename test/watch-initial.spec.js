/* eslint-env node, mocha */
/* eslint-disable no-invalid-this */
/* eslint-disable prefer-arrow-callback */
'use strict';
const {deepStrictEqual, strictEqual} = require('assert');
const WebpackRunner = require('./WebpackRunner.js');
const runner = new WebpackRunner('watch-initial');


after(async function(){
	await runner.stop();
});


it('Watch: Initial', async function(){
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
});

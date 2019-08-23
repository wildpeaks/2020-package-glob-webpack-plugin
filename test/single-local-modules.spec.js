/* eslint-env node, mocha */
/* eslint-disable no-invalid-this */
/* eslint-disable prefer-arrow-callback */
'use strict';
const {deepStrictEqual, strictEqual} = require('assert');
const WebpackRunner = require('./WebpackRunner.js');
const runner = new WebpackRunner('local-modules');


after(async function(){
	await runner.stop();
});


it('Single: Local Modules', async function(){
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
		'First build output'
	);
});

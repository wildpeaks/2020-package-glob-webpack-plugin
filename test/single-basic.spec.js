/* eslint-env node, mocha */
/* eslint-disable no-invalid-this */
/* eslint-disable prefer-arrow-callback */
'use strict';
const {deepStrictEqual, strictEqual} = require('assert');
const WebpackRunner = require('./WebpackRunner.js');
const runner = new WebpackRunner('basic');


after(async function(){
	await runner.stop();
});


it('Single: Basic', async function(){
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
				'basic-1': './src/basic-1.js',
				'basic-2': './src/basic-2.js',
				'basic-3': './src/basic-3.js'
			},
			output: {
				'basic-1': {
					chunks: ['basic-1'],
					assets: ['basic-1.js']
				},
				'basic-2': {
					chunks: ['basic-2'],
					assets: ['basic-2.js']
				},
				'basic-3': {
					chunks: ['basic-3'],
					assets: ['basic-3.js']
				}
			}
		},
		'First build output'
	);
});


/*

	it('Deleted entries', async function(){
		this.slow(8000);
		this.timeout(60000);

		startWebpack('watch');

		await waitUntilBuild(1);
		deepStrictEqual(
			builds[0],
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
			'First build'
		);

		try {
			unlinkSync(join(fixtureSrcFolder, 'initial-1.js'));
		} catch(e){}

		let throws = false;
		if (isWindows){
			try {
				await waitUntilBuild(2);
			} catch(e){
				throws = true;
			}
			strictEqual(throws, true, `Deleting an entry doesn't trigger a rebuild`);

			writeFileSync(
				join(fixtureSrcFolder, 'initial-2.js'),
				readFileSync(
					join(fixtureSrcFolder, 'initial-2.js'),
					'utf8'
				),
				'utf8'
			);
			throws = false;
		}

		try {
			await waitUntilBuild(2);
		} catch(e){
			throws = true;
		}
		if (isWindows){
			strictEqual(throws, false, `Saving unmodified contents triggers a rebuild`);
		} else {
			strictEqual(throws, false, `Second build didn't timeout`);
		}

		deepStrictEqual(
			builds[1],
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
*/

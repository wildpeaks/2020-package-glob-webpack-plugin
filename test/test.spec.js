/* eslint-env node, mocha */
/* eslint-disable no-invalid-this */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-empty */
'use strict';
const {strictEqual, deepStrictEqual} = require('assert');
const {spawn} = require('child_process');
const {mkdirSync, renameSync, unlinkSync, readFileSync, writeFileSync} = require('fs');
const {join} = require('path');
const rimraf = require('rimraf');
const isWindows = process.platform.includes('win');


let builds = [];
let watchServer;
let running = false;

function startWebpack(fixtureId){
	builds = [];
	let input = [];
	let output = {};
	watchServer = spawn(
		'node',
		[
			'node_modules/webpack-cli/bin/cli.js',
			'--config', `test/fixtures/${fixtureId}/webpack.config.js`,
			'--info-verbosity', 'verbose'
		],
		{cwd: process.cwd()}
	);
	watchServer.stdout.on('data', data => {
		// console.log('[stdout]', data.toString());
		const text = data.toString();
		if (text.startsWith('[INPUT]')){
			try {
				input = JSON.parse(text.substring(8));
			} catch(e){
				input = 'Failed to parse JSON';
			}
		}
		if (text.startsWith('[OUTPUT]')){
			try {
				output = JSON.parse(text.substring(9));
			} catch(e){
				output = 'Failed to parse JSON';
			}
		}
		if (text.startsWith('[DONE]')){
			builds.push({input, output});
			input = [];
			output = {};
		}
	});

	running = true;
	watchServer.on('exit', () => {
		running = false;
	});
}


function waitUntilBuild(minimumValue = 1, timeout = 15000){
	return new Promise((resolve, reject) => {
		let cancelled = false;
		const cancellable = setTimeout(() => {
			cancelled = true;
		}, timeout);
		(function checkLater(){
			if (cancelled){
				reject('Timeout');
			} else if (builds.length >= minimumValue){
				clearTimeout(cancellable);
				resolve();
			} else {
				setTimeout(checkLater, 100);
			}
		})();
	});
}


function waitUntilStopped(){
	return new Promise(resolve => {
		(function checkLater(){
			if (watchServer && running){
				setTimeout(checkLater, 100);
			} else {
				resolve();
			}
		})();
	});
}


describe('Single Build', function(){
	afterEach('Stop Webpack', async function(){
		if (watchServer && running){
			watchServer.kill();
			await waitUntilStopped();
		}
	});

	it('Basic', async function(){
		this.slow(8000);
		this.timeout(60000);

		const fixtureFolder = join(__dirname, 'fixtures/basic');
		const fixtureDistFolder = join(fixtureFolder, 'dist');
		try {
			rimraf.sync(fixtureDistFolder, {glob: false, emfileWait: true});
		} catch(e){}

		startWebpack('basic');
		await waitUntilBuild(1);
		deepStrictEqual(
			builds[0],
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
			'First build'
		);
	});

	it('Local Modules', async function(){
		this.slow(8000);
		this.timeout(60000);

		const fixtureFolder = join(__dirname, 'fixtures/local-modules');
		const fixtureDistFolder = join(fixtureFolder, 'dist');
		try {
			rimraf.sync(fixtureDistFolder, {glob: false, emfileWait: true});
		} catch(e){}

		startWebpack('local-modules');
		await waitUntilBuild(1);
		deepStrictEqual(
			builds[0],
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
	});

	it('Custom Names', async function(){
		this.slow(8000);
		this.timeout(60000);

		const fixtureFolder = join(__dirname, 'fixtures/custom-names');
		const fixtureDistFolder = join(fixtureFolder, 'dist');
		try {
			rimraf.sync(fixtureDistFolder, {glob: false, emfileWait: true});
		} catch(e){}

		startWebpack('custom-names');
		await waitUntilBuild(1);
		deepStrictEqual(
			builds[0],
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
			'First build'
		);
	});

	it('Polyfills', async function(){
		this.slow(8000);
		this.timeout(60000);

		const fixtureFolder = join(__dirname, 'fixtures/polyfills');
		const fixtureDistFolder = join(fixtureFolder, 'dist');
		try {
			rimraf.sync(fixtureDistFolder, {glob: false, emfileWait: true});
		} catch(e){}

		startWebpack('polyfills');
		await waitUntilBuild(1);

		deepStrictEqual(
			builds[0],
			{
				input: {
					'module-1': [
						'./src/polyfill1.js',
						'thirdparty-polyfill',
						'./src/node_modules/apps/module-1.js'
					],
					'module-2': [
						'./src/polyfill1.js',
						'thirdparty-polyfill',
						'./src/node_modules/apps/module-2.js'
					],
					'module-3': [
						'./src/polyfill1.js',
						'thirdparty-polyfill',
						'./src/node_modules/apps/module-3.js'
					]
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
	});
});


describe('Watch mode', function(){
	const fixtureRootFolder = join(__dirname, 'fixtures/watch');
	const fixtureSrcFolder = join(__dirname, 'fixtures/watch/src');
	const fixtureDistFolder = join(__dirname, 'fixtures/watch/dist');

	beforeEach('Reset the fixture', () => {
		try {
			rimraf.sync(fixtureRootFolder, {glob: false, emfileWait: true});
		} catch(e){}

		mkdirSync(fixtureRootFolder);
		writeFileSync(
			join(fixtureRootFolder, 'webpack.config.js'),
			`'use strict';
			const {join} = require('path');
			const GlobEntriesPlugin = require('../../..');
			const StatsPlugin = require('../../StatsPlugin.js');

			module.exports = {
				watch: true,
				cache: false,
				mode: 'development',
				target: 'web',
				context: __dirname,
				output: {
					filename: '[name].js',
					path: join(__dirname, 'dist')
				},
				performance: {
					hints: false
				},
				plugins: [
					new GlobEntriesPlugin({
						entries: './src/*.js'
					}),
					new StatsPlugin()
				]
			};`,
			'utf8'
		);

		mkdirSync(fixtureSrcFolder);
		writeFileSync(join(fixtureSrcFolder, 'initial-1.js'), `'use strict';\nconsole.log('INITIAL 1');\n`, 'utf8');
		writeFileSync(join(fixtureSrcFolder, 'initial-2.js'), `'use strict';\nconsole.log('INITIAL 2');\n`, 'utf8');
	});

	afterEach('Stop Webpack', async function(){
		if (watchServer){
			watchServer.kill();
			// await waitUntilKilled();
			await waitUntilStopped();
		}
	});


	it('Initial entries', async function(){
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
	});


	it('Modified entries', async function(){
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

		const contentsBefore = readFileSync(join(fixtureDistFolder, 'initial-2.js'), 'utf8');
		strictEqual(contentsBefore.includes('MODIFIED BY SCRIPT'), false, `First build doesn't contain the modified code`);

		writeFileSync(join(fixtureSrcFolder, 'initial-2.js'), `console.log("MODIFIED BY SCRIPT");\n`, 'utf8');

		await waitUntilBuild(2);
		deepStrictEqual(
			builds[1],
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
			'Second build'
		);

		const contentsAfter = readFileSync(join(fixtureDistFolder, 'initial-2.js'), 'utf8');
		strictEqual(contentsAfter.includes('MODIFIED BY SCRIPT'), true, 'Second build contains the modified code');
	});


	it('Added entries', async function(){
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

		writeFileSync(join(fixtureSrcFolder, 'added-3.js'), `console.log("ADDED 3");`, 'utf8');
		writeFileSync(join(fixtureSrcFolder, 'added-4.js'), `console.log("ADDED 4");`, 'utf8');

		await waitUntilBuild(2);
		deepStrictEqual(
			builds[1],
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
			'Second build'
		);
	});


	it('Renamed entries', async function(){
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

		renameSync(
			join(fixtureSrcFolder, 'initial-1.js'),
			join(fixtureSrcFolder, 'renamed-1.js')
		);

		let throws = false;
		if (isWindows){
			try {
				await waitUntilBuild(2);
			} catch(e){
				throws = true;
			}
			strictEqual(throws, true, `Renaming isn't enough to trigger a rebuild`);
			writeFileSync(
				join(fixtureSrcFolder, 'renamed-1.js'),
				readFileSync(
					join(fixtureSrcFolder, 'renamed-1.js'),
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
			'Second build'
		);
	});


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
});

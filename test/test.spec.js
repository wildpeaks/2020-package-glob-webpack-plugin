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

function startWebpack(fixtureId){
	builds = [];
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
		if (text.startsWith('[EMIT]')){
			try {
				const stats = JSON.parse(text.substring(7));
				builds.push(stats);
			} catch(e){
				builds.push({});
			}
		}
	});
	// watchServer.stderr.on('data', data => {
	// 	console.log('[stderr]', data.toString());
	// });
}

function waitUntilBuild(minimumValue = 1, timeout = 2000){
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

function waitUntilClosed(){
	return new Promise(resolve => {
		(function checkLater(){
			if (watchServer && !watchServer.killed){
				setTimeout(checkLater, 100);
			} else {
				resolve();
			}
		})();
	});
}


describe('Single Build', function(){
	it('Basic', async function(){
		this.slow(8000);
		this.timeout(15000);

		const fixtureFolder = join(__dirname, 'fixtures/basic');
		const fixtureDistFolder = join(fixtureFolder, 'dist');
		try {
			rimraf.sync(fixtureDistFolder, {glob: false, emfileWait: true});
		} catch(e){}

		startWebpack('basic');
		await waitUntilBuild(1, 5000);
		deepStrictEqual(
			builds[0],
			{
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
			},
			'First build'
		);
	});

	it('Local Modules', async function(){
		this.slow(8000);
		this.timeout(15000);

		const fixtureFolder = join(__dirname, 'fixtures/local-modules');
		const fixtureDistFolder = join(fixtureFolder, 'dist');
		try {
			rimraf.sync(fixtureDistFolder, {glob: false, emfileWait: true});
		} catch(e){}

		startWebpack('local-modules');
		await waitUntilBuild(1, 5000);
		deepStrictEqual(
			builds[0],
			{
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
			},
			'First build'
		);
	});

	it('Custom Names', async function(){
		this.slow(8000);
		this.timeout(15000);

		const fixtureFolder = join(__dirname, 'fixtures/custom-names');
		const fixtureDistFolder = join(fixtureFolder, 'dist');
		try {
			rimraf.sync(fixtureDistFolder, {glob: false, emfileWait: true});
		} catch(e){}

		startWebpack('custom-names');
		await waitUntilBuild(1, 5000);
		deepStrictEqual(
			builds[0],
			{
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
			const GlobEntryPlugin = require('../../..');
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
					new GlobEntryPlugin('./src/*.js'),
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
			await waitUntilClosed();
		}
	});


	it('Initial entries', async function(){
		this.slow(5000);
		this.timeout(10000);

		startWebpack('watch');
		await waitUntilBuild(1, 5000);
		deepStrictEqual(
			builds[0],
			{
				'initial-1': {
					chunks: ['initial-1'],
					assets: ['initial-1.js']
				},
				'initial-2': {
					chunks: ['initial-2'],
					assets: ['initial-2.js']
				}
			},
			'First build'
		);
	});


	it('Modified entries', async function(){
		this.slow(8000);
		this.timeout(10000);

		startWebpack('watch');
		await waitUntilBuild(1, 5000);
		deepStrictEqual(
			builds[0],
			{
				'initial-1': {
					chunks: ['initial-1'],
					assets: ['initial-1.js']
				},
				'initial-2': {
					chunks: ['initial-2'],
					assets: ['initial-2.js']
				}
			},
			'First build'
		);

		const contentsBefore = readFileSync(join(fixtureDistFolder, 'initial-2.js'), 'utf8');
		strictEqual(contentsBefore.includes('MODIFIED BY SCRIPT'), false, `First build doesn't contain the modified code`);

		writeFileSync(join(fixtureSrcFolder, 'initial-2.js'), `console.log("MODIFIED BY SCRIPT");\n`, 'utf8');

		await waitUntilBuild(2, 2000);
		deepStrictEqual(
			builds[1],
			{
				'initial-1': {
					chunks: ['initial-1'],
					assets: ['initial-1.js']
				},
				'initial-2': {
					chunks: ['initial-2'],
					assets: ['initial-2.js']
				}
			},
			'Second build'
		);

		const contentsAfter = readFileSync(join(fixtureDistFolder, 'initial-2.js'), 'utf8');
		strictEqual(contentsAfter.includes('MODIFIED BY SCRIPT'), true, 'Second build contains the modified code');
	});


	it('Added entries', async function(){
		this.slow(8000);
		this.timeout(15000);

		startWebpack('watch');
		await waitUntilBuild(1, 5000);
		deepStrictEqual(
			builds[0],
			{
				'initial-1': {
					chunks: ['initial-1'],
					assets: ['initial-1.js']
				},
				'initial-2': {
					chunks: ['initial-2'],
					assets: ['initial-2.js']
				}
			},
			'First build'
		);

		writeFileSync(join(fixtureSrcFolder, 'added-3.js'), `console.log("ADDED 3");`, 'utf8');
		writeFileSync(join(fixtureSrcFolder, 'added-4.js'), `console.log("ADDED 4");`, 'utf8');

		await waitUntilBuild(2, 2000);
		deepStrictEqual(
			builds[1],
			{
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
			},
			'Second build'
		);
	});


	it('Renamed entries', async function(){
		this.slow(10000);
		this.timeout(15000);

		startWebpack('watch');
		await waitUntilBuild(1, 5000);
		deepStrictEqual(
			builds[0],
			{
				'initial-1': {
					chunks: ['initial-1'],
					assets: ['initial-1.js']
				},
				'initial-2': {
					chunks: ['initial-2'],
					assets: ['initial-2.js']
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
				await waitUntilBuild(2, 2000);
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
		}

		throws = false;
		try {
			await waitUntilBuild(2, 2000);
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
				'renamed-1': {
					chunks: ['renamed-1'],
					assets: ['renamed-1.js']
				},
				'initial-2': {
					chunks: ['initial-2'],
					assets: ['initial-2.js']
				}
			},
			'Second build'
		);
	});


	it('Deleted entries', async function(){
		this.slow(10000);
		this.timeout(15000);

		startWebpack('watch');
		await waitUntilBuild(1, 5000);
		deepStrictEqual(
			builds[0],
			{
				'initial-1': {
					chunks: ['initial-1'],
					assets: ['initial-1.js']
				},
				'initial-2': {
					chunks: ['initial-2'],
					assets: ['initial-2.js']
				}
			},
			'First build'
		);

		try {
			unlinkSync(join(fixtureSrcFolder, 'initial-1.js'));
		} catch(e){}

		let throws = false;
		try {
			await waitUntilBuild(2, 2000);
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
		try {
			await waitUntilBuild(2, 2000);
		} catch(e){
			throws = true;
		}
		strictEqual(throws, false, `Saving unmodified contents triggers a rebuild`);

		deepStrictEqual(
			builds[1],
			{
				'initial-2': {
					chunks: ['initial-2'],
					assets: ['initial-2.js']
				}
			},
			'Second build'
		);
	});
});

/* eslint-env node, mocha */
/* eslint-disable no-invalid-this */
/* eslint-disable prefer-arrow-callback */
'use strict';
const {join} = require('path');
const {spawn} = require('child_process');
const {strictEqual, deepStrictEqual} = require('assert');
const {sleep, createFolder, deleteFolder, readFromFile, writeToFile, getFiles, getFilesContents} = require('./shared');
const inputFolder = join(__dirname, 'fixtures/watch');
const outputFolder = join(__dirname, '../out-watch');

let child;
function startWebpack(){
	child = spawn('node', [join(__dirname, 'run.watch.js'), inputFolder, outputFolder], {cwd: process.cwd()});
	// child.stdout.on('data', data => {
	// 	console.log('[stdout]', data.toString());
	// });
	// child.stderr.on('data', data => {
	// 	console.log('[stderr]', data.toString());
	// });
	// child.on('close', code => {
	// 	console.log(`Webpack closed with code ${code}`);
	// });
}
function stopWebpack(){
	if (child){
		child.kill('SIGINT');
		child = false;
	}
}

describe('Watch mode', function(){
	beforeEach('Start Webpack', async function(){
		this.slow(8000);
		this.timeout(10000);

		await deleteFolder(inputFolder);
		await deleteFolder(outputFolder);
		await createFolder(join(inputFolder, 'src'));
		await createFolder(outputFolder);
		deepStrictEqual(await getFiles(inputFolder), [], 'No input files');
		deepStrictEqual(await getFiles(outputFolder), [], 'No output files');

		await Promise.all([
			writeToFile(join(inputFolder, 'src/initial1.js'), `console.log("initial1 BEFORE");`),
			writeToFile(join(inputFolder, 'src/initial2.js'), `console.log("initial2 BEFORE");`)
		]);
		deepStrictEqual(
			await getFilesContents(inputFolder),
			{
				'src/initial1.js': `console.log("initial1 BEFORE");`,
				'src/initial2.js': `console.log("initial2 BEFORE");`
			},
			'Input'
		);

		startWebpack();
		await sleep(5000);
		deepStrictEqual(await getFiles(outputFolder), ['initial1.js', 'initial2.js'], 'Output');
	});

	afterEach('Stop Webpack', async function(){
		this.slow(3000);
		this.timeout(4000);
		stopWebpack();
		await sleep(2000);
	});


	it('Modified entries', async function(){
		this.slow(2000);
		this.timeout(3000);
		await writeToFile(join(inputFolder, 'src/initial1.js'), `console.log("initial1 AFTER");`);
		deepStrictEqual(
			await getFilesContents(inputFolder),
			{
				'src/initial1.js': `console.log("initial1 AFTER");`,
				'src/initial2.js': `console.log("initial2 BEFORE");`
			},
			'Input'
		);
		await sleep(1000);
		deepStrictEqual(await getFiles(outputFolder), ['initial1.js', 'initial2.js'], 'Output files');

		const contents = await readFromFile(join(outputFolder, 'initial1.js'));
		strictEqual(contents.includes('initial1 AFTER'), true, 'Output contains the modified code');
	});


	it('Added entries', async function(){
		this.slow(2000);
		this.timeout(3000);

		await Promise.all([
			writeToFile(join(inputFolder, 'src/added1.js'), `console.log("ADDED 1");`),
			writeToFile(join(inputFolder, 'src/added2.js'), `console.log("ADDED 2");`)
		]);
		deepStrictEqual(
			await getFilesContents(inputFolder),
			{
				'src/initial1.js': `console.log("initial1 BEFORE");`,
				'src/initial2.js': `console.log("initial2 BEFORE");`,
				'src/added1.js': `console.log("ADDED 1");`,
				'src/added2.js': `console.log("ADDED 2");`
			},
			'Input'
		);

		await sleep(1000);
		deepStrictEqual(await getFiles(outputFolder), ['added1.js', 'added2.js', 'initial1.js', 'initial2.js'], 'Output');
	});

});

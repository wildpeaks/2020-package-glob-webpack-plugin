/* eslint-env node */
'use strict';
const {copyFileSync, mkdirSync} = require('fs');
const {join} = require('path');
const {spawn} = require('child_process');
const rimraf = require('rimraf');


class WebpackRunner {
	constructor(fixtureId){
		this.fixtureId = fixtureId;
		this.builds = [];
		this.running = false;
		this.watchServer = false;
		this.isWindows = process.platform.includes('win');
		this.folder = join(__dirname, `fixtures/${fixtureId}`);
	}

	start(){
		let input = [];
		let output = {};
		this.builds = [];

		this.watchServer = spawn(
			'node',
			[
				'node_modules/webpack-cli/bin/cli.js',
				'--config', `test/fixtures/${this.fixtureId}/webpack.config.js`,
				'--info-verbosity', 'verbose'
			],
			{cwd: process.cwd()}
		);
		this.running = true;

		this.watchServer.on('exit', () => {
			this.running = false;
		});
		this.watchServer.stdout.on('data', data => {
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
				this.builds.push({input, output});
				input = [];
				output = {};
			}
		});
	}

	async stop(){
		if (this.watchServer && this.running){
			this.watchServer.kill();
			await this.waitUntilStopped();
			this.watchServer = false;
		}
	}

	waitUntilBuild(minimumValue = 1, timeout = 15000){
		const self = this;
		return new Promise((resolve, reject) => {
			let cancelled = false;
			const cancellable = setTimeout(() => {
				cancelled = true;
			}, timeout);
			(function checkLater(){
				if (cancelled){
					reject('Timeout');
				} else if (self.builds.length >= minimumValue){
					clearTimeout(cancellable);
					resolve();
				} else {
					setTimeout(checkLater, 100);
				}
			})();
		});
	}

	waitUntilStopped(){
		const self = this;
		return new Promise(resolve => {
			(function checkLater(){
				if (self.watchServer && self.running){
					setTimeout(checkLater, 100);
				} else {
					resolve();
				}
			})();
		});
	}

	resetSingle(){
		try {
			rimraf.sync(
				join(__dirname, `fixtures/${this.fixtureId}/dist`),
				{glob: false, emfileWait: true}
			);
		} catch(e){} // eslint-disable-line no-empty
	}

	resetWatch(){
		const folderSource = join(__dirname, `fixtures/watch`);
		const folderDest = this.folder;
		try {
			rimraf.sync(folderDest, {glob: false, emfileWait: true});
		} catch(e){} // eslint-disable-line no-empty
		mkdirSync(folderDest);
		mkdirSync(join(folderDest, 'src'));

		copyFileSync(
			join(folderSource, 'webpack.config.js'),
			join(folderDest, 'webpack.config.js')
		);
		copyFileSync(
			join(folderSource, 'src/initial-1.js'),
			join(folderDest, 'src/initial-1.js')
		);
		copyFileSync(
			join(folderSource, 'src/initial-2.js'),
			join(folderDest, 'src/initial-2.js')
		);
	}
}

module.exports = WebpackRunner;

/* eslint-env node */
'use strict';
const {copyFileSync, mkdirSync} = require('fs');
const {join} = require('path');
const rimraf = require('rimraf');


function resetSingle(folder){
	try {
		rimraf.sync(
			join(folder, 'dist'),
			{glob: false, emfileWait: true}
		);
	} catch(e){} // eslint-disable-line no-empty
}


function resetWatch(folder){
	const folderSource = join(__dirname, `fixtures/watch`);
	try {
		rimraf.sync(folder, {glob: false, emfileWait: true});
	} catch(e){} // eslint-disable-line no-empty
	mkdirSync(folder);
	mkdirSync(join(folder, 'src'));

	copyFileSync(
		join(folderSource, 'src/initial-1.js'),
		join(folder, 'src/initial-1.js')
	);
	copyFileSync(
		join(folderSource, 'src/initial-2.js'),
		join(folder, 'src/initial-2.js')
	);
}


class TestPlugin {
	constructor(callback){
		this.builds = [];
		this.callback = callback;
	}

	apply(compiler){ // eslint-disable-line class-methods-use-this
		let input = {};

		compiler.hooks.afterEmit.tap('wildpeaks-tests', compilation => {
			const {entries} = compilation;
			for (const entry of entries){

				let request;
				if (entry.dependencies.length > 1){
					request = entry.dependencies.map(dep => dep.request);
				} else {
					request = entry.rawRequest;
				}

				let name;
				if ('name' in entry){
					name = entry.name; // eslint-disable-line prefer-destructuring
				} else {
					name = entry._chunks.values().next().value.name; // eslint-disable-line prefer-destructuring
				}

				input[name] = request;
			}
		});

		compiler.hooks.done.tap('wildpeaks-tests', raw => {
			const output = {};
			try {
				const stats = raw.toJson();
				for (const entryId in stats.entrypoints){
					const stat = stats.entrypoints[entryId];
					output[entryId] = {
						chunks: stat.chunks,
						assets: stat.assets.sort()
					};
				}
			} catch(e){} // eslint-disable-line no-empty

			const index = this.builds.length;
			this.builds.push({input, output});
			input = {};
			if (this.callback){
				this.callback(index);
			}
		});

	}
}


module.exports.resetSingle = resetSingle;
module.exports.resetWatch = resetWatch;
module.exports.TestPlugin = TestPlugin;

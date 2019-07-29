'use strict';
const {basename, extname, join} = require('path');
const fg = require('fast-glob');
const globParent = require('glob-parent');
const PLUGIN_ID = 'wildpeaks-glob-plugin';


class Plugin {

	constructor(pattern = './src/*.js', mapFunction){
		if (typeof pattern !== 'string'){
			throw new Error('The glob pattern should be a string');
		}
		this.pattern = pattern;

		if ((typeof mapFunction !== 'undefined') && (typeof mapFunction !== 'function')){
			throw new Error('The entry mapping function should be a function or remain undefined');
		}
		if (typeof mapFunction === 'function'){
			this.mapFunction = mapFunction;
		} else {
			this.mapFunction = filepath => basename(filepath, extname(filepath));
		}
	}

	apply(compiler){
		compiler.options.entry = () => {
			const entries = {};
			fg
			.sync([this.pattern], {dot: false, followSymbolicLinks: true, cwd: compiler.context})
			.forEach(filepath => {
				const name = this.mapFunction(filepath);
				entries[name] = filepath;
			});
			return entries;
		};

		compiler.hooks.afterCompile.tap(PLUGIN_ID, compilation => {
			compilation.contextDependencies.add(
				join(compiler.context, globParent(this.pattern))
			);
		});
	}

}


module.exports = Plugin;

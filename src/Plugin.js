'use strict';
const {basename, extname, normalize} = require('path');
const fg = require('fast-glob');
const globParent = require('glob-parent');
const PLUGIN_ID = 'wildpeaks-glob-plugin';


class Plugin {

	constructor(pattern = './src/*.js', mapFunction){
		this.pattern = pattern;
		if (typeof mapFunction === 'function'){
			this.mapFunction = mapFunction;
		} else {
			this.mapFunction = filepath => [
				basename(filepath, extname(filepath)),
				filepath
			];
		}
		this.mapFunction = mapFunction;
	}

	apply(compiler){
		compiler.options.entry = () => Object.fromEntries(
			fg
			.sync([this.pattern], {dot: false, followSymbolicLinks: true})
			.sort()
			.map(this.mapFunction)
		);
		compiler.hooks.afterCompile.tap(PLUGIN_ID, compilation => {
			const globBase = globParent(this.pattern);
			compilation.contextDependencies.add(
				normalize(globBase)
			);
		});
	}

}


module.exports = Plugin;

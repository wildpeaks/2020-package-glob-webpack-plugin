"use strict";
const {basename, extname, join} = require("path");
const fg = require("fast-glob");
const globParent = require("glob-parent");
const PLUGIN_ID = "wildpeaks-glob-plugin";

class Plugin {
	constructor(options) {
		if (typeof options !== "object") {
			throw new Error("The options should be an Object");
		}
		let {entries, entriesMap, polyfills} = options;

		if (typeof entries === "undefined") {
			entries = "./src/*.js";
		}
		if (typeof entries !== "string") {
			throw new Error('Property "entries" should be a string');
		}
		this.entries = entries;

		if (typeof entriesMap === "undefined") {
			entriesMap = filepath => basename(filepath, extname(filepath));
		}
		if (typeof entriesMap !== "function") {
			throw new Error('Property "entriesMap" should be a function');
		}
		this.entriesMap = entriesMap;

		if (typeof polyfills === "undefined") {
			polyfills = [];
		}
		if (!Array.isArray(polyfills)) {
			throw new Error('Property "polyfills" should be an array');
		}
		this.polyfills = polyfills;
	}

	apply(compiler) {
		compiler.options.entry = () => {
			const {entries, entriesMap, polyfills} = this;
			const hasPolyfills = polyfills.length > 0;
			const generated = {};
			fg.sync([entries], {dot: false, followSymbolicLinks: true, cwd: compiler.context}).forEach(filepath => {
				const name = entriesMap(filepath);
				if (typeof name === "string" && name !== "") {
					generated[name] = hasPolyfills ? polyfills.concat([filepath]) : filepath;
				}
			});
			return generated;
		};

		compiler.hooks.afterCompile.tap(PLUGIN_ID, compilation => {
			compilation.contextDependencies.add(join(compiler.context, globParent(this.entries)));
		});
	}
}

module.exports = Plugin;

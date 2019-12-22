/* eslint-env node, mocha */
/* eslint-disable no-invalid-this */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {deepStrictEqual, strictEqual} = require("assert");
const {readFileSync, renameSync, writeFileSync} = require("fs");
const {join} = require("path");
const webpack = require("webpack");

const GlobPlugin = require("..");
const {resetWatch, TestPlugin} = require("./shared.js");

it("Watch: Renamed", function(done) {
	this.slow(10000);
	this.timeout(20000);

	const folder = join(__dirname, "fixtures/watch-renamed");
	resetWatch(folder);

	const testplugin = new TestPlugin(index => {
		if (index === 0) {
			renameSync(join(folder, "src/initial-1.js"), join(folder, "src/renamed-1.js"));
			if (process.platform.includes("win")) {
				// on Windows, renaming a file isn't enough to trigger a rebuild
				const filepath = join(folder, "src/initial-2.js");
				writeFileSync(filepath, readFileSync(filepath, "utf8"), "utf8");
			}
		}
	});

	const compiler = webpack({
		mode: "development",
		target: "web",
		context: folder,
		watchOptions: {
			aggregateTimeout: 800
		},
		output: {
			filename: "[name].js",
			path: join(folder, "dist")
		},
		plugins: [
			new GlobPlugin({
				entries: "./src/*.js"
			}),
			testplugin
		]
	});

	// eslint-disable-next-line no-empty-function
	const watching = compiler.watch({aggregateTimeout: 300}, (_err, _stats) => {});
	setTimeout(() => {
		watching.close();
		done();
	}, 5000);

	setTimeout(() => {
		strictEqual(testplugin.builds.length >= 2, true, `At least two builds`);
		deepStrictEqual(
			testplugin.builds[0],
			{
				input: {
					"initial-1": "./src/initial-1.js",
					"initial-2": "./src/initial-2.js"
				},
				output: {
					"initial-1": {
						chunks: ["initial-1"],
						assets: ["initial-1.js"]
					},
					"initial-2": {
						chunks: ["initial-2"],
						assets: ["initial-2.js"]
					}
				}
			},
			"First build"
		);
		deepStrictEqual(
			testplugin.builds[testplugin.builds.length - 1],
			{
				input: {
					"renamed-1": "./src/renamed-1.js",
					"initial-2": "./src/initial-2.js"
				},
				output: {
					"renamed-1": {
						chunks: ["renamed-1"],
						assets: ["renamed-1.js"]
					},
					"initial-2": {
						chunks: ["initial-2"],
						assets: ["initial-2.js"]
					}
				}
			},
			"Last build"
		);
	}, 4000);
});

/* eslint-env node, mocha */
/* eslint-disable no-invalid-this */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {deepStrictEqual, strictEqual} = require("assert");
const {writeFileSync} = require("fs");
const {join} = require("path");
const webpack = require("webpack");

const GlobPlugin = require("..");
const {resetWatch, TestPlugin} = require("./shared.js");

it("Watch: Added", function (done) {
	this.slow(20000);
	this.timeout(20000);

	const folder = join(__dirname, "fixtures/watch-added");
	resetWatch(folder);

	const testplugin = new TestPlugin((index) => {
		if (index === 0) {
			writeFileSync(join(folder, "src/added-3.js"), `console.log("ADDED 3");`, "utf8");
			writeFileSync(join(folder, "src/added-4.js"), `console.log("ADDED 4");`, "utf8");
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
					"initial-1": "./src/initial-1.js",
					"initial-2": "./src/initial-2.js",
					"added-3": "./src/added-3.js",
					"added-4": "./src/added-4.js"
				},
				output: {
					"initial-1": {
						chunks: ["initial-1"],
						assets: ["initial-1.js"]
					},
					"initial-2": {
						chunks: ["initial-2"],
						assets: ["initial-2.js"]
					},
					"added-3": {
						chunks: ["added-3"],
						assets: ["added-3.js"]
					},
					"added-4": {
						chunks: ["added-4"],
						assets: ["added-4.js"]
					}
				}
			},
			"Last build"
		);
	}, 4000);
});

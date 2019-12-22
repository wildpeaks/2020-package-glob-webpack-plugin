/* eslint-env node, mocha */
/* eslint-disable no-invalid-this */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {deepStrictEqual, strictEqual} = require("assert");
const {join} = require("path");
const webpack = require("webpack");

const GlobPlugin = require("..");
const {resetWatch, TestPlugin} = require("./shared.js");

it("Watch: Initial", function(done) {
	this.slow(10000);
	this.timeout(20000);

	const folder = join(__dirname, "fixtures/watch-initial");
	resetWatch(folder);

	const testplugin = new TestPlugin();

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
		strictEqual(testplugin.builds.length >= 1, true, `At least one build`);
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
	}, 4000);
});

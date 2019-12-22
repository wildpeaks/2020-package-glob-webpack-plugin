/* eslint-env node, mocha */
/* eslint-disable no-invalid-this */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {deepStrictEqual, strictEqual} = require("assert");
const {basename, join} = require("path");
const webpack = require("webpack");

const GlobPlugin = require("..");
const {resetSingle, TestPlugin} = require("./shared.js");

it("Single: Custom Names", function(done) {
	this.slow(8000);
	this.timeout(12000);

	const folder = join(__dirname, "fixtures/custom-names");
	resetSingle(folder);
	const testplugin = new TestPlugin();

	webpack(
		{
			mode: "development",
			target: "web",
			context: folder,
			output: {
				filename: "[name].js",
				path: join(folder, "dist")
			},
			plugins: [
				new GlobPlugin({
					entries: "./src/*.js",
					entriesMap: filepath => "custom-" + basename(filepath, ".js")
				}),
				testplugin
			]
		},
		// eslint-disable-next-line no-empty-function
		(_err, _stats) => {}
	);

	setTimeout(() => {
		done();
	}, 5000);

	setTimeout(() => {
		strictEqual(testplugin.builds.length >= 1, true, `At least one build`);
		deepStrictEqual(
			testplugin.builds[0],
			{
				input: {
					"custom-basic-1": "./src/basic-1.js",
					"custom-basic-2": "./src/basic-2.js",
					"custom-basic-3": "./src/basic-3.js"
				},
				output: {
					"custom-basic-1": {
						chunks: ["custom-basic-1"],
						assets: ["custom-basic-1.js"]
					},
					"custom-basic-2": {
						chunks: ["custom-basic-2"],
						assets: ["custom-basic-2.js"]
					},
					"custom-basic-3": {
						chunks: ["custom-basic-3"],
						assets: ["custom-basic-3.js"]
					}
				}
			},
			"First build"
		);
	}, 4000);
});

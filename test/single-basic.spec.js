/* eslint-env node, mocha */
/* eslint-disable no-invalid-this */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {deepStrictEqual, strictEqual} = require("assert");
const {join} = require("path");
const webpack = require("webpack");

const GlobPlugin = require("..");
const {resetSingle, TestPlugin} = require("./shared.js");

it("Single: Basic", function(done) {
	this.slow(15000);
	this.timeout(15000);

	const folder = join(__dirname, "fixtures/basic");
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
					entries: "./src/*.js"
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
					"basic-1": "./src/basic-1.js",
					"basic-2": "./src/basic-2.js",
					"basic-3": "./src/basic-3.js"
				},
				output: {
					"basic-1": {
						chunks: ["basic-1"],
						assets: ["basic-1.js"]
					},
					"basic-2": {
						chunks: ["basic-2"],
						assets: ["basic-2.js"]
					},
					"basic-3": {
						chunks: ["basic-3"],
						assets: ["basic-3.js"]
					}
				}
			},
			"First build"
		);
	}, 4000);
});

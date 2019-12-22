/* eslint-env node, mocha */
/* eslint-disable no-invalid-this */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {deepStrictEqual, strictEqual} = require("assert");
const {join} = require("path");
const webpack = require("webpack");

const GlobPlugin = require("..");
const {resetSingle, TestPlugin} = require("./shared.js");

it("Single: Polyfills", function(done) {
	this.slow(15000);
	this.timeout(15000);

	const folder = join(__dirname, "fixtures/polyfills");
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
					entries: "./src/apps/*.js",
					polyfills: ["./src/polyfill1.js", "thirdparty-polyfill"]
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
					"module-1": ["./src/polyfill1.js", "thirdparty-polyfill", "./src/apps/module-1.js"],
					"module-2": ["./src/polyfill1.js", "thirdparty-polyfill", "./src/apps/module-2.js"],
					"module-3": ["./src/polyfill1.js", "thirdparty-polyfill", "./src/apps/module-3.js"]
				},
				output: {
					"module-1": {
						chunks: ["module-1"],
						assets: ["module-1.js"]
					},
					"module-2": {
						chunks: ["module-2"],
						assets: ["module-2.js"]
					},
					"module-3": {
						chunks: ["module-3"],
						assets: ["module-3.js"]
					}
				}
			},
			"First build"
		);
	}, 4000);
});

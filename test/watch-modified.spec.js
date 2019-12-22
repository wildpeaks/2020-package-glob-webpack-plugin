/* eslint-env node, mocha */
/* eslint-disable no-invalid-this */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {deepStrictEqual, strictEqual} = require("assert");
const {readFileSync, writeFileSync} = require("fs");
const {join} = require("path");
const webpack = require("webpack");

const GlobPlugin = require("..");
const {resetWatch, TestPlugin} = require("./shared.js");

it("Watch: Modified", function(done) {
	this.slow(10000);
	this.timeout(20000);

	const folder = join(__dirname, "fixtures/watch-modified");
	resetWatch(folder);

	let outputBefore = "";
	const testplugin = new TestPlugin(index => {
		if (index === 0) {
			outputBefore = readFileSync(join(folder, "dist/initial-2.js"), "utf8");
			writeFileSync(join(folder, "src/initial-2.js"), `console.log("MODIFIED BY SCRIPT");\n`, "utf8");
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
			"Last build"
		);

		const outputAfter = readFileSync(join(folder, "dist/initial-2.js"), "utf8");
		strictEqual(
			outputBefore.includes("MODIFIED BY SCRIPT"),
			false,
			`First build doesn't contain the modified code`
		);
		strictEqual(outputAfter.includes("MODIFIED BY SCRIPT"), true, `Last build contains the modified code`);
	}, 4000);
});

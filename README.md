# Glob Webpack Plugin

Webpack 4.x plugin to define `entry` using a **glob**.

It also **updates the list of entries in --watch mode**, without having to restart Webpack.


## Quickstart

Install:

	npm install @wildpeaks/glob-webpack-plugin

Then use it in your `webpack.config.js`:

````js
const GlobPlugin = require('@wildpeaks/glob-webpack-plugin');

module.exports = {
  target: 'web',
  plugins: [
    new GlobPlugin('./src/*.js')
  ]
};
````


## Entry identifiers

By default, it uses the filename as Entry ID.

So, for example, `./src/app1.js` would produce this entry:
````json
{
  "app1": "./src/app1.js"
}
````

You can provide a function to choose how the name is calculated:
it must return an array with two strings: the ID and its matching filepath.

````js
const {basename} = require('path');
const GlobPlugin = require('@wildpeaks/glob-webpack-plugin');

module.exports = {
	target: 'web',
	plugins: [
		new GlobPlugin('./src/*.js', filepath => {
			const entryId = 'bundle-' + basename(filepath, '.js');
			return [entryId, filepath];
		})
	]
};
````

In this example, `./src/app1.js` would produce this entry:
````json
{
  "bundle-app1": "./src/app1.js"
}
````


## Known limitations

Webpack doesn't trigger updating the list of entry when a file is merely renamed,
but renaming + saving does.

Also, it currently overwrites `entry` (because it's meant to replace),
so if you need multiple globs, your webpack.config.js can export an array of Webpack configs,
each with its own glob.


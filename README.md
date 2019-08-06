# Glob Webpack Plugin

[![Greenkeeper badge](https://badges.greenkeeper.io/wildpeaks/package-glob-webpack-plugin.svg)](https://greenkeeper.io/)

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

By default, it uses the filename as Entry Name.

So, for example, `./src/app1.js` would produce this entry:
````json
{
  "app1": "./src/app1.js"
}
````

You can provide a function to provide a custom name:

````js
const {basename} = require('path');
const GlobPlugin = require('@wildpeaks/glob-webpack-plugin');

module.exports = {
	target: 'web',
	plugins: [
		new GlobPlugin(
			'./src/*.js',
			filepath => 'bundle-' + basename(filepath, '.js')
		)
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

It currently overwrites `entry` (because it's meant to replace),
so if you need multiple globs, your webpack.config.js can export an array of Webpack configs,
each with its own glob.

On Windows, merely renaming or deleting an entry doesn't trigger a rebuild, but creating or updating files do.

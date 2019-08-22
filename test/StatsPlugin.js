/* eslint-env node */
'use strict';

class StatsPlugin {
	apply(compiler){ // eslint-disable-line class-methods-use-this

		compiler.hooks.afterEmit.tap('wildpeaks-tests', compilation => {
			const results = {};
			const {entries} = compilation;
			for (const entry of entries){

				let request;
				if (entry.dependencies.length > 1){
					request = entry.dependencies.map(dep => dep.request);
				} else {
					request = entry.rawRequest;
				}

				let name;
				if ('name' in entry){
					name = entry.name; // eslint-disable-line prefer-destructuring
				} else {
					name = entry._chunks.values().next().value.name; // eslint-disable-line prefer-destructuring
				}

				results[name] = request;
			}
			console.log('[INPUT] ' + JSON.stringify(results));
		});

		compiler.hooks.done.tap('wildpeaks-tests', raw => {
			const build = {};
			try {
				const stats = raw.toJson();
				for (const entryId in stats.entrypoints){
					const stat = stats.entrypoints[entryId];
					build[entryId] = {
						chunks: stat.chunks,
						assets: stat.assets.sort()
					};
				}
			} catch(e){} // eslint-disable-line no-empty
			console.log('[OUTPUT] ' + JSON.stringify(build));
			console.log('[DONE]');
		});

	}
}

module.exports = StatsPlugin;

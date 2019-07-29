/* eslint-env node */
'use strict';

class StatsPlugin {
	apply(compiler){ // eslint-disable-line class-methods-use-this
		compiler.hooks.done.tap('wildpeaks-tests-done', raw => {
			const build = {};
			const stats = raw.toJson();
			for (const entryId in stats.entrypoints){
				const stat = stats.entrypoints[entryId];
				build[entryId] = {
					chunks: stat.chunks,
					assets: stat.assets.sort()
				};
			}
			console.log('[EMIT] ' + JSON.stringify(build));
		});
	}
}

module.exports = StatsPlugin;

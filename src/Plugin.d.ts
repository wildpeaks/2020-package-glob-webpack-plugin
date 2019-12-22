/* eslint-disable */
declare module "@wildpeaks/glob-webpack-plugin" {
	type EntryMapCallback = (filepath: string) => string;

	type Options = {
		/** Glob pattern (e.g. `'./src/*.js'`) */
		entries: string;

		/** Function to calculate the Entry Name matching a given filepath */
		entriesMap?: EntryMapCallback;

		/** Modules prepended to every entrypoint */
		polyfills?: string[];
	};

	class Plugin {
		private entries: string;
		private entriesMap: EntryMapCallback;
		private polyfills: string[];

		constructor(options: Options);
		public apply(compiler: any): void;
	}

	export = Plugin;
}

declare module "@wildpeaks/glob-webpack-plugin" {
	type EntryMapCallback = (filepath: string) => string;

	class Plugin {
		private pattern: string;
		private mapFunction: EntryMapCallback;

		/**
		 * @param pattern Glob pattern (e.g. `'./src/*.js'`)
		 * @param mapFunction Function to calculate the Entry Name matching a given filepath
		 */
		constructor(pattern: string, mapFunction: EntryMapCallback);

		public apply(compiler: any): void;
	}

	export = Plugin;
}

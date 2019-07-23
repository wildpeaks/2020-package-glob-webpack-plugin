declare module "@wildpeaks/glob-webpack-plugin" {
	type EntryMapCallback = (filepath: string) => [string, string];

	class Plugin {
		private pattern: string;
		private mapFunction: EntryMapCallback;

		/**
		 * @param pattern Glob pattern (e.g. `'./src/*.js'`)
		 * @param mapFunction Function to convert a filepath to a tuple `[ EntryId, EntryPath ]`
		 */
		constructor(pattern: string, mapFunction: EntryMapCallback);

		public apply(compiler: any): void;
	}

	export = Plugin;
}

declare module 'array.prototype.some' {
	function some<T>(
		arr: T[],
		callbackfn: (value: T, index?: number, array?: T[]) => boolean,
		thisArg?: unknown,
	): boolean;

	export = some;
}

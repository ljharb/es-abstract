declare module 'array.prototype.filter' {
	function filter<T, U extends T>(
		arr: T[],
		callbackfn: (value: T, index?: number, array?: T[]) => value is U,
		thisArg?: unknown,
	): U[];

	export = filter;
}

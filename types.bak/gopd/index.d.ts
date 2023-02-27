declare module 'gopd' {
	function gOPD<T extends string | symbol, U = unknown>(o: Record<T, U>, k: T): PropertyDescriptor;
	export = gOPD;
}
'use strict';

/** @type {<T>(arr: T[], fn: (acc: unknown, item: T | undefined, i: import('../types').integer) => unknown, init: unknown) => ReturnType<fn>} */
module.exports = function reduce(arr, fn, init) {
	var acc = init;
	for (var i = 0; i < arr.length; i += 1) {
		acc = fn(acc, arr[i], i);
	}
	return acc;
};

'use strict';

/** @type {<T>(array: T[], predicate: (item: T, i: import('../types').integer, array: T[]) => boolean) => boolean} */
module.exports = function every(array, predicate) {
	for (var i = 0; i < array.length; i += 1) {
		if (!predicate(array[i], i, array)) {
			return false;
		}
	}
	return true;
};

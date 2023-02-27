'use strict';

/** @type {<T>(array: T[], callback: (x: T, i: number, array: T[]) => void) => void} */
module.exports = function forEach(array, callback) {
	for (var i = 0; i < array.length; i += 1) {
		callback(array[i], i, array); // eslint-disable-line callback-return
	}
};

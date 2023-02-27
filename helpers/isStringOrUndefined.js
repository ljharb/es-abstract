'use strict';

/** @type {(item: unknown) => item is string | undefined} */
module.exports = function isStringOrUndefined(item) {
	return typeof item === 'string' || typeof item === 'undefined';
};

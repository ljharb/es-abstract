'use strict';

/** @type {(argument: unknown) => argument is string | symbol} */
module.exports = function isPropertyKey(argument) {
	return typeof argument === 'string' || typeof argument === 'symbol';
};

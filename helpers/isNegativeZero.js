'use strict';

// TODO, semver-major: remove

/** @type {(x: unknown) => x is -0} */
module.exports = function isNegativeZero(x) {
	return x === 0 && 1 / x === 1 / -0;
};

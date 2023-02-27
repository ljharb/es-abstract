'use strict';

var GetIntrinsic = require('get-intrinsic');

var hasOwn = require('hasown');

var $assign = GetIntrinsic('%Object.assign%', true);

/** @type {<T extends Record<string | symbol, unknown>, S extends {}>(target: T, source: S) => T} */
module.exports = function assign(target, source) {
	if ($assign) {
		return $assign(target, source);
	}

	// eslint-disable-next-line no-restricted-syntax
	for (var key in source) {
		if (hasOwn(source, key)) {
			// eslint-disable-next-line no-param-reassign
			target[key] = source[key];
		}
	}
	return target;
};

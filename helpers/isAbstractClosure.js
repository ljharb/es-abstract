'use strict';

var functionName = require('function.prototype.name');

var anon = functionName(function () {});

/** @type {(x: unknown) => x is import('../types').Func} */
module.exports = function isAbstractClosure(x) {
	return typeof x === 'function'
		&& (
			!x.prototype
			// eslint-disable-next-line no-extra-parens
			|| functionName(/** @type {import('../types').Func} */ (x)) === anon
		);
};

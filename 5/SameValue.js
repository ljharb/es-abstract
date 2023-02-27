'use strict';

var $isNaN = require('math-intrinsics/isNaN');

// http://262.ecma-international.org/5.1/#sec-9.12

/** @type {(x: unknown, y: unknown) => boolean} */
module.exports = function SameValue(x, y) {
	if (x === y) { // 0 === -0, but they are not identical.
		// @ts-expect-error https://github.com/microsoft/TypeScript/issues/53072
		if (x === 0) { return 1 / x === 1 / y; }
		return true;
	}
	return $isNaN(x) && $isNaN(y);
};

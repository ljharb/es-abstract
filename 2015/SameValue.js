'use strict';

var GetIntrinsic = require('get-intrinsic');
var $isNaN = require('math-intrinsics/isNaN');

// http://262.ecma-international.org/5.1/#sec-9.12

module.exports = GetIntrinsic('%Object.is%', true) || function SameValue(x, y) {
	if (x === y) { // 0 === -0, but they are not identical.
		if (x === 0) { return 1 / x === 1 / y; }
		return true;
	}
	return $isNaN(x) && $isNaN(y);
};

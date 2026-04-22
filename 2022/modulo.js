'use strict';

var mod = require('../helpers/mod');

// https://262.ecma-international.org/11.0/#eqn-modulo

module.exports = function modulo(x, y) {
	if (typeof x === 'bigint') {
		if (typeof y !== 'bigint') {
			throw new TypeError('`x` and `y` must both be BigInts or both be Numbers');
		}
		var r = x % y;
		if (r === BigInt(0)) { return r; }
		return (r < BigInt(0)) === (y < BigInt(0)) ? r : r + y;
	}
	return mod(x, y);
};

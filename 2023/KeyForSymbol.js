'use strict';

var $TypeError = require('es-errors/type');

var callBound = require('call-bound');

// eslint-disable-next-line no-extra-parens
var $keyFor = /** @type {typeof Symbol.keyFor} */ (callBound('Symbol.keyFor', true));

// https://262.ecma-international.org/14.0/#sec-keyforsymbol

/** @type {(sym: symbol) => string | undefined} */
module.exports = function KeyForSymbol(sym) {
	if (typeof sym !== 'symbol') {
		throw new $TypeError('Assertion failed: `sym` must be a Symbol');
	}
	return $keyFor(sym);
};

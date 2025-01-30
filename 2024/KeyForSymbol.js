// @ts-nocheck

'use strict';

var $TypeError = require('es-errors/type');

var callBound = require('call-bound');

var $keyFor = /** @type {typeof Symbol.keyFor | undefined} */ (callBound('Symbol.keyFor', true));

// https://262.ecma-international.org/14.0/#sec-keyforsymbol

/** @type {(sym: symbol) => string | undefined} */
module.exports = function KeyForSymbol(sym) {
	if (typeof sym !== 'symbol') {
		throw new $TypeError('Assertion failed: `sym` must be a Symbol');
	}
	return /** @type {NonNullable<typeof $keyFor>} */ ($keyFor)(sym);
};

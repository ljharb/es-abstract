'use strict';

var $TypeError = require('es-errors/type');

var callBound = require('call-bound');

// eslint-disable-next-line no-extra-parens
var $SymbolToString = /** @type {((receiver: symbol | Symbol) => string)} */ (callBound('Symbol.prototype.toString', true));

// https://262.ecma-international.org/6.0/#sec-symboldescriptivestring

/** @type {(sym: symbol | Symbol) => string} */
module.exports = function SymbolDescriptiveString(sym) {
	if (typeof sym !== 'symbol') {
		throw new $TypeError('Assertion failed: `sym` must be a Symbol');
	}
	return $SymbolToString(sym);
};

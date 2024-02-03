'use strict';

var $TypeError = require('es-errors/type');

var callBound = require('call-bind/callBound');

var $SymbolToString = callBound('Symbol.prototype.toString', true);

var Type = require('./Type');

// https://262.ecma-international.org/6.0/#sec-symboldescriptivestring

module.exports = function SymbolDescriptiveString(sym) {
	if (Type(sym) !== 'Symbol') {
		throw new $TypeError('Assertion failed: `sym` must be a Symbol');
	}
	return $SymbolToString(sym);
};

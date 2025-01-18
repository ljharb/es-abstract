'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'KeyForSymbol'>} */
module.exports = function (t, year, KeyForSymbol, extras) {
	t.ok(year >= 2023, 'ES2023+');

	var SymbolDescriptiveString = extras.getAO('SymbolDescriptiveString');

	forEach(v.nonSymbolPrimitives, function (nonSymbol) {
		t['throws'](
			// @ts-expect-error
			function () { KeyForSymbol(nonSymbol); },
			TypeError,
			debug(nonSymbol) + ' is not a Symbol'
		);
	});

	forEach(v.registeredSymbols, function (symbol) {
		t.equal(
			KeyForSymbol(symbol),
			SymbolDescriptiveString(symbol).slice(7, -1),
			debug(symbol) + ' yields expected key'
		);
	});

	forEach(v.unregisteredSymbols, function (symbol) {
		t.equal(
			KeyForSymbol(symbol),
			undefined,
			debug(symbol) + ' yields expected key'
		);
	});
};

'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'CanBeHeldWeakly'>} */
module.exports = function (t, year, CanBeHeldWeakly) {
	t.ok(year >= 2023, 'ES2023+');

	forEach(v.nonSymbolPrimitives, function (nonSymbolPrimitive) {
		t.equal(CanBeHeldWeakly(nonSymbolPrimitive), false, debug(nonSymbolPrimitive) + ' cannot be held weakly');
	});

	forEach(v.objects, function (object) {
		t.equal(
			CanBeHeldWeakly(object),
			true,
			debug(object) + ' can be held weakly'
		);
	});

	forEach(v.unregisteredSymbols, function (symbol) {
		t.equal(
			CanBeHeldWeakly(symbol),
			true,
			debug(symbol) + ' can be held weakly'
		);
	});

	forEach(v.registeredSymbols, function (symbol) {
		t.equal(
			CanBeHeldWeakly(symbol),
			false,
			debug(symbol) + ' can not be held weakly'
		);
	});
};

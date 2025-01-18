'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'ThisSymbolValue' | 'thisSymbolValue'>} */
module.exports = function (t, year, ThisSymbolValue) {
	t.ok(year >= 2018, 'ES2018+');

	forEach(esV.allButSyms, function (nonSymbol) {
		t['throws'](
			// @ts-expect-error
			function () { ThisSymbolValue(nonSymbol); },
			v.hasSymbols ? TypeError : SyntaxError,
			debug(nonSymbol) + ' is not a Symbol'
		);
	});

	t.test('no native Symbols', { skip: v.hasSymbols }, function (st) {
		forEach(esV.unknowns, function (value) {
			st['throws'](
				// @ts-expect-error
				function () { ThisSymbolValue(value); },
				SyntaxError,
				'Symbols are not supported'
			);
		});
		st.end();
	});

	t.test('symbol values', { skip: !v.hasSymbols }, function (st) {
		forEach(v.symbols, function (symbol) {
			st.equal(ThisSymbolValue(symbol), symbol, 'Symbol value of ' + debug(symbol) + ' is same symbol');

			st.equal(
				ThisSymbolValue(Object(symbol)),
				symbol,
				'Symbol value of ' + debug(Object(symbol)) + ' is ' + debug(symbol)
			);
		});

		st.end();
	});
};

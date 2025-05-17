'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, SymbolDescriptiveString) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(esV.allButSyms, function (nonSymbol) {
		t['throws'](
			function () { SymbolDescriptiveString(nonSymbol); },
			TypeError,
			debug(nonSymbol) + ' is not a Symbol'
		);
	});

	t.test('Symbols', { skip: !v.hasSymbols }, function (st) {
		st.equal(SymbolDescriptiveString(Symbol()), 'Symbol()', 'undefined description');
		st.equal(SymbolDescriptiveString(Symbol('')), 'Symbol()', 'empty string description');
		st.equal(SymbolDescriptiveString(Symbol.iterator), 'Symbol(Symbol.iterator)', 'well-known symbol');
		st.equal(SymbolDescriptiveString(Symbol('foo')), 'Symbol(foo)', 'string description');

		st.end();
	});
};

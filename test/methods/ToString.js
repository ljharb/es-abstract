'use strict';

var debug = require('object-inspect');
var forEach = require('for-each');
var v = require('es-value-fixtures');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'ToString'>} */
module.exports = function (t, year, ToString) {
	t.ok(year >= 5, 'ES5+');

	forEach(esV.allButSyms, function (item) {
		t.equal(ToString(item), String(item), 'ToString(' + debug(item) + ') ToStrings to String(' + debug(item) + ')');
	});

	t['throws'](function () { return ToString(v.uncoercibleObject); }, TypeError, 'uncoercibleObject throws');

	if (year >= 2015) {
		forEach(v.symbols, function (symbol) {
			t['throws'](
				function () { return ToString(symbol); },
				TypeError,
				debug(symbol) + ' throws'
			);
		});
	}
};

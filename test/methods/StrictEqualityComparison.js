'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'Strict Equality Comparison'>} */
module.exports = function (t, year, StrictEqualityComparison) {
	t.ok(year >= 5 && year <= 2021, 'ES5 - ES2021');

	t.test('same types use ===', function (st) {
		forEach(esV.unknowns, function (value) {
			st.equal(StrictEqualityComparison(value, value), value === value, debug(value) + ' is strictly equal to itself');
		});
		st.end();
	});

	t.test('different types are not ===', function (st) {
		var pairs = /** @type {const} */ ([
			[null, undefined],
			[3, '3'],
			[true, '3'],
			[true, 3],
			[false, 0],
			[false, '0'],
			[3, [3]],
			['3', [3]],
			[true, [1]],
			[false, [0]],
			[String(v.coercibleObject), v.coercibleObject],
			[Number(String(v.coercibleObject)), v.coercibleObject],
			[Number(v.coercibleObject), v.coercibleObject],
			[String(Number(v.coercibleObject)), v.coercibleObject]
		]);
		forEach(pairs, function (pair) {
			var a = pair[0];
			var b = pair[1];
			st.equal(StrictEqualityComparison(a, b), a === b, debug(a) + ' === ' + debug(b));
			st.equal(StrictEqualityComparison(b, a), b === a, debug(b) + ' === ' + debug(a));
		});
		st.end();
	});
};

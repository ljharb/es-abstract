'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, IsLooselyEqual) {
	t.ok(year >= 2022, 'ES2022+');

	t.test('same types use ===', function (st) {
		forEach(esV.unknowns, function (value) {
			st.equal(IsLooselyEqual(value, value), value === value, debug(value) + ' is abstractly equal to itself');
		});
		st.end();
	});

	t.test('different types coerce', function (st) {
		var pairs = [
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
		].concat(esV.hasBigInts ? [
			[BigInt(0), 0],
			[0, BigInt(0)],
			[BigInt(1), 1],
			[1, BigInt(1)],
			[BigInt(0), '0'],
			['0', BigInt(0)],
			[BigInt(1), '1'],
			['1', BigInt(1)],
			[BigInt(0), Infinity],
			[Infinity, BigInt(0)],
			[BigInt(0), 'Infinity'],
			['Infinity', BigInt(0)]
		] : []);
		forEach(pairs, function (pair) {
			var a = pair[0];
			var b = pair[1];
			// eslint-disable-next-line eqeqeq
			st.equal(IsLooselyEqual(a, b), a == b, debug(a) + ' == ' + debug(b));
			// eslint-disable-next-line eqeqeq
			st.equal(IsLooselyEqual(b, a), b == a, debug(b) + ' == ' + debug(a));
		});
		st.end();
	});
};

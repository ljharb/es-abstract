'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../../helpers/v');

module.exports = function (t, year, BigIntUnaryMinus) {
	t.ok(year >= 2020, 'ES2020+');

	t.test('BigInt supported', { skip: !esV.hasBigInts }, function (st) {
		forEach(v.nonBigInts, function (nonBigInt) {
			st['throws'](
				function () { BigIntUnaryMinus(nonBigInt); },
				TypeError,
				debug(nonBigInt) + ' is not a BigInt'
			);
		});

		st.test('actual BigInts', { skip: !esV.hasBigInts }, function (s2t) {
			forEach(v.bigints, function (bigint) {
				s2t.equal(BigIntUnaryMinus(bigint), -bigint, debug(bigint) + ' produces -' + debug(bigint));
			});
			s2t.end();
		});

		st.end();
	});

	t.test('BigInt not supported', { skip: esV.hasBigInts }, function (st) {
		st['throws'](
			function () { BigIntUnaryMinus(); },
			SyntaxError,
			'throws a SyntaxError when BigInt is not available'
		);

		st.end();
	});
};

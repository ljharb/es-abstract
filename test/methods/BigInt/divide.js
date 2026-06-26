'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var mockProperty = require('mock-property');

var esV = require('../../helpers/v');

var rerequire = require('../../helpers/rerequire');

module.exports = function (t, year, BigIntDivide) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.nonBigInts, function (nonBigInt) {
		t['throws'](
			function () { BigIntDivide(nonBigInt, nonBigInt); },
			TypeError,
			debug(nonBigInt) + ' is not a BigInt'
		);
	});

	t.test('BigInt supported', { skip: !esV.hasBigInts }, function (st) {
		forEach(v.nonBigInts, function (nonBigInt) {
			st['throws'](
				function () { BigIntDivide(nonBigInt, BigInt(0)); },
				TypeError,
				'x: ' + debug(nonBigInt) + ' is not a BigInt'
			);
			st['throws'](
				function () { BigIntDivide(BigInt(0), nonBigInt); },
				TypeError,
				'y: ' + debug(nonBigInt) + ' is not a BigInt'
			);
		});

		st['throws'](
			function () { BigIntDivide(BigInt(1), BigInt(0)); },
			RangeError,
			'dividing by zero throws'
		);

		forEach(v.bigints, function (bigint) {
			if (bigint !== BigInt(0)) {
				st.equal(BigIntDivide(bigint, bigint), BigInt(1), debug(bigint) + ' divided by itself is 1n');
				st.equal(BigIntDivide(bigint, BigInt(2)), bigint / BigInt(2), debug(bigint) + ' divided by 2n is half itself');
			}
		});

		st.end();
	});

	t.test('throws when %BigInt% intrinsic is absent', { skip: !esV.hasBigInts }, function (st) {
		var bigOne = BigInt(1);
		var bigTwo = BigInt(2);
		var aoPath = require.resolve('../../../' + year + '/BigInt/divide');
		st.teardown(mockProperty(global, 'BigInt', { value: undefined }));
		st.teardown(rerequire(aoPath, require.resolve('get-intrinsic')));
		var Fresh = require(aoPath); // eslint-disable-line global-require
		st['throws'](
			function () { Fresh(bigOne, bigTwo); },
			/BigInt is not supported/,
			'guard throws explicit "BigInt is not supported"'
		);
		st.end();
	});
};

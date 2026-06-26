'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var mockProperty = require('mock-property');

var esV = require('../../helpers/v');

var rerequire = require('../../helpers/rerequire');

module.exports = function (t, year, BigIntBitwiseNOT) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.nonBigInts, function (nonBigInt) {
		t['throws'](
			function () { BigIntBitwiseNOT(nonBigInt); },
			TypeError,
			debug(nonBigInt) + ' is not a BigInt'
		);
	});

	t.test('BigInt supported', { skip: !esV.hasBigInts }, function (st) {
		forEach(v.int32s, function (int32) {
			var bigInt32 = BigInt(int32);
			st.equal(BigIntBitwiseNOT(bigInt32), ~bigInt32, debug(bigInt32) + ' becomes ~' + debug(bigInt32));
		});

		st.end();
	});

	t.test('throws when %BigInt% intrinsic is absent', { skip: !esV.hasBigInts }, function (st) {
		var bigOne = BigInt(1);
		var aoPath = require.resolve('../../../' + year + '/BigInt/bitwiseNOT');
		st.teardown(mockProperty(global, 'BigInt', { value: undefined }));
		st.teardown(rerequire(aoPath, require.resolve('get-intrinsic')));
		var Fresh = require(aoPath); // eslint-disable-line global-require
		st['throws'](
			function () { Fresh(bigOne); },
			/BigInt is not supported/,
			'guard throws explicit "BigInt is not supported"'
		);
		st.end();
	});
};

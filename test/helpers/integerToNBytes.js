'use strict';

var test = require('tape');
var hasBigInts = require('has-bigints')();
var mockProperty = require('mock-property');

var rerequire = require('./rerequire');

test('integerToNBytes throws on bigint when %BigInt% intrinsic is absent', { skip: !hasBigInts }, function (t) {
	var bigOne = BigInt(1);
	t.teardown(mockProperty(global, 'BigInt', { value: undefined }));
	t.teardown(rerequire(
		require.resolve('../../helpers/integerToNBytes'),
		require.resolve('get-intrinsic')
	));
	var FreshIntegerToNBytes = require('../../helpers/integerToNBytes'); // eslint-disable-line global-require
	t['throws'](
		function () { FreshIntegerToNBytes(bigOne, 8, true); },
		/BigInt is not supported/,
		'guard throws "BigInt is not supported in this environment" when given a bigint and intrinsic is missing'
	);
	t.end();
});

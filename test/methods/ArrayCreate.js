'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var $setProto = require('set-proto');

/** @type {import('../testHelpers').MethodTest<'ArrayCreate'>} */
module.exports = function (t, year, ArrayCreate) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.notNonNegativeIntegers, function (nonIntegerNumber) {
		t['throws'](
			function () { ArrayCreate(nonIntegerNumber); },
			TypeError,
			'length must be an integer number >= 0'
		);
	});

	t['throws'](
		function () { ArrayCreate(Math.pow(2, 32)); },
		RangeError,
		'length must be < 2**32'
	);

	t.deepEqual(ArrayCreate(-0), [], 'length of -0 creates an empty array');
	t.deepEqual(ArrayCreate(0), [], 'length of +0 creates an empty array');
	// eslint-disable-next-line no-sparse-arrays, comma-spacing
	t.deepEqual(ArrayCreate(1), [,], 'length of 1 creates a sparse array of length 1');
	// eslint-disable-next-line no-sparse-arrays, comma-spacing
	t.deepEqual(ArrayCreate(2), [,,], 'length of 2 creates a sparse array of length 2');

	t.test('proto argument', { skip: !$setProto }, function (st) {
		var fakeProto = {
			push: { toString: function () { return 'not array push'; } }
		};
		st.equal(ArrayCreate(0, fakeProto).push, fakeProto.push, 'passing the proto argument works');

		st.end();
	});
};

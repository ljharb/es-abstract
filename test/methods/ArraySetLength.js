'use strict';

var debug = require('object-inspect');
var forEach = require('for-each');
var v = require('es-value-fixtures');
var gOPD = require('gopd');

var esV = require('../helpers/v');

module.exports = function (t, year, ArraySetLength) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(esV.unknowns, function (nonArray) {
		t['throws'](
			function () { ArraySetLength(nonArray, { '[[Value]]': 0 }); },
			TypeError,
			'A: ' + debug(nonArray) + ' is not an Array'
		);
	});

	forEach(v.nonUndefinedPrimitives, function (primitive) {
		t['throws'](
			function () { ArraySetLength([], primitive); },
			TypeError,
			'Desc: ' + debug(primitive) + ' is not a Property Descriptor'
		);
	});

	t.test('making length nonwritable', { skip: !gOPD }, function (st) {
		var a = [0];
		st.equal(
			ArraySetLength(a, { '[[Writable]]': false }),
			true,
			'array is made non-writable'
		);

		st.deepEqual(
			gOPD(a, 'length'),
			{
				configurable: false,
				enumerable: false,
				value: 1,
				writable: false
			},
			'without a value, length becomes nonwritable'
		);

		st.equal(
			ArraySetLength(a, v.descriptors.value(0)),
			false,
			'setting a lower value on a non-writable length fails'
		);
		st.equal(a.length, 1, 'array still has a length of 1');

		st.equal(
			ArraySetLength(a, v.descriptors.value(2)),
			false,
			'setting a higher value on a non-writable length fails'
		);
		st.equal(a.length, 1, 'array still has a length of 1');

		st.end();
	});

	forEach([].concat(
		-1,
		Math.pow(2, 32),
		v.nonIntegerNumbers
	), function (nonLength) {
		t['throws'](
			function () { ArraySetLength([], v.descriptors.value(nonLength)); },
			RangeError,
			'a non-integer, negative, or > (2**31 - 1) is not a valid length: ' + debug(nonLength)
		);
	});

	var arr = [];
	t.equal(
		ArraySetLength(arr, v.descriptors.value(7)),
		true,
		'set length succeeded'
	);
	t.equal(arr.length, 7, 'array now has a length of 0 -> 7');

	t.equal(
		ArraySetLength(arr, v.descriptors.value(2)),
		true,
		'set length succeeded'
	);
	t.equal(arr.length, 2, 'array now has a length of 7 -> 2');
};

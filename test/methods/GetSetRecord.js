'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');

module.exports = function (t, year, GetSetRecord) {
	t.ok(year >= 2025, 'ES2025+');

	forEach(v.primitives, function (primitive) {
		t['throws'](
			function () { GetSetRecord(primitive); },
			TypeError,
			debug(primitive) + ' is not an object'
		);
	});

	var keys = function () {};
	var has = function () {};

	var obj = {
		size: null,
		has: has,
		keys: keys
	};

	forEach([{ valueOf: function () { return 'a'; } }, NaN], function (nonNaNNonNumber) {
		obj.size = nonNaNNonNumber;

		t['throws'](
			function () { GetSetRecord(obj); },
			TypeError,
			debug(obj) + ' has a size that coerces to "not a non-NaN number" (' + debug(+nonNaNNonNumber) + ')'
		);
	});

	obj.size = -1;
	t['throws'](
		function () { GetSetRecord(obj); },
		RangeError,
		debug(obj) + ' has a negative size'
	);

	obj.size = 0;
	forEach(v.nonFunctions, function (nonFunction) {
		obj.has = nonFunction;
		obj.keys = keys;

		t['throws'](
			function () { GetSetRecord(obj); },
			TypeError,
			debug(obj) + ' has a `has` that is not callable (' + debug(nonFunction) + ')'
		);

		obj.has = has;
		obj.keys = nonFunction;

		t['throws'](
			function () { GetSetRecord(obj); },
			TypeError,
			debug(obj) + ' has a `keys` that is not callable (' + debug(nonFunction) + ')'
		);
	});

	obj.keys = keys;

	t.deepEqual(
		GetSetRecord(obj),
		{
			'[[SetObject]]': obj,
			'[[Size]]': 0,
			'[[Has]]': has,
			'[[Keys]]': keys
		},
		'returns the expected object'
	);
};

'use strict';

var test = require('tape');
var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');

var isPropertyDescriptor = require('../../../helpers/records/property-descriptor');

test('Property Descriptor', function (t) {
	forEach(v.primitives, function (primitive) {
		t.equal(
			isPropertyDescriptor(primitive),
			false,
			debug(primitive) + ' is not a Property Descriptor'
		);
	});

	t.equal(
		isPropertyDescriptor({ invalid: true }),
		false,
		'invalid keys not allowed on a Property Descriptor'
	);

	t.equal(
		isPropertyDescriptor({}),
		true,
		'empty object is an incomplete Property Descriptor'
	);

	t.equal(
		isPropertyDescriptor(v.accessorDescriptor()),
		true,
		'accessor descriptor is a Property Descriptor'
	);

	t.equal(
		isPropertyDescriptor(v.mutatorDescriptor()),
		true,
		'mutator descriptor is a Property Descriptor'
	);

	t.equal(
		isPropertyDescriptor(v.dataDescriptor()),
		true,
		'data descriptor is a Property Descriptor'
	);

	t.equal(
		isPropertyDescriptor(v.genericDescriptor()),
		true,
		'generic descriptor is a Property Descriptor'
	);

	t['throws'](
		function () { isPropertyDescriptor(v.bothDescriptor()); },
		TypeError,
		'a Property Descriptor can not be both a Data and an Accessor Descriptor'
	);

	t.end();
});

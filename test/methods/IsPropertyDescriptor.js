'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');

module.exports = function (t, year, IsPropertyDescriptor) {
	t.ok(year < 2018, 'ES 2018+ removed IsPropertyDescriptor');

	forEach(v.primitives, function (primitive) {
		t.equal(
			IsPropertyDescriptor(primitive),
			false,
			debug(primitive) + ' is not a Property Descriptor'
		);
	});

	t.equal(IsPropertyDescriptor({ invalid: true }), false, 'invalid keys not allowed on a Property Descriptor');

	t.equal(IsPropertyDescriptor({}), true, 'empty object is an incomplete Property Descriptor');

	t.equal(IsPropertyDescriptor(v.accessorDescriptor()), true, 'accessor descriptor is a Property Descriptor');
	t.equal(IsPropertyDescriptor(v.mutatorDescriptor()), true, 'mutator descriptor is a Property Descriptor');
	t.equal(IsPropertyDescriptor(v.dataDescriptor()), true, 'data descriptor is a Property Descriptor');
	t.equal(IsPropertyDescriptor(v.genericDescriptor()), true, 'generic descriptor is a Property Descriptor');

	t['throws'](
		function () { IsPropertyDescriptor(v.bothDescriptor()); },
		TypeError,
		'a Property Descriptor can not be both a Data and an Accessor Descriptor'
	);

	t['throws'](
		function () { IsPropertyDescriptor(v.bothDescriptorWritable()); },
		TypeError,
		'a Property Descriptor can not be both a Data and an Accessor Descriptor'
	);
};

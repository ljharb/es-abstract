'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');

module.exports = function (t, year, IsGenericDescriptor) {
	t.ok(year >= 5, 'ES5+');

	forEach(v.nonUndefinedPrimitives, function (primitive) {
		t['throws'](
			function () { IsGenericDescriptor(primitive); },
			TypeError,
			debug(primitive) + ' is not a Property Descriptor'
		);
	});

	t.equal(IsGenericDescriptor(), false, 'no value is not a Data Descriptor');
	t.equal(IsGenericDescriptor(undefined), false, 'undefined value is not a Data Descriptor');

	t.equal(IsGenericDescriptor(v.accessorDescriptor()), false, 'accessor descriptor is not a generic Descriptor');
	t.equal(IsGenericDescriptor(v.mutatorDescriptor()), false, 'mutator descriptor is not a generic Descriptor');
	t.equal(IsGenericDescriptor(v.dataDescriptor()), false, 'data descriptor is not a generic Descriptor');

	t.equal(IsGenericDescriptor(v.genericDescriptor()), true, 'generic descriptor is a generic Descriptor');
};

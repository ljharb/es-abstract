'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');

module.exports = function (t, year, IsDataDescriptor) {
	t.ok(year >= 5, 'ES5+');

	forEach(v.nonUndefinedPrimitives, function (primitive) {
		t['throws'](
			function () { IsDataDescriptor(primitive); },
			TypeError,
			debug(primitive) + ' is not a Property Descriptor'
		);
	});

	t.equal(IsDataDescriptor(), false, 'no value is not a Data Descriptor');
	t.equal(IsDataDescriptor(undefined), false, 'undefined value is not a Data Descriptor');

	t.equal(IsDataDescriptor(v.accessorDescriptor()), false, 'accessor descriptor is not a Data Descriptor');
	t.equal(IsDataDescriptor(v.mutatorDescriptor()), false, 'mutator descriptor is not a Data Descriptor');
	t.equal(IsDataDescriptor(v.dataDescriptor()), true, 'data descriptor is a Data Descriptor');
	t.equal(IsDataDescriptor(v.genericDescriptor()), false, 'generic descriptor is not a Data Descriptor');
};

'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');

module.exports = function (t, year, IsAccessorDescriptor) {
	t.ok(year >= 5, 'ES5+');

	forEach(v.nonUndefinedPrimitives, function (primitive) {
		t['throws'](
			function () { IsAccessorDescriptor(primitive); },
			TypeError,
			debug(primitive) + ' is not a Property Descriptor'
		);
	});

	t.equal(IsAccessorDescriptor(), false, 'no value is not an Accessor Descriptor');
	t.equal(IsAccessorDescriptor(undefined), false, 'undefined value is not an Accessor Descriptor');

	t.equal(IsAccessorDescriptor(v.accessorDescriptor()), true, 'accessor descriptor is an Accessor Descriptor');
	t.equal(IsAccessorDescriptor(v.mutatorDescriptor()), true, 'mutator descriptor is an Accessor Descriptor');
	t.equal(IsAccessorDescriptor(v.dataDescriptor()), false, 'data descriptor is not an Accessor Descriptor');
	t.equal(IsAccessorDescriptor(v.genericDescriptor()), false, 'generic descriptor is not an Accessor Descriptor');
};

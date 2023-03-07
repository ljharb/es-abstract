'use strict';

var test = require('tape');
var v = require('es-value-fixtures');
var forEach = require('for-each');
var inspect = require('object-inspect');

var isFullyPopulatedPropertyDescriptor = require('../../helpers/isFullyPopulatedPropertyDescriptor');

var ES = {
	IsAccessorDescriptor: require('../../2022/IsAccessorDescriptor'), // eslint-disable-line global-require
	IsDataDescriptor: require('../../2022/IsDataDescriptor') // eslint-disable-line global-require
};

test('isFullyPopulatedPropertyDescriptor', function (t) {
	t.equal(isFullyPopulatedPropertyDescriptor(ES), false, '"no args" is not a fully populated property descriptor');
	forEach(v.primitives, function (primitive) {
		t.equal(isFullyPopulatedPropertyDescriptor(ES, primitive), false, inspect(primitive) + ' is not a fully populated property descriptor');
	});

	t.equal(isFullyPopulatedPropertyDescriptor(ES, v.genericDescriptor()), false, 'a generic descriptor is not a fully populated property descriptor');

	t.equal(isFullyPopulatedPropertyDescriptor(ES, v.dataDescriptor()), false, 'an incomplete data descriptor is not a fully populated property descriptor');
	t.equal(isFullyPopulatedPropertyDescriptor(ES, v.descriptors.enumerable(v.descriptors.configurable(v.dataDescriptor()))), true, 'a fully populated data descriptor is a fully populated property descriptor');

	t.end();
});

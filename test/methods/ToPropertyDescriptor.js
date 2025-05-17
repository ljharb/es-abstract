'use strict';

var debug = require('object-inspect');
var forEach = require('for-each');
var v = require('es-value-fixtures');

module.exports = function (t, year, ToPropertyDescriptor) {
	t.ok(year >= 5, 'ES5+');

	forEach(v.nonUndefinedPrimitives, function (primitive) {
		t['throws'](
			function () { ToPropertyDescriptor(primitive); },
			TypeError,
			debug(primitive) + ' is not an Object'
		);
	});

	var accessor = v.accessorDescriptor();
	t.deepEqual(ToPropertyDescriptor({
		get: accessor['[[Get]]'],
		enumerable: !!accessor['[[Enumerable]]'],
		configurable: !!accessor['[[Configurable]]']
	}), accessor);

	var mutator = v.mutatorDescriptor();
	t.deepEqual(ToPropertyDescriptor({
		set: mutator['[[Set]]'],
		enumerable: !!mutator['[[Enumerable]]'],
		configurable: !!mutator['[[Configurable]]']
	}), mutator);

	var data = v.descriptors.nonConfigurable(v.dataDescriptor());
	t.deepEqual(ToPropertyDescriptor({
		value: data['[[Value]]'],
		writable: data['[[Writable]]'],
		configurable: !!data['[[Configurable]]']
	}), data);

	var both = v.bothDescriptor();
	t['throws'](
		function () {
			ToPropertyDescriptor({ get: both['[[Get]]'], value: both['[[Value]]'] });
		},
		TypeError,
		'data and accessor descriptors are mutually exclusive'
	);

	t['throws'](
		function () { ToPropertyDescriptor({ get: 'not callable' }); },
		TypeError,
		'"get" must be undefined or callable'
	);

	t['throws'](
		function () { ToPropertyDescriptor({ set: 'not callable' }); },
		TypeError,
		'"set" must be undefined or callable'
	);

	forEach(v.nonFunctions, function (nonFunction) {
		if (typeof nonFunction !== 'undefined') {
			t['throws'](
				function () { ToPropertyDescriptor({ get: nonFunction }); },
				TypeError,
				'`.get` has ' + debug(nonFunction) + ', which is not a Function'
			);
			t['throws'](
				function () { ToPropertyDescriptor({ set: nonFunction }); },
				TypeError,
				'`.set` has ' + debug(nonFunction) + ', which is not a Function'
			);
		}
	});

	forEach(['get', 'set'], function (accessorName) {
		forEach(['value', 'writable'], function (dataName) {
			var o = {};
			o[accessorName] = undefined;
			o[dataName] = undefined;

			t['throws'](
				function () { ToPropertyDescriptor(o); },
				TypeError,
				accessorName + ' + ' + dataName + ' is invalid'
			);
		});
	});
};

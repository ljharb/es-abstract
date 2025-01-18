'use strict';

var debug = require('object-inspect');
var forEach = require('for-each');
var v = require('es-value-fixtures');

/** @type {import('../testHelpers').MethodTest<'FromPropertyDescriptor'>} */
module.exports = function (t, year, FromPropertyDescriptor) {
	t.ok(year >= 5, 'ES5+');

	// @ts-expect-error
	t.equal(FromPropertyDescriptor(), undefined, 'no value begets undefined');
	t.equal(FromPropertyDescriptor(undefined), undefined, 'undefined value begets undefined');

	forEach(v.nonUndefinedPrimitives, function (primitive) {
		t['throws'](
			// @ts-expect-error
			function () { FromPropertyDescriptor(primitive); },
			TypeError,
			debug(primitive) + ' is not a Property Descriptor'
		);
	});

	var accessor = v.accessorDescriptor();
	var mutator = v.mutatorDescriptor();
	var data = v.dataDescriptor();
	var generic = v.genericDescriptor();

	var fromAccessor = FromPropertyDescriptor(accessor);
	var fromMutator = FromPropertyDescriptor(mutator);
	var fromData = FromPropertyDescriptor(data);

	if (year < 2015) {
		t.deepEqual(fromAccessor, {
			get: accessor['[[Get]]'],
			set: accessor['[[Set]]'],
			enumerable: !!accessor['[[Enumerable]]'],
			configurable: !!accessor['[[Configurable]]']
		});
		t.deepEqual(fromMutator, {
			get: mutator['[[Get]]'],
			set: mutator['[[Set]]'],
			enumerable: !!mutator['[[Enumerable]]'],
			configurable: !!mutator['[[Configurable]]']
		});
		t.deepEqual(fromData, {
			value: data['[[Value]]'],
			writable: data['[[Writable]]'],
			enumerable: !!data['[[Enumerable]]'],
			configurable: !!data['[[Configurable]]']
		});

		t['throws'](
			function () { FromPropertyDescriptor(generic); },
			TypeError,
			'a complete Property Descriptor is required'
		);
	} else {
		t.deepEqual(fromAccessor, {
			get: accessor['[[Get]]'],
			enumerable: !!accessor['[[Enumerable]]'],
			configurable: !!accessor['[[Configurable]]']
		});
		t.deepEqual(fromMutator, {
			set: mutator['[[Set]]'],
			enumerable: !!mutator['[[Enumerable]]'],
			configurable: !!mutator['[[Configurable]]']
		});
		t.deepEqual(fromData, {
			value: data['[[Value]]'],
			writable: data['[[Writable]]']
		});

		t.deepEqual(FromPropertyDescriptor(generic), {
			enumerable: false,
			configurable: true
		});

		var both = v.bothDescriptor();
		t['throws'](
			function () {
				FromPropertyDescriptor({ get: both['[[Get]]'], value: both['[[Value]]'] });
			},
			TypeError,
			'data and accessor descriptors are mutually exclusive'
		);
	}
};

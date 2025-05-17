'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, CompletePropertyDescriptor) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.nonUndefinedPrimitives, function (primitive) {
		t['throws'](
			function () { CompletePropertyDescriptor(primitive); },
			TypeError,
			debug(primitive) + ' is not a Property Descriptor'
		);
	});

	var generic = v.genericDescriptor();
	t.deepEqual(
		CompletePropertyDescriptor(generic),
		{
			'[[Configurable]]': !!generic['[[Configurable]]'],
			'[[Enumerable]]': !!generic['[[Enumerable]]'],
			'[[Value]]': undefined,
			'[[Writable]]': false
		},
		'completes a Generic Descriptor'
	);

	var data = v.dataDescriptor();
	t.deepEqual(
		CompletePropertyDescriptor(data),
		{
			'[[Configurable]]': !!data['[[Configurable]]'],
			'[[Enumerable]]': false,
			'[[Value]]': data['[[Value]]'],
			'[[Writable]]': !!data['[[Writable]]']
		},
		'completes a Data Descriptor'
	);

	var accessor = v.accessorDescriptor();
	t.deepEqual(
		CompletePropertyDescriptor(accessor),
		{
			'[[Get]]': accessor['[[Get]]'],
			'[[Enumerable]]': !!accessor['[[Enumerable]]'],
			'[[Configurable]]': !!accessor['[[Configurable]]'],
			'[[Set]]': undefined
		},
		'completes an Accessor Descriptor'
	);

	var mutator = v.mutatorDescriptor();
	t.deepEqual(
		CompletePropertyDescriptor(mutator),
		{
			'[[Set]]': mutator['[[Set]]'],
			'[[Enumerable]]': !!mutator['[[Enumerable]]'],
			'[[Configurable]]': !!mutator['[[Configurable]]'],
			'[[Get]]': undefined
		},
		'completes a mutator Descriptor'
	);

	t['throws'](
		function () { CompletePropertyDescriptor(v.bothDescriptor()); },
		TypeError,
		'data and accessor descriptors are mutually exclusive'
	);
};

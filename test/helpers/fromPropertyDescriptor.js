'use strict';

var test = require('tape');

var fromPropertyDescriptor = require('../../helpers/fromPropertyDescriptor');

test('fromPropertyDescriptor', function (t) {
	t.deepEqual(
		fromPropertyDescriptor({}),
		{},
		'empty obj -> empty obj'
	);

	t.deepEqual(
		fromPropertyDescriptor({ '[[Value]]': undefined }),
		{ value: undefined },
		'undefined [[Value]] Property Descriptor -> obj with value'
	);

	t.deepEqual(
		fromPropertyDescriptor({ enumerable: false }),
		{},
		'descriptor obj -> empty obj'
	);

	t.deepEqual(
		fromPropertyDescriptor({
			'[[Configurable]]': 'true',
			'[[Enumerable]]': 'false',
			'[[Get]]': NaN,
			'[[Set]]': -0,
			'[[Value]]': 42,
			'[[Writable]]': 0
		}),
		{ // order is important
			value: 42,
			writable: false,
			get: NaN,
			set: -0,
			enumerable: true,
			configurable: true
		},
		'Property Descriptor -> obj'
	);

	t.end();
});

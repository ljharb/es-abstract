'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var gOPD = require('gopd');
var defineProperty = require('es-define-property');

var $defineProperty = require('../helpers/defineProperty');

/** @type {import('../testHelpers').MethodTest<'ValidateAndApplyPropertyDescriptor'>} */
module.exports = function (t, year, ValidateAndApplyPropertyDescriptor, extras) {
	t.ok(year >= 2015, 'ES2015+');

	var CompletePropertyDescriptor = extras.getAO('CompletePropertyDescriptor');

	forEach(v.nonUndefinedPrimitives, function (nonUndefinedPrimitive) {
		t['throws'](
			// @ts-expect-error
			function () { ValidateAndApplyPropertyDescriptor(nonUndefinedPrimitive, '', false, v.genericDescriptor(), v.genericDescriptor()); },
			TypeError,
			'O: ' + debug(nonUndefinedPrimitive) + ' is not undefined or an Object'
		);
	});

	forEach(v.nonBooleans, function (nonBoolean) {
		t['throws'](
			function () {
				return ValidateAndApplyPropertyDescriptor(
					undefined,
					'',
					// @ts-expect-error
					nonBoolean,
					v.genericDescriptor(),
					v.genericDescriptor()
				);
			},
			TypeError,
			'extensible: ' + debug(nonBoolean) + ' is not a Boolean'
		);
	});

	forEach(v.primitives, function (primitive) {
		// Desc must be a Property Descriptor
		t['throws'](
			function () {
				return ValidateAndApplyPropertyDescriptor(
					undefined,
					'',
					false,
					// @ts-expect-error
					primitive,
					v.genericDescriptor()
				);
			},
			TypeError,
			'Desc: ' + debug(primitive) + ' is not a Property Descriptor'
		);
	});

	forEach(v.nonUndefinedPrimitives, function (primitive) {
		// current must be undefined or a Property Descriptor
		t['throws'](
			function () {
				return ValidateAndApplyPropertyDescriptor(
					undefined,
					'',
					false,
					v.genericDescriptor(),
					// @ts-expect-error
					primitive
				);
			},
			TypeError,
			'current: ' + debug(primitive) + ' is not a Property Descriptor or undefined'
		);
	});

	forEach(v.nonPropertyKeys, function (nonPropertyKey) {
		// if O is an object, P must be a property key
		t['throws'](
			function () {
				// @ts-expect-error
				return ValidateAndApplyPropertyDescriptor(
					{},
					nonPropertyKey,
					false,
					v.genericDescriptor(),
					v.genericDescriptor()
				);
			},
			TypeError,
			'P: ' + debug(nonPropertyKey) + ' is not a Property Key'
		);
	});

	t.test('current is undefined', function (st) {
		var propertyKey = 'howdy';

		st.test('generic descriptor', { skip: !$defineProperty }, function (s2t) {
			var generic = v.descriptors.configurable(v.descriptors.enumerable());
			var O = {};
			ValidateAndApplyPropertyDescriptor(undefined, propertyKey, true, generic);
			s2t.equal(
				ValidateAndApplyPropertyDescriptor(O, propertyKey, false, generic),
				false,
				'when extensible is false, nothing happens'
			);
			s2t.deepEqual(O, {}, 'no changes applied when O is undefined or extensible is false');
			s2t.equal(
				ValidateAndApplyPropertyDescriptor(O, propertyKey, true, generic),
				true,
				'operation is successful'
			);
			/** @type {Record<PropertyKey, unknown>} */
			var expected = {};
			expected[propertyKey] = '[[Value]]' in generic && generic['[[Value]]'];
			s2t.deepEqual(O, expected, 'generic descriptor has been defined as an own data property');
			s2t.end();
		});

		st.test('data descriptor', function (s2t) {
			var data = v.descriptors.enumerable(v.dataDescriptor());
			if (!$defineProperty) {
				// IE 8 can't handle defining a new property with an incomplete descriptor
				data = v.descriptors.configurable(v.descriptors.writable(data));
			}

			/** @type {Record<PropertyKey, unknown>} */
			var O = {};
			s2t.equal(
				ValidateAndApplyPropertyDescriptor(undefined, propertyKey, true, data),
				true,
				'noop when O is undefined'
			);
			s2t.equal(
				ValidateAndApplyPropertyDescriptor(O, propertyKey, false, data),
				false,
				'when extensible is false, nothing happens'
			);
			s2t.deepEqual(O, {}, 'no changes applied when O is undefined or extensible is false');
			s2t.equal(
				ValidateAndApplyPropertyDescriptor(O, propertyKey, true, data),
				true,
				'operation is successful'
			);
			/** @type {Record<PropertyKey, unknown>} */
			var expected = {};
			expected[propertyKey] = data['[[Value]]'];
			s2t.deepEqual(O, expected, 'data descriptor has been defined as an own data property');
			s2t.end();
		});

		st.test('accessor descriptor', { skip: !$defineProperty }, function (s2t) {
			var count = 0;
			var accessor = v.accessorDescriptor(count);
			accessor['[[Get]]'] = function () {
				count += 1;
				return count;
			};

			/** @type {Record<PropertyKey, number>} */
			var O = {};
			ValidateAndApplyPropertyDescriptor(undefined, propertyKey, true, accessor);
			s2t.equal(
				ValidateAndApplyPropertyDescriptor(O, propertyKey, false, accessor),
				false,
				'when extensible is false, nothing happens'
			);
			s2t.deepEqual(O, {}, 'no changes applied when O is undefined or extensible is false');
			s2t.equal(
				ValidateAndApplyPropertyDescriptor(O, propertyKey, true, accessor),
				true,
				'operation is successful'
			);
			/** @type {Record<PropertyKey, unknown>} */
			var expected = {};
			expected[propertyKey] = accessor['[[Get]]']() + 1;
			s2t.deepEqual(O, expected, 'accessor descriptor has been defined as an own accessor property');
			s2t.end();
		});

		st.end();
	});

	t.test('every field in Desc is absent', { skip: 'it is unclear if having no fields qualifies Desc to be a Property Descriptor' });

	forEach([v.dataDescriptor, v.accessorDescriptor, v.mutatorDescriptor], function (getDescriptor) {
		t.equal(
			ValidateAndApplyPropertyDescriptor(
				undefined,
				'property key',
				true,
				getDescriptor(),
				CompletePropertyDescriptor(getDescriptor())
			),
			true,
			'when Desc and current are the same, early return true'
		);
	});

	t.test('current is nonconfigurable', function (st) {
		// note: these must not be generic descriptors, or else the algorithm returns an early true
		st.equal(
			ValidateAndApplyPropertyDescriptor(
				undefined,
				'property key',
				true,
				v.descriptors.configurable(v.dataDescriptor()),
				CompletePropertyDescriptor(v.descriptors.nonConfigurable(v.dataDescriptor()))
			),
			false,
			'false if Desc is configurable'
		);

		st.equal(
			ValidateAndApplyPropertyDescriptor(
				undefined,
				'property key',
				true,
				{},
				CompletePropertyDescriptor(v.descriptors.nonConfigurable(v.dataDescriptor()))
			),
			true,
			'true if Desc is generic, and lacks both [[Configurable]] and [[Enumerable]]'
		);

		st.equal(
			ValidateAndApplyPropertyDescriptor(
				undefined,
				'property key',
				true,
				v.descriptors.enumerable(v.dataDescriptor()),
				CompletePropertyDescriptor(v.descriptors.nonEnumerable(v.dataDescriptor()))
			),
			false,
			'false if Desc is Enumerable and current is not'
		);

		st.equal(
			ValidateAndApplyPropertyDescriptor(
				undefined,
				'property key',
				true,
				v.descriptors.nonEnumerable(v.dataDescriptor()),
				CompletePropertyDescriptor(v.descriptors.enumerable(v.dataDescriptor()))
			),
			false,
			'false if Desc is not Enumerable and current is'
		);

		st.equal(
			ValidateAndApplyPropertyDescriptor(
				undefined,
				'property key',
				true,
				v.accessorDescriptor(),
				CompletePropertyDescriptor(v.dataDescriptor())
			),
			false,
			'false if Desc is an accessor descriptor and current is a data descriptor'
		);
		st.equal(
			ValidateAndApplyPropertyDescriptor(
				undefined,
				'property key',
				true,
				v.descriptors.nonConfigurable(v.dataDescriptor()),
				CompletePropertyDescriptor(v.descriptors.nonConfigurable(v.accessorDescriptor()))
			),
			false,
			'false if Desc is a data descriptor and current is an accessor descriptor'
		);

		st.equal(
			ValidateAndApplyPropertyDescriptor(
				undefined,
				'property key',
				true,
				v.descriptors.nonConfigurable(v.accessorDescriptor()),
				v.descriptors.nonConfigurable(v.accessorDescriptor())
			),
			false,
			'false if Desc and current are both accessors with a !== Get function'
		);
		/** @returns {undefined} */
		var fakeGetter = function () {};
		st.equal(
			ValidateAndApplyPropertyDescriptor(
				undefined,
				'property key',
				true,
				CompletePropertyDescriptor(v.descriptors.nonConfigurable({ '[[Get]]': fakeGetter, '[[Set]]': function () {} })),
				CompletePropertyDescriptor(v.descriptors.nonConfigurable({ '[[Get]]': fakeGetter, '[[Set]]': function () {} }))
			),
			false,
			'false if Desc and current are both accessors with a !== Get function'
		);

		var descLackingEnumerable = v.descriptors.configurable(v.descriptors.getter());
		st.equal(
			ValidateAndApplyPropertyDescriptor(
				undefined,
				'property key',
				true,
				descLackingEnumerable,
				CompletePropertyDescriptor(v.descriptors.enumerable(v.accessorDescriptor()))
			),
			true,
			'not false if Desc lacks Enumerable'
		);

		st.equal(
			ValidateAndApplyPropertyDescriptor(
				{},
				'property key',
				true,
				v.descriptors.nonConfigurable(),
				v.descriptors.nonConfigurable(v.descriptors.enumerable(v.accessorDescriptor()))
			),
			true,
			'see https://github.com/tc39/ecma262/issues/2761'
		);

		st.end();
	});

	t.test('Desc and current: one is a data descriptor, one is not', { skip: !defineProperty || !gOPD }, function (st) {
		if (!defineProperty || !gOPD) {
			st.fail();
			return;
		}
		// note: Desc must be configurable if current is nonconfigurable, to hit this branch
		st.equal(
			ValidateAndApplyPropertyDescriptor(
				undefined,
				'property key',
				true,
				v.descriptors.configurable(v.accessorDescriptor()),
				CompletePropertyDescriptor(v.descriptors.nonConfigurable(v.dataDescriptor()))
			),
			false,
			'false if current (data) is nonconfigurable'
		);

		st.equal(
			ValidateAndApplyPropertyDescriptor(
				undefined,
				'property key',
				true,
				v.descriptors.configurable(v.dataDescriptor()),
				CompletePropertyDescriptor(v.descriptors.nonConfigurable(v.accessorDescriptor()))
			),
			false,
			'false if current (not data) is nonconfigurable'
		);

		// one is data and one is not,
		//	// if current is data, convert to accessor
		//	// else convert to data

		var startsWithData = {
			'property key': 42
		};
		st.equal(
			ValidateAndApplyPropertyDescriptor(
				startsWithData,
				'property key',
				true,
				v.descriptors.enumerable(v.descriptors.configurable(v.accessorDescriptor())),
				CompletePropertyDescriptor(v.descriptors.enumerable(v.descriptors.configurable(v.dataDescriptor())))
			),
			true,
			'operation is successful: current is data, Desc is accessor'
		);
		var shouldBeAccessor = gOPD(startsWithData, 'property key');
		st.equal(shouldBeAccessor && typeof shouldBeAccessor.get, 'function', 'has a getter');

		var key = 'property key';
		/** @type {Record<PropertyKey, unknown>} */
		var startsWithAccessor = {};
		defineProperty(startsWithAccessor, key, {
			configurable: true,
			enumerable: true,
			get: function get() { return 42; }
		});
		st.equal(
			ValidateAndApplyPropertyDescriptor(
				startsWithAccessor,
				key,
				true,
				v.descriptors.enumerable(v.descriptors.configurable(v.dataDescriptor())),
				v.descriptors.enumerable(v.descriptors.configurable(v.accessorDescriptor(42)))
			),
			true,
			'operation is successful: current is accessor, Desc is data'
		);
		var shouldBeData = gOPD(startsWithAccessor, 'property key');
		st.deepEqual(shouldBeData, { configurable: true, enumerable: true, value: 42, writable: false }, 'is a data property');

		st.end();
	});

	t.test('Desc and current are both data descriptors', function (st) {
		st.equal(
			ValidateAndApplyPropertyDescriptor(
				undefined,
				'property key',
				true,
				v.descriptors.writable(v.dataDescriptor()),
				CompletePropertyDescriptor(v.descriptors.nonWritable(v.descriptors.nonConfigurable(v.dataDescriptor())))
			),
			false,
			'false if frozen current and writable Desc'
		);

		st.equal(
			ValidateAndApplyPropertyDescriptor(
				undefined,
				'property key',
				true,
				v.descriptors.configurable(v.descriptors.value(42)),
				CompletePropertyDescriptor(v.descriptors.nonWritable(v.descriptors.value(7)))
			),
			false,
			'false if nonwritable current has a different value than Desc'
		);

		st.end();
	});

	t.test('current is nonconfigurable; Desc and current are both accessor descriptors', function (st) {
		st.equal(
			ValidateAndApplyPropertyDescriptor(
				undefined,
				'property key',
				true,
				v.mutatorDescriptor(),
				CompletePropertyDescriptor(v.descriptors.nonConfigurable(v.mutatorDescriptor()))
			),
			false,
			'false if both Sets are not equal'
		);

		st.equal(
			ValidateAndApplyPropertyDescriptor(
				undefined,
				'property key',
				true,
				v.accessorDescriptor(),
				CompletePropertyDescriptor(v.descriptors.nonConfigurable(v.accessorDescriptor()))
			),
			false,
			'false if both Gets are not equal'
		);

		st.end();
	});

	if (year >= 2022) {
		t['throws'](
			function () {
				ValidateAndApplyPropertyDescriptor(
					{},
					'property key',
					true,
					v.genericDescriptor(),
					v.genericDescriptor()
				);
			},
			TypeError,
			'current must be a complete descriptor'
		);
	}
};

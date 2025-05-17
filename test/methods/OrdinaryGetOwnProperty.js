'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var $defineProperty = require('es-define-property');

var defineProperty = require('../helpers/defineProperty');

module.exports = function (t, year, OrdinaryGetOwnProperty, extras) {
	t.ok(year >= 2015, 'ES2015+');

	var ToPropertyDescriptor = extras.getAO('ToPropertyDescriptor');

	forEach(v.primitives, function (primitive) {
		t['throws'](
			function () { OrdinaryGetOwnProperty(primitive, ''); },
			TypeError,
			'O: ' + debug(primitive) + ' is not an Object'
		);
	});
	forEach(v.nonPropertyKeys, function (nonPropertyKey) {
		t['throws'](
			function () { OrdinaryGetOwnProperty({}, nonPropertyKey); },
			TypeError,
			'P: ' + debug(nonPropertyKey) + ' is not a Property Key'
		);
	});

	t.equal(OrdinaryGetOwnProperty({}, 'not in the object'), undefined, 'missing property yields undefined');
	t.equal(OrdinaryGetOwnProperty({}, 'toString'), undefined, 'inherited non-own property yields undefined');

	t.deepEqual(
		OrdinaryGetOwnProperty({ a: 1 }, 'a'),
		ToPropertyDescriptor({
			configurable: true,
			enumerable: true,
			value: 1,
			writable: true
		}),
		'own assigned data property yields expected descriptor'
	);

	t.deepEqual(
		OrdinaryGetOwnProperty(/a/, 'lastIndex'),
		ToPropertyDescriptor({
			configurable: false,
			enumerable: false,
			value: 0,
			writable: true
		}),
		'regex lastIndex yields expected descriptor'
	);

	t.deepEqual(
		OrdinaryGetOwnProperty([], 'length'),
		ToPropertyDescriptor({
			configurable: false,
			enumerable: false,
			value: 0,
			writable: true
		}),
		'array length yields expected descriptor'
	);

	if (!Object.isFrozen || !Object.isFrozen(Object.prototype)) {
		t.deepEqual(
			OrdinaryGetOwnProperty(Object.prototype, 'toString'),
			ToPropertyDescriptor({
				configurable: true,
				enumerable: false,
				value: Object.prototype.toString,
				writable: true
			}),
			'own non-enumerable data property yields expected descriptor'
		);
	}

	t.test('ES5+', { skip: !$defineProperty }, function (st) {
		var O = {};
		defineProperty(O, 'foo', {
			configurable: false,
			enumerable: false,
			value: O,
			writable: true
		});

		st.deepEqual(
			OrdinaryGetOwnProperty(O, 'foo'),
			ToPropertyDescriptor({
				configurable: false,
				enumerable: false,
				value: O,
				writable: true
			}),
			'defined own property yields expected descriptor'
		);

		st.end();
	});
};

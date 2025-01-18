'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var hasOwn = require('hasown');
var $defineProperty = require('es-define-property');

var defineProperty = require('../helpers/defineProperty');

/** @type {import('../testHelpers').MethodTest<'EnumerableOwnProperties' | 'EnumerableOwnNames'>} */
module.exports = function (t, year, actual) {
	t.ok(year >= 2015, 'ES2015+');

	var EnumerableOwnProperties = year >= 2017 ? actual : function EnumerableOwnNames(obj, kind) {
		if (kind !== 'key') {
			throw new EvalError('test error: this wrapper should only be invoked with kind `key`');
		}
		return /** @type {import('../../es2016').EnumerableOwnNames} */ (actual)(obj);
	};

	forEach(v.primitives, function (nonObject) {
		t['throws'](
			function () { EnumerableOwnProperties(nonObject, 'key'); },
			debug(nonObject) + ' is not an Object'
		);
	});

	if (year >= 2017) {
		t['throws'](
			function () { EnumerableOwnProperties({}, 'not key, value, or key+value'); },
			TypeError,
			'invalid "kind" throws'
		);
	}

	var Child = function Child() {
		this.own = {};
	};
	Child.prototype = {
		inherited: {}
	};

	var obj = new Child();

	t.equal('own' in obj, true, 'has "own"');
	t.equal(hasOwn(obj, 'own'), true, 'has own "own"');
	t.equal(Object.prototype.propertyIsEnumerable.call(obj, 'own'), true, 'has enumerable "own"');

	t.equal('inherited' in obj, true, 'has "inherited"');
	t.equal(hasOwn(obj, 'inherited'), false, 'has non-own "inherited"');
	t.equal(hasOwn(Child.prototype, 'inherited'), true, 'Child.prototype has own "inherited"');
	t.equal(Child.prototype.inherited, obj.inherited, 'Child.prototype.inherited === obj.inherited');
	t.equal(Object.prototype.propertyIsEnumerable.call(Child.prototype, 'inherited'), true, 'has enumerable "inherited"');

	t.equal('toString' in obj, true, 'has "toString"');
	t.equal(hasOwn(obj, 'toString'), false, 'has non-own "toString"');
	t.equal(hasOwn(Object.prototype, 'toString'), true, 'Object.prototype has own "toString"');
	t.equal(Object.prototype.toString, obj.toString, 'Object.prototype.toString === obj.toString');
	// eslint-disable-next-line no-useless-call
	t.equal(Object.prototype.propertyIsEnumerable.call(Object.prototype, 'toString'), false, 'has non-enumerable "toString"');

	t.deepEqual(
		EnumerableOwnProperties(obj, 'key'),
		['own'],
		'returns enumerable own ' + (year < 2017 ? 'names' : 'keys')
	);

	if (year >= 2017) {
		t.deepEqual(
			EnumerableOwnProperties(obj, 'value'),
			[obj.own],
			'returns enumerable own values'
		);

		t.deepEqual(
			EnumerableOwnProperties(obj, 'key+value'),
			[['own', obj.own]],
			'returns enumerable own entries'
		);

		t.test('getters changing properties of unvisited entries', { skip: !$defineProperty }, function (st) {
			var o = { a: 1, b: 2, c: 3, d: 4 };
			defineProperty(o, 'a', {
				enumerable: true,
				get: function () {
					defineProperty(o, 'b', { enumerable: false });
					return 1;
				}
			});
			defineProperty(o, 'c', { enumerable: false });

			st.deepEqual(
				EnumerableOwnProperties(o, 'key'),
				['a', 'b', 'd'],
				'`key` kind returns all initially enumerable own keys'
			);

			st.deepEqual(
				EnumerableOwnProperties(o, 'key+value'),
				[['a', 1], ['d', 4]],
				'key+value returns only own enumerable entries that remain enumerable at the time they are visited'
			);

			st.end();
		});
	}
};

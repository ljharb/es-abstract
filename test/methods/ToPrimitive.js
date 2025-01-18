'use strict';

var debug = require('object-inspect');
var forEach = require('for-each');
var v = require('es-value-fixtures');

/** @type {import('../testHelpers').MethodTest<'ToPrimitive'>} */
module.exports = function (t, year, ToPrimitive) {
	t.ok(year >= 5, 'ES5+');

	t.test('primitives', function (st) {
		forEach(v.primitives, function (primitive) {
			st.equal(ToPrimitive(primitive), primitive, debug(primitive) + ' is returned correctly');
		});

		st.end();
	});

	t.test('objects', function (st) {
		st.equal(ToPrimitive(v.coercibleObject), 3, 'coercibleObject with no hint coerces to valueOf');
		st.equal(ToPrimitive({}), '[object Object]', '{} with no hint coerces to Object#toString');
		st.equal(ToPrimitive(v.coercibleObject, Number), 3, 'coercibleObject with hint Number coerces to valueOf');
		st.equal(ToPrimitive({}, Number), '[object Object]', '{} with hint Number coerces to NaN');
		st.equal(ToPrimitive(v.coercibleObject, String), 42, 'coercibleObject with hint String coerces to nonstringified toString');
		st.equal(ToPrimitive({}, String), '[object Object]', '{} with hint String coerces to Object#toString');
		st.equal(ToPrimitive(v.coercibleFnObject), v.coercibleFnObject.toString(), 'coercibleFnObject coerces to toString');
		st.equal(ToPrimitive(v.toStringOnlyObject), 7, 'toStringOnlyObject returns non-stringified toString');
		st.equal(ToPrimitive(v.valueOfOnlyObject), 4, 'valueOfOnlyObject returns valueOf');

		st['throws'](function () { return ToPrimitive(v.uncoercibleObject); }, TypeError, 'uncoercibleObject throws a TypeError');
		st['throws'](function () { return ToPrimitive(v.uncoercibleFnObject); }, TypeError, 'uncoercibleFnObject throws a TypeError');

		st.end();
	});

	t.test('dates', function (st) {
		var invalid = new Date(NaN);
		st.equal(ToPrimitive(invalid), Date.prototype.toString.call(invalid), 'invalid Date coerces to Date#toString');

		var now = new Date();
		st.equal(ToPrimitive(now), Date.prototype.toString.call(now), 'Date coerces to Date#toString');

		st.end();
	});
};

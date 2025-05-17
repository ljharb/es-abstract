'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, OrdinaryToPrimitive) {
	t.ok(year >= 2017, 'ES2017+');

	forEach(v.primitives, function (primitive) {
		t['throws'](
			function () { OrdinaryToPrimitive(primitive, 'string'); },
			TypeError,
			debug(primitive) + ' is not Object'
		);

		if (primitive != null) {
			t.equal(
				OrdinaryToPrimitive(Object(primitive), 'number'),
				primitive,
				debug(Object(primitive)) + ' becomes ' + debug(primitive)
			);
		}
	});

	forEach(v.nonStrings, function (nonString) {
		if (typeof nonString !== 'number') {
			t['throws'](
				function () { OrdinaryToPrimitive({}, nonString); },
				TypeError,
				debug(nonString) + ' is not a String or a Number'
			);
		}
	});

	t.test('Symbols', { skip: !v.hasSymbols }, function (st) {
		forEach(v.symbols, function (sym) {
			st.equal(
				OrdinaryToPrimitive(Object(sym), 'string'),
				Symbol.prototype.toString.call(sym),
				debug(Object(sym)) + ' with hint "string" returns ' + debug(Symbol.prototype.toString.call(sym))
			);
			st.equal(
				OrdinaryToPrimitive(Object(sym), 'number'),
				sym,
				debug(Object(sym)) + ' with hint "number" returns ' + debug(sym)
			);
		});

		var primitiveSym = Symbol('primitiveSym');
		var objectSym = Object(primitiveSym);
		st.equal(
			OrdinaryToPrimitive(objectSym, 'string'),
			Symbol.prototype.toString.call(primitiveSym),
			debug(objectSym) + ' with hint "string" returns ' + debug(Symbol.prototype.toString.call(primitiveSym))
		);
		st.equal(
			OrdinaryToPrimitive(objectSym, 'number'),
			primitiveSym,
			debug(objectSym) + ' with hint "number" returns ' + debug(primitiveSym)
		);

		st.end();
	});

	t.test('Arrays', function (st) {
		var arrays = [[], ['a', 'b'], [1, 2]];

		forEach(arrays, function (arr) {
			st.equal(OrdinaryToPrimitive(arr, 'string'), String(arr), debug(arr) + ' with hint "string" returns the string version of the array');
			st.equal(OrdinaryToPrimitive(arr, 'number'), String(arr), debug(arr) + ' with hint "number" returns the string version of the array');
		});

		st.end();
	});

	t.test('Dates', function (st) {
		var dates = [new Date(), new Date(0), new Date(NaN)];

		forEach(dates, function (date) {
			st.equal(OrdinaryToPrimitive(date, 'string'), String(date), debug(date) + ' with hint "string" returns the string version of the date');
			st.equal(OrdinaryToPrimitive(date, 'number'), Number(date), debug(date) + ' with hint "number" returns the number version of the date');
		});

		st.end();
	});

	t.test('Objects', function (st) {
		st.equal(OrdinaryToPrimitive(v.coercibleObject, 'number'), v.coercibleObject.valueOf(), 'coercibleObject with hint "number" coerces to valueOf');
		st.equal(OrdinaryToPrimitive(v.coercibleObject, 'string'), v.coercibleObject.toString(), 'coercibleObject with hint "string" coerces to non-stringified toString');

		st.equal(OrdinaryToPrimitive(v.coercibleFnObject, 'number'), v.coercibleFnObject.toString(), 'coercibleFnObject with hint "number" coerces to non-stringified toString');
		st.equal(OrdinaryToPrimitive(v.coercibleFnObject, 'string'), v.coercibleFnObject.toString(), 'coercibleFnObject with hint "string" coerces to non-stringified toString');

		st.equal(OrdinaryToPrimitive({}, 'number'), '[object Object]', '{} with hint "number" coerces to Object#toString');
		st.equal(OrdinaryToPrimitive({}, 'string'), '[object Object]', '{} with hint "string" coerces to Object#toString');

		st.equal(OrdinaryToPrimitive(v.toStringOnlyObject, 'number'), v.toStringOnlyObject.toString(), 'toStringOnlyObject with hint "number" returns non-stringified toString');
		st.equal(OrdinaryToPrimitive(v.toStringOnlyObject, 'string'), v.toStringOnlyObject.toString(), 'toStringOnlyObject with hint "string" returns non-stringified toString');

		st.equal(OrdinaryToPrimitive(v.valueOfOnlyObject, 'number'), v.valueOfOnlyObject.valueOf(), 'valueOfOnlyObject with hint "number" returns valueOf');
		st.equal(OrdinaryToPrimitive(v.valueOfOnlyObject, 'string'), v.valueOfOnlyObject.valueOf(), 'valueOfOnlyObject with hint "string" returns non-stringified valueOf');

		st.test('exceptions', function (s2t) {
			s2t['throws'](function () { OrdinaryToPrimitive(v.uncoercibleObject, 'number'); }, TypeError, 'uncoercibleObject with hint "number" throws a TypeError');
			s2t['throws'](function () { OrdinaryToPrimitive(v.uncoercibleObject, 'string'); }, TypeError, 'uncoercibleObject with hint "string" throws a TypeError');

			s2t['throws'](function () { OrdinaryToPrimitive(v.uncoercibleFnObject, 'number'); }, TypeError, 'uncoercibleFnObject with hint "number" throws a TypeError');
			s2t['throws'](function () { OrdinaryToPrimitive(v.uncoercibleFnObject, 'string'); }, TypeError, 'uncoercibleFnObject with hint "string" throws a TypeError');

			s2t.end();
		});
		st.end();
	});
};

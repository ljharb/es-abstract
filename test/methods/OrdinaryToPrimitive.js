'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var specEnum = require('../../helpers/specEnum');

module.exports = function (t, year, OrdinaryToPrimitive) {
	t.ok(year >= 2017, 'ES2017+');

	var STRING = specEnum(year, 'string');
	var NUMBER = specEnum(year, 'number');

	forEach(v.primitives, function (primitive) {
		t['throws'](
			function () { OrdinaryToPrimitive(primitive, STRING); },
			TypeError,
			debug(primitive) + ' is not Object'
		);

		if (primitive != null) {
			t.equal(
				OrdinaryToPrimitive(Object(primitive), NUMBER),
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
				OrdinaryToPrimitive(Object(sym), STRING),
				Symbol.prototype.toString.call(sym),
				debug(Object(sym)) + ' with hint "string" returns ' + debug(Symbol.prototype.toString.call(sym))
			);
			st.equal(
				OrdinaryToPrimitive(Object(sym), NUMBER),
				sym,
				debug(Object(sym)) + ' with hint "number" returns ' + debug(sym)
			);
		});

		var primitiveSym = Symbol('primitiveSym');
		var objectSym = Object(primitiveSym);
		st.equal(
			OrdinaryToPrimitive(objectSym, STRING),
			Symbol.prototype.toString.call(primitiveSym),
			debug(objectSym) + ' with hint "string" returns ' + debug(Symbol.prototype.toString.call(primitiveSym))
		);
		st.equal(
			OrdinaryToPrimitive(objectSym, NUMBER),
			primitiveSym,
			debug(objectSym) + ' with hint "number" returns ' + debug(primitiveSym)
		);

		st.end();
	});

	t.test('Arrays', function (st) {
		var arrays = [[], ['a', 'b'], [1, 2]];

		forEach(arrays, function (arr) {
			st.equal(OrdinaryToPrimitive(arr, STRING), String(arr), debug(arr) + ' with hint "string" returns the string version of the array');
			st.equal(OrdinaryToPrimitive(arr, NUMBER), String(arr), debug(arr) + ' with hint "number" returns the string version of the array');
		});

		st.end();
	});

	t.test('Dates', function (st) {
		var dates = [new Date(), new Date(0), new Date(NaN)];

		forEach(dates, function (date) {
			st.equal(OrdinaryToPrimitive(date, STRING), String(date), debug(date) + ' with hint "string" returns the string version of the date');
			st.equal(OrdinaryToPrimitive(date, NUMBER), Number(date), debug(date) + ' with hint "number" returns the number version of the date');
		});

		st.end();
	});

	t.test('Objects', function (st) {
		st.equal(OrdinaryToPrimitive(v.coercibleObject, NUMBER), v.coercibleObject.valueOf(), 'coercibleObject with hint "number" coerces to valueOf');
		st.equal(OrdinaryToPrimitive(v.coercibleObject, STRING), v.coercibleObject.toString(), 'coercibleObject with hint "string" coerces to non-stringified toString');

		st.equal(OrdinaryToPrimitive(v.coercibleFnObject, NUMBER), v.coercibleFnObject.toString(), 'coercibleFnObject with hint "number" coerces to non-stringified toString');
		st.equal(OrdinaryToPrimitive(v.coercibleFnObject, STRING), v.coercibleFnObject.toString(), 'coercibleFnObject with hint "string" coerces to non-stringified toString');

		st.equal(OrdinaryToPrimitive({}, NUMBER), '[object Object]', '{} with hint "number" coerces to Object#toString');
		st.equal(OrdinaryToPrimitive({}, STRING), '[object Object]', '{} with hint "string" coerces to Object#toString');

		st.equal(OrdinaryToPrimitive(v.toStringOnlyObject, NUMBER), v.toStringOnlyObject.toString(), 'toStringOnlyObject with hint "number" returns non-stringified toString');
		st.equal(OrdinaryToPrimitive(v.toStringOnlyObject, STRING), v.toStringOnlyObject.toString(), 'toStringOnlyObject with hint "string" returns non-stringified toString');

		st.equal(OrdinaryToPrimitive(v.valueOfOnlyObject, NUMBER), v.valueOfOnlyObject.valueOf(), 'valueOfOnlyObject with hint "number" returns valueOf');
		st.equal(OrdinaryToPrimitive(v.valueOfOnlyObject, STRING), v.valueOfOnlyObject.valueOf(), 'valueOfOnlyObject with hint "string" returns non-stringified valueOf');

		st.test('exceptions', function (s2t) {
			s2t['throws'](function () { OrdinaryToPrimitive(v.uncoercibleObject, NUMBER); }, TypeError, 'uncoercibleObject with hint "number" throws a TypeError');
			s2t['throws'](function () { OrdinaryToPrimitive(v.uncoercibleObject, STRING); }, TypeError, 'uncoercibleObject with hint "string" throws a TypeError');

			s2t['throws'](function () { OrdinaryToPrimitive(v.uncoercibleFnObject, NUMBER); }, TypeError, 'uncoercibleFnObject with hint "number" throws a TypeError');
			s2t['throws'](function () { OrdinaryToPrimitive(v.uncoercibleFnObject, STRING); }, TypeError, 'uncoercibleFnObject with hint "string" throws a TypeError');

			s2t.end();
		});
		st.end();
	});
};

'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');

module.exports = function (t, year, ToBoolean) {
	t.ok(year >= 5, 'ES5+');

	t.equal(false, ToBoolean(undefined), 'undefined coerces to false');
	t.equal(false, ToBoolean(null), 'null coerces to false');
	t.equal(false, ToBoolean(false), 'false returns false');
	t.equal(true, ToBoolean(true), 'true returns true');

	t.test('numbers', function (st) {
		forEach(v.zeroes.concat(NaN), function (falsyNumber) {
			st.equal(false, ToBoolean(falsyNumber), 'falsy number ' + falsyNumber + ' coerces to false');
		});
		forEach([].concat(
			v.infinities,
			42,
			1
		), function (truthyNumber) {
			st.equal(true, ToBoolean(truthyNumber), 'truthy number ' + truthyNumber + ' coerces to true');
		});

		st.end();
	});

	t.equal(false, ToBoolean(''), 'empty string coerces to false');
	t.equal(true, ToBoolean('foo'), 'nonempty string coerces to true');

	t.test('objects', function (st) {
		forEach(v.objects, function (obj) {
			st.equal(true, ToBoolean(obj), 'object coerces to true');
		});
		st.equal(true, ToBoolean(v.uncoercibleObject), 'uncoercibleObject coerces to true');

		st.end();
	});
};

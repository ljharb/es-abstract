'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');

module.exports = function (t, year, ToObject) {
	t.ok(year >= 5, 'ES5+');

	t['throws'](function () { return ToObject(undefined); }, TypeError, 'undefined throws');
	t['throws'](function () { return ToObject(null); }, TypeError, 'null throws');

	forEach(v.numbers, function (number) {
		var obj = ToObject(number);
		t.equal(typeof obj, 'object', 'number ' + number + ' coerces to object');
		t.equal(true, obj instanceof Number, 'object of ' + number + ' is Number object');
		t.equal(obj.valueOf(), number, 'object of ' + number + ' coerces to ' + number);
	});
};

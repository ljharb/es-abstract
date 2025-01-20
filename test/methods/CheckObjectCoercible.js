'use strict';

var debug = require('object-inspect');
var forEach = require('for-each');
var v = require('es-value-fixtures');

module.exports = function (t, year, CheckObjectCoercible) {
	t.equal(year, 5, 'CheckObjectCoercible -> RequireObjectCoercible in ES6');

	t['throws'](function () { return CheckObjectCoercible(undefined); }, TypeError, 'undefined throws');
	t['throws'](function () { return CheckObjectCoercible(null); }, TypeError, 'null throws');

	forEach([].concat(
		v.objects,
		v.nonNullPrimitives
	), function (value) {
		t.doesNotThrow(function () { return CheckObjectCoercible(value); }, debug(value) + ' does not throw');
	});
};

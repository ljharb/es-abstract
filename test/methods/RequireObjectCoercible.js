'use strict';

var debug = require('object-inspect');
var forEach = require('for-each');
var v = require('es-value-fixtures');

module.exports = function (t, year, RequireObjectCoercible) {
	t.ok(year >= 2015, 'ES2015+');

	t['throws'](function () { return RequireObjectCoercible(undefined); }, TypeError, 'undefined throws');
	t['throws'](function () { return RequireObjectCoercible(null); }, TypeError, 'null throws');

	forEach([].concat(
		v.objects,
		v.nonNullPrimitives
	), function (value) {
		t.doesNotThrow(function () { return RequireObjectCoercible(value); }, debug(value) + ' does not throw');
	});
};

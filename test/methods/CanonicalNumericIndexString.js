'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'CanonicalNumericIndexString'>} */
module.exports = function (t, year, CanonicalNumericIndexString) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.nonStrings, function (notString) {
		t['throws'](
			// @ts-expect-error
			function () { return CanonicalNumericIndexString(notString); },
			TypeError,
			debug(notString) + ' is not a string'
		);
	});

	t.equal(CanonicalNumericIndexString('-0'), -0, '"-0" returns -0');
	for (var i = -50; i < 50; i += 10) {
		t.equal(i, CanonicalNumericIndexString(String(i)), '"' + i + '" returns ' + i);
		t.equal(undefined, CanonicalNumericIndexString(String(i) + 'a'), '"' + i + 'a" returns undefined');
	}
};

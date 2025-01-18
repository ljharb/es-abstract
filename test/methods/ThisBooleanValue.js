'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'ThisBooleanValue' | 'thisBooleanValue'>} */
module.exports = function (t, year, ThisBooleanValue) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.nonBooleans, function (nonBoolean) {
		t['throws'](
			// @ts-expect-error
			function () { ThisBooleanValue(nonBoolean); },
			TypeError,
			debug(nonBoolean) + ' is not a Boolean'
		);
	});

	forEach(v.booleans, function (boolean) {
		t.equal(ThisBooleanValue(boolean), boolean, debug(boolean) + ' is its own thisBooleanValue');
		var obj = Object(boolean);
		t.equal(ThisBooleanValue(obj), boolean, debug(obj) + ' is the boxed thisBooleanValue');
	});
};

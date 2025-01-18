'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'CreateIterResultObject'>} */
module.exports = function (t, year, CreateIterResultObject) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.nonBooleans, function (nonBoolean) {
		t['throws'](
			// @ts-expect-error
			function () { CreateIterResultObject({}, nonBoolean); },
			TypeError,
			'"done" argument must be a boolean; ' + debug(nonBoolean) + ' is not'
		);
	});

	var value = {};
	t.deepEqual(
		CreateIterResultObject(value, true),
		{ value: value, done: true },
		'creates a "done" iteration result'
	);
	t.deepEqual(
		CreateIterResultObject(value, false),
		{ value: value, done: false },
		'creates a "not done" iteration result'
	);
};

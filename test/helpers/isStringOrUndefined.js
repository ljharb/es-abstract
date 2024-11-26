'use strict';

var test = require('tape');
var v = require('es-value-fixtures');
var inspect = require('object-inspect');

var forEach = require('../../helpers/forEach');

var isStringOrUndefined = require('../../helpers/isStringOrUndefined');

test('isStringOrUndefined', function (t) {
	t.ok(isStringOrUndefined('foo'), 'string is a string or undefined');

	t.ok(isStringOrUndefined(undefined), 'undefined is a string or undefined');

	forEach(v.primitives, function (primitive) {
		if (typeof primitive !== 'undefined' && typeof primitive !== 'string') {
			t.notOk(isStringOrUndefined(primitive), inspect(primitive) + ' is not a string or undefined');
		}
	});

	t.end();
});

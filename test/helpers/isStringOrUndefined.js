'use strict';

var test = require('tape');

var isStringOrUndefined = require('../../helpers/isStringOrUndefined');

test('isStringOrUndefined', function (t) {
	t.ok(isStringOrUndefined('foo', 0, ['foo', 'bar', 'baz']), 'string item is a string or undefined');

	t.ok(isStringOrUndefined(undefined, 0, [undefined, 'bar', 'baz']), 'present undefined item is a string or undefined');

	t.end();
});

'use strict';

var test = require('tape');

var isLineTerminator = require('../../helpers/isLineTerminator');

test('isLineTerminator', function (t) {
	t.equal(typeof isLineTerminator, 'function', 'isLineTerminator is a function');

	t.notOk(isLineTerminator('a'), 'a is not a line terminator');

	t.ok(isLineTerminator('\n'), '\\n is not a line terminator');
	t.ok(isLineTerminator('\r'), '\\r is not a line terminator');
	t.ok(isLineTerminator('\u2028'), '\\u2028 is not a line terminator');
	t.ok(isLineTerminator('\u2029'), '\\u2029 is not a line terminator');

	t.end();
});

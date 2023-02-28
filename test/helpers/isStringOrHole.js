'use strict';

var test = require('tape');

var isStringOrHole = require('../../helpers/isStringOrHole');

var canDistinguishSparseFromUndefined = 0 in [undefined]; // IE 6 - 8 have a bug where this returns false

test('isStringOrHole', function (t) {
	t.ok(isStringOrHole('foo', 0, ['foo', 'bar', 'baz']), 'string item is a string or a hole');

	t.equal(
		isStringOrHole(undefined, 0, [undefined, 'bar', 'baz']),
		!canDistinguishSparseFromUndefined,
		'present undefined item is ' + (canDistinguishSparseFromUndefined ? 'not a hole' : 'a hole, this is IE 6 - 8')
	);

	t.equal(
		isStringOrHole(undefined, 0, [, 'bar', 'baz']), // eslint-disable-line no-sparse-arrays
		canDistinguishSparseFromUndefined,
		'missing item is ' + (canDistinguishSparseFromUndefined ? 'a hole' : 'not a hole, this is IE 6 - 8')
	);

	t.end();
});

'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, AsyncFromSyncIteratorContinuation) {
	t.ok(year >= 2019, 'ES2019+');

	forEach(v.primitives, function (primitive) {
		t['throws'](
			function () { AsyncFromSyncIteratorContinuation(primitive); },
			TypeError,
			debug(primitive) + ' is not an Object'
		);
	});

	t['throws'](
		function () { AsyncFromSyncIteratorContinuation({}, null); },
		SyntaxError,
		'despite the spec supporting 2 args, AsyncFromSyncIteratorContinuation only takes 1'
	);

	// TODO: test directly, instead of only implicitly via CreateAsyncFromSyncIterator
};

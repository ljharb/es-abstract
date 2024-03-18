'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');

module.exports = function (t, year, GetIteratorDirect) {
	t.ok(year >= 2025, 'ES2025+');

	forEach(v.primitives, function (nonObject) {
		t['throws'](
			function () { GetIteratorDirect(nonObject); },
			TypeError,
			debug(nonObject) + ' is not an object'
		);
	});

	var nextMethod = { nextMethod: true };
	var obj = { next: nextMethod };
	t.deepEqual(
		GetIteratorDirect(obj),
		{
			'[[Iterator]]': obj,
			'[[NextMethod]]': nextMethod,
			'[[Done]]': false
		}
	);
};

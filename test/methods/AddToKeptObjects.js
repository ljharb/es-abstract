'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, AddToKeptObjects) {
	t.ok(year >= 2021, 'ES2021+');

	forEach(v.primitives, function (nonObject) {
		t['throws'](
			function () { AddToKeptObjects(nonObject); },
			debug(nonObject) + ' is not an Object'
		);
	});

	t.equal(AddToKeptObjects({}), undefined, 'returns nothing');
};

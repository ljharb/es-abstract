'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, GetIteratorFromMethod) {
	t.ok(year >= 2023, 'ES2023+');

	forEach(v.nonFunctions, function (nonCallable) {
		t['throws'](
			function () { GetIteratorFromMethod(null, nonCallable); },
			TypeError,
			debug(nonCallable) + ' is not callable'
		);
	});

	var sentinel = {};

	forEach(v.primitives, function (nonObject) {
		t['throws'](
			function () { GetIteratorFromMethod(sentinel, function () { return nonObject; }); },
			TypeError,
			'method return value, ' + debug(nonObject) + ', is not an object'
		);
	});

	var iterator = {
		next: function next() {

		}
	};
	var iteratorRecord = GetIteratorFromMethod(sentinel, function () {
		t.equal(this, sentinel, 'method is called with the correct this value');
		t.equal(arguments.length, 0, 'method is called with no arguments');

		return iterator;
	});

	t.deepEqual(
		iteratorRecord,
		{
			'[[Iterator]]': iterator,
			'[[NextMethod]]': iterator.next,
			'[[Done]]': false
		},
		'iterator record is correct'
	);
};

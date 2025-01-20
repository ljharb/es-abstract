'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var makeIteratorRecord = require('../helpers/makeIteratorRecord');

module.exports = function (t, year, IteratorNext) {
	t.ok(year >= 2015, 'ES2015+');

	var unwrap = function (iteratorRecord) {
		return year >= 2023 ? iteratorRecord : iteratorRecord['[[Iterator]]'];
	};

	forEach(v.primitives, function (nonObject) {
		t['throws'](
			function () { IteratorNext(nonObject); },
			TypeError,
			debug(nonObject) + ' is not an Object'
		);

		t['throws'](
			function () { IteratorNext(unwrap(makeIteratorRecord({ next: function () { return nonObject; } }))); },
			TypeError,
			'`next()` returns ' + debug(nonObject) + ', which is not an Object'
		);
	});

	forEach(v.nonFunctions, function (nonFunction) {
		t['throws'](
			function () { IteratorNext(unwrap(makeIteratorRecord({ next: nonFunction }))); },
			TypeError,
			'`next` of ' + debug(nonFunction) + ' is not a function'
		);
	});

	var iterator = {
		next: function (value) {
			return [arguments.length, value];
		}
	};
	t.deepEqual(
		IteratorNext(unwrap(makeIteratorRecord(iterator))),
		[0, undefined],
		'returns expected value from `.next()`; `next` receives expected 0 arguments'
	);
	t.deepEqual(
		IteratorNext(unwrap(makeIteratorRecord(iterator)), iterator),
		[1, iterator],
		'returns expected value from `.next()`; `next` receives expected 1 argument'
	);

	//

	forEach(v.primitives, function (nonObject) {
		t['throws'](
			function () { IteratorNext(nonObject); },
			TypeError,
			debug(nonObject) + ' is not an Object'
		);

		t['throws'](
			function () {
				IteratorNext(unwrap(makeIteratorRecord({
					next: function () { return nonObject; }
				})));
			},
			TypeError,
			'`next()` returns ' + debug(nonObject) + ', which is not an Object'
		);
	});

	var iterator2 = makeIteratorRecord({
		next: function (value) {
			return [arguments.length, value];
		}
	});
	t.deepEqual(
		IteratorNext(unwrap(iterator2)),
		[0, undefined],
		'returns expected value from `.next()`; `next` receives expected 0 arguments'
	);
	t.deepEqual(
		IteratorNext(unwrap(iterator2), iterator2),
		[1, iterator2],
		'returns expected value from `.next()`; `next` receives expected 1 argument'
	);
};

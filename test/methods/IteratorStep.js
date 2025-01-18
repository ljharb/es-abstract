'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var makeIteratorRecord = require('../helpers/makeIteratorRecord');
var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'IteratorStep'>} */
module.exports = function (t, year, IteratorStep) {
	t.ok(year >= 2015, 'ES2015+');

	/** @type {<T>(iteratorRecord: import('../../types').IteratorRecord<T>) => import('../../types').IteratorRecord<T> | Iterator<T>} */
	var unwrap = function (iteratorRecord) {
		return year >= 2023 ? iteratorRecord : iteratorRecord['[[Iterator]]'];
	};

	forEach(esV.unknowns, function (nonIteratorRecord) {
		t['throws'](
			// @ts-expect-error
			function () { IteratorStep(nonIteratorRecord); },
			TypeError,
			debug(nonIteratorRecord) + ' is not an Iterator Record'
		);
	});

	var iterator = {
		next: function () {
			return {
				done: false,
				value: [1, arguments.length]
			};
		}
	};
	t.deepEqual(
		IteratorStep(unwrap(makeIteratorRecord(iterator))),
		{ done: false, value: [1, 0] },
		'not-done iterator result yields iterator result'
	);

	var iterator2 = {
		next: function () {
			return {
				done: true,
				value: [2, arguments.length]
			};
		}
	};
	t.deepEqual(
		IteratorStep(unwrap(makeIteratorRecord(iterator2))),
		false,
		'done iterator result yields false'
	);
};

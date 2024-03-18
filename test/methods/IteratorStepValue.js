'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var $defineProperty = require('es-define-property');

var makeIteratorRecord = require('../helpers/makeIteratorRecord');
var esV = require('../helpers/v');

module.exports = function (t, year, IteratorStepValue) {
	t.ok(year >= 2024, 'ES2024+');

	forEach(esV.unknowns, function (nonIteratorRecord) {
		t['throws'](
			function () { IteratorStepValue(nonIteratorRecord); },
			TypeError,
			debug(nonIteratorRecord) + ' is not an Iterator Record'
		);
	});

	var done = year >= 2025 ? false : 'DONE';

	t.test('sync iterator record', function (st) {
		var i = 0;
		var iterator = {
			next: function next(x) {
				try {
					return {
						done: i > 2,
						value: [i, arguments.length, x]
					};
				} finally {
					i += 1;
				}
			}
		};
		var syncIteratorRecord = makeIteratorRecord(iterator);

		st.deepEqual(IteratorStepValue(syncIteratorRecord), [0, 0, undefined], 'first yield');
		st.deepEqual(IteratorStepValue(syncIteratorRecord), [1, 0, undefined], 'second yield');
		st.deepEqual(IteratorStepValue(syncIteratorRecord), [2, 0, undefined], 'third yield');
		st.deepEqual(IteratorStepValue(syncIteratorRecord), done, 'fourth yield');
		st.deepEqual(IteratorStepValue(syncIteratorRecord), done, 'fifth yield');

		st.end();
	});

	var sentinel = {};
	t.test('next throws', function (st) {
		var iterator = {
			next: function next() {
				throw sentinel;
			}
		};
		var syncIteratorRecord = makeIteratorRecord(iterator);

		st.equal(syncIteratorRecord['[[Done]]'], false);
		try {
			IteratorStepValue(syncIteratorRecord);
			st.fail('did not throw');
		} catch (e) {
			st.equal(e, sentinel, 'when next throws, it is rethrown');
		}
		st.equal(syncIteratorRecord['[[Done]]'], true);

		st.end();
	});

	t.test('.done throws', { skip: !$defineProperty }, function (st) {
		var result = {};
		$defineProperty(result, 'done', {
			configurable: true,
			enumerable: true,
			get: function () {
				throw sentinel;
			}
		});
		var iterator = {
			next: function () {
				return result;
			}
		};
		var syncIteratorRecord = makeIteratorRecord(iterator);

		st.equal(syncIteratorRecord['[[Done]]'], false);
		try {
			IteratorStepValue(syncIteratorRecord);
			st.fail('did not throw');
		} catch (e) {
			st.equal(e, sentinel, 'when .done throws, it is rethrown');
		}
		st.equal(syncIteratorRecord['[[Done]]'], true);

		st.end();
	});

	t.test('.value throws', { skip: !$defineProperty }, function (st) {
		var result = { done: false };
		$defineProperty(result, 'value', {
			configurable: true,
			enumerable: true,
			get: function () {
				throw sentinel;
			}
		});
		var iterator = {
			next: function () {
				return result;
			}
		};
		var syncIteratorRecord = makeIteratorRecord(iterator);

		st.equal(syncIteratorRecord['[[Done]]'], false);
		try {
			IteratorStepValue(syncIteratorRecord);
			st.fail('did not throw');
		} catch (e) {
			st.equal(e, sentinel, 'when .value throws, it is rethrown');
		}
		st.equal(syncIteratorRecord['[[Done]]'], true);

		st.end();
	});

	t.test('conflated sentinel value', function (st) {
		var i = 0;
		var iterator = {
			next: function next() {
				try {
					return {
						done: i > 2,
						value: i > 0 ? i : done
					};
				} finally {
					i += 1;
				}
			}
		};
		var syncIteratorRecord = makeIteratorRecord(iterator);

		st.deepEqual(IteratorStepValue(syncIteratorRecord), done, 'first yield');
		st.deepEqual(IteratorStepValue(syncIteratorRecord), 1, 'second yield');
		st.deepEqual(IteratorStepValue(syncIteratorRecord), 2, 'third yield');
		st.deepEqual(IteratorStepValue(syncIteratorRecord), done, 'fourth yield');
		st.deepEqual(IteratorStepValue(syncIteratorRecord), done, 'fifth yield');

		st.end();
	});
};

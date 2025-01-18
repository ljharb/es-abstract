'use strict';

var debug = require('object-inspect');
var forEach = require('for-each');
var v = require('es-value-fixtures');

var testIterator = require('../helpers/testIterator');
var testAsyncIterator = require('../helpers/testAsyncIterator');
var makeIteratorRecord = require('../helpers/makeIteratorRecord');

/** @type {import('../testHelpers').MethodTest<'GetIterator'>} */
module.exports = function (t, year, actual) {
	t.ok(year >= 2015, 'ES2015+');

	var arr = [1, 2];
	/** @type {<T>(result: Iterator<T> | import('../../types').IteratorRecord<T>) => Iterator<T>} */
	var unwrap = function (result) {
		return year >= 2023 ? result['[[Iterator]]'] : result;
	};
	var GetIterator = year >= 2020 ? actual : function GetIterator(obj, hint, method) {
		if (arguments.length > 2) {
			return actual(obj, method);
		}
		return actual(obj);
	};

	var hintS = year < 2024 ? /** @type {const} */ ('sync') : /** @type {const} */ ('SYNC');
	var hintA = year < 2024 ? /** @type {const} */ ('async') : /** @type {const} */ ('ASYNC');

	testIterator(t, unwrap(GetIterator(arr, hintS)), arr);

	testIterator(t, unwrap(GetIterator('abc', hintS)), 'abc'.split(''));

	var sentinel = {};
	forEach(v.primitives, function (nonObject) {
		var method = function () {
			return nonObject;
		};
		t['throws'](
			function () { GetIterator(sentinel, hintS, method); },
			TypeError,
			debug(nonObject) + ' is not an Object; iterator method must return an Object'
		);
	});

	var i = 0;
	/** @type {<T>(this: unknown) => Iterator<T>} */
	var manualMethod = function () {
		t.equal(this, sentinel, 'receiver is expected object');
		return {
			next: function () {
				var value = arr[i];
				i += 1;
				return {
					done: i > arr.length,
					value: value
				};
			}
		};
	};
	if (year >= 2023 && v.hasSymbols) {
		sentinel[Symbol.iterator] = manualMethod;
		testIterator(t, unwrap(GetIterator(sentinel, hintS, manualMethod)), arr);
	}

	t.test('Symbol.iterator', { skip: !v.hasSymbols }, function (st) {
		var m = new Map();
		m.set(1, 'a');
		m.set(2, 'b');

		testIterator(st, unwrap(GetIterator(m, hintS)), [[1, 'a'], [2, 'b']]);

		forEach(v.primitives, function (nonObject) {
			var badIterable = {};
			badIterable[Symbol.iterator] = function () {
				return nonObject;
			};
			st['throws'](
				function () { GetIterator(unwrap(badIterable), hintS); },
				TypeError,
				debug(nonObject) + ' is not an Object; iterator method must return an Object'
			);
		});

		st.end();
	});

	if (year >= 2020) {
		try {
			GetIterator({}, 'null');
		} catch (e) {
			t.ok(e.message.indexOf('Assertion failed: `hint` must be one of \'sync\' or \'async\'' >= 0));
		}

		t.test('no Symbol.asyncIterator', { skip: !v.hasSymbols || Symbol.asyncIterator }, function (st) {
			if (year < 2023) {
				st['throws'](
					function () { GetIterator(arr, hintA); },
					SyntaxError,
					'async from sync iterators are not currently supported'
				);

				st.end();
			} else {
				return testAsyncIterator(st, GetIterator(arr, hintA), arr);
			}
			return void undefined;
		});

		t.test('Symbol.asyncIterator', { skip: !v.hasSymbols || !Symbol.asyncIterator }, function (st) {
			if (year < 2024) {
				try {
					GetIterator(arr, hintA);
				} catch (e) {
					st.ok(e.message.indexOf("async from sync iterators aren't currently supported") >= 0);
				}
			}

			var it = {
				next: function () {
					return Promise.resolve({
						done: true
					});
				}
			};
			var obj = {};
			obj[Symbol.asyncIterator] = function () {
				return it;
			};

			st.deepEqual(GetIterator(obj, hintA), year >= 2023 ? makeIteratorRecord(it) : it);

			forEach(v.primitives, function (primitive) {
				var badObj = {};
				badObj[Symbol.asyncIterator] = function () {
					return primitive;
				};

				st['throws'](
					function () { GetIterator(badObj, hintA); },
					TypeError,
					debug(primitive) + ' is not an Object'
				);
			});

			st.end();
		});
	}

	if (year >= 2023) {
		t['throws'](
			function () { GetIterator({}, hintS); },
			TypeError,
			'sync hint: undefined iterator method throws'
		);

		t['throws'](
			function () { GetIterator({}, hintA); },
			TypeError,
			'async hint: undefined iterator method throws'
		);

		t.test('Symbol.iterator', { skip: !v.hasSymbols }, function (st) {
			var m = new Map();
			m.set(1, 'a');
			m.set(2, 'b');

			var syncRecord = GetIterator(m, hintS);
			testIterator(st, syncRecord['[[Iterator]]'], [[1, 'a'], [2, 'b']]);

			var asyncRecord = GetIterator(m, hintA);
			return testAsyncIterator(st, asyncRecord['[[Iterator]]'], [[1, 'a'], [2, 'b']]);
		});

		t.test('Symbol.asyncIterator', { skip: !v.hasSymbols || !Symbol.asyncIterator }, function (st) {
			st.test('an async iteratable returning a sync iterator', function (s2t) {
				var it = {
					next: function nextFromTest() {
						return Promise.resolve({
							done: true
						});
					}
				};
				var obj = {};
				obj[Symbol.asyncIterator] = function () {
					return it;
				};

				var asyncIterator = GetIterator(obj, hintA);

				s2t.deepEqual(asyncIterator, makeIteratorRecord(it));

				s2t.end();
			});

			st.test('a throwing async iterator', function (s2t) {
				var asyncIterable = {};
				asyncIterable[Symbol.asyncIterator] = function () {
					var j = 0;
					return {
						next: function next() {
							if (j > 4) {
								throw sentinel;
							}
							try {
								return {
									done: j > 5,
									value: j
								};
							} finally {
								j += 1;
							}
						}
					};
				};
				var iteratorRecord = GetIterator(asyncIterable, hintA);
				return testAsyncIterator(
					s2t,
					iteratorRecord['[[Iterator]]'],
					[0, 1, 2, 3, 4, 5]
				)['catch'](function (e) {
					if (e !== sentinel) {
						throw e;
					}
				});
			});

			st.end();
		});
	}
};

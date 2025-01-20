'use strict';

var debug = require('object-inspect');
var forEach = require('for-each');
var keys = require('object-keys');

var esV = require('../helpers/v');
var makeAsyncFromSyncIterator = require('../helpers/makeAsyncFromSyncIterator');
var makeIteratorRecord = require('../helpers/makeIteratorRecord');
var testAsyncIterator = require('../helpers/testAsyncIterator');

module.exports = function (t, year, CreateAsyncFromSyncIterator) {
	t.ok(year >= 2018, 'ES2018+');

	forEach(esV.unknowns, function (nonIteratorRecord) {
		t['throws'](
			function () { CreateAsyncFromSyncIterator(nonIteratorRecord); },
			TypeError,
			debug(nonIteratorRecord) + ' is not an Iterator Record'
		);
	});

	t.test('with Promise support', { skip: typeof Promise === 'undefined' }, function (st) {
		var asyncIteratorRecord = makeAsyncFromSyncIterator(CreateAsyncFromSyncIterator, 5);

		st.deepEqual(
			keys(asyncIteratorRecord).sort(),
			['[[Iterator]]', '[[NextMethod]]', '[[Done]]'].sort(),
			'has expected Iterator Record fields'
		);
		st.equal(typeof asyncIteratorRecord['[[NextMethod]]'], 'function', '[[NextMethod]] is a function');
		st.equal(typeof asyncIteratorRecord['[[Done]]'], 'boolean', '[[Done]] is a boolean');

		var itNoThrow = asyncIteratorRecord['[[Iterator]]'];

		st.test('.next()', function (s2t) {
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

			var record = CreateAsyncFromSyncIterator(syncIteratorRecord);
			var it = record['[[Iterator]]'];
			var next = record['[[NextMethod]]'];

			s2t.test('no next arg', function (s3t) {
				return next.call(it).then(function (result) {
					s3t.deepEqual(
						result,
						{ value: [0, 0, undefined], done: false },
						'result is correct'
					);
				});
			});

			s2t.test('no next arg', function (s3t) {
				return next.call(it, 42).then(function (result) {
					s3t.deepEqual(
						result,
						{ value: [1, 1, 42], done: false },
						'result is correct'
					);
				});
			});

			s2t.end();
		});

		st.test('.throw()', function (s2t) {
			var asyncThrows = makeAsyncFromSyncIterator(
				CreateAsyncFromSyncIterator,
				5,
				function throws(x) {
					s2t.equal(x, arguments.length === 1 ? false : void undefined, '.throw() called with `false`, or nothing');

					throw true; // eslint-disable-line no-throw-literal
				}
			)['[[Iterator]]'];

			var asyncThrowReturnsNonObject = makeAsyncFromSyncIterator(
				CreateAsyncFromSyncIterator,
				5,
				function throws(x) {
					s2t.equal(x, arguments.length === 1 ? false : void undefined, '.throw() called with `false`, or nothing');
				}
			)['[[Iterator]]'];

			var asyncThrowReturnsObject = makeAsyncFromSyncIterator(
				CreateAsyncFromSyncIterator,
				5,
				function throws(x) {
					s2t.equal(x, arguments.length === 1 ? false : void undefined, '.throw() called with `false`, or nothing');

					return {
						done: true,
						value: Promise.resolve(42)
					};
				}
			)['[[Iterator]]'];

			return Promise.all([
				itNoThrow['throw']().then(s2t.fail, s2t.pass), // "pass", since it rejects with `undefined`
				itNoThrow['throw'](true).then(s2t.fail, s2t.ok), // "ok", since it rejects with `true`
				asyncThrows['throw']().then(s2t.fail, s2t.ok), // "ok", since it rejects with `true`
				asyncThrows['throw'](false).then(s2t.fail, s2t.ok), // "ok", since it rejects with `true`
				asyncThrowReturnsNonObject['throw']().then(s2t.fail, s2t.ok), // "ok", since it rejects with an error
				asyncThrowReturnsNonObject['throw'](false).then(s2t.fail, s2t.ok), // "ok", since it rejects with an error
				asyncThrowReturnsObject['throw']().then(function (x) { s2t.deepEqual(x, { done: true, value: 42 }); }),
				asyncThrowReturnsObject['throw'](false).then(function (x) { s2t.deepEqual(x, { done: true, value: 42 }); })
			]);
		});

		st.test('.return()', function (s2t) {
			var asyncThrows = makeAsyncFromSyncIterator(
				CreateAsyncFromSyncIterator,
				5,
				void undefined,
				function returns(x) {
					s2t.equal(x, arguments.length === 1 ? false : void undefined, '.throw() called with `false`, or nothing');

					throw true; // eslint-disable-line no-throw-literal
				}
			)['[[Iterator]]'];

			var asyncThrowReturnsNonObject = makeAsyncFromSyncIterator(
				CreateAsyncFromSyncIterator,
				5,
				void undefined,
				function returns(x) {
					s2t.equal(x, arguments.length === 1 ? false : void undefined, '.throw() called with `false`, or nothing');
				}
			)['[[Iterator]]'];

			var asyncThrowReturnsObject = makeAsyncFromSyncIterator(
				CreateAsyncFromSyncIterator,
				5,
				void undefined,
				function returns(x) {
					s2t.equal(x, arguments.length === 1 ? false : void undefined, '.throw() called with `false`, or nothing');

					return {
						done: true,
						value: Promise.resolve(42)
					};
				}
			)['[[Iterator]]'];

			return Promise.all([
				itNoThrow['return']().then(function (x) { s2t.deepEqual(x, { done: true, value: void undefined }); }),
				itNoThrow['return'](true).then(function (x) { s2t.deepEqual(x, { done: true, value: true }); }),
				asyncThrows['return']().then(s2t.fail, s2t.ok), // "ok", since it rejects with `true`
				asyncThrows['return'](false).then(s2t.fail, s2t.ok), // "ok", since it rejects with `true`
				asyncThrowReturnsNonObject['return']().then(s2t.fail, s2t.ok), // "ok", since it rejects with an error
				asyncThrowReturnsNonObject['return'](false).then(s2t.fail, s2t.ok), // "ok", since it rejects with an error
				asyncThrowReturnsObject['return']().then(function (x) { s2t.deepEqual(x, { done: true, value: 42 }); }),
				asyncThrowReturnsObject['return'](false).then(function (x) { s2t.deepEqual(x, { done: true, value: 42 }); })
			]);
		});

		return testAsyncIterator(st, asyncIteratorRecord['[[Iterator]]'], [0, 1, 2, 3, 4]);
	});
};

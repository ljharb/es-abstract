'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var makeIteratorRecord = require('../helpers/makeIteratorRecord');
var reduce = require('../../helpers/reduce');
var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'AsyncIteratorClose'>} */
module.exports = function (t, year, AsyncIteratorClose, extras) {
	t.ok(year >= 2018, 'ES2018+');

	var NormalCompletion = extras.getAO('NormalCompletion');
	var ThrowCompletion = extras.getAO('ThrowCompletion');

	forEach(esV.unknowns, function (nonIteratorRecord) {
		t['throws'](
			// @ts-expect-error
			function () { AsyncIteratorClose(nonIteratorRecord); },
			TypeError,
			debug(nonIteratorRecord) + ' is not an Iterator Record'
		);
	});

	var iterator = {
		/** @type {() => void} */
		next: function next() {}
	};
	var iteratorRecord = makeIteratorRecord(iterator);

	forEach(esV.unknowns, function (nonCompletionRecord) {
		t['throws'](
			// @ts-expect-error
			function () { AsyncIteratorClose(iteratorRecord, nonCompletionRecord); },
			TypeError,
			debug(nonCompletionRecord) + ' is not a CompletionRecord'
		);
	});

	var sentinel = {};
	var completionRecord = NormalCompletion(sentinel);

	t.test('Promises unsupported', { skip: typeof Promise === 'function' }, function (st) {
		st['throws'](
			function () { AsyncIteratorClose(iteratorRecord, completionRecord); },
			SyntaxError,
			'Promises are not supported'
		);

		st.end();
	});

	t.test('Promises supported', { skip: typeof Promise === 'undefined' }, function (st) {
		st.test('no return method', function (s2t) {
			var nullReturnIterator = {
				next: function next() {},
				'return': null
			};
			var nullReturnIteratorRecord = makeIteratorRecord(nullReturnIterator);

			return Promise.all([
				AsyncIteratorClose(iteratorRecord, completionRecord).then(function (result) {
					s2t.equal(result, completionRecord, 'returns a Promise for the original passed completion record (undefined)');
				}),
				AsyncIteratorClose(nullReturnIteratorRecord, completionRecord).then(function (result) {
					s2t.equal(result, completionRecord, 'returns a Promise for the original passed completion record (null)');
				})
			]);
		});

		st.test('non-function return method', function (s2t) {
			return reduce(
				v.nonFunctions,
				function (prev, nonFunction) {
					if (nonFunction == null) {
						return prev;
					}
					return prev.then(function () {
						var badIterator = {
							next: function next() {},
							'return': nonFunction
						};
						var badIteratorRecord = makeIteratorRecord(badIterator);

						return AsyncIteratorClose(badIteratorRecord, completionRecord).then(
							function (x) {
								throw debug(x) + '/' + debug(nonFunction); // eslint-disable-line no-throw-literal
							},
							function (e) {
								s2t.comment('`.return` of ' + debug(nonFunction) + ' is not a function: ' + e);
							}
						);
					});
				},
				Promise.resolve()
			);
		});

		st.test('function return method (returns object)', function (s2t) {
			var returnableIterator = {
				next: function next() {},
				'return': function Return() {
					s2t.equal(arguments.length, 0, 'no args passed to `.return`');
					return {};
				}
			};
			var returnableRecord = makeIteratorRecord(returnableIterator);

			return AsyncIteratorClose(returnableRecord, completionRecord);
		});

		forEach(v.primitives, function (nonObject) {
			st.test('function return method (returns non-object ' + debug(nonObject) + ')', function (s2t) {
				var returnableIterator = {
					next: function next() {},
					'return': function Return() {
						s2t.equal(arguments.length, 0, 'no args passed to `.return`');
						return nonObject;
					}
				};
				var returnableRecord = makeIteratorRecord(returnableIterator);

				return AsyncIteratorClose(returnableRecord, completionRecord).then(s2t.fail, function (e) {
					s2t.ok(e instanceof TypeError, 'throws on non-object return value');
				});
			});
		});

		st.test('return method throws, completion is normal', function (s2t) {
			var returnThrowIterator = {
				next: function next() {},
				'return': function Return() {
					s2t.equal(arguments.length, 0, 'no args passed to `.return`');
					throw sentinel;
				}
			};
			var returnableRecord = makeIteratorRecord(returnThrowIterator);

			return AsyncIteratorClose(returnableRecord, completionRecord).then(s2t.fail, function (e) {
				s2t.equal(e, sentinel, 'return function exception is propagated');
			});
		});

		st.test('return method throws, completion is throw', function (s2t) {
			var throwCompletion = ThrowCompletion(sentinel);
			var returnThrowIterator = {
				next: function next() {},
				'return': function Return() {
					s2t.equal(arguments.length, 0, 'no args passed to `.return`');
					throw 42; // eslint-disable-line no-throw-literal
				}
			};
			var returnableRecord = makeIteratorRecord(returnThrowIterator);

			return AsyncIteratorClose(returnableRecord, throwCompletion).then(s2t.fail, function (e) {
				s2t.equal(e, sentinel, 'return function exception is overridden by throw completion value');
			});
		});

		st.end();
	});
};

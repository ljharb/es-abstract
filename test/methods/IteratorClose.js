'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var makeIteratorRecord = require('../helpers/makeIteratorRecord');
var throwsSentinel = require('../helpers/throwsSentinel');

/** @type {import('../testHelpers').MethodTest<'IteratorClose'>} */
module.exports = function (t, year, IteratorClose, extras) {
	t.ok(year >= 2015, 'ES2015+');

	var CompletionRecord = extras.getAO('CompletionRecord');
	var NormalCompletion = extras.getAO('NormalCompletion');
	var ThrowCompletion = extras.getAO('ThrowCompletion') || function (reason) {
		return new CompletionRecord('throw', reason);
	};

	var unwrap = /** @param {import('../../types').IteratorRecord<unknown>} iteratorRecord */ function (iteratorRecord) {
		return year >= 2023 ? iteratorRecord : iteratorRecord['[[Iterator]]'];
	};

	forEach(v.primitives, function (nonObject) {
		t['throws'](
			// @ts-expect-error
			function () { IteratorClose(nonObject); },
			TypeError,
			debug(nonObject) + ' is not an Object'
		);

		t['throws'](
			function () {
				IteratorClose(
					unwrap({
						'[[Iterator]]': nonObject,
						'[[Done]]': false,
						'[[NextMethod]]': function () { return {}; }
					}),
					function () {}
				);
			},
			TypeError,
			'[[Iterator]] is ' + debug(nonObject) + ', which is not an Object'
		);

		t['throws'](
			function () {
				IteratorClose(
					unwrap({
						'[[Iterator]]': { 'return': function () { return nonObject; } },
						'[[Done]]': false,
						'[[NextMethod]]': function () { return {}; }
					}),
					function () {}
				);
			},
			TypeError,
			'`.return` returns ' + debug(nonObject) + ', which is not an Object'
		);
	});

	forEach(v.nonFunctions, function (nonFunction) {
		t['throws'](
			function () {
				IteratorClose(
					unwrap(makeIteratorRecord({ next: function () {} })),
					nonFunction
				);
			},
			TypeError,
			debug(nonFunction) + ' is not a thunk for a Completion Record'
		);

		if (nonFunction != null) {
			t['throws'](
				function () {
					IteratorClose(
						unwrap(makeIteratorRecord({ next: function () {}, 'return': nonFunction })),
						function () {}
					);
				},
				TypeError,
				'`.return` of ' + debug(nonFunction) + ' is not a Function'
			);
		}
	});

	var sentinel = {};
	t.equal(
		IteratorClose(
			unwrap(makeIteratorRecord({ next: function () {}, 'return': undefined })),
			function () { return sentinel; }
		),
		sentinel,
		'when `.return` is `undefined`, invokes and returns the completion thunk'
	);
	t.equal(
		IteratorClose(
			unwrap(makeIteratorRecord({ next: function () {}, 'return': undefined })),
			NormalCompletion(sentinel)
		),
		sentinel,
		'when `.return` is `undefined`, invokes and returns the Completion Record'
	);

	/* eslint no-throw-literal: 0 */
	t.assertion(
		throwsSentinel,
		function () {
			IteratorClose(
				unwrap(makeIteratorRecord({
					next: function () {},
					'return': function () { throw sentinel; }
				})),
				function () {}
			);
		},
		sentinel,
		'`.return` that throws, when completionThunk does not, throws exception from `.return`'
	);
	t.assertion(
		throwsSentinel,
		function () {
			IteratorClose(
				unwrap(makeIteratorRecord({
					next: function () {},
					'return': function () { throw sentinel; }
				})),
				NormalCompletion()
			);
		},
		sentinel,
		'`.return` that throws, when Completion Record does not, throws exception from `.return`'
	);

	t.assertion(
		throwsSentinel,
		function () {
			IteratorClose(
				unwrap(makeIteratorRecord({
					next: function () {},
					'return': function () { throw sentinel; }
				})),
				function () { throw -1; }
			);
		},
		-1,
		'`.return` that throws, when completionThunk does too, throws exception from completionThunk'
	);
	t.assertion(
		throwsSentinel,
		function () {
			IteratorClose(
				unwrap(makeIteratorRecord({
					next: function () {},
					'return': function () { throw sentinel; }
				})),
				ThrowCompletion(-1)
			);
		},
		-1,
		'`.return` that throws, when Completion Record does too, throws exception from completionThunk'
	);

	t.assertion(
		throwsSentinel,
		function () {
			IteratorClose(
				unwrap(makeIteratorRecord({
					next: function () {},
					'return': function () {}
				})),
				function () { throw -1; }
			);
		},
		-1,
		'`.return` that does not throw, when completionThunk does, throws exception from completionThunk'
	);
	t.assertion(
		throwsSentinel,
		function () {
			IteratorClose(
				unwrap(makeIteratorRecord({
					next: function () {},
					'return': function () {}
				})),
				ThrowCompletion(-1)
			);
		},
		-1,
		'`.return` that does not throw, when Completion Record does, throws exception from Completion Record'
	);

	t.equal(
		IteratorClose(
			unwrap(makeIteratorRecord({
				next: function () {},
				'return': function () { return sentinel; }
			})),
			function () { return 42; }
		),
		42,
		'when `.return` and completionThunk do not throw, and `.return` returns an Object, returns completionThunk'
	);
	t.equal(
		IteratorClose(
			unwrap(makeIteratorRecord({
				next: function () {},
				'return': function () { return sentinel; }
			})),
			NormalCompletion(42)
		),
		42,
		'when `.return` and Completion Record do not throw, and `.return` returns an Object, returns Completion Record'
	);

	if (year >= 2018) {
		t['throws'](
			function () {
				IteratorClose(
					unwrap(makeIteratorRecord({
						'return': function () { throw sentinel; }
					})),
					function () { throw -1; }
				);
			},
			-1,
			'`.return` that throws, when completionThunk does too, throws exception from completionThunk'
		);
		t['throws'](
			function () {
				IteratorClose(
					unwrap(makeIteratorRecord({
						'return': function () { throw sentinel; }
					})),
					ThrowCompletion(-1)
				);
			},
			-1,
			'`.return` that throws, when Competion Record does too, throws exception from Competion Record'
		);
	}
};

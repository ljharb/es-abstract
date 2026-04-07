'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var esV = require('../helpers/v');

module.exports = function (t, year, IfAbruptCloseIterator, extras) {
	t.ok(year >= 2025, 'ES2025+');

	var sentinel = { sentinel: true };

	var NormalCompletion = extras.getAO('NormalCompletion');
	var ReturnCompletion = extras.getAO('ReturnCompletion');
	var ThrowCompletion = extras.getAO('ThrowCompletion');

	var normalCompletion = NormalCompletion(sentinel);
	var throwCompletion = ThrowCompletion(sentinel);
	var returnCompletion = ReturnCompletion(sentinel);

	var iteratorRecord = {
		'[[Iterator]]': { iterator: true },
		'[[NextMethod]]': null,
		'[[Done]]': false
	};

	forEach(esV.unknowns, function (unknown) {
		t['throws'](
			function () { IfAbruptCloseIterator(unknown, iteratorRecord); },
			TypeError,
			debug(unknown) + ' is not a CompletionRecord'
		);

		t['throws'](
			function () { IfAbruptCloseIterator(throwCompletion, unknown); },
			TypeError,
			debug(unknown) + ' is not an Iterator Record'
		);

		t['throws'](
			function () { IfAbruptCloseIterator(returnCompletion, unknown); },
			TypeError,
			debug(unknown) + ' is not an Iterator Record'
		);

		t.equal(
			IfAbruptCloseIterator(normalCompletion, unknown),
			sentinel,
			'normal completion, bad iterator record, just returns argument'
		);
	});

	t.equal(
		IfAbruptCloseIterator(normalCompletion, iteratorRecord),
		sentinel,
		'normal completion, returns argument'
	);

	t.test('return completion closes iterator', function (st) {
		var returnCalls = 0;
		var closableIteratorRecord = {
			'[[Iterator]]': {
				next: function () { return { done: true }; },
				'return': function () {
					returnCalls += 1;
					return { done: true };
				}
			},
			'[[NextMethod]]': function () { return { done: true }; },
			'[[Done]]': false
		};

		var rc = ReturnCompletion(42);
		returnCalls = 0;
		var result = IfAbruptCloseIterator(rc, closableIteratorRecord);
		st.equal(result, 42, 'return completion calls IteratorClose and returns the value');
		st.equal(returnCalls, 1, 'return method was called');

		st.end();
	});
};

'use strict';

var SLOT = require('internal-slot');

/** @type {import('../testHelpers').MethodTest<'ThrowCompletion'>} */
module.exports = function (t, year, ThrowCompletion, extras) {
	t.ok(year >= 2018, 'ES2018+');

	var CompletionRecord = extras.getAO('CompletionRecord');

	var sentinel = {};
	var completion = ThrowCompletion(sentinel);

	t.ok(completion instanceof CompletionRecord, 'produces an instance of CompletionRecord');
	t.equal(SLOT.get(completion, '[[Type]]'), 'throw', 'completion type is "throw"');
	t.equal(completion.type(), 'throw', 'completion type is "throw" (via property)');
	t.equal(SLOT.get(completion, '[[Value]]'), sentinel, 'completion value is the argument provided');
	t.equal(completion.value(), sentinel, 'completion value is the argument provided (via property)');
};

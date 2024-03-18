'use strict';

var SLOT = require('internal-slot');

module.exports = function (t, year, ReturnCompletion, extras) {
	t.ok(year >= 2025, 'ES2025+');

	var CompletionRecord = extras.getAO('CompletionRecord');

	var sentinel = {};
	var completion = ReturnCompletion(sentinel);

	t.ok(completion instanceof CompletionRecord, 'produces an instance of CompletionRecord');
	t.equal(SLOT.get(completion, '[[Type]]'), 'return', 'completion type is "return"');
	t.equal(completion.type(), 'return', 'completion type is "return" (via property)');
	t.equal(SLOT.get(completion, '[[Value]]'), sentinel, 'completion value is the argument provided');
	t.equal(completion.value(), sentinel, 'completion value is the argument provided (via property)');
};

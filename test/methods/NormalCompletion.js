'use strict';

var SLOT = require('internal-slot');

module.exports = function (t, year, NormalCompletion, extras) {
	t.ok(year >= 2015, 'ES2015+');

	var CompletionRecord = extras.getAO('CompletionRecord');

	var sentinel = {};
	var completion = NormalCompletion(sentinel);

	t.ok(completion instanceof CompletionRecord, 'produces an instance of CompletionRecord');

	t.equal(SLOT.get(completion, year < 2016 ? '[[type]]' : '[[Type]]'), 'normal', 'completion type is "normal"');
	t.equal(completion.type(), 'normal', 'completion type is "normal" (via property)');

	t.equal(SLOT.get(completion, year < 2016 ? '[[value]]' : '[[Value]]'), sentinel, 'completion value is the argument provided');
	t.equal(completion.value(), sentinel, 'completion value is the argument provided (via property)');
};

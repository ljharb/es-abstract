'use strict';

var forEach = require('for-each');

module.exports = function (t, year, CompletionRecord) {
	t.ok(year >= 2015, 'ES2015+');

	t['throws'](
		function () { return CompletionRecord('invalid'); },
		SyntaxError,
		'invalid Completion Record type throws'
	);

	var sentinel = { sentinel: true };
	forEach(['normal', 'break', 'continue', 'return'], function (nonAbruptType) {
		var completion = CompletionRecord(nonAbruptType, sentinel);
		t.equal(completion['?'](), sentinel, '? returns the value of a non-abrupt completion');
	});
	var throwCompletion = CompletionRecord('throw', sentinel);
	t['throws'](
		function () { throwCompletion['?'](); },
		sentinel,
		'? throws the value of a throw completion'
	);

	var normalCompletion = CompletionRecord('normal', sentinel);
	t.equal(normalCompletion['!'](), sentinel, '! returns the value of a normal completion');

	forEach(['break', 'continue', 'return', 'throw'], function (nonNormalType) {
		var completion = CompletionRecord(nonNormalType);
		t['throws'](
			function () { completion['!'](); },
			SyntaxError,
			'assertion failed: type ' + nonNormalType + ' is not "normal"'
		);
	});

	t.doesNotThrow(function () { return new CompletionRecord('normal', sentinel); }, 'can be constructed with or without `new`');
};

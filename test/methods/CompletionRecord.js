'use strict';

var forEach = require('for-each');

/** @type {import('../testHelpers').MethodTest<'CompletionRecord'>} */
module.exports = function (t, year, CompletionRecord) {
	t.ok(year >= 2015, 'ES2015+');

	t['throws'](
		// @ts-expect-error
		function () { return CompletionRecord('invalid'); },
		SyntaxError,
		'invalid Completion Record type throws'
	);

	var sentinel = { sentinel: true };
	forEach(/** @type {const} */ (['normal', 'break', 'continue', 'return']), function (nonAbruptType) {
		var completion = new CompletionRecord(nonAbruptType, sentinel);
		t.equal(completion['?'](), sentinel, '? returns the value of a non-abrupt completion');
	});
	var throwCompletion = new CompletionRecord('throw', sentinel);
	t['throws'](
		function () { throwCompletion['?'](); },
		sentinel,
		'? throws the value of a throw completion'
	);

	// @ts-expect-error both new and call work
	var normalCompletion = CompletionRecord('normal', sentinel);
	t.equal(normalCompletion['!'](), sentinel, '! returns the value of a normal completion');

	forEach(/** @type {const} */ (['break', 'continue', 'return', 'throw']), function (nonNormalType) {
		var completion = new CompletionRecord(nonNormalType, undefined);
		t['throws'](
			function () { completion['!'](); },
			SyntaxError,
			'assertion failed: type ' + nonNormalType + ' is not "normal"'
		);
	});

	t.doesNotThrow(function () { return new CompletionRecord('normal', sentinel); }, 'can be constructed with or without `new`');
};

'use strict';

/** @type {<T>(t: import('tape').Test, iterator: AsyncIterator<T>, expected: unknown[], results?: unknown[]) => Promise<number>} */
module.exports = function testAsyncIterator(t, asyncIterator, expected) {
	var results = arguments.length > 3 ? arguments[3] : [];

	var nextResult = asyncIterator.next();

	return Promise.resolve(nextResult).then(function (result) {
		results.push(result);
		if (!result.done && results.length < expected.length) {
			t.deepEqual(result, { done: false, value: expected[results.length - 1] }, 'result ' + (results.length - 1));
			return testAsyncIterator(t, asyncIterator, expected, results);
		}

		t.equal(results.length, expected.length, 'expected ' + expected.length + ', got ' + (result.done ? '' : 'more than ') + results.length);
		return results.length;
	});
};

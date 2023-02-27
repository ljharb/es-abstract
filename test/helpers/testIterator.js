'use strict';

/** @type {<T>(t: import('tape').Test, iterator: Iterator<T>, expected: unknown[]) => void} */
module.exports = function testIterator(t, iterator, expected) {
	var resultCount = 0;
	var result;
	while (result = iterator.next(), !result.done && resultCount < expected.length + 1) { // eslint-disable-line no-sequences
		t.deepEqual(result, { done: false, value: expected[resultCount] }, 'result ' + resultCount);
		resultCount += 1;
	}
	t.equal(resultCount, expected.length, 'expected ' + expected.length + ', got ' + (result.done ? '' : 'more than ') + resultCount);
};

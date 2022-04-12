'use strict';

var test = require('tape');

var getIteratorMethod = require('../../helpers/getIteratorMethod');

var ES = require('../../es2021');

var testIterator = function (t, iterator) {
	var result = iterator.next();
	var values = [];
	if (!result.done) {
		values.push(result.value);
		values = values.concat(testIterator(t, iterator));
	}
	return values;
};

test('getIteratorMethod', function (t) {
	t.equal(typeof getIteratorMethod, 'function', 'is a function');

	var arr = [1, 2, 3];
	var arrayIt = getIteratorMethod(ES, arr).call(arr);
	t.deepEqual(
		testIterator(t, arrayIt),
		[1, 2, 3],
		'array iterator'
	);

	var withHamburger = 'foo\uD834\uDF06bar';
	var stringIt = getIteratorMethod(ES, withHamburger).call(withHamburger);
	t.deepEqual(
		testIterator(t, stringIt),
		['f', 'o', 'o', '\uD834\uDF06', 'b', 'a', 'r'],
		'string iterator'
	);

	var boxedHamburger = Object(withHamburger);
	var boxedStringIt = getIteratorMethod(ES, boxedHamburger).call(boxedHamburger);
	t.deepEqual(
		testIterator(t, boxedStringIt),
		['f', 'o', 'o', '\uD834\uDF06', 'b', 'a', 'r'],
		'boxed string iterator'
	);

	t.end();
});

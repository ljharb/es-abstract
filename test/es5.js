'use strict';

var expectedMissing = /** @type {const} */ ([
	'SplitMatch'
]);

var testYear = require('./helpers/testYear');

testYear(5, expectedMissing);

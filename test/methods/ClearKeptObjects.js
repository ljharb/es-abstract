'use strict';

/** @type {import('../testHelpers').MethodTest<'ClearKeptObjects'>} */
module.exports = function (t, year, ClearKeptObjects) {
	t.ok(year >= 2021, 'ES2021+');

	t.doesNotThrow(ClearKeptObjects, 'appears to be a no-op');
};

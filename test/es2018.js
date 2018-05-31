'use strict';

var ES = require('../').ES2018;

var ops = require('../operations/2018');

// jscs:disable
var expectedMissing = ['DeletePropertyOrThrow', 'Construct', 'SetIntegrityLevel', 'TestIntegrityLevel', 'CreateArrayFromList', 'CreateListFromArrayLike', 'OrdinaryHasInstance', 'EnumerableOwnProperties', 'GetIterator', 'IteratorNext', 'IteratorComplete', 'IteratorValue', 'IteratorStep', 'IteratorClose', 'CreateListIteratorRecord', 'thisNumberValue', 'thisTimeValue', 'thisStringValue', 'thisBooleanValue', 'RegExpBuiltinExec', 'IsPromise', 'OrdinarySet', 'OrdinarySetWithOwnDescriptor', 'NormalCompletion', 'ThrowCompletion', 'AsyncGeneratorFunctionCreate', 'AsyncIteratorClose', 'AsyncFunctionCreate', 'SetFunctionLength', 'LocalTZA', 'ToDateString', 'TimeString', 'DateString', 'UnicodeMatchProperty', 'UnicodeMatchPropertyValue', 'BackreferenceMatcher'];
// jscs:enable

require('./tests').es2018(ES, ops, expectedMissing);

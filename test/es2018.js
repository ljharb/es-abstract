'use strict';

var ES = require('../').ES2018;

var ops = require('../operations/2018');

// jscs:disable
var expectedMissing = ['Construct', 'SetIntegrityLevel', 'TestIntegrityLevel', 'CreateArrayFromList', 'CreateListFromArrayLike', 'OrdinaryHasInstance', 'EnumerableOwnProperties', 'CreateListIteratorRecord', 'thisNumberValue', 'thisTimeValue', 'thisStringValue', 'thisBooleanValue', 'RegExpBuiltinExec', 'IsPromise', 'OrdinarySet', 'OrdinarySetWithOwnDescriptor', 'NormalCompletion', 'ThrowCompletion', 'AsyncGeneratorFunctionCreate', 'AsyncIteratorClose', 'AsyncFunctionCreate', 'SetFunctionLength', 'LocalTZA', 'ToDateString', 'TimeString', 'DateString', 'UnicodeMatchProperty', 'UnicodeMatchPropertyValue', 'BackreferenceMatcher', 'EnumerableOwnPropertyNames'];
// jscs:enable

require('./tests').es2018(ES, ops, expectedMissing);

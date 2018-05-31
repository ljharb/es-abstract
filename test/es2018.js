'use strict';

var ES = require('../').ES2018;

var ops = require('../operations/2018');

var expectedMissing = ['Construct', 'SetIntegrityLevel', 'TestIntegrityLevel', 'CreateArrayFromList', 'CreateListFromArrayLike', 'OrdinaryHasInstance', 'CreateListIteratorRecord', 'thisNumberValue', 'thisTimeValue', 'thisStringValue', 'thisBooleanValue', 'RegExpBuiltinExec', 'IsPromise', 'OrdinarySet', 'OrdinarySetWithOwnDescriptor', 'NormalCompletion', 'ThrowCompletion', 'AsyncGeneratorFunctionCreate', 'AsyncIteratorClose', 'AsyncFunctionCreate', 'SetFunctionLength', 'LocalTZA', 'ToDateString', 'TimeString', 'DateString', 'UnicodeMatchProperty', 'UnicodeMatchPropertyValue', 'BackreferenceMatcher'];

require('./tests').es2018(ES, ops, expectedMissing);

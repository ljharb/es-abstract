'use strict';

var ES = require('../').ES2016;

var ops = require('../operations/2016');

// jscs:disable
var expectedMissing = ['Construct', 'SetIntegrityLevel', 'TestIntegrityLevel', 'CreateArrayFromList', 'CreateListFromArrayLike', 'OrdinaryHasInstance', 'EnumerableOwnNames', 'CreateListIterator', 'thisBooleanValue', 'thisNumberValue', 'thisTimeValue', 'thisStringValue', 'RegExpBuiltinExec', 'IsPromise', 'OrdinarySet', 'NormalCompletion'];
// jscs:enable

require('./tests').es2016(ES, ops, expectedMissing);

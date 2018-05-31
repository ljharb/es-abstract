'use strict';

var ES = require('../').ES2016;

var ops = require('../operations/2016');

var expectedMissing = ['Construct', 'SetIntegrityLevel', 'TestIntegrityLevel', 'CreateArrayFromList', 'CreateListFromArrayLike', 'OrdinaryHasInstance', 'CreateListIterator', 'thisBooleanValue', 'thisNumberValue', 'thisTimeValue', 'thisStringValue', 'RegExpBuiltinExec', 'IsPromise', 'OrdinarySet', 'NormalCompletion'];

require('./tests').es2016(ES, ops, expectedMissing);

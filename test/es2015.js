'use strict';

var ES = require('../').ES2015;

var ops = require('../operations/2015');

var expectedMissing = ['Abstract Equality Comparison', 'Abstract Relational Comparison', 'Construct', 'CreateArrayFromList', 'CreateListFromArrayLike', 'CreateListIterator', 'NormalCompletion', 'RegExpBuiltinExec', 'Strict Equality Comparison'];

require('./tests').es2015(ES, ops, expectedMissing);

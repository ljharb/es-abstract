'use strict';

var ES = require('../').ES2015;
var boundES = require('./helpers/createBoundESNamespace')(ES);

var ops = require('../operations/2015');

var expectedMissing = [
	'Construct',
	'CreateArrayFromList',
	'CreateListIterator',
	'NormalCompletion',
	'RegExpBuiltinExec'
];

require('./tests').es2015(boundES, ops, expectedMissing);

require('./helpers/runManifestTest')(require('tape'), ES, 2015);

'use strict';

var AsyncFromSyncIterator = require('../helpers/AsyncFromSyncIterator');
var Get = require('./Get');

// https://www.ecma-international.org/ecma-262/9.0/#sec-createasyncfromsynciterator

module.exports = function CreateAsyncFromSyncIterator(syncIteratorRecord) {
	if (!AsyncFromSyncIterator) {
		throw new SyntaxError('This environment does not support Promises.');
	}

	var asyncIterator = new AsyncFromSyncIterator(syncIteratorRecord);
	var nextMethod = Get(asyncIterator, 'next');
	return {
		'[[Iterator]]': asyncIterator,
		'[[NextMethod]]': nextMethod,
		'[[Done]]': false
	};
};

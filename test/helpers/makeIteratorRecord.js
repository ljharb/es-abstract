'use strict';

module.exports = function makeIteratorRecord(iterator) {
	return {
		'[[Iterator]]': iterator,
		'[[NextMethod]]': iterator.next,
		'[[Done]]': false
	};
};

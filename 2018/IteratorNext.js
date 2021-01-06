'use strict';

var GetIntrinsic = require('get-intrinsic');

var $TypeError = GetIntrinsic('%TypeError%');

var Call = require('./Call');
var Type = require('./Type');

// https://ecma-international.org/ecma-262/9.0/#sec-iteratornext

module.exports = function IteratorNext(iteratorRecord) {
	var value;
	if (arguments.length > 1) {
		value = arguments[1];
	}
	var result = arguments.length < 2
		? Call(iteratorRecord['[[NextMethod]]'], iteratorRecord['[[Iterator]]'], [])
		: Call(iteratorRecord['[[NextMethod]]'], iteratorRecord['[[Iterator]]'], [value]);
	if (Type(result) !== 'Object') {
		throw new $TypeError('iterator next must return an object');
	}
	return result;
};

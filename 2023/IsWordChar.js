'use strict';

var GetIntrinsic = require('get-intrinsic');

var $TypeError = GetIntrinsic('%TypeError%');

var callBound = require('call-bind/callBound');

var $indexOf = callBound('String.prototype.indexOf');

var IsArray = require('./IsArray');
var Type = require('./Type');
var WordCharacters = require('./WordCharacters');

var assertRecord = require('../helpers/assertRecord');
var every = require('../helpers/every');

var isChar = function isChar(c) {
	return typeof c === 'string';
};

// https://262.ecma-international.org/14.0/#sec-runtime-semantics-iswordchar-abstract-operation

// note: prior to ES2023, this AO erroneously omitted the latter of its arguments.
module.exports = function IsWordChar(rer, Input, e) {
	assertRecord(Type, 'RegExp Record', 'rer', rer);
	if (!IsArray(Input) || !every(Input, isChar)) {
		throw new $TypeError('Assertion failed: `Input` must be a List of characters');
	}

	if (e === -1 || e === rer['[[InputLength]]']) {
		return false; // step 1
	}

	var c = Input[e]; // step 2

	var wordChars = WordCharacters(rer);

	return $indexOf(wordChars, c) > -1; // steps 3-4
};

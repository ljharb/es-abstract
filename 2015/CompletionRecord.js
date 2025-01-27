'use strict';

var $SyntaxError = require('es-errors/syntax');

var SLOT = require('internal-slot');

var Enum = require('../helpers/enum');

var normalEnum = Enum.define('normal');
var breakEnum = Enum.define('break');
var continueEnum = Enum.define('continue');
var returnEnum = Enum.define('return');
var throwEnum = Enum.define('throw');
var types = [normalEnum, breakEnum, continueEnum, returnEnum, throwEnum];

// https://262.ecma-international.org/6.0/#sec-completion-record-specification-type

var CompletionRecord = function CompletionRecord(type, value) {
	if (!(this instanceof CompletionRecord)) {
		return new CompletionRecord(type, value);
	}
	var typeEnum = Enum.validate('type', types, type, $SyntaxError);

	SLOT.set(this, '[[type]]', typeEnum);
	SLOT.set(this, '[[value]]', value);
	// [[target]] slot?
};

CompletionRecord.prototype.type = function type() {
	return SLOT.get(this, '[[type]]').name;
};

CompletionRecord.prototype.value = function value() {
	return SLOT.get(this, '[[value]]');
};

CompletionRecord.prototype['?'] = function ReturnIfAbrupt() {
	var type = SLOT.get(this, '[[type]]');
	var value = SLOT.get(this, '[[value]]');

	if (type === throwEnum) {
		throw value;
	}
	return value;
};

CompletionRecord.prototype['!'] = function assert() {
	var type = SLOT.get(this, '[[type]]');

	if (type !== normalEnum) {
		throw new $SyntaxError('Assertion failed: Completion Record is not of type "normal"');
	}
	return SLOT.get(this, '[[value]]');
};

module.exports = CompletionRecord;

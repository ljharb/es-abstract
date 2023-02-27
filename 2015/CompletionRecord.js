'use strict';

var $SyntaxError = require('es-errors/syntax');

var SLOT = require('internal-slot');

// https://262.ecma-international.org/6.0/#sec-completion-record-specification-type

/**
 * @constructor
 * @template {import('../types').CompletionRecordType} T
 * @param {T} type
 * @template V
 * @param {V} [value]
*/
// @ts-expect-error this is a constructor, most paths shouldn't return a value
function CompletionRecord(type, value) {
	if (!(this instanceof CompletionRecord)) {
		return new CompletionRecord(type, value);
	}
	if (type !== 'normal' && type !== 'break' && type !== 'continue' && type !== 'return' && type !== 'throw') {
		throw new $SyntaxError('Assertion failed: `type` must be one of "normal", "break", "continue", "return", or "throw"');
	}
	SLOT.set(this, '[[type]]', type);
	SLOT.set(this, '[[value]]', value);
	// [[target]] slot?
}

/** @type {() => import('../types').CompletionRecordType} */
CompletionRecord.prototype.type = function type() {
	return SLOT.get(this, '[[type]]');
};

/** @type {() => V} */
CompletionRecord.prototype.value = function value() {
	return SLOT.get(this, '[[value]]');
};

/** @type {() => V | never} */
CompletionRecord.prototype['?'] = function ReturnIfAbrupt() {
	var type = SLOT.get(this, '[[type]]');
	var value = SLOT.get(this, '[[value]]');

	if (type === 'throw') {
		throw value;
	}
	return value;
};

/** @type {() => T | never} */
CompletionRecord.prototype['!'] = function assert() {
	var type = SLOT.get(this, '[[type]]');

	if (type !== 'normal') {
		throw new $SyntaxError('Assertion failed: Completion Record is not of type "normal"');
	}
	return SLOT.get(this, '[[value]]');
};

module.exports = CompletionRecord;

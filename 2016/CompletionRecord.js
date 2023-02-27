'use strict';

var $SyntaxError = require('es-errors/syntax');

var SLOT = require('internal-slot');

// https://262.ecma-international.org/7.0/#sec-completion-record-specification-type

/**
 * @constructor
 * @template {import('../types').CompletionRecordType} T
 * @param {T} type
 * @template {unknown} V
 * @param {V} value
*/
// @ts-expect-error this is a constructor, most paths shouldn't return a value
// eslint-disable-next-line func-style
function CompletionRecord(type, value) {
	if (!(this instanceof CompletionRecord)) {
		return new CompletionRecord(type, value);
	}
	if (type !== 'normal' && type !== 'break' && type !== 'continue' && type !== 'return' && type !== 'throw') {
		throw new $SyntaxError('Assertion failed: `type` must be one of "normal", "break", "continue", "return", or "throw"');
	}
	SLOT.set(this, '[[Type]]', type);
	SLOT.set(this, '[[Value]]', value);
	// [[Target]] slot?
}

/** @type {() => T} */
CompletionRecord.prototype.type = function Type() {
	return SLOT.get(this, '[[Type]]');
};

/** @type {() => V} */
CompletionRecord.prototype.value = function Value() {
	return SLOT.get(this, '[[Value]]');
};

/** @type {() => T | never} */
CompletionRecord.prototype['?'] = function ReturnIfAbrupt() {
	var type = SLOT.get(this, '[[Type]]');
	var value = SLOT.get(this, '[[Value]]');

	if (type === 'throw') {
		throw value;
	}
	return value;
};

/** @type {() => T | never} */
CompletionRecord.prototype['!'] = function assert() {
	var type = SLOT.get(this, '[[Type]]');

	if (type !== 'normal') {
		throw new $SyntaxError('Assertion failed: Completion Record is not of type "normal"');
	}
	return SLOT.get(this, '[[Value]]');
};

module.exports = CompletionRecord;

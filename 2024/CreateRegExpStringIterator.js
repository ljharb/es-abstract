'use strict';

var GetIntrinsic = require('get-intrinsic');
var hasSymbols = require('has-symbols')();

var $TypeError = require('es-errors/type');
var isObject = require('es-object-atoms/isObject');
var IteratorPrototype = GetIntrinsic('%IteratorPrototype%', true);

var AdvanceStringIndex = require('./AdvanceStringIndex');
var CreateIterResultObject = require('./CreateIterResultObject');
var DefineMethodProperty = require('./DefineMethodProperty');
var Get = require('./Get');
var OrdinaryObjectCreate = require('./OrdinaryObjectCreate');
var RegExpExec = require('./RegExpExec');
var Set = require('./Set');
var ToLength = require('./ToLength');
var ToString = require('./ToString');

var SLOT = require('internal-slot');
var setToStringTag = require('es-set-tostringtag');

/**
 * @constructor
 * @param {RegExp} R
 * @param {string} S
 * @param {boolean} global
 * @param {boolean} fullUnicode
 */
function RegExpStringIterator(R, S, global, fullUnicode) {
	if (typeof S !== 'string') {
		throw new $TypeError('`S` must be a string');
	}
	if (typeof global !== 'boolean') {
		throw new $TypeError('`global` must be a boolean');
	}
	if (typeof fullUnicode !== 'boolean') {
		throw new $TypeError('`fullUnicode` must be a boolean');
	}
	SLOT.set(this, '[[IteratingRegExp]]', R);
	SLOT.set(this, '[[IteratedString]]', S);
	SLOT.set(this, '[[Global]]', global);
	SLOT.set(this, '[[Unicode]]', fullUnicode);
	SLOT.set(this, '[[Done]]', false);
}

if (IteratorPrototype) {
	RegExpStringIterator.prototype = OrdinaryObjectCreate(IteratorPrototype);
}

/** @type {(this: RegExpStringIterator) => IteratorResult<undefined | object | RegExpExecArray>} */
var RegExpStringIteratorNext = function next() {
	var O = this; // eslint-disable-line no-invalid-this
	if (!isObject(O)) {
		throw new $TypeError('receiver must be an object');
	}
	if (
		!(O instanceof RegExpStringIterator)
		|| !SLOT.has(O, '[[IteratingRegExp]]')
		|| !SLOT.has(O, '[[IteratedString]]')
		|| !SLOT.has(O, '[[Global]]')
		|| !SLOT.has(O, '[[Unicode]]')
		|| !SLOT.has(O, '[[Done]]')
	) {
		throw new $TypeError('"this" value must be a RegExpStringIterator instance');
	}
	if (SLOT.get(O, '[[Done]]')) {
		return CreateIterResultObject(undefined, true);
	}
	// esllint-disable-next-line no-extra-parens
	var R = /** @type {RegExp} */ (SLOT.get(O, '[[IteratingRegExp]]'));
	// esllint-disable-next-line no-extra-parens
	var S = /** @type {string} */ (SLOT.get(O, '[[IteratedString]]'));
	var global = !!SLOT.get(O, '[[Global]]');
	var fullUnicode = !!SLOT.get(O, '[[Unicode]]');
	var match = RegExpExec(R, S);
	if (match === null) {
		SLOT.set(O, '[[Done]]', true);
		return CreateIterResultObject(undefined, true);
	}
	if (global) {
		var matchStr = ToString(/* Get(match, '0') */ match[0]);
		if (matchStr === '') {
			var thisIndex = ToLength(Get(R, 'lastIndex'));
			var nextIndex = AdvanceStringIndex(S, thisIndex, fullUnicode);
			Set(R, 'lastIndex', nextIndex, true);
		}
		return CreateIterResultObject(match, false);
	}
	SLOT.set(O, '[[Done]]', true);
	return CreateIterResultObject(match, false);
};
// @ts-expect-error TS can't figure out that .prototype on a function is never not assigned
var proto = RegExpStringIterator.prototype;
DefineMethodProperty(proto, 'next', RegExpStringIteratorNext, false);

if (hasSymbols) {
	setToStringTag(proto, 'RegExp String Iterator');

	if (Symbol.iterator && typeof /** @type {{ [Symbol.iterator]?: unknown }} */ (proto)[Symbol.iterator] !== 'function') {
		/** @type {<T>(this: T) => T} */
		var iteratorFn = function SymbolIterator() {
			return this;
		};
		DefineMethodProperty(proto, Symbol.iterator, iteratorFn, false);
	}
}

// https://262.ecma-international.org/15.0/#sec-createregexpstringiterator

/** @type {(R: RegExp, S: string, global: boolean, fullUnicode: boolean) => RegExpStringIterator} */
module.exports = function CreateRegExpStringIterator(R, S, global, fullUnicode) {
	// assert R.global === global && R.unicode === fullUnicode?
	return new RegExpStringIterator(R, S, global, fullUnicode);
};

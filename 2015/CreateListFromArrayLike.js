'use strict';

var callBound = require('call-bound');

var $TypeError = require('es-errors/type');
var isObject = require('es-object-atoms/isObject');
var $indexOf = callBound('Array.prototype.indexOf', true) || callBound('String.prototype.indexOf');

var Get = require('./Get');
var IsArray = require('./IsArray');
var ToLength = require('./ToLength');
// var ToString = require('./ToString');
var Type = require('./Type');

var defaultElementTypes = /** @type {const} */ (['Undefined', 'Null', 'Boolean', 'String', 'Symbol', 'Number', 'Object']);

// https://262.ecma-international.org/6.0/#sec-createlistfromarraylike

/** @type {<V, T extends `${typeof defaultElementTypes[number]}`[]>(obj: ArrayLike<V>, elementTypes?: T) => unknown[]} */
module.exports = function CreateListFromArrayLike(obj) {
	/** @type {typeof defaultElementTypes} */
	var elementTypes = arguments.length > 1
		? arguments[1]
		: defaultElementTypes;

	if (!isObject(obj)) {
		throw new $TypeError('Assertion failed: `obj` must be an Object');
	}
	if (!IsArray(elementTypes)) {
		throw new $TypeError('Assertion failed: `elementTypes`, if provided, must be an array');
	}
	/** @typedef {typeof obj[number]} V */
	var len = ToLength(Get(obj, 'length'));
	/** @type {V[]} */
	var list = [];
	var index = 0;
	while (index < len) {
		// var indexName = ToString(index);
		var next = obj[index]; // Get(obj, indexName);
		var nextType = Type(next);
		if ($indexOf(elementTypes, nextType) < 0) {
			throw new $TypeError('item type ' + nextType + ' is not a valid elementType');
		}
		list[list.length] = next;
		index += 1;
	}
	return list;
};

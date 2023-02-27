// @ts-nocheck

'use strict';

var $TypeError = require('es-errors/type');
var $setProto = require('set-proto');
var isObject = require('es-object-atoms/isObject');

var OrdinaryGetPrototypeOf = require('./OrdinaryGetPrototypeOf');

// https://262.ecma-international.org/7.0/#sec-ordinarysetprototypeof

/** @type {(O: object, V: object | null) => boolean} */
module.exports = function OrdinarySetPrototypeOf(O, V) {
	if (V !== null && !isObject(V)) {
		throw new $TypeError('Assertion failed: V must be Object or Null');
	}
	/*
	var extensible = IsExtensible(O);
	var current = OrdinaryGetPrototypeOf(O);
	if (SameValue(V, current)) {
		return true;
	}
	if (!extensible) {
		return false;
	}
	*/
	try {
		// @ts-expect-error
		$setProto(O, V);
	} catch (e) {
		return false;
	}
	return OrdinaryGetPrototypeOf(O) === V;
	/*
	var p = V;
	var done = false;
	while (!done) {
		if (p === null) {
			done = true;
		} else if (SameValue(p, O)) {
			return false;
		} else {
			if (wat) {
				done = true;
			} else {
				p = p.[[Prototype]];
			}
		}
	}
	O.[[Prototype]] = V;
	return true;
	*/
};

'use strict';

var GetIntrinsic = require('get-intrinsic');

var $ObjectCreate = GetIntrinsic('%Object.create%', true);
var $TypeError = require('es-errors/type');
var $SyntaxError = require('es-errors/syntax');
var isObject = require('es-object-atoms/isObject');

var IsArray = require('./IsArray');

var forEach = require('../helpers/forEach');

var SLOT = require('internal-slot');

var hasProto = require('has-proto')();

// https://262.ecma-international.org/11.0/#sec-objectcreate

/** @type {<P extends null | object = null | object>(proto: P, internalSlotsList?: string[]) => { __proto__: P }} */
module.exports = function OrdinaryObjectCreate(proto) {
	if (proto !== null && !isObject(proto)) {
		throw new $TypeError('Assertion failed: `proto` must be null or an object');
	}
	/** @type {string[]} */
	var additionalInternalSlotsList = arguments.length < 2 ? [] : arguments[1];
	if (!IsArray(additionalInternalSlotsList)) {
		throw new $TypeError('Assertion failed: `additionalInternalSlotsList` must be an Array');
	}

	// var internalSlotsList = ['[[Prototype]]', '[[Extensible]]']; // step 1
	// internalSlotsList.push(...additionalInternalSlotsList); // step 2
	// var O = MakeBasicObject(internalSlotsList); // step 3
	// setProto(O, proto); // step 4
	// return O; // step 5

	/** @type {{ __proto__: typeof proto }} */
	var O;
	if (hasProto) {
		O = { __proto__: proto };
	} else if ($ObjectCreate) {
		O = $ObjectCreate(proto);
	} else {
		if (proto === null) {
			throw new $SyntaxError('native Object.create support is required to create null objects');
		}
		/** @constructor */
		var T = function T() {};
		T.prototype = proto;
		// eslint-disable-next-line no-extra-parens
		O = /** @type {typeof T & { __proto__: typeof proto }} */ (new T());
	}

	if (additionalInternalSlotsList.length > 0) {
		forEach(additionalInternalSlotsList, function (slot) {
			SLOT.set(O, slot, void undefined);
		});
	}

	return O;
};

'use strict';

var GetIntrinsic = require('get-intrinsic');

var reflectSetProto = GetIntrinsic('%Reflect.setPrototypeOf%', true);
var originalSetProto = GetIntrinsic('%Object.setPrototypeOf%', true);

var setDunderProto = require('dunder-proto/set');

var $TypeError = require('es-errors/type');

module.exports = reflectSetProto
	? function setProto(O, proto) {
		if (reflectSetProto(O, proto)) {
			return O;
		}
		throw new $TypeError('Reflect.setPrototypeOf: failed to set [[Prototype]]');
	}
	: originalSetProto || (
		setDunderProto ? function setProto(O, proto) {
			setDunderProto(O, proto);
			return O;
		} : null
	);

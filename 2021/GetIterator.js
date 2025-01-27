'use strict';

var GetIntrinsic = require('get-intrinsic');

var $TypeError = require('es-errors/type');
var $SyntaxError = require('es-errors/syntax');
var isObject = require('es-object-atoms/isObject');
var $asyncIterator = GetIntrinsic('%Symbol.asyncIterator%', true);

var hasSymbols = require('has-symbols')();

var getIteratorMethod = require('../helpers/getIteratorMethod');
var AdvanceStringIndex = require('./AdvanceStringIndex');
var Call = require('./Call');
var GetMethod = require('./GetMethod');

var ES = {
	AdvanceStringIndex: AdvanceStringIndex,
	GetMethod: GetMethod
};

var Enum = require('../helpers/enum');

var sync = Enum.define('sync');
var async = Enum.define('async');
var hints = [sync, async];

// https://262.ecma-international.org/9.0/#sec-getiterator

module.exports = function GetIterator(obj, hint, method) {
	var actualHint = Enum.validate('hint', hints, arguments.length < 2 ? sync : hint);

	var actualMethod = method;
	if (arguments.length < 3) {
		if (actualHint === async) {
			if (hasSymbols && $asyncIterator) {
				actualMethod = GetMethod(obj, $asyncIterator);
			}
			if (actualMethod === undefined) {
				throw new $SyntaxError("async from sync iterators aren't currently supported");
			}
		} else {
			actualMethod = getIteratorMethod(ES, obj);
		}
	}
	var iterator = Call(actualMethod, obj);
	if (!isObject(iterator)) {
		throw new $TypeError('iterator must return an object');
	}

	return iterator;

	// TODO: This should return an IteratorRecord
	/*
	var nextMethod = GetV(iterator, 'next');
	return {
		'[[Iterator]]': iterator,
		'[[NextMethod]]': nextMethod,
		'[[Done]]': false
	};
	*/
};

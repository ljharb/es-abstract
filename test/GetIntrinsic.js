'use strict';

var GetIntrinsic = require('../GetIntrinsic');

var test = require('tape');
var forEach = require('foreach');
var debug = require('object-inspect');
var generatorFns = require('make-generator-function')();
var asyncFns = require('make-async-function').list();
var asyncGenFns = require('make-async-generator-function')();

var callBound = require('../helpers/callBound');
var v = require('./helpers/values');

var $isProto = callBound('%Object.prototype.isPrototypeOf%');

test('export', function (t) {
	t.equal(typeof GetIntrinsic, 'function', 'it is a function');
	t.equal(GetIntrinsic.length, 2, 'function has length of 2');

	t.end();
});

test('throws', function (t) {
	t['throws'](
		function () { GetIntrinsic('not an intrinsic'); },
		SyntaxError,
		'nonexistent intrinsic throws a syntax error'
	);

	t['throws'](
		function () { GetIntrinsic(''); },
		TypeError,
		'empty string intrinsic throws a type error'
	);

	t['throws'](
		function () { GetIntrinsic('.'); },
		SyntaxError,
		'"just a dot" intrinsic throws a syntax error'
	);

	forEach(v.nonStrings, function (nonString) {
		t['throws'](
			function () { GetIntrinsic(nonString); },
			TypeError,
			debug(nonString) + ' is not a String'
		);
	});

	forEach(v.nonBooleans, function (nonBoolean) {
		t['throws'](
			function () { GetIntrinsic('%', nonBoolean); },
			TypeError,
			debug(nonBoolean) + ' is not a Boolean'
		);
	});

	forEach([
		'toString',
		'propertyIsEnumerable',
		'hasOwnProperty'
	], function (objectProtoMember) {
		t['throws'](
			function () { GetIntrinsic(objectProtoMember); },
			SyntaxError,
			debug(objectProtoMember) + ' is not an intrinsic'
		);
	});

	t.end();
});

test('base intrinsics', function (t) {
	t.equal(GetIntrinsic('%Object%'), Object, '%Object% yields Object');
	t.equal(GetIntrinsic('Object'), Object, 'Object yields Object');
	t.equal(GetIntrinsic('%Array%'), Array, '%Array% yields Array');
	t.equal(GetIntrinsic('Array'), Array, 'Array yields Array');

	t.end();
});

test('dotted paths', function (t) {
	t.equal(GetIntrinsic('%Object.prototype.toString%'), Object.prototype.toString, '%Object.prototype.toString% yields Object.prototype.toString');
	t.equal(GetIntrinsic('Object.prototype.toString'), Object.prototype.toString, 'Object.prototype.toString yields Object.prototype.toString');
	t.equal(GetIntrinsic('%Array.prototype.push%'), Array.prototype.push, '%Array.prototype.push% yields Array.prototype.push');
	t.equal(GetIntrinsic('Array.prototype.push'), Array.prototype.push, 'Array.prototype.push yields Array.prototype.push');

	t.end();
});

test('accessors', { skip: !Object.getOwnPropertyDescriptor || typeof Map !== 'function' }, function (t) {
	var actual = Object.getOwnPropertyDescriptor(Map.prototype, 'size');
	t.ok(actual, 'Map.prototype.size has a descriptor');
	t.equal(typeof actual.get, 'function', 'Map.prototype.size has a getter function');
	t.equal(GetIntrinsic('%Map.prototype.size%'), actual.get, '%Map.prototype.size% yields the getter for it');
	t.equal(GetIntrinsic('Map.prototype.size'), actual.get, 'Map.prototype.size yields the getter for it');

	t.end();
});

test('generator functions', { skip: !generatorFns.length }, function (t) {
	var $GeneratorFunction = GetIntrinsic('%GeneratorFunction%');
	var $GeneratorFunctionPrototype = GetIntrinsic('%Generator%');
	var $GeneratorPrototype = GetIntrinsic('%GeneratorPrototype%');

	forEach(generatorFns, function (genFn) {
		var fnName = genFn.name;
		fnName = fnName ? "'" + fnName + "'" : 'genFn';

		t.ok(genFn instanceof $GeneratorFunction, fnName + ' instanceof %GeneratorFunction%');
		t.ok($isProto($GeneratorFunctionPrototype, genFn), '%Generator% is prototype of ' + fnName);
		t.ok($isProto($GeneratorPrototype, genFn.prototype), '%GeneratorPrototype% is prototype of ' + fnName + '.prototype');
	});

	t.end();
});

test('async functions', { skip: !asyncFns.length }, function (t) {
	var $AsyncFunction = GetIntrinsic('%AsyncFunction%');
	var $AsyncFunctionPrototype = GetIntrinsic('%AsyncFunctionPrototype%');

	forEach(asyncFns, function (asyncFn) {
		var fnName = asyncFn.name;
		fnName = fnName ? "'" + fnName + "'" : 'asyncFn';

		t.ok(asyncFn instanceof $AsyncFunction, fnName + ' instanceof %AsyncFunction%');
		t.ok($isProto($AsyncFunctionPrototype, asyncFn), '%AsyncFunctionPrototype% is prototype of ' + fnName);
	});

	t.end();
});

test('async generator functions', { skip: !asyncGenFns.length }, function (t) {
	var $AsyncGeneratorFunction = GetIntrinsic('%AsyncGeneratorFunction%');
	var $AsyncGeneratorFunctionPrototype = GetIntrinsic('%AsyncGenerator%');
	var $AsyncGeneratorPrototype = GetIntrinsic('%AsyncGeneratorPrototype%');

	forEach(asyncGenFns, function (asyncGenFn) {
		var fnName = asyncGenFn.name;
		fnName = fnName ? "'" + fnName + "'" : 'asyncGenFn';

		t.ok(asyncGenFn instanceof $AsyncGeneratorFunction, fnName + ' instanceof %AsyncGeneratorFunction%');
		t.ok($isProto($AsyncGeneratorFunctionPrototype, asyncGenFn), '%AsyncGenerator% is prototype of ' + fnName);
		t.ok($isProto($AsyncGeneratorPrototype, asyncGenFn.prototype), '%AsyncGeneratorPrototype% is prototype of ' + fnName + '.prototype');
	});

	t.end();
});

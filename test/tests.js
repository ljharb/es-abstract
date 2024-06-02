'use strict';

var tape = require('tape');
var Test = require('tape/lib/test');

var forEach = require('for-each');
var debug = require('object-inspect');
var assign = require('object.assign');
var keys = require('object-keys');
var flatMap = require('array.prototype.flatmap');
var hasOwn = require('hasown');
var arrowFns = require('make-arrow-function').list();
var hasStrictMode = require('has-strict-mode')();
var functionsHaveNames = require('functions-have-names')();
var functionsHaveConfigurableNames = require('functions-have-names').functionsHaveConfigurableNames();
var boundFunctionsHaveNames = require('functions-have-names').boundFunctionsHaveNames();
var hasBigInts = require('has-bigints')();
var getOwnPropertyDescriptor = require('gopd');
var SLOT = require('internal-slot');
var availableTypedArrays = require('available-typed-arrays')();
var typedArrayLength = require('typed-array-length');
var arrayFrom = require('array.from');
var isCore = require('is-core-module');
var isRegex = require('is-regex');
var v = require('es-value-fixtures');
var mockProperty = require('mock-property');
var isRegisteredSymbol = require('is-registered-symbol');
var hasNamedCaptures = require('has-named-captures')();
var $defineProperty = require('es-define-property');

var $getProto = require('../helpers/getProto');
var $setProto = require('../helpers/setProto');
var bufferTestCases = require('./bufferTestCases.json');
var caseFolding = require('../helpers/caseFolding.json');
var defineProperty = require('./helpers/defineProperty');
var diffOps = require('./diffOps');
var fromPropertyDescriptor = require('../helpers/fromPropertyDescriptor');
var getInferredName = require('../helpers/getInferredName');
var isPromiseCapabilityRecord = require('../helpers/records/promise-capability-record');
var MAX_SAFE_INTEGER = require('../helpers/maxSafeInteger');
var MAX_VALUE = require('../helpers/maxValue');
var reduce = require('../helpers/reduce');
var safeBigInt = require('safe-bigint');
var unserialize = require('./helpers/unserializeNumeric');

var $BigInt = hasBigInts ? BigInt : null;

var supportedRegexFlags = require('available-regexp-flags');
var whichTypedArray = require('which-typed-array');

var $symbolFor = v.hasSymbols && Symbol['for']; // eslint-disable-line no-restricted-properties

/* globals postMessage */
var canDetach = typeof structuredClone === 'function' || typeof postMessage === 'function' || isCore('worker_threads');

// in node < 6, RegExp.prototype is an actual regex
var reProtoIsRegex = isRegex(RegExp.prototype);

var twoSixtyFour = hasBigInts && safeBigInt(Math.pow(2, 64));
var twoSixtyThree = hasBigInts && safeBigInt(Math.pow(2, 63));

var elementSizes = {
	__proto__: null,
	$Int8Array: 1,
	$Uint8Array: 1,
	$Uint8ClampedArray: 1,
	$Int16Array: 2,
	$Uint16Array: 2,
	$Int32Array: 4,
	$Uint32Array: 4,
	$BigInt64Array: 8,
	$BigUint64Array: 8,
	$Float32Array: 4,
	$Float64Array: 8
};

var unclampedUnsignedIntegerTypes = [
	'Int8',
	'Int16',
	'Int32'
];
var clampedTypes = [
	'Uint8C'
];
var unclampedSignedIntegerTypes = [
	'Uint8',
	'Uint16',
	'Uint32'
];
var unclampedIntegerTypes = unclampedUnsignedIntegerTypes.concat(unclampedSignedIntegerTypes);
var floatTypes = [
	'Float32',
	'Float64'
];
var integerTypes = unclampedIntegerTypes.concat(clampedTypes, floatTypes);
var bigIntTypes = [
	'BigInt64',
	'BigUint64'
];
var numberTypes = floatTypes.concat(integerTypes);
var nonIntegerTypes = floatTypes.concat(bigIntTypes);
var unsignedElementTypes = unclampedSignedIntegerTypes.concat([
	'BigUint64'
]);
var signedElementTypes = unclampedUnsignedIntegerTypes;

var canDistinguishSparseFromUndefined = 0 in [undefined]; // IE 6 - 8 have a bug where this returns false

// IE 9 does not throw in strict mode when writability/configurability/extensibility is violated
var noThrowOnStrictViolation = (function () {
	try {
		delete [].length;
		return true;
	} catch (e) {
	}
	return false;
}());

// var defaultEndianness = require('../helpers/defaultEndianness');

var nameExceptions = {
	IsArray: true,
	IsCallable: true,
	RequireObjectCoercible: true
};
var makeTest = function makeTest(ES, skips) {
	return function test(opName, maybeOpts, maybeCb) {
		var origOpts = arguments.length > 2 ? maybeOpts : {};
		var opts = assign(
			{},
			origOpts,
			{ skip: (skips && skips[opName]) || origOpts.skip }
		);
		var cb = arguments.length > 2 ? maybeCb : maybeOpts;
		return tape(
			opName,
			opts,
			ES[opName] && typeof cb === 'function' ? function (t) {
				var expectedName = opName.replace(/ /g, '');
				t.match(
					ES[opName].name,
					new RegExp('^(?:bound )' + expectedName + '$'),
					'ES.' + opName + '.name === ' + expectedName,
					{
						// node v4.0.0 has a weird bug where sometimes bound functions' names are `bound `
						skip: !functionsHaveNames || !boundFunctionsHaveNames || process.version === 'v4.0.0',
						todo: nameExceptions[opName]
					}
				);
				var origPlan = t.plan;
				t.plan = function (n) { // eslint-disable-line no-param-reassign
					origPlan.call(t, n + 1);
				};

				return cb.apply(null, arguments);
			} : cb
		);
	};
};

Test.prototype.throwsSentinel = function throwsSentinel(fn, sentinel, message) {
	try {
		fn();
		this.fail('did not throw: ' + message);
	} catch (e) {
		this.equal(e, sentinel, message);
	}
};

var leadingPoo = '\uD83D';
var trailingPoo = '\uDCA9';
var wholePoo = leadingPoo + trailingPoo;

var getArraySubclassWithSpeciesConstructor = function getArraySubclass(speciesConstructor) {
	var Bar = function Bar() {
		var inst = [];
		Object.setPrototypeOf(inst, Bar.prototype);
		defineProperty(inst, 'constructor', { value: Bar });
		return inst;
	};
	Bar.prototype = Object.create(Array.prototype);
	Object.setPrototypeOf(Bar, Array);
	defineProperty(Bar, Symbol.species, { value: speciesConstructor });

	return Bar;
};

var testIterator = function (t, iterator, expected) {
	var resultCount = 0;
	var result;
	while (result = iterator.next(), !result.done && resultCount < expected.length + 1) { // eslint-disable-line no-sequences
		t.deepEqual(result, { done: false, value: expected[resultCount] }, 'result ' + resultCount);
		resultCount += 1;
	}
	t.equal(resultCount, expected.length, 'expected ' + expected.length + ', got ' + (result.done ? '' : 'more than ') + resultCount);
};

var testAsyncIterator = function (t, asyncIterator, expected) {
	var results = arguments.length > 3 ? arguments[3] : [];

	var nextResult = asyncIterator.next();

	return Promise.resolve(nextResult).then(function (result) {
		results.push(result);
		if (!result.done && results.length < expected.length) {
			t.deepEqual(result, { done: false, value: expected[results.length - 1] }, 'result ' + (results.length - 1));
			return testAsyncIterator(t, asyncIterator, expected, results);
		}

		t.equal(results.length, expected.length, 'expected ' + expected.length + ', got ' + (result.done ? '' : 'more than ') + results.length);
		return results.length;
	});
};

var testRESIterator = function testRegExpStringIterator(ES, t, regex, str, global, unicode, expected) {
	var iterator = ES.CreateRegExpStringIterator(regex, str, global, unicode);
	t.equal(typeof iterator, 'object', 'iterator is an object');
	t.equal(typeof iterator.next, 'function', '`.next` is a function');

	t.test('has symbols', { skip: !v.hasSymbols }, function (st) {
		st.equal(typeof iterator[Symbol.iterator], 'function', '[`Symbol.iterator`] is a function');
		st.end();
	});

	testIterator(t, iterator, expected);
};

var makeIteratorRecord = function makeIteratorRecord(iterator) {
	return {
		'[[Iterator]]': iterator,
		'[[NextMethod]]': iterator.next,
		'[[Done]]': false
	};
};

var hasSpecies = v.hasSymbols && Symbol.species;

var hasLastIndex = 'lastIndex' in (/a/).exec('a'); // IE 8
var hasGroups = 'groups' in (/a/).exec('a'); // modern engines
var kludgeMatch = function kludgeMatch(R, matchObject) {
	if (hasGroups) {
		assign(matchObject, { groups: matchObject.groups });
	}
	if (hasLastIndex) {
		assign(matchObject, { lastIndex: matchObject.lastIndex || R.lastIndex });
	} else {
		delete matchObject.lastIndex; // eslint-disable-line no-param-reassign
	}
	return matchObject;
};

var clearBuffer = function clearBuffer(buffer) {
	new DataView(buffer).setFloat64(0, 0, true); // clear the buffer
};

var testEnumerableOwnNames = function (t, enumerableOwnNames) {
	forEach(v.primitives, function (nonObject) {
		t['throws'](
			function () { enumerableOwnNames(nonObject); },
			debug(nonObject) + ' is not an Object'
		);
	});

	var Child = function Child() {
		this.own = {};
	};
	Child.prototype = {
		inherited: {}
	};

	var obj = new Child();

	t.equal('own' in obj, true, 'has "own"');
	t.equal(hasOwn(obj, 'own'), true, 'has own "own"');
	t.equal(Object.prototype.propertyIsEnumerable.call(obj, 'own'), true, 'has enumerable "own"');

	t.equal('inherited' in obj, true, 'has "inherited"');
	t.equal(hasOwn(obj, 'inherited'), false, 'has non-own "inherited"');
	t.equal(hasOwn(Child.prototype, 'inherited'), true, 'Child.prototype has own "inherited"');
	t.equal(Child.prototype.inherited, obj.inherited, 'Child.prototype.inherited === obj.inherited');
	t.equal(Object.prototype.propertyIsEnumerable.call(Child.prototype, 'inherited'), true, 'has enumerable "inherited"');

	t.equal('toString' in obj, true, 'has "toString"');
	t.equal(hasOwn(obj, 'toString'), false, 'has non-own "toString"');
	t.equal(hasOwn(Object.prototype, 'toString'), true, 'Object.prototype has own "toString"');
	t.equal(Object.prototype.toString, obj.toString, 'Object.prototype.toString === obj.toString');
	// eslint-disable-next-line no-useless-call
	t.equal(Object.prototype.propertyIsEnumerable.call(Object.prototype, 'toString'), false, 'has non-enumerable "toString"');

	return obj;
};

var testStringToNumber = function (t, ES, StringToNumber) {
	// TODO: check if this applies to ES5
	t.test('trimming of whitespace and non-whitespace characters', function (st) {
		var whitespace = ' \t\x0b\f\xa0\ufeff\n\r\u2028\u2029\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000';
		if ((/\s/).test('\u180e')) {
			whitespace += '\u180e'; // in node 8.3+, the mongolian vowel separator is not whitespace
		}

		forEach(whitespace, function (ws) {
			st.equal(StringToNumber(ws + 0 + ws), 0, 'whitespace ' + debug(ws) + ' is trimmed');
		});

		st.equal(StringToNumber(whitespace + 0 + whitespace), 0, 'whitespace is trimmed');

		// Zero-width space (zws), next line character (nel), and non-character (bom) are not whitespace.
		var nonWhitespaces = {
			'\\u0085': '\u0085',
			'\\u200b': '\u200b',
			'\\ufffe': '\ufffe'
		};

		forEach(nonWhitespaces, function (desc, nonWS) {
			st.equal(StringToNumber(nonWS + 0 + nonWS), NaN, 'non-whitespace ' + desc + ' not trimmed');
		});

		st.end();
	});

	t.test('stringified numbers', function (st) {
		forEach(['foo', '0', '4a', '2.0', 'Infinity', '-Infinity'], function (numString) {
			st.equal(+numString, StringToNumber(numString), '"' + numString + '" coerces to ' + Number(numString));
		});

		forEach(v.numbers, function (number) {
			var str = number === 0 ? debug(number) : String(number);
			st.equal(StringToNumber(str), number, debug(number) + ' stringified, coerces to itself');
		});

		st.end();
	});
};

var testToNumber = function (t, ES, ToNumber) {
	t.equal(NaN, ToNumber(undefined), 'undefined coerces to NaN');
	t.equal(ToNumber(null), 0, 'null coerces to +0');
	t.equal(ToNumber(false), 0, 'false coerces to +0');
	t.equal(1, ToNumber(true), 'true coerces to 1');

	t.test('numbers', function (st) {
		st.equal(NaN, ToNumber(NaN), 'NaN returns itself');
		forEach(v.zeroes.concat(v.infinities, 42), function (num) {
			st.equal(num, ToNumber(num), num + ' returns itself');
		});
		st.end();
	});

	t.test('objects', function (st) {
		forEach(v.objects, function (object) {
			st.equal(ToNumber(object), ToNumber(ES.ToPrimitive(object)), 'object ' + object + ' coerces to same as ToPrimitive of object does');
		});
		st['throws'](function () { return ToNumber(v.uncoercibleObject); }, TypeError, 'uncoercibleObject throws');
		st.end();
	});

	// TODO: check if this applies to ES5
	t.test('binary literals', function (st) {
		st.equal(ToNumber('0b10'), 2, '0b10 is 2');
		st.equal(ToNumber({ toString: function () { return '0b11'; } }), 3, 'Object that toStrings to 0b11 is 3');

		st.equal(ToNumber('0b12'), NaN, '0b12 is NaN');
		st.equal(ToNumber({ toString: function () { return '0b112'; } }), NaN, 'Object that toStrings to 0b112 is NaN');
		st.end();
	});

	// TODO: check if this applies to ES5
	t.test('octal literals', function (st) {
		st.equal(ToNumber('0o10'), 8, '0o10 is 8');
		st.equal(ToNumber({ toString: function () { return '0o11'; } }), 9, 'Object that toStrings to 0o11 is 9');

		st.equal(ToNumber('0o18'), NaN, '0o18 is NaN');
		st.equal(ToNumber({ toString: function () { return '0o118'; } }), NaN, 'Object that toStrings to 0o118 is NaN');
		st.end();
	});

	// TODO: check if this applies to ES5
	t.test('signed hex numbers', function (st) {
		st.equal(ToNumber('-0xF'), NaN, '-0xF is NaN');
		st.equal(ToNumber(' -0xF '), NaN, 'space-padded -0xF is NaN');
		st.equal(ToNumber('+0xF'), NaN, '+0xF is NaN');
		st.equal(ToNumber(' +0xF '), NaN, 'space-padded +0xF is NaN');

		st.end();
	});

	testStringToNumber(t, ES, ToNumber);

	// TODO: skip for ES5
	forEach(v.symbols, function (symbol) {
		t['throws'](
			function () { ToNumber(symbol); },
			TypeError,
			'Symbols can’t be converted to a Number: ' + debug(symbol)
		);

		var boxed = Object(symbol);
		t['throws'](
			function () { ToNumber(boxed); },
			TypeError,
			'boxed Symbols can’t be converted to a Number: ' + debug(boxed)
		);
	});

	// TODO: check if this applies to ES5
	t.test('dates', function (st) {
		var invalid = new Date(NaN);
		st.equal(ToNumber(invalid), NaN, 'invalid Date coerces to NaN');
		var now = +new Date();
		st.equal(ToNumber(new Date(now)), now, 'Date coerces to timestamp');
		st.end();
	});
};

var es5 = function ES5(ES, ops, expectedMissing, skips) {
	var test = makeTest(ES, skips);

	test('has expected operations', function (t) {
		var diff = diffOps(ES, ops, expectedMissing, []);

		t.deepEqual(diff.extra, [], 'no extra ops');

		t.deepEqual(diff.missing, [], 'no unexpected missing ops');

		t.deepEqual(diff.extraMissing, [], 'no unexpected "expected missing" ops');

		t.end();
	});

	test('Canonicalize', function (t) {
		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { ES.Canonicalize(nonString, false); },
				TypeError,
				debug(nonString) + ' is not a String'
			);
		});

		forEach(v.nonBooleans, function (nonBoolean) {
			t['throws'](
				function () { ES.Canonicalize('', nonBoolean); },
				TypeError,
				debug(nonBoolean) + ' is not a Boolean'
			);
		});

		t.equal(ES.Canonicalize(leadingPoo, false), leadingPoo, 'when IgnoreCase is false, ch is returned');

		t.end();
	});

	test('IsPropertyDescriptor', function (t) {
		forEach(v.primitives, function (primitive) {
			t.equal(
				ES.IsPropertyDescriptor(primitive),
				false,
				debug(primitive) + ' is not a Property Descriptor'
			);
		});

		t.equal(ES.IsPropertyDescriptor({ invalid: true }), false, 'invalid keys not allowed on a Property Descriptor');

		t.equal(ES.IsPropertyDescriptor({}), true, 'empty object is an incomplete Property Descriptor');

		t.equal(ES.IsPropertyDescriptor(v.accessorDescriptor()), true, 'accessor descriptor is a Property Descriptor');
		t.equal(ES.IsPropertyDescriptor(v.mutatorDescriptor()), true, 'mutator descriptor is a Property Descriptor');
		t.equal(ES.IsPropertyDescriptor(v.dataDescriptor()), true, 'data descriptor is a Property Descriptor');
		t.equal(ES.IsPropertyDescriptor(v.genericDescriptor()), true, 'generic descriptor is a Property Descriptor');

		t['throws'](
			function () { ES.IsPropertyDescriptor(v.bothDescriptor()); },
			TypeError,
			'a Property Descriptor can not be both a Data and an Accessor Descriptor'
		);

		t['throws'](
			function () { ES.IsPropertyDescriptor(v.bothDescriptorWritable()); },
			TypeError,
			'a Property Descriptor can not be both a Data and an Accessor Descriptor'
		);

		t.end();
	});

	test('ToPrimitive', function (t) {
		t.test('primitives', function (st) {
			var testPrimitive = function (primitive) {
				st.equal(ES.ToPrimitive(primitive), primitive, debug(primitive) + ' is returned correctly');
			};
			forEach(v.primitives, testPrimitive);
			st.end();
		});

		t.test('objects', function (st) {
			st.equal(ES.ToPrimitive(v.coercibleObject), 3, 'coercibleObject with no hint coerces to valueOf');
			st.equal(ES.ToPrimitive({}), '[object Object]', '{} with no hint coerces to Object#toString');
			st.equal(ES.ToPrimitive(v.coercibleObject, Number), 3, 'coercibleObject with hint Number coerces to valueOf');
			st.equal(ES.ToPrimitive({}, Number), '[object Object]', '{} with hint Number coerces to NaN');
			st.equal(ES.ToPrimitive(v.coercibleObject, String), 42, 'coercibleObject with hint String coerces to nonstringified toString');
			st.equal(ES.ToPrimitive({}, String), '[object Object]', '{} with hint String coerces to Object#toString');
			st.equal(ES.ToPrimitive(v.coercibleFnObject), v.coercibleFnObject.toString(), 'coercibleFnObject coerces to toString');
			st.equal(ES.ToPrimitive(v.toStringOnlyObject), 7, 'toStringOnlyObject returns non-stringified toString');
			st.equal(ES.ToPrimitive(v.valueOfOnlyObject), 4, 'valueOfOnlyObject returns valueOf');
			st['throws'](function () { return ES.ToPrimitive(v.uncoercibleObject); }, TypeError, 'uncoercibleObject throws a TypeError');
			st['throws'](function () { return ES.ToPrimitive(v.uncoercibleFnObject); }, TypeError, 'uncoercibleFnObject throws a TypeError');
			st.end();
		});

		t.test('dates', function (st) {
			var invalid = new Date(NaN);
			st.equal(ES.ToPrimitive(invalid), Date.prototype.toString.call(invalid), 'invalid Date coerces to Date#toString');
			var now = new Date();
			st.equal(ES.ToPrimitive(now), Date.prototype.toString.call(now), 'Date coerces to Date#toString');
			st.end();
		});

		t.end();
	});

	test('ToBoolean', function (t) {
		t.equal(false, ES.ToBoolean(undefined), 'undefined coerces to false');
		t.equal(false, ES.ToBoolean(null), 'null coerces to false');
		t.equal(false, ES.ToBoolean(false), 'false returns false');
		t.equal(true, ES.ToBoolean(true), 'true returns true');

		t.test('numbers', function (st) {
			forEach(v.zeroes.concat(NaN), function (falsyNumber) {
				st.equal(false, ES.ToBoolean(falsyNumber), 'falsy number ' + falsyNumber + ' coerces to false');
			});
			forEach(v.infinities.concat([42, 1]), function (truthyNumber) {
				st.equal(true, ES.ToBoolean(truthyNumber), 'truthy number ' + truthyNumber + ' coerces to true');
			});

			st.end();
		});

		t.equal(false, ES.ToBoolean(''), 'empty string coerces to false');
		t.equal(true, ES.ToBoolean('foo'), 'nonempty string coerces to true');

		t.test('objects', function (st) {
			forEach(v.objects, function (obj) {
				st.equal(true, ES.ToBoolean(obj), 'object coerces to true');
			});
			st.equal(true, ES.ToBoolean(v.uncoercibleObject), 'uncoercibleObject coerces to true');

			st.end();
		});

		t.end();
	});

	test('ToNumber', function (t) {
		t.equal(NaN, ES.ToNumber(undefined), 'undefined coerces to NaN');
		t.equal(ES.ToNumber(null), 0, 'null coerces to +0');
		t.equal(ES.ToNumber(false), 0, 'false coerces to +0');
		t.equal(1, ES.ToNumber(true), 'true coerces to 1');

		t.test('numbers', function (st) {
			st.equal(NaN, ES.ToNumber(NaN), 'NaN returns itself');
			forEach(v.zeroes.concat(v.infinities, 42), function (num) {
				st.equal(num, ES.ToNumber(num), num + ' returns itself');
			});
			forEach(['foo', '0', '4a', '2.0', 'Infinity', '-Infinity'], function (numString) {
				st.equal(+numString, ES.ToNumber(numString), '"' + numString + '" coerces to ' + Number(numString));
			});
			st.end();
		});

		t.test('objects', function (st) {
			forEach(v.objects, function (object) {
				st.equal(ES.ToNumber(object), ES.ToNumber(ES.ToPrimitive(object)), 'object ' + object + ' coerces to same as ToPrimitive of object does');
			});
			st['throws'](function () { return ES.ToNumber(v.uncoercibleObject); }, TypeError, 'uncoercibleObject throws');
			st.end();
		});

		t.test('binary literals', function (st) {
			st.equal(ES.ToNumber('0b10'), NaN, '0b10 is NaN');
			st.equal(ES.ToNumber({ toString: function () { return '0b11'; } }), NaN, 'Object that toStrings to 0b11 is NaN');

			st.equal(ES.ToNumber('0b12'), NaN, '0b12 is NaN');
			st.equal(ES.ToNumber({ toString: function () { return '0b112'; } }), NaN, 'Object that toStrings to 0b112 is NaN');
			st.end();
		});

		t.test('octal literals', function (st) {
			st.equal(ES.ToNumber('0o10'), NaN, '0o10 is NaN');
			st.equal(ES.ToNumber({ toString: function () { return '0o11'; } }), NaN, 'Object that toStrings to 0o11 is NaN');

			st.equal(ES.ToNumber('0o18'), NaN, '0o18 is NaN');
			st.equal(ES.ToNumber({ toString: function () { return '0o118'; } }), NaN, 'Object that toStrings to 0o118 is NaN');
			st.end();
		});

		t.test('signed hex numbers', function (st) {
			st.equal(ES.ToNumber('-0xF'), NaN, '-0xF is NaN');
			st.equal(ES.ToNumber(' -0xF '), NaN, 'space-padded -0xF is NaN');
			st.equal(ES.ToNumber('+0xF'), NaN, '+0xF is NaN');
			st.equal(ES.ToNumber(' +0xF '), NaN, 'space-padded +0xF is NaN');

			st.end();
		});

		// TODO: check if this applies to ES5
		t.test('trimming of whitespace and non-whitespace characters', function (st) {
			var whitespace = ' \t\x0b\f\xa0\ufeff\n\r\u2028\u2029\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u0085';
			st.equal(ES.ToNumber(whitespace + 0 + whitespace), 0, 'whitespace is trimmed');

			// Zero-width space (zws), next line character (nel), and non-character (bom) are not whitespace.
			var nonWhitespaces = {
				'\\u200b': '\u200b',
				'\\ufffe': '\ufffe'
			};

			forEach(nonWhitespaces, function (desc, nonWS) {
				st.equal(ES.ToNumber(nonWS + 0 + nonWS), NaN, 'non-whitespace ' + desc + ' not trimmed');
			});

			st.end();
		});

		t.test('dates', function (st) {
			var invalid = new Date(NaN);
			st.equal(ES.ToNumber(invalid), NaN, 'invalid Date coerces to NaN');
			var now = +new Date();
			st.equal(ES.ToNumber(new Date(now)), now, 'Date coerces to timestamp');
			st.end();
		});

		t.end();
	});

	test('ToInteger', function (t) {
		forEach([NaN], function (num) {
			t.equal(0, ES.ToInteger(num), debug(num) + ' returns +0');
		});
		forEach(v.zeroes.concat(v.infinities, 42), function (num) {
			t.equal(num, ES.ToInteger(num), debug(num) + ' returns itself');
			t.equal(-num, ES.ToInteger(-num), '-' + debug(num) + ' returns itself');
		});
		t.equal(3, ES.ToInteger(Math.PI), 'pi returns 3');
		t['throws'](function () { return ES.ToInteger(v.uncoercibleObject); }, TypeError, 'uncoercibleObject throws');
		t.end();
	});

	test('ToInt32', function (t) {
		t.equal(ES.ToInt32(NaN), 0, 'NaN coerces to +0');
		forEach(v.zeroes.concat(v.infinities), function (num) {
			t.equal(ES.ToInt32(num), 0, num + ' returns +0');
			t.equal(ES.ToInt32(-num), 0, '-' + num + ' returns +0');
		});
		t['throws'](function () { return ES.ToInt32(v.uncoercibleObject); }, TypeError, 'uncoercibleObject throws');
		t.equal(ES.ToInt32(0x100000000), 0, '2^32 returns +0');
		t.equal(ES.ToInt32(0x100000000 - 1), -1, '2^32 - 1 returns -1');
		t.equal(ES.ToInt32(0x80000000), -0x80000000, '2^31 returns -2^31');
		t.equal(ES.ToInt32(0x80000000 - 1), 0x80000000 - 1, '2^31 - 1 returns 2^31 - 1');
		forEach([0, Infinity, NaN, 0x100000000, 0x80000000, 0x10000, 0x42], function (num) {
			t.equal(ES.ToInt32(num), ES.ToInt32(ES.ToUint32(num)), 'ToInt32(x) === ToInt32(ToUint32(x)) for 0x' + num.toString(16));
			t.equal(ES.ToInt32(-num), ES.ToInt32(ES.ToUint32(-num)), 'ToInt32(x) === ToInt32(ToUint32(x)) for -0x' + num.toString(16));
		});
		t.end();
	});

	test('ToUint32', function (t) {
		t.equal(0, ES.ToUint32(NaN), 'NaN coerces to +0');
		forEach([0, Infinity], function (num) {
			t.equal(0, ES.ToUint32(num), num + ' returns +0');
			t.equal(0, ES.ToUint32(-num), '-' + num + ' returns +0');
		});
		t['throws'](function () { return ES.ToUint32(v.uncoercibleObject); }, TypeError, 'uncoercibleObject throws');
		t.equal(ES.ToUint32(0x100000000), 0, '2^32 returns +0');
		t.equal(ES.ToUint32(0x100000000 - 1), 0x100000000 - 1, '2^32 - 1 returns 2^32 - 1');
		t.equal(ES.ToUint32(0x80000000), 0x80000000, '2^31 returns 2^31');
		t.equal(ES.ToUint32(0x80000000 - 1), 0x80000000 - 1, '2^31 - 1 returns 2^31 - 1');
		forEach([0, Infinity, NaN, 0x100000000, 0x80000000, 0x10000, 0x42], function (num) {
			t.equal(ES.ToUint32(num), ES.ToUint32(ES.ToInt32(num)), 'ToUint32(x) === ToUint32(ToInt32(x)) for 0x' + num.toString(16));
			t.equal(ES.ToUint32(-num), ES.ToUint32(ES.ToInt32(-num)), 'ToUint32(x) === ToUint32(ToInt32(x)) for -0x' + num.toString(16));
		});
		t.end();
	});

	test('ToUint16', function (t) {
		t.equal(0, ES.ToUint16(NaN), 'NaN coerces to +0');
		forEach([0, Infinity], function (num) {
			t.equal(0, ES.ToUint16(num), num + ' returns +0');
			t.equal(0, ES.ToUint16(-num), '-' + num + ' returns +0');
		});
		t['throws'](function () { return ES.ToUint16(v.uncoercibleObject); }, TypeError, 'uncoercibleObject throws');
		t.equal(ES.ToUint16(0x100000000), 0, '2^32 returns +0');
		t.equal(ES.ToUint16(0x100000000 - 1), 0x10000 - 1, '2^32 - 1 returns 2^16 - 1');
		t.equal(ES.ToUint16(0x80000000), 0, '2^31 returns +0');
		t.equal(ES.ToUint16(0x80000000 - 1), 0x10000 - 1, '2^31 - 1 returns 2^16 - 1');
		t.equal(ES.ToUint16(0x10000), 0, '2^16 returns +0');
		t.equal(ES.ToUint16(0x10000 - 1), 0x10000 - 1, '2^16 - 1 returns 2^16 - 1');
		t.end();
	});

	test('ToString', function (t) {
		forEach(v.objects.concat(v.nonSymbolPrimitives), function (item) {
			t.equal(ES.ToString(item), String(item), 'ES.ToString(' + debug(item) + ') ToStrings to String(' + debug(item) + ')');
		});

		t['throws'](function () { return ES.ToString(v.uncoercibleObject); }, TypeError, 'uncoercibleObject throws');

		t.end();
	});

	test('ToObject', function (t) {
		t['throws'](function () { return ES.ToObject(undefined); }, TypeError, 'undefined throws');
		t['throws'](function () { return ES.ToObject(null); }, TypeError, 'null throws');
		forEach(v.numbers, function (number) {
			var obj = ES.ToObject(number);
			t.equal(typeof obj, 'object', 'number ' + number + ' coerces to object');
			t.equal(true, obj instanceof Number, 'object of ' + number + ' is Number object');
			t.equal(obj.valueOf(), number, 'object of ' + number + ' coerces to ' + number);
		});
		t.end();
	});

	test('CheckObjectCoercible', function (t) {
		t['throws'](function () { return ES.CheckObjectCoercible(undefined); }, TypeError, 'undefined throws');
		t['throws'](function () { return ES.CheckObjectCoercible(null); }, TypeError, 'null throws');
		var checkCoercible = function (value) {
			t.doesNotThrow(function () { return ES.CheckObjectCoercible(value); }, debug(value) + ' does not throw');
		};
		forEach(v.objects.concat(v.nonNullPrimitives), checkCoercible);
		t.end();
	});

	test('IsCallable', function (t) {
		t.equal(true, ES.IsCallable(function () {}), 'function is callable');
		var nonCallables = [/a/g, {}, Object.prototype, NaN].concat(v.nonFunctions);
		forEach(nonCallables, function (nonCallable) {
			t.equal(false, ES.IsCallable(nonCallable), debug(nonCallable) + ' is not callable');
		});
		t.end();
	});

	test('SameValue', function (t) {
		t.equal(true, ES.SameValue(NaN, NaN), 'NaN is SameValue as NaN');
		t.equal(false, ES.SameValue(0, -0), '+0 is not SameValue as -0');
		forEach(v.objects.concat(v.primitives), function (val) {
			t.equal(val === val, ES.SameValue(val, val), debug(val) + ' is SameValue to itself');
		});
		t.end();
	});

	test('Type', function (t) {
		t.equal(ES.Type(), 'Undefined', 'Type() is Undefined');
		t.equal(ES.Type(undefined), 'Undefined', 'Type(undefined) is Undefined');
		t.equal(ES.Type(null), 'Null', 'Type(null) is Null');
		t.equal(ES.Type(true), 'Boolean', 'Type(true) is Boolean');
		t.equal(ES.Type(false), 'Boolean', 'Type(false) is Boolean');
		t.equal(ES.Type(0), 'Number', 'Type(0) is Number');
		t.equal(ES.Type(NaN), 'Number', 'Type(NaN) is Number');
		t.equal(ES.Type('abc'), 'String', 'Type("abc") is String');
		t.equal(ES.Type(function () {}), 'Object', 'Type(function () {}) is Object');
		t.equal(ES.Type({}), 'Object', 'Type({}) is Object');

		t.end();
	});

	test('IsAccessorDescriptor', function (t) {
		forEach(v.nonUndefinedPrimitives, function (primitive) {
			t['throws'](
				function () { ES.IsAccessorDescriptor(primitive); },
				TypeError,
				debug(primitive) + ' is not a Property Descriptor'
			);
		});

		t.equal(ES.IsAccessorDescriptor(), false, 'no value is not an Accessor Descriptor');
		t.equal(ES.IsAccessorDescriptor(undefined), false, 'undefined value is not an Accessor Descriptor');

		t.equal(ES.IsAccessorDescriptor(v.accessorDescriptor()), true, 'accessor descriptor is an Accessor Descriptor');
		t.equal(ES.IsAccessorDescriptor(v.mutatorDescriptor()), true, 'mutator descriptor is an Accessor Descriptor');
		t.equal(ES.IsAccessorDescriptor(v.dataDescriptor()), false, 'data descriptor is not an Accessor Descriptor');
		t.equal(ES.IsAccessorDescriptor(v.genericDescriptor()), false, 'generic descriptor is not an Accessor Descriptor');

		t.end();
	});

	test('IsDataDescriptor', function (t) {
		forEach(v.nonUndefinedPrimitives, function (primitive) {
			t['throws'](
				function () { ES.IsDataDescriptor(primitive); },
				TypeError,
				debug(primitive) + ' is not a Property Descriptor'
			);
		});

		t.equal(ES.IsDataDescriptor(), false, 'no value is not a Data Descriptor');
		t.equal(ES.IsDataDescriptor(undefined), false, 'undefined value is not a Data Descriptor');

		t.equal(ES.IsDataDescriptor(v.accessorDescriptor()), false, 'accessor descriptor is not a Data Descriptor');
		t.equal(ES.IsDataDescriptor(v.mutatorDescriptor()), false, 'mutator descriptor is not a Data Descriptor');
		t.equal(ES.IsDataDescriptor(v.dataDescriptor()), true, 'data descriptor is a Data Descriptor');
		t.equal(ES.IsDataDescriptor(v.genericDescriptor()), false, 'generic descriptor is not a Data Descriptor');

		t.end();
	});

	test('IsGenericDescriptor', function (t) {
		forEach(v.nonUndefinedPrimitives, function (primitive) {
			t['throws'](
				function () { ES.IsGenericDescriptor(primitive); },
				TypeError,
				debug(primitive) + ' is not a Property Descriptor'
			);
		});

		t.equal(ES.IsGenericDescriptor(), false, 'no value is not a Data Descriptor');
		t.equal(ES.IsGenericDescriptor(undefined), false, 'undefined value is not a Data Descriptor');

		t.equal(ES.IsGenericDescriptor(v.accessorDescriptor()), false, 'accessor descriptor is not a generic Descriptor');
		t.equal(ES.IsGenericDescriptor(v.mutatorDescriptor()), false, 'mutator descriptor is not a generic Descriptor');
		t.equal(ES.IsGenericDescriptor(v.dataDescriptor()), false, 'data descriptor is not a generic Descriptor');

		t.equal(ES.IsGenericDescriptor(v.genericDescriptor()), true, 'generic descriptor is a generic Descriptor');

		t.end();
	});

	test('FromPropertyDescriptor', function (t) {
		t.equal(ES.FromPropertyDescriptor(), undefined, 'no value begets undefined');
		t.equal(ES.FromPropertyDescriptor(undefined), undefined, 'undefined value begets undefined');

		forEach(v.nonNullPrimitives.concat(null), function (primitive) {
			t['throws'](
				function () { ES.FromPropertyDescriptor(primitive); },
				TypeError,
				debug(primitive) + ' is not a Property Descriptor'
			);
		});

		var accessor = v.accessorDescriptor();
		t.deepEqual(ES.FromPropertyDescriptor(accessor), {
			get: accessor['[[Get]]'],
			set: accessor['[[Set]]'],
			enumerable: !!accessor['[[Enumerable]]'],
			configurable: !!accessor['[[Configurable]]']
		});

		var mutator = v.mutatorDescriptor();
		t.deepEqual(ES.FromPropertyDescriptor(mutator), {
			get: mutator['[[Get]]'],
			set: mutator['[[Set]]'],
			enumerable: !!mutator['[[Enumerable]]'],
			configurable: !!mutator['[[Configurable]]']
		});
		var data = v.dataDescriptor();
		t.deepEqual(ES.FromPropertyDescriptor(data), {
			value: data['[[Value]]'],
			writable: data['[[Writable]]'],
			enumerable: !!data['[[Enumerable]]'],
			configurable: !!data['[[Configurable]]']
		});

		t['throws'](
			function () { ES.FromPropertyDescriptor(v.genericDescriptor()); },
			TypeError,
			'a complete Property Descriptor is required'
		);

		t.end();
	});

	test('ToPropertyDescriptor', function (t) {
		forEach(v.nonUndefinedPrimitives, function (primitive) {
			t['throws'](
				function () { ES.ToPropertyDescriptor(primitive); },
				TypeError,
				debug(primitive) + ' is not an Object'
			);
		});

		var accessor = v.accessorDescriptor();
		t.deepEqual(ES.ToPropertyDescriptor({
			get: accessor['[[Get]]'],
			enumerable: !!accessor['[[Enumerable]]'],
			configurable: !!accessor['[[Configurable]]']
		}), accessor);

		var mutator = v.mutatorDescriptor();
		t.deepEqual(ES.ToPropertyDescriptor({
			set: mutator['[[Set]]'],
			enumerable: !!mutator['[[Enumerable]]'],
			configurable: !!mutator['[[Configurable]]']
		}), mutator);

		var data = v.descriptors.nonConfigurable(v.dataDescriptor());
		t.deepEqual(ES.ToPropertyDescriptor({
			value: data['[[Value]]'],
			writable: data['[[Writable]]'],
			configurable: !!data['[[Configurable]]']
		}), data);

		var both = v.bothDescriptor();
		t['throws'](
			function () {
				ES.ToPropertyDescriptor({ get: both['[[Get]]'], value: both['[[Value]]'] });
			},
			TypeError,
			'data and accessor descriptors are mutually exclusive'
		);

		t['throws'](
			function () { ES.ToPropertyDescriptor({ get: 'not callable' }); },
			TypeError,
			'"get" must be undefined or callable'
		);

		t['throws'](
			function () { ES.ToPropertyDescriptor({ set: 'not callable' }); },
			TypeError,
			'"set" must be undefined or callable'
		);

		forEach(v.nonFunctions, function (nonFunction) {
			if (typeof nonFunction !== 'undefined') {
				t['throws'](
					function () { ES.ToPropertyDescriptor({ get: nonFunction }); },
					TypeError,
					'`.get` has ' + debug(nonFunction) + ', which is not a Function'
				);
				t['throws'](
					function () { ES.ToPropertyDescriptor({ set: nonFunction }); },
					TypeError,
					'`.set` has ' + debug(nonFunction) + ', which is not a Function'
				);
			}
		});

		forEach(['get', 'set'], function (accessorName) {
			forEach(['value', 'writable'], function (dataName) {
				var o = {};
				o[accessorName] = undefined;
				o[dataName] = undefined;

				t['throws'](
					function () { ES.ToPropertyDescriptor(o); },
					TypeError,
					accessorName + ' + ' + dataName + ' is invalid'
				);
			});
		});

		t.end();
	});

	test('Abstract Equality Comparison', function (t) {
		t.test('same types use ===', function (st) {
			forEach(v.primitives.concat(v.objects), function (value) {
				st.equal(ES['Abstract Equality Comparison'](value, value), value === value, debug(value) + ' is abstractly equal to itself');
			});
			st.end();
		});

		t.test('different types coerce', function (st) {
			var pairs = [
				[null, undefined],
				[3, '3'],
				[true, '3'],
				[true, 3],
				[false, 0],
				[false, '0'],
				[3, [3]],
				['3', [3]],
				[true, [1]],
				[false, [0]],
				[String(v.coercibleObject), v.coercibleObject],
				[Number(String(v.coercibleObject)), v.coercibleObject],
				[Number(v.coercibleObject), v.coercibleObject],
				[String(Number(v.coercibleObject)), v.coercibleObject],
				[null, {}]
			];
			forEach(pairs, function (pair) {
				var a = pair[0];
				var b = pair[1];
				// eslint-disable-next-line eqeqeq
				st.equal(ES['Abstract Equality Comparison'](a, b), a == b, debug(a) + ' == ' + debug(b));
				// eslint-disable-next-line eqeqeq
				st.equal(ES['Abstract Equality Comparison'](b, a), b == a, debug(b) + ' == ' + debug(a));
			});
			st.end();
		});

		t.end();
	});

	test('Strict Equality Comparison', function (t) {
		t.test('same types use ===', function (st) {
			forEach(v.primitives.concat(v.objects), function (value) {
				st.equal(ES['Strict Equality Comparison'](value, value), value === value, debug(value) + ' is strictly equal to itself');
			});
			st.end();
		});

		t.test('different types are not ===', function (st) {
			var pairs = [
				[null, undefined],
				[3, '3'],
				[true, '3'],
				[true, 3],
				[false, 0],
				[false, '0'],
				[3, [3]],
				['3', [3]],
				[true, [1]],
				[false, [0]],
				[String(v.coercibleObject), v.coercibleObject],
				[Number(String(v.coercibleObject)), v.coercibleObject],
				[Number(v.coercibleObject), v.coercibleObject],
				[String(Number(v.coercibleObject)), v.coercibleObject]
			];
			forEach(pairs, function (pair) {
				var a = pair[0];
				var b = pair[1];
				st.equal(ES['Strict Equality Comparison'](a, b), a === b, debug(a) + ' === ' + debug(b));
				st.equal(ES['Strict Equality Comparison'](b, a), b === a, debug(b) + ' === ' + debug(a));
			});
			st.end();
		});

		t.end();
	});

	test('Abstract Relational Comparison', function (t) {
		t.test('at least one operand is NaN', function (st) {
			st.equal(ES['Abstract Relational Comparison'](NaN, {}, true), undefined, 'LeftFirst: first is NaN, returns undefined');
			st.equal(ES['Abstract Relational Comparison']({}, NaN, true), undefined, 'LeftFirst: second is NaN, returns undefined');
			st.equal(ES['Abstract Relational Comparison'](NaN, {}, false), undefined, '!LeftFirst: first is NaN, returns undefined');
			st.equal(ES['Abstract Relational Comparison']({}, NaN, false), undefined, '!LeftFirst: second is NaN, returns undefined');
			st.end();
		});

		forEach(v.nonBooleans, function (nonBoolean) {
			t['throws'](
				function () { ES['Abstract Relational Comparison'](3, 4, nonBoolean); },
				TypeError,
				debug(nonBoolean) + ' is not a Boolean'
			);
		});

		forEach(v.zeroes, function (zero) {
			t.equal(ES['Abstract Relational Comparison'](zero, 1, true), true, 'LeftFirst: ' + debug(zero) + ' is less than 1');
			t.equal(ES['Abstract Relational Comparison'](zero, 1, false), true, '!LeftFirst: ' + debug(zero) + ' is less than 1');
			t.equal(ES['Abstract Relational Comparison'](1, zero, true), false, 'LeftFirst: 1 is not less than ' + debug(zero));
			t.equal(ES['Abstract Relational Comparison'](1, zero, false), false, '!LeftFirst: 1 is not less than ' + debug(zero));

			t.equal(ES['Abstract Relational Comparison'](zero, zero, true), false, 'LeftFirst: ' + debug(zero) + ' is not less than ' + debug(zero));
			t.equal(ES['Abstract Relational Comparison'](zero, zero, false), false, '!LeftFirst: ' + debug(zero) + ' is not less than ' + debug(zero));
		});

		t.equal(ES['Abstract Relational Comparison'](Infinity, -Infinity, true), false, 'LeftFirst: ∞ is not less than -∞');
		t.equal(ES['Abstract Relational Comparison'](Infinity, -Infinity, false), false, '!LeftFirst: ∞ is not less than -∞');
		t.equal(ES['Abstract Relational Comparison'](-Infinity, Infinity, true), true, 'LeftFirst: -∞ is less than ∞');
		t.equal(ES['Abstract Relational Comparison'](-Infinity, Infinity, false), true, '!LeftFirst: -∞ is less than ∞');
		t.equal(ES['Abstract Relational Comparison'](-Infinity, 0, true), true, 'LeftFirst: -∞ is less than +0');
		t.equal(ES['Abstract Relational Comparison'](-Infinity, 0, false), true, '!LeftFirst: -∞ is less than +0');
		t.equal(ES['Abstract Relational Comparison'](0, -Infinity, true), false, 'LeftFirst: +0 is not less than -∞');
		t.equal(ES['Abstract Relational Comparison'](0, -Infinity, false), false, '!LeftFirst: +0 is not less than -∞');

		t.equal(ES['Abstract Relational Comparison'](3, 4, true), true, 'LeftFirst: 3 is less than 4');
		t.equal(ES['Abstract Relational Comparison'](4, 3, true), false, 'LeftFirst: 3 is not less than 4');
		t.equal(ES['Abstract Relational Comparison'](3, 4, false), true, '!LeftFirst: 3 is less than 4');
		t.equal(ES['Abstract Relational Comparison'](4, 3, false), false, '!LeftFirst: 3 is not less than 4');

		t.equal(ES['Abstract Relational Comparison']('3', '4', true), true, 'LeftFirst: "3" is less than "4"');
		t.equal(ES['Abstract Relational Comparison']('4', '3', true), false, 'LeftFirst: "3" is not less than "4"');
		t.equal(ES['Abstract Relational Comparison']('3', '4', false), true, '!LeftFirst: "3" is less than "4"');
		t.equal(ES['Abstract Relational Comparison']('4', '3', false), false, '!LeftFirst: "3" is not less than "4"');

		t.equal(ES['Abstract Relational Comparison']('a', 'abc', true), true, 'LeftFirst: "a" is less than "abc"');
		t.equal(ES['Abstract Relational Comparison']('abc', 'a', true), false, 'LeftFirst: "abc" is not less than "a"');
		t.equal(ES['Abstract Relational Comparison']('a', 'abc', false), true, '!LeftFirst: "a" is less than "abc"');
		t.equal(ES['Abstract Relational Comparison']('abc', 'a', false), false, '!LeftFirst: "abc" is not less than "a"');

		t.equal(ES['Abstract Relational Comparison'](v.coercibleObject, 42, true), true, 'LeftFirst: coercible object is less than 42');
		t.equal(ES['Abstract Relational Comparison'](42, v.coercibleObject, true), false, 'LeftFirst: 42 is not less than coercible object');
		t.equal(ES['Abstract Relational Comparison'](v.coercibleObject, 42, false), true, '!LeftFirst: coercible object is less than 42');
		t.equal(ES['Abstract Relational Comparison'](42, v.coercibleObject, false), false, '!LeftFirst: 42 is not less than coercible object');

		t.equal(ES['Abstract Relational Comparison'](v.coercibleObject, '3', true), false, 'LeftFirst: coercible object is not less than "3"');
		t.equal(ES['Abstract Relational Comparison']('3', v.coercibleObject, true), false, 'LeftFirst: "3" is not less than coercible object');
		t.equal(ES['Abstract Relational Comparison'](v.coercibleObject, '3', false), false, '!LeftFirst: coercible object is not less than "3"');
		t.equal(ES['Abstract Relational Comparison']('3', v.coercibleObject, false), false, '!LeftFirst: "3" is not less than coercible object');

		// TODO: compare LeftFirst true/false for observability

		t.end();
	});

	test('SecFromTime', function (t) {
		var now = new Date();
		t.equal(ES.SecFromTime(now.getTime()), now.getUTCSeconds(), 'second from Date timestamp matches getUTCSeconds');
		t.end();
	});

	test('MinFromTime', function (t) {
		var now = new Date();
		t.equal(ES.MinFromTime(now.getTime()), now.getUTCMinutes(), 'minute from Date timestamp matches getUTCMinutes');
		t.end();
	});

	test('HourFromTime', function (t) {
		var now = new Date();
		t.equal(ES.HourFromTime(now.getTime()), now.getUTCHours(), 'hour from Date timestamp matches getUTCHours');
		t.end();
	});

	test('msFromTime', function (t) {
		var now = new Date();
		t.equal(ES.msFromTime(now.getTime()), now.getUTCMilliseconds(), 'ms from Date timestamp matches getUTCMilliseconds');
		t.end();
	});

	var msPerSecond = 1e3;
	var msPerMinute = 60 * msPerSecond;
	var msPerHour = 60 * msPerMinute;
	var msPerDay = 24 * msPerHour;

	test('Day', function (t) {
		var time = Date.UTC(2019, 8, 10, 2, 3, 4, 5);
		var add = 2.5;
		var later = new Date(time + (add * msPerDay));

		t.equal(ES.Day(later.getTime()), ES.Day(time) + Math.floor(add), 'adding 2.5 days worth of ms, gives a Day delta of 2');
		t.end();
	});

	test('DayFromYear', function (t) {
		t.equal(ES.DayFromYear(2021) - ES.DayFromYear(2020), 366, '2021 is a leap year, has 366 days');
		t.equal(ES.DayFromYear(2020) - ES.DayFromYear(2019), 365, '2020 is not a leap year, has 365 days');
		t.equal(ES.DayFromYear(2019) - ES.DayFromYear(2018), 365, '2019 is not a leap year, has 365 days');
		t.equal(ES.DayFromYear(2018) - ES.DayFromYear(2017), 365, '2018 is not a leap year, has 365 days');
		t.equal(ES.DayFromYear(2017) - ES.DayFromYear(2016), 366, '2017 is a leap year, has 366 days');

		t.end();
	});

	test('TimeWithinDay', function (t) {
		var time = Date.UTC(2019, 8, 10, 2, 3, 4, 5);
		var add = 2.5;
		var later = new Date(time + (add * msPerDay));

		t.equal(ES.TimeWithinDay(later.getTime()), ES.TimeWithinDay(time) + (0.5 * msPerDay), 'adding 2.5 days worth of ms, gives a TimeWithinDay delta of +0.5');
		t.end();
	});

	test('TimeFromYear', function (t) {
		for (var i = 1900; i < 2100; i += 1) {
			t.equal(ES.TimeFromYear(i), Date.UTC(i, 0, 1), 'TimeFromYear matches a Date object’s year: ' + i);
		}
		t.end();
	});

	test('YearFromTime', function (t) {
		for (var i = 1900; i < 2100; i += 1) {
			t.equal(ES.YearFromTime(Date.UTC(i, 0, 1)), i, 'YearFromTime matches a Date object’s year on 1/1: ' + i);
			t.equal(ES.YearFromTime(Date.UTC(i, 10, 1)), i, 'YearFromTime matches a Date object’s year on 10/1: ' + i);
		}
		t.end();
	});

	test('WeekDay', function (t) {
		var now = new Date();
		var today = now.getUTCDay();
		for (var i = 0; i < 7; i += 1) {
			var weekDay = ES.WeekDay(now.getTime() + (i * msPerDay));
			t.equal(weekDay, (today + i) % 7, i + ' days after today (' + today + '), WeekDay is ' + weekDay);
		}
		t.end();
	});

	test('DaysInYear', function (t) {
		t.equal(ES.DaysInYear(2021), 365, '2021 is not a leap year');
		t.equal(ES.DaysInYear(2020), 366, '2020 is a leap year');
		t.equal(ES.DaysInYear(2019), 365, '2019 is not a leap year');
		t.equal(ES.DaysInYear(2018), 365, '2018 is not a leap year');
		t.equal(ES.DaysInYear(2017), 365, '2017 is not a leap year');
		t.equal(ES.DaysInYear(2016), 366, '2016 is a leap year');
		t.equal(ES.DaysInYear(2000), 366, '2000 is a leap year');
		t.equal(ES.DaysInYear(1900), 365, '1900 is not a leap year');

		t.end();
	});

	test('InLeapYear', function (t) {
		t.equal(ES.InLeapYear(Date.UTC(2021, 0, 1)), 0, '2021 is not a leap year');
		t.equal(ES.InLeapYear(Date.UTC(2020, 0, 1)), 1, '2020 is a leap year');
		t.equal(ES.InLeapYear(Date.UTC(2019, 0, 1)), 0, '2019 is not a leap year');
		t.equal(ES.InLeapYear(Date.UTC(2018, 0, 1)), 0, '2018 is not a leap year');
		t.equal(ES.InLeapYear(Date.UTC(2017, 0, 1)), 0, '2017 is not a leap year');
		t.equal(ES.InLeapYear(Date.UTC(2016, 0, 1)), 1, '2016 is a leap year');

		t.end();
	});

	test('DayWithinYear', function (t) {
		t.equal(ES.DayWithinYear(Date.UTC(2019, 0, 1)), 0, '1/1 is the 1st day');
		t.equal(ES.DayWithinYear(Date.UTC(2019, 11, 31)), 364, '12/31 is the 365th day in a non leap year');
		t.equal(ES.DayWithinYear(Date.UTC(2016, 11, 31)), 365, '12/31 is the 366th day in a leap year');

		t.end();
	});

	test('MonthFromTime', function (t) {
		t.equal(ES.MonthFromTime(Date.UTC(2019, 0, 1)), 0, 'non-leap: 1/1 gives January');
		t.equal(ES.MonthFromTime(Date.UTC(2019, 0, 31)), 0, 'non-leap: 1/31 gives January');
		t.equal(ES.MonthFromTime(Date.UTC(2019, 1, 1)), 1, 'non-leap: 2/1 gives February');
		t.equal(ES.MonthFromTime(Date.UTC(2019, 1, 28)), 1, 'non-leap: 2/28 gives February');
		t.equal(ES.MonthFromTime(Date.UTC(2019, 1, 29)), 2, 'non-leap: 2/29 gives March');
		t.equal(ES.MonthFromTime(Date.UTC(2019, 2, 1)), 2, 'non-leap: 3/1 gives March');
		t.equal(ES.MonthFromTime(Date.UTC(2019, 2, 31)), 2, 'non-leap: 3/31 gives March');
		t.equal(ES.MonthFromTime(Date.UTC(2019, 3, 1)), 3, 'non-leap: 4/1 gives April');
		t.equal(ES.MonthFromTime(Date.UTC(2019, 3, 30)), 3, 'non-leap: 4/30 gives April');
		t.equal(ES.MonthFromTime(Date.UTC(2019, 4, 1)), 4, 'non-leap: 5/1 gives May');
		t.equal(ES.MonthFromTime(Date.UTC(2019, 4, 31)), 4, 'non-leap: 5/31 gives May');
		t.equal(ES.MonthFromTime(Date.UTC(2019, 5, 1)), 5, 'non-leap: 6/1 gives June');
		t.equal(ES.MonthFromTime(Date.UTC(2019, 5, 30)), 5, 'non-leap: 6/30 gives June');
		t.equal(ES.MonthFromTime(Date.UTC(2019, 6, 1)), 6, 'non-leap: 7/1 gives July');
		t.equal(ES.MonthFromTime(Date.UTC(2019, 6, 31)), 6, 'non-leap: 7/31 gives July');
		t.equal(ES.MonthFromTime(Date.UTC(2019, 7, 1)), 7, 'non-leap: 8/1 gives August');
		t.equal(ES.MonthFromTime(Date.UTC(2019, 7, 30)), 7, 'non-leap: 8/30 gives August');
		t.equal(ES.MonthFromTime(Date.UTC(2019, 8, 1)), 8, 'non-leap: 9/1 gives September');
		t.equal(ES.MonthFromTime(Date.UTC(2019, 8, 30)), 8, 'non-leap: 9/30 gives September');
		t.equal(ES.MonthFromTime(Date.UTC(2019, 9, 1)), 9, 'non-leap: 10/1 gives October');
		t.equal(ES.MonthFromTime(Date.UTC(2019, 9, 31)), 9, 'non-leap: 10/31 gives October');
		t.equal(ES.MonthFromTime(Date.UTC(2019, 10, 1)), 10, 'non-leap: 11/1 gives November');
		t.equal(ES.MonthFromTime(Date.UTC(2019, 10, 30)), 10, 'non-leap: 11/30 gives November');
		t.equal(ES.MonthFromTime(Date.UTC(2019, 11, 1)), 11, 'non-leap: 12/1 gives December');
		t.equal(ES.MonthFromTime(Date.UTC(2019, 11, 31)), 11, 'non-leap: 12/31 gives December');

		t.equal(ES.MonthFromTime(Date.UTC(2016, 0, 1)), 0, 'leap: 1/1 gives January');
		t.equal(ES.MonthFromTime(Date.UTC(2016, 0, 31)), 0, 'leap: 1/31 gives January');
		t.equal(ES.MonthFromTime(Date.UTC(2016, 1, 1)), 1, 'leap: 2/1 gives February');
		t.equal(ES.MonthFromTime(Date.UTC(2016, 1, 28)), 1, 'leap: 2/28 gives February');
		t.equal(ES.MonthFromTime(Date.UTC(2016, 1, 29)), 1, 'leap: 2/29 gives February');
		t.equal(ES.MonthFromTime(Date.UTC(2016, 2, 1)), 2, 'leap: 3/1 gives March');
		t.equal(ES.MonthFromTime(Date.UTC(2016, 2, 31)), 2, 'leap: 3/31 gives March');
		t.equal(ES.MonthFromTime(Date.UTC(2016, 3, 1)), 3, 'leap: 4/1 gives April');
		t.equal(ES.MonthFromTime(Date.UTC(2016, 3, 30)), 3, 'leap: 4/30 gives April');
		t.equal(ES.MonthFromTime(Date.UTC(2016, 4, 1)), 4, 'leap: 5/1 gives May');
		t.equal(ES.MonthFromTime(Date.UTC(2016, 4, 31)), 4, 'leap: 5/31 gives May');
		t.equal(ES.MonthFromTime(Date.UTC(2016, 5, 1)), 5, 'leap: 6/1 gives June');
		t.equal(ES.MonthFromTime(Date.UTC(2016, 5, 30)), 5, 'leap: 6/30 gives June');
		t.equal(ES.MonthFromTime(Date.UTC(2016, 6, 1)), 6, 'leap: 7/1 gives July');
		t.equal(ES.MonthFromTime(Date.UTC(2016, 6, 31)), 6, 'leap: 7/31 gives July');
		t.equal(ES.MonthFromTime(Date.UTC(2016, 7, 1)), 7, 'leap: 8/1 gives August');
		t.equal(ES.MonthFromTime(Date.UTC(2016, 7, 30)), 7, 'leap: 8/30 gives August');
		t.equal(ES.MonthFromTime(Date.UTC(2016, 8, 1)), 8, 'leap: 9/1 gives September');
		t.equal(ES.MonthFromTime(Date.UTC(2016, 8, 30)), 8, 'leap: 9/30 gives September');
		t.equal(ES.MonthFromTime(Date.UTC(2016, 9, 1)), 9, 'leap: 10/1 gives October');
		t.equal(ES.MonthFromTime(Date.UTC(2016, 9, 31)), 9, 'leap: 10/31 gives October');
		t.equal(ES.MonthFromTime(Date.UTC(2016, 10, 1)), 10, 'leap: 11/1 gives November');
		t.equal(ES.MonthFromTime(Date.UTC(2016, 10, 30)), 10, 'leap: 11/30 gives November');
		t.equal(ES.MonthFromTime(Date.UTC(2016, 11, 1)), 11, 'leap: 12/1 gives December');
		t.equal(ES.MonthFromTime(Date.UTC(2016, 11, 31)), 11, 'leap: 12/31 gives December');
		t.end();
	});

	test('DateFromTime', function (t) {
		var i;
		for (i = 1; i <= 28; i += 1) {
			t.equal(ES.DateFromTime(Date.UTC(2019, 1, i)), i, '2019.02.' + i + ' is date ' + i);
		}
		for (i = 1; i <= 29; i += 1) {
			t.equal(ES.DateFromTime(Date.UTC(2016, 1, i)), i, '2016.02.' + i + ' is date ' + i);
		}
		for (i = 1; i <= 30; i += 1) {
			t.equal(ES.DateFromTime(Date.UTC(2019, 2, i)), i, '2019.03.' + i + ' is date ' + i);
			t.equal(ES.DateFromTime(Date.UTC(2019, 3, i)), i, '2019.04.' + i + ' is date ' + i);
			t.equal(ES.DateFromTime(Date.UTC(2019, 5, i)), i, '2019.06.' + i + ' is date ' + i);
			t.equal(ES.DateFromTime(Date.UTC(2019, 7, i)), i, '2019.08.' + i + ' is date ' + i);
			t.equal(ES.DateFromTime(Date.UTC(2019, 8, i)), i, '2019.09.' + i + ' is date ' + i);
			t.equal(ES.DateFromTime(Date.UTC(2019, 10, i)), i, '2019.11.' + i + ' is date ' + i);
		}
		for (i = 1; i <= 31; i += 1) {
			t.equal(ES.DateFromTime(Date.UTC(2019, 0, i)), i, '2019.01.' + i + ' is date ' + i);
			t.equal(ES.DateFromTime(Date.UTC(2019, 4, i)), i, '2019.05.' + i + ' is date ' + i);
			t.equal(ES.DateFromTime(Date.UTC(2019, 6, i)), i, '2019.07.' + i + ' is date ' + i);
			t.equal(ES.DateFromTime(Date.UTC(2019, 9, i)), i, '2019.10.' + i + ' is date ' + i);
			t.equal(ES.DateFromTime(Date.UTC(2019, 11, i)), i, '2019.12.' + i + ' is date ' + i);
		}
		t.end();
	});

	test('MakeDay', function (t) {
		forEach([NaN, Infinity, -Infinity, MAX_VALUE], function (nonFiniteNumber) {
			t.equal(ES.MakeDay(nonFiniteNumber, 0, 0), NaN, 'year: ' + debug(nonFiniteNumber) + ' is not finite');
			t.equal(ES.MakeDay(0, nonFiniteNumber, 0), NaN, 'month: ' + debug(nonFiniteNumber) + ' is not finite');
			t.equal(ES.MakeDay(0, 0, nonFiniteNumber), NaN, 'date: ' + debug(nonFiniteNumber) + ' is not finite');
		});

		t.equal(ES.MakeDay(MAX_VALUE, MAX_VALUE, 0), NaN, 'year: ' + debug(MAX_VALUE) + ' combined with month: ' + debug(MAX_VALUE) + ' is too large');

		var day2015 = 16687;
		t.equal(ES.MakeDay(2015, 8, 9), day2015, '2015.09.09 is day 16687');
		var day2016 = day2015 + 366; // 2016 is a leap year
		t.equal(ES.MakeDay(2016, 8, 9), day2016, '2015.09.09 is day 17053');
		var day2017 = day2016 + 365;
		t.equal(ES.MakeDay(2017, 8, 9), day2017, '2017.09.09 is day 17418');
		var day2018 = day2017 + 365;
		t.equal(ES.MakeDay(2018, 8, 9), day2018, '2018.09.09 is day 17783');
		var day2019 = day2018 + 365;
		t.equal(ES.MakeDay(2019, 8, 9), day2019, '2019.09.09 is day 18148');

		t.end();
	});

	test('MakeDate', function (t) {
		forEach(v.infinities.concat(NaN), function (nonFiniteNumber) {
			t.equal(ES.MakeDate(nonFiniteNumber, 0), NaN, debug(nonFiniteNumber) + ' is not a finite `day`');
			t.equal(ES.MakeDate(0, nonFiniteNumber), NaN, debug(nonFiniteNumber) + ' is not a finite `time`');
		});
		t.equal(ES.MakeDate(0, 0), 0, 'zero day and zero time is zero date');
		t.equal(ES.MakeDate(0, 123), 123, 'zero day and nonzero time is a date of the "time"');
		t.equal(ES.MakeDate(1, 0), msPerDay, 'day of 1 and zero time is a date of "ms per day"');
		t.equal(ES.MakeDate(3, 0), 3 * msPerDay, 'day of 3 and zero time is a date of thrice "ms per day"');
		t.equal(ES.MakeDate(1, 123), msPerDay + 123, 'day of 1 and nonzero time is a date of "ms per day" plus the "time"');
		t.equal(ES.MakeDate(3, 123), (3 * msPerDay) + 123, 'day of 3 and nonzero time is a date of thrice "ms per day" plus the "time"');

		t.end();
	});

	test('MakeTime', function (t) {
		forEach(v.infinities.concat(NaN), function (nonFiniteNumber) {
			t.equal(ES.MakeTime(nonFiniteNumber, 0, 0, 0), NaN, debug(nonFiniteNumber) + ' is not a finite `hour`');
			t.equal(ES.MakeTime(0, nonFiniteNumber, 0, 0), NaN, debug(nonFiniteNumber) + ' is not a finite `min`');
			t.equal(ES.MakeTime(0, 0, nonFiniteNumber, 0), NaN, debug(nonFiniteNumber) + ' is not a finite `sec`');
			t.equal(ES.MakeTime(0, 0, 0, nonFiniteNumber), NaN, debug(nonFiniteNumber) + ' is not a finite `ms`');
		});

		t.equal(
			ES.MakeTime(1.2, 2.3, 3.4, 4.5),
			(1 * msPerHour) + (2 * msPerMinute) + (3 * msPerSecond) + 4,
			'all numbers are converted to integer, multiplied by the right number of ms, and summed'
		);

		t.end();
	});

	test('TimeClip', function (t) {
		forEach(v.infinities.concat(NaN), function (nonFiniteNumber) {
			t.equal(ES.TimeClip(nonFiniteNumber), NaN, debug(nonFiniteNumber) + ' is not a finite `time`');
		});
		t.equal(ES.TimeClip(8.64e15 + 1), NaN, '8.64e15 is the largest magnitude considered "finite"');
		t.equal(ES.TimeClip(-8.64e15 - 1), NaN, '-8.64e15 is the largest magnitude considered "finite"');

		forEach(v.zeroes.concat([-10, 10, +new Date()]), function (time) {
			t.looseEqual(ES.TimeClip(time), time, debug(time) + ' is a time of ' + debug(time));
		});

		t.end();
	});

	test('modulo', function (t) {
		t.equal(3 % 2, 1, '+3 % 2 is +1');
		t.equal(ES.modulo(3, 2), 1, '+3 mod 2 is +1');

		t.equal(-3 % 2, -1, '-3 % 2 is -1');
		t.equal(ES.modulo(-3, 2), 1, '-3 mod 2 is +1');
		t.end();
	});

	test('floor', function (t) {
		t.equal(ES.floor(3.2), 3, 'floor(3.2) is 3');
		t.equal(ES.floor(-3.2), -4, 'floor(-3.2) is -4');
		t.equal(ES.floor(0), 0, 'floor(+0) is +0');
		t.equal(ES.floor(-0), -0, 'floor(-0) is -0');

		t.end();
	});
};

var es2015 = function ES2015(ES, ops, expectedMissing, skips) {
	es5(ES, ops, expectedMissing, assign(assign({}, skips), {
		Canonicalize: true,
		CheckObjectCoercible: true,
		FromPropertyDescriptor: true,
		ToNumber: true,
		ToString: true,
		Type: true
	}));
	var test = makeTest(ES, skips);

	var getNamelessFunction = function () {
		var f = Object(function () {});
		try {
			delete f.name;
		} catch (e) { /**/ }
		return f;
	};

	test('Abstract Equality Comparison', { skip: !v.hasSymbols }, function (t) {
		t.equal(
			ES['Abstract Equality Comparison'](Symbol(), Symbol()),
			false,
			'Abstract Equality Comparison with two distinct Symbols with no description returns false'
		);

		t.equal(
			ES['Abstract Equality Comparison'](Symbol('x'), Symbol('x')),
			false,
			'Abstract Equality Comparison with two distinct Symbols with the same description returns false'
		);

		t.equal(
			ES['Abstract Equality Comparison'](Symbol.iterator, Symbol.iterator),
			true,
			'Abstract Equality Comparison with two identical Symbols returns true'
		);

		var x = Symbol('x');
		t.equal(
			ES['Abstract Equality Comparison']({ valueOf: function () { return x; } }, x),
			true,
			'Abstract Equality Comparison with an object that coerces to a Symbol, and that Symbol, returns true'
		);
		t.equal(
			ES['Abstract Equality Comparison'](x, { valueOf: function () { return x; } }),
			true,
			'Abstract Equality Comparison with a Symbol, and an object that coerces to that Symbol, returns true'
		);

		t.end();
	});

	test('AdvanceStringIndex', function (t) {
		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { ES.AdvanceStringIndex(nonString); },
				TypeError,
				'"S" argument must be a String; ' + debug(nonString) + ' is not'
			);
		});

		var notInts = v.nonNumbers.concat(
			v.nonIntegerNumbers,
			v.infinities,
			[NaN, [], new Date(), Math.pow(2, 53), -1]
		);
		forEach(notInts, function (nonInt) {
			t['throws'](
				function () { ES.AdvanceStringIndex('abc', nonInt); },
				TypeError,
				'"index" argument must be an integer, ' + debug(nonInt) + ' is not.'
			);
		});

		forEach(v.nonBooleans, function (nonBoolean) {
			t['throws'](
				function () { ES.AdvanceStringIndex('abc', 0, nonBoolean); },
				TypeError,
				debug(nonBoolean) + ' is not a Boolean'
			);
		});

		var str = 'a' + wholePoo + 'c';

		t.test('non-unicode mode', function (st) {
			for (var i = 0; i < str.length + 2; i += 1) {
				st.equal(ES.AdvanceStringIndex(str, i, false), i + 1, i + ' advances to ' + (i + 1));
			}

			st.end();
		});

		t.test('unicode mode', function (st) {
			st.equal(ES.AdvanceStringIndex(str, 0, true), 1, '0 advances to 1');
			st.equal(ES.AdvanceStringIndex(str, 1, true), 3, '1 advances to 3');
			st.equal(ES.AdvanceStringIndex(str, 2, true), 3, '2 advances to 3');
			st.equal(ES.AdvanceStringIndex(str, 3, true), 4, '3 advances to 4');
			st.equal(ES.AdvanceStringIndex(str, 4, true), 5, '4 advances to 5');

			st.end();
		});

		t.test('lone surrogates', function (st) {
			var halfPoo = 'a' + leadingPoo + 'c';

			st.equal(ES.AdvanceStringIndex(halfPoo, 0, true), 1, '0 advances to 1');
			st.equal(ES.AdvanceStringIndex(halfPoo, 1, true), 2, '1 advances to 2');
			st.equal(ES.AdvanceStringIndex(halfPoo, 2, true), 3, '2 advances to 3');
			st.equal(ES.AdvanceStringIndex(halfPoo, 3, true), 4, '3 advances to 4');

			st.end();
		});

		t.test('surrogate pairs', function (st) {
			var lowestPair = String.fromCharCode(0xD800) + String.fromCharCode(0xDC00);
			var highestPair = String.fromCharCode(0xDBFF) + String.fromCharCode(0xDFFF);

			st.equal(ES.AdvanceStringIndex(lowestPair, 0, true), 2, 'lowest surrogate pair, 0 -> 2');
			st.equal(ES.AdvanceStringIndex(highestPair, 0, true), 2, 'highest surrogate pair, 0 -> 2');
			st.equal(ES.AdvanceStringIndex(wholePoo, 0, true), 2, 'poop, 0 -> 2');

			st.end();
		});

		t.end();
	});

	test('ArrayCreate', function (t) {
		forEach(v.notNonNegativeIntegers, function (nonIntegerNumber) {
			t['throws'](
				function () { ES.ArrayCreate(nonIntegerNumber); },
				TypeError,
				'length must be an integer number >= 0'
			);
		});

		t['throws'](
			function () { ES.ArrayCreate(Math.pow(2, 32)); },
			RangeError,
			'length must be < 2**32'
		);

		t.deepEqual(ES.ArrayCreate(-0), [], 'length of -0 creates an empty array');
		t.deepEqual(ES.ArrayCreate(0), [], 'length of +0 creates an empty array');
		// eslint-disable-next-line no-sparse-arrays, comma-spacing
		t.deepEqual(ES.ArrayCreate(1), [,], 'length of 1 creates a sparse array of length 1');
		// eslint-disable-next-line no-sparse-arrays, comma-spacing
		t.deepEqual(ES.ArrayCreate(2), [,,], 'length of 2 creates a sparse array of length 2');

		t.test('proto argument', { skip: !$setProto }, function (st) {
			var fakeProto = {
				push: { toString: function () { return 'not array push'; } }
			};
			st.equal(ES.ArrayCreate(0, fakeProto).push, fakeProto.push, 'passing the proto argument works');
			st.end();
		});

		t.end();
	});

	test('ArraySetLength', function (t) {
		forEach(v.primitives.concat(v.objects), function (nonArray) {
			t['throws'](
				function () { ES.ArraySetLength(nonArray, { '[[Value]]': 0 }); },
				TypeError,
				'A: ' + debug(nonArray) + ' is not an Array'
			);
		});

		forEach(v.nonUndefinedPrimitives, function (primitive) {
			t['throws'](
				function () { ES.ArraySetLength([], primitive); },
				TypeError,
				'Desc: ' + debug(primitive) + ' is not a Property Descriptor'
			);
		});

		t.test('making length nonwritable', { skip: !getOwnPropertyDescriptor }, function (st) {
			var a = [0];
			st.equal(
				ES.ArraySetLength(a, { '[[Writable]]': false }),
				true,
				'array is made non-writable'
			);

			st.deepEqual(
				getOwnPropertyDescriptor(a, 'length'),
				{
					configurable: false,
					enumerable: false,
					value: 1,
					writable: false
				},
				'without a value, length becomes nonwritable'
			);

			st.equal(
				ES.ArraySetLength(a, { '[[Value]]': 0 }),
				false,
				'setting a lower value on a non-writable length fails'
			);
			st.equal(a.length, 1, 'array still has a length of 1');

			st.equal(
				ES.ArraySetLength(a, { '[[Value]]': 2 }),
				false,
				'setting a higher value on a non-writable length fails'
			);
			st.equal(a.length, 1, 'array still has a length of 1');

			st.end();
		});

		forEach([-1, Math.pow(2, 32)].concat(v.nonIntegerNumbers), function (nonLength) {
			t['throws'](
				function () { ES.ArraySetLength([], { '[[Value]]': nonLength }); },
				RangeError,
				'a non-integer, negative, or > (2**31 - 1) is not a valid length: ' + debug(nonLength)
			);
		});

		var arr = [];
		t.equal(
			ES.ArraySetLength(arr, { '[[Value]]': 7 }),
			true,
			'set length succeeded'
		);
		t.equal(arr.length, 7, 'array now has a length of 0 -> 7');

		t.equal(
			ES.ArraySetLength(arr, { '[[Value]]': 2 }),
			true,
			'set length succeeded'
		);
		t.equal(arr.length, 2, 'array now has a length of 7 -> 2');

		t.end();
	});

	test('ArraySpeciesCreate', function (t) {
		t.test('errors', function (st) {
			forEach(v.nonNumbers, function (nonNumber) {
				st['throws'](
					function () { ES.ArraySpeciesCreate([], nonNumber); },
					TypeError,
					debug(nonNumber) + ' is not a number'
				);
			});

			st['throws'](
				function () { ES.ArraySpeciesCreate([], -1); },
				TypeError,
				'-1 is not >= 0'
			);
			st['throws'](
				function () { ES.ArraySpeciesCreate([], -Infinity); },
				TypeError,
				'-Infinity is not >= 0'
			);

			forEach(v.nonIntegerNumbers, function (nonInteger) {
				st['throws'](
					function () { ES.ArraySpeciesCreate([], nonInteger); },
					TypeError,
					debug(nonInteger) + ' is not an integer'
				);
			});

			st.end();
		});

		t.test('works with a non-array', function (st) {
			forEach(v.objects.concat(v.primitives), function (nonArray) {
				var arr = ES.ArraySpeciesCreate(nonArray, 0);
				st.ok(ES.IsArray(arr), 'is an array');
				st.equal(arr.length, 0, 'length is correct');
				st.equal(arr.constructor, Array, 'constructor is correct');
			});

			st.end();
		});

		t.test('works with a normal array', function (st) {
			var len = 2;
			var orig = [1, 2, 3];
			var arr = ES.ArraySpeciesCreate(orig, len);

			st.ok(ES.IsArray(arr), 'is an array');
			st.equal(arr.length, len, 'length is correct');
			st.equal(arr.constructor, orig.constructor, 'constructor is correct');

			st.end();
		});

		t.test('-0 length produces +0 length', function (st) {
			var len = -0;
			st.equal(len, -0, '-0 is negative zero');
			st.notEqual(len, 0, '-0 is not positive zero');

			var orig = [1, 2, 3];
			var arr = ES.ArraySpeciesCreate(orig, len);

			st.equal(ES.IsArray(arr), true);
			st.equal(arr.length, 0);
			st.equal(arr.constructor, orig.constructor);

			st.end();
		});

		t.test('works with species construtor', { skip: !hasSpecies }, function (st) {
			var sentinel = {};
			var Foo = function Foo(len) {
				this.length = len;
				this.sentinel = sentinel;
			};
			var Bar = getArraySubclassWithSpeciesConstructor(Foo);
			var bar = new Bar();

			st.equal(ES.IsArray(bar), true, 'Bar instance is an array');

			var arr = ES.ArraySpeciesCreate(bar, 3);
			st.equal(arr.constructor, Foo, 'result used species constructor');
			st.equal(arr.length, 3, 'length property is correct');
			st.equal(arr.sentinel, sentinel, 'Foo constructor was exercised');

			st.end();
		});

		t.test('works with null species constructor', { skip: !hasSpecies }, function (st) {
			var Bar = getArraySubclassWithSpeciesConstructor(null);
			var bar = new Bar();

			st.equal(ES.IsArray(bar), true, 'Bar instance is an array');

			var arr = ES.ArraySpeciesCreate(bar, 3);
			st.equal(arr.constructor, Array, 'result used default constructor');
			st.equal(arr.length, 3, 'length property is correct');

			st.end();
		});

		t.test('works with undefined species constructor', { skip: !hasSpecies }, function (st) {
			var Bar = getArraySubclassWithSpeciesConstructor();
			var bar = new Bar();

			st.equal(ES.IsArray(bar), true, 'Bar instance is an array');

			var arr = ES.ArraySpeciesCreate(bar, 3);
			st.equal(arr.constructor, Array, 'result used default constructor');
			st.equal(arr.length, 3, 'length property is correct');

			st.end();
		});

		t.test('throws with object non-construtor species constructor', { skip: !hasSpecies }, function (st) {
			forEach(v.objects, function (obj) {
				var Bar = getArraySubclassWithSpeciesConstructor(obj);
				var bar = new Bar();

				st.equal(ES.IsArray(bar), true, 'Bar instance is an array');

				st['throws'](
					function () { ES.ArraySpeciesCreate(bar, 3); },
					TypeError,
					debug(obj) + ' is not a constructor'
				);
			});

			st.end();
		});

		t.end();
	});

	test('Call', function (t) {
		var receiver = {};
		var notFuncs = v.nonFunctions.concat([/a/g, new RegExp('a', 'g')]);
		t.plan(notFuncs.length + v.nonArrays.length + 5);

		forEach(notFuncs, function (notFunc) {
			t['throws'](
				function () { return ES.Call(notFunc, receiver); },
				TypeError,
				debug(notFunc) + ' (' + typeof notFunc + ') is not callable'
			);
		});

		forEach(v.nonArrays, function (nonArray) {
			t['throws'](
				function () { ES.Call(Function.prototype, null, nonArray); },
				TypeError,
				debug(nonArray) + ' is not an array'
			);
		});

		ES.Call(
			function (a, b) {
				t.equal(this, receiver, 'context matches expected');
				t.deepEqual([a, b], [1, 2], 'named args are correct');
				t.equal(arguments.length, 3, 'extra argument was passed');
				t.equal(arguments[2], 3, 'extra argument was correct');
			},
			receiver,
			[1, 2, 3]
		);

		t.test('Call doesn’t use func.apply', function (st) {
			st.plan(4);

			var bad = function (a, b) {
				st.equal(this, receiver, 'context matches expected');
				st.deepEqual([a, b], [1, 2], 'named args are correct');
				st.equal(arguments.length, 3, 'extra argument was passed');
				st.equal(arguments[2], 3, 'extra argument was correct');
			};

			defineProperty(bad, 'apply', {
				enumerable: true,
				configurable: true,
				value: function () {
					st.fail('bad.apply shouldn’t get called');
				},
				writable: true
			});

			ES.Call(bad, receiver, [1, 2, 3]);
			st.end();
		});

		t.end();
	});

	test('Canonicalize', function (t) {
		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { ES.Canonicalize(nonString, false, false); },
				TypeError,
				'arg 1: ' + debug(nonString) + ' is not a String'
			);
		});

		forEach(v.nonBooleans, function (nonBoolean) {
			t['throws'](
				function () { ES.Canonicalize('', nonBoolean, false); },
				TypeError,
				'arg 2: ' + debug(nonBoolean) + ' is not a Boolean'
			);

			t['throws'](
				function () { ES.Canonicalize('', false, nonBoolean); },
				TypeError,
				'arg 3: ' + debug(nonBoolean) + ' is not a Boolean'
			);
		});

		t.equal(ES.Canonicalize(leadingPoo, false, false), leadingPoo, 'when IgnoreCase is false, ch is returned');

		forEach(keys(caseFolding.C), function (input) {
			var output = caseFolding.C[input];
			t.equal(ES.Canonicalize(input, false, true), input, 'C mapping, IgnoreCase false: ' + debug(input) + ' canonicalizes to ' + debug(input));
			t.equal(ES.Canonicalize(input, true, true), output, 'C mapping, IgnoreCase true: ' + debug(input) + ' canonicalizes to ' + debug(output));
		});

		forEach(keys(caseFolding.S), function (input) {
			var output = caseFolding.S[input];
			t.equal(ES.Canonicalize(input, false, true), input, 'S mapping, IgnoreCase false: ' + debug(input) + ' canonicalizes to ' + debug(input));
			t.equal(ES.Canonicalize(input, true, true), output, 'S mapping, IgnoreCase true: ' + debug(input) + ' canonicalizes to ' + debug(output));
		});

		t.end();
	});

	test('CanonicalNumericIndexString', function (t) {
		forEach(v.nonStrings, function (notString) {
			t['throws'](
				function () { return ES.CanonicalNumericIndexString(notString); },
				TypeError,
				debug(notString) + ' is not a string'
			);
		});

		t.equal(ES.CanonicalNumericIndexString('-0'), -0, '"-0" returns -0');
		for (var i = -50; i < 50; i += 10) {
			t.equal(i, ES.CanonicalNumericIndexString(String(i)), '"' + i + '" returns ' + i);
			t.equal(undefined, ES.CanonicalNumericIndexString(String(i) + 'a'), '"' + i + 'a" returns undefined');
		}
		t.end();
	});

	test('CompletePropertyDescriptor', function (t) {
		forEach(v.nonUndefinedPrimitives, function (primitive) {
			t['throws'](
				function () { ES.CompletePropertyDescriptor(primitive); },
				TypeError,
				debug(primitive) + ' is not a Property Descriptor'
			);
		});

		var generic = v.genericDescriptor();
		t.deepEqual(
			ES.CompletePropertyDescriptor(generic),
			{
				'[[Configurable]]': !!generic['[[Configurable]]'],
				'[[Enumerable]]': !!generic['[[Enumerable]]'],
				'[[Value]]': undefined,
				'[[Writable]]': false
			},
			'completes a Generic Descriptor'
		);

		var data = v.dataDescriptor();
		t.deepEqual(
			ES.CompletePropertyDescriptor(data),
			{
				'[[Configurable]]': !!data['[[Configurable]]'],
				'[[Enumerable]]': false,
				'[[Value]]': data['[[Value]]'],
				'[[Writable]]': !!data['[[Writable]]']
			},
			'completes a Data Descriptor'
		);

		var accessor = v.accessorDescriptor();
		t.deepEqual(
			ES.CompletePropertyDescriptor(accessor),
			{
				'[[Get]]': accessor['[[Get]]'],
				'[[Enumerable]]': !!accessor['[[Enumerable]]'],
				'[[Configurable]]': !!accessor['[[Configurable]]'],
				'[[Set]]': undefined
			},
			'completes an Accessor Descriptor'
		);

		var mutator = v.mutatorDescriptor();
		t.deepEqual(
			ES.CompletePropertyDescriptor(mutator),
			{
				'[[Set]]': mutator['[[Set]]'],
				'[[Enumerable]]': !!mutator['[[Enumerable]]'],
				'[[Configurable]]': !!mutator['[[Configurable]]'],
				'[[Get]]': undefined
			},
			'completes a mutator Descriptor'
		);

		t['throws'](
			function () { ES.CompletePropertyDescriptor(v.bothDescriptor()); },
			TypeError,
			'data and accessor descriptors are mutually exclusive'
		);

		t.end();
	});

	test('CharacterRange', function (t) {
		forEach(['', 'abc', [], ['a', 'b', 'c']], function (notOne) {
			t['throws'](
				function () { ES.CharacterRange(notOne, 'a'); },
				TypeError,
				debug(notOne) + ' as first arg does not have 1 item'
			);
			t['throws'](
				function () { ES.CharacterRange('a', notOne); },
				TypeError,
				debug(notOne) + ' as second arg does not have 1 item'
			);
			t['throws'](
				function () { ES.CharacterRange(notOne, notOne); },
				TypeError,
				debug(notOne) + ' as both args do not have 1 item'
			);
		});

		t['throws'](
			function () { ES.CharacterRange('b', 'a'); },
			TypeError,
			'a backwards range throws'
		);

		t.deepEqual(
			ES.CharacterRange('a', 'b'),
			['a', 'b']
		);

		t.deepEqual(
			ES.CharacterRange('Z', 'a'),
			['Z', '[', '\\', ']', '^', '_', '`', 'a']
		);

		t.end();
	});

	test('CompletionRecord', function (t) {
		t['throws'](
			function () { return new ES.CompletionRecord('invalid'); },
			SyntaxError,
			'invalid Completion Record type throws'
		);

		forEach(['break', 'continue', 'return'], function (unsupportedType) {
			var completion = ES.CompletionRecord(unsupportedType);
			t['throws'](
				function () { completion['?'](); },
				SyntaxError,
				'type ' + unsupportedType + ' is not supported'
			);
		});

		forEach(['break', 'continue', 'return', 'throw'], function (nonNormalType) {
			var completion = ES.CompletionRecord(nonNormalType);
			t['throws'](
				function () { completion['!'](); },
				SyntaxError,
				'assertion failed: type ' + nonNormalType + ' is not "normal"'
			);
		});

		var sentinel = {};
		var completion = ES.CompletionRecord('normal', sentinel);
		t.equal(completion['!'](), sentinel, '! returns the value of a normal completion');
		t.equal(completion['?'](), sentinel, '? returns the value of a normal completion');

		t.end();
	});

	test('CreateDataProperty', function (t) {
		forEach(v.primitives, function (primitive) {
			t['throws'](
				function () { ES.CreateDataProperty(primitive); },
				TypeError,
				debug(primitive) + ' is not an object'
			);
		});

		forEach(v.nonPropertyKeys, function (nonPropertyKey) {
			t['throws'](
				function () { ES.CreateDataProperty({}, nonPropertyKey); },
				TypeError,
				debug(nonPropertyKey) + ' is not a property key'
			);
		});

		var sentinel = { id: 'sentinel' };
		var secondSentinel = { id: 'second sentinel' };
		forEach(v.propertyKeys, function (propertyKey) {
			var obj = {};
			var status = ES.CreateDataProperty(obj, propertyKey, sentinel);
			t.equal(status, true, 'status is true');
			t.equal(
				obj[propertyKey],
				sentinel,
				debug(sentinel) + ' is installed on "' + debug(propertyKey) + '" on the object'
			);
			var secondStatus = ES.CreateDataProperty(obj, propertyKey, secondSentinel);
			t.equal(secondStatus, true, 'second status is true');
			t.equal(
				obj[propertyKey],
				secondSentinel,
				debug(secondSentinel) + ' is installed on "' + debug(propertyKey) + '" on the object'
			);

			t.test('with defineProperty', { skip: !$defineProperty }, function (st) {
				var nonWritable = defineProperty({}, propertyKey, { configurable: true, writable: false });

				var nonWritableStatus = ES.CreateDataProperty(nonWritable, propertyKey, sentinel);
				st.equal(nonWritableStatus, true, 'create data property succeeded');
				st.equal(
					nonWritable[propertyKey],
					sentinel,
					debug(sentinel) + ' is installed on "' + debug(propertyKey) + '" on the object when key is configurable but nonwritable'
				);

				var nonConfigurable = defineProperty({}, propertyKey, { configurable: false, writable: true });

				var nonConfigurableStatus = ES.CreateDataProperty(nonConfigurable, propertyKey, sentinel);
				st.equal(nonConfigurableStatus, false, 'create data property failed');
				st.notEqual(
					nonConfigurable[propertyKey],
					sentinel,
					debug(sentinel) + ' is not installed on "' + debug(propertyKey) + '" on the object when key is nonconfigurable'
				);
				st.end();
			});
		});

		t.test('non-extensible object', { skip: !Object.preventExtensions }, function (st) {
			var nonExtensible = Object.preventExtensions({});

			st.equal(
				ES.CreateDataProperty(nonExtensible, 'foo', {}),
				false,
				'can not install "foo" on non-extensible object'
			);

			st.end();
		});

		t.end();
	});

	test('CreateDataPropertyOrThrow', function (t) {
		forEach(v.primitives, function (primitive) {
			t['throws'](
				function () { ES.CreateDataPropertyOrThrow(primitive); },
				TypeError,
				debug(primitive) + ' is not an object'
			);
		});

		forEach(v.nonPropertyKeys, function (nonPropertyKey) {
			t['throws'](
				function () { ES.CreateDataPropertyOrThrow({}, nonPropertyKey); },
				TypeError,
				debug(nonPropertyKey) + ' is not a property key'
			);
		});

		var sentinel = {};
		forEach(v.propertyKeys, function (propertyKey) {
			var obj = {};
			var status = ES.CreateDataPropertyOrThrow(obj, propertyKey, sentinel);
			t.equal(status, true, 'status is true');
			t.equal(
				obj[propertyKey],
				sentinel,
				debug(sentinel) + ' is installed on "' + debug(propertyKey) + '" on the object'
			);

			if (typeof Object.preventExtensions === 'function') {
				var notExtensible = {};
				Object.preventExtensions(notExtensible);

				t['throws'](
					function () { ES.CreateDataPropertyOrThrow(notExtensible, propertyKey, sentinel); },
					TypeError,
					'can not install ' + debug(propertyKey) + ' on non-extensible object'
				);
				t.notEqual(
					notExtensible[propertyKey],
					sentinel,
					debug(sentinel) + ' is not installed on "' + debug(propertyKey) + '" on the object'
				);
			}
		});

		t.test('non-extensible object', { skip: !Object.preventExtensions }, function (st) {
			var nonExtensible = Object.preventExtensions({});

			st['throws'](
				function () { ES.CreateDataPropertyOrThrow(nonExtensible, 'foo', {}); },
				TypeError,
				'can not install "foo" on non-extensible object'
			);

			st.end();
		});

		t.end();
	});

	test('CreateListFromArrayLike', function (t) {
		forEach(v.primitives, function (nonObject) {
			t['throws'](
				function () { ES.CreateListFromArrayLike(nonObject); },
				TypeError,
				debug(nonObject) + ' is not an Object'
			);
		});
		forEach(v.nonArrays, function (nonArray) {
			t['throws'](
				function () { ES.CreateListFromArrayLike({}, nonArray); },
				TypeError,
				debug(nonArray) + ' is not an Array'
			);
		});

		t['throws'](
			function () { ES.CreateListFromArrayLike({ length: 3, 0: 'a', 1: 'b', 2: 3 }, ['String']); },
			TypeError,
			'an element type not present in passed elementTypes throws'
		);

		t.deepEqual(
			ES.CreateListFromArrayLike({ length: 2, 0: 'a', 1: 'b', 2: 'c' }),
			['a', 'b'],
			'arraylike stops at the length'
		);

		t.end();
	});

	test('CreateHTML', function (t) {
		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { ES.CreateHTML('', nonString, '', ''); },
				TypeError,
				'tag: ' + debug(nonString) + ' is not a String'
			);
			t['throws'](
				function () { ES.CreateHTML('', '', nonString, ''); },
				TypeError,
				'attribute: ' + debug(nonString) + ' is not a String'
			);
		});

		t.equal(
			ES.CreateHTML(
				{ toString: function () { return 'the string'; } },
				'some HTML tag!',
				''
			),
			'<some HTML tag!>the string</some HTML tag!>',
			'works with an empty string attribute value'
		);

		t.equal(
			ES.CreateHTML(
				{ toString: function () { return 'the string'; } },
				'some HTML tag!',
				'attr',
				'value "with quotes"'
			),
			'<some HTML tag! attr="value &quot;with quotes&quot;">the string</some HTML tag!>',
			'works with an attribute, and a value with quotes'
		);

		t.end();
	});

	test('CreateMethodProperty', function (t) {
		forEach(v.primitives, function (primitive) {
			t['throws'](
				function () { ES.CreateMethodProperty(primitive, 'key'); },
				TypeError,
				'O must be an Object; ' + debug(primitive) + ' is not one'
			);
		});

		forEach(v.nonPropertyKeys, function (nonPropertyKey) {
			t['throws'](
				function () { ES.CreateMethodProperty({}, nonPropertyKey); },
				TypeError,
				debug(nonPropertyKey) + ' is not a Property Key'
			);
		});

		t.test('defines correctly', function (st) {
			var obj = {};
			var key = 'the key';
			var value = { foo: 'bar' };

			st.equal(ES.CreateMethodProperty(obj, key, value), true, 'defines property successfully');
			st.test('property descriptor', { skip: !getOwnPropertyDescriptor }, function (s2t) {
				s2t.deepEqual(
					getOwnPropertyDescriptor(obj, key),
					{
						configurable: true,
						enumerable: false,
						value: value,
						writable: true
					},
					'sets the correct property descriptor'
				);

				s2t.end();
			});
			st.equal(obj[key], value, 'sets the correct value');

			st.end();
		});

		t.test('fails as expected on a frozen object', { skip: !Object.freeze }, function (st) {
			var obj = Object.freeze({ foo: 'bar' });
			st['throws'](
				function () { ES.CreateMethodProperty(obj, 'foo', { value: 'baz' }); },
				TypeError,
				'nonconfigurable key can not be defined'
			);

			st.end();
		});

		t.test('fails as expected on a function with a nonconfigurable name', { skip: !functionsHaveNames || functionsHaveConfigurableNames }, function (st) {
			st['throws'](
				function () { ES.CreateMethodProperty(function () {}, 'name', { value: 'baz' }); },
				TypeError,
				'nonconfigurable function name can not be defined'
			);
			st.end();
		});

		t.end();
	});

	test('CreateIterResultObject', function (t) {
		forEach(v.nonBooleans, function (nonBoolean) {
			t['throws'](
				function () { ES.CreateIterResultObject({}, nonBoolean); },
				TypeError,
				'"done" argument must be a boolean; ' + debug(nonBoolean) + ' is not'
			);
		});

		var value = {};
		t.deepEqual(
			ES.CreateIterResultObject(value, true),
			{ value: value, done: true },
			'creates a "done" iteration result'
		);
		t.deepEqual(
			ES.CreateIterResultObject(value, false),
			{ value: value, done: false },
			'creates a "not done" iteration result'
		);

		t.end();
	});

	test('DefinePropertyOrThrow', function (t) {
		forEach(v.primitives, function (primitive) {
			t['throws'](
				function () { ES.DefinePropertyOrThrow(primitive, 'key', {}); },
				TypeError,
				'O must be an Object'
			);
		});

		forEach(v.nonPropertyKeys, function (nonPropertyKey) {
			t['throws'](
				function () { ES.DefinePropertyOrThrow({}, nonPropertyKey, {}); },
				TypeError,
				debug(nonPropertyKey) + ' is not a Property Key'
			);
		});

		t.test('defines correctly', function (st) {
			var obj = {};
			var key = 'the key';
			var descriptor = {
				configurable: true,
				enumerable: false,
				value: { foo: 'bar' },
				writable: true
			};

			st.equal(ES.DefinePropertyOrThrow(obj, key, descriptor), true, 'defines property successfully');
			st.test('property descriptor', { skip: !getOwnPropertyDescriptor }, function (s2t) {
				s2t.deepEqual(
					getOwnPropertyDescriptor(obj, key),
					descriptor,
					'sets the correct property descriptor'
				);

				s2t.end();
			});
			st.deepEqual(obj[key], descriptor.value, 'sets the correct value');

			st.end();
		});

		t.test('fails as expected on a frozen object', { skip: !Object.freeze }, function (st) {
			var obj = Object.freeze({ foo: 'bar' });
			st['throws'](
				function () {
					ES.DefinePropertyOrThrow(obj, 'foo', { configurable: true, value: 'baz' });
				},
				TypeError,
				'nonconfigurable key can not be defined'
			);

			st.end();
		});

		t.test('fails as expected on a function with a nonconfigurable name', { skip: !functionsHaveNames || functionsHaveConfigurableNames }, function (st) {
			st['throws'](
				function () {
					ES.DefinePropertyOrThrow(function () {}, 'name', { configurable: true, value: 'baz' });
				},
				TypeError,
				'nonconfigurable function name can not be defined'
			);
			st.end();
		});

		t.end();
	});

	test('DeletePropertyOrThrow', function (t) {
		forEach(v.primitives, function (primitive) {
			t['throws'](
				function () { ES.DeletePropertyOrThrow(primitive, 'key', {}); },
				TypeError,
				'O must be an Object'
			);
		});

		forEach(v.nonPropertyKeys, function (nonPropertyKey) {
			t['throws'](
				function () { ES.DeletePropertyOrThrow({}, nonPropertyKey, {}); },
				TypeError,
				debug(nonPropertyKey) + ' is not a Property Key'
			);
		});

		t.test('defines correctly', function (st) {
			var obj = { 'the key': 42 };
			var key = 'the key';

			st.equal(ES.DeletePropertyOrThrow(obj, key), true, 'deletes property successfully');
			st.equal(key in obj, false, 'key is no longer in the object');

			st.end();
		});

		t.test('fails as expected on a frozen object', { skip: !Object.freeze }, function (st) {
			var obj = Object.freeze({ foo: 'bar' });
			st['throws'](
				function () { ES.DeletePropertyOrThrow(obj, 'foo'); },
				TypeError,
				'nonconfigurable key can not be deleted'
			);

			st.end();
		});

		t.test('fails as expected on a function with a nonconfigurable name', { skip: !functionsHaveNames || functionsHaveConfigurableNames }, function (st) {
			st['throws'](
				function () { ES.DeletePropertyOrThrow(function () {}, 'name'); },
				TypeError,
				'nonconfigurable function name can not be deleted'
			);
			st.end();
		});

		t.end();
	});

	test('DetachArrayBuffer', function (t) {
		forEach(v.primitives.concat(v.objects), function (nonArrayBuffer) {
			t['throws'](
				function () { ES.DetachArrayBuffer(nonArrayBuffer); },
				TypeError,
				debug(nonArrayBuffer) + ' is not an ArrayBuffer'
			);
		});

		t.test('ArrayBuffers', { skip: typeof ArrayBuffer !== 'function' }, function (st) {
			var buffers = [
				new ArrayBuffer(),
				new ArrayBuffer(0),
				new ArrayBuffer(4),
				new ArrayBuffer(420)
			];

			st.test('can detach', { skip: !canDetach }, function (s2t) {
				forEach(buffers, function (buffer) {
					s2t.doesNotThrow(
						function () { return new Float32Array(buffer); },
						'can create a Float32Array from a non-detached ArrayBuffer'
					);

					s2t.equal(ES.DetachArrayBuffer(buffer), null, 'returns null');

					s2t['throws'](
						function () { return new Float32Array(buffer); },
						TypeError,
						'can not create a Float32Array from a now detached ArrayBuffer'
					);

					s2t.doesNotThrow(
						function () { ES.DetachArrayBuffer(buffer); },
						'can call DetachArrayBuffer on an already-detached ArrayBuffer'
					);
				});

				s2t.end();
			});

			// throws SyntaxError in node < 11
			st.test('can not detach', { skip: canDetach }, function (s2t) {
				forEach(buffers, function (buffer) {
					s2t.doesNotThrow(
						function () { return new Float32Array(buffer); },
						'can create a Float32Array from a non-detached ArrayBuffer'
					);

					s2t['throws'](
						function () { return ES.DetachArrayBuffer(buffer); },
						SyntaxError,
						'env does not support detaching'
					);
				});

				s2t.end();
			});

			st.end();
		});

		t.end();
	});

	test('EnumerableOwnNames', function (t) {
		var obj = testEnumerableOwnNames(t, function (O) { return ES.EnumerableOwnNames(O); });

		t.deepEqual(
			ES.EnumerableOwnNames(obj),
			['own'],
			'returns enumerable own names'
		);

		t.end();
	});

	test('FromPropertyDescriptor', function (t) {
		t.equal(ES.FromPropertyDescriptor(), undefined, 'no value begets undefined');
		t.equal(ES.FromPropertyDescriptor(undefined), undefined, 'undefined value begets undefined');

		forEach(v.nonUndefinedPrimitives, function (primitive) {
			t['throws'](
				function () { ES.FromPropertyDescriptor(primitive); },
				TypeError,
				debug(primitive) + ' is not a Property Descriptor'
			);
		});

		var accessor = v.accessorDescriptor();
		t.deepEqual(ES.FromPropertyDescriptor(accessor), {
			get: accessor['[[Get]]'],
			enumerable: !!accessor['[[Enumerable]]'],
			configurable: !!accessor['[[Configurable]]']
		});

		var mutator = v.mutatorDescriptor();
		t.deepEqual(ES.FromPropertyDescriptor(mutator), {
			set: mutator['[[Set]]'],
			enumerable: !!mutator['[[Enumerable]]'],
			configurable: !!mutator['[[Configurable]]']
		});
		var data = v.dataDescriptor();
		t.deepEqual(ES.FromPropertyDescriptor(data), {
			value: data['[[Value]]'],
			writable: data['[[Writable]]']
		});

		t.deepEqual(ES.FromPropertyDescriptor(v.genericDescriptor()), {
			enumerable: false,
			configurable: true
		});

		var both = v.bothDescriptor();
		t['throws'](
			function () {
				ES.FromPropertyDescriptor({ get: both['[[Get]]'], value: both['[[Value]]'] });
			},
			TypeError,
			'data and accessor descriptors are mutually exclusive'
		);

		t.end();
	});

	test('Get', function (t) {
		t['throws'](function () { return ES.Get('a', 'a'); }, TypeError, 'Throws a TypeError if `O` is not an Object');
		t['throws'](function () { return ES.Get({ 7: 7 }, 7); }, TypeError, 'Throws a TypeError if `P` is not a property key');

		var value = {};
		t.test('Symbols', { skip: !v.hasSymbols }, function (st) {
			var sym = Symbol('sym');
			var obj = {};
			obj[sym] = value;
			st.equal(ES.Get(obj, sym), value, 'returns property `P` if it exists on object `O`');
			st.end();
		});
		t.equal(ES.Get({ a: value }, 'a'), value, 'returns property `P` if it exists on object `O`');
		t.end();
	});

	test('GetGlobalObject', function (t) {
		t.equal(ES.GetGlobalObject(), global, 'returns the global object');

		t.end();
	});

	test('GetIterator', function (t) {
		var arr = [1, 2];
		testIterator(t, ES.GetIterator(arr), arr);

		testIterator(t, ES.GetIterator('abc'), 'abc'.split(''));

		var sentinel = {};
		forEach(v.primitives, function (nonObject) {
			var method = function () {
				return nonObject;
			};
			t['throws'](
				function () { ES.GetIterator(sentinel, method); },
				TypeError,
				debug(nonObject) + ' is not an Object; iterator method must return an Object'
			);
		});

		var i = 0;
		var manualMethod = function () {
			t.equal(this, sentinel, 'receiver is expected object');
			return {
				next: function () {
					var value = arr[i];
					i += 1;
					return {
						done: i > arr.length,
						value: value
					};
				}
			};
		};
		testIterator(t, ES.GetIterator(sentinel, manualMethod), arr);

		t.test('Symbol.iterator', { skip: !v.hasSymbols }, function (st) {
			var m = new Map();
			m.set(1, 'a');
			m.set(2, 'b');

			testIterator(st, ES.GetIterator(m), [[1, 'a'], [2, 'b']]);

			forEach(v.primitives, function (nonObject) {
				var badIterable = {};
				badIterable[Symbol.iterator] = function () {
					return nonObject;
				};
				st['throws'](
					function () { return ES.GetIterator(badIterable); },
					TypeError,
					debug(nonObject) + ' is not an Object; iterator method must return an Object'
				);
			});

			st.end();
		});

		t.end();
	});

	test('GetMethod', function (t) {
		forEach(v.nonPropertyKeys, function (nonPropertyKey) {
			t['throws'](
				function () { return ES.GetMethod({}, nonPropertyKey); },
				TypeError,
				debug(nonPropertyKey) + ' is not a Property Key'
			);
		});

		t['throws'](function () { return ES.GetMethod({ 7: 7 }, 7); }, TypeError, 'Throws a TypeError if `P` is not a property key');

		t.equal(ES.GetMethod({}, 'a'), undefined, 'returns undefined in property is undefined');
		t.equal(ES.GetMethod({ a: null }, 'a'), undefined, 'returns undefined if property is null');
		t.equal(ES.GetMethod({ a: undefined }, 'a'), undefined, 'returns undefined if property is undefined');

		var obj = { a: function () {} };
		t['throws'](function () { ES.GetMethod({ a: 'b' }, 'a'); }, TypeError, 'throws TypeError if property exists and is not callable');

		t.equal(ES.GetMethod(obj, 'a'), obj.a, 'returns property if it is callable');

		t.end();
	});

	test('GetOwnPropertyKeys', function (t) {
		forEach(v.primitives, function (primitive) {
			t['throws'](
				function () { ES.GetOwnPropertyKeys(primitive, 'String'); },
				TypeError,
				'O: ' + debug(primitive) + ' is not an Object'
			);
		});

		t['throws'](
			function () { ES.GetOwnPropertyKeys({}, 'not string or symbol'); },
			TypeError,
			'Type: must be "String" or "Symbol"'
		);

		t.test('Symbols', { skip: !v.hasSymbols }, function (st) {
			var O = { a: 1 };
			O[Symbol.iterator] = true;
			var s = Symbol('test');
			defineProperty(O, s, { enumerable: false, value: true });

			st.deepEqual(
				ES.GetOwnPropertyKeys(O, 'Symbol'),
				[Symbol.iterator, s],
				'works with Symbols, enumerable or not'
			);

			st.end();
		});

		t.test('non-enumerable names', { skip: !$defineProperty }, function (st) {
			var O = { a: 1 };
			defineProperty(O, 'b', { enumerable: false, value: 2 });
			if (v.hasSymbols) {
				O[Symbol.iterator] = true;
			}

			st.deepEqual(
				ES.GetOwnPropertyKeys(O, 'String').sort(),
				['a', 'b'].sort(),
				'works with Strings, enumerable or not'
			);

			st.end();
		});

		t.deepEqual(
			ES.GetOwnPropertyKeys({ a: 1, b: 2 }, 'String').sort(),
			['a', 'b'].sort(),
			'works with enumerable keys'
		);

		t.end();
	});

	test('GetPrototypeFromConstructor', function (t) {
		forEach(v.nonFunctions, function (nonFunction) {
			t['throws'](
				function () { ES.GetPrototypeFromConstructor(nonFunction, '%Array%'); },
				TypeError,
				debug(nonFunction) + ' is not a constructor'
			);
		});

		forEach(arrowFns, function (arrowFn) {
			t['throws'](
				function () { ES.GetPrototypeFromConstructor(arrowFn, '%Array%'); },
				TypeError,
				debug(arrowFn) + ' is not a constructor'
			);
		});

		t['throws'](
			function () { ES.GetPrototypeFromConstructor(function () {}, '%Number.MAX_VALUE%'); },
			TypeError,
			'a non-object default intrinsic throws'
		);

		var f = function () {};
		t.equal(
			ES.GetPrototypeFromConstructor(f, '%Array.prototype%'),
			f.prototype,
			'function with normal `prototype` property returns it'
		);
		forEach([true, 'foo', 42], function (truthyPrimitive) {
			f.prototype = truthyPrimitive;
			t.equal(
				ES.GetPrototypeFromConstructor(f, '%Array.prototype%'),
				Array.prototype,
				'function with non-object `prototype` property (' + debug(truthyPrimitive) + ') returns default intrinsic'
			);
		});

		t.end();
	});

	test('GetSubstitution', function (t) {
		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { ES.GetSubstitution(nonString, '', 0, [], ''); },
				TypeError,
				'`matched`: ' + debug(nonString) + ' is not a String'
			);

			t['throws'](
				function () { ES.GetSubstitution('', nonString, 0, [], ''); },
				TypeError,
				'`str`: ' + debug(nonString) + ' is not a String'
			);

			t['throws'](
				function () { ES.GetSubstitution('', '', 0, [], nonString); },
				TypeError,
				'`replacement`: ' + debug(nonString) + ' is not a String'
			);

			if (typeof nonString !== 'undefined') {
				t['throws'](
					function () { ES.GetSubstitution('', '', 0, [nonString], ''); },
					TypeError,
					'`captures`: ' + debug([nonString]) + ' is not an Array of strings or `undefined`'
				);
			}
		});

		forEach(v.notNonNegativeIntegers, function (nonNonNegativeInteger) {
			t['throws'](
				function () { ES.GetSubstitution('', '', nonNonNegativeInteger, [], ''); },
				TypeError,
				'`position`: ' + debug(nonNonNegativeInteger) + ' is not a non-negative integer'
			);
		});

		forEach(v.nonArrays, function (nonArray) {
			t['throws'](
				function () { ES.GetSubstitution('', '', 0, nonArray, ''); },
				TypeError,
				'`captures`: ' + debug(nonArray) + ' is not an Array'
			);
		});

		t.equal(
			ES.GetSubstitution('def', 'abcdefghi', 3, [], '123'),
			'123',
			'returns the substitution'
		);
		t.equal(
			ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], '$$2$'),
			'$2$',
			'supports $$, and trailing $'
		);

		t.equal(
			ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], '>$&<'),
			'>abcdef<',
			'supports $&'
		);

		t.equal(
			ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], '>$`<'),
			'><',
			'supports $` at position 0'
		);
		t.equal(
			ES.GetSubstitution('def', 'abcdefghi', 3, [], '>$`<'),
			'>ab<',
			'supports $` at position > 0'
		);

		// https://github.com/tc39/ecma262/pull/2484#discussion_r684725247
		t.equal(
			ES.GetSubstitution('1234567', 'abc', 0, [], ">$'<"),
			'><',
			'match is longer than the input string'
		);
		t.equal(
			ES.GetSubstitution('x', 'abc', 3, [], ">$'<"),
			'><',
			'nonempty match at the end of the input string'
		);

		t.equal(
			ES.GetSubstitution('def', 'abcdefghi', 7, [], ">$'<"),
			'><',
			"supports $' at a position where there's less than `matched.length` chars left"
		);
		t.equal(
			ES.GetSubstitution('def', 'abcdefghi', 3, [], ">$'<"),
			'>ghi<',
			"supports $' at a position where there's more than `matched.length` chars left"
		);

		for (var i = 0; i < 100; i += 1) {
			var captures = [];
			captures[i] = 'test';
			if (i > 0) {
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], '>$' + i + '<'),
					'>undefined<',
					'supports $' + i + ' with no captures'
				);
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], '>$' + i),
					'>undefined',
					'supports $' + i + ' at the end of the replacement, with no captures'
				);
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, '>$' + i + '<'),
					'><',
					'supports $' + i + ' with a capture at that index'
				);
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, '>$' + i),
					'>',
					'supports $' + i + ' at the end of the replacement, with a capture at that index'
				);
			}
			if (i < 10) {
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], '>$0' + i + '<'),
					i === 0 ? '><' : '>undefined<',
					'supports $0' + i + ' with no captures'
				);
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], '>$0' + i),
					i === 0 ? '>' : '>undefined',
					'supports $0' + i + ' at the end of the replacement, with no captures'
				);
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, '>$0' + i + '<'),
					'><',
					'supports $0' + i + ' with a capture at that index'
				);
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, '>$0' + i),
					'>',
					'supports $0' + i + ' at the end of the replacement, with a capture at that index'
				);
			}
		}

		t.end();
	});

	test('GetV', function (t) {
		t['throws'](function () { return ES.GetV({ 7: 7 }, 7); }, TypeError, 'Throws a TypeError if `P` is not a property key');
		var obj = { a: function () {} };
		t.equal(ES.GetV(obj, 'a'), obj.a, 'returns property if it exists');
		t.equal(ES.GetV(obj, 'b'), undefined, 'returns undefiend if property does not exist');

		t.test('getter observability of the receiver', { skip: !$defineProperty || !Object.isExtensible(Number.prototype) }, function (st) {
			var receivers = [];

			st.teardown(mockProperty(Number.prototype, 'foo', {
				get: function () {
					receivers.push(this);
				}
			}));

			ES.GetV(42, 'foo');
			ES.GetV(Object(42), 'foo');

			st.deepEqual(receivers, [42, Object(42)]);

			st.end();
		});

		t.end();
	});

	test('GetValueFromBuffer', function (t) {
		forEach(v.primitives.concat(v.objects), function (nonAB) {
			t['throws'](
				function () { ES.GetValueFromBuffer(nonAB, 0, 'Int8'); },
				TypeError,
				debug(nonAB) + ' is not an ArrayBuffer'
			);
		});

		t.test('ArrayBuffers supported', { skip: typeof ArrayBuffer !== 'function' }, function (st) {
			forEach(v.notNonNegativeIntegers, function (nonNonNegativeInteger) {
				st['throws'](
					function () { ES.GetValueFromBuffer(new ArrayBuffer(8), nonNonNegativeInteger, 'Int8'); },
					TypeError,
					debug(nonNonNegativeInteger) + ' is not a valid byte index'
				);
			});

			forEach(v.nonStrings.concat('not a valid type'), function (nonString) {
				st['throws'](
					function () { ES.GetValueFromBuffer(new ArrayBuffer(8), 0, nonString); },
					TypeError,
					debug(nonString) + ' is not a valid String value'
				);
			});

			forEach(v.nonBooleans, function (nonBoolean) {
				st['throws'](
					function () { ES.GetValueFromBuffer(new ArrayBuffer(8), 0, 'Int8', nonBoolean); },
					TypeError,
					debug(nonBoolean) + ' is not a valid Boolean value'
				);
			});

			st.test('can detach', { skip: !canDetach }, function (s2t) {
				var buffer = new ArrayBuffer(8);
				s2t.equal(ES.DetachArrayBuffer(buffer), null, 'detaching returns null');

				s2t['throws'](
					function () { ES.GetValueFromBuffer(buffer, 0, 'Int8'); },
					TypeError,
					'detached buffers throw'
				);

				s2t.end();
			});

			forEach(bufferTestCases, function (testCase, name) {
				st.test(name + ': ' + debug(testCase.value), function (s2t) {
					forEach([
						'Int8',
						'Uint8',
						'Uint8C',
						'Int16',
						'Uint16',
						'Int32',
						'Uint32',
						'Float32',
						'Float64'
					], function (type) {
						var view = new DataView(new ArrayBuffer(elementSizes.$Float64Array));
						var method = type === 'Uint8C' ? 'Uint8' : type;
						// var value = unserialize(testCase.value);
						var result = testCase[type === 'Uint8C' ? 'Uint8Clamped' : type];
						var hasBigEndian = type !== 'Int8' && type !== 'Uint8' && type !== 'Uint8C'; // the 8-bit types are special, they don't have big-endian
						/*
						st.equal(
							ES.GetValueFromBuffer(testCase.buffer, 0, type),
							defaultEndianness === testCase.endian ? testCase[type + 'little'] : testCase[type + 'big'],
							'buffer holding ' + debug(value) + ' (' + testCase.endian + ' endian) with type ' + type + ', default endian, yields expected value'
						);
						*/

						clearBuffer(view.buffer);
						var littleVal = unserialize(result.setAsLittle.asLittle);
						view['set' + method](0, type.slice(0, 3) === 'Big' ? safeBigInt(littleVal) : littleVal, true);

						s2t.equal(
							ES.GetValueFromBuffer(view.buffer, 0, type, true),
							littleVal,
							'buffer with type ' + type + ', little -> little, yields expected value'
						);

						if (hasBigEndian) {
							s2t.equal(
								ES.GetValueFromBuffer(view.buffer, 0, type, false),
								view['get' + method](0, false),
								'buffer with type ' + type + ', little -> big, yields expected value'
							);

							clearBuffer(view.buffer);
							var bigVal = unserialize(result.setAsBig.asBig);
							view['set' + method](0, type.slice(0, 3) === 'Big' ? safeBigInt(bigVal) : bigVal, false);

							s2t.equal(
								ES.GetValueFromBuffer(view.buffer, 0, type, false),
								bigVal,
								'buffer with type ' + type + ', big -> big, yields expected value'
							);

							s2t.equal(
								ES.GetValueFromBuffer(view.buffer, 0, type, true),
								view['get' + method](0, true),
								'buffer with type ' + type + ', big -> little, yields expected value'
							);
						}
					});

					s2t.end();
				});
			});

			st.end();
		});

		t.end();
	});

	test('HasOwnProperty', function (t) {
		forEach(v.primitives, function (primitive) {
			t['throws'](
				function () { ES.HasOwnProperty(primitive, 'key'); },
				TypeError,
				debug(primitive) + ' is not an Object'
			);
		});

		forEach(v.nonPropertyKeys, function (nonKey) {
			t['throws'](
				function () { ES.HasOwnProperty({}, nonKey); },
				TypeError,
				debug(nonKey) + ' is not a Property Key'
			);
		});

		t.equal(ES.HasOwnProperty({}, 'toString'), false, 'inherited properties are not own');
		t.equal(
			ES.HasOwnProperty({ toString: 1 }, 'toString'),
			true,
			'shadowed inherited own properties are own'
		);
		t.equal(ES.HasOwnProperty({ a: 1 }, 'a'), true, 'own properties are own');

		t.end();
	});

	test('HasProperty', function (t) {
		forEach(v.primitives, function (primitive) {
			t['throws'](
				function () { ES.HasProperty(primitive, 'key'); },
				TypeError,
				debug(primitive) + ' is not an Object'
			);
		});

		forEach(v.nonPropertyKeys, function (nonKey) {
			t['throws'](
				function () { ES.HasProperty({}, nonKey); },
				TypeError,
				debug(nonKey) + ' is not a Property Key'
			);
		});

		t.equal(ES.HasProperty({}, 'nope'), false, 'object does not have nonexistent properties');
		t.equal(ES.HasProperty({}, 'toString'), true, 'object has inherited properties');
		t.equal(
			ES.HasProperty({ toString: 1 }, 'toString'),
			true,
			'object has shadowed inherited own properties'
		);
		t.equal(ES.HasProperty({ a: 1 }, 'a'), true, 'object has own properties');

		t.end();
	});

	test('InstanceofOperator', function (t) {
		forEach(v.primitives, function (primitive) {
			t['throws'](
				function () { ES.InstanceofOperator(primitive, function () {}); },
				TypeError,
				debug(primitive) + ' is not an object'
			);
		});

		forEach(v.nonFunctions, function (nonFunction) {
			t['throws'](
				function () { ES.InstanceofOperator({}, nonFunction); },
				TypeError,
				debug(nonFunction) + ' is not callable'
			);
		});

		var C = function C() {};
		var D = function D() {};

		t.equal(ES.InstanceofOperator(new C(), C), true, 'constructor function has an instance of itself');
		t.equal(ES.InstanceofOperator(new D(), C), false, 'constructor/instance mismatch is false');
		t.equal(ES.InstanceofOperator(new C(), D), false, 'instance/constructor mismatch is false');
		t.equal(ES.InstanceofOperator({}, C), false, 'plain object is not an instance of a constructor');
		t.equal(ES.InstanceofOperator({}, Object), true, 'plain object is an instance of Object');

		t.test('Symbol.hasInstance', { skip: !v.hasSymbols || !Symbol.hasInstance }, function (st) {
			st.plan(5);

			var O = {};
			var C2 = function () {};
			st.equal(ES.InstanceofOperator(O, C2), false, 'O is not an instance of C2');

			defineProperty(C2, Symbol.hasInstance, {
				configurable: true,
				value: function (obj) {
					st.equal(this, C2, 'hasInstance receiver is C2');
					st.equal(obj, O, 'hasInstance argument is O');

					return {}; // testing coercion to boolean
				}
			});

			st.equal(ES.InstanceofOperator(O, C2), true, 'O is now an instance of C2');

			defineProperty(C2, Symbol.hasInstance, {
				configurable: true,
				value: undefined
			});

			st.equal(ES.InstanceofOperator(O, C2), false, 'O is no longer an instance of C2');

			st.end();
		});

		t.end();
	});

	test('IntegerIndexedElementGet', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.IntegerIndexedElementGet(null, nonNumber); },
				TypeError,
				debug(nonNumber) + ' is not a Number'
			);
		});

		forEach(v.primitives.concat(v.objects), function (nonTA) {
			t['throws'](
				function () { ES.IntegerIndexedElementGet(nonTA, 0); },
				TypeError,
				debug(nonTA) + ' is not an Integer-Indexed Exotic object'
			);
		});

		t.test('actual typed arrays', { skip: availableTypedArrays.length === 0 }, function (st) {
			forEach(availableTypedArrays, function (typedArray) {
				var isBigInt = typedArray.slice(0, 3) === 'Big';
				if (isBigInt && 'ToBigInt' in ES) {
					var Z = isBigInt ? safeBigInt : Number;
					var TA = global[typedArray];

					var arr = new TA([Z(1), Z(2), Z(3)]);
					st.equal(ES.IntegerIndexedElementGet(arr, 0), Z(1), 'returns index 0');
					st.equal(ES.IntegerIndexedElementGet(arr, 1), Z(2), 'returns index 1');
					st.equal(ES.IntegerIndexedElementGet(arr, 2), Z(3), 'returns index 2');
				}
			});

			st.end();
		});

		t.end();
	});

	test('InternalizeJSONProperty', function (t) {
		forEach(v.primitives, function (primitive) {
			t['throws'](
				function () { ES.InternalizeJSONProperty(primitive, '', function () {}); },
				TypeError,
				debug(primitive) + ' is not an Object'
			);
		});

		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { ES.InternalizeJSONProperty({}, nonString, function () {}); },
				TypeError,
				debug(nonString) + ' is not a String'
			);
		});

		forEach(v.nonFunctions, function (nonFunction) {
			t['throws'](
				function () { ES.InternalizeJSONProperty({}, 'a', nonFunction); },
				TypeError,
				debug(nonFunction) + ' is not a function'
			);
		});

		t.deepEqual(
			ES.InternalizeJSONProperty({ a: { b: { c: 1 } } }, 'a', function (name, val) { return val; }),
			{ b: { c: 1 } }
		);

		t.deepEqual(
			ES.InternalizeJSONProperty({ a: [{ b: { c: 1 } }, { d: 2 }] }, 'a', function (name, val) { return val; }),
			[{ b: { c: 1 } }, { d: 2 }]
		);

		// eslint-disable-next-line consistent-return
		var noD = function (name, val) { if (name !== 'd') { return val; } };

		t.deepEqual(
			ES.InternalizeJSONProperty({ a: [{ b: { c: 1 } }, { d: 2, e: 3 }] }, 'a', noD),
			[{ b: { c: 1 } }, { e: 3 }],
			'reviver drops a nested property in an array'
		);

		// eslint-disable-next-line consistent-return
		var noZero = function (name, val) { if (name !== '0') { return val; } };
		t.deepEqual(
			ES.InternalizeJSONProperty({ a: [{ b: { c: 1 } }, { d: 2, e: 3 }] }, 'a', noZero),
			[, { d: 2, e: 3 }], // eslint-disable-line no-sparse-arrays
			'reviver drops a nested index in an array'
		);

		t.deepEqual(
			ES.InternalizeJSONProperty({ a: { d: 2, e: 3 } }, 'a', noD),
			{ e: 3 },
			'reviver drops a nested property in an object'
		);

		t.deepEqual(
			ES.InternalizeJSONProperty({ d: [{ b: { c: 1 } }, { d: 2, e: 3 }] }, 'd', noD),
			undefined,
			'reviver drops a top-level property'
		);

		t.deepEqual(
			ES.InternalizeJSONProperty({ a: 1, b: 2 }, 'a', function (name, val) { return val; }),
			1
		);

		// stuff with the reviver

		t.end();
	});

	test('Invoke', function (t) {
		forEach(v.nonPropertyKeys, function (nonKey) {
			t['throws'](
				function () { ES.Invoke({}, nonKey); },
				TypeError,
				debug(nonKey) + ' is not a Property Key'
			);
		});

		t['throws'](
			function () { ES.Invoke({ o: false }, 'o'); },
			TypeError,
			'fails on a non-function'
		);

		forEach(v.nonArrays, function (nonArray) {
			t['throws'](
				function () { ES.Invoke({}, '', nonArray); },
				TypeError,
				debug(nonArray) + ' is not an Array'
			);
		});

		t.test('invoked callback', function (st) {
			var aValue = {};
			var bValue = {};
			var obj = {
				f: function (a) {
					st.equal(arguments.length, 2, '2 args passed');
					st.equal(a, aValue, 'first arg is correct');
					st.equal(arguments[1], bValue, 'second arg is correct');
				}
			};
			st.plan(3);
			ES.Invoke(obj, 'f', [aValue, bValue]);
		});

		t.end();
	});

	test('IsArray', function (t) {
		t.equal(true, ES.IsArray([]), '[] is array');
		t.equal(false, ES.IsArray({}), '{} is not array');
		t.equal(false, ES.IsArray({ length: 1, 0: true }), 'arraylike object is not array');
		forEach(v.objects.concat(v.primitives), function (value) {
			t.equal(false, ES.IsArray(value), debug(value) + ' is not array');
		});
		t.end();
	});

	test('IsCompatiblePropertyDescriptor', function (t) {
		t.equal(
			ES.IsCompatiblePropertyDescriptor(
				true,
				v.descriptors.configurable(),
				ES.CompletePropertyDescriptor(v.descriptors.nonConfigurable())
			),
			false
		);
		t.equal(
			ES.IsCompatiblePropertyDescriptor(
				false,
				v.descriptors.configurable(),
				ES.CompletePropertyDescriptor(v.descriptors.nonConfigurable())
			),
			false
		);

		t.equal(
			ES.IsCompatiblePropertyDescriptor(
				true,
				v.descriptors.nonConfigurable(),
				ES.CompletePropertyDescriptor(v.descriptors.configurable())
			),
			true
		);

		t.equal(
			ES.IsCompatiblePropertyDescriptor(
				false,
				v.descriptors.nonConfigurable(),
				ES.CompletePropertyDescriptor(v.descriptors.configurable())
			),
			true
		);

		t.end();
	});

	test('IsConcatSpreadable', function (t) {
		forEach(v.primitives, function (primitive) {
			t.equal(ES.IsConcatSpreadable(primitive), false, debug(primitive) + ' is not an Object');
		});

		var hasSymbolConcatSpreadable = v.hasSymbols && Symbol.isConcatSpreadable;
		t.test('Symbol.isConcatSpreadable', { skip: !hasSymbolConcatSpreadable }, function (st) {
			forEach(v.falsies, function (falsy) {
				var obj = {};
				obj[Symbol.isConcatSpreadable] = falsy;
				st.equal(
					ES.IsConcatSpreadable(obj),
					false,
					'an object with ' + debug(falsy) + ' as Symbol.isConcatSpreadable is not concat spreadable'
				);
			});

			forEach(v.truthies, function (truthy) {
				var obj = {};
				obj[Symbol.isConcatSpreadable] = truthy;
				st.equal(
					ES.IsConcatSpreadable(obj),
					true,
					'an object with ' + debug(truthy) + ' as Symbol.isConcatSpreadable is concat spreadable'
				);
			});

			st.end();
		});

		forEach(v.objects, function (object) {
			t.equal(
				ES.IsConcatSpreadable(object),
				false,
				'non-array without Symbol.isConcatSpreadable is not concat spreadable'
			);
		});

		t.equal(ES.IsConcatSpreadable([]), true, 'arrays are concat spreadable');

		t.end();
	});

	test('IsConstructor', function (t) {
		t.equal(true, ES.IsConstructor(function () {}), 'function is constructor');
		t.equal(false, ES.IsConstructor(/a/g), 'regex is not constructor');
		forEach(v.objects, function (object) {
			t.equal(false, ES.IsConstructor(object), object + ' object is not constructor');
		});

		try {
			var arrow = Function('return () => {}')(); // eslint-disable-line no-new-func
			t.equal(ES.IsConstructor(arrow), false, 'arrow function is not constructor');
		} catch (e) {
			t.comment('SKIP: arrow function syntax not supported.');
		}

		try {
			var foo = Function('return class Foo {}')(); // eslint-disable-line no-new-func
			t.equal(ES.IsConstructor(foo), true, 'class is constructor');
		} catch (e) {
			t.comment('SKIP: class syntax not supported.');
		}

		if (typeof Reflect !== 'object' || typeof Proxy !== 'function' || hasOwn(Proxy, 'prototype')) {
			t.comment('SKIP: Proxy is constructor');
		} else {
			t.equal(ES.IsConstructor(Proxy), true, 'Proxy is constructor');
		}

		t.end();
	});

	test('IsDetachedBuffer', function (t) {
		forEach(v.primitives.concat(v.objects), function (nonArrayBuffer) {
			t['throws'](
				function () { ES.IsDetachedBuffer(nonArrayBuffer); },
				TypeError,
				debug(nonArrayBuffer) + ' is not an ArrayBuffer'
			);
		});

		t.test('ArrayBuffers', { skip: typeof ArrayBuffer !== 'function' }, function (st) {
			var buffers = [
				new ArrayBuffer(),
				new ArrayBuffer(0),
				new ArrayBuffer(4),
				new ArrayBuffer(420)
			];

			st.test('can detach', { skip: !canDetach }, function (s2t) {
				forEach(buffers, function (buffer) {
					s2t.equal(ES.IsDetachedBuffer(buffer), false, debug(buffer) + ' is not detached');
					s2t.doesNotThrow(
						function () { return new Float32Array(buffer); },
						'can create a Float32Array from a non-detached ArrayBuffer'
					);

					s2t.equal(ES.DetachArrayBuffer(buffer), null, 'returns null');

					s2t.equal(ES.IsDetachedBuffer(buffer), true, debug(buffer) + ' is now detached');
					s2t['throws'](
						function () { return new Float32Array(buffer); },
						TypeError,
						'can not create a Float32Array from a now detached ArrayBuffer'
					);
				});

				s2t.end();
			});

			// throws SyntaxError in node < 11
			st.test('can not detach', { skip: canDetach }, function (s2t) {
				forEach(buffers, function (buffer) {
					s2t.doesNotThrow(
						function () { return new Float32Array(buffer); },
						'can create a Float32Array from a non-detached ArrayBuffer'
					);

					s2t.equal(ES.IsDetachedBuffer(buffer), false, 'env does not support detaching');
				});

				s2t.end();
			});

			st.end();
		});

		t.end();
	});

	test('IsExtensible', function (t) {
		forEach(v.objects, function (object) {
			t.equal(true, ES.IsExtensible(object), debug(object) + ' object is extensible');
		});
		forEach(v.primitives, function (primitive) {
			t.equal(false, ES.IsExtensible(primitive), debug(primitive) + ' is not extensible');
		});
		if (Object.preventExtensions) {
			t.equal(false, ES.IsExtensible(Object.preventExtensions({})), 'object with extensions prevented is not extensible');
		}
		t.end();
	});

	test('IsPromise', function (t) {
		forEach(v.objects.concat(v.primitives), function (nonPromise) {
			t.equal(ES.IsPromise(nonPromise), false, debug(nonPromise) + ' is not a Promise');
		});

		t.test('Promises supported', { skip: typeof Promise !== 'function' }, function (st) {
			var thenable = { then: Promise.prototype.then };
			st.equal(ES.IsPromise(thenable), false, 'generic thenable is not a Promise');

			st.equal(ES.IsPromise(Promise.resolve()), true, 'Promise is a Promise');

			st.end();
		});

		t.end();
	});

	test('IsPropertyKey', function (t) {
		forEach(v.numbers.concat(v.objects), function (notKey) {
			t.equal(false, ES.IsPropertyKey(notKey), debug(notKey) + ' is not property key');
		});

		t.equal(true, ES.IsPropertyKey('foo'), 'string is property key');

		forEach(v.symbols, function (symbol) {
			t.equal(true, ES.IsPropertyKey(symbol), debug(symbol) + ' is property key');
		});
		t.end();
	});

	test('IsRegExp', function (t) {
		forEach([/a/g, new RegExp('a', 'g')], function (regex) {
			t.equal(true, ES.IsRegExp(regex), regex + ' is regex');
		});

		forEach(v.objects.concat(v.primitives), function (nonRegex) {
			t.equal(false, ES.IsRegExp(nonRegex), debug(nonRegex) + ' is not regex');
		});

		t.test('Symbol.match', { skip: !v.hasSymbols || !Symbol.match }, function (st) {
			var obj = {};
			obj[Symbol.match] = true;
			st.equal(true, ES.IsRegExp(obj), 'object with truthy Symbol.match is regex');

			var regex = /a/;
			defineProperty(regex, Symbol.match, { value: false });
			st.equal(false, ES.IsRegExp(regex), 'regex with falsy Symbol.match is not regex');

			st.end();
		});

		t.end();
	});

	test('IsWordChar', function (t) {
		forEach(v.nonIntegerNumbers, function (nonInteger) {
			t['throws'](
				function () { return ES.IsWordChar(nonInteger, 0, []); },
				TypeError,
				'arg 1: ' + debug(nonInteger) + ' is not an integer'
			);

			t['throws'](
				function () { return ES.IsWordChar(0, nonInteger, []); },
				TypeError,
				'arg 2: ' + debug(nonInteger) + ' is not an integer'
			);
		});

		forEach(v.nonArrays, function (nonArray) {
			t['throws'](
				function () { return ES.IsWordChar(0, 0, nonArray); },
				TypeError,
				'arg 3: ' + debug(nonArray) + ' is not an Array'
			);
		});

		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { return ES.IsWordChar(0, 0, [nonString]); },
				TypeError,
				'arg 3: ' + debug(nonString) + ' is not a character'
			);
		});

		t.equal(ES.IsWordChar(-1, 0, []), false, 'arg 1: -1 yields false');
		t.equal(ES.IsWordChar(1, 1, []), false, 'arg 1 and 2 the same yields false');
		t.equal(ES.IsWordChar(1, 1, ['a', '!']), false, 'arg 1 and 2 the same yields false even with non-word chars');
		t.equal(ES.IsWordChar(1, 1, ['a', 'b']), false, 'arg 1 and 2 the same yields false even with word chars');

		t.equal(ES.IsWordChar(0, 2, ['a', '!']), true, 'a is a word char');
		t.equal(ES.IsWordChar(1, 2, ['!', 'b']), true, 'b is a word char');

		t.end();
	});

	test('IsInteger', function (t) {
		for (var i = -100; i < 100; i += 10) {
			t.equal(true, ES.IsInteger(i), i + ' is integer');
			t.equal(false, ES.IsInteger(i + 0.2), (i + 0.2) + ' is not integer');
		}
		t.equal(true, ES.IsInteger(-0), '-0 is integer');
		var notInts = v.nonNumbers.concat(v.nonIntegerNumbers, v.infinities, [NaN, [], new Date()]);
		forEach(notInts, function (notInt) {
			t.equal(false, ES.IsInteger(notInt), debug(notInt) + ' is not integer');
		});
		t.equal(false, ES.IsInteger(v.uncoercibleObject), 'uncoercibleObject is not integer');
		t.end();
	});

	test('IteratorNext', function (t) {
		forEach(v.primitives, function (nonObject) {
			t['throws'](
				function () { ES.IteratorNext(nonObject); },
				TypeError,
				debug(nonObject) + ' is not an Object'
			);

			t['throws'](
				function () { ES.IteratorNext({ next: function () { return nonObject; } }); },
				TypeError,
				'`next()` returns ' + debug(nonObject) + ', which is not an Object'
			);
		});

		var iterator = {
			next: function (value) {
				return [arguments.length, value];
			}
		};
		t.deepEqual(
			ES.IteratorNext(iterator),
			[0, undefined],
			'returns expected value from `.next()`; `next` receives expected 0 arguments'
		);
		t.deepEqual(
			ES.IteratorNext(iterator, iterator),
			[1, iterator],
			'returns expected value from `.next()`; `next` receives expected 1 argument'
		);

		t.end();
	});

	test('IteratorComplete', function (t) {
		forEach(v.primitives, function (nonObject) {
			t['throws'](
				function () { ES.IteratorComplete(nonObject); },
				TypeError,
				debug(nonObject) + ' is not an Object'
			);
		});

		forEach(v.truthies, function (truthy) {
			t.equal(ES.IteratorComplete({ done: truthy }), true, '{ done: ' + debug(truthy) + ' } is true');
		});

		forEach(v.falsies, function (falsy) {
			t.equal(ES.IteratorComplete({ done: falsy }), false, '{ done: ' + debug(falsy) + ' } is false');
		});

		t.end();
	});

	test('IteratorValue', function (t) {
		forEach(v.primitives, function (nonObject) {
			t['throws'](
				function () { ES.IteratorValue(nonObject); },
				TypeError,
				debug(nonObject) + ' is not an Object'
			);
		});

		var sentinel = {};
		t.equal(ES.IteratorValue({ value: sentinel }), sentinel, 'Gets `.value` off the object');

		t.end();
	});

	test('IteratorStep', function (t) {
		forEach(v.primitives.concat(v.objects), function (nonIteratorRecord) {
			t['throws'](
				function () { ES.IteratorStep(nonIteratorRecord); },
				TypeError,
				debug(nonIteratorRecord) + ' is not an Iterator Record'
			);
		});

		t.deepEqual(
			ES.IteratorStep({
				next: function () {
					return {
						done: false,
						value: [1, arguments.length]
					};
				}
			}),
			{ done: false, value: [1, 0] },
			'not-done iterator result yields iterator result'
		);
		t.deepEqual(
			ES.IteratorStep({
				next: function () {
					return {
						done: true,
						value: [2, arguments.length]
					};
				}
			}),
			false,
			'done iterator result yields false'
		);

		t.end();
	});

	test('IteratorClose', function (t) {
		forEach(v.primitives, function (nonObject) {
			t['throws'](
				function () { ES.IteratorClose(nonObject); },
				TypeError,
				debug(nonObject) + ' is not an Object'
			);

			t['throws'](
				function () { ES.IteratorClose({ 'return': function () { return nonObject; } }, function () {}); },
				TypeError,
				'`.return` returns ' + debug(nonObject) + ', which is not an Object'
			);
		});

		forEach(v.nonFunctions, function (nonFunction) {
			t['throws'](
				function () { ES.IteratorClose({}, nonFunction); },
				TypeError,
				debug(nonFunction) + ' is not a thunk for a Completion Record'
			);

			if (nonFunction != null) {
				t['throws'](
					function () { ES.IteratorClose({ 'return': nonFunction }, function () {}); },
					TypeError,
					'`.return` of ' + debug(nonFunction) + ' is not a Function'
				);
			}
		});

		var sentinel = {};
		t.equal(
			ES.IteratorClose({ 'return': undefined }, function () { return sentinel; }),
			sentinel,
			'when `.return` is `undefined`, invokes and returns the completion thunk'
		);
		t.equal(
			ES.IteratorClose({ 'return': undefined }, ES.NormalCompletion(sentinel)),
			sentinel,
			'when `.return` is `undefined`, invokes and returns the Completion Record'
		);

		/* eslint no-throw-literal: 0 */
		t.throwsSentinel(
			function () { ES.IteratorClose({ 'return': function () { throw sentinel; } }, function () {}); },
			sentinel,
			'`.return` that throws, when completionThunk does not, throws exception from `.return`'
		);
		t.throwsSentinel(
			function () { ES.IteratorClose({ 'return': function () { throw sentinel; } }, ES.NormalCompletion()); },
			sentinel,
			'`.return` that throws, when Completion Record does not, throws exception from `.return`'
		);

		t.throwsSentinel(
			function () { ES.IteratorClose({ 'return': function () { throw sentinel; } }, function () { throw -1; }); },
			-1,
			'`.return` that throws, when completionThunk does too, throws exception from completionThunk'
		);
		t.throwsSentinel(
			function () { ES.IteratorClose({ 'return': function () { throw sentinel; } }, ES.CompletionRecord('throw', -1)); },
			-1,
			'`.return` that throws, when completionThunk does too, throws exception from Completion Record'
		);

		t.throwsSentinel(
			function () { ES.IteratorClose({ 'return': function () { } }, function () { throw -1; }); },
			-1,
			'`.return` that does not throw, when completionThunk does, throws exception from completionThunk'
		);
		t.throwsSentinel(
			function () { ES.IteratorClose({ 'return': function () { } }, ES.CompletionRecord('throw', -1)); },
			-1,
			'`.return` that does not throw, when completionThunk does, throws exception from Competion Record'
		);

		t.equal(
			ES.IteratorClose({ 'return': function () { return sentinel; } }, function () { return 42; }),
			42,
			'when `.return` and completionThunk do not throw, and `.return` returns an Object, returns completionThunk'
		);
		t.equal(
			ES.IteratorClose({ 'return': function () { return sentinel; } }, ES.NormalCompletion(42)),
			42,
			'when `.return` and Completion Record do not throw, and `.return` returns an Object, returns completionThunk'
		);

		t.end();
	});

	test('max', function (t) {
		t.equal(ES.max.apply(null, v.numbers), Math.max.apply(null, v.numbers), 'works with numbers');

		t.end();
	});

	test('min', function (t) {
		t.equal(ES.min.apply(null, v.numbers), Math.min.apply(null, v.numbers), 'works with numbers');

		t.end();
	});

	test('NewPromiseCapability', function (t) {
		forEach(v.nonFunctions.concat(v.nonConstructorFunctions), function (nonConstructor) {
			t['throws'](
				function () { ES.NewPromiseCapability(nonConstructor); },
				TypeError,
				debug(nonConstructor) + ' is not a constructor'
			);
		});

		var calls = [];

		var C = function C(executor) {
			calls.push('constructor');
			t.equal(arguments.length, 1, 'is passed one argument');
			t.equal(typeof executor, 'function', 'is passed a function');

			executor(
				function resolve() { calls.push('resolve'); },
				function reject() { calls.push('reject'); }
			);
		};
		C.prototype.then = function () {};

		var record = ES.NewPromiseCapability(C);
		t.equal(
			isPromiseCapabilityRecord(record),
			true,
			'return value is a Promise Capability Record'
		);

		t.ok(record['[[Promise]]'] instanceof C, 'is an instance of the passed constructor');

		t.deepEqual(calls, ['constructor']);

		record['[[Resolve]]']();

		t.deepEqual(calls, ['constructor', 'resolve']);

		record['[[Reject]]']();

		t.deepEqual(calls, ['constructor', 'resolve', 'reject']);

		t.end();
	});

	test('NormalCompletion', function (t) {
		var sentinel = {};
		var completion = ES.NormalCompletion(sentinel);

		t.ok(completion instanceof ES.CompletionRecord, 'produces an instance of CompletionRecord');

		t.equal(SLOT.get(completion, '[[type]]'), 'normal', 'completion type is "normal"');
		t.equal(completion.type(), 'normal', 'completion type is "normal" (via property)');
		t.equal(SLOT.get(completion, '[[value]]'), sentinel, 'completion value is the argument provided');
		t.equal(completion.value(), sentinel, 'completion value is the argument provided (via property)');

		t.end();
	});

	test('ObjectCreate', function (t) {
		forEach(v.nonNullPrimitives, function (value) {
			t['throws'](
				function () { ES.ObjectCreate(value); },
				TypeError,
				debug(value) + ' is not null, or an object'
			);
		});

		t.test('proto arg', function (st) {
			var Parent = function Parent() {};
			Parent.prototype.foo = {};
			var child = ES.ObjectCreate(Parent.prototype);
			st.equal(child instanceof Parent, true, 'child is instanceof Parent');
			st.equal(child.foo, Parent.prototype.foo, 'child inherits properties from Parent.prototype');

			st.end();
		});

		t.test('internal slots arg', function (st) {
			st.doesNotThrow(function () { ES.ObjectCreate({}, []); }, 'an empty slot list is valid');

			var O = ES.ObjectCreate({}, ['a', 'b']);
			st.doesNotThrow(
				function () {
					SLOT.assert(O, 'a');
					SLOT.assert(O, 'b');
				},
				'expected internal slots exist'
			);
			st['throws'](
				function () { SLOT.assert(O, 'c'); },
				TypeError,
				'internal slots that should not exist throw'
			);

			st.end();
		});

		t.test('null proto', { skip: !Object.create && !$setProto }, function (st) {
			st.equal('toString' in {}, true, 'normal objects have toString');
			st.equal('toString' in ES.ObjectCreate(null), false, 'makes a null object');

			st.end();
		});

		t.test('null proto when no native Object.create', { skip: Object.create || $setProto }, function (st) {
			st['throws'](
				function () { ES.ObjectCreate(null); },
				SyntaxError,
				'without a native Object.create, can not create null objects'
			);

			st.end();
		});

		t.end();
	});

	test('ObjectDefineProperties', function (t) {
		forEach(v.primitives, function (nonObject) {
			t['throws'](
				function () { ES.ObjectDefineProperties(nonObject); },
				debug(nonObject) + ' is not an Object'
			);
		});

		var sentinel = { sentinel: true };

		t.test('basic data properties', function (st) {
			var o = {};
			var result = ES.ObjectDefineProperties(o, {
				foo: fromPropertyDescriptor(v.assignedDescriptor(42)),
				bar: fromPropertyDescriptor(v.assignedDescriptor(sentinel)),
				toString: fromPropertyDescriptor(v.assignedDescriptor('not Object.prototype.toString'))
			});

			st.equal(result, o, 'returns same object');
			st.deepEqual(
				o,
				{
					foo: 42,
					bar: sentinel,
					toString: 'not Object.prototype.toString'
				},
				'expected properties are installed'
			);

			st.end();
		});

		t.test('fancy stuff', function (st) {
			st.doesNotThrow(
				function () { ES.ObjectDefineProperties({}, { foo: v.assignedDescriptor(42) }); },
				TypeError
			);

			var o = {};
			var result = ES.ObjectDefineProperties(o, {
				foo: fromPropertyDescriptor(v.accessorDescriptor(42)),
				bar: fromPropertyDescriptor(v.descriptors.enumerable(v.descriptors.nonConfigurable(v.dataDescriptor(sentinel)))),
				toString: fromPropertyDescriptor(v.accessorDescriptor('not Object.prototype.toString'))
			});
			st.equal(result, o, 'returns same object');
			st.deepEqual(
				o,
				{
					foo: 42,
					bar: sentinel,
					toString: 'not Object.prototype.toString'
				},
				'expected properties are installed'
			);

			st.end();
		});

		t.end();
	});

	test('OrdinaryCreateFromConstructor', function (t) {
		forEach(v.nonFunctions, function (nonFunction) {
			t['throws'](
				function () { ES.OrdinaryCreateFromConstructor(nonFunction, '%Array.prototype%'); },
				TypeError,
				debug(nonFunction) + ' is not a constructor'
			);
		});

		forEach(arrowFns, function (arrowFn) {
			t['throws'](
				function () { ES.OrdinaryCreateFromConstructor(arrowFn, '%Array.prototype%'); },
				TypeError,
				debug(arrowFn) + ' is not a constructor'
			);
		});

		t.test('proto arg', function (st) {
			var Parent = function Parent() {};
			Parent.prototype.foo = {};
			var child = ES.OrdinaryCreateFromConstructor(Parent, '%Array.prototype%');
			st.equal(child instanceof Parent, true, 'child is instanceof Parent');
			st.equal(child instanceof Array, false, 'child is not instanceof Array');
			st.equal(child.foo, Parent.prototype.foo, 'child inherits properties from Parent.prototype');

			st.end();
		});

		t.test('internal slots arg', function (st) {
			st.doesNotThrow(
				function () { ES.OrdinaryCreateFromConstructor(function () {}, '%Array.prototype%', []); },
				'an empty slot list is valid'
			);

			var O = ES.OrdinaryCreateFromConstructor(function () {}, '%Array.prototype%', ['a', 'b']);
			st.doesNotThrow(
				function () {
					SLOT.assert(O, 'a');
					SLOT.assert(O, 'b');
				},
				'expected internal slots exist'
			);
			st['throws'](
				function () { SLOT.assert(O, 'c'); },
				TypeError,
				'internal slots that should not exist throw'
			);

			st.end();
		});

		t.end();
	});

	test('OrdinaryGetOwnProperty', function (t) {
		forEach(v.primitives, function (primitive) {
			t['throws'](
				function () { ES.OrdinaryGetOwnProperty(primitive, ''); },
				TypeError,
				'O: ' + debug(primitive) + ' is not an Object'
			);
		});
		forEach(v.nonPropertyKeys, function (nonPropertyKey) {
			t['throws'](
				function () { ES.OrdinaryGetOwnProperty({}, nonPropertyKey); },
				TypeError,
				'P: ' + debug(nonPropertyKey) + ' is not a Property Key'
			);
		});

		t.equal(ES.OrdinaryGetOwnProperty({}, 'not in the object'), undefined, 'missing property yields undefined');
		t.equal(ES.OrdinaryGetOwnProperty({}, 'toString'), undefined, 'inherited non-own property yields undefined');

		t.deepEqual(
			ES.OrdinaryGetOwnProperty({ a: 1 }, 'a'),
			ES.ToPropertyDescriptor({
				configurable: true,
				enumerable: true,
				value: 1,
				writable: true
			}),
			'own assigned data property yields expected descriptor'
		);

		t.deepEqual(
			ES.OrdinaryGetOwnProperty(/a/, 'lastIndex'),
			ES.ToPropertyDescriptor({
				configurable: false,
				enumerable: false,
				value: 0,
				writable: true
			}),
			'regex lastIndex yields expected descriptor'
		);

		t.deepEqual(
			ES.OrdinaryGetOwnProperty([], 'length'),
			ES.ToPropertyDescriptor({
				configurable: false,
				enumerable: false,
				value: 0,
				writable: true
			}),
			'array length yields expected descriptor'
		);

		if (!Object.isFrozen || !Object.isFrozen(Object.prototype)) {
			t.deepEqual(
				ES.OrdinaryGetOwnProperty(Object.prototype, 'toString'),
				ES.ToPropertyDescriptor({
					configurable: true,
					enumerable: false,
					value: Object.prototype.toString,
					writable: true
				}),
				'own non-enumerable data property yields expected descriptor'
			);
		}

		t.test('ES5+', { skip: !$defineProperty }, function (st) {
			var O = {};
			defineProperty(O, 'foo', {
				configurable: false,
				enumerable: false,
				value: O,
				writable: true
			});

			st.deepEqual(
				ES.OrdinaryGetOwnProperty(O, 'foo'),
				ES.ToPropertyDescriptor({
					configurable: false,
					enumerable: false,
					value: O,
					writable: true
				}),
				'defined own property yields expected descriptor'
			);

			st.end();
		});

		t.end();
	});

	test('OrdinaryDefineOwnProperty', { skip: !getOwnPropertyDescriptor }, function (t) {
		forEach(v.primitives, function (primitive) {
			t['throws'](
				function () { ES.OrdinaryDefineOwnProperty(primitive, {}, []); },
				TypeError,
				'O: ' + debug(primitive) + ' is not an Object'
			);
		});
		forEach(v.nonPropertyKeys, function (nonPropertyKey) {
			t['throws'](
				function () { ES.OrdinaryDefineOwnProperty({}, nonPropertyKey, v.genericDescriptor()); },
				TypeError,
				'P: ' + debug(nonPropertyKey) + ' is not a Property Key'
			);
		});
		forEach(v.primitives, function (primitive) {
			t['throws'](
				function () { ES.OrdinaryDefineOwnProperty({}, '', primitive); },
				TypeError,
				'Desc: ' + debug(primitive) + ' is not a Property Descriptor'
			);
		});

		var O = {};
		var P = 'property key';
		var Desc = v.accessorDescriptor();
		t.equal(
			ES.OrdinaryDefineOwnProperty(O, P, Desc),
			true,
			'operation is successful'
		);
		t.deepEqual(
			getOwnPropertyDescriptor(O, P),
			ES.FromPropertyDescriptor(ES.CompletePropertyDescriptor(Desc)),
			'expected property descriptor is defined'
		);

		t.end();
	});

	test('OrdinaryHasInstance', function (t) {
		forEach(v.nonFunctions, function (nonFunction) {
			t.equal(ES.OrdinaryHasInstance(nonFunction, {}), false, debug(nonFunction) + ' is not callable');
		});

		forEach(v.primitives, function (primitive) {
			t.equal(ES.OrdinaryHasInstance(function () {}, primitive), false, debug(primitive) + ' is not an object');
		});

		var C = function C() {};
		var c = new C();
		var D = function D() {};
		t.equal(ES.OrdinaryHasInstance(C, c), true, 'constructor function has an instance of itself');
		t.equal(ES.OrdinaryHasInstance(C, new D()), false, 'constructor/instance mismatch is false');
		t.equal(ES.OrdinaryHasInstance(D, c), false, 'instance/constructor mismatch is false');
		t.equal(ES.OrdinaryHasInstance(C, {}), false, 'plain object is not an instance of a constructor');
		t.equal(ES.OrdinaryHasInstance(Object, {}), true, 'plain object is an instance of Object');

		forEach(v.primitives, function (primitive) {
			C.prototype = primitive;
			t['throws'](
				function () { ES.OrdinaryHasInstance(C, c); },
				TypeError,
				'prototype is ' + debug(primitive)
			);
		});

		t.end();
	});

	test('OrdinaryHasProperty', function (t) {
		forEach(v.primitives, function (primitive) {
			t['throws'](
				function () { ES.OrdinaryHasProperty(primitive, ''); },
				TypeError,
				debug(primitive) + ' is not an object'
			);
		});
		forEach(v.nonPropertyKeys, function (nonPropertyKey) {
			t['throws'](
				function () { ES.OrdinaryHasProperty({}, nonPropertyKey); },
				TypeError,
				'P: ' + debug(nonPropertyKey) + ' is not a Property Key'
			);
		});

		t.equal(ES.OrdinaryHasProperty({ a: 1 }, 'a'), true, 'own property is true');
		t.equal(ES.OrdinaryHasProperty({}, 'toString'), true, 'inherited property is true');
		t.equal(ES.OrdinaryHasProperty({}, 'nope'), false, 'absent property is false');

		t.end();
	});

	test('QuoteJSONString', function (t) {
		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { ES.QuoteJSONString(nonString); },
				TypeError,
				debug(nonString) + ' is not a String'
			);
		});

		t.equal(ES.QuoteJSONString(''), '""', '"" gets properly JSON-quoted');
		t.equal(ES.QuoteJSONString('a'), '"a"', '"a" gets properly JSON-quoted');
		t.equal(ES.QuoteJSONString('"'), '"\\""', '"\\"" gets properly JSON-quoted');
		t.equal(ES.QuoteJSONString('\b'), '"\\b"', '"\\b" gets properly JSON-quoted');
		t.equal(ES.QuoteJSONString('\t'), '"\\t"', '"\\t" gets properly JSON-quoted');
		t.equal(ES.QuoteJSONString('\n'), '"\\n"', '"\\n" gets properly JSON-quoted');
		t.equal(ES.QuoteJSONString('\f'), '"\\f"', '"\\f" gets properly JSON-quoted');
		t.equal(ES.QuoteJSONString('\r'), '"\\r"', '"\\r" gets properly JSON-quoted');
		t.equal(ES.QuoteJSONString('\\'), '"\\\\"', '"\\\\" gets properly JSON-quoted');
		t.equal(ES.QuoteJSONString('\\'), '"\\\\"', '"\\\\" gets properly JSON-quoted');
		t.equal(ES.QuoteJSONString('\u0019'), '"\\u0019"', '"\\u0019" gets properly JSON-quoted');

		t.end();
	});

	test('RegExpCreate', function (t) {
		forEach(v.nonStrings, function (nonString) {
			if (typeof nonString !== 'symbol') {
				var p = typeof nonString === 'undefined' ? '' : nonString;
				t.equal(
					String(ES.RegExpCreate(p, 'g')),
					'/' + (String(p) || RegExp.prototype.source || String(RegExp.prototype).slice(1, -1)) + '/g',
					debug(nonString) + ' becomes `/' + String(p) + '/g`'
				);
			}
		});

		t.deepEqual(ES.RegExpCreate(), new RegExp(), 'undefined pattern and flags yields empty regex');

		t.end();
	});

	test('RegExpExec', function (t) {
		forEach(v.primitives, function (primitive) {
			t['throws'](
				function () { ES.RegExpExec(primitive); },
				TypeError,
				'"R" argument must be an object; ' + debug(primitive) + ' is not'
			);
		});

		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { ES.RegExpExec({}, nonString); },
				TypeError,
				'"S" argument must be a String; ' + debug(nonString) + ' is not'
			);
		});

		t.test('gets and calls a callable "exec"', function (st) {
			var str = '123';
			var o = {
				exec: function (S) {
					st.equal(this, o, '"exec" receiver is R');
					st.equal(S, str, '"exec" argument is S');

					return null;
				}
			};
			st.plan(2);
			ES.RegExpExec(o, str);
			st.end();
		});

		t.test('throws if a callable "exec" returns a non-null non-object', function (st) {
			var str = '123';
			st.plan(v.nonNullPrimitives.length);
			forEach(v.nonNullPrimitives, function (nonNullPrimitive) {
				st['throws'](
					function () { ES.RegExpExec({ exec: function () { return nonNullPrimitive; } }, str); },
					TypeError,
					'"exec" method must return `null` or an Object; ' + debug(nonNullPrimitive) + ' is not'
				);
			});
			st.end();
		});

		t.test('actual regex that should match against a string', function (st) {
			var S = 'aabc';
			var R = /a/g;
			var match1 = ES.RegExpExec(R, S);
			var expected1 = assign(['a'], kludgeMatch(R, { index: 0, input: S }));
			var match2 = ES.RegExpExec(R, S);
			var expected2 = assign(['a'], kludgeMatch(R, { index: 1, input: S }));
			var match3 = ES.RegExpExec(R, S);
			st.deepEqual(match1, expected1, 'match object 1 is as expected');
			st.deepEqual(match2, expected2, 'match object 2 is as expected');
			st.equal(match3, null, 'match 3 is null as expected');
			st.end();
		});

		t.test('actual regex that should match against a string, with shadowed "exec"', function (st) {
			var S = 'aabc';
			var R = /a/g;
			defineProperty(R, 'exec', { configurable: true, enumerable: true, value: undefined, writable: true });
			var match1 = ES.RegExpExec(R, S);
			var expected1 = assign(['a'], kludgeMatch(R, { index: 0, input: S }));
			var match2 = ES.RegExpExec(R, S);
			var expected2 = assign(['a'], kludgeMatch(R, { index: 1, input: S }));
			var match3 = ES.RegExpExec(R, S);
			st.deepEqual(match1, expected1, 'match object 1 is as expected');
			st.deepEqual(match2, expected2, 'match object 2 is as expected');
			st.equal(match3, null, 'match 3 is null as expected');
			st.end();
		});
		t.end();
	});

	test('RequireObjectCoercible', function (t) {
		t.equal(false, 'CheckObjectCoercible' in ES, 'CheckObjectCoercible -> RequireObjectCoercible in ES6');
		t['throws'](function () { return ES.RequireObjectCoercible(undefined); }, TypeError, 'undefined throws');
		t['throws'](function () { return ES.RequireObjectCoercible(null); }, TypeError, 'null throws');
		var isCoercible = function (value) {
			t.doesNotThrow(function () { return ES.RequireObjectCoercible(value); }, debug(value) + ' does not throw');
		};
		forEach(v.objects.concat(v.nonNullPrimitives), isCoercible);
		t.end();
	});

	test('SameValueZero', function (t) {
		t.equal(true, ES.SameValueZero(NaN, NaN), 'NaN is SameValueZero as NaN');
		t.equal(true, ES.SameValueZero(0, -0), '+0 is SameValueZero as -0');
		forEach(v.objects.concat(v.primitives), function (val) {
			t.equal(val === val, ES.SameValueZero(val, val), debug(val) + ' is SameValueZero to itself');
		});
		t.end();
	});

	test('Set', function (t) {
		forEach(v.primitives, function (primitive) {
			t['throws'](
				function () { ES.Set(primitive, '', null, false); },
				TypeError,
				debug(primitive) + ' is not an Object'
			);
		});

		forEach(v.nonPropertyKeys, function (nonKey) {
			t['throws'](
				function () { ES.Set({}, nonKey, null, false); },
				TypeError,
				debug(nonKey) + ' is not a Property Key'
			);
		});

		forEach(v.nonBooleans, function (nonBoolean) {
			t['throws'](
				function () { ES.Set({}, '', null, nonBoolean); },
				TypeError,
				debug(nonBoolean) + ' is not a Boolean'
			);
		});

		var o = {};
		var value = {};
		ES.Set(o, 'key', value, true);
		t.deepEqual(o, { key: value }, 'key is set');

		t.test('nonwritable', { skip: !$defineProperty }, function (st) {
			var obj = { a: value };
			defineProperty(obj, 'a', { writable: false });

			st['throws'](
				function () { ES.Set(obj, 'a', {}, true); },
				TypeError,
				'can not Set nonwritable property'
			);

			st.doesNotThrow(
				function () {
					st.equal(ES.Set(obj, 'a', {}, false), false, 'unsuccessful Set returns false');
				},
				'setting Throw to false prevents an exception'
			);

			st.end();
		});

		t.test('nonconfigurable', { skip: !$defineProperty }, function (st) {
			var obj = { a: value };
			defineProperty(obj, 'a', { configurable: false });

			st.equal(ES.Set(obj, 'a', value, true), true, 'successful Set returns true');
			st.deepEqual(obj, { a: value }, 'key is set');

			st.end();
		});

		t.test('doesn’t call [[Get]] in conforming strict mode environments', { skip: noThrowOnStrictViolation }, function (st) {
			var getterCalled = false;
			var setterCalls = 0;
			var obj = {};
			defineProperty(obj, 'a', {
				get: function () {
					getterCalled = true;
				},
				set: function () {
					setterCalls += 1;
				}
			});

			st.equal(ES.Set(obj, 'a', value, false), true, 'successful Set returns true');
			st.equal(setterCalls, 1, 'setter was called once');
			st.equal(getterCalled, false, 'getter was not called');

			st.end();
		});

		t.end();
	});

	test('SetFunctionName', function (t) {
		forEach(v.nonFunctions, function (nonFunction) {
			t['throws'](
				function () { ES.SetFunctionName(nonFunction, ''); },
				TypeError,
				debug(nonFunction) + ' is not a Function'
			);
		});

		t.test('non-extensible function', { skip: !Object.preventExtensions }, function (st) {
			var f = getNamelessFunction();
			Object.preventExtensions(f);
			st['throws'](
				function () { ES.SetFunctionName(f, ''); },
				TypeError,
				'throws on a non-extensible function'
			);
			st.end();
		});

		t.test('has an own name property', { skip: !functionsHaveNames }, function (st) {
			st['throws'](
				function () { ES.SetFunctionName(function g() {}, ''); },
				TypeError,
				'throws if function has an own `name` property'
			);
			st.end();
		});

		forEach(v.nonPropertyKeys, function (nonPropertyKey) {
			t['throws'](
				function () { ES.SetFunctionName(getNamelessFunction(), nonPropertyKey); },
				TypeError,
				debug(nonPropertyKey) + ' is not a Symbol or String'
			);
		});

		t.test('symbols', { skip: !v.hasSymbols || hasOwn(getNamelessFunction(), 'name') }, function (st) {
			var pairs = [
				[Symbol(), ''],
				[Symbol(undefined), ''],
				[Symbol(null), '[null]'],
				[Symbol(''), getInferredName ? '[]' : ''],
				[Symbol.iterator, '[Symbol.iterator]'],
				[Symbol('foo'), '[foo]']
			];
			forEach(pairs, function (pair) {
				var sym = pair[0];
				var desc = pair[1];
				var f = getNamelessFunction();
				ES.SetFunctionName(f, sym);
				st.equal(f.name, desc, debug(sym) + ' yields a name of ' + debug(desc));
			});

			st.end();
		});

		var f = getNamelessFunction();
		t.test('when names are configurable', { skip: !functionsHaveConfigurableNames || hasOwn(f, 'name') }, function (st) {
			// without prefix
			st.notEqual(f.name, 'foo', 'precondition');
			ES.SetFunctionName(f, 'foo');
			st.equal(f.name, 'foo', 'function name is set without a prefix');

			// with prefix
			var g = getNamelessFunction();
			st.notEqual(g.name, 'pre- foo', 'precondition');
			ES.SetFunctionName(g, 'foo', 'pre-');
			st.equal(g.name, 'pre- foo', 'function name is set with a prefix');

			st.end();
		});

		t.end();
	});

	test('SetIntegrityLevel', function (t) {
		forEach(v.primitives, function (primitive) {
			t['throws'](
				function () { ES.SetIntegrityLevel(primitive); },
				TypeError,
				debug(primitive) + ' is not an Object'
			);
		});

		t['throws'](
			function () { ES.SetIntegrityLevel({}); },
			/^TypeError: Assertion failed: `level` must be `"sealed"` or `"frozen"`$/,
			'`level` must be `"sealed"` or `"frozen"`'
		);

		var O = { a: 1 };
		t.test('sealed', { skip: !Object.preventExtensions || noThrowOnStrictViolation }, function (st) {
			st.equal(ES.SetIntegrityLevel(O, 'sealed'), true);
			st['throws'](
				function () { O.b = 2; },
				/^TypeError: (Cannot|Can't) add property b, object is not extensible$/,
				'sealing prevent new properties from being added'
			);
			O.a = 2;
			st.equal(O.a, 2, 'pre-frozen, existing properties are mutable');
			st.end();
		});

		t.test('frozen', { skip: !Object.freeze || noThrowOnStrictViolation }, function (st) {
			st.equal(ES.SetIntegrityLevel(O, 'frozen'), true);
			st['throws'](
				function () { O.a = 3; },
				/^TypeError: Cannot assign to read only property 'a' of /,
				'freezing prevents existing properties from being mutated'
			);
			st.end();
		});

		t.end();
	});

	test('SetValueInBuffer', function (t) {
		forEach(v.primitives.concat(v.objects), function (nonAB) {
			t['throws'](
				function () { ES.SetValueInBuffer(nonAB, 0, 'Int8', 0); },
				TypeError,
				debug(nonAB) + ' is not an ArrayBuffer'
			);
		});

		t.test('ArrayBuffers supported', { skip: typeof ArrayBuffer !== 'function' }, function (st) {
			forEach(v.notNonNegativeIntegers, function (nonNonNegativeInteger) {
				st['throws'](
					function () { ES.SetValueInBuffer(new ArrayBuffer(8), nonNonNegativeInteger, 'Int8', 0); },
					TypeError,
					debug(nonNonNegativeInteger) + ' is not a valid byte index'
				);
			});

			forEach(v.nonStrings.concat('not a valid type'), function (nonString) {
				st['throws'](
					function () { ES.SetValueInBuffer(new ArrayBuffer(8), 0, nonString, 0); },
					TypeError,
					'type: ' + debug(nonString) + ' is not a valid String (or type) value'
				);
			});

			forEach(v.nonBooleans, function (nonBoolean) {
				st['throws'](
					function () { ES.SetValueInBuffer(new ArrayBuffer(8), 0, 'Int8', 0, nonBoolean); },
					TypeError,
					'isTypedArray: ' + debug(nonBoolean) + ' is not a valid Boolean value'
				);
			});

			forEach(v.nonNumbers, function (nonNumber) {
				st['throws'](
					function () { ES.SetValueInBuffer(new ArrayBuffer(8), 0, 'Int8', nonNumber); },
					TypeError,
					debug(nonNumber) + ' is not a valid Number or BigInt value'
				);
			});

			st.test('can detach', { skip: !canDetach }, function (s2t) {
				var buffer = new ArrayBuffer(8);
				s2t.equal(ES.DetachArrayBuffer(buffer), null, 'detaching returns null');

				s2t['throws'](
					function () { ES.SetValueInBuffer(buffer, 0, 'Int8', 0); },
					TypeError,
					'detached buffers throw'
				);

				s2t.end();
			});

			forEach(bufferTestCases, function (testCase, name) {
				forEach([].concat(
					'Int8',
					'Uint8',
					'Uint8C',
					'Int16',
					'Uint16',
					'Int32',
					'Uint32',
					'Float32',
					'Float64'
				), function (type) {
					var hasBigEndian = type !== 'Int8' && type !== 'Uint8' && type !== 'Uint8C'; // the 8-bit types are special, they don't have big-endian
					var result = testCase[type === 'Uint8C' ? 'Uint8Clamped' : type];
					var value = unserialize(testCase.value);
					var valToSet = type === 'Uint8Clamped' && value > 255 ? 255 : value;

					/*
					st.equal(
						ES.SetValueInBuffer(testCase.buffer, 0, type, true, 'Unordered'),
						defaultEndianness === testCase.endian ? testCase[type].little.value] : testCase[type].big.value,
						'buffer holding ' + debug(testCase.value) + ' (' + testCase.endian + ' endian) with type ' + type + ', default endian, yields expected value'
					);
					*/

					var elementSize = elementSizes['$' + (type === 'Uint8C' ? 'Uint8Clamped' : type) + 'Array'];

					var buffer = new ArrayBuffer(elementSizes.$Float64Array);
					var copyBytes = new Uint8Array(buffer);

					clearBuffer(buffer);

					st.equal(
						ES.SetValueInBuffer(buffer, 0, type, valToSet, true),
						void undefined,
						'returns undefined'
					);
					st.deepEqual(
						arrayFrom(Array.prototype.slice.call(copyBytes, 0, elementSize)),
						arrayFrom(Array.prototype.slice.call(new Uint8Array(result[type === 'Float64' ? 'setAsLittle' : 'setAsTruncatedLittle'].bytes), 0, elementSize)),
						'buffer holding ' + debug(value) + ' with type ' + type + ', little endian, yields expected value'
					);

					if (hasBigEndian) {
						clearBuffer(buffer);

						st.equal(
							ES.SetValueInBuffer(buffer, 0, type, valToSet, false),
							void undefined,
							'returns undefined'
						);
						st.deepEqual(
							arrayFrom(Array.prototype.slice.call(copyBytes, 0, elementSize)),
							arrayFrom(Array.prototype.slice.call(new Uint8Array(result[type === 'Float64' ? 'setAsBig' : 'setAsTruncatedBig'].bytes), 0, elementSize)),
							'buffer holding ' + debug(value) + ' with type ' + type + ', big endian, yields expected value'
						);
					}
				});
			});

			st.end();
		});

		t.end();
	});

	test('SpeciesConstructor', function (t) {
		t['throws'](function () { ES.SpeciesConstructor(null); }, TypeError);
		t['throws'](function () { ES.SpeciesConstructor(undefined); }, TypeError);

		var defaultConstructor = function Foo() {};

		t.equal(
			ES.SpeciesConstructor({ constructor: undefined }, defaultConstructor),
			defaultConstructor,
			'undefined constructor returns defaultConstructor'
		);

		t['throws'](
			function () { return ES.SpeciesConstructor({ constructor: null }, defaultConstructor); },
			TypeError,
			'non-undefined non-object constructor throws'
		);

		t.test('with Symbol.species', { skip: !hasSpecies }, function (st) {
			var Bar = function Bar() {};
			Bar[Symbol.species] = null;

			st.equal(
				ES.SpeciesConstructor(new Bar(), defaultConstructor),
				defaultConstructor,
				'undefined/null Symbol.species returns default constructor'
			);

			var Baz = function Baz() {};
			Baz[Symbol.species] = Bar;
			st.equal(
				ES.SpeciesConstructor(new Baz(), defaultConstructor),
				Bar,
				'returns Symbol.species constructor value'
			);

			Baz[Symbol.species] = {};
			st['throws'](
				function () { ES.SpeciesConstructor(new Baz(), defaultConstructor); },
				TypeError,
				'throws when non-constructor non-null non-undefined species value found'
			);

			st.end();
		});

		t.end();
	});

	test('SplitMatch', function (t) {
		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { ES.SplitMatch(nonString, 0, ''); },
				TypeError,
				'S: ' + debug(nonString) + ' is not a String'
			);
			t['throws'](
				function () { ES.SplitMatch('', 0, nonString); },
				TypeError,
				'R: ' + debug(nonString) + ' is not a String'
			);
		});

		forEach(v.nonNumbers.concat(v.nonIntegerNumbers), function (nonIntegerNumber) {
			t['throws'](
				function () { ES.SplitMatch('', nonIntegerNumber, ''); },
				TypeError,
				'q: ' + debug(nonIntegerNumber) + ' is not an integer'
			);
		});

		t.equal(ES.SplitMatch('abc', 0, 'a'), 1, '"a" is found at index 0, before index 1, in "abc"');
		t.equal(ES.SplitMatch('abc', 1, 'a'), false, '"a" is not found at index 1 in "abc"');
		t.equal(ES.SplitMatch('abc', 2, 'a'), false, '"a" is not found at index 2 in "abc"');

		t.equal(ES.SplitMatch('abc', 0, 'b'), false, '"a" is not found at index 0 in "abc"');
		t.equal(ES.SplitMatch('abc', 1, 'b'), 2, '"b" is found at index 1, before index 2, in "abc"');
		t.equal(ES.SplitMatch('abc', 2, 'b'), false, '"a" is not found at index 2 in "abc"');

		t.equal(ES.SplitMatch('abc', 0, 'c'), false, '"a" is not found at index 0 in "abc"');
		t.equal(ES.SplitMatch('abc', 1, 'c'), false, '"a" is not found at index 1 in "abc"');
		t.equal(ES.SplitMatch('abc', 2, 'c'), 3, '"c" is found at index 2, before index 3, in "abc"');

		t.equal(ES.SplitMatch('a', 0, 'ab'), false, 'R longer than S yields false');

		var s = 'a' + wholePoo + 'c';
		t.equal(ES.SplitMatch(s, 1, wholePoo), 3, debug(wholePoo) + ' is found at index 1, before index 3, in ' + debug(s));

		t.end();
	});

	test('StringCreate', function (t) {
		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { ES.StringCreate(nonString, String.prototype); },
				TypeError,
				debug(nonString) + ' is not a String'
			);
		});

		t.deepEqual(ES.StringCreate('foo', String.prototype), Object('foo'), '"foo" with `String.prototype` makes `Object("foo")');

		var proto = {};
		if ($setProto) {
			t.equal($getProto(ES.StringCreate('', proto)), proto, '[[Prototype]] is set as expected');
		} else {
			t['throws'](
				function () { ES.StringCreate('', proto); },
				SyntaxError,
				'setting [[Prototype]] is not supported in this env'
			);
		}

		t.equal(ES.StringCreate('a', String.prototype).length, 'a'.length, 'length is preserved');

		t.end();
	});

	test('StringGetIndexProperty', function (t) {
		forEach(v.nonStrings.concat(v.strings), function (nonStringObjects) {
			t['throws'](
				function () { ES.StringGetIndexProperty(nonStringObjects); },
				TypeError,
				debug(nonStringObjects) + ' is not a boxed String Object'
			);
		});

		forEach(v.nonPropertyKeys, function (nonPropertyKey) {
			t['throws'](
				function () { ES.StringGetIndexProperty('', nonPropertyKey); },
				TypeError,
				debug(nonPropertyKey) + ' is not a Property Key'
			);
		});

		forEach(v.symbols, function (symbol) {
			t.equal(
				ES.StringGetIndexProperty(Object('a'), symbol),
				undefined,
				debug(symbol) + ' is a Property Key, but not a String'
			);
		});

		// a string where CanonicalNumericIndexString returns undefined, a non-integer, or -0
		forEach(['-1', '-0', 'undefined'].concat(v.nonIntegerNumbers), function (nonIndex) {
			var S = Object('abc');
			t.equal(
				ES.StringGetIndexProperty(S, String(nonIndex)),
				undefined,
				debug(nonIndex) + ' is not an index inside ' + debug(S)
			);
		});

		forEach(v.strings, function (str) {
			var S = Object(str);
			for (var i = 0; i < str.length; i += 1) {
				var desc = {
					'[[Configurable]]': false,
					'[[Enumerable]]': true,
					'[[Value]]': str.charAt(i),
					'[[Writable]]': false
				};
				t.deepEqual(
					ES.StringGetIndexProperty(S, String(i)),
					desc,
					'boxed String ' + debug(S) + ' at index ' + debug(i) + ' is ' + debug(desc)
				);
			}
			t.equal(
				ES.StringGetIndexProperty(S, String(str.length)),
				undefined,
				'boxed String ' + debug(S) + ' at OOB index ' + debug(str.length) + ' is `undefined'
			);
		});

		t.end();
	});

	test('SymbolDescriptiveString', function (t) {
		forEach(v.nonSymbolPrimitives.concat(v.objects), function (nonSymbol) {
			t['throws'](
				function () { ES.SymbolDescriptiveString(nonSymbol); },
				TypeError,
				debug(nonSymbol) + ' is not a Symbol'
			);
		});

		t.test('Symbols', { skip: !v.hasSymbols }, function (st) {
			st.equal(ES.SymbolDescriptiveString(Symbol()), 'Symbol()', 'undefined description');
			st.equal(ES.SymbolDescriptiveString(Symbol('')), 'Symbol()', 'empty string description');
			st.equal(ES.SymbolDescriptiveString(Symbol.iterator), 'Symbol(Symbol.iterator)', 'well-known symbol');
			st.equal(ES.SymbolDescriptiveString(Symbol('foo')), 'Symbol(foo)', 'string description');

			st.end();
		});

		t.end();
	});

	test('TestIntegrityLevel', function (t) {
		forEach(v.primitives, function (primitive) {
			t['throws'](
				function () { ES.TestIntegrityLevel(primitive); },
				TypeError,
				debug(primitive) + ' is not an Object'
			);
		});

		t['throws'](
			function () { ES.TestIntegrityLevel({ a: 1 }); },
			/^TypeError: Assertion failed: `level` must be `"sealed"` or `"frozen"`$/,
			'`level` must be `"sealed"` or `"frozen"`'
		);

		t.equal(ES.TestIntegrityLevel({ a: 1 }, 'sealed'), false, 'basic object is not sealed');
		t.equal(ES.TestIntegrityLevel({ a: 1 }, 'frozen'), false, 'basic object is not frozen');

		t.test('preventExtensions', { skip: !Object.preventExtensions }, function (st) {
			var o = Object.preventExtensions({ a: 1 });
			st.equal(ES.TestIntegrityLevel(o, 'sealed'), false, 'nonextensible object is not sealed');
			st.equal(ES.TestIntegrityLevel(o, 'frozen'), false, 'nonextensible object is not frozen');

			var empty = Object.preventExtensions({});
			st.equal(ES.TestIntegrityLevel(empty, 'sealed'), true, 'empty nonextensible object is sealed');
			st.equal(ES.TestIntegrityLevel(empty, 'frozen'), true, 'empty nonextensible object is frozen');
			st.end();
		});

		t.test('seal', { skip: !Object.seal }, function (st) {
			var o = Object.seal({ a: 1 });
			st.equal(ES.TestIntegrityLevel(o, 'sealed'), true, 'sealed object is sealed');
			st.equal(ES.TestIntegrityLevel(o, 'frozen'), false, 'sealed object is not frozen');

			var empty = Object.seal({});
			st.equal(ES.TestIntegrityLevel(empty, 'sealed'), true, 'empty sealed object is sealed');
			st.equal(ES.TestIntegrityLevel(empty, 'frozen'), true, 'empty sealed object is frozen');

			st.end();
		});

		t.test('freeze', { skip: !Object.freeze }, function (st) {
			var o = Object.freeze({ a: 1 });
			st.equal(ES.TestIntegrityLevel(o, 'sealed'), true, 'frozen object is sealed');
			st.equal(ES.TestIntegrityLevel(o, 'frozen'), true, 'frozen object is frozen');

			var empty = Object.freeze({});
			st.equal(ES.TestIntegrityLevel(empty, 'sealed'), true, 'empty frozen object is sealed');
			st.equal(ES.TestIntegrityLevel(empty, 'frozen'), true, 'empty frozen object is frozen');

			st.end();
		});

		t.end();
	});

	test('thisNumberValue', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.thisNumberValue(nonNumber); },
				TypeError,
				debug(nonNumber) + ' is not a Number'
			);
		});

		forEach(v.numbers, function (number) {
			t.equal(ES.thisNumberValue(number), number, debug(number) + ' is its own thisNumberValue');
			var obj = Object(number);
			t.equal(ES.thisNumberValue(obj), number, debug(obj) + ' is the boxed thisNumberValue');
		});

		t.end();
	});

	test('thisBooleanValue', function (t) {
		forEach(v.nonBooleans, function (nonBoolean) {
			t['throws'](
				function () { ES.thisBooleanValue(nonBoolean); },
				TypeError,
				debug(nonBoolean) + ' is not a Boolean'
			);
		});

		forEach(v.booleans, function (boolean) {
			t.equal(ES.thisBooleanValue(boolean), boolean, debug(boolean) + ' is its own thisBooleanValue');
			var obj = Object(boolean);
			t.equal(ES.thisBooleanValue(obj), boolean, debug(obj) + ' is the boxed thisBooleanValue');
		});

		t.end();
	});

	test('thisStringValue', function (t) {
		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { ES.thisStringValue(nonString); },
				TypeError,
				debug(nonString) + ' is not a String'
			);
		});

		forEach(v.strings, function (string) {
			t.equal(ES.thisStringValue(string), string, debug(string) + ' is its own thisStringValue');
			var obj = Object(string);
			t.equal(ES.thisStringValue(obj), string, debug(obj) + ' is the boxed thisStringValue');
		});

		t.end();
	});

	test('thisTimeValue', function (t) {
		forEach(v.primitives.concat(v.objects), function (nonDate) {
			t['throws'](
				function () { ES.thisTimeValue(nonDate); },
				TypeError,
				debug(nonDate) + ' is not a Date'
			);
		});

		forEach(v.timestamps, function (timestamp) {
			var date = new Date(timestamp);

			t.equal(ES.thisTimeValue(date), timestamp, debug(date) + ' is its own thisTimeValue');
		});

		t.end();
	});

	test('ToDateString', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.ToDateString(nonNumber); },
				TypeError,
				debug(nonNumber) + ' is not a Number'
			);
		});

		t.equal(ES.ToDateString(NaN), 'Invalid Date', 'NaN becomes "Invalid Date"');
		var now = +new Date();
		t.equal(ES.ToDateString(now), String(new Date(now)), 'any timestamp becomes `Date(timestamp)`');
		t.equal(ES.ToDateString(1e10), String(new Date(1e10)), 'any timestamp becomes `Date(timestamp)`');
		t.end();
	});

	test('ToInt16', function (t) {
		t.equal(0, ES.ToInt16(NaN), 'NaN coerces to +0');
		forEach([0, Infinity], function (num) {
			t.equal(0, ES.ToInt16(num), num + ' returns +0');
			t.equal(0, ES.ToInt16(-num), '-' + num + ' returns +0');
		});
		t['throws'](function () { return ES.ToInt16(v.uncoercibleObject); }, TypeError, 'uncoercibleObject throws');
		t.equal(ES.ToInt16(0x100000000), 0, '2^32 returns +0');
		t.equal(ES.ToInt16(0x100000000 - 1), -1, '2^32 - 1 returns -1');
		t.equal(ES.ToInt16(0x80000000), 0, '2^31 returns +0');
		t.equal(ES.ToInt16(0x80000000 - 1), -1, '2^31 - 1 returns -1');
		t.equal(ES.ToInt16(0x10000), 0, '2^16 returns +0');
		t.equal(ES.ToInt16(0x10000 - 1), -1, '2^16 - 1 returns -1');
		t.end();
	});

	test('ToInt8', function (t) {
		t.equal(0, ES.ToInt8(NaN), 'NaN coerces to +0');
		forEach([0, Infinity], function (num) {
			t.equal(0, ES.ToInt8(num), num + ' returns +0');
			t.equal(0, ES.ToInt8(-num), '-' + num + ' returns +0');
		});
		t['throws'](function () { return ES.ToInt8(v.uncoercibleObject); }, TypeError, 'uncoercibleObject throws');
		t.equal(ES.ToInt8(0x100000000), 0, '2^32 returns +0');
		t.equal(ES.ToInt8(0x100000000 - 1), -1, '2^32 - 1 returns -1');
		t.equal(ES.ToInt8(0x80000000), 0, '2^31 returns +0');
		t.equal(ES.ToInt8(0x80000000 - 1), -1, '2^31 - 1 returns -1');
		t.equal(ES.ToInt8(0x10000), 0, '2^16 returns +0');
		t.equal(ES.ToInt8(0x10000 - 1), -1, '2^16 - 1 returns -1');
		t.equal(ES.ToInt8(0x100), 0, '2^8 returns +0');
		t.equal(ES.ToInt8(0x100 - 1), -1, '2^8 - 1 returns -1');
		t.equal(ES.ToInt8(0x10), 0x10, '2^4 returns 2^4');
		t.end();
	});

	test('ToNumber', function (t) {
		testToNumber(t, ES, ES.ToNumber);

		t.end();
	});

	test('ToUint8', function (t) {
		t.equal(0, ES.ToUint8(NaN), 'NaN coerces to +0');
		forEach([0, Infinity], function (num) {
			t.equal(0, ES.ToUint8(num), num + ' returns +0');
			t.equal(0, ES.ToUint8(-num), '-' + num + ' returns +0');
		});
		t['throws'](function () { return ES.ToUint8(v.uncoercibleObject); }, TypeError, 'uncoercibleObject throws');
		t.equal(ES.ToUint8(0x100000000), 0, '2^32 returns +0');
		t.equal(ES.ToUint8(0x100000000 - 1), 0x100 - 1, '2^32 - 1 returns 2^8 - 1');
		t.equal(ES.ToUint8(0x80000000), 0, '2^31 returns +0');
		t.equal(ES.ToUint8(0x80000000 - 1), 0x100 - 1, '2^31 - 1 returns 2^8 - 1');
		t.equal(ES.ToUint8(0x10000), 0, '2^16 returns +0');
		t.equal(ES.ToUint8(0x10000 - 1), 0x100 - 1, '2^16 - 1 returns 2^8 - 1');
		t.equal(ES.ToUint8(0x100), 0, '2^8 returns +0');
		t.equal(ES.ToUint8(0x100 - 1), 0x100 - 1, '2^8 - 1 returns 2^16 - 1');
		t.equal(ES.ToUint8(0x10), 0x10, '2^4 returns 2^4');
		t.equal(ES.ToUint8(0x10 - 1), 0x10 - 1, '2^4 - 1 returns 2^4 - 1');
		t.end();
	});

	test('ToUint8Clamp', function (t) {
		t.equal(0, ES.ToUint8Clamp(NaN), 'NaN coerces to +0');
		t.equal(0, ES.ToUint8Clamp(0), '+0 returns +0');
		t.equal(0, ES.ToUint8Clamp(-0), '-0 returns +0');
		t.equal(0, ES.ToUint8Clamp(-Infinity), '-Infinity returns +0');
		t['throws'](function () { return ES.ToUint8Clamp(v.uncoercibleObject); }, TypeError, 'uncoercibleObject throws');
		forEach([255, 256, 0x100000, Infinity], function (number) {
			t.equal(255, ES.ToUint8Clamp(number), number + ' coerces to 255');
		});
		t.equal(1, ES.ToUint8Clamp(1.49), '1.49 coerces to 1');
		t.equal(2, ES.ToUint8Clamp(1.5), '1.5 coerces to 2, because 2 is even');
		t.equal(2, ES.ToUint8Clamp(1.51), '1.51 coerces to 2');

		t.equal(2, ES.ToUint8Clamp(2.49), '2.49 coerces to 2');
		t.equal(2, ES.ToUint8Clamp(2.5), '2.5 coerces to 2, because 2 is even');
		t.equal(3, ES.ToUint8Clamp(2.51), '2.51 coerces to 3');

		t.equal(ES.ToUint8Clamp(0.75), 1, '0.75 coerces to 1');

		t.end();
	});

	test('ToLength', function (t) {
		t['throws'](function () { return ES.ToLength(v.uncoercibleObject); }, TypeError, 'uncoercibleObject throws a TypeError');
		t.equal(3, ES.ToLength(v.coercibleObject), 'coercibleObject coerces to 3');
		t.equal(42, ES.ToLength('42.5'), '"42.5" coerces to 42');
		t.equal(7, ES.ToLength(7.3), '7.3 coerces to 7');
		forEach([-0, -1, -42, -Infinity], function (negative) {
			t.equal(0, ES.ToLength(negative), negative + ' coerces to +0');
		});
		t.equal(MAX_SAFE_INTEGER, ES.ToLength(MAX_SAFE_INTEGER + 1), '2^53 coerces to 2^53 - 1');
		t.equal(MAX_SAFE_INTEGER, ES.ToLength(MAX_SAFE_INTEGER + 3), '2^53 + 2 coerces to 2^53 - 1');
		t.end();
	});

	test('ToPropertyKey', function (t) {
		forEach(v.objects.concat(v.nonSymbolPrimitives), function (value) {
			t.equal(ES.ToPropertyKey(value), String(value), 'ToPropertyKey(value) === String(value) for non-Symbols');
		});

		forEach(v.symbols, function (symbol) {
			t.equal(
				ES.ToPropertyKey(symbol),
				symbol,
				'ToPropertyKey(' + debug(symbol) + ') === ' + debug(symbol)
			);
			t.equal(
				ES.ToPropertyKey(Object(symbol)),
				symbol,
				'ToPropertyKey(' + debug(Object(symbol)) + ') === ' + debug(symbol)
			);
		});

		t.end();
	});

	test('ToString', function (t) {
		forEach(v.objects.concat(v.nonSymbolPrimitives), function (item) {
			t.equal(ES.ToString(item), String(item), 'ES.ToString(' + debug(item) + ') ToStrings to String(' + debug(item) + ')');
		});

		t['throws'](function () { return ES.ToString(v.uncoercibleObject); }, TypeError, 'uncoercibleObject throws');

		forEach(v.symbols, function (symbol) {
			t['throws'](function () { return ES.ToString(symbol); }, TypeError, debug(symbol) + ' throws');
		});
		t.end();
	});

	test('Type', function (t) {
		t.equal(ES.Type(), 'Undefined', 'Type() is Undefined');
		t.equal(ES.Type(undefined), 'Undefined', 'Type(undefined) is Undefined');
		t.equal(ES.Type(null), 'Null', 'Type(null) is Null');
		t.equal(ES.Type(true), 'Boolean', 'Type(true) is Boolean');
		t.equal(ES.Type(false), 'Boolean', 'Type(false) is Boolean');
		t.equal(ES.Type(0), 'Number', 'Type(0) is Number');
		t.equal(ES.Type(NaN), 'Number', 'Type(NaN) is Number');
		t.equal(ES.Type('abc'), 'String', 'Type("abc") is String');
		t.equal(ES.Type(function () {}), 'Object', 'Type(function () {}) is Object');
		t.equal(ES.Type({}), 'Object', 'Type({}) is Object');

		t.test('symbols', { skip: !v.hasSymbols }, function (st) {
			st.equal(ES.Type(Symbol.iterator), 'Symbol', 'Type(Symbol.iterator) is Symbol');
			st.end();
		});

		t.end();
	});

	test('ValidateAndApplyPropertyDescriptor', function (t) {
		forEach(v.nonUndefinedPrimitives, function (nonUndefinedPrimitive) {
			t['throws'](
				function () { ES.ValidateAndApplyPropertyDescriptor(nonUndefinedPrimitive, '', false, v.genericDescriptor(), v.genericDescriptor()); },
				TypeError,
				'O: ' + debug(nonUndefinedPrimitive) + ' is not undefined or an Object'
			);
		});

		forEach(v.nonBooleans, function (nonBoolean) {
			t['throws'](
				function () {
					return ES.ValidateAndApplyPropertyDescriptor(
						undefined,
						'',
						nonBoolean,
						v.genericDescriptor(),
						v.genericDescriptor()
					);
				},
				TypeError,
				'extensible: ' + debug(nonBoolean) + ' is not a Boolean'
			);
		});

		forEach(v.primitives, function (primitive) {
			// Desc must be a Property Descriptor
			t['throws'](
				function () {
					return ES.ValidateAndApplyPropertyDescriptor(
						undefined,
						'',
						false,
						primitive,
						v.genericDescriptor()
					);
				},
				TypeError,
				'Desc: ' + debug(primitive) + ' is not a Property Descriptor'
			);
		});

		forEach(v.nonUndefinedPrimitives, function (primitive) {
			// current must be undefined or a Property Descriptor
			t['throws'](
				function () {
					return ES.ValidateAndApplyPropertyDescriptor(
						undefined,
						'',
						false,
						v.genericDescriptor(),
						primitive
					);
				},
				TypeError,
				'current: ' + debug(primitive) + ' is not a Property Descriptor or undefined'
			);
		});

		forEach(v.nonPropertyKeys, function (nonPropertyKey) {
			// if O is an object, P must be a property key
			t['throws'](
				function () {
					return ES.ValidateAndApplyPropertyDescriptor(
						{},
						nonPropertyKey,
						false,
						v.genericDescriptor(),
						v.genericDescriptor()
					);
				},
				TypeError,
				'P: ' + debug(nonPropertyKey) + ' is not a Property Key'
			);
		});

		t.test('current is undefined', function (st) {
			var propertyKey = 'howdy';

			st.test('generic descriptor', { skip: !$defineProperty }, function (s2t) {
				var generic = v.genericDescriptor();
				generic['[[Enumerable]]'] = true;
				var O = {};
				ES.ValidateAndApplyPropertyDescriptor(undefined, propertyKey, true, generic);
				s2t.equal(
					ES.ValidateAndApplyPropertyDescriptor(O, propertyKey, false, generic),
					false,
					'when extensible is false, nothing happens'
				);
				s2t.deepEqual(O, {}, 'no changes applied when O is undefined or extensible is false');
				s2t.equal(
					ES.ValidateAndApplyPropertyDescriptor(O, propertyKey, true, generic),
					true,
					'operation is successful'
				);
				var expected = {};
				expected[propertyKey] = generic['[[Value]]'];
				s2t.deepEqual(O, expected, 'generic descriptor has been defined as an own data property');
				s2t.end();
			});

			st.test('data descriptor', function (s2t) {
				var data = v.descriptors.enumerable(v.dataDescriptor());
				if (!$defineProperty) {
					// IE 8 can't handle defining a new property with an incomplete descriptor
					data = v.descriptors.configurable(v.descriptors.writable(data));
				}

				var O = {};
				s2t.equal(
					ES.ValidateAndApplyPropertyDescriptor(undefined, propertyKey, true, data),
					true,
					'noop when O is undefined'
				);
				s2t.equal(
					ES.ValidateAndApplyPropertyDescriptor(O, propertyKey, false, data),
					false,
					'when extensible is false, nothing happens'
				);
				s2t.deepEqual(O, {}, 'no changes applied when O is undefined or extensible is false');
				s2t.equal(
					ES.ValidateAndApplyPropertyDescriptor(O, propertyKey, true, data),
					true,
					'operation is successful'
				);
				var expected = {};
				expected[propertyKey] = data['[[Value]]'];
				s2t.deepEqual(O, expected, 'data descriptor has been defined as an own data property');
				s2t.end();
			});

			st.test('accessor descriptor', { skip: !$defineProperty }, function (s2t) {
				var count = 0;
				var accessor = v.accessorDescriptor();
				accessor['[[Enumerable]]'] = true;
				accessor['[[Get]]'] = function () {
					count += 1;
					return count;
				};

				var O = {};
				ES.ValidateAndApplyPropertyDescriptor(undefined, propertyKey, true, accessor);
				s2t.equal(
					ES.ValidateAndApplyPropertyDescriptor(O, propertyKey, false, accessor),
					false,
					'when extensible is false, nothing happens'
				);
				s2t.deepEqual(O, {}, 'no changes applied when O is undefined or extensible is false');
				s2t.equal(
					ES.ValidateAndApplyPropertyDescriptor(O, propertyKey, true, accessor),
					true,
					'operation is successful'
				);
				var expected = {};
				expected[propertyKey] = accessor['[[Get]]']() + 1;
				s2t.deepEqual(O, expected, 'accessor descriptor has been defined as an own accessor property');
				s2t.end();
			});

			st.end();
		});

		t.test('every field in Desc is absent', { skip: 'it is unclear if having no fields qualifies Desc to be a Property Descriptor' });

		forEach([v.dataDescriptor, v.accessorDescriptor, v.mutatorDescriptor], function (getDescriptor) {
			t.equal(
				ES.ValidateAndApplyPropertyDescriptor(
					undefined,
					'property key',
					true,
					getDescriptor(),
					ES.CompletePropertyDescriptor(getDescriptor())
				),
				true,
				'when Desc and current are the same, early return true'
			);
		});

		t.test('current is nonconfigurable', function (st) {
			// note: these must not be generic descriptors, or else the algorithm returns an early true
			st.equal(
				ES.ValidateAndApplyPropertyDescriptor(
					undefined,
					'property key',
					true,
					v.descriptors.configurable(v.dataDescriptor()),
					ES.CompletePropertyDescriptor(v.descriptors.nonConfigurable(v.dataDescriptor()))
				),
				false,
				'false if Desc is configurable'
			);

			st.equal(
				ES.ValidateAndApplyPropertyDescriptor(
					undefined,
					'property key',
					true,
					{},
					ES.CompletePropertyDescriptor(v.descriptors.nonConfigurable(v.dataDescriptor()))
				),
				true,
				'true if Desc is generic, and lacks both [[Configurable]] and [[Enumerable]]'
			);

			st.equal(
				ES.ValidateAndApplyPropertyDescriptor(
					undefined,
					'property key',
					true,
					v.descriptors.enumerable(v.dataDescriptor()),
					ES.CompletePropertyDescriptor(v.descriptors.nonEnumerable(v.dataDescriptor()))
				),
				false,
				'false if Desc is Enumerable and current is not'
			);

			st.equal(
				ES.ValidateAndApplyPropertyDescriptor(
					undefined,
					'property key',
					true,
					v.descriptors.nonEnumerable(v.dataDescriptor()),
					ES.CompletePropertyDescriptor(v.descriptors.enumerable(v.dataDescriptor()))
				),
				false,
				'false if Desc is not Enumerable and current is'
			);

			st.equal(
				ES.ValidateAndApplyPropertyDescriptor(
					undefined,
					'property key',
					true,
					v.accessorDescriptor(),
					ES.CompletePropertyDescriptor(v.dataDescriptor())
				),
				false,
				'false if Desc is an accessor descriptor and current is a data descriptor'
			);
			st.equal(
				ES.ValidateAndApplyPropertyDescriptor(
					undefined,
					'property key',
					true,
					v.descriptors.nonConfigurable(v.dataDescriptor()),
					ES.CompletePropertyDescriptor(v.descriptors.nonConfigurable(v.accessorDescriptor()))
				),
				false,
				'false if Desc is a data descriptor and current is an accessor descriptor'
			);

			st.equal(
				ES.ValidateAndApplyPropertyDescriptor(
					undefined,
					'property key',
					true,
					v.descriptors.nonConfigurable(v.accessorDescriptor()),
					v.descriptors.nonConfigurable(v.accessorDescriptor())
				),
				false,
				'false if Desc and current are both accessors with a !== Get function'
			);
			var fakeGetter = function () {};
			st.equal(
				ES.ValidateAndApplyPropertyDescriptor(
					undefined,
					'property key',
					true,
					ES.CompletePropertyDescriptor(v.descriptors.nonConfigurable({ '[[Get]]': fakeGetter, '[[Set]]': function () {} })),
					ES.CompletePropertyDescriptor(v.descriptors.nonConfigurable({ '[[Get]]': fakeGetter, '[[Set]]': function () {} }))
				),
				false,
				'false if Desc and current are both accessors with a !== Get function'
			);

			var descLackingEnumerable = v.accessorDescriptor();
			delete descLackingEnumerable['[[Enumerable]]'];
			st.equal(
				ES.ValidateAndApplyPropertyDescriptor(
					undefined,
					'property key',
					true,
					descLackingEnumerable,
					ES.CompletePropertyDescriptor(v.descriptors.enumerable(v.accessorDescriptor()))
				),
				true,
				'not false if Desc lacks Enumerable'
			);

			st.equal(
				ES.ValidateAndApplyPropertyDescriptor(
					{},
					'property key',
					true,
					v.descriptors.nonConfigurable(),
					v.descriptors.nonConfigurable(v.descriptors.enumerable(v.accessorDescriptor()))
				),
				true,
				'see https://github.com/tc39/ecma262/issues/2761'
			);

			st.end();
		});

		t.test('Desc and current: one is a data descriptor, one is not', { skip: !defineProperty || !getOwnPropertyDescriptor }, function (st) {
			// note: Desc must be configurable if current is nonconfigurable, to hit this branch
			st.equal(
				ES.ValidateAndApplyPropertyDescriptor(
					undefined,
					'property key',
					true,
					v.descriptors.configurable(v.accessorDescriptor()),
					ES.CompletePropertyDescriptor(v.descriptors.nonConfigurable(v.dataDescriptor()))
				),
				false,
				'false if current (data) is nonconfigurable'
			);

			st.equal(
				ES.ValidateAndApplyPropertyDescriptor(
					undefined,
					'property key',
					true,
					v.descriptors.configurable(v.dataDescriptor()),
					ES.CompletePropertyDescriptor(v.descriptors.nonConfigurable(v.accessorDescriptor()))
				),
				false,
				'false if current (not data) is nonconfigurable'
			);

			// one is data and one is not,
			//	// if current is data, convert to accessor
			//	// else convert to data

			var startsWithData = {
				'property key': 42
			};
			st.equal(
				ES.ValidateAndApplyPropertyDescriptor(
					startsWithData,
					'property key',
					true,
					v.descriptors.enumerable(v.descriptors.configurable(v.accessorDescriptor())),
					ES.CompletePropertyDescriptor(v.descriptors.enumerable(v.descriptors.configurable(v.dataDescriptor())))
				),
				true,
				'operation is successful: current is data, Desc is accessor'
			);
			var shouldBeAccessor = getOwnPropertyDescriptor(startsWithData, 'property key');
			st.equal(typeof shouldBeAccessor.get, 'function', 'has a getter');

			var key = 'property key';
			var startsWithAccessor = {};
			defineProperty(startsWithAccessor, key, {
				configurable: true,
				enumerable: true,
				get: function get() { return 42; }
			});
			st.equal(
				ES.ValidateAndApplyPropertyDescriptor(
					startsWithAccessor,
					key,
					true,
					v.descriptors.enumerable(v.descriptors.configurable(v.dataDescriptor())),
					v.descriptors.enumerable(v.descriptors.configurable(v.accessorDescriptor(42)))
				),
				true,
				'operation is successful: current is accessor, Desc is data'
			);
			var shouldBeData = getOwnPropertyDescriptor(startsWithAccessor, 'property key');
			st.deepEqual(shouldBeData, { configurable: true, enumerable: true, value: 42, writable: false }, 'is a data property');

			st.end();
		});

		t.test('Desc and current are both data descriptors', function (st) {
			st.equal(
				ES.ValidateAndApplyPropertyDescriptor(
					undefined,
					'property key',
					true,
					v.descriptors.writable(v.dataDescriptor()),
					ES.CompletePropertyDescriptor(v.descriptors.nonWritable(v.descriptors.nonConfigurable(v.dataDescriptor())))
				),
				false,
				'false if frozen current and writable Desc'
			);

			st.equal(
				ES.ValidateAndApplyPropertyDescriptor(
					undefined,
					'property key',
					true,
					v.descriptors.configurable({ '[[Value]]': 42 }),
					ES.CompletePropertyDescriptor(v.descriptors.nonWritable({ '[[Value]]': 7 }))
				),
				false,
				'false if nonwritable current has a different value than Desc'
			);

			st.end();
		});

		t.test('current is nonconfigurable; Desc and current are both accessor descriptors', function (st) {
			st.equal(
				ES.ValidateAndApplyPropertyDescriptor(
					undefined,
					'property key',
					true,
					v.mutatorDescriptor(),
					ES.CompletePropertyDescriptor(v.descriptors.nonConfigurable(v.mutatorDescriptor()))
				),
				false,
				'false if both Sets are not equal'
			);

			st.equal(
				ES.ValidateAndApplyPropertyDescriptor(
					undefined,
					'property key',
					true,
					v.accessorDescriptor(),
					ES.CompletePropertyDescriptor(v.descriptors.nonConfigurable(v.accessorDescriptor()))
				),
				false,
				'false if both Gets are not equal'
			);

			st.end();
		});

		t.end();
	});

	test('ValidateTypedArray', function (t) {
		forEach(v.primitives.concat(v.objects, [[]]), function (nonTA) {
			t['throws'](
				function () { ES.ValidateTypedArray(nonTA); },
				TypeError,
				debug(nonTA) + ' is not a TypedArray'
			);
		});

		t.test('actual typed arrays', { skip: availableTypedArrays.length === 0 }, function (st) {
			forEach(availableTypedArrays, function (TypedArray) {
				var ta = new global[TypedArray](0);
				st.doesNotThrow(
					function () { ES.ValidateTypedArray(ta); },
					debug(ta) + ' is a TypedArray'
				);

				st.test('can detach', { skip: !canDetach }, function (s2t) {
					ES.DetachArrayBuffer(ta.buffer);

					s2t['throws'](
						function () { ES.ValidateTypedArray(ta); },
						TypeError,
						debug(ta) + ' is a detached TypedArray'
					);

					s2t.end();
				});
			});

			st.end();
		});

		t.end();
	});
};

var es2016 = function ES2016(ES, ops, expectedMissing, skips) {
	es2015(ES, ops, expectedMissing, assign(assign({}, skips), {
		NormalCompletion: true,
		StringGetIndexProperty: true
	}));
	var test = makeTest(ES, skips);

	test('IterableToArrayLike', function (t) {
		t.test('custom iterables', { skip: !v.hasSymbols }, function (st) {
			var O = {};
			O[Symbol.iterator] = function () {
				var i = -1;
				return {
					next: function () {
						i += 1;
						return {
							done: i >= 5,
							value: i
						};
					}
				};
			};
			st.deepEqual(
				ES.IterableToArrayLike(O),
				[0, 1, 2, 3, 4],
				'Symbol.iterator method is called and values collected'
			);

			st.end();
		});

		t.deepEqual(ES.IterableToArrayLike('abc'), ['a', 'b', 'c'], 'a string of code units spreads');
		t.deepEqual(ES.IterableToArrayLike('💩'), ['💩'], 'a string of code points spreads');
		t.deepEqual(ES.IterableToArrayLike('a💩c'), ['a', '💩', 'c'], 'a string of code points and units spreads');

		var arr = [1, 2, 3];
		t.deepEqual(ES.IterableToArrayLike(arr), arr, 'an array becomes a similar array');
		t.notEqual(ES.IterableToArrayLike(arr), arr, 'an array becomes a different, but similar, array');

		var O = {};
		t.equal(ES.IterableToArrayLike(O), O, 'a non-iterable non-array non-string object is returned directly');

		t.end();
	});

	test('NormalCompletion', function (t) {
		var sentinel = {};
		var completion = ES.NormalCompletion(sentinel);

		t.ok(completion instanceof ES.CompletionRecord, 'produces an instance of CompletionRecord');

		t.equal(SLOT.get(completion, '[[Type]]'), 'normal', 'completion type is "normal"');
		t.equal(completion.type(), 'normal', 'completion type is "normal" (via method)');
		t.equal(SLOT.get(completion, '[[Value]]'), sentinel, 'completion value is the argument provided');
		t.equal(completion.value(), sentinel, 'completion value is the argument provided (via method)');

		t.end();
	});

	test('OrdinaryGetPrototypeOf', function (t) {
		t.test('values', { skip: !$getProto }, function (st) {
			st.equal(ES.OrdinaryGetPrototypeOf([]), Array.prototype, 'array [[Prototype]] is Array.prototype');
			st.equal(ES.OrdinaryGetPrototypeOf({}), Object.prototype, 'object [[Prototype]] is Object.prototype');
			st.equal(ES.OrdinaryGetPrototypeOf(/a/g), RegExp.prototype, 'regex [[Prototype]] is RegExp.prototype');
			st.equal(ES.OrdinaryGetPrototypeOf(Object('')), String.prototype, 'boxed string [[Prototype]] is String.prototype');
			st.equal(ES.OrdinaryGetPrototypeOf(Object(42)), Number.prototype, 'boxed number [[Prototype]] is Number.prototype');
			st.equal(ES.OrdinaryGetPrototypeOf(Object(true)), Boolean.prototype, 'boxed boolean [[Prototype]] is Boolean.prototype');
			if (v.hasSymbols) {
				st.equal(ES.OrdinaryGetPrototypeOf(Object(Symbol.iterator)), Symbol.prototype, 'boxed symbol [[Prototype]] is Symbol.prototype');
			}
			st.end();
		});

		forEach(v.primitives, function (primitive) {
			t['throws'](
				function () { ES.OrdinaryGetPrototypeOf(primitive); },
				TypeError,
				debug(primitive) + ' is not an Object'
			);
		});
		t.end();
	});

	test('OrdinarySetPrototypeOf', { skip: !$getProto || !$setProto }, function (t) {
		forEach(v.primitives, function (primitive) {
			if (primitive !== null) {
				t['throws'](
					function () { ES.OrdinarySetPrototypeOf({}, primitive); },
					TypeError,
					debug(primitive) + ' is not an Object or null'
				);
			}
		});

		var a = [];
		var proto = {};

		t.equal(ES.OrdinaryGetPrototypeOf(a), Array.prototype, 'precondition');
		t.equal(ES.OrdinarySetPrototypeOf(a, proto), true, 'setting prototype is successful');
		t.equal(ES.OrdinaryGetPrototypeOf(a), proto, 'postcondition');

		t.end();
	});

	test('SameValueNonNumber', function (t) {
		var willThrow = [
			[3, 4],
			[NaN, 4],
			[4, ''],
			['abc', true],
			[{}, false]
		];
		forEach(willThrow, function (nums) {
			t['throws'](function () { return ES.SameValueNonNumber.apply(ES, nums); }, TypeError, 'value must be same type and non-number');
		});

		forEach(v.objects.concat(v.nonNumberPrimitives), function (val) {
			t.equal(val === val, ES.SameValueNonNumber(val, val), debug(val) + ' is SameValueNonNumber to itself');
		});

		t.end();
	});

	test('TypedArrayCreate', function (t) {
		forEach(v.nonFunctions, function (nonFunction) {
			t['throws'](
				function () { ES.TypedArrayCreate(nonFunction, []); },
				TypeError,
				debug(nonFunction) + ' is not a constructor'
			);
		});

		forEach(v.nonArrays, function (nonArray) {
			t['throws'](
				function () { ES.TypedArrayCreate(Array, nonArray); },
				TypeError,
				debug(nonArray) + ' is not an Array'
			);
		});

		t.test('no Typed Array support', { skip: availableTypedArrays.length > 0 }, function (st) {
			st['throws'](
				function () { ES.TypedArrayCreate(Array, []); },
				SyntaxError,
				'no Typed Array support'
			);

			st.end();
		});

		t.test('Typed Array support', { skip: availableTypedArrays.length === 0 }, function (st) {
			var expectedLengths = {
				__proto__: null,
				$Int8Array: 632,
				$Uint8Array: 632,
				$Uint8ClampedArray: 632,
				$Int16Array: 316,
				$Uint16Array: 316,
				$Int32Array: 158,
				$Uint32Array: 158,
				$Float32Array: 158,
				$BigInt64Array: 79,
				$BigUint64Array: 79,
				$Float64Array: 79
			};
			forEach(availableTypedArrays, function (TypedArray) {
				var Constructor = global[TypedArray];

				var typedArray = ES.TypedArrayCreate(Constructor, []);
				st.equal(whichTypedArray(typedArray), TypedArray, 'created a ' + TypedArray);
				st.equal(typedArray.byteOffset, 0, 'byteOffset is 0');
				st.equal(typedArrayLength(typedArray), 0, 'created a ' + TypedArray + ' of length 42');

				var taLength = ES.TypedArrayCreate(Constructor, [42]);
				st.equal(whichTypedArray(taLength), TypedArray, 'created a ' + TypedArray);
				st.equal(taLength.byteOffset, 0, 'byteOffset is 0');
				st.equal(typedArrayLength(taLength), 42, 'created a ' + TypedArray + ' of length 42');

				var buffer = new ArrayBuffer(640);

				var taBuffer = ES.TypedArrayCreate(Constructor, [buffer, 8]);
				st.equal(whichTypedArray(taBuffer), TypedArray, 'created a ' + TypedArray);
				st.equal(taBuffer.byteOffset, 8, 'byteOffset is 8');
				st.equal(
					typedArrayLength(taBuffer),
					expectedLengths['$' + TypedArray],
					'created a ' + TypedArray + ' of length ' + expectedLengths['$' + TypedArray]
				);

				var taBufferLength = ES.TypedArrayCreate(Constructor, [buffer, 8, 64]);
				st.equal(whichTypedArray(taBufferLength), TypedArray, 'created a ' + TypedArray);
				st.equal(taBufferLength.byteOffset, 8, 'byteOffset is 8');
				st.equal(typedArrayLength(taBufferLength), 64, 'created a ' + TypedArray + ' of length 64');
			});

			st.end();
		});

		t.end();
	});

	test('TypedArraySpeciesCreate', function (t) {
		t.test('no Typed Array support', { skip: availableTypedArrays.length > 0 }, function (st) {
			forEach(v.primitives.concat(v.objects), function (nonTA) {
				st['throws'](
					function () { ES.TypedArraySpeciesCreate(nonTA, []); },
					SyntaxError,
					'no Typed Array support'
				);
			});

			forEach(v.nonArrays, function (nonArray) {
				st['throws'](
					function () { ES.TypedArraySpeciesCreate(Array, nonArray); },
					SyntaxError,
					'no Typed Array support'
				);
			});
			st.end();
		});

		t.test('Typed Array support', { skip: availableTypedArrays.length === 0 }, function (st) {
			forEach(v.primitives.concat(v.objects), function (nonTA) {
				st['throws'](
					function () { ES.TypedArraySpeciesCreate(nonTA, []); },
					TypeError,
					debug(nonTA) + ' is not a Typed Array'
				);
			});

			var nonArrayTA = new global[availableTypedArrays[0]]();
			forEach(v.primitives.concat(v.nonArrays), function (nonArray) {
				st['throws'](
					function () { ES.TypedArraySpeciesCreate(nonArrayTA, nonArray); },
					TypeError,
					debug(nonArray) + ' is not an Array'
				);
			});

			forEach(availableTypedArrays, function (TypedArray) {
				var Constructor = global[TypedArray];

				var typedArray = ES.TypedArraySpeciesCreate(new Constructor(), []);
				st.equal(whichTypedArray(typedArray), TypedArray, 'created a ' + TypedArray);
				st.equal(typedArrayLength(typedArray), 0, 'created a ' + TypedArray + ' of length 42');

				var taLength = ES.TypedArraySpeciesCreate(new Constructor(7), [42]);
				st.equal(whichTypedArray(taLength), TypedArray, 'created a ' + TypedArray);
				st.equal(typedArrayLength(taLength), 42, 'created a ' + TypedArray + ' of length 42');
			});

			st.test('with Symbol.species', { skip: !hasSpecies }, function (s2t) {
				forEach(availableTypedArrays, function (TypedArray) {
					var Constructor = global[TypedArray];

					var Bar = function Bar() {};
					Bar[Symbol.species] = null;
					var taBar = new Constructor();
					defineProperty(taBar, 'constructor', { value: Bar });

					s2t.equal(
						whichTypedArray(ES.TypedArraySpeciesCreate(taBar, [])),
						TypedArray,
						TypedArray + ': undefined/null Symbol.species creates with the default constructor'
					);

					var Baz = function Baz() {};
					Baz[Symbol.species] = Bar;
					var taBaz = new Constructor();
					defineProperty(taBaz, 'constructor', { value: Baz });
					s2t['throws'](
						function () { ES.TypedArraySpeciesCreate(taBaz, []); },
						TypeError,
						TypedArray + ': non-TA Symbol.species throws'
					);

					Baz[Symbol.species] = {};
					s2t['throws'](
						function () { ES.TypedArraySpeciesCreate(new Baz(), []); },
						TypeError,
						TypedArray + ': throws when non-constructor non-null non-undefined species value found'
					);
				});

				s2t.end();
			});

			st.end();
		});

		t.end();
	});

	test('UTF16Encoding', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.UTF16Encoding(nonNumber); },
				TypeError,
				debug(nonNumber) + ' is not a Number'
			);
		});

		t['throws'](
			function () { ES.UTF16Encoding(-1); },
			TypeError,
			'-1 is < 0'
		);

		t['throws'](
			function () { ES.UTF16Encoding(0x10FFFF + 1); },
			TypeError,
			'0x10FFFF + 1 is > 0x10FFFF'
		);

		t.equal(ES.UTF16Encoding(0xD83D), leadingPoo, '0xD83D is the first half of ' + wholePoo);
		t.equal(ES.UTF16Encoding(0xDCA9), trailingPoo, '0xDCA9 is the last half of ' + wholePoo);
		t.equal(ES.UTF16Encoding(0x1F4A9), wholePoo, '0xDCA9 is the last half of ' + wholePoo);

		t.end();
	});

	test('UTF16Decode', function (t) {
		t['throws'](
			function () { ES.UTF16Decode('a'.charCodeAt(0), trailingPoo.charCodeAt(0)); },
			TypeError,
			'"a" is not a leading surrogate'
		);
		t['throws'](
			function () { ES.UTF16Decode(leadingPoo.charCodeAt(0), 'b'.charCodeAt(0)); },
			TypeError,
			'"b" is not a trailing surrogate'
		);

		t.equal(ES.UTF16Decode(leadingPoo.charCodeAt(0), trailingPoo.charCodeAt(0)), wholePoo);

		t.end();
	});
};

var es2017 = function ES2017(ES, ops, expectedMissing, skips) {
	es2016(ES, ops, expectedMissing, assign({}, skips, {
		GetValueFromBuffer: true,
		EnumerableOwnNames: true,
		IsWordChar: true,
		IterableToArrayLike: true
	}));
	var test = makeTest(ES, skips);

	test('DetachArrayBuffer (Shared Array Buffers)', { skip: typeof SharedArrayBuffer !== 'function' }, function (t) {
		var sabs = [
			new SharedArrayBuffer(),
			new SharedArrayBuffer(0)
		];

		forEach(sabs, function (sab) {
			t['throws'](
				function () { ES.DetachArrayBuffer(sab); },
				TypeError,
				debug(sab) + ' is a SharedArrayBuffer'
			);
		});

		t.end();
	});

	test('IsDetachedBufer (Shared Array Buffers)', { skip: typeof SharedArrayBuffer !== 'function' }, function (t) {
		var sab = new SharedArrayBuffer(1);
		t.equal(ES.IsDetachedBuffer(sab), false, 'a new SharedArrayBuffer is not detached');

		var zsab = new SharedArrayBuffer(0);
		t.equal(ES.IsDetachedBuffer(zsab), false, 'a new zero-length SharedArrayBuffer is not detached');

		t.end();
	});

	test('EnumerableOwnProperties', function (t) {
		t['throws'](
			function () { ES.EnumerableOwnProperties({}, 'not key, value, or key+value'); },
			TypeError,
			'invalid "kind" throws'
		);

		var obj = testEnumerableOwnNames(t, function (O) {
			return ES.EnumerableOwnProperties(O, 'key');
		});

		t.deepEqual(
			ES.EnumerableOwnProperties(obj, 'key'),
			['own'],
			'returns enumerable own keys'
		);

		t.deepEqual(
			ES.EnumerableOwnProperties(obj, 'value'),
			[obj.own],
			'returns enumerable own values'
		);

		t.deepEqual(
			ES.EnumerableOwnProperties(obj, 'key+value'),
			[['own', obj.own]],
			'returns enumerable own entries'
		);

		t.test('getters changing properties of unvisited entries', { skip: !$defineProperty }, function (st) {
			var o = { a: 1, b: 2, c: 3, d: 4 };
			defineProperty(o, 'a', {
				enumerable: true,
				get: function () {
					defineProperty(o, 'b', { enumerable: false });
					return 1;
				}
			});
			defineProperty(o, 'c', { enumerable: false });

			st.deepEqual(
				ES.EnumerableOwnProperties(o, 'key'),
				['a', 'b', 'd'],
				'`key` kind returns all initially enumerable own keys'
			);

			st.deepEqual(
				ES.EnumerableOwnProperties(o, 'key+value'),
				[['a', 1], ['d', 4]],
				'key+value returns only own enumerable entries that remain enumerable at the time they are visited'
			);

			st.end();
		});

		t.end();
	});

	test('IsWordChar', function (t) {
		forEach(v.nonIntegerNumbers, function (nonInteger) {
			t['throws'](
				function () { return ES.IsWordChar(nonInteger, 0, [], false, false); },
				TypeError,
				'arg 1: ' + debug(nonInteger) + ' is not an integer'
			);

			t['throws'](
				function () { return ES.IsWordChar(0, nonInteger, [], false, false); },
				TypeError,
				'arg 2: ' + debug(nonInteger) + ' is not an integer'
			);
		});

		forEach(v.nonArrays, function (nonArray) {
			t['throws'](
				function () { return ES.IsWordChar(0, 0, nonArray, false, false); },
				TypeError,
				'arg 3: ' + debug(nonArray) + ' is not an Array'
			);
		});
		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { return ES.IsWordChar(0, 0, [nonString], false, false); },
				TypeError,
				'arg 3: ' + debug(nonString) + ' is not a character'
			);
		});

		t.equal(ES.IsWordChar(-1, 0, [], false, false), false, 'arg 1: -1 yields false');
		t.equal(ES.IsWordChar(1, 1, [], false, false), false, 'arg 1 and 2 the same yields false');
		t.equal(ES.IsWordChar(1, 1, ['a', '!'], false, false), false, 'arg 1 and 2 the same yields false even with non-word chars');
		t.equal(ES.IsWordChar(1, 1, ['a', 'b'], false, false), false, 'arg 1 and 2 the same yields false even with word chars');

		t.equal(ES.IsWordChar(0, 2, ['a', '!'], false, false), true, 'a is a word char');
		t.equal(ES.IsWordChar(1, 2, ['!', 'b'], false, false), true, 'b is a word char');

		forEach(keys(caseFolding.C), function (input) {
			var isBasic = (/^[a-zA-Z0-9_]$/).test(input);
			var isFancy = (/^[a-zA-Z0-9_]$/).test(caseFolding.C[input]);
			t.equal(
				ES.IsWordChar(0, input.length, [input], false, true),
				isBasic,
				'C mapping, IgnoreCase false: ' + debug(input) + ' is a word char'
			);
			t.equal(
				ES.IsWordChar(0, input.length, [input], true, true),
				isBasic || isFancy,
				'C mapping, IgnoreCase true: ' + debug(input) + ' is a word char'
			);
		});

		forEach(keys(caseFolding.S), function (input) {
			var isBasic = (/^[a-zA-Z0-9_]$/).test(input);
			var isFancy = (/^[a-zA-Z0-9_]$/).test(caseFolding.S[input]);
			t.equal(
				ES.IsWordChar(0, input.length, [input], false, true),
				isBasic,
				'S mapping, IgnoreCase false: ' + debug(input) + ' is a word char'
			);
			t.equal(
				ES.IsWordChar(0, input.length, [input], true, true),
				isBasic || isFancy,
				'S mapping, IgnoreCase true: ' + debug(input) + ' is a word char'
			);
		});

		t.end();
	});

	test('GetValueFromBuffer', function (t) {
		var isTypedArray = true;

		forEach(v.primitives.concat(v.objects), function (nonAB) {
			t['throws'](
				function () { ES.GetValueFromBuffer(nonAB, 0, 'Int8', isTypedArray, 'order'); },
				TypeError,
				debug(nonAB) + ' is not an ArrayBuffer'
			);
		});

		t.test('ArrayBuffers supported', { skip: typeof ArrayBuffer !== 'function' }, function (st) {
			forEach(v.notNonNegativeIntegers, function (nonNonNegativeInteger) {
				st['throws'](
					function () { ES.GetValueFromBuffer(new ArrayBuffer(8), nonNonNegativeInteger, 'Int8', isTypedArray, 'order'); },
					TypeError,
					debug(nonNonNegativeInteger) + ' is not a valid byte index'
				);
			});

			forEach(v.nonStrings.concat('not a valid type'), function (nonString) {
				st['throws'](
					function () { ES.GetValueFromBuffer(new ArrayBuffer(8), 0, nonString, isTypedArray, 'order'); },
					TypeError,
					debug(nonString) + ' is not a valid String (or type) value'
				);
			});

			forEach(v.nonBooleans, function (nonBoolean) {
				st['throws'](
					function () { ES.GetValueFromBuffer(new ArrayBuffer(8), 0, 'Int8', nonBoolean, 'order'); },
					TypeError,
					'isTypedArray: ' + debug(nonBoolean) + ' is not a valid Boolean value'
				);

				st['throws'](
					function () { ES.GetValueFromBuffer(new ArrayBuffer(8), 0, 'Int8', isTypedArray, 'order', nonBoolean); },
					TypeError,
					'isLittleEndian: ' + debug(nonBoolean) + ' is not a valid Boolean value'
				);
			});

			forEach(v.nonStrings, function (nonString) {
				st['throws'](
					function () { ES.GetValueFromBuffer(new ArrayBuffer(8), 0, 'Int8', isTypedArray, nonString); },
					TypeError,
					'order: ' + debug(nonString) + ' is not a valid String (or order) value'
				);
			});

			st.test('can detach', { skip: !canDetach }, function (s2t) {
				var buffer = new ArrayBuffer(8);
				s2t.equal(ES.DetachArrayBuffer(buffer), null, 'detaching returns null');

				s2t['throws'](
					function () { ES.GetValueFromBuffer(buffer, 0, 'Int8', isTypedArray, 'order'); },
					TypeError,
					'detached buffers throw'
				);

				s2t.end();
			});

			forEach(bufferTestCases, function (testCase, name) {
				st.test(name + ': ' + debug(testCase.value), function (s2t) {
					forEach([
						'Int8',
						'Uint8',
						'Uint8C',
						'Int16',
						'Uint16',
						'Int32',
						'Uint32',
						'Float32',
						'Float64'
					], function (type) {
						var view = new DataView(new ArrayBuffer(elementSizes.$Float64Array));
						var method = type === 'Uint8C' ? 'Uint8' : type;
						// var value = unserialize(testCase.value);
						var result = testCase[type === 'Uint8C' ? 'Uint8Clamped' : type];
						var hasBigEndian = type !== 'Int8' && type !== 'Uint8' && type !== 'Uint8C'; // the 8-bit types are special, they don't have big-endian
						/*
						st.equal(
							ES.GetValueFromBuffer(testCase.buffer, 0, type),
							defaultEndianness === testCase.endian ? testCase[type + 'little'] : testCase[type + 'big'],
							'buffer holding ' + debug(value) + ' (' + testCase.endian + ' endian) with type ' + type + ', default endian, yields expected value'
						);
						*/

						clearBuffer(view.buffer);
						var littleVal = unserialize(result.setAsLittle.asLittle);
						view['set' + method](0, type.slice(0, 3) === 'Big' ? safeBigInt(littleVal) : littleVal, true);

						s2t.equal(
							ES.GetValueFromBuffer(view.buffer, 0, type, isTypedArray, 'order', true),
							littleVal,
							'buffer with type ' + type + ', little -> little, yields expected value'
						);

						if (hasBigEndian) {
							s2t.equal(
								ES.GetValueFromBuffer(view.buffer, 0, type, isTypedArray, 'order', false),
								view['get' + method](0, false),
								'buffer with type ' + type + ', little -> big, yields expected value'
							);

							clearBuffer(view.buffer);
							var bigVal = unserialize(result.setAsBig.asBig);
							view['set' + method](0, type.slice(0, 3) === 'Big' ? safeBigInt(bigVal) : bigVal, false);

							s2t.equal(
								ES.GetValueFromBuffer(view.buffer, 0, type, isTypedArray, 'order', false),
								bigVal,
								'buffer with type ' + type + ', big -> big, yields expected value'
							);

							s2t.equal(
								ES.GetValueFromBuffer(view.buffer, 0, type, isTypedArray, 'order', true),
								view['get' + method](0, true),
								'buffer with type ' + type + ', big -> little, yields expected value'
							);
						}
					});

					s2t.end();
				});
			});

			st.end();
		});

		t.end();
	});

	test('IterableToList', function (t) {
		var customIterator = function () {
			var i = -1;
			return {
				next: function () {
					i += 1;
					return {
						done: i >= 5,
						value: i
					};
				}
			};
		};

		t.deepEqual(
			ES.IterableToList({}, customIterator),
			[0, 1, 2, 3, 4],
			'iterator method is called and values collected'
		);

		t.test('Symbol support', { skip: !v.hasSymbols }, function (st) {
			st.deepEqual(ES.IterableToList('abc', String.prototype[Symbol.iterator]), ['a', 'b', 'c'], 'a string of code units spreads');
			st.deepEqual(ES.IterableToList('☃', String.prototype[Symbol.iterator]), ['☃'], 'a string of code points spreads');

			var arr = [1, 2, 3];
			st.deepEqual(ES.IterableToList(arr, arr[Symbol.iterator]), arr, 'an array becomes a similar array');
			st.notEqual(ES.IterableToList(arr, arr[Symbol.iterator]), arr, 'an array becomes a different, but similar, array');

			st.end();
		});

		t['throws'](
			function () { ES.IterableToList({}, void 0); },
			TypeError,
			'non-function iterator method'
		);

		t.end();
	});

	test('NumberToRawBytes', function (t) {
		forEach(v.nonStrings.concat('', 'Byte'), function (nonTAType) {
			t['throws'](
				function () { ES.NumberToRawBytes(nonTAType, 0, false); },
				TypeError,
				debug(nonTAType) + ' is not a String, or not a TypedArray type'
			);
		});

		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.NumberToRawBytes('Int8', nonNumber, false); },
				TypeError,
				debug(nonNumber) + ' is not a Number'
			);
		});

		forEach(v.nonBooleans, function (nonBoolean) {
			t['throws'](
				function () { ES.NumberToRawBytes('Int8', [0], nonBoolean); },
				TypeError,
				debug(nonBoolean) + ' is not a Boolean'
			);
		});

		forEach(bufferTestCases, function (testCase, name) {
			var value = unserialize(testCase.value);

			t.test(name + ': ' + value, function (st) {
				forEach([].concat(
					'Int8',
					'Uint8',
					'Uint8C',
					'Int16',
					'Uint16',
					'Int32',
					'Uint32',
					'Float32',
					'Float64'
				), function (type) {
					var hasBigEndian = type !== 'Int8' && type !== 'Uint8' && type !== 'Uint8C'; // the 8-bit types are special, they don't have big-endian
					var result = testCase[type === 'Uint8C' ? 'Uint8Clamped' : type];
					var valToSet = type === 'Uint8C' && value > 0xFF ? 0xFF : value;

					st.test(type, function (s2t) {
						/*
						s2t.equal(
							ES.GetValueFromBuffer(testCase.buffer, 0, type, true, 'Unordered'),
							defaultEndianness === testCase.endian ? testCase[type].little.value : testCase[type].big.value,
							'buffer holding ' + debug(testCase.value) + ' (' + testCase.endian + ' endian) with type ' + type + ', default endian, yields expected value'
						);
						*/

						s2t.deepEqual(
							ES.NumberToRawBytes(type, valToSet, true),
							result[type === 'Float64' ? 'setAsLittle' : 'setAsTruncatedLittle'].bytes,
							debug(value) + ' with type ' + type + ', little endian, yields expected value'
						);

						if (hasBigEndian) {
							s2t.deepEqual(
								ES.NumberToRawBytes(type, valToSet, false),
								result[type === 'Float64' ? 'setAsBig' : 'setAsTruncatedBig'].bytes,
								debug(value) + ' with type ' + type + ', big endian, yields expected value'
							);
						}

						s2t.end();
					});
				});

				st.end();
			});
		});

		t.end();
	});

	test('OrdinaryToPrimitive', function (t) {
		forEach(v.primitives, function (primitive) {
			t['throws'](
				function () { ES.OrdinaryToPrimitive(primitive, 'string'); },
				TypeError,
				debug(primitive) + ' is not Object'
			);

			if (primitive != null) {
				t.equal(
					ES.OrdinaryToPrimitive(Object(primitive), 'number'),
					primitive,
					debug(Object(primitive)) + ' becomes ' + debug(primitive)
				);
			}
		});

		forEach(v.nonStrings, function (nonString) {
			if (typeof nonString !== 'number') {
				t['throws'](
					function () { ES.OrdinaryToPrimitive({}, nonString); },
					TypeError,
					debug(nonString) + ' is not a String or a Number'
				);
			}
		});

		t.test('Symbols', { skip: !v.hasSymbols }, function (st) {
			forEach(v.symbols, function (sym) {
				st.equal(
					ES.OrdinaryToPrimitive(Object(sym), 'string'),
					Symbol.prototype.toString.call(sym),
					debug(Object(sym)) + ' with hint "string" returns ' + debug(Symbol.prototype.toString.call(sym))
				);
				st.equal(
					ES.OrdinaryToPrimitive(Object(sym), 'number'),
					sym,
					debug(Object(sym)) + ' with hint "number" returns ' + debug(sym)
				);
			});

			var primitiveSym = Symbol('primitiveSym');
			var objectSym = Object(primitiveSym);
			st.equal(
				ES.OrdinaryToPrimitive(objectSym, 'string'),
				Symbol.prototype.toString.call(primitiveSym),
				debug(objectSym) + ' with hint "string" returns ' + debug(Symbol.prototype.toString.call(primitiveSym))
			);
			st.equal(
				ES.OrdinaryToPrimitive(objectSym, 'number'),
				primitiveSym,
				debug(objectSym) + ' with hint "number" returns ' + debug(primitiveSym)
			);
			st.end();
		});

		t.test('Arrays', function (st) {
			var arrays = [[], ['a', 'b'], [1, 2]];
			forEach(arrays, function (arr) {
				st.equal(ES.OrdinaryToPrimitive(arr, 'string'), String(arr), debug(arr) + ' with hint "string" returns the string version of the array');
				st.equal(ES.OrdinaryToPrimitive(arr, 'number'), String(arr), debug(arr) + ' with hint "number" returns the string version of the array');
			});
			st.end();
		});

		t.test('Dates', function (st) {
			var dates = [new Date(), new Date(0), new Date(NaN)];
			forEach(dates, function (date) {
				st.equal(ES.OrdinaryToPrimitive(date, 'string'), String(date), debug(date) + ' with hint "string" returns the string version of the date');
				st.equal(ES.OrdinaryToPrimitive(date, 'number'), Number(date), debug(date) + ' with hint "number" returns the number version of the date');
			});
			st.end();
		});

		t.test('Objects', function (st) {
			st.equal(ES.OrdinaryToPrimitive(v.coercibleObject, 'number'), v.coercibleObject.valueOf(), 'coercibleObject with hint "number" coerces to valueOf');
			st.equal(ES.OrdinaryToPrimitive(v.coercibleObject, 'string'), v.coercibleObject.toString(), 'coercibleObject with hint "string" coerces to non-stringified toString');

			st.equal(ES.OrdinaryToPrimitive(v.coercibleFnObject, 'number'), v.coercibleFnObject.toString(), 'coercibleFnObject with hint "number" coerces to non-stringified toString');
			st.equal(ES.OrdinaryToPrimitive(v.coercibleFnObject, 'string'), v.coercibleFnObject.toString(), 'coercibleFnObject with hint "string" coerces to non-stringified toString');

			st.equal(ES.OrdinaryToPrimitive({}, 'number'), '[object Object]', '{} with hint "number" coerces to Object#toString');
			st.equal(ES.OrdinaryToPrimitive({}, 'string'), '[object Object]', '{} with hint "string" coerces to Object#toString');

			st.equal(ES.OrdinaryToPrimitive(v.toStringOnlyObject, 'number'), v.toStringOnlyObject.toString(), 'toStringOnlyObject with hint "number" returns non-stringified toString');
			st.equal(ES.OrdinaryToPrimitive(v.toStringOnlyObject, 'string'), v.toStringOnlyObject.toString(), 'toStringOnlyObject with hint "string" returns non-stringified toString');

			st.equal(ES.OrdinaryToPrimitive(v.valueOfOnlyObject, 'number'), v.valueOfOnlyObject.valueOf(), 'valueOfOnlyObject with hint "number" returns valueOf');
			st.equal(ES.OrdinaryToPrimitive(v.valueOfOnlyObject, 'string'), v.valueOfOnlyObject.valueOf(), 'valueOfOnlyObject with hint "string" returns non-stringified valueOf');

			st.test('exceptions', function (s2t) {
				s2t['throws'](function () { ES.OrdinaryToPrimitive.call(null, v.uncoercibleObject, 'number'); }, TypeError, 'uncoercibleObject with hint "number" throws a TypeError');
				s2t['throws'](function () { ES.OrdinaryToPrimitive.call(null, v.uncoercibleObject, 'string'); }, TypeError, 'uncoercibleObject with hint "string" throws a TypeError');

				s2t['throws'](function () { ES.OrdinaryToPrimitive.call(null, v.uncoercibleFnObject, 'number'); }, TypeError, 'uncoercibleFnObject with hint "number" throws a TypeError');
				s2t['throws'](function () { ES.OrdinaryToPrimitive.call(null, v.uncoercibleFnObject, 'string'); }, TypeError, 'uncoercibleFnObject with hint "string" throws a TypeError');
				s2t.end();
			});
			st.end();
		});

		t.end();
	});

	test('RawBytesToNumber', function (t) {
		forEach(v.nonStrings.concat('', 'Byte'), function (nonTAType) {
			t['throws'](
				function () { ES.RawBytesToNumber(nonTAType, [], false); },
				TypeError,
				debug(nonTAType) + ' is not a String, or not a TypedArray type'
			);
		});

		forEach(v.primitives.concat(v.objects), function (nonArray) {
			t['throws'](
				function () { ES.RawBytesToNumber('Int8', nonArray, false); },
				TypeError,
				debug(nonArray) + ' is not an Array'
			);
		});
		forEach([-1, 1.5, 256], function (nonByte) {
			t['throws'](
				function () { ES.RawBytesToNumber('Int8', [nonByte], false); },
				TypeError,
				debug(nonByte) + ' is not a valid "byte"'
			);
		});

		forEach(v.nonBooleans, function (nonBoolean) {
			t['throws'](
				function () { ES.RawBytesToNumber('Int8', [0], nonBoolean); },
				TypeError,
				debug(nonBoolean) + ' is not a Boolean'
			);
		});

		forEach(bufferTestCases, function (testCase, name) {
			var value = unserialize(testCase.value);
			t.test(name + ': ' + value, function (st) {
				forEach([].concat(
					'Int8',
					'Uint8',
					'Uint8C',
					'Int16',
					'Uint16',
					'Int32',
					'Uint32',
					'Float32',
					'Float64'
				), function (type) {
					var result = testCase[type === 'Uint8C' ? 'Uint8Clamped' : type];
					var hasBigEndian = type !== 'Int8' && type !== 'Uint8' && type !== 'Uint8C'; // the 8-bit types are special, they don't have big-endian

					var littleLittle = unserialize(result.setAsLittle.asLittle);
					st.equal(
						ES.RawBytesToNumber(type, result.setAsLittle.bytes, true),
						littleLittle,
						type + ', little-endian: bytes (' + debug(result.setAsLittle.bytes) + ') for ' + debug(littleLittle) + ' produces it'
					);
					if (hasBigEndian) {
						var bigBig = unserialize(result.setAsBig.asBig);
						st.equal(
							ES.RawBytesToNumber(type, result.setAsBig.bytes, false),
							bigBig,
							type + ', big-endian: bytes (' + debug(result.setAsBig.bytes) + ') for ' + debug(bigBig) + ' produces it'
						);
					}
				});

				st.end();
			});
		});

		t.test('incorrect byte counts', function (st) {
			st['throws'](
				function () { ES.RawBytesToNumber('Float32', [0, 0, 0], false); },
				RangeError,
				'Float32 with less than 4 bytes throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumber('Float32', [0, 0, 0, 0, 0], false); },
				RangeError,
				'Float32 with more than 4 bytes throws a RangeError'
			);

			st['throws'](
				function () { ES.RawBytesToNumber('Float64', [0, 0, 0, 0, 0, 0, 0], false); },
				RangeError,
				'Float64 with less than 8 bytes throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumber('Float64', [0, 0, 0, 0, 0, 0, 0, 0, 0], false); },
				RangeError,
				'Float64 with more than 8 bytes throws a RangeError'
			);

			st['throws'](
				function () { ES.RawBytesToNumber('Int8', [], false); },
				RangeError,
				'Int8 with less than 1 byte throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumber('Int8', [0, 0], false); },
				RangeError,
				'Int8 with more than 1 byte throws a RangeError'
			);

			st['throws'](
				function () { ES.RawBytesToNumber('Uint8', [], false); },
				RangeError,
				'Uint8 with less than 1 byte throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumber('Uint8', [0, 0], false); },
				RangeError,
				'Uint8 with more than 1 byte throws a RangeError'
			);

			st['throws'](
				function () { ES.RawBytesToNumber('Uint8C', [], false); },
				RangeError,
				'Uint8C with less than 1 byte throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumber('Uint8C', [0, 0], false); },
				RangeError,
				'Uint8C with more than 1 byte throws a RangeError'
			);

			st['throws'](
				function () { ES.RawBytesToNumber('Int16', [0], false); },
				RangeError,
				'Int16 with less than 2 bytes throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumber('Uint8C', [0, 0, 0], false); },
				RangeError,
				'Int16 with more than 2 bytes throws a RangeError'
			);

			st['throws'](
				function () { ES.RawBytesToNumber('Uint16', [0], false); },
				RangeError,
				'Uint16 with less than 2 bytes throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumber('Uint16', [0, 0, 0], false); },
				RangeError,
				'Uint16 with more than 2 bytes throws a RangeError'
			);

			st['throws'](
				function () { ES.RawBytesToNumber('Uint16', [0, 0, 0], false); },
				RangeError,
				'Uint16 with less than 4 bytes throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumber('Uint16', [0, 0, 0, 0, 0], false); },
				RangeError,
				'Uint16 with more than 4 bytes throws a RangeError'
			);

			st['throws'](
				function () { ES.RawBytesToNumber('Uint32', [0, 0, 0], false); },
				RangeError,
				'Uint32 with less than 4 bytes throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumber('Uint32', [0, 0, 0, 0, 0], false); },
				RangeError,
				'Uint32 with more than 4 bytes throws a RangeError'
			);

			st.end();
		});

		t.end();
	});

	test('StringGetOwnProperty', function (t) {
		forEach(v.nonStrings.concat(v.strings), function (nonBoxedString) {
			t['throws'](
				function () { ES.StringGetOwnProperty(nonBoxedString, '0'); },
				TypeError,
				debug(nonBoxedString) + ' is not a boxed String'
			);
		});
		forEach(v.nonPropertyKeys, function (nonPropertyKey) {
			t['throws'](
				function () { ES.StringGetOwnProperty(Object(''), nonPropertyKey); },
				TypeError,
				debug(nonPropertyKey) + ' is not a Property Key'
			);
		});

		t.equal(ES.StringGetOwnProperty(Object(''), '0'), undefined, 'empty boxed string yields undefined');

		forEach(v.symbols, function (symbol) {
			t.equal(
				ES.StringGetOwnProperty(Object('abc'), symbol),
				undefined,
				debug(symbol) + ' is not a String, and yields undefined'
			);
		});

		forEach(v.strings, function (string) {
			if (string) {
				var S = Object(string);
				for (var i = 0; i < string.length; i += 1) {
					var descriptor = ES.StringGetOwnProperty(S, String(i));
					t.deepEqual(
						descriptor,
						{
							'[[Configurable]]': false,
							'[[Enumerable]]': true,
							'[[Value]]': string.charAt(i),
							'[[Writable]]': false
						},
						debug(string) + ': property ' + debug(String(i)) + ': returns expected descriptor'
					);
				}
			}
		});

		t.end();
	});

	test('ToIndex', function (t) {
		t.equal(ES.ToIndex(), 0, 'no value gives +0');
		t.equal(ES.ToIndex(undefined), 0, 'undefined value gives +0');
		t.equal(ES.ToIndex(-0), 0, '-0 gives +0');

		t['throws'](function () { ES.ToIndex(-1); }, RangeError, 'negative numbers throw');

		t['throws'](function () { ES.ToIndex(MAX_SAFE_INTEGER + 1); }, RangeError, 'too large numbers throw');

		t.equal(ES.ToIndex(3), 3, 'numbers work');
		t.equal(ES.ToIndex(v.valueOfOnlyObject), 4, 'coercible objects are coerced');

		t.end();
	});

	test('IsSharedArrayBuffer', function (t) {
		forEach(v.primitives, function (primitive) {
			t['throws'](
				function () { ES.IsSharedArrayBuffer(primitive); },
				TypeError,
				debug(primitive) + ' is not an Object'
			);
		});

		forEach(v.objects, function (nonSAB) {
			t.equal(ES.IsSharedArrayBuffer(nonSAB), false, debug(nonSAB) + ' is not a SharedArrayBuffer');
		});

		t.test('real SABs', { skip: typeof SharedArrayBuffer !== 'function' }, function (st) {
			var sab = new SharedArrayBuffer();
			st.equal(ES.IsSharedArrayBuffer(sab), true, debug(sab) + ' is a SharedArrayBuffer');

			st.end();
		});

		t.end();
	});

	test('ValidateAtomicAccess', function (t) {
		forEach(v.primitives.concat(v.objects, [[]]), function (nonTA) {
			t['throws'](
				function () { ES.ValidateAtomicAccess(nonTA, 0); },
				TypeError,
				debug(nonTA) + ' is not a TypedArray'
			);
		});

		t.test('actual typed arrays', { skip: availableTypedArrays.length === 0 }, function (st) {
			forEach(availableTypedArrays, function (TypedArray) {
				var ta = new global[TypedArray](8);

				st.doesNotThrow(
					function () { ES.ValidateAtomicAccess(ta, 0); },
					debug(ta) + ' is an integer TypedArray'
				);

				st['throws'](
					function () { ES.ValidateAtomicAccess(ta, -1); },
					RangeError, // via ToIndex
					'a requestIndex of -1 is <= 0'
				);
				st['throws'](
					function () { ES.ValidateAtomicAccess(ta, 8); },
					RangeError,
					'a requestIndex === length throws'
				);
				st['throws'](
					function () { ES.ValidateAtomicAccess(ta, 9); },
					RangeError,
					'a requestIndex > length throws'
				);

				st.equal(ES.ValidateAtomicAccess(ta, 0), 0, TypedArray + ': requestIndex of 0 gives 0');
				st.equal(ES.ValidateAtomicAccess(ta, 1), 1, TypedArray + ': requestIndex of 1 gives 1');
				st.equal(ES.ValidateAtomicAccess(ta, 2), 2, TypedArray + ': requestIndex of 2 gives 2');
				st.equal(ES.ValidateAtomicAccess(ta, 3), 3, TypedArray + ': requestIndex of 3 gives 3');
				st.equal(ES.ValidateAtomicAccess(ta, 4), 4, TypedArray + ': requestIndex of 4 gives 4');
				st.equal(ES.ValidateAtomicAccess(ta, 5), 5, TypedArray + ': requestIndex of 5 gives 5');
				st.equal(ES.ValidateAtomicAccess(ta, 6), 6, TypedArray + ': requestIndex of 6 gives 6');
				st.equal(ES.ValidateAtomicAccess(ta, 7), 7, TypedArray + ': requestIndex of 7 gives 7');
			});

			st.end();
		});

		t.end();
	});

	test('WordCharacters', function (t) {
		forEach(v.nonBooleans, function (nonBoolean) {
			t['throws'](
				function () { ES.WordCharacters(nonBoolean, false); },
				TypeError,
				'arg 1: ' + debug(nonBoolean) + ' is not a Boolean'
			);

			t['throws'](
				function () { ES.WordCharacters(false, nonBoolean); },
				TypeError,
				'arg 2: ' + debug(nonBoolean) + ' is not a Boolean'
			);
		});

		t.equal(ES.WordCharacters(false, false), 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_', 'not both true gives a-zA-Z0-9_');
		t.equal(ES.WordCharacters(false, true), 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_', 'not both true gives a-zA-Z0-9_');
		t.equal(ES.WordCharacters(true, false), 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_', 'not both true gives a-zA-Z0-9_');

		t.equal(ES.WordCharacters(true, true), 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_', 'both true gives a-zA-Z0-9_');

		t.end();
	});
};

var makeAsyncFromSyncIterator = function makeAsyncFromSyncIterator(ES, end, throwMethod, returnMethod) {
	var i = 0;
	var iterator = {
		next: function next() {
			try {
				return {
					done: i > end,
					value: i
				};
			} finally {
				i += 1;
			}
		},
		'return': returnMethod,
		'throw': throwMethod
	};
	var syncIteratorRecord = makeIteratorRecord(iterator);

	return ES.CreateAsyncFromSyncIterator(syncIteratorRecord);
};

var es2018 = function ES2018(ES, ops, expectedMissing, skips) {
	es2017(ES, ops, expectedMissing, assign({}, skips, {
		EnumerableOwnProperties: true,
		GetSubstitution: true,
		IsPropertyDescriptor: true
	}));
	var test = makeTest(ES, skips);

	test('Abstract Relational Comparison', function (t) {
		forEach(v.bigints, function (bigint) {
			t.equal(
				ES['Abstract Relational Comparison'](bigint, bigint + BigInt(1), false),
				true,
				debug(bigint) + ' is less than the same + 1n'
			);
			t.equal(
				ES['Abstract Relational Comparison'](bigint, bigint - BigInt(1), false),
				false,
				debug(bigint) + ' is not less than the same - 1n'
			);

			t.equal(
				ES['Abstract Relational Comparison'](bigint, -Infinity, false),
				false,
				debug(bigint) + ' is not less than -∞'
			);
			t.equal(
				ES['Abstract Relational Comparison'](-Infinity, bigint, false),
				true,
				'-∞ is less than ' + debug(bigint)
			);
			t.equal(
				ES['Abstract Relational Comparison'](bigint, Infinity, false),
				true,
				debug(bigint) + ' is less than ∞'
			);
			t.equal(
				ES['Abstract Relational Comparison'](Infinity, bigint, false),
				false,
				'∞ is not less than ' + debug(bigint)
			);
		});

		t.end();
	});

	test('CopyDataProperties', function (t) {
		t.test('first argument: target', function (st) {
			forEach(v.primitives, function (primitive) {
				st['throws'](
					function () { ES.CopyDataProperties(primitive, {}, []); },
					TypeError,
					debug(primitive) + ' is not an Object'
				);
			});
			st.end();
		});

		t.test('second argument: source', function (st) {
			var frozenTarget = Object.freeze ? Object.freeze({}) : {};
			forEach(v.nullPrimitives, function (nullish) {
				st.equal(
					ES.CopyDataProperties(frozenTarget, nullish, []),
					frozenTarget,
					debug(nullish) + ' "source" yields identical, unmodified target'
				);
			});

			forEach(v.nonNullPrimitives, function (objectCoercible) {
				var target = {};
				var result = ES.CopyDataProperties(target, objectCoercible, []);
				st.equal(result, target, 'result === target');
				st.deepEqual(keys(result), keys(Object(objectCoercible)), 'target ends up with keys of ' + debug(objectCoercible));
			});

			st.test('enumerable accessor property', { skip: !$defineProperty }, function (s2t) {
				var target = {};
				var source = {};
				defineProperty(source, 'a', {
					enumerable: true,
					get: function () { return 42; }
				});
				var result = ES.CopyDataProperties(target, source, []);
				s2t.equal(result, target, 'result === target');
				s2t.deepEqual(result, { a: 42 }, 'target ends up with enumerable accessor of source');
				s2t.end();
			});

			st.end();
		});

		t.test('third argument: excludedItems', function (st) {
			forEach(v.objects.concat(v.primitives), function (nonArray) {
				st['throws'](
					function () { ES.CopyDataProperties({}, {}, nonArray); },
					TypeError,
					debug(nonArray) + ' is not an Array'
				);
			});

			forEach(v.nonPropertyKeys, function (nonPropertyKey) {
				st['throws'](
					function () { ES.CopyDataProperties({}, {}, [nonPropertyKey]); },
					TypeError,
					debug(nonPropertyKey) + ' is not a Property Key'
				);
			});

			var result = ES.CopyDataProperties({}, { a: 1, b: 2, c: 3 }, ['b']);
			st.deepEqual(keys(result).sort(), ['a', 'c'].sort(), 'excluded string keys are excluded');

			st.test('excluding symbols', { skip: !v.hasSymbols }, function (s2t) {
				var source = {};
				forEach(v.symbols, function (symbol) {
					source[symbol] = true;
				});

				var includedSymbols = v.symbols.slice(1);
				var excludedSymbols = v.symbols.slice(0, 1);
				var target = ES.CopyDataProperties({}, source, excludedSymbols);

				forEach(includedSymbols, function (symbol) {
					s2t.equal(hasOwn(target, symbol), true, debug(symbol) + ' is included');
				});

				forEach(excludedSymbols, function (symbol) {
					s2t.equal(hasOwn(target, symbol), false, debug(symbol) + ' is excluded');
				});

				s2t.end();
			});

			st.end();
		});

		// TODO: CopyDataProperties does not throw when copying fails

		t.end();
	});

	test('CreateAsyncFromSyncIterator', function (t) {
		forEach(v.primitives.concat(v.objects), function (nonIteratorRecord) {
			t['throws'](
				function () { ES.CreateAsyncFromSyncIterator(nonIteratorRecord); },
				TypeError,
				debug(nonIteratorRecord) + ' is not an Iterator Record'
			);
		});

		t.test('with Promise support', { skip: typeof Promise === 'undefined' }, function (st) {
			var asyncIteratorRecord = makeAsyncFromSyncIterator(ES, 5);

			st.deepEqual(
				keys(asyncIteratorRecord).sort(),
				['[[Iterator]]', '[[NextMethod]]', '[[Done]]'].sort(),
				'has expected Iterator Record fields'
			);
			st.equal(typeof asyncIteratorRecord['[[NextMethod]]'], 'function', '[[NextMethod]] is a function');
			st.equal(typeof asyncIteratorRecord['[[Done]]'], 'boolean', '[[Done]] is a boolean');

			var itNoThrow = asyncIteratorRecord['[[Iterator]]'];

			st.test('.next()', function (s2t) {
				var i = 0;
				var iterator = {
					next: function next(x) {
						try {
							return {
								done: i > 2,
								value: [i, arguments.length, x]
							};
						} finally {
							i += 1;
						}
					}
				};
				var syncIteratorRecord = makeIteratorRecord(iterator);

				var record = ES.CreateAsyncFromSyncIterator(syncIteratorRecord);
				var it = record['[[Iterator]]'];
				var next = record['[[NextMethod]]'];

				s2t.test('no next arg', function (s3t) {
					return next.call(it).then(function (result) {
						s3t.deepEqual(
							result,
							{ value: [0, 0, undefined], done: false },
							'result is correct'
						);
					});
				});

				s2t.test('no next arg', function (s3t) {
					return next.call(it, 42).then(function (result) {
						s3t.deepEqual(
							result,
							{ value: [1, 1, 42], done: false },
							'result is correct'
						);
					});
				});

				s2t.end();
			});

			st.test('.throw()', function (s2t) {
				var asyncThrows = makeAsyncFromSyncIterator(
					ES,
					5,
					function throws(x) {
						s2t.equal(x, arguments.length === 1 ? false : void undefined, '.throw() called with `false`, or nothing');

						throw true;
					}
				)['[[Iterator]]'];

				var asyncThrowReturnsNonObject = makeAsyncFromSyncIterator(
					ES,
					5,
					function throws(x) {
						s2t.equal(x, arguments.length === 1 ? false : void undefined, '.throw() called with `false`, or nothing');
					}
				)['[[Iterator]]'];

				var asyncThrowReturnsObject = makeAsyncFromSyncIterator(
					ES,
					5,
					function throws(x) {
						s2t.equal(x, arguments.length === 1 ? false : void undefined, '.throw() called with `false`, or nothing');

						return {
							done: true,
							value: Promise.resolve(42)
						};
					}
				)['[[Iterator]]'];

				return Promise.all([
					itNoThrow['throw']().then(s2t.fail, s2t.pass), // "pass", since it rejects with `undefined`
					itNoThrow['throw'](true).then(s2t.fail, s2t.ok), // "ok", since it rejects with `true`
					asyncThrows['throw']().then(s2t.fail, s2t.ok), // "ok", since it rejects with `true`
					asyncThrows['throw'](false).then(s2t.fail, s2t.ok), // "ok", since it rejects with `true`
					asyncThrowReturnsNonObject['throw']().then(s2t.fail, s2t.ok), // "ok", since it rejects with an error
					asyncThrowReturnsNonObject['throw'](false).then(s2t.fail, s2t.ok), // "ok", since it rejects with an error
					asyncThrowReturnsObject['throw']().then(function (x) { s2t.deepEqual(x, { done: true, value: 42 }); }),
					asyncThrowReturnsObject['throw'](false).then(function (x) { s2t.deepEqual(x, { done: true, value: 42 }); })
				]);
			});

			st.test('.return()', function (s2t) {
				var asyncThrows = makeAsyncFromSyncIterator(
					ES,
					5,
					void undefined,
					function returns(x) {
						s2t.equal(x, arguments.length === 1 ? false : void undefined, '.throw() called with `false`, or nothing');

						throw true;
					}
				)['[[Iterator]]'];

				var asyncThrowReturnsNonObject = makeAsyncFromSyncIterator(
					ES,
					5,
					void undefined,
					function returns(x) {
						s2t.equal(x, arguments.length === 1 ? false : void undefined, '.throw() called with `false`, or nothing');
					}
				)['[[Iterator]]'];

				var asyncThrowReturnsObject = makeAsyncFromSyncIterator(
					ES,
					5,
					void undefined,
					function returns(x) {
						s2t.equal(x, arguments.length === 1 ? false : void undefined, '.throw() called with `false`, or nothing');

						return {
							done: true,
							value: Promise.resolve(42)
						};
					}
				)['[[Iterator]]'];

				return Promise.all([
					itNoThrow['return']().then(function (x) { s2t.deepEqual(x, { done: true, value: void undefined }); }),
					itNoThrow['return'](true).then(function (x) { s2t.deepEqual(x, { done: true, value: true }); }),
					asyncThrows['return']().then(s2t.fail, s2t.ok), // "ok", since it rejects with `true`
					asyncThrows['return'](false).then(s2t.fail, s2t.ok), // "ok", since it rejects with `true`
					asyncThrowReturnsNonObject['return']().then(s2t.fail, s2t.ok), // "ok", since it rejects with an error
					asyncThrowReturnsNonObject['return'](false).then(s2t.fail, s2t.ok), // "ok", since it rejects with an error
					asyncThrowReturnsObject['return']().then(function (x) { s2t.deepEqual(x, { done: true, value: 42 }); }),
					asyncThrowReturnsObject['return'](false).then(function (x) { s2t.deepEqual(x, { done: true, value: 42 }); })
				]);
			});

			return testAsyncIterator(st, asyncIteratorRecord['[[Iterator]]'], [0, 1, 2, 3, 4]);
		});
	});

	test('DateString', function (t) {
		forEach(v.nonNumbers.concat(NaN), function (nonNumberOrNaN) {
			t['throws'](
				function () { ES.DateString(nonNumberOrNaN); },
				TypeError,
				debug(nonNumberOrNaN) + ' is not a non-NaN Number'
			);
		});

		t.equal(ES.DateString(Date.UTC(2019, 8, 10, 7, 8, 9)), 'Tue Sep 10 2019');
		t.equal(ES.DateString(Date.UTC(2016, 1, 29, 7, 8, 9)), 'Mon Feb 29 2016'); // leap day
		t.end();
	});

	test('EnumerableOwnPropertyNames', function (t) {
		t['throws'](
			function () { ES.EnumerableOwnPropertyNames({}, 'not key, value, or key+value'); },
			TypeError,
			'invalid "kind" throws'
		);

		var obj = testEnumerableOwnNames(t, function (O) {
			return ES.EnumerableOwnPropertyNames(O, 'key');
		});

		t.deepEqual(
			ES.EnumerableOwnPropertyNames(obj, 'key'),
			['own'],
			'returns enumerable own keys'
		);

		t.deepEqual(
			ES.EnumerableOwnPropertyNames(obj, 'value'),
			[obj.own],
			'returns enumerable own values'
		);

		t.deepEqual(
			ES.EnumerableOwnPropertyNames(obj, 'key+value'),
			[['own', obj.own]],
			'returns enumerable own entries'
		);

		t.test('getters changing properties of unvisited entries', { skip: !$defineProperty }, function (st) {
			var o = { a: 1, b: 2, c: 3, d: 4 };
			defineProperty(o, 'a', {
				enumerable: true,
				get: function () {
					defineProperty(o, 'b', { enumerable: false });
					return 1;
				}
			});
			defineProperty(o, 'c', { enumerable: false });

			st.deepEqual(
				ES.EnumerableOwnPropertyNames(o, 'key'),
				['a', 'b', 'd'],
				'`key` kind returns all initially enumerable own keys'
			);

			st.deepEqual(
				ES.EnumerableOwnPropertyNames(o, 'key+value'),
				[['a', 1], ['d', 4]],
				'key+value returns only own enumerable entries that remain enumerable at the time they are visited'
			);

			st.end();
		});

		t.end();
	});

	test('GetSubstitution', function (t) {
		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { ES.GetSubstitution(nonString, '', 0, [], undefined, ''); },
				TypeError,
				'`matched`: ' + debug(nonString) + ' is not a String'
			);

			t['throws'](
				function () { ES.GetSubstitution('', nonString, 0, [], undefined, ''); },
				TypeError,
				'`str`: ' + debug(nonString) + ' is not a String'
			);

			t['throws'](
				function () { ES.GetSubstitution('', '', 0, [], undefined, nonString); },
				TypeError,
				'`replacement`: ' + debug(nonString) + ' is not a String'
			);

			if (typeof nonString !== 'undefined') {
				t['throws'](
					function () { ES.GetSubstitution('', '', 0, [nonString], undefined, ''); },
					TypeError,
					'`captures`: ' + debug([nonString]) + ' is not an Array of strings'
				);
			}
		});

		forEach(v.notNonNegativeIntegers, function (nonNonNegativeInteger) {
			t['throws'](
				function () { ES.GetSubstitution('', '', nonNonNegativeInteger, [], undefined, ''); },
				TypeError,
				'`position`: ' + debug(nonNonNegativeInteger) + ' is not a non-negative integer'
			);
		});

		forEach(v.nonArrays, function (nonArray) {
			t['throws'](
				function () { ES.GetSubstitution('', '', 0, nonArray, undefined, ''); },
				TypeError,
				'`captures`: ' + debug(nonArray) + ' is not an Array'
			);
		});

		t.equal(
			ES.GetSubstitution('def', 'abcdefghi', 3, [], undefined, '123'),
			'123',
			'returns the substitution'
		);
		t.equal(
			ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '$$2$'),
			'$2$',
			'supports $$, and trailing $'
		);

		t.equal(
			ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '>$&<'),
			'>abcdef<',
			'supports $&'
		);

		t.equal(
			ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '>$`<'),
			'><',
			'supports $` at position 0'
		);
		t.equal(
			ES.GetSubstitution('def', 'abcdefghi', 3, [], undefined, '>$`<'),
			'>ab<',
			'supports $` at position > 0'
		);

		t.equal(
			ES.GetSubstitution('def', 'abcdefghi', 7, [], undefined, ">$'<"),
			'><',
			"supports $' at a position where there's less than `matched.length` chars left"
		);
		t.equal(
			ES.GetSubstitution('def', 'abcdefghi', 3, [], undefined, ">$'<"),
			'>ghi<',
			"supports $' at a position where there's more than `matched.length` chars left"
		);

		for (var i = 0; i < 100; i += 1) {
			var captures = [];
			captures[i] = 'test';
			if (i > 0) {
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '>$' + i + '<'),
					'>undefined<',
					'supports $' + i + ' with no captures'
				);
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '>$' + i),
					'>undefined',
					'supports $' + i + ' at the end of the replacement, with no captures'
				);
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, undefined, '>$' + i + '<'),
					'><',
					'supports $' + i + ' with a capture at that index'
				);
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, undefined, '>$' + i),
					'>',
					'supports $' + i + ' at the end of the replacement, with a capture at that index'
				);
			}
			if (i < 10) {
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '>$0' + i + '<'),
					i === 0 ? '><' : '>undefined<',
					'supports $0' + i + ' with no captures'
				);
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '>$0' + i),
					i === 0 ? '>' : '>undefined',
					'supports $0' + i + ' at the end of the replacement, with no captures'
				);
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, undefined, '>$0' + i + '<'),
					'><',
					'supports $0' + i + ' with a capture at that index'
				);
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, undefined, '>$0' + i),
					'>',
					'supports $0' + i + ' at the end of the replacement, with a capture at that index'
				);
			}
		}

		t.equal(
			ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, undefined, 'a>$<foo><z'),
			'a>$<oo><z',
			'works with the named capture regex without named captures'
		);
		t.equal(
			ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, undefined, 'a>$<foo>$<z'),
			'a>$<oo>$<',
			'works with a mismatched $<'
		);

		t.end();
	});

	test('IsStringPrefix', function (t) {
		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { ES.IsStringPrefix(nonString, 'a'); },
				TypeError,
				'first arg: ' + debug(nonString) + ' is not a string'
			);
			t['throws'](
				function () { ES.IsStringPrefix('a', nonString); },
				TypeError,
				'second arg: ' + debug(nonString) + ' is not a string'
			);
		});

		forEach(v.strings, function (string) {
			t.equal(ES.IsStringPrefix(string, string), true, debug(string) + ' is a prefix of itself');

			t.equal(ES.IsStringPrefix('', string), true, 'the empty string is a prefix of everything');
		});

		t.equal(ES.IsStringPrefix('abc', 'abcd'), true, '"abc" is a prefix of "abcd"');
		t.equal(ES.IsStringPrefix('abcd', 'abc'), false, '"abcd" is not a prefix of "abc"');

		t.equal(ES.IsStringPrefix('a', 'bc'), false, '"a" is not a prefix of "bc"');

		t.end();
	});

	test('NumberToString', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.NumberToString(nonNumber); },
				TypeError,
				debug(nonNumber) + ' is not a Number'
			);
		});

		forEach(v.numbers, function (number) {
			t.equal(ES.NumberToString(number), String(number), debug(number) + ' stringifies to ' + number);
		});

		t.end();
	});

	test('PromiseResolve', function (t) {
		t.test('Promises unsupported', { skip: typeof Promise === 'function' }, function (st) {
			st['throws'](
				function () { ES.PromiseResolve(); },
				SyntaxError,
				'Promises are not supported'
			);
			st.end();
		});

		t.test('Promises supported', { skip: typeof Promise !== 'function' }, function (st) {
			st.plan(2);

			var a = {};
			var b = {};
			var fulfilled = Promise.resolve(a);
			var rejected = Promise.reject(b);

			ES.PromiseResolve(Promise, fulfilled).then(function (x) {
				st.equal(x, a, 'fulfilled promise resolves to fulfilled');
			});

			ES.PromiseResolve(Promise, rejected)['catch'](function (e) {
				st.equal(e, b, 'rejected promise resolves to rejected');
			});
		});

		t.end();
	});

	test('SetFunctionLength', function (t) {
		forEach(v.nonFunctions, function (nonFunction) {
			t['throws'](
				function () { ES.SetFunctionLength(nonFunction, 0); },
				TypeError,
				debug(nonFunction) + ' is not a Function'
			);
		});

		t.test('non-extensible function', { skip: !Object.preventExtensions }, function (st) {
			var F = function F() {};
			Object.preventExtensions(F);

			st['throws'](
				function () { ES.SetFunctionLength(F, 0); },
				TypeError,
				'non-extensible function throws'
			);
			st.end();
		});

		var HasLength = function HasLength(_) { return _; };
		t.equal(hasOwn(HasLength, 'length'), true, 'precondition: `HasLength` has own length');
		t['throws'](
			function () { ES.SetFunctionLength(HasLength, 0); },
			TypeError,
			'function with own length throws'
		);

		t.test('no length', { skip: !functionsHaveConfigurableNames }, function (st) {
			var HasNoLength = function HasNoLength() {};
			delete HasNoLength.length;

			st.equal(hasOwn(HasNoLength, 'length'), false, 'precondition: `HasNoLength` has no own length');

			forEach(v.nonNumbers, function (nonNumber) {
				st['throws'](
					function () { ES.SetFunctionLength(HasNoLength, nonNumber); },
					TypeError,
					debug(nonNumber) + ' is not a Number'
				);
			});

			forEach([-1, -42, -Infinity, Infinity].concat(v.nonIntegerNumbers), function (nonPositiveInteger) {
				st['throws'](
					function () { ES.SetFunctionLength(HasNoLength, nonPositiveInteger); },
					TypeError,
					debug(nonPositiveInteger) + ' is not a positive integer Number'
				);
			});

			st.end();
		});

		// TODO: defines an own configurable non-enum non-write length property

		t.end();
	});

	test('thisSymbolValue', function (t) {
		forEach(v.nonSymbolPrimitives.concat(v.objects), function (nonSymbol) {
			t['throws'](
				function () { ES.thisSymbolValue(nonSymbol); },
				v.hasSymbols ? TypeError : SyntaxError,
				debug(nonSymbol) + ' is not a Symbol'
			);
		});

		t.test('no native Symbols', { skip: v.hasSymbols }, function (st) {
			forEach(v.objects.concat(v.primitives), function (value) {
				st['throws'](
					function () { ES.thisSymbolValue(value); },
					SyntaxError,
					'Symbols are not supported'
				);
			});
			st.end();
		});

		t.test('symbol values', { skip: !v.hasSymbols }, function (st) {
			forEach(v.symbols, function (symbol) {
				st.equal(ES.thisSymbolValue(symbol), symbol, 'Symbol value of ' + debug(symbol) + ' is same symbol');

				st.equal(
					ES.thisSymbolValue(Object(symbol)),
					symbol,
					'Symbol value of ' + debug(Object(symbol)) + ' is ' + debug(symbol)
				);
			});

			st.end();
		});

		t.end();
	});

	test('ThrowCompletion', function (t) {
		var sentinel = {};
		var completion = ES.ThrowCompletion(sentinel);

		t.ok(completion instanceof ES.CompletionRecord, 'produces an instance of CompletionRecord');
		t.equal(SLOT.get(completion, '[[Type]]'), 'throw', 'completion type is "throw"');
		t.equal(completion.type(), 'throw', 'completion type is "throw" (via property)');
		t.equal(SLOT.get(completion, '[[Value]]'), sentinel, 'completion value is the argument provided');
		t.equal(completion.value(), sentinel, 'completion value is the argument provided (via property)');

		t.end();
	});

	test('TimeString', function (t) {
		forEach(v.nonNumbers.concat(NaN), function (nonNumberOrNaN) {
			t['throws'](
				function () { ES.TimeString(nonNumberOrNaN); },
				TypeError,
				debug(nonNumberOrNaN) + ' is not a non-NaN Number'
			);
		});

		var tv = Date.UTC(2019, 8, 10, 7, 8, 9);
		t.equal(ES.TimeString(tv), '07:08:09 GMT');

		t.end();
	});

	test('UnicodeEscape', function (t) {
		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { ES.UnicodeEscape(nonString); },
				TypeError,
				debug(nonString) + ' is not a String'
			);
		});
		t['throws'](
			function () { ES.UnicodeEscape(''); },
			TypeError,
			'empty string does not have length 1'
		);
		t['throws'](
			function () { ES.UnicodeEscape('ab'); },
			TypeError,
			'2-char string does not have length 1'
		);

		t.equal(ES.UnicodeEscape(' '), '\\u0020');
		t.equal(ES.UnicodeEscape('a'), '\\u0061');
		t.equal(ES.UnicodeEscape(leadingPoo), '\\ud83d');
		t.equal(ES.UnicodeEscape(trailingPoo), '\\udca9');

		t.end();
	});

	test('IteratorClose', function (t) {
		var sentinel = {};
		t['throws'](
			function () { ES.IteratorClose({ 'return': function () { throw sentinel; } }, ES.ThrowCompletion(-1)); },
			-1,
			'`.return` that throws, when completionThunk does too, throws exception from Competion Record'
		);
		t['throws'](
			function () { ES.IteratorClose({ 'return': function () { } }, ES.ThrowCompletion(-1)); },
			-1,
			'`.return` that does not throw, when completionThunk does, throws exception from Competion Record'
		);

		t.end();
	});

	test('AsyncIteratorClose', function (t) {
		forEach(v.primitives.concat(v.objects), function (nonIteratorRecord) {
			t['throws'](
				function () { ES.AsyncIteratorClose(nonIteratorRecord); },
				TypeError,
				debug(nonIteratorRecord) + ' is not an Iterator Record'
			);
		});

		var iterator = {
			next: function next() {}
		};
		var iteratorRecord = makeIteratorRecord(iterator);

		forEach(v.primitives.concat(v.objects), function (nonCompletionRecord) {
			t['throws'](
				function () { ES.AsyncIteratorClose(iteratorRecord, nonCompletionRecord); },
				TypeError,
				debug(nonCompletionRecord) + ' is not a CompletionRecord'
			);
		});

		var sentinel = {};
		var completionRecord = ES.NormalCompletion(sentinel);

		t.test('Promises unsupported', { skip: typeof Promise === 'function' }, function (st) {
			st['throws'](
				function () { ES.AsyncIteratorClose(iteratorRecord, completionRecord); },
				SyntaxError,
				'Promises are not supported'
			);

			st.end();
		});

		t.test('Promises supported', { skip: typeof Promise === 'undefined' }, function (st) {
			st.test('no return method', function (s2t) {
				var nullReturnIterator = {
					next: function next() {},
					'return': null
				};
				var nullReturnIteratorRecord = makeIteratorRecord(nullReturnIterator);

				return Promise.all([
					ES.AsyncIteratorClose(iteratorRecord, completionRecord).then(function (result) {
						s2t.equal(result, completionRecord, 'returns a Promise for the original passed completion record (undefined)');
					}),
					ES.AsyncIteratorClose(nullReturnIteratorRecord, completionRecord).then(function (result) {
						s2t.equal(result, completionRecord, 'returns a Promise for the original passed completion record (null)');
					})
				]);
			});

			st.test('non-function return method', function (s2t) {
				return reduce(
					v.nonFunctions,
					function (prev, nonFunction) {
						if (nonFunction == null) {
							return prev;
						}
						return prev.then(function () {
							var badIterator = {
								next: function next() {},
								'return': nonFunction
							};
							var badIteratorRecord = makeIteratorRecord(badIterator);

							return ES.AsyncIteratorClose(badIteratorRecord, completionRecord).then(
								function (x) {
									throw debug(x) + '/' + debug(nonFunction);
								},
								function (e) {
									s2t.comment('`.return` of ' + debug(nonFunction) + ' is not a function');
								}
							);
						});
					},
					Promise.resolve()
				);
			});

			st.test('function return method (returns object)', function (s2t) {
				var returnableIterator = {
					next: function next() {},
					'return': function Return() {
						s2t.equal(arguments.length, 0, 'no args passed to `.return`');
						return {};
					}
				};
				var returnableRecord = makeIteratorRecord(returnableIterator);

				return ES.AsyncIteratorClose(returnableRecord, completionRecord);
			});

			forEach(v.primitives, function (nonObject) {
				st.test('function return method (returns non-object ' + debug(nonObject) + ')', function (s2t) {
					var returnableIterator = {
						next: function next() {},
						'return': function Return() {
							s2t.equal(arguments.length, 0, 'no args passed to `.return`');
							return nonObject;
						}
					};
					var returnableRecord = makeIteratorRecord(returnableIterator);

					return ES.AsyncIteratorClose(returnableRecord, completionRecord).then(s2t.fail, function (e) {
						s2t.ok(e instanceof TypeError, 'throws on non-object return value');
					});
				});
			});

			st.test('return method throws, completion is normal', function (s2t) {
				var returnThrowIterator = {
					next: function next() {},
					'return': function Return() {
						s2t.equal(arguments.length, 0, 'no args passed to `.return`');
						throw sentinel;
					}
				};
				var returnableRecord = makeIteratorRecord(returnThrowIterator);

				return ES.AsyncIteratorClose(returnableRecord, completionRecord).then(s2t.fail, function (e) {
					s2t.equal(e, sentinel, 'return function exception is propagated');
				});
			});

			st.test('return method throws, completion is throw', function (s2t) {
				var throwCompletion = ES.ThrowCompletion(sentinel);
				var returnThrowIterator = {
					next: function next() {},
					'return': function Return() {
						s2t.equal(arguments.length, 0, 'no args passed to `.return`');
						throw 42;
					}
				};
				var returnableRecord = makeIteratorRecord(returnThrowIterator);

				return ES.AsyncIteratorClose(returnableRecord, throwCompletion).then(s2t.fail, function (e) {
					s2t.equal(e, sentinel, 'return function exception is overridden by throw completion value');
				});
			});

			st.end();
		});

		t.end();
	});

	test('TimeZoneString', function (t) {
		forEach(v.nonNumbers.concat(NaN), function (nonIntegerNumber) {
			t['throws'](
				function () { ES.TimeZoneString(nonIntegerNumber); },
				TypeError,
				debug(nonIntegerNumber) + ' is not a non-NaN Number'
			);
		});

		var d = new Date();

		t.equal(ES.TimeZoneString(Number(d)), d.toTimeString().match(/\((.*)\)$/)[1], 'matches parenthesized part of .toTimeString');

		t.end();
	});
};

var es2019 = function ES2019(ES, ops, expectedMissing, skips) {
	es2018(ES, ops, expectedMissing, assign({}, skips, {
	}));
	var test = makeTest(ES, skips);

	test('AddEntriesFromIterable', function (t) {
		t['throws'](
			function () { ES.AddEntriesFromIterable({}, undefined, function () {}); },
			TypeError,
			'iterable must not be undefined'
		);
		t['throws'](
			function () { ES.AddEntriesFromIterable({}, null, function () {}); },
			TypeError,
			'iterable must not be null'
		);
		forEach(v.nonFunctions, function (nonFunction) {
			t['throws'](
				function () { ES.AddEntriesFromIterable({}, {}, nonFunction); },
				TypeError,
				debug(nonFunction) + ' is not a function'
			);
		});

		t.test('Symbol support', { skip: !v.hasSymbols }, function (st) {
			st.plan(5 + v.primitives.length);

			var O = {};
			st.equal(ES.AddEntriesFromIterable(O, [], function () {}), O, 'returns the target');

			var adder = function (key, value) {
				st.equal(this, O, 'adder gets proper receiver');
				st.equal(key, 0, 'k is key');
				st.equal(value, 'a', 'v is value');
			};
			ES.AddEntriesFromIterable(O, ['a'].entries(), adder);

			forEach(v.primitives, function (primitive) {
				var badIterator = {
					next: function next() {
						return {
							done: false,
							value: primitive
						};
					}
				};
				var badIterable = {};
				badIterable[Symbol.iterator] = function () { return badIterator; };

				st['throws'](
					function () { ES.AddEntriesFromIterable(O, badIterable, adder); },
					TypeError,
					debug(primitive) + ' is not an Object'
				);
			});

			var badder = function (key, value) {
				throw new EvalError(key + value);
			};
			st['throws'](
				function () { ES.AddEntriesFromIterable(O, [[1, 2]], badder); },
				EvalError,
				'bad adder throws'
			);

			st.end();
		});

		t.end();
	});

	test('AsyncFromSyncIteratorContinuation', function (t) {
		forEach(v.primitives, function (primitive) {
			t['throws'](
				function () { ES.AsyncFromSyncIteratorContinuation(primitive); },
				TypeError,
				debug(primitive) + ' is not an Object'
			);
		});

		t['throws'](
			function () { ES.AsyncFromSyncIteratorContinuation({}, null); },
			SyntaxError,
			'despite the spec supporting 2 args, AsyncFromSyncIteratorContinuation only takes 1'
		);

		// TODO: test directly, instead of only implicitly via CreateAsyncFromSyncIterator

		t.end();
	});

	test('AsyncFromSyncIteratorContinuation', function (t) {
		forEach(v.primitives, function (nonObject) {
			t['throws'](
				function () { ES.AsyncFromSyncIteratorContinuation(nonObject); },
				TypeError,
				debug(nonObject) + ' is not an Object'
			);
		});

		t['throws'](
			function () { ES.AsyncFromSyncIteratorContinuation({}, null); },
			SyntaxError,
			'passing a promisecapability is not supported in es-abstract'
		);

		t.end();
	});

	test('FlattenIntoArray', function (t) {
		t.test('no mapper function', function (st) {
			var testDepth = function testDepth(tt, depth, expected) {
				var a = [];
				var o = [[1], 2, , [[3]], [], 4, [[[[5]]]]]; // eslint-disable-line no-sparse-arrays
				ES.FlattenIntoArray(a, o, o.length, 0, depth);
				tt.deepEqual(a, expected, 'depth: ' + depth);
			};

			testDepth(st, 1, [1, 2, [3], 4, [[[5]]]]);
			testDepth(st, 2, [1, 2, 3, 4, [[5]]]);
			testDepth(st, 3, [1, 2, 3, 4, [5]]);
			testDepth(st, 4, [1, 2, 3, 4, 5]);
			testDepth(st, Infinity, [1, 2, 3, 4, 5]);
			st.end();
		});

		t.test('mapper function', function (st) {
			var testMapper = function testMapper(tt, mapper, expected, thisArg) {
				var a = [];
				var o = [[1], 2, , [[3]], [], 4, [[[[5]]]]]; // eslint-disable-line no-sparse-arrays
				ES.FlattenIntoArray(a, o, o.length, 0, 1, mapper, thisArg);
				tt.deepEqual(a, expected);
			};

			st['throws'](
				function () {
					var o = [[1], 2, , [[3]], [], 4, [[[[5]]]]]; // eslint-disable-line no-sparse-arrays
					ES.FlattenIntoArray([], o, o.length, 0, 1, function () {});
				},
				TypeError,
				'missing thisArg throws'
			);

			var double = function double(x) {
				return typeof x === 'number' ? 2 * x : x;
			};
			testMapper(
				st,
				double,
				[1, 4, [3], 8, [[[5]]]]
			);
			var receiver = hasStrictMode ? 42 : Object(42);
			testMapper(
				st,
				function (x) { return [this, double(x)]; },
				[receiver, [1], receiver, 4, receiver, [[3]], receiver, [], receiver, 8, receiver, [[[[5]]]]],
				42
			);
			st.end();
		});

		t.end();
	});

	test('TrimString', function (t) {
		t.test('non-object string', function (st) {
			forEach(v.nullPrimitives, function (nullish) {
				st['throws'](
					function () { ES.TrimString(nullish); },
					debug(nullish) + ' is not an Object'
				);
			});
			st.end();
		});

		t['throws'](
			function () { ES.TrimString('abc', 'not start, end, or start+end'); },
			TypeError,
			'invalid `where` value'
		);

		var string = ' \n abc  \n ';
		t.equal(ES.TrimString(string, 'start'), string.slice(string.indexOf('a')));
		t.equal(ES.TrimString(string, 'end'), string.slice(0, string.lastIndexOf('c') + 1));
		t.equal(ES.TrimString(string, 'start+end'), string.slice(string.indexOf('a'), string.lastIndexOf('c') + 1));

		t.end();
	});
};

var es2020 = function ES2020(ES, ops, expectedMissing, skips) {
	es2019(ES, ops, expectedMissing, assign({}, skips, {
		CopyDataProperties: true,
		GetIterator: true,
		GetValueFromBuffer: true,
		NumberToRawBytes: true,
		NumberToString: true,
		ObjectCreate: true,
		RawBytesToNumber: true,
		SameValueNonNumber: true,
		SetValueInBuffer: true,
		ToInteger: true,
		ToNumber: true,
		UTF16Decode: true
	}));
	var test = makeTest(ES, skips);

	test('Abstract Equality Comparison', { skip: !hasBigInts }, function (t) {
		t.equal(
			ES['Abstract Equality Comparison'](BigInt(1), 1),
			true,
			debug(BigInt(1)) + ' == ' + debug(1)
		);
		t.equal(
			ES['Abstract Equality Comparison'](1, BigInt(1)),
			true,
			debug(1) + ' == ' + debug(BigInt(1))
		);
		t.equal(
			ES['Abstract Equality Comparison'](BigInt(1), 1.1),
			false,
			debug(BigInt(1)) + ' != ' + debug(1.1)
		);
		t.equal(
			ES['Abstract Equality Comparison'](1.1, BigInt(1)),
			false,
			debug(1.1) + ' != ' + debug(BigInt(1))
		);

		t.equal(
			ES['Abstract Equality Comparison'](BigInt(1), '1'),
			true,
			debug(BigInt(1)) + ' == ' + debug('1')
		);
		t.equal(
			ES['Abstract Equality Comparison']('1', BigInt(1)),
			true,
			debug(1) + ' == ' + debug(BigInt('1'))
		);
		t.equal(
			ES['Abstract Equality Comparison'](BigInt(1), '1.1'),
			false,
			debug(BigInt(1)) + ' != ' + debug('1.1')
		);
		t.equal(
			ES['Abstract Equality Comparison']('1.1', BigInt(1)),
			false,
			debug('1.1') + ' != ' + debug(BigInt(1))
		);

		var bigIntObject = {
			valueOf: function () { return BigInt(1); }
		};
		t.equal(
			ES['Abstract Equality Comparison'](BigInt(1), bigIntObject),
			true,
			debug(BigInt(1)) + ' == ' + debug(bigIntObject)
		);
		t.equal(
			ES['Abstract Equality Comparison'](bigIntObject, BigInt(1)),
			true,
			debug(bigIntObject) + ' == ' + debug(BigInt('1'))
		);
		t.equal(
			ES['Abstract Equality Comparison'](BigInt(1), v.coercibleObject),
			false,
			debug(BigInt(1)) + ' != ' + debug(v.coercibleObject)
		);
		t.equal(
			ES['Abstract Equality Comparison'](v.coercibleObject, BigInt(1)),
			false,
			debug(bigIntObject) + ' != ' + debug(BigInt(1))
		);

		forEach([NaN, Infinity, -Infinity], function (nonFinite) {
			t.equal(
				ES['Abstract Equality Comparison'](BigInt(1), nonFinite),
				false,
				debug(BigInt(1)) + ' != ' + debug(nonFinite)
			);
			t.equal(
				ES['Abstract Equality Comparison'](nonFinite, BigInt(1)),
				false,
				debug(nonFinite) + ' != ' + debug(BigInt(1))
			);
		});

		t.end();
	});

	test('Abstract Relational Comparison', { skip: !hasBigInts }, function (t) {
		t.equal(ES['Abstract Relational Comparison']($BigInt(0), '1', true), true, 'LeftFirst: 0n is less than "1"');
		t.equal(ES['Abstract Relational Comparison']('1', $BigInt(0), true), false, 'LeftFirst: "1" is not less than 0n');
		t.equal(ES['Abstract Relational Comparison']($BigInt(0), '1', false), true, '!LeftFirst: 0n is less than "1"');
		t.equal(ES['Abstract Relational Comparison']('1', $BigInt(0), false), false, '!LeftFirst: "1" is not less than 0n');

		t.equal(ES['Abstract Relational Comparison']($BigInt(0), 1, true), true, 'LeftFirst: 0n is less than 1');
		t.equal(ES['Abstract Relational Comparison'](1, $BigInt(0), true), false, 'LeftFirst: 1 is not less than 0n');
		t.equal(ES['Abstract Relational Comparison']($BigInt(0), 1, false), true, '!LeftFirst: 0n is less than 1');
		t.equal(ES['Abstract Relational Comparison'](1, $BigInt(0), false), false, '!LeftFirst: 1 is not less than 0n');

		t.equal(ES['Abstract Relational Comparison']($BigInt(0), $BigInt(1), true), true, 'LeftFirst: 0n is less than 1n');
		t.equal(ES['Abstract Relational Comparison']($BigInt(1), $BigInt(0), true), false, 'LeftFirst: 1n is not less than 0n');
		t.equal(ES['Abstract Relational Comparison']($BigInt(0), $BigInt(1), false), true, '!LeftFirst: 0n is less than 1n');
		t.equal(ES['Abstract Relational Comparison']($BigInt(1), $BigInt(0), false), false, '!LeftFirst: 1n is not less than 0n');

		t.equal(ES['Abstract Relational Comparison']($BigInt(0), 'NaN', true), undefined, 'LeftFirst: 0n and "NaN" produce `undefined`');
		t.equal(ES['Abstract Relational Comparison']('NaN', $BigInt(0), true), undefined, 'LeftFirst: "NaN" and 0n produce `undefined`');
		t.equal(ES['Abstract Relational Comparison']($BigInt(0), 'NaN', false), undefined, '!LeftFirst: 0n and "NaN" produce `undefined`');
		t.equal(ES['Abstract Relational Comparison']('NaN', $BigInt(0), false), undefined, '!LeftFirst: "NaN" and 0n produce `undefined`');

		t.equal(ES['Abstract Relational Comparison']($BigInt(0), NaN, true), undefined, 'LeftFirst: 0n and NaN produce `undefined`');
		t.equal(ES['Abstract Relational Comparison'](NaN, $BigInt(0), true), undefined, 'LeftFirst: NaN and 0n produce `undefined`');
		t.equal(ES['Abstract Relational Comparison']($BigInt(0), NaN, false), undefined, '!LeftFirst: 0n and NaN produce `undefined`');
		t.equal(ES['Abstract Relational Comparison'](NaN, $BigInt(0), false), undefined, '!LeftFirst: NaN and 0n produce `undefined`');

		t.equal(ES['Abstract Relational Comparison']($BigInt(0), Infinity, true), true, 'LeftFirst: 0n is less than Infinity');
		t.equal(ES['Abstract Relational Comparison'](Infinity, $BigInt(0), true), false, 'LeftFirst: Infinity is not less than 0n');
		t.equal(ES['Abstract Relational Comparison']($BigInt(0), Infinity, false), true, '!LeftFirst: 0n is less than Infinity');
		t.equal(ES['Abstract Relational Comparison'](Infinity, $BigInt(0), false), false, '!LeftFirst: Infinity is not less than 0n');

		t.equal(ES['Abstract Relational Comparison']($BigInt(0), -Infinity, true), false, 'LeftFirst: 0n is not less than -Infinity');
		t.equal(ES['Abstract Relational Comparison'](-Infinity, $BigInt(0), true), true, 'LeftFirst: -Infinity is less than 0n');
		t.equal(ES['Abstract Relational Comparison']($BigInt(0), -Infinity, false), false, '!LeftFirst: 0n is not less than -Infinity');
		t.equal(ES['Abstract Relational Comparison'](-Infinity, $BigInt(0), false), true, '!LeftFirst: -Infinity is less than 0n');

		t.end();
	});

	test('BigInt::add', { skip: !hasBigInts }, function (t) {
		forEach(v.nonBigInts, function (nonBigInt) {
			t['throws'](
				function () { ES.BigInt.add(nonBigInt, 0); },
				TypeError,
				'x: ' + debug(nonBigInt) + ' is not a BigInt'
			);
			t['throws'](
				function () { ES.BigInt.add(0, nonBigInt); },
				TypeError,
				'y: ' + debug(nonBigInt) + ' is not a BigInt'
			);
		});

		t.equal(ES.BigInt.add($BigInt(0), $BigInt(0)), $BigInt(0), '0n + 0n is 0n');

		forEach(v.bigints, function (bigint) {
			if (bigint !== $BigInt(0)) {
				t.equal(ES.BigInt.add(bigint, $BigInt(0)), bigint, debug(bigint) + ' + 0n adds to ' + bigint);
			}
			t.equal(ES.BigInt.add(bigint, $BigInt(1)), bigint + $BigInt(1), debug(bigint) + ' + 1n adds to ' + (bigint + $BigInt(1)));
			t.equal(ES.BigInt.add(bigint, -$BigInt(42)), bigint - $BigInt(42), debug(bigint) + ' + -42n adds to ' + (bigint - $BigInt(42)));
		});

		t.end();
	});

	test('BigInt::bitwiseAND', { skip: !hasBigInts }, function (t) {
		forEach(v.nonBigInts, function (nonBigInt) {
			t['throws'](
				function () { ES.BigInt.bitwiseAND(nonBigInt, $BigInt(0)); },
				TypeError,
				'x: ' + debug(nonBigInt) + ' is not a BigInt'
			);
			t['throws'](
				function () { ES.BigInt.bitwiseAND($BigInt(0), nonBigInt); },
				TypeError,
				'y: ' + debug(nonBigInt) + ' is not a BigInt'
			);
		});

		t.equal(ES.BigInt.bitwiseAND($BigInt(1), $BigInt(2)), $BigInt(1) & $BigInt(2));

		t.end();
	});

	test('BigInt::bitwiseNOT', function (t) {
		forEach(v.nonBigInts, function (nonBigInt) {
			t['throws'](
				function () { ES.BigInt.bitwiseNOT(nonBigInt); },
				TypeError,
				debug(nonBigInt) + ' is not a BigInt'
			);
		});

		t.test('actual BigInts', { skip: !hasBigInts }, function (st) {
			forEach(v.int32s, function (int32) {
				var bigInt32 = $BigInt(int32);
				st.equal(ES.BigInt.bitwiseNOT(bigInt32), ~bigInt32, debug(bigInt32) + ' becomes ~' + debug(bigInt32));
			});
			st.end();
		});

		t.end();
	});

	test('BigInt::bitwiseOR', { skip: !hasBigInts }, function (t) {
		forEach(v.nonBigInts, function (nonBigInt) {
			t['throws'](
				function () { ES.BigInt.bitwiseOR(nonBigInt, $BigInt(0)); },
				TypeError,
				'x: ' + debug(nonBigInt) + ' is not a BigInt'
			);
			t['throws'](
				function () { ES.BigInt.bitwiseOR($BigInt(0), nonBigInt); },
				TypeError,
				'y: ' + debug(nonBigInt) + ' is not a BigInt'
			);
		});

		t.equal(ES.BigInt.bitwiseOR($BigInt(1), $BigInt(2)), $BigInt(1) | $BigInt(2));

		t.end();
	});

	test('BigInt::bitwiseXOR', { skip: !hasBigInts }, function (t) {
		forEach(v.nonBigInts, function (nonBigInt) {
			t['throws'](
				function () { ES.BigInt.bitwiseXOR(nonBigInt, $BigInt(0)); },
				TypeError,
				'x: ' + debug(nonBigInt) + ' is not a BigInt'
			);
			t['throws'](
				function () { ES.BigInt.bitwiseXOR($BigInt(0), nonBigInt); },
				TypeError,
				'y: ' + debug(nonBigInt) + ' is not a BigInt'
			);
		});

		t.equal(ES.BigInt.bitwiseXOR($BigInt(1), $BigInt(2)), $BigInt(1) ^ $BigInt(2));

		t.end();
	});

	test('BigInt::divide', { skip: !hasBigInts }, function (t) {
		forEach(v.nonBigInts, function (nonBigInt) {
			t['throws'](
				function () { ES.BigInt.divide(nonBigInt, $BigInt(0)); },
				TypeError,
				'x: ' + debug(nonBigInt) + ' is not a BigInt'
			);
			t['throws'](
				function () { ES.BigInt.divide($BigInt(0), nonBigInt); },
				TypeError,
				'y: ' + debug(nonBigInt) + ' is not a BigInt'
			);
		});

		t['throws'](
			function () { ES.BigInt.divide($BigInt(1), $BigInt(0)); },
			RangeError,
			'dividing by zero throws'
		);

		forEach(v.bigints, function (bigint) {
			if (bigint !== $BigInt(0)) {
				t.equal(ES.BigInt.divide(bigint, bigint), $BigInt(1), debug(bigint) + ' divided by itself is 1n');
				t.equal(ES.BigInt.divide(bigint, $BigInt(2)), bigint / $BigInt(2), debug(bigint) + ' divided by 2n is half itself');
			}
		});

		t.end();
	});

	test('BigInt::equal', { skip: !hasBigInts }, function (t) {
		forEach(v.nonBigInts, function (nonBigInt) {
			t['throws'](
				function () { ES.BigInt.equal(nonBigInt, $BigInt(0)); },
				TypeError,
				'x: ' + debug(nonBigInt) + ' is not a BigInt'
			);
			t['throws'](
				function () { ES.Number.equal($BigInt(0), nonBigInt); },
				TypeError,
				'y: ' + debug(nonBigInt) + ' is not a Number'
			);
		});

		forEach(v.bigints, function (bigint) {
			if (BigInt !== $BigInt(0)) {
				t.equal(ES.BigInt.equal(bigint, bigint), true, debug(bigint) + ' is equal to itself');
				t.equal(ES.BigInt.equal(bigint, bigint + $BigInt(1)), false, debug(bigint) + ' is not equal to itself plus 1n');
			}
		});

		t.end();
	});

	test('BigInt::exponentiate', { skip: !hasBigInts }, function (t) {
		forEach(v.nonBigInts, function (nonBigInt) {
			t['throws'](
				function () { ES.BigInt.exponentiate(nonBigInt, $BigInt(0)); },
				TypeError,
				'base: ' + debug(nonBigInt) + ' is not a BigInt'
			);
			t['throws'](
				function () { ES.BigInt.exponentiate($BigInt(0), nonBigInt); },
				TypeError,
				'exponent: ' + debug(nonBigInt) + ' is not a BigInt'
			);
		});

		t['throws'](
			function () { ES.BigInt.exponentiate($BigInt(1), -$BigInt(1)); },
			RangeError,
			'negative exponent throws'
		);

		forEach(v.bigints, function (bigint) {
			if (bigint !== $BigInt(0)) {
				t.equal(ES.BigInt.exponentiate(bigint, $BigInt(0)), $BigInt(1), debug(bigint) + ' ** 0n is 1n');

				var square = bigint;
				for (var i = 0; i < Number(bigint); i += 1) {
					square += bigint;
				}
				t.equal(ES.BigInt.exponentiate(bigint, bigint), square, debug(bigint) + ' ** ' + debug(bigint) + ' is equal to ' + debug(square));
			}
		});

		t.end();
	});

	test('BigInt::leftShift', { skip: !hasBigInts }, function (t) {
		forEach(v.nonBigInts, function (nonBigInt) {
			t['throws'](
				function () { ES.BigInt.leftShift(nonBigInt, $BigInt(0)); },
				TypeError,
				'x: ' + debug(nonBigInt) + ' is not a BigInt'
			);
			t['throws'](
				function () { ES.BigInt.leftShift($BigInt(0), nonBigInt); },
				TypeError,
				'y: ' + debug(nonBigInt) + ' is not a BigInt'
			);
		});

		forEach([0].concat(v.int32s), function (int32) {
			var bigInt32 = $BigInt(int32);
			forEach([1, 3, 5, 31, 32, 33], function (bits) {
				var bitsN = $BigInt(bits);
				t.equal(
					ES.BigInt.leftShift(bigInt32, bitsN),
					bigInt32 << bitsN,
					debug(bigInt32) + ' << ' + debug(bitsN) + ' is ' + debug(bigInt32 << bitsN)
				);
			});
		});

		t.end();
	});

	test('BigInt::lessThan', { skip: !hasBigInts }, function (t) {
		forEach(v.nonBigInts, function (nonBigInt) {
			t['throws'](
				function () { ES.BigInt.lessThan(nonBigInt, $BigInt(0)); },
				TypeError,
				'x: ' + debug(nonBigInt) + ' is not a BigInt'
			);
			t['throws'](
				function () { ES.BigInt.lessThan($BigInt(0), nonBigInt); },
				TypeError,
				'y: ' + debug(nonBigInt) + ' is not a BigInt'
			);
		});

		t.equal(ES.BigInt.lessThan($BigInt(0), $BigInt(0)), false, '0n < 0n is false');

		forEach(v.bigints, function (bigint) {
			t.equal(ES.BigInt.lessThan(bigint, bigint), false, debug(bigint) + ' is not less than itself');

			t.equal(ES.BigInt.lessThan(bigint, bigint + $BigInt(1)), true, debug(bigint) + ' < ' + debug(bigint + $BigInt(1)) + ' is true');
			t.equal(ES.BigInt.lessThan(bigint + $BigInt(1), bigint), false, debug(bigint + $BigInt(1)) + ' < ' + debug(bigint) + ' is false');
		});

		t.end();
	});

	test('BigInt::multiply', { skip: !hasBigInts }, function (t) {
		forEach(v.nonBigInts, function (nonBigInt) {
			t['throws'](
				function () { ES.BigInt.multiply(nonBigInt, $BigInt(0)); },
				TypeError,
				'x: ' + debug(nonBigInt) + ' is not a BigInt'
			);
			t['throws'](
				function () { ES.BigInt.multiply($BigInt(0), nonBigInt); },
				TypeError,
				'y: ' + debug(nonBigInt) + ' is not a Number'
			);
		});

		t.equal(ES.BigInt.multiply($BigInt(0), $BigInt(0)), $BigInt(0), '0n * 0n is 0n');

		forEach(v.bigints, function (bigint) {
			if (bigint !== $BigInt(0)) {
				t.equal(ES.BigInt.multiply(bigint, $BigInt(0)), $BigInt(0), debug(bigint) + ' * 0n produces 0n');
				t.equal(ES.BigInt.multiply(bigint, $BigInt(1)), bigint, debug(bigint) + ' * 1n produces itself');
				t.equal(ES.BigInt.multiply(bigint, -$BigInt(42)), bigint * -$BigInt(42), debug(bigint) + ' * -42n produces ' + (bigint - $BigInt(42)));
			}
		});

		t.end();
	});

	test('BigInt::remainder', { skip: !hasBigInts }, function (t) {
		forEach(v.nonBigInts, function (nonBigInt) {
			t['throws'](
				function () { ES.BigInt.remainder(nonBigInt, $BigInt(0)); },
				TypeError,
				'x: ' + debug(nonBigInt) + ' is not a BigInt'
			);
			t['throws'](
				function () { ES.BigInt.remainder($BigInt(0), nonBigInt); },
				TypeError,
				'y: ' + debug(nonBigInt) + ' is not a BigInt'
			);
		});

		t['throws'](
			function () { ES.BigInt.remainder($BigInt(1), $BigInt(0)); },
			RangeError,
			'dividing by zero throws'
		);

		forEach(v.bigints, function (bigint) {
			if (bigint !== $BigInt(0)) {
				t.equal(
					ES.BigInt.remainder($BigInt(0), bigint),
					$BigInt(0),
					'0n % ' + debug(bigint) + ' is 0n'
				);
				t.equal(
					ES.BigInt.remainder(bigint + $BigInt(1), bigint),
					$BigInt(1),
					debug(bigint) + ' % ' + debug(bigint + $BigInt(1)) + ' is 1n'
				);
			}
		});

		t.end();
	});

	test('BigInt::sameValue', { skip: !hasBigInts }, function (t) {
		forEach(v.nonBigInts, function (nonBigInt) {
			t['throws'](
				function () { ES.BigInt.sameValue(nonBigInt, $BigInt(0)); },
				TypeError,
				'x: ' + debug(nonBigInt) + ' is not a BigInt'
			);
			t['throws'](
				function () { ES.BigInt.sameValue($BigInt(0), nonBigInt); },
				TypeError,
				'y: ' + debug(nonBigInt) + ' is not a BigInt'
			);
		});

		t.equal(ES.BigInt.sameValue($BigInt(0), $BigInt(0)), true, '0n is sameValue as 0n');

		forEach(v.bigints, function (bigint) {
			t.ok(ES.BigInt.sameValue(bigint, bigint), debug(bigint) + ' is the sameValue as itself');
		});

		t.end();
	});

	test('BigInt::sameValueZero', { skip: !hasBigInts }, function (t) {
		forEach(v.nonBigInts, function (nonBigInt) {
			t['throws'](
				function () { ES.BigInt.sameValueZero(nonBigInt, $BigInt(0)); },
				TypeError,
				'x: ' + debug(nonBigInt) + ' is not a BigInt'
			);
			t['throws'](
				function () { ES.BigInt.sameValueZero($BigInt(0), nonBigInt); },
				TypeError,
				'y: ' + debug(nonBigInt) + ' is not a BigInt'
			);
		});

		forEach(v.bigints, function (bigint) {
			t.ok(ES.BigInt.sameValueZero(bigint, bigint), debug(bigint) + ' is the sameValueZero as itself');
		});

		t.end();
	});

	test('BigInt::signedRightShift', { skip: !hasBigInts }, function (t) {
		forEach(v.nonBigInts, function (nonBigInt) {
			t['throws'](
				function () { ES.BigInt.signedRightShift(nonBigInt, $BigInt(0)); },
				TypeError,
				'x: ' + debug(nonBigInt) + ' is not a BigInt'
			);
			t['throws'](
				function () { ES.BigInt.signedRightShift($BigInt(0), nonBigInt); },
				TypeError,
				'y: ' + debug(nonBigInt) + ' is not a BigInt'
			);
		});

		forEach([0].concat(v.int32s), function (int32) {
			var bigInt32 = $BigInt(int32);
			forEach([1, 3, 5, 31, 32, 33], function (bits) {
				var bitsN = $BigInt(bits);
				t.equal(
					ES.BigInt.signedRightShift(bigInt32, bitsN),
					bigInt32 >> bitsN,
					debug(bigInt32) + ' >> ' + debug(bitsN) + ' is ' + debug(bigInt32 >> bitsN)
				);
			});
		});

		t.end();
	});

	test('BigInt::subtract', { skip: !hasBigInts }, function (t) {
		forEach(v.nonBigInts, function (nonBigInt) {
			t['throws'](
				function () { ES.BigInt.subtract(nonBigInt, $BigInt(0)); },
				TypeError,
				'x: ' + debug(nonBigInt) + ' is not a BigInt'
			);
			t['throws'](
				function () { ES.BigInt.subtract($BigInt(0), nonBigInt); },
				TypeError,
				'y: ' + debug(nonBigInt) + ' is not a BigInt'
			);
		});

		t.equal(ES.BigInt.subtract($BigInt(0), $BigInt(0)), $BigInt(0), '0n - 0n is 0n');

		forEach(v.bigints, function (bigint) {
			t.equal(ES.BigInt.subtract(bigint, $BigInt(0)), bigint, debug(bigint) + ' - 0n produces ' + bigint);
			t.equal(ES.BigInt.subtract(bigint, $BigInt(1)), bigint - $BigInt(1), debug(bigint) + ' - 1n produces ' + (bigint + $BigInt(1)));
			t.equal(ES.BigInt.subtract(bigint, $BigInt(42)), bigint - $BigInt(42), debug(bigint) + ' - 42n produces ' + (bigint - $BigInt(42)));
		});

		t.end();
	});

	test('BigInt::toString', function (t) {
		forEach(v.nonBigInts, function (nonBigInt) {
			t['throws'](
				function () { ES.BigInt.toString(nonBigInt); },
				TypeError,
				debug(nonBigInt) + ' is not a BigInt'
			);
		});

		forEach(v.bigints, function (bigint) {
			t.equal(ES.BigInt.toString(bigint), String(bigint), debug(bigint) + ' stringifies to ' + bigint);
		});

		t.end();
	});

	test('BigInt::unaryMinus', function (t) {
		forEach(v.nonBigInts, function (nonBigInt) {
			t['throws'](
				function () { ES.BigInt.unaryMinus(nonBigInt); },
				TypeError,
				debug(nonBigInt) + ' is not a BigInt'
			);
		});

		t.test('actual BigInts', { skip: !hasBigInts }, function (st) {
			forEach(v.bigints, function (bigint) {
				st.equal(ES.BigInt.unaryMinus(bigint), -bigint, debug(bigint) + ' produces -' + debug(bigint));
			});
			st.end();
		});

		t.end();
	});

	test('BigInt::unsignedRightShift', { skip: !hasBigInts }, function (t) {
		forEach(v.nonBigInts, function (nonBigInt) {
			t['throws'](
				function () { ES.BigInt.unsignedRightShift(nonBigInt, $BigInt(0)); },
				TypeError,
				'x: ' + debug(nonBigInt) + ' is not a BigInt'
			);
			t['throws'](
				function () { ES.BigInt.unsignedRightShift($BigInt(0), nonBigInt); },
				TypeError,
				'y: ' + debug(nonBigInt) + ' is not a BigInt'
			);
		});

		forEach([0].concat(v.int32s), function (int32) {
			var bigInt32 = $BigInt(int32);
			forEach([1, 3, 5, 31, 32, 33], function (bits) {
				var bitsN = $BigInt(bits);
				t['throws'](
					function () { ES.BigInt.unsignedRightShift(bigInt32, bitsN); },
					TypeError,
					debug(bigInt32) + ' >>> ' + debug(bitsN) + ' throws'
				);
			});
		});

		t.end();
	});

	test('BigIntBitwiseOp', function (t) {
		forEach(v.numbers, function (number) {
			t['throws'](
				function () { ES.BigIntBitwiseOp('&', number, number); },
				TypeError,
				debug(number) + ' is not a BigInt'
			);
		});

		t.test('BigInt support', { skip: !hasBigInts }, function (st) {
			st['throws'](
				function () { ES.BigIntBitwiseOp('&', 1, BigInt(1)); },
				TypeError,
				'x: 1 is not a BigInt'
			);
			st['throws'](
				function () { ES.BigIntBitwiseOp('&', BigInt(1), 1); },
				TypeError,
				'y: 1 is not a BigInt'
			);

			st['throws'](
				function () { ES.BigIntBitwiseOp('invalid', BigInt(0), BigInt(0)); },
				TypeError,
				'throws with an invalid op'
			);

			st.equal(ES.BigIntBitwiseOp('&', BigInt(1), BigInt(2)), BigInt(1) & BigInt(2));
			st.equal(ES.BigIntBitwiseOp('|', BigInt(1), BigInt(2)), BigInt(1) | BigInt(2));
			st.equal(ES.BigIntBitwiseOp('^', BigInt(1), BigInt(2)), BigInt(1) ^ BigInt(2));

			st.end();
		});

		t.end();
	});

	test('BinaryAnd', function (t) {
		t.equal(ES.BinaryAnd(0, 0), 0);
		t.equal(ES.BinaryAnd(0, 1), 0);
		t.equal(ES.BinaryAnd(1, 0), 0);
		t.equal(ES.BinaryAnd(1, 1), 1);

		forEach(v.nonIntegerNumbers.concat(v.nonNumberPrimitives, v.objects), function (nonBit) {
			t['throws'](
				function () { ES.BinaryAnd(0, nonBit); },
				TypeError
			);
			t['throws'](
				function () { ES.BinaryAnd(nonBit, 1); },
				TypeError
			);
		});
		t.end();
	});

	test('BinaryOr', function (t) {
		t.equal(ES.BinaryOr(0, 0), 0);
		t.equal(ES.BinaryOr(0, 1), 1);
		t.equal(ES.BinaryOr(1, 0), 1);
		t.equal(ES.BinaryOr(1, 1), 1);

		forEach(v.nonIntegerNumbers.concat(v.nonNumberPrimitives, v.objects), function (nonBit) {
			t['throws'](
				function () { ES.BinaryOr(0, nonBit); },
				TypeError
			);
			t['throws'](
				function () { ES.BinaryOr(nonBit, 1); },
				TypeError
			);
		});
		t.end();
	});

	test('BinaryXor', function (t) {
		t.equal(ES.BinaryXor(0, 0), 0);
		t.equal(ES.BinaryXor(0, 1), 1);
		t.equal(ES.BinaryXor(1, 0), 1);
		t.equal(ES.BinaryXor(1, 1), 0);

		forEach(v.nonIntegerNumbers.concat(v.nonNumberPrimitives, v.objects), function (nonBit) {
			t['throws'](
				function () { ES.BinaryXor(0, nonBit); },
				TypeError
			);
			t['throws'](
				function () { ES.BinaryXor(nonBit, 1); },
				TypeError
			);
		});
		t.end();
	});

	test('CodePointAt', function (t) {
		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { ES.CodePointAt(nonString, 0); },
				TypeError,
				debug(nonString) + ' is not a String'
			);
		});

		t['throws'](
			function () { ES.CodePointAt('abc', -1); },
			TypeError,
			'requires an index >= 0'
		);
		t['throws'](
			function () { ES.CodePointAt('abc', 3); },
			TypeError,
			'requires an index < string length'
		);

		t.deepEqual(ES.CodePointAt('abc', 0), {
			'[[CodePoint]]': 'a',
			'[[CodeUnitCount]]': 1,
			'[[IsUnpairedSurrogate]]': false
		});
		t.deepEqual(ES.CodePointAt('abc', 1), {
			'[[CodePoint]]': 'b',
			'[[CodeUnitCount]]': 1,
			'[[IsUnpairedSurrogate]]': false
		});
		t.deepEqual(ES.CodePointAt('abc', 2), {
			'[[CodePoint]]': 'c',
			'[[CodeUnitCount]]': 1,
			'[[IsUnpairedSurrogate]]': false
		});

		var strWithHalfPoo = 'a' + leadingPoo + 'c';
		var strWithWholePoo = 'a' + wholePoo + 'd';

		t.deepEqual(ES.CodePointAt(strWithHalfPoo, 0), {
			'[[CodePoint]]': 'a',
			'[[CodeUnitCount]]': 1,
			'[[IsUnpairedSurrogate]]': false
		});
		t.deepEqual(ES.CodePointAt(strWithHalfPoo, 1), {
			'[[CodePoint]]': leadingPoo,
			'[[CodeUnitCount]]': 1,
			'[[IsUnpairedSurrogate]]': true
		});
		t.deepEqual(ES.CodePointAt(strWithHalfPoo, 2), {
			'[[CodePoint]]': 'c',
			'[[CodeUnitCount]]': 1,
			'[[IsUnpairedSurrogate]]': false
		});

		t.deepEqual(ES.CodePointAt(strWithWholePoo, 0), {
			'[[CodePoint]]': 'a',
			'[[CodeUnitCount]]': 1,
			'[[IsUnpairedSurrogate]]': false
		});
		t.deepEqual(ES.CodePointAt(strWithWholePoo, 1), {
			'[[CodePoint]]': wholePoo,
			'[[CodeUnitCount]]': 2,
			'[[IsUnpairedSurrogate]]': false
		});
		t.deepEqual(ES.CodePointAt(strWithWholePoo, 2), {
			'[[CodePoint]]': trailingPoo,
			'[[CodeUnitCount]]': 1,
			'[[IsUnpairedSurrogate]]': true
		});
		t.deepEqual(ES.CodePointAt(strWithWholePoo, 3), {
			'[[CodePoint]]': 'd',
			'[[CodeUnitCount]]': 1,
			'[[IsUnpairedSurrogate]]': false
		});

		t.end();
	});

	test('CopyDataProperties', function (t) {
		t.test('first argument: target', function (st) {
			forEach(v.primitives, function (primitive) {
				st['throws'](
					function () { ES.CopyDataProperties(primitive, {}, []); },
					TypeError,
					debug(primitive) + ' is not an Object'
				);
			});
			st.end();
		});

		t.test('second argument: source', function (st) {
			var frozenTarget = Object.freeze ? Object.freeze({}) : {};
			forEach(v.nullPrimitives, function (nullish) {
				st.equal(
					ES.CopyDataProperties(frozenTarget, nullish, []),
					frozenTarget,
					debug(nullish) + ' "source" yields identical, unmodified target'
				);
			});

			forEach(v.nonNullPrimitives, function (objectCoercible) {
				var target = {};
				var result = ES.CopyDataProperties(target, objectCoercible, []);
				st.equal(result, target, 'result === target');
				st.deepEqual(keys(result), keys(Object(objectCoercible)), 'target ends up with keys of ' + debug(objectCoercible));
			});

			st.test('enumerable accessor property', { skip: !$defineProperty }, function (s2t) {
				var target = {};
				var source = {};
				defineProperty(source, 'a', {
					enumerable: true,
					get: function () { return 42; }
				});
				var result = ES.CopyDataProperties(target, source, []);
				s2t.equal(result, target, 'result === target');
				s2t.deepEqual(result, { a: 42 }, 'target ends up with enumerable accessor of source');
				s2t.end();
			});

			st.end();
		});

		t.test('third argument: excludedItems', function (st) {
			forEach(v.objects.concat(v.primitives), function (nonArray) {
				st['throws'](
					function () { ES.CopyDataProperties({}, {}, nonArray); },
					TypeError,
					debug(nonArray) + ' is not an Array'
				);
			});

			forEach(v.nonPropertyKeys, function (nonPropertyKey) {
				st['throws'](
					function () { ES.CopyDataProperties({}, {}, [nonPropertyKey]); },
					TypeError,
					debug(nonPropertyKey) + ' is not a Property Key'
				);
			});

			var result = ES.CopyDataProperties({}, { a: 1, b: 2, c: 3 }, ['b']);
			st.deepEqual(keys(result).sort(), ['a', 'c'].sort(), 'excluded string keys are excluded');

			st.test('excluding symbols', { skip: !v.hasSymbols }, function (s2t) {
				var source = {};
				forEach(v.symbols, function (symbol) {
					source[symbol] = true;
				});

				var includedSymbols = v.symbols.slice(1);
				var excludedSymbols = v.symbols.slice(0, 1);
				var target = ES.CopyDataProperties({}, source, excludedSymbols);

				forEach(includedSymbols, function (symbol) {
					s2t.equal(hasOwn(target, symbol), true, debug(symbol) + ' is included');
				});

				forEach(excludedSymbols, function (symbol) {
					s2t.equal(hasOwn(target, symbol), false, debug(symbol) + ' is excluded');
				});

				s2t.end();
			});

			st.end();
		});

		// TODO: CopyDataProperties throws when copying fails

		t.end();
	});

	test('CreateListFromArrayLike', { skip: !hasBigInts }, function (t) {
		t.deepEqual(
			ES.CreateListFromArrayLike({ length: 2, 0: BigInt(1), 1: 'b', 2: 'c' }),
			[BigInt(1), 'b'],
			'arraylike (with BigInt) stops at the length'
		);

		t.end();
	});

	test('CreateRegExpStringIterator', function (t) {
		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { ES.CreateRegExpStringIterator({}, nonString, false, false); },
				TypeError,
				debug(nonString) + ' is not a String'
			);
		});

		forEach(v.nonBooleans, function (nonBoolean) {
			t['throws'](
				function () { ES.CreateRegExpStringIterator({}, '', nonBoolean, false); },
				TypeError,
				debug(nonBoolean) + ' is not a String (`global`)'
			);

			t['throws'](
				function () { ES.CreateRegExpStringIterator({}, '', false, nonBoolean); },
				TypeError,
				debug(nonBoolean) + ' is not a String (`fullUnicode`)'
			);
		});

		var resIterator = ES.CreateRegExpStringIterator(/a/, 'a', false, false);
		forEach(v.primitives, function (nonObject) {
			t['throws'](
				function () { resIterator.next.call(nonObject); },
				TypeError,
				debug(nonObject) + ', receiver of iterator next, is not an Object'
			);
		});
		t['throws'](
			function () { resIterator.next.call({}); },
			TypeError,
			'iterator next receiver is not a RegExp String Iterator'
		);

		t.test('`global` matches `g` flag', function (st) {
			st.test('non-global regex', function (s2t) {
				var regex = /a/;
				var str = 'abcabc';
				var expected = [
					assign(['a'], kludgeMatch(regex, { index: 0, input: str, lastIndex: 1 }))
				];
				testRESIterator(ES, s2t, regex, str, false, false, expected);
				s2t.end();
			});

			st.test('non-global unicode regex', { skip: !('unicode' in RegExp.prototype) }, function (s2t) {
				var regex = new RegExp(wholePoo, 'u');
				var str = 'a' + wholePoo + 'ca' + wholePoo + 'c';
				var expected = [
					assign([wholePoo], kludgeMatch(regex, { index: 1, input: str, lastIndex: 1 }))
				];
				testRESIterator(ES, s2t, regex, str, false, true, expected);
				s2t.end();
			});

			st.test('global regex', function (s2t) {
				var regex = /a/g;
				var str = 'abcabc';
				var expected = [
					assign(['a'], kludgeMatch(regex, { index: 0, input: str, lastIndex: 1 })),
					assign(['a'], kludgeMatch(regex, { index: 3, input: str, lastIndex: 4 }))
				];
				testRESIterator(ES, s2t, regex, str, true, false, expected);

				var emptyRegex = /(?:)/g;
				var abc = 'abc';
				var expected2 = [
					assign([''], kludgeMatch(emptyRegex, { index: 0, input: abc, lastIndex: 1 })),
					assign([''], kludgeMatch(emptyRegex, { index: 1, input: abc, lastIndex: 2 })),
					assign([''], kludgeMatch(emptyRegex, { index: 2, input: abc, lastIndex: 3 })),
					assign([''], kludgeMatch(emptyRegex, { index: 3, input: abc, lastIndex: 4 }))
				];
				testRESIterator(ES, s2t, emptyRegex, abc, true, false, expected2);

				s2t.end();
			});

			st.test('global unicode regex', { skip: !('unicode' in RegExp.prototype) }, function (s2t) {
				var regex = new RegExp(wholePoo, 'gu');
				var str = 'a' + wholePoo + 'ca' + wholePoo + 'c';
				var expected = [
					assign([wholePoo], kludgeMatch(regex, { index: 1, input: str })),
					assign([wholePoo], kludgeMatch(regex, { index: 5, input: str }))
				];
				testRESIterator(ES, s2t, regex, str, true, true, expected);
				s2t.end();
			});

			st.end();
		});

		// these tests are technically allowed by the AO, but the spec never causes them to happen
		t.test('`global` does not match `g` flag', { skip: true }, function (st) {
			st.test('non-global regex', function (s2t) {
				var regex = /a/;
				var str = 'abcabc';
				var expected = [
					assign(['a'], kludgeMatch(regex, { index: 0, input: str }))
				];
				testRESIterator(ES, s2t, regex, str, true, false, expected);
				s2t.end();
			});

			st.test('non-global unicode regex', { skip: !('unicode' in RegExp.prototype) }, function (s2t) {
				var regex = new RegExp(wholePoo, 'u');
				var str = 'a' + wholePoo + 'ca' + wholePoo + 'c';
				var expected = [
					assign([wholePoo], kludgeMatch(regex, { index: 1, input: str }))
				];
				testRESIterator(ES, s2t, regex, str, true, true, expected);
				s2t.end();
			});

			st.test('global regex', function (s2t) {
				var regex = /a/g;
				var str = 'abcabc';
				var expected = [
					assign(['a'], kludgeMatch(regex, { index: 0, input: str })),
					assign(['a'], kludgeMatch(regex, { index: 3, input: str }))
				];
				testRESIterator(ES, s2t, regex, str, false, false, expected);
				s2t.end();
			});

			st.test('global unicode regex', { skip: !('unicode' in RegExp.prototype) }, function (s2t) {
				var regex = new RegExp(wholePoo, 'gu');
				var str = 'a' + wholePoo + 'ca' + wholePoo + 'c';
				var expected = [
					assign([wholePoo], kludgeMatch(regex, { index: 1, input: str })),
					assign([wholePoo], kludgeMatch(regex, { index: 5, input: str }))
				];
				testRESIterator(ES, s2t, regex, str, false, true, expected);
				s2t.end();
			});

			st.end();
		});

		var iterator = ES.CreateRegExpStringIterator(/a/, '', false, false);
		t.deepEqual(keys(iterator), [], 'iterator has no enumerable keys');
		if ($defineProperty) {
			for (var key in iterator) { // eslint-disable-line no-restricted-syntax
				t.fail(debug(key) + ' should not be an enumerable key');
			}
		}
		if (v.hasSymbols) {
			t.equal(iterator[Symbol.iterator](), iterator, 'is iterable for itself');
		}

		t.end();
	});

	test('floor (with BigInts)', { skip: !hasBigInts }, function (t) {
		t.equal(ES.floor(BigInt(3)), BigInt(3), 'floor(3n) is 3n');
		t.equal(ES.floor(BigInt(-3)), BigInt(-3), 'floor(-3n) is -3n');
		t.equal(ES.floor(BigInt(0)), BigInt(0), 'floor(0n) is 0n');

		t.end();
	});

	test('GetIterator', function (t) {
		try {
			ES.GetIterator({}, null);
		} catch (e) {
			t.ok(e.message.indexOf('Assertion failed: `hint` must be one of \'sync\' or \'async\'' >= 0));
		}

		var arr = [1, 2];
		testIterator(t, ES.GetIterator(arr), arr);

		testIterator(t, ES.GetIterator('abc'), 'abc'.split(''));

		t.test('Symbol.iterator', { skip: !v.hasSymbols }, function (st) {
			var m = new Map();
			m.set(1, 'a');
			m.set(2, 'b');

			testIterator(st, ES.GetIterator(m), [[1, 'a'], [2, 'b']]);

			st.end();
		});

		t.test('no Symbol.asyncIterator', { skip: v.hasAsyncIterator }, function (st) {
			st['throws'](
				function () { ES.GetIterator(arr, 'async'); },
				SyntaxError,
				'async from sync iterators are not currently supported'
			);

			st.end();
		});

		t.test('Symbol.asyncIterator', { skip: !v.hasSymbols || !Symbol.asyncIterator }, function (st) {
			try {
				ES.GetIterator(arr, 'async');
			} catch (e) {
				st.ok(e.message.indexOf("async from sync iterators aren't currently supported") >= 0);
			}

			var it = {
				next: function () {
					return Promise.resolve({
						done: true
					});
				}
			};
			var obj = {};
			obj[Symbol.asyncIterator] = function () {
				return it;
			};

			st.equal(ES.GetIterator(obj, 'async'), it);

			forEach(v.primitives, function (primitive) {
				var badObj = {};
				badObj[Symbol.asyncIterator] = function () {
					return primitive;
				};

				st['throws'](
					function () { ES.GetIterator(badObj, 'async'); },
					TypeError,
					debug(primitive) + ' is not an Object'
				);
			});

			st.end();
		});

		t.end();
	});

	test('GetValueFromBuffer', function (t) {
		var isTypedArray = true;

		forEach(v.primitives.concat(v.objects), function (nonAB) {
			t['throws'](
				function () { ES.GetValueFromBuffer(nonAB, 0, 'Int8', isTypedArray, 'Unordered'); },
				TypeError,
				debug(nonAB) + ' is not an ArrayBuffer'
			);
		});

		t.test('ArrayBuffers supported', { skip: typeof ArrayBuffer !== 'function' }, function (st) {
			forEach(v.notNonNegativeIntegers, function (nonNonNegativeInteger) {
				st['throws'](
					function () { ES.GetValueFromBuffer(new ArrayBuffer(8), nonNonNegativeInteger, 'Int8', isTypedArray, 'Unordered'); },
					TypeError,
					debug(nonNonNegativeInteger) + ' is not a valid byte index'
				);
			});

			forEach(v.nonStrings.concat('not a valid type'), function (nonString) {
				st['throws'](
					function () { ES.GetValueFromBuffer(new ArrayBuffer(8), 0, nonString, isTypedArray, 'Unordered'); },
					TypeError,
					'type: ' + debug(nonString) + ' is not a valid String (or type) value'
				);
			});

			forEach(v.nonBooleans, function (nonBoolean) {
				st['throws'](
					function () { ES.GetValueFromBuffer(new ArrayBuffer(8), 0, 'Int8', nonBoolean, 'Unordered'); },
					TypeError,
					'isTypedArray: ' + debug(nonBoolean) + ' is not a valid Boolean value'
				);

				st['throws'](
					function () { ES.GetValueFromBuffer(new ArrayBuffer(8), 0, 'Int8', isTypedArray, 'Unordered', nonBoolean); },
					TypeError,
					'isLittleEndian: ' + debug(nonBoolean) + ' is not a valid Boolean value'
				);
			});

			forEach(v.nonStrings, function (nonString) {
				st['throws'](
					function () { ES.GetValueFromBuffer(new ArrayBuffer(8), 0, 'Int8', isTypedArray, nonString); },
					TypeError,
					'order: ' + debug(nonString) + ' is not a valid String (or order) value'
				);
			});

			st.test('can detach', { skip: !canDetach }, function (s2t) {
				var buffer = new ArrayBuffer(8);
				s2t.equal(ES.DetachArrayBuffer(buffer), null, 'detaching returns null');

				s2t['throws'](
					function () { ES.GetValueFromBuffer(buffer, 0, 'Int8', isTypedArray, 'Unordered'); },
					TypeError,
					'detached buffers throw'
				);

				s2t.end();
			});

			forEach(bufferTestCases, function (testCase, name) {
				st.test(name + ': ' + debug(testCase.value), function (s2t) {
					forEach([].concat(
						'Int8',
						'Uint8',
						'Uint8C',
						'Int16',
						'Uint16',
						'Int32',
						'Uint32',
						hasBigInts ? bigIntTypes : [],
						'Float32',
						'Float64'
					), function (type) {
						var isBigInt = type.slice(0, 3) === 'Big';
						var view = new DataView(new ArrayBuffer(elementSizes.$Float64Array));
						var method = type === 'Uint8C' ? 'Uint8' : type;
						// var value = unserialize(testCase.value);
						var result = testCase[type === 'Uint8C' ? 'Uint8Clamped' : type];
						var hasBigEndian = type !== 'Int8' && type !== 'Uint8' && type !== 'Uint8C'; // the 8-bit types are special, they don't have big-endian
						/*
						st.equal(
							ES.GetValueFromBuffer(testCase.buffer, 0, type),
							defaultEndianness === testCase.endian ? testCase[type + 'little'] : testCase[type + 'big'],
							'buffer holding ' + debug(value) + ' (' + testCase.endian + ' endian) with type ' + type + ', default endian, yields expected value'
						);
						*/

						clearBuffer(view.buffer);
						var littleVal = unserialize(result.setAsLittle.asLittle);
						view['set' + method](0, isBigInt ? safeBigInt(littleVal) : littleVal, true);

						try {
							if (isBigInt) {
								$BigInt(littleVal); // noop to trigger the error when needsBigIntHack
							}
							s2t.equal(
								ES.GetValueFromBuffer(view.buffer, 0, type, isTypedArray, 'Unordered', true),
								littleVal,
								'buffer with type ' + type + ', little -> little, yields expected value'
							);
						} catch (e) {
							if (isBigInt && safeBigInt !== $BigInt && e instanceof RangeError) {
								s2t.comment('SKIP node v10.4-v10.8 have a bug where you can‘t `BigInt(x)` anything larger than MAX_SAFE_INTEGER');
								return;
							}
							throw e;
						}

						if (hasBigEndian) {
							s2t.equal(
								ES.GetValueFromBuffer(view.buffer, 0, type, isTypedArray, 'Unordered', false),
								view['get' + method](0, false),
								'buffer with type ' + type + ', little -> big, yields expected value'
							);

							clearBuffer(view.buffer);
							var bigVal = unserialize(result.setAsBig.asBig);
							view['set' + method](0, isBigInt ? safeBigInt(bigVal) : bigVal, false);

							s2t.equal(
								ES.GetValueFromBuffer(view.buffer, 0, type, isTypedArray, 'Unordered', false),
								bigVal,
								'buffer with type ' + type + ', big -> big, yields expected value'
							);

							s2t.equal(
								ES.GetValueFromBuffer(view.buffer, 0, type, isTypedArray, 'Unordered', true),
								view['get' + method](0, true),
								'buffer with type ' + type + ', big -> little, yields expected value'
							);
						}
					});

					s2t.end();
				});
			});

			st.end();
		});

		t.end();
	});

	test('IsBigIntElementType', function (t) {
		forEach(bigIntTypes, function (type) {
			t.equal(
				ES.IsBigIntElementType(type),
				true,
				debug(type) + ' is a BigInt element type'
			);
		});

		forEach(numberTypes, function (type) {
			t.equal(
				ES.IsBigIntElementType(type),
				false,
				debug(type) + ' is not a BigInt element type'
			);
		});

		t.end();
	});

	test('IsUnsignedElementType', function (t) {
		forEach(unsignedElementTypes, function (type) {
			t.equal(
				ES.IsUnsignedElementType(type),
				true,
				debug(type) + ' is an unsigned element type'
			);
		});

		forEach(signedElementTypes, function (type) {
			t.equal(
				ES.IsUnsignedElementType(type),
				false,
				debug(type) + ' is not an unsigned element type'
			);
		});

		t.end();
	});

	test('IsUnclampedIntegerElementType', function (t) {
		forEach(unclampedIntegerTypes, function (type) {
			t.equal(
				ES.IsUnclampedIntegerElementType(type),
				true,
				debug(type) + ' is an unclamped integer element type'
			);
		});

		forEach(clampedTypes.concat(nonIntegerTypes), function (type) {
			t.equal(
				ES.IsUnclampedIntegerElementType(type),
				false,
				debug(type) + ' is not an unclamped integer element type'
			);
		});

		t.end();
	});

	test('IsNonNegativeInteger', function (t) {
		forEach(v.notNonNegativeIntegers, function (nonIntegerNumber) {
			t.equal(
				ES.IsNonNegativeInteger(nonIntegerNumber),
				false,
				debug(nonIntegerNumber) + ' is not a non-negative integer'
			);
		});

		forEach(v.zeroes.concat(v.integerNumbers), function (nonNegativeInteger) {
			t.equal(
				ES.IsNonNegativeInteger(nonNegativeInteger),
				true,
				debug(nonNegativeInteger) + ' is a non-negative integer'
			);
		});

		t.end();
	});

	test('IsNoTearConfiguration', function (t) {
		forEach(unclampedIntegerTypes, function (type) {
			t.equal(
				ES.IsNoTearConfiguration(type),
				true,
				debug(type) + ' with any order is a no-tear configuration'
			);
		});

		forEach(bigIntTypes, function (type) {
			t.equal(
				ES.IsNoTearConfiguration(type, 'Init'),
				false,
				debug(type) + ' with ' + debug('Init') + ' is not a no-tear configuration'
			);

			t.equal(
				ES.IsNoTearConfiguration(type, 'Unordered'),
				false,
				debug(type) + ' with ' + debug('Unordered') + ' is not a no-tear configuration'
			);

			t.equal(
				ES.IsNoTearConfiguration(type),
				true,
				debug(type) + ' with any other order is a no-tear configuration'
			);
		});

		forEach(clampedTypes, function (type) {
			t.equal(
				ES.IsNoTearConfiguration(type),
				false,
				debug(type) + ' with any order is not a no-tear configuration'
			);
		});

		t.end();
	});

	test('IsValidIntegerIndex', function (t) {
		forEach(v.primitives.concat(v.objects, [[]]), function (nonTA) {
			t['throws'](
				function () { ES.IsValidIntegerIndex(nonTA, 0); },
				TypeError,
				debug(nonTA) + ' is not a TypedArray'
			);
		});

		t.test('Typed Array support', { skip: availableTypedArrays.length === 0 }, function (st) {
			forEach(availableTypedArrays, function (typedArray) {
				st.test(typedArray, function (s2t) {
					var TA = global[typedArray];
					var ta = new TA(1);

					forEach(v.nonNumbers, function (nonNumber) {
						s2t['throws'](
							function () { ES.IsValidIntegerIndex(ta, nonNumber); },
							TypeError,
							'index: ' + debug(nonNumber) + ' is not a Number'
						);
					});

					forEach(v.nonIntegerNumbers, function (nonInteger) {
						s2t.equal(ES.IsValidIntegerIndex(ta, nonInteger), false, debug(nonInteger) + ' is not an integer');
					});

					s2t.equal(ES.IsValidIntegerIndex(ta, -0), false, '-0 is not a valid index');
					s2t.equal(ES.IsValidIntegerIndex(ta, -1), false, '-1 is not a valid index');
					for (var i = 0; i < ta.length; i += 1) {
						s2t.equal(ES.IsValidIntegerIndex(ta, i), true, i + ' is a valid index of an array of length ' + ta.length);
					}
					s2t.equal(ES.IsValidIntegerIndex(ta, ta.length), false, ta.length + ' is not a valid index of an array of length ' + ta.length);

					s2t.end();
				});
			});

			st.end();
		});

		t.end();
	});

	test('LengthOfArrayLike', function (t) {
		forEach(v.primitives, function (primitive) {
			t['throws'](
				function () { ES.LengthOfArrayLike(primitive); },
				TypeError,
				debug(primitive) + ' is not an Object'
			);
		});

		t.equal(ES.LengthOfArrayLike([]), 0);
		t.equal(ES.LengthOfArrayLike([1]), 1);
		t.equal(ES.LengthOfArrayLike({ length: 42 }), 42);

		t.end();
	});

	test('Number::add', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.Number.add(nonNumber, 0); },
				TypeError,
				'x: ' + debug(nonNumber) + ' is not a Number'
			);
			t['throws'](
				function () { ES.Number.add(0, nonNumber); },
				TypeError,
				'y: ' + debug(nonNumber) + ' is not a Number'
			);
		});

		t.equal(ES.Number.add(+Infinity, +Infinity), +Infinity, '+∞ + +∞ is +∞');
		t.equal(ES.Number.add(-Infinity, -Infinity), -Infinity, '-∞ + -∞ is -∞');
		t.equal(ES.Number.add(+Infinity, -Infinity), NaN, '+∞ + -∞ is NaN');
		t.equal(ES.Number.add(-Infinity, +Infinity), NaN, '-∞ + +∞ is NaN');

		t.equal(ES.Number.add(+0, +0), +0, '0 + 0 is +0');
		t.equal(ES.Number.add(+0, -0), +0, '0 + -0 is +0');
		t.equal(ES.Number.add(-0, +0), +0, '-0 + 0 is +0');
		t.equal(ES.Number.add(-0, -0), -0, '-0 + -0 is -0');

		forEach(v.numbers, function (number) {
			if (number !== 0) {
				t.equal(ES.Number.add(number, 0), number, debug(number) + ' + 0 adds to ' + number);
			}
			t.equal(ES.Number.add(number, 1), number + 1, debug(number) + ' + 1 adds to ' + (number + 1));
			t.equal(ES.Number.add(1, number), number + 1, '1 + ' + debug(number) + ' adds to ' + (number + 1));
			t.equal(ES.Number.add(number, -42), number - 42, debug(number) + ' + -42 adds to ' + (number - 42));
			t.equal(ES.Number.add(-42, number), number - 42, '-42 + ' + debug(number) + ' adds to ' + (number - 42));
		});

		t.end();
	});

	test('Number::bitwiseAND', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.Number.bitwiseAND(nonNumber, 0); },
				TypeError,
				'x: ' + debug(nonNumber) + ' is not a Number'
			);
			t['throws'](
				function () { ES.Number.bitwiseAND(0, nonNumber); },
				TypeError,
				'y: ' + debug(nonNumber) + ' is not a Number'
			);
		});

		t.equal(ES.Number.bitwiseAND(1, 2), 1 & 2);

		t.end();
	});

	test('Number::bitwiseNOT', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.Number.bitwiseNOT(nonNumber); },
				TypeError,
				debug(nonNumber) + ' is not a Number'
			);
		});

		forEach(v.int32s, function (int32) {
			t.equal(ES.Number.bitwiseNOT(int32), ~int32, debug(int32) + ' becomes ~' + debug(int32));
		});

		t.end();
	});

	test('Number::bitwiseOR', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.Number.bitwiseOR(nonNumber, 0); },
				TypeError,
				'x: ' + debug(nonNumber) + ' is not a Number'
			);
			t['throws'](
				function () { ES.Number.bitwiseOR(0, nonNumber); },
				TypeError,
				'y: ' + debug(nonNumber) + ' is not a Number'
			);
		});

		t.equal(ES.Number.bitwiseOR(1, 2), 1 | 2);

		t.end();
	});

	test('Number::bitwiseXOR', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.Number.bitwiseXOR(nonNumber, 0); },
				TypeError,
				'x: ' + debug(nonNumber) + ' is not a Number'
			);
			t['throws'](
				function () { ES.Number.bitwiseXOR(0, nonNumber); },
				TypeError,
				'y: ' + debug(nonNumber) + ' is not a Number'
			);
		});

		t.equal(ES.Number.bitwiseXOR(1, 2), 1 ^ 2);

		t.end();
	});

	test('Number::divide', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.Number.divide(nonNumber, 0); },
				TypeError,
				'x: ' + debug(nonNumber) + ' is not a Number'
			);
			t['throws'](
				function () { ES.Number.divide(0, nonNumber); },
				TypeError,
				'y: ' + debug(nonNumber) + ' is not a Number'
			);
		});

		t.equal(ES.Number.divide(Infinity, Infinity), NaN, '∞ / ∞ is NaN');
		t.equal(ES.Number.divide(-Infinity, Infinity), NaN, '-∞ / ∞ is NaN');
		t.equal(ES.Number.divide(Infinity, -Infinity), NaN, '∞ / -∞ is NaN');
		t.equal(ES.Number.divide(-Infinity, -Infinity), NaN, '-∞ / -∞ is NaN');

		t.equal(ES.Number.divide(NaN, NaN), NaN, 'NaN / NaN is NaN');

		t.equal(ES.Number.divide(+Infinity, +0), +Infinity, '+∞ / +0 is +∞');
		t.equal(ES.Number.divide(-Infinity, -0), +Infinity, '-∞ / -0 is +∞');
		t.equal(ES.Number.divide(+Infinity, -0), -Infinity, '+∞ / -0 is -∞');
		t.equal(ES.Number.divide(-Infinity, +0), -Infinity, '-∞ / +0 is -∞');

		t.equal(ES.Number.divide(+0, +Infinity), +0, '+0 / +∞ is +0');
		t.equal(ES.Number.divide(-0, -Infinity), +0, '-0 / -∞ is +0');
		t.equal(ES.Number.divide(-0, +Infinity), -0, '-0 / +∞ is -0');
		t.equal(ES.Number.divide(+0, -Infinity), -0, '+0 / -∞ is -0');

		forEach(v.numbers, function (number) {
			if (number !== 0 && isFinite(number)) {
				t.equal(ES.Number.divide(number, number), 1, debug(number) + ' divided by itself is 1');
				t.equal(ES.Number.divide(number, 2), number / 2, debug(number) + ' divided by 2 is half itself');
			}
		});

		t.end();
	});

	test('Number::equal', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.Number.equal(nonNumber, 0); },
				TypeError,
				'x: ' + debug(nonNumber) + ' is not a Number'
			);
			t['throws'](
				function () { ES.Number.equal(0, nonNumber); },
				TypeError,
				'y: ' + debug(nonNumber) + ' is not a Number'
			);
		});

		t.equal(ES.Number.equal(Infinity, Infinity), true, '∞ === ∞');
		t.equal(ES.Number.equal(-Infinity, Infinity), false, '-∞ !== ∞');
		t.equal(ES.Number.equal(Infinity, -Infinity), false, '∞ !== -∞');
		t.equal(ES.Number.equal(-Infinity, -Infinity), true, '-∞ === -∞');

		t.equal(ES.Number.equal(NaN, NaN), false, 'NaN !== NaN');

		t.equal(ES.Number.equal(Infinity, 0), false, '∞ !== 0');
		t.equal(ES.Number.equal(-Infinity, -0), false, '-∞ !== -0');
		t.equal(ES.Number.equal(Infinity, -0), false, '∞ !== -0');
		t.equal(ES.Number.equal(-Infinity, 0), false, '-∞ !== 0');

		t.equal(ES.Number.equal(+0, +0), true, '+0 === +0');
		t.equal(ES.Number.equal(+0, -0), true, '+0 === -0');
		t.equal(ES.Number.equal(-0, +0), true, '-0 === +0');
		t.equal(ES.Number.equal(-0, -0), true, '-0 === -0');

		forEach(v.numbers, function (number) {
			if (isFinite(number)) {
				t.equal(ES.Number.equal(number, number), true, debug(number) + ' is equal to itself');
				t.equal(ES.Number.equal(number, number + 1), false, debug(number) + ' is not equal to itself plus 1');
			}
		});

		t.end();
	});

	test('Number::exponentiate', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.Number.exponentiate(nonNumber, 0); },
				TypeError,
				'base: ' + debug(nonNumber) + ' is not a Number'
			);
			t['throws'](
				function () { ES.Number.exponentiate(0, nonNumber); },
				TypeError,
				'exponent: ' + debug(nonNumber) + ' is not a Number'
			);
		});

		t.equal(ES.Number.exponentiate(0, 42), 0, '+0 ** 42 is +0');
		t.equal(ES.Number.exponentiate(0, -42), Infinity, '+0 ** 42 is +∞');
		t.equal(ES.Number.exponentiate(-0, 42), 0, '-0 ** 42 is +0');
		t.equal(ES.Number.exponentiate(-0, 41), -0, '-0 ** 41 is -0');
		t.equal(ES.Number.exponentiate(-0, -42), Infinity, '-0 ** 42 is +∞');
		t.equal(ES.Number.exponentiate(-0, -41), -Infinity, '-0 ** 41 is -∞');

		t.equal(ES.Number.exponentiate(Infinity, 0), 1, '+∞ ** 0 is 1');
		t.equal(ES.Number.exponentiate(Infinity, -0), 1, '+∞ ** -0 is 1');
		t.equal(ES.Number.exponentiate(-Infinity, 0), 1, '-∞ ** 0 is 1');
		t.equal(ES.Number.exponentiate(-Infinity, -0), 1, '-∞ ** -0 is 1');

		t.equal(ES.Number.exponentiate(Infinity, 1), Infinity, '+∞ ** 1 is +∞');
		t.equal(ES.Number.exponentiate(Infinity, 2), Infinity, '+∞ ** 2 is +∞');
		t.equal(ES.Number.exponentiate(Infinity, -1), +0, '+∞ ** -1 is +0');
		t.equal(ES.Number.exponentiate(Infinity, -2), +0, '+∞ ** -2 is +0');

		t.equal(ES.Number.exponentiate(-Infinity, 1), -Infinity, '-∞ ** 1 is -∞');
		t.equal(ES.Number.exponentiate(-Infinity, 2), Infinity, '-∞ ** 2 is +∞');
		t.equal(ES.Number.exponentiate(-Infinity, -1), -0, '-∞ ** --1 is -0');
		t.equal(ES.Number.exponentiate(-Infinity, -2), +0, '-∞ ** --2 is +0');

		t.equal(ES.Number.exponentiate(1.1, Infinity), Infinity, '1.1 ** +∞ is +∞');
		t.equal(ES.Number.exponentiate(1.1, -Infinity), 0, '1.1 ** -∞ is +0');
		t.equal(ES.Number.exponentiate(-1.1, Infinity), Infinity, '-1.1 ** +∞ is +∞');
		t.equal(ES.Number.exponentiate(-1.1, -Infinity), 0, '-1.1 ** -∞ is +0');

		t.equal(ES.Number.exponentiate(1, Infinity), NaN, '1 ** +∞ is NaN');
		t.equal(ES.Number.exponentiate(1, -Infinity), NaN, '1 ** -∞ is NaN');
		t.equal(ES.Number.exponentiate(-1, Infinity), NaN, '-1 ** +∞ is NaN');
		t.equal(ES.Number.exponentiate(-1, -Infinity), NaN, '-1 ** -∞ is NaN');

		t.equal(ES.Number.exponentiate(0.9, Infinity), 0, '0.9 ** +∞ is +0');
		t.equal(ES.Number.exponentiate(0.9, -Infinity), Infinity, '0.9 ** -∞ is ∞');
		t.equal(ES.Number.exponentiate(-0.9, Infinity), 0, '-0.9 ** +∞ is +0');
		t.equal(ES.Number.exponentiate(-0.9, -Infinity), Infinity, '-0.9 ** -∞ is +∞');

		forEach(v.numbers.concat(NaN), function (number) {
			t.equal(ES.Number.exponentiate(number, NaN), NaN, debug(number) + ' ** NaN is NaN');

			if (number !== 0) {
				t.equal(ES.Number.exponentiate(number, 0), 1, debug(number) + ' ** +0 is 1');
				t.equal(ES.Number.exponentiate(number, -0), 1, debug(number) + ' ** -0 is 1');
				t.equal(ES.Number.exponentiate(NaN, number), NaN, 'NaN ** ' + debug(number) + ' is NaN');
			}

			if (number !== 0 && isFinite(number)) {
				t.equal(ES.Number.equal(number, number), true, debug(number) + ' is equal to itself');
				t.equal(ES.Number.equal(number, number + 1), false, debug(number) + ' is not equal to itself plus 1');
			}
		});

		t.end();
	});

	test('Number::leftShift', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.Number.leftShift(nonNumber, 0); },
				TypeError,
				'x: ' + debug(nonNumber) + ' is not a Number'
			);
			t['throws'](
				function () { ES.Number.leftShift(0, nonNumber); },
				TypeError,
				'y: ' + debug(nonNumber) + ' is not a Number'
			);
		});

		forEach([0].concat(v.int32s), function (int32) {
			forEach([1, 3, 5, 31, 32, 33], function (bits) {
				t.equal(ES.Number.leftShift(int32, bits), int32 << bits, debug(int32) + ' << ' + bits + ' is ' + debug(int32 << bits));
			});
		});

		t.end();
	});

	test('Number::lessThan', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.Number.lessThan(nonNumber, 0); },
				TypeError,
				'x: ' + debug(nonNumber) + ' is not a Number'
			);
			t['throws'](
				function () { ES.Number.lessThan(0, nonNumber); },
				TypeError,
				'y: ' + debug(nonNumber) + ' is not a Number'
			);
		});

		t.equal(ES.Number.lessThan(+0, -0), false, '+0 < -0 is false');
		t.equal(ES.Number.lessThan(+0, +0), false, '+0 < +0 is false');
		t.equal(ES.Number.lessThan(-0, +0), false, '-0 < +0 is false');
		t.equal(ES.Number.lessThan(-0, -0), false, '-0 < -0 is false');

		t.equal(ES.Number.lessThan(NaN, NaN), undefined, 'NaN < NaN is undefined');

		t.equal(ES.Number.lessThan(+Infinity, +Infinity), false, '+∞ < +∞ is false');
		t.equal(ES.Number.lessThan(+Infinity, -Infinity), false, '+∞ < -∞ is false');
		t.equal(ES.Number.lessThan(-Infinity, +Infinity), true, '-∞ < +∞ is true');
		t.equal(ES.Number.lessThan(-Infinity, -Infinity), false, '-∞ < -∞ is false');

		forEach(v.numbers.concat(v.infinities), function (number) {
			t.equal(ES.Number.lessThan(NaN, number), undefined, 'NaN < ' + debug(number) + ' is undefined');
			t.equal(ES.Number.lessThan(number, NaN), undefined, debug(number) + ' < NaN is undefined');

			t.equal(ES.Number.lessThan(number, number), false, debug(number) + ' is not less than itself');

			if (isFinite(number)) {
				t.equal(ES.Number.lessThan(number, number + 1), true, debug(number) + ' < ' + debug(number + 1) + ' is true');
				t.equal(ES.Number.lessThan(number + 1, number), false, debug(number + 1) + ' < ' + debug(number) + ' is false');

				t.equal(ES.Number.lessThan(Infinity, number), false, '+∞ < ' + debug(number) + ' is false');
				t.equal(ES.Number.lessThan(number, Infinity), true, debug(number) + ' < +∞ is true');
				t.equal(ES.Number.lessThan(-Infinity, number), true, '-∞ < ' + debug(number) + ' is true');
				t.equal(ES.Number.lessThan(number, -Infinity), false, debug(number) + ' < -∞ is false');
			}
		});

		t.end();
	});

	test('Number::multiply', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.Number.multiply(nonNumber, 0); },
				TypeError,
				'x: ' + debug(nonNumber) + ' is not a Number'
			);
			t['throws'](
				function () { ES.Number.multiply(0, nonNumber); },
				TypeError,
				'y: ' + debug(nonNumber) + ' is not a Number'
			);
		});

		forEach([+0, -0, 1, -1], function (x) {
			var expected = x === 0 ? NaN : Infinity;
			t.equal(ES.Number.multiply(Infinity, x), expected, '+∞ * ' + debug(x) + ' is ' + debug(expected));
			t.equal(ES.Number.multiply(x, Infinity), expected, debug(x) + ' * +∞ is ' + debug(expected));
			t.equal(ES.Number.multiply(-Infinity, x), -expected, '-∞ * ' + debug(x) + ' is ' + debug(expected));
			t.equal(ES.Number.multiply(x, -Infinity), -expected, debug(x) + ' * -∞ is ' + debug(expected));
		});

		t.equal(ES.Number.multiply(Infinity, Infinity), Infinity, '+∞ * +∞ is +∞');
		t.equal(ES.Number.multiply(Infinity, -Infinity), -Infinity, '+∞ * -∞ is -∞');
		t.equal(ES.Number.multiply(-Infinity, Infinity), -Infinity, '-∞ * +∞ is -∞');
		t.equal(ES.Number.multiply(-Infinity, -Infinity), Infinity, '-∞ * -∞ is +∞');

		t.equal(ES.Number.multiply(+0, +0), +0, '0 * 0 is +0');
		t.equal(ES.Number.multiply(+0, -0), -0, '0 * -0 is -0');
		t.equal(ES.Number.multiply(-0, +0), -0, '-0 * 0 is -0');
		t.equal(ES.Number.multiply(-0, -0), +0, '-0 * -0 is +0');

		forEach(v.numbers.concat(NaN), function (number) {
			t.equal(ES.Number.multiply(NaN, number), NaN, 'NaN * ' + debug(number) + ' is NaN');
			t.equal(ES.Number.multiply(number, NaN), NaN, debug(number) + ' * NaN is NaN');

			if (number !== 0 && isFinite(number)) {
				t.equal(ES.Number.multiply(number, 0), number > 0 ? 0 : -0, debug(number) + ' * +0 produces ' + (number > 0 ? '+0' : '-0'));
				t.equal(ES.Number.multiply(0, number), number > 0 ? 0 : -0, '+0 * ' + debug(number) + ' produces ' + (number > 0 ? '+0' : '-0'));
				t.equal(ES.Number.multiply(number, -0), number > 0 ? -0 : 0, debug(number) + ' * -0 produces ' + (number > 0 ? '-0' : '+0'));
				t.equal(ES.Number.multiply(-0, number), number > 0 ? -0 : 0, '-0 * ' + debug(number) + ' produces ' + (number > 0 ? '-0' : '+0'));
				t.equal(ES.Number.multiply(number, 1), number, debug(number) + ' * 1 produces itself');
				t.equal(ES.Number.multiply(number, -42), number * -42, debug(number) + ' * -42 produces ' + (number - 42));
			}
		});

		t.end();
	});

	test('Number::remainder', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.Number.remainder(nonNumber, 0); },
				TypeError,
				'x: ' + debug(nonNumber) + ' is not a Number'
			);
			t['throws'](
				function () { ES.Number.remainder(0, nonNumber); },
				TypeError,
				'y: ' + debug(nonNumber) + ' is not a Number'
			);
		});

		t.equal(ES.Number.remainder(NaN, NaN), NaN, 'NaN % NaN is NaN');

		t.equal(ES.Number.remainder(+0, +0), NaN, '+0 % +0 is NaN');
		t.equal(ES.Number.remainder(+0, -0), NaN, '+0 % -0 is NaN');
		t.equal(ES.Number.remainder(-0, +0), NaN, '-0 % +0 is NaN');
		t.equal(ES.Number.remainder(-0, -0), NaN, '-0 % -0 is NaN');

		forEach(v.numbers, function (number) {
			t.equal(ES.Number.remainder(number, NaN), NaN, debug(number) + ' % NaN is NaN');
			t.equal(ES.Number.remainder(NaN, number), NaN, 'NaN % ' + debug(number) + ' is NaN');

			t.equal(ES.Number.remainder(Infinity, number), NaN, '+∞ % ' + debug(number) + ' is NaN');
			t.equal(ES.Number.remainder(-Infinity, number), NaN, '-∞ % ' + debug(number) + ' is NaN');
			t.equal(ES.Number.remainder(number, 0), NaN, debug(number) + ' % +0 is NaN');
			t.equal(ES.Number.remainder(number, -0), NaN, debug(number) + ' % -0 is NaN');

			if (isFinite(number)) {
				t.equal(ES.Number.remainder(number, Infinity), number, debug(number) + ' % +∞ is ' + debug(number));
				t.equal(ES.Number.remainder(number, -Infinity), number, debug(number) + ' % -∞ is ' + debug(number));
				if (number !== 0) {
					t.equal(ES.Number.remainder(0, number), 0, '+0 % ' + debug(number) + ' is ' + debug(number));
					t.equal(ES.Number.remainder(-0, number), -0, '-0 % ' + debug(number) + ' is ' + debug(number));
					t.looseEqual(ES.Number.remainder(number * 2, number), 0, debug(number) + ' % ' + debug(number * 2) + ' is 0');
				}
			}
		});

		t.equal(ES.Number.remainder(-1, 1), -0, '-1 % 1 is -0');

		t.end();
	});

	test('Number::sameValue', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.Number.sameValue(nonNumber, 0); },
				TypeError,
				'x: ' + debug(nonNumber) + ' is not a Number'
			);
			t['throws'](
				function () { ES.Number.sameValue(0, nonNumber); },
				TypeError,
				'y: ' + debug(nonNumber) + ' is not a Number'
			);
		});

		t.ok(ES.Number.sameValue(NaN, NaN), true, 'NaN is the sameValue as NaN');

		t.equal(ES.Number.sameValue(+0, +0), true, '+0 is sameValue as +0');
		t.equal(ES.Number.sameValue(+0, -0), false, '+0 is not sameValue as -0');
		t.equal(ES.Number.sameValue(-0, +0), false, '-0 is not sameValue as +0');
		t.equal(ES.Number.sameValue(-0, -0), true, '-0 is sameValue as -0');

		forEach(v.numbers, function (number) {
			t.ok(ES.Number.sameValue(number, number), debug(number) + ' is the sameValue as itself');
		});

		t.end();
	});

	test('Number::sameValueZero', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.Number.sameValueZero(nonNumber, 0); },
				TypeError,
				'x: ' + debug(nonNumber) + ' is not a Number'
			);
			t['throws'](
				function () { ES.Number.sameValueZero(0, nonNumber); },
				TypeError,
				'y: ' + debug(nonNumber) + ' is not a Number'
			);
		});

		t.ok(ES.Number.sameValueZero(NaN, NaN), true, 'NaN is the sameValueZero as NaN');

		t.equal(ES.Number.sameValueZero(+0, +0), true, '+0 is sameValueZero as +0');
		t.equal(ES.Number.sameValueZero(+0, -0), true, '+0 is sameValueZero as -0');
		t.equal(ES.Number.sameValueZero(-0, +0), true, '-0 is sameValueZero as +0');
		t.equal(ES.Number.sameValueZero(-0, -0), true, '-0 is sameValueZero as -0');

		forEach(v.numbers, function (number) {
			t.ok(ES.Number.sameValueZero(number, number), debug(number) + ' is the sameValueZero as itself');
		});

		t.end();
	});

	test('Number::signedRightShift', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.Number.signedRightShift(nonNumber, 0); },
				TypeError,
				'x: ' + debug(nonNumber) + ' is not a Number'
			);
			t['throws'](
				function () { ES.Number.signedRightShift(0, nonNumber); },
				TypeError,
				'y: ' + debug(nonNumber) + ' is not a Number'
			);
		});

		forEach([0].concat(v.int32s), function (int32) {
			forEach([1, 3, 5, 31, 32, 33], function (bits) {
				t.equal(ES.Number.signedRightShift(int32, bits), int32 >> bits, debug(int32) + ' >> ' + bits + ' is ' + debug(int32 >> bits));
			});
		});

		t.end();
	});

	test('Number::subtract', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.Number.subtract(nonNumber, 0); },
				TypeError,
				'x: ' + debug(nonNumber) + ' is not a Number'
			);
			t['throws'](
				function () { ES.Number.subtract(0, nonNumber); },
				TypeError,
				'y: ' + debug(nonNumber) + ' is not a Number'
			);
		});

		t.equal(ES.Number.subtract(+0, +0), +0, '0 - 0 is +0');
		t.equal(ES.Number.subtract(+0, -0), +0, '0 - -0 is +0');
		t.equal(ES.Number.subtract(-0, +0), -0, '-0 - 0 is -0');
		t.equal(ES.Number.subtract(-0, -0), +0, '-0 - -0 is +0');

		forEach(v.numbers, function (number) {
			if (number !== 0) {
				t.equal(ES.Number.subtract(number, 0), number, debug(number) + ' - 0 produces ' + number);
			}
			t.equal(ES.Number.subtract(number, 1), number - 1, debug(number) + ' - 1 produces ' + (number + 1));
			t.equal(ES.Number.subtract(number, 42), number - 42, debug(number) + ' - 42 produces ' + (number - 42));
		});

		t.end();
	});

	test('Number::toString', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.Number.toString(nonNumber); },
				TypeError,
				debug(nonNumber) + ' is not a Number'
			);
		});

		forEach(v.numbers, function (number) {
			t.equal(ES.Number.toString(number), String(number), debug(number) + ' stringifies to ' + number);
		});

		t.end();
	});

	test('Number::unaryMinus', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.Number.unaryMinus(nonNumber); },
				TypeError,
				debug(nonNumber) + ' is not a Number'
			);
		});

		t.equal(ES.Number.unaryMinus(NaN), NaN, 'NaN produces NaN');

		forEach(v.numbers, function (number) {
			t.equal(ES.Number.unaryMinus(number), -number, debug(number) + ' produces -' + debug(number));
		});

		t.end();
	});

	test('Number::unsignedRightShift', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.Number.unsignedRightShift(nonNumber, 0); },
				TypeError,
				'x: ' + debug(nonNumber) + ' is not a Number'
			);
			t['throws'](
				function () { ES.Number.unsignedRightShift(0, nonNumber); },
				TypeError,
				'y: ' + debug(nonNumber) + ' is not a Number'
			);
		});

		forEach([0].concat(v.int32s), function (int32) {
			forEach([1, 3, 5, 31, 32, 33], function (bits) {
				t.equal(ES.Number.unsignedRightShift(int32, bits), int32 >>> bits, debug(int32) + ' >>> ' + bits + ' is ' + debug(int32 >>> bits));
			});
		});

		t.end();
	});

	test('NumberToBigInt', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.NumberToBigInt(nonNumber); },
				TypeError,
				debug(nonNumber) + ' is not a Number'
			);
		});

		forEach(v.nonIntegerNumbers, function (nonIntegerNumber) {
			t['throws'](
				function () { ES.NumberToBigInt(nonIntegerNumber); },
				RangeError,
				debug(nonIntegerNumber) + ' is not an integer'
			);
		});

		t.test('actual BigInts', { skip: !hasBigInts }, function (st) {
			forEach(v.integerNumbers, function (int) {
				if (int >= 1e17) {
					// BigInt(1e17) throws on node v10.4 - v10.8
					try {
						st.equal(ES.NumberToBigInt(int), $BigInt(int), debug(int) + ' becomes ' + debug($BigInt(int)));
					} catch (e) {
						st['throws'](
							function () { $BigInt(int); },
							RangeError,
							debug(int) + ' is too large on this engine to convert into a BigInt'
						);
					}
				} else {
					st.equal(ES.NumberToBigInt(int), $BigInt(int), debug(int) + ' becomes ' + debug($BigInt(int)));
				}
			});
			st.end();
		});

		t.test('no BigInts', { skip: hasBigInts }, function (st) {
			st['throws'](
				function () { ES.NumberToBigInt(0); },
				SyntaxError,
				'BigInt is not supported on this engine'
			);

			st.end();
		});

		t.end();
	});

	test('NumericToRawBytes', function (t) {
		forEach(v.nonStrings.concat('', 'Byte'), function (nonTAType) {
			t['throws'](
				function () { ES.NumericToRawBytes(nonTAType, 0, false); },
				TypeError,
				debug(nonTAType) + ' is not a String, or not a TypedArray type'
			);
		});

		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.NumericToRawBytes('Int8', nonNumber, false); },
				TypeError,
				debug(nonNumber) + ' is not a Number'
			);
		});

		forEach(v.nonBooleans, function (nonBoolean) {
			t['throws'](
				function () { ES.NumericToRawBytes('Int8', 0, nonBoolean); },
				TypeError,
				debug(nonBoolean) + ' is not a Boolean'
			);
		});

		forEach(bufferTestCases, function (testCase, name) {
			var value = unserialize(testCase.value);

			t.test(name + ': ' + value, function (st) {
				forEach([].concat(
					'Int8',
					'Uint8',
					'Uint8C',
					'Int16',
					'Uint16',
					'Int32',
					'Uint32',
					hasBigInts ? bigIntTypes : [],
					'Float32',
					'Float64'
				), function (type) {
					var isBigInt = type.slice(0, 3) === 'Big';
					var hasBigEndian = type !== 'Int8' && type !== 'Uint8' && type !== 'Uint8C'; // the 8-bit types are special, they don't have big-endian
					var result = testCase[type === 'Uint8C' ? 'Uint8Clamped' : type];

					if (isBigInt && (!isFinite(value) || Math.floor(value) !== value)) {
						return;
					}

					var valToSet = type === 'Uint8C' && value > 0xFF ? 0xFF : isBigInt ? safeBigInt(value) : value;

					st.test(type, function (s2t) {
						/*
						s2t.equal(
							ES.GetValueFromBuffer(testCase.buffer, 0, type, true, 'Unordered'),
							defaultEndianness === testCase.endian ? testCase[type].little.value : testCase[type].big.value,
							'buffer holding ' + debug(testCase.value) + ' (' + testCase.endian + ' endian) with type ' + type + ', default endian, yields expected value'
						);
						*/

						s2t.deepEqual(
							ES.NumericToRawBytes(type, valToSet, true),
							result[type === 'Float64' ? 'setAsLittle' : 'setAsTruncatedLittle'].bytes,
							debug(value) + ' with type ' + type + ', little endian, yields expected value'
						);

						if (hasBigEndian) {
							s2t.deepEqual(
								ES.NumericToRawBytes(type, valToSet, false),
								result[type === 'Float64' ? 'setAsBig' : 'setAsTruncatedBig'].bytes,
								debug(value) + ' with type ' + type + ', big endian, yields expected value'
							);
						}

						s2t.end();
					});
				});

				st.end();
			});
		});

		t.test('BigInt64', function (st) {
			st.test('bigints available', { skip: !hasBigInts }, function (s2t) {
				forEach([
					[BigInt(0), [0, 0, 0, 0, 0, 0, 0, 0]],
					[BigInt(1), [1, 0, 0, 0, 0, 0, 0, 0]],
					// [BigInt(-1), [255, 255, 255, 255, 255, 255, 255, 255]],
					[BigInt(16777216), [0, 0, 0, 1, 0, 0, 0, 0]], // max safe float32
					[BigInt(2147483647), [255, 255, 255, 127, 0, 0, 0, 0]],
					// [BigInt(-2147483647), [1, 0, 0, 128, 255, 255, 255, 255]],
					[BigInt(2147483648), [0, 0, 0, 128, 0, 0, 0, 0]]
					// [BigInt(-2147483648), [0, 0, 0, 128, 255, 255, 255, 255]]
				], function (pair) {
					var int = pair[0];
					var bytes = pair[1];

					if (availableTypedArrays.length > 0) {
						var expectedBytes = arrayFrom(new Uint8Array(assign(new BigInt64Array(1), [int]).buffer));
						s2t.deepEqual(
							bytes,
							expectedBytes,
							'bytes for ' + debug(int) + ' are correct; got ' + debug(expectedBytes)
						);
					}

					s2t.deepEqual(
						ES.NumericToRawBytes('BigInt64', int, true),
						bytes,
						'little-endian: bytes for ' + debug(int) + ' are produced'
					);
					s2t.deepEqual(
						ES.NumericToRawBytes('BigInt64', int, false),
						bytes.slice().reverse(),
						'big-endian: bytes for ' + debug(int) + ' are produced'
					);
				});

				s2t.end();
			});

			st.end();
		});

		t.test('BigUint64', function (st) {
			st.test('bigints available', { skip: !hasBigInts }, function (s2t) {
				forEach([
					[BigInt(0), [0, 0, 0, 0, 0, 0, 0, 0]],
					[BigInt(1), [1, 0, 0, 0, 0, 0, 0, 0]],
					// [BigInt(-1), [255, 255, 255, 255, 255, 255, 255, 255]],
					[BigInt(16777216), [0, 0, 0, 1, 0, 0, 0, 0]], // max safe float32
					[BigInt(2147483647), [255, 255, 255, 127, 0, 0, 0, 0]],
					// [BigInt(-2147483647), [1, 0, 0, 128, 255, 255, 255, 255]],
					[BigInt(2147483648), [0, 0, 0, 128, 0, 0, 0, 0]]
					// [BigInt(-2147483648), [0, 0, 0, 128, 255, 255, 255, 255]]
				], function (pair) {
					var int = pair[0];
					var bytes = pair[1];

					if (availableTypedArrays.length > 0) {
						var expectedBytes = arrayFrom(new Uint8Array(assign(new BigUint64Array(1), [int]).buffer));
						s2t.deepEqual(
							bytes,
							expectedBytes,
							'bytes for ' + debug(int) + ' are correct; got ' + debug(expectedBytes)
						);
					}

					s2t.deepEqual(
						ES.NumericToRawBytes('BigUint64', int, true),
						bytes,
						'little-endian: bytes for ' + debug(int) + ' are produced'
					);
					s2t.deepEqual(
						ES.NumericToRawBytes('BigUint64', int, false),
						bytes.slice().reverse(),
						'big-endian: bytes for ' + debug(int) + ' are produced'
					);
				});

				s2t.end();
			});

			st.end();
		});

		t.end();
	});

	test('OrdinaryObjectCreate', function (t) {
		forEach(v.nonNullPrimitives, function (value) {
			t['throws'](
				function () { ES.OrdinaryObjectCreate(value); },
				TypeError,
				debug(value) + ' is not null, or an object'
			);
		});

		forEach(v.nonArrays, function (nonArray) {
			t['throws'](
				function () { ES.OrdinaryObjectCreate({}, nonArray); },
				TypeError,
				debug(nonArray) + ' is not an Array'
			);
		});

		t.test('proto arg', function (st) {
			var Parent = function Parent() {};
			Parent.prototype.foo = {};
			var child = ES.OrdinaryObjectCreate(Parent.prototype);
			st.equal(child instanceof Parent, true, 'child is instanceof Parent');
			st.equal(child.foo, Parent.prototype.foo, 'child inherits properties from Parent.prototype');

			st.end();
		});

		t.test('internal slots arg', function (st) {
			st.doesNotThrow(function () { ES.OrdinaryObjectCreate({}, []); }, 'an empty slot list is valid');

			var O = ES.OrdinaryObjectCreate({}, ['a', 'b']);
			st.doesNotThrow(
				function () {
					SLOT.assert(O, 'a');
					SLOT.assert(O, 'b');
				},
				'expected internal slots exist'
			);
			st['throws'](
				function () { SLOT.assert(O, 'c'); },
				TypeError,
				'internal slots that should not exist throw'
			);

			st.end();
		});

		t.test('null proto', { skip: !$setProto }, function (st) {
			st.equal('toString' in {}, true, 'normal objects have toString');
			st.equal('toString' in ES.OrdinaryObjectCreate(null), false, 'makes a null object');

			st.end();
		});

		t.test('null proto when no native Object.create', { skip: $setProto }, function (st) {
			st['throws'](
				function () { ES.OrdinaryObjectCreate(null); },
				SyntaxError,
				'without a native Object.create, can not create null objects'
			);

			st.end();
		});

		t.end();
	});

	test('RawBytesToNumeric', function (t) {
		forEach(v.nonStrings.concat('', 'Byte'), function (nonTAType) {
			t['throws'](
				function () { ES.RawBytesToNumeric(nonTAType, [], false); },
				TypeError,
				debug(nonTAType) + ' is not a String, or not a TypedArray type'
			);
		});

		forEach(v.primitives.concat(v.objects), function (nonArray) {
			t['throws'](
				function () { ES.RawBytesToNumeric('Int8', nonArray, false); },
				TypeError,
				debug(nonArray) + ' is not an Array'
			);
		});
		forEach([-1, 1.5, 256], function (nonByte) {
			t['throws'](
				function () { ES.RawBytesToNumeric('Int8', [nonByte], false); },
				TypeError,
				debug(nonByte) + ' is not a valid "byte"'
			);
		});

		forEach(v.nonBooleans, function (nonBoolean) {
			t['throws'](
				function () { ES.RawBytesToNumeric('Int8', [0], nonBoolean); },
				TypeError,
				debug(nonBoolean) + ' is not a Boolean'
			);
		});

		forEach(bufferTestCases, function (testCase, name) {
			var value = unserialize(testCase.value);
			t.test(name + ': ' + value, function (st) {
				forEach([].concat(
					'Int8',
					'Uint8',
					'Uint8C',
					'Int16',
					'Uint16',
					'Int32',
					'Uint32',
					hasBigInts ? bigIntTypes : [],
					'Float32',
					'Float64'
				), function (type) {
					var result = testCase[type === 'Uint8C' ? 'Uint8Clamped' : type];
					var hasBigEndian = type !== 'Int8' && type !== 'Uint8' && type !== 'Uint8C'; // the 8-bit types are special, they don't have big-endian

					var littleLittle = unserialize(result.setAsLittle.asLittle);
					try {
						st.equal(
							ES.RawBytesToNumeric(type, result.setAsLittle.bytes, true),
							littleLittle,
							type + ', little-endian: bytes (' + debug(result.setAsLittle.bytes) + ') for ' + debug(littleLittle) + ' produces it'
						);
					} catch (e) {
						if (safeBigInt !== $BigInt && e instanceof RangeError) {
							st.comment('SKIP node v10.4-v10.8 have a bug where you can‘t `BigInt(x)` anything larger than MAX_SAFE_INTEGER');
							return;
						}
					}
					if (hasBigEndian) {
						var bigBig = unserialize(result.setAsBig.asBig);
						st.equal(
							ES.RawBytesToNumeric(type, result.setAsBig.bytes, false),
							bigBig,
							type + ', big-endian: bytes (' + debug(result.setAsBig.bytes) + ') for ' + debug(bigBig) + ' produces it'
						);
					}
				});

				st.end();
			});
		});

		t.test('incorrect byte counts', function (st) {
			st['throws'](
				function () { ES.RawBytesToNumeric('Float32', [0, 0, 0], false); },
				RangeError,
				'Float32 with less than 4 bytes throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumeric('Float32', [0, 0, 0, 0, 0], false); },
				RangeError,
				'Float32 with more than 4 bytes throws a RangeError'
			);

			st['throws'](
				function () { ES.RawBytesToNumeric('Float64', [0, 0, 0, 0, 0, 0, 0], false); },
				RangeError,
				'Float64 with less than 8 bytes throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumeric('Float64', [0, 0, 0, 0, 0, 0, 0, 0, 0], false); },
				RangeError,
				'Float64 with more than 8 bytes throws a RangeError'
			);

			st['throws'](
				function () { ES.RawBytesToNumeric('Int8', [], false); },
				RangeError,
				'Int8 with less than 1 byte throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumeric('Int8', [0, 0], false); },
				RangeError,
				'Int8 with more than 1 byte throws a RangeError'
			);

			st['throws'](
				function () { ES.RawBytesToNumeric('Uint8', [], false); },
				RangeError,
				'Uint8 with less than 1 byte throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumeric('Uint8', [0, 0], false); },
				RangeError,
				'Uint8 with more than 1 byte throws a RangeError'
			);

			st['throws'](
				function () { ES.RawBytesToNumeric('Uint8C', [], false); },
				RangeError,
				'Uint8C with less than 1 byte throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumeric('Uint8C', [0, 0], false); },
				RangeError,
				'Uint8C with more than 1 byte throws a RangeError'
			);

			st['throws'](
				function () { ES.RawBytesToNumeric('Int16', [0], false); },
				RangeError,
				'Int16 with less than 2 bytes throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumeric('Uint8C', [0, 0, 0], false); },
				RangeError,
				'Int16 with more than 2 bytes throws a RangeError'
			);

			st['throws'](
				function () { ES.RawBytesToNumeric('Uint16', [0], false); },
				RangeError,
				'Uint16 with less than 2 bytes throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumeric('Uint16', [0, 0, 0], false); },
				RangeError,
				'Uint16 with more than 2 bytes throws a RangeError'
			);

			st['throws'](
				function () { ES.RawBytesToNumeric('Uint16', [0, 0, 0], false); },
				RangeError,
				'Uint16 with less than 4 bytes throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumeric('Uint16', [0, 0, 0, 0, 0], false); },
				RangeError,
				'Uint16 with more than 4 bytes throws a RangeError'
			);

			st['throws'](
				function () { ES.RawBytesToNumeric('Uint32', [0, 0, 0], false); },
				RangeError,
				'Uint32 with less than 4 bytes throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumeric('Uint32', [0, 0, 0, 0, 0], false); },
				RangeError,
				'Uint32 with more than 4 bytes throws a RangeError'
			);

			st['throws'](
				function () { ES.RawBytesToNumeric('BigInt64', [0, 0, 0, 0, 0, 0, 0], false); },
				RangeError,
				'BigInt64 with less than 8 bytes throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumeric('BigInt64', [0, 0, 0, 0, 0, 0, 0, 0, 0], false); },
				RangeError,
				'BigInt64 with more than 8 bytes throws a RangeError'
			);

			st['throws'](
				function () { ES.RawBytesToNumeric('BigUint64', [0, 0, 0, 0, 0, 0, 0], false); },
				RangeError,
				'BigUint64 with less than 8 bytes throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumeric('BigUint64', [0, 0, 0, 0, 0, 0, 0, 0, 0], false); },
				RangeError,
				'BigUint64 with more than 8 bytes throws a RangeError'
			);

			st.end();
		});

		t.test('bigint types, no bigints', { skip: hasBigInts }, function (st) {
			st['throws'](
				function () { ES.RawBytesToNumeric('BigInt64', [0, 0, 0, 0, 0, 0, 0, 0], false); },
				SyntaxError,
				'BigInt64 throws a SyntaxError when BigInt is not available'
			);
			st['throws'](
				function () { ES.RawBytesToNumeric('BigUint64', [0, 0, 0, 0, 0, 0, 0, 0], false); },
				SyntaxError,
				'BigUint64 throws a SyntaxError when BigInt is not available'
			);

			st.end();
		});

		t.end();
	});

	test('SameValueNonNumeric', function (t) {
		var willThrow = [
			[3, 4],
			[NaN, 4],
			[4, ''],
			['abc', true],
			[{}, false]
		].concat(flatMap(v.bigints, function (bigint) {
			return [
				[bigint, bigint],
				[bigint, {}],
				[{}, bigint],
				[3, bigint],
				[bigint, 3],
				['', bigint],
				[bigint, '']
			];
		}));
		forEach(willThrow, function (nums) {
			t['throws'](function () { return ES.SameValueNonNumeric.apply(ES, nums); }, TypeError, 'value must be same type and non-number/bigint: got ' + debug(nums[0]) + ' and ' + debug(nums[1]));
		});

		forEach(v.objects.concat(v.nonNumberPrimitives), function (val) {
			t.equal(val === val, ES.SameValueNonNumeric(val, val), debug(val) + ' is SameValueNonNumeric to itself');
		});

		t.end();
	});

	test('SetValueInBuffer', function (t) {
		var order = 'Unordered';

		forEach(v.primitives.concat(v.objects), function (nonAB) {
			t['throws'](
				function () { ES.SetValueInBuffer(nonAB, 0, 'Int8', 0, false, order); },
				TypeError,
				debug(nonAB) + ' is not an ArrayBuffer'
			);
		});

		t.test('ArrayBuffers supported', { skip: typeof ArrayBuffer !== 'function' }, function (st) {
			var isTypedArray = false; // only matters for SAB

			forEach(v.notNonNegativeIntegers, function (nonNonNegativeInteger) {
				st['throws'](
					function () { ES.SetValueInBuffer(new ArrayBuffer(8), nonNonNegativeInteger, 'Int8', 0, isTypedArray, order); },
					TypeError,
					debug(nonNonNegativeInteger) + ' is not a valid byte index'
				);
			});

			forEach(v.nonStrings.concat('not a valid type'), function (nonString) {
				st['throws'](
					function () { ES.SetValueInBuffer(new ArrayBuffer(8), 0, nonString, 0, isTypedArray, order); },
					TypeError,
					'type: ' + debug(nonString) + ' is not a valid String (or type) value'
				);
			});

			forEach(v.nonBooleans, function (nonBoolean) {
				st['throws'](
					function () { ES.SetValueInBuffer(new ArrayBuffer(8), 0, 'Int8', 0, nonBoolean, order); },
					TypeError,
					'isTypedArray: ' + debug(nonBoolean) + ' is not a valid Boolean value'
				);

				st['throws'](
					function () { ES.SetValueInBuffer(new ArrayBuffer(8), 0, 'Int8', 0, isTypedArray, order, nonBoolean); },
					TypeError,
					'isLittleEndian: ' + debug(nonBoolean) + ' is not a valid Boolean value'
				);
			});

			forEach(v.nonNumbers, function (nonNumber) {
				st['throws'](
					function () { ES.SetValueInBuffer(new ArrayBuffer(8), 0, 'Int8', nonNumber, isTypedArray, order); },
					TypeError,
					debug(nonNumber) + ' is not a valid Number or BigInt value'
				);
			});

			if (hasBigInts) {
				st['throws'](
					function () { ES.SetValueInBuffer(new ArrayBuffer(8), 0, 'Int8', $BigInt(0), isTypedArray, order); },
					TypeError,
					debug($BigInt(0)) + ' is not a number, but the given type requires one'
				);

				st['throws'](
					function () { ES.SetValueInBuffer(new ArrayBuffer(8), 0, 'BigUint64', 0, isTypedArray, order); },
					TypeError,
					debug(0) + ' is not a bigint, but the given type requires one'
				);
			}

			st['throws'](
				function () { ES.SetValueInBuffer(new ArrayBuffer(8), 0, 'Int8', 0, isTypedArray, 'invalid order'); },
				TypeError,
				'invalid order'
			);

			st.test('can detach', { skip: !canDetach }, function (s2t) {
				var buffer = new ArrayBuffer(8);
				s2t.equal(ES.DetachArrayBuffer(buffer), null, 'detaching returns null');

				s2t['throws'](
					function () { ES.SetValueInBuffer(buffer, 0, 'Int8', 0, isTypedArray, order); },
					TypeError,
					'detached buffers throw'
				);

				s2t.end();
			});

			st.test('SharedArrayBuffers supported', { skip: typeof SharedArrayBuffer !== 'function' }, function (s2t) {
				s2t['throws'](
					function () { ES.SetValueInBuffer(new SharedArrayBuffer(0), 0, 'Int8', 0, true, order); },
					SyntaxError,
					'SAB not yet supported'
				);

				s2t.end();
			});

			forEach(bufferTestCases, function (testCase, name) {
				forEach([].concat(
					'Int8',
					'Uint8',
					'Uint8C',
					'Int16',
					'Uint16',
					'Int32',
					'Uint32',
					hasBigInts ? bigIntTypes : [],
					'Float32',
					'Float64'
				), function (type) {
					var isBigInt = type === 'BigInt64' || type === 'BigUint64';
					var Z = isBigInt ? safeBigInt : Number;
					var elementSize = elementSizes['$' + (type === 'Uint8C' ? 'Uint8Clamped' : type) + 'Array'];
					var hasBigEndian = type !== 'Int8' && type !== 'Uint8' && type !== 'Uint8C'; // the 8-bit types are special, they don't have big-endian
					var result = testCase[type === 'Uint8C' ? 'Uint8Clamped' : type];
					var value = unserialize(testCase.value);

					if (isBigInt && (!isFinite(value) || Math.floor(value) !== value)) {
						return;
					}

					var valToSet = type === 'Uint8Clamped' && value > 255 ? 255 : Z(value);

					/*
					st.equal(
						ES.SetValueInBuffer(testCase.buffer, 0, type, true, order),
						defaultEndianness === testCase.endian ? testCase[type].little.value] : testCase[type].big.value,
						'buffer holding ' + debug(testCase.value) + ' (' + testCase.endian + ' endian) with type ' + type + ', default endian, yields expected value'
					);
					*/

					var buffer = new ArrayBuffer(elementSizes.$Float64Array);
					var copyBytes = new Uint8Array(buffer);

					clearBuffer(buffer);

					st.equal(
						ES.SetValueInBuffer(buffer, 0, type, valToSet, isTypedArray, order, true),
						void undefined,
						'returns undefined'
					);
					st.deepEqual(
						Array.prototype.slice.call(copyBytes, 0, elementSize),
						Array.prototype.slice.call(new Uint8Array(result[type === 'Float64' ? 'setAsLittle' : 'setAsTruncatedLittle'].bytes), 0, elementSize),
						'buffer holding ' + debug(value) + ' with type ' + type + ', little endian, yields expected value'
					);

					if (hasBigEndian) {
						clearBuffer(buffer);

						st.equal(
							ES.SetValueInBuffer(buffer, 0, type, valToSet, isTypedArray, order, false),
							void undefined,
							'returns undefined'
						);
						st.deepEqual(
							Array.prototype.slice.call(copyBytes, 0, elementSize),
							Array.prototype.slice.call(new Uint8Array(result[type === 'Float64' ? 'setAsBig' : 'setAsTruncatedBig'].bytes), 0, elementSizes[type + 'Array']),
							'buffer holding ' + debug(value) + ' with type ' + type + ', big endian, yields expected value'
						);
					}
				});
			});

			st.end();
		});

		t.end();
	});

	test('StringToBigInt', function (t) {
		test('actual BigInts', { skip: !hasBigInts }, function (st) {
			forEach(v.bigints, function (bigint) {
				st.equal(
					ES.StringToBigInt(String(bigint)),
					bigint,
					debug(String(bigint)) + ' becomes ' + debug(bigint)
				);
			});

			forEach(v.integerNumbers, function (int) {
				var bigint = safeBigInt(int);
				st.equal(
					ES.StringToBigInt(String(int)),
					bigint,
					debug(String(int)) + ' becomes ' + debug(bigint)
				);
			});

			forEach(v.nonIntegerNumbers, function (nonInt) {
				st.equal(
					ES.StringToBigInt(String(nonInt)),
					NaN,
					debug(String(nonInt)) + ' becomes NaN'
				);
			});

			st.equal(ES.StringToBigInt(''), BigInt(0), 'empty string becomes 0n');
			st.equal(ES.StringToBigInt('Infinity'), NaN, 'non-finite numeric string becomes NaN');

			st.end();
		});

		test('BigInt not supported', { skip: hasBigInts }, function (st) {
			st['throws'](
				function () { ES.StringToBigInt('0'); },
				SyntaxError,
				'throws a SyntaxError when BigInt is not available'
			);

			st.end();
		});

		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { ES.StringToBigInt(nonString); },
				TypeError,
				debug(nonString) + ' is not a string'
			);
		});

		t.end();
	});

	test('StringPad', function (t) {
		t['throws'](
			function () { ES.StringPad('', 0, '', 'not start or end'); },
			TypeError,
			'`placement` must be "start" or "end"'
		);

		t.equal(ES.StringPad('a', 3, '', 'start'), 'a');
		t.equal(ES.StringPad('a', 3, '', 'end'), 'a');
		t.equal(ES.StringPad('a', 3, undefined, 'start'), '  a');
		t.equal(ES.StringPad('a', 3, undefined, 'end'), 'a  ');
		t.equal(ES.StringPad('a', 3, '0', 'start'), '00a');
		t.equal(ES.StringPad('a', 3, '0', 'end'), 'a00');
		t.equal(ES.StringPad('a', 3, '012', 'start'), '01a');
		t.equal(ES.StringPad('a', 3, '012', 'end'), 'a01');
		t.equal(ES.StringPad('a', 7, '012', 'start'), '012012a');
		t.equal(ES.StringPad('a', 7, '012', 'end'), 'a012012');

		t.end();
	});

	test('thisBigIntValue', function (t) {
		test('actual BigInts', { skip: !hasBigInts }, function (st) {
			st.equal(ES.thisBigIntValue(BigInt(42)), BigInt(42));
			st.equal(ES.thisBigIntValue(Object(BigInt(42))), BigInt(42));

			st.end();
		});

		forEach(v.nonBigInts, function (nonBigInt) {
			t['throws'](
				function () { ES.thisBigIntValue(nonBigInt); },
				hasBigInts ? TypeError : SyntaxError,
				debug(nonBigInt) + ' is not a BigInt'
			);
		});

		t.end();
	});

	test('ToBigInt', function (t) {
		forEach([null, undefined].concat(v.symbols, v.numbers), function (nonBigIntCoercible) {
			t['throws'](
				function () { ES.ToBigInt(nonBigIntCoercible); },
				hasBigInts ? TypeError : SyntaxError,
				debug(nonBigIntCoercible) + ' throws'
			);
		});

		forEach(v.symbols, function (sym) {
			t['throws'](
				function () { ES.ToBigInt(sym); },
				hasBigInts ? TypeError : SyntaxError,
				debug(sym) + ' throws'
			);
		});

		test('actual BigInts', { skip: !hasBigInts }, function (st) {
			st.equal(ES.ToBigInt(true), BigInt(1), 'true becomes 1n');
			st.equal(ES.ToBigInt(false), BigInt(0), 'true becomes 0n');

			st.equal(ES.ToBigInt(''), BigInt(0), 'empty string becomes 0n');
			st['throws'](
				function () { ES.ToBigInt('a'); },
				TypeError,
				debug('a') + ' can not be parsed to a bigint'
			);

			forEach(v.bigints, function (bigint) {
				st.equal(
					ES.ToBigInt(bigint),
					bigint,
					debug(bigint) + ' remains ' + debug(bigint)
				);

				st.equal(
					ES.ToBigInt(String(bigint)),
					bigint,
					debug(String(bigint)) + ' becomes ' + debug(bigint)
				);
			});

			forEach(v.numbers, function (number) {
				st['throws'](
					function () { ES.ToBigInt(number); },
					TypeError,
					debug(number) + ' throws'
				);
			});

			forEach(v.integerNumbers, function (int) {
				st.equal(
					ES.ToBigInt(String(int)),
					safeBigInt(int),
					debug(String(int)) + ' becomes ' + debug(safeBigInt(int))
				);
			});

			forEach(v.nonIntegerNumbers, function (nonInt) {
				st['throws'](
					function () { ES.ToBigInt(nonInt); },
					TypeError,
					debug(nonInt) + ' is not an integer'
				);
			});

			st.end();
		});

		t.end();
	});

	test('ToBigInt64', { skip: !hasBigInts }, function (t) {
		var twoSixtyThreeMinusOne = twoSixtyThree - BigInt(1);
		var negTwoSixtyThreeMinusOne = -twoSixtyThree - BigInt(1);

		t.equal(ES.ToBigInt64(twoSixtyThreeMinusOne), twoSixtyThreeMinusOne, debug(twoSixtyThreeMinusOne) + ' returns itself');
		t.equal(ES.ToBigInt64(-twoSixtyThree), -twoSixtyThree, debug(-twoSixtyThree) + ' returns itself');

		t.equal(
			ES.ToBigInt64(twoSixtyThree),
			twoSixtyThree - twoSixtyFour,
			debug(twoSixtyThree) + ' returns ' + debug(twoSixtyThree - twoSixtyFour)
		);
		t.equal(
			ES.ToBigInt64(negTwoSixtyThreeMinusOne),
			twoSixtyFour - twoSixtyThree - BigInt(1),
			debug(negTwoSixtyThreeMinusOne) + ' returns ' + debug(twoSixtyFour - twoSixtyThree - BigInt(1))
		);

		t.end();
	});

	test('ToBigUint64', { skip: !hasBigInts }, function (t) {
		var twoSixtyFourMinusOne = twoSixtyFour - BigInt(1);
		var twoSixtyThreeMinusOne = twoSixtyThree - BigInt(1);
		var negTwoSixtyThreeMinusOne = -twoSixtyThree - BigInt(1);

		t.equal(ES.ToBigUint64(twoSixtyThreeMinusOne), twoSixtyThreeMinusOne, debug(twoSixtyThreeMinusOne) + ' returns itself');
		t.equal(ES.ToBigUint64(twoSixtyThree), twoSixtyThree, debug(twoSixtyThree) + ' returns itself');
		t.equal(ES.ToBigUint64(twoSixtyFourMinusOne), twoSixtyFourMinusOne, debug(twoSixtyFourMinusOne) + ' returns itself');
		t.equal(ES.ToBigUint64(-twoSixtyThree), twoSixtyThree, debug(-twoSixtyThree) + ' returns ' + debug(twoSixtyThree));

		t.equal(
			ES.ToBigUint64(twoSixtyFour),
			BigInt(0),
			debug(twoSixtyFour) + ' returns 0n'
		);
		t.equal(
			ES.ToBigUint64(negTwoSixtyThreeMinusOne),
			twoSixtyFour - twoSixtyThree - BigInt(1),
			debug(negTwoSixtyThreeMinusOne) + ' returns ' + debug(twoSixtyFour - twoSixtyThree - BigInt(1))
		);

		t.end();
	});

	test('ToInteger', function (t) {
		forEach([0, -0, NaN], function (num) {
			t.equal(ES.ToInteger(num), +0, debug(num) + ' returns +0');
		});
		forEach([Infinity, 42], function (num) {
			t.equal(ES.ToInteger(num), num, debug(num) + ' returns itself');
			t.equal(ES.ToInteger(-num), -num, '-' + debug(num) + ' returns itself');
		});
		t.equal(ES.ToInteger(Math.PI), 3, 'pi returns 3');
		t.equal(ES.ToInteger(-0.1), +0, '-0.1 truncates to +0, not -0');
		t['throws'](function () { return ES.ToInteger(v.uncoercibleObject); }, TypeError, 'uncoercibleObject throws');
		t.end();
	});

	test('ToNumber', function (t) {
		testToNumber(t, ES, ES.ToNumber);

		forEach(v.bigints, function (bigInt) {
			t['throws'](
				function () { ES.ToNumber(bigInt); },
				TypeError,
				'ToNumber of ' + debug(bigInt) + ' throws'
			);

			var boxed = Object(bigInt);
			t['throws'](
				function () { ES.ToNumber(boxed); },
				TypeError,
				'ToNumber of ' + debug(boxed) + ' throws'
			);
		});

		t.end();
	});

	test('UTF16DecodeSurrogatePair', function (t) {
		t['throws'](
			function () { ES.UTF16DecodeSurrogatePair('a'.charCodeAt(0), trailingPoo.charCodeAt(0)); },
			TypeError,
			'"a" is not a leading surrogate'
		);
		t['throws'](
			function () { ES.UTF16DecodeSurrogatePair(leadingPoo.charCodeAt(0), 'b'.charCodeAt(0)); },
			TypeError,
			'"b" is not a trailing surrogate'
		);

		t.equal(ES.UTF16DecodeSurrogatePair(leadingPoo.charCodeAt(0), trailingPoo.charCodeAt(0)), wholePoo);

		t.end();
	});

	test('NumberBitwiseOp', function (t) {
		t['throws'](
			function () { ES.NumberBitwiseOp('invalid', 0, 0); },
			TypeError,
			'throws with an invalid op'
		);

		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.NumberBitwiseOp('&', nonNumber, 0); },
				TypeError,
				'x: ' + debug(nonNumber) + ' is not a Number'
			);
			t['throws'](
				function () { ES.NumberBitwiseOp('&', 0, nonNumber); },
				TypeError,
				'y: ' + debug(nonNumber) + ' is not a Number'
			);
		});

		t.equal(ES.NumberBitwiseOp('&', 1, 2), 1 & 2);
		t.equal(ES.NumberBitwiseOp('|', 1, 2), 1 | 2);
		t.equal(ES.NumberBitwiseOp('^', 1, 2), 1 ^ 2);

		t.end();
	});

	test('ToNumeric', function (t) {
		testToNumber(t, ES, ES.ToNumeric);

		t.test('BigInts', { skip: !hasBigInts }, function (st) {
			st.equal(ES.ToNumeric(BigInt(42)), BigInt(42), debug(BigInt(42)) + ' is ' + debug(BigInt(42)));
			st.equal(ES.ToNumeric(Object(BigInt(42))), BigInt(42), debug(Object(BigInt(42))) + ' is ' + debug(BigInt(42)));

			var valueOf = { valueOf: function () { return BigInt(7); } };
			st.equal(ES.ToNumeric(valueOf), valueOf.valueOf(), debug(valueOf) + ' is ' + debug(valueOf.valueOf()));

			var toPrimitive = {};
			var value = BigInt(-2);
			toPrimitive[Symbol.toPrimitive] = function () { return value; };
			st.equal(ES.ToNumeric(toPrimitive), value, debug(toPrimitive) + ' is ' + debug(value));

			st.end();
		});

		t.end();
	});

	test('UTF16DecodeString', function (t) {
		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { ES.UTF16DecodeString(nonString); },
				TypeError,
				debug(nonString) + ' is not a String'
			);
		});

		t.deepEqual(ES.UTF16DecodeString('abc'), ['a', 'b', 'c'], 'code units get split');
		t.deepEqual(ES.UTF16DecodeString('a' + wholePoo + 'c'), ['a', wholePoo, 'c'], 'code points get split too');

		t.end();
	});
};

var es2021 = function ES2021(ES, ops, expectedMissing, skips) {
	es2020(ES, ops, expectedMissing, assign({}, skips, {
		IsInteger: true,
		IsNonNegativeInteger: true,
		SetFunctionLength: true,
		SplitMatch: true,
		ToInteger: true,
		UTF16DecodeString: true,
		UTF16DecodeSurrogatePair: true,
		UTF16Encoding: true,
		ValidateAtomicAccess: true
	}));
	var test = makeTest(ES, skips);

	test('AddToKeptObjects', function (t) {
		forEach(v.primitives, function (nonObject) {
			t['throws'](
				function () { ES.AddToKeptObjects(nonObject); },
				debug(nonObject) + ' is not an Object'
			);
		});

		t.equal(ES.AddToKeptObjects({}), undefined, 'returns nothing');

		t.end();
	});

	test('ApplyStringOrNumericBinaryOperator', function (t) {
		forEach(v.nonStrings.concat('', '^^', '//', '***'), function (nonOp) {
			t['throws'](
				function () { ES.ApplyStringOrNumericBinaryOperator(null, nonOp, null); },
				TypeError,
				'opText must be a valid operation: ' + debug(nonOp) + ' is not an operation'
			);
		});

		var obj = {
			toString: function () { return 'abc'; }
		};
		forEach(v.strings, function (string) {
			t.equal(
				ES.ApplyStringOrNumericBinaryOperator(string, '+', v.toStringOnlyObject),
				string + '7',
				debug(string) + ' + ' + debug(v.toStringOnlyObject) + ' is ' + debug(string + '7')
			);
			t.equal(
				ES.ApplyStringOrNumericBinaryOperator(v.toStringOnlyObject, '+', string),
				'7' + string,
				debug(v.toStringOnlyObject) + ' + ' + debug(string) + ' is ' + debug('7' + v.toStringOnlyObject)
			);
			t.equal(
				ES.ApplyStringOrNumericBinaryOperator(string, '+', string),
				string + string,
				debug(string) + ' + ' + debug(string) + ' is ' + debug(string + string)
			);

			t.equal(
				ES.ApplyStringOrNumericBinaryOperator(string, '+', obj),
				string + 'abc',
				debug(string) + ' + ' + debug(obj) + ' is ' + debug(string + 'abc')
			);
			t.equal(
				ES.ApplyStringOrNumericBinaryOperator(obj, '+', string),
				'abc' + string,
				debug(obj) + ' + ' + debug(string) + ' is ' + debug('abc' + string)
			);
		});
		t.equal(
			ES.ApplyStringOrNumericBinaryOperator(obj, '+', obj),
			'abcabc',
			debug(obj) + ' + ' + debug(obj) + ' is ' + debug('abcabc')
		);
		t.equal(
			ES.ApplyStringOrNumericBinaryOperator(v.toStringOnlyObject, '+', v.toStringOnlyObject),
			14,
			debug(v.toStringOnlyObject) + ' + ' + debug(v.toStringOnlyObject) + ' is 14'
		);

		forEach(v.numbers, function (number) {
			t.equal(
				ES.ApplyStringOrNumericBinaryOperator(number, '+', number),
				number + number,
				debug(number) + ' + itself is ' + debug(number + number)
			);
			t.equal(
				ES.ApplyStringOrNumericBinaryOperator(number, '-', number),
				number - number,
				debug(number) + ' - itself is ' + debug(number + number)
			);
			t.equal(
				ES.ApplyStringOrNumericBinaryOperator(number, '*', number),
				number * number,
				debug(number) + ' * itself is ' + debug(number + number)
			);
			t.equal(
				ES.ApplyStringOrNumericBinaryOperator(number, '**', number),
				Math.pow(number, number),
				debug(number) + ' ** itself is ' + debug(Math.pow(number, number))
			);
			t.equal(
				ES.ApplyStringOrNumericBinaryOperator(number, '/', number),
				number / number,
				debug(number) + ' / itself is ' + debug(number / number)
			);
			t.equal(
				ES.ApplyStringOrNumericBinaryOperator(number, '%', number),
				number % number,
				debug(number) + ' % itself is ' + debug(number % number)
			);
			t.equal(
				ES.ApplyStringOrNumericBinaryOperator(number, '<<', number),
				number << number,
				debug(number) + ' << itself is ' + debug(number << number)
			);
			t.equal(
				ES.ApplyStringOrNumericBinaryOperator(number, '>>', number),
				number >> number,
				debug(number) + ' >> itself is ' + debug(number >> number)
			);
			t.equal(
				ES.ApplyStringOrNumericBinaryOperator(number, '>>>', number),
				number >>> number,
				debug(number) + ' >>> itself is ' + debug(number >>> number)
			);
			t.equal(
				ES.ApplyStringOrNumericBinaryOperator(number, '&', number),
				number & number,
				debug(number) + ' & itself is ' + debug(number & number)
			);
			t.equal(
				ES.ApplyStringOrNumericBinaryOperator(number, '^', number),
				number ^ number,
				debug(number) + ' ^ itself is ' + debug(number ^ number)
			);
			t.equal(
				ES.ApplyStringOrNumericBinaryOperator(number, '|', number),
				number | number,
				debug(number) + ' | itself is ' + debug(number | number)
			);
		});

		t.test('BigInt support', { skip: !hasBigInts }, function (st) {
			forEach(v.bigints, function (bigint) {
				st['throws'](
					function () { ES.ApplyStringOrNumericBinaryOperator(Number(bigint), '+', bigint); },
					TypeError,
					'Number and BigInt can not be added'
				);
				st['throws'](
					function () { ES.ApplyStringOrNumericBinaryOperator(bigint, '+', Number(bigint)); },
					TypeError,
					'BigInt and Number can not be added'
				);
			});

			st.end();
		});

		t.end();
	});

	test('ByteListBitwiseOp', function (t) {
		t['throws'](
			function () { ES.ByteListBitwiseOp('+', [], []); },
			TypeError,
			'op must be &, ^, or |'
		);

		forEach(v.nonArrays, function (nonArray) {
			t['throws'](
				function () { ES.ByteListBitwiseOp('&', nonArray); },
				TypeError,
				'xBytes: ' + debug(nonArray) + ' is not a sequence of byte values'
			);

			t['throws'](
				function () { ES.ByteListBitwiseOp('&', [], nonArray); },
				TypeError,
				'yBytes: ' + debug(nonArray) + ' is not a sequence of byte values'
			);
		});

		t['throws'](
			function () { ES.ByteListBitwiseOp('&', [0], [0, 0]); },
			TypeError,
			'byte sequences must be the same length'
		);

		forEach([1.5, -1, 256], function (nonByte) {
			t['throws'](
				function () { ES.ByteListBitwiseOp('&', [nonByte], [1]); },
				TypeError,
				debug(nonByte) + ' is not a byte value'
			);
		});

		for (var i = 0; i <= 255; i += 1) {
			var j = i === 0 ? 1 : i - 1;
			t.deepEqual(ES.ByteListBitwiseOp('&', [i], [j]), [i & j], i + ' & ' + j);
			t.deepEqual(ES.ByteListBitwiseOp('^', [i], [j]), [i ^ j], i + ' ^ ' + j);
			t.deepEqual(ES.ByteListBitwiseOp('|', [i], [j]), [i | j], i + ' | ' + j);
		}

		t.end();
	});

	test('ByteListEqual', function (t) {
		forEach(v.nonArrays, function (nonArray) {
			t['throws'](
				function () { ES.ByteListEqual(nonArray); },
				TypeError,
				'xBytes: ' + debug(nonArray) + ' is not a sequence of byte values'
			);

			t['throws'](
				function () { ES.ByteListEqual([], nonArray); },
				TypeError,
				'yBytes: ' + debug(nonArray) + ' is not a sequence of byte values'
			);
		});

		t.equal(ES.ByteListEqual([0], [0, 0]), false, 'two sequences of different length are not equal');

		forEach([1.5, -1, 256], function (nonByte) {
			t['throws'](
				function () { ES.ByteListEqual([nonByte], [1]); },
				TypeError,
				debug(nonByte) + ' is not a byte value'
			);
		});

		for (var i = 0; i <= 255; i += 1) {
			t.equal(ES.ByteListEqual([i], [i]), true, 'two equal sequences of ' + i + ' are equal');
			t.equal(ES.ByteListEqual([i, i === 0 ? 1 : 0], [i === 0 ? 1 : 0, i]), false, 'two inequal sequences of ' + i + ' are not equal');
		}

		t.end();
	});

	test('clamp', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.clamp(nonNumber, -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER); },
				TypeError,
				'argument 1: ' + debug(nonNumber) + ' is not a number'
			);
			t['throws'](
				function () { ES.clamp(0, nonNumber, MAX_SAFE_INTEGER); },
				TypeError,
				'argument 2: ' + debug(nonNumber) + ' is not a number'
			);
			t['throws'](
				function () { ES.clamp(0, -MAX_SAFE_INTEGER, nonNumber); },
				TypeError,
				'argument 3: ' + debug(nonNumber) + ' is not a number'
			);
		});

		t.equal(ES.clamp(-1, 0, 2), 0, 'clamping -1 between 0 and 2 is 0');
		t.equal(ES.clamp(0, 0, 2), 0, 'clamping 0 between 0 and 2 is 0');
		t.equal(ES.clamp(1, 0, 2), 1, 'clamping 1 between 0 and 2 is 1');
		t.equal(ES.clamp(2, 0, 2), 2, 'clamping 2 between 0 and 2 is 2');
		t.equal(ES.clamp(3, 0, 2), 2, 'clamping 3 between 0 and 2 is 2');

		t.end();
	});

	test('ClearKeptObjects', function (t) {
		t.doesNotThrow(ES.ClearKeptObjects, 'appears to be a no-op');
		t.end();
	});

	test('CloneArrayBuffer', function (t) {
		forEach(v.primitives.concat(v.objects), function (nonArrayBuffer) {
			t['throws'](
				function () { ES.CloneArrayBuffer(nonArrayBuffer, 0, 0, Object); },
				TypeError,
				debug(nonArrayBuffer) + ' is not an ArrayBuffer'
			);
		});

		t.test('ArrayBuffers supported', { skip: typeof ArrayBuffer !== 'function' }, function (st) {
			var emptyBuffer = new ArrayBuffer(0);

			forEach(v.notNonNegativeIntegers, function (notNonNegativeInteger) {
				st['throws'](
					function () { ES.CloneArrayBuffer(emptyBuffer, notNonNegativeInteger, 0, ArrayBuffer); },
					TypeError,
					'srcByteOffset: ' + debug(notNonNegativeInteger) + ' is not a non-negative integer'
				);

				st['throws'](
					function () { ES.CloneArrayBuffer(emptyBuffer, 0, notNonNegativeInteger, ArrayBuffer); },
					TypeError,
					'srcLength: ' + debug(notNonNegativeInteger) + ' is not a non-negative integer'
				);
			});

			// node < 6 lacks Reflect.construct, so `v.nonConstructorFunctions` can't be detected
			forEach(v.nonFunctions.concat(typeof Reflect === 'object' ? v.nonConstructorFunctions : []), function (nonConstructor) {
				st['throws'](
					function () { ES.CloneArrayBuffer(emptyBuffer, 0, 0, nonConstructor); },
					TypeError,
					debug(nonConstructor) + ' is not a constructor'
				);
			});

			var a = new ArrayBuffer(8);
			var arrA = new Uint8Array(a);
			var eightInts = [1, 2, 3, 4, 5, 6, 7, 8];
			assign(arrA, eightInts);
			st.deepEqual(arrA, new Uint8Array(eightInts), 'initial buffer setup is correct');

			var b = ES.CloneArrayBuffer(a, 1, 4, ArrayBuffer);
			st.notEqual(b, a, 'cloned buffer is !== original buffer');
			var arrB = new Uint8Array(b);
			st.deepEqual(
				arrB,
				new Uint8Array([2, 3, 4, 5]),
				'cloned buffer follows the source byte offset and length'
			);

			st.end();
		});

		t.end();
	});

	test('CodePointsToString', function (t) {
		forEach(v.nonArrays, function (nonArray) {
			t['throws'](
				function () { ES.CodePointsToString(nonArray); },
				TypeError,
				debug(nonArray) + ' is not an Array of Code Points'
			);
		});

		forEach(v.notNonNegativeIntegers.concat(0x10FFFF + 1), function (nonCodePoint) {
			t['throws'](
				function () { ES.CodePointsToString([nonCodePoint]); },
				TypeError,
				debug(nonCodePoint) + ' is not a Code Point'
			);
		});

		t.equal(ES.CodePointsToString([0xD83D, 0xDCA9]), wholePoo, 'code points are converted to a string');

		t.end();
	});

	test('GetPromiseResolve', function (t) {
		forEach(v.nonFunctions.concat(v.nonConstructorFunctions), function (nonConstructor) {
			t['throws'](
				function () { ES.GetPromiseResolve(nonConstructor); },
				TypeError,
				debug(nonConstructor) + ' is not a constructor'
			);
		});

		forEach(v.nonFunctions, function (nonCallable) {
			var C = function C() {};
			C.resolve = nonCallable;

			t['throws'](
				function () { ES.GetPromiseResolve(C); },
				TypeError,
				'`resolve` method: ' + debug(nonCallable) + ' is not callable'
			);
		});

		t.test('Promises supported', { skip: typeof Promise !== 'function' }, function (st) {
			st.equal(ES.GetPromiseResolve(Promise), Promise.resolve, '`GetPromiseResolve(Promise) === Promise.resolve`');

			st.end();
		});

		var C = function () {};
		var resolve = function () {};
		C.resolve = resolve;
		t.equal(ES.GetPromiseResolve(C), resolve, 'returns a callable `resolve` property');

		t.end();
	});

	test('IsIntegralNumber', function (t) {
		for (var i = -100; i < 100; i += 10) {
			t.equal(true, ES.IsIntegralNumber(i), i + ' is integer');
			t.equal(false, ES.IsIntegralNumber(i + 0.2), (i + 0.2) + ' is not integer');
		}
		t.equal(true, ES.IsIntegralNumber(-0), '-0 is integer');
		var notInts = v.nonNumbers.concat(v.nonIntegerNumbers, v.infinities, [NaN, [], new Date()]);
		forEach(notInts, function (notInt) {
			t.equal(false, ES.IsIntegralNumber(notInt), debug(notInt) + ' is not integer');
		});
		t.equal(false, ES.IsIntegralNumber(v.uncoercibleObject), 'uncoercibleObject is not integer');
		t.end();
	});

	test('IterableToList', function (t) {
		// see ES2017 tests for the rest of the IterableToList tests

		t.deepEqual(
			ES.IterableToList(['a', 'b', 'c']),
			['a', 'b', 'c'],
			'method is optional in ES2021+'
		);

		t.end();
	});

	test('SetTypedArrayFromArrayLike', function (t) {
		forEach(v.primitives.concat(v.objects, [[]]), function (nonTA) {
			t['throws'](
				function () { ES.SetTypedArrayFromArrayLike(nonTA, 0, []); },
				TypeError,
				'target: ' + debug(nonTA) + ' is not a TypedArray'
			);
		});

		t.test('Typed Array Support', { skip: availableTypedArrays.length === 0 }, function (st) {
			forEach(v.notNonNegativeIntegers, function (notNonNegativeInteger) {
				if (notNonNegativeInteger !== Infinity) {
					st['throws'](
						function () { ES.SetTypedArrayFromArrayLike(new Uint8Array(0), notNonNegativeInteger, []); },
						TypeError,
						'targetOffset: ' + debug(notNonNegativeInteger) + ' is not a non-negative integer'
					);
				}
			});

			st['throws'](
				function () { ES.SetTypedArrayFromArrayLike(new Uint8Array(0), Infinity, []); },
				RangeError,
				'targetOffset: ' + debug(Infinity) + ' is not a finite integer'
			);

			st['throws'](
				function () { ES.SetTypedArrayFromArrayLike(new Uint8Array(0), 0, new Uint8Array(0)); },
				TypeError,
				'source: must not be a TypedArray'
			);

			st.test('can detach', { skip: !canDetach }, function (s2t) {
				var arr = new Uint8Array(0);
				ES.DetachArrayBuffer(arr.buffer);

				s2t['throws'](
					function () { ES.SetTypedArrayFromArrayLike(arr, 0, []); },
					TypeError,
					'target’s buffer must not be detached'
				);

				s2t.end();
			});

			forEach(availableTypedArrays, function (name) {
				var isBigInt = name.slice(0, 3) === 'Big';
				var Z = isBigInt ? safeBigInt : Number;
				var TA = global[name];

				var ta = new TA([Z(1), Z(2), Z(3)]);

				st['throws'](
					function () { ES.SetTypedArrayFromArrayLike(ta, 3, [Z(10)]); },
					RangeError,
					name + ': out of bounds set attempt throws'
				);

				ES.SetTypedArrayFromArrayLike(ta, 1, [Z(10)]);

				st.deepEqual(ta, new TA([Z(1), Z(10), Z(3)]), name + ': target is updated');
			});

			st.test('getters are supported, and can detach', { skip: !$defineProperty || !canDetach }, function (s2t) {
				var ta = new Uint8Array([1, 2, 3]);
				var obj = { length: 1 };
				$defineProperty(obj, '0', { get: function () { ES.DetachArrayBuffer(ta.buffer); return 10; } });

				s2t['throws'](
					function () { ES.SetTypedArrayFromArrayLike(ta, 1, obj); },
					TypeError,
					'when a Get detaches the buffer, it throws'
				);

				s2t.end();
			});

			st.end();
		});

		t.end();
	});

	test('SetTypedArrayFromTypedArray', { skip: availableTypedArrays.length === 0 }, function (t) {
		forEach(v.primitives.concat(v.objects, [[]]), function (nonTA) {
			t['throws'](
				function () { ES.SetTypedArrayFromTypedArray(nonTA, 0, new Uint8Array(0)); },
				TypeError,
				'target: ' + debug(nonTA) + ' is not a TypedArray'
			);

			t['throws'](
				function () { ES.SetTypedArrayFromTypedArray(new Uint8Array(0), 0, nonTA); },
				TypeError,
				'source: ' + debug(nonTA) + ' is not a TypedArray'
			);
		});

		forEach(v.notNonNegativeIntegers, function (notNonNegativeInteger) {
			if (notNonNegativeInteger !== Infinity) {
				t['throws'](
					function () { ES.SetTypedArrayFromTypedArray(new Uint8Array(0), notNonNegativeInteger, new Uint8Array(0)); },
					TypeError,
					'targetOffset: ' + debug(notNonNegativeInteger) + ' is not a non-negative integer'
				);
			}
		});

		t['throws'](
			function () { ES.SetTypedArrayFromTypedArray(new Uint8Array(0), Infinity, new Uint8Array(0)); },
			RangeError,
			'targetOffset: ' + debug(Infinity) + ' is not a finite integer'
		);

		t.test('can detach', { skip: !canDetach }, function (st) {
			var arr = new Uint8Array(0);
			ES.DetachArrayBuffer(arr.buffer);

			st['throws'](
				function () { ES.SetTypedArrayFromTypedArray(arr, 0, new Uint8Array(0)); },
				TypeError,
				'target’s buffer must not be detached'
			);

			st['throws'](
				function () { ES.SetTypedArrayFromTypedArray(new Uint8Array(0), 0, arr); },
				TypeError,
				'source’s buffer must not be detached'
			);

			st.end();
		});

		forEach(availableTypedArrays, function (name) {
			var isBigInt = name.slice(0, 3) === 'Big';
			var Z = isBigInt ? safeBigInt : Number;
			var TA = global[name];

			var ta = new TA([Z(1), Z(2), Z(3)]);

			t['throws'](
				function () { ES.SetTypedArrayFromTypedArray(ta, 3, new TA([Z(10)])); },
				RangeError,
				name + ': out of bounds set attempt throws'
			);

			ES.SetTypedArrayFromTypedArray(ta, 1, new TA([Z(10)]));

			t.deepEqual(ta, new TA([Z(1), Z(10), Z(3)]), name + ': target is updated');

			if (!isBigInt) {
				var DiffTA = name === 'Float32Array' ? Float64Array : Float32Array;
				var diffTypeTA = new DiffTA([10]);

				ES.SetTypedArrayFromTypedArray(diffTypeTA, 0, new TA([20]));

				t.deepEqual(diffTypeTA, new DiffTA([20]));
			}
		});

		t.test('mixed content type', { skip: !hasBigInts || typeof BigInt64Array !== 'function' }, function (st) {
			var bta = new BigInt64Array([$BigInt(0)]);
			var nta = new Float64Array([0]);

			st['throws'](
				function () { ES.SetTypedArrayFromTypedArray(bta, 0, nta); },
				TypeError,
				'number into bigint throws'
			);

			st['throws'](
				function () { ES.SetTypedArrayFromTypedArray(nta, 0, bta); },
				TypeError,
				'bigint into number throws'
			);

			st.end();
		});

		// TODO: add a test where source and target have the same buffer,
		// covering that the AO uses CloneArrayBuffer,
		// presumably so as not to overwrite the source data as the same buffer is written to

		t.end();
	});

	test('SetFunctionLength', function (t) {
		forEach(v.nonFunctions, function (nonFunction) {
			t['throws'](
				function () { ES.SetFunctionLength(nonFunction, 0); },
				TypeError,
				debug(nonFunction) + ' is not a Function'
			);
		});

		t.test('non-extensible function', { skip: !Object.preventExtensions }, function (st) {
			var F = function F() {};
			Object.preventExtensions(F);

			st['throws'](
				function () { ES.SetFunctionLength(F, 0); },
				TypeError,
				'non-extensible function throws'
			);
			st.end();
		});

		var HasLength = function HasLength(_) { return _; };
		t.equal(hasOwn(HasLength, 'length'), true, 'precondition: `HasLength` has own length');
		t['throws'](
			function () { ES.SetFunctionLength(HasLength, 0); },
			TypeError,
			'function with own length throws'
		);

		t.test('no length', { skip: !functionsHaveConfigurableNames }, function (st) {
			var HasNoLength = function HasNoLength() {};
			delete HasNoLength.length;

			st.equal(hasOwn(HasNoLength, 'length'), false, 'precondition: `HasNoLength` has no own length');

			forEach(v.nonNumbers, function (nonNumber) {
				st['throws'](
					function () { ES.SetFunctionLength(HasNoLength, nonNumber); },
					TypeError,
					debug(nonNumber) + ' is not a Number'
				);
			});

			forEach([-1, -42, -Infinity].concat(v.nonIntegerNumbers), function (nonPositiveInteger) {
				st['throws'](
					function () { ES.SetFunctionLength(HasNoLength, nonPositiveInteger); },
					TypeError,
					debug(nonPositiveInteger) + ' is not a positive integer Number'
				);
			});

			st.end();
		});

		// TODO: ensure it works with +Infinity
		// TODO: defines an own configurable non-enum non-write length property

		t.end();
	});

	test('SplitMatch', function (t) {
		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { ES.SplitMatch(nonString, 0, ''); },
				TypeError,
				'S: ' + debug(nonString) + ' is not a String'
			);
			t['throws'](
				function () { ES.SplitMatch('', 0, nonString); },
				TypeError,
				'R: ' + debug(nonString) + ' is not a String'
			);
		});

		forEach(v.nonNumbers.concat(v.nonIntegerNumbers), function (nonIntegerNumber) {
			t['throws'](
				function () { ES.SplitMatch('', nonIntegerNumber, ''); },
				TypeError,
				'q: ' + debug(nonIntegerNumber) + ' is not an integer'
			);
		});

		t.equal(ES.SplitMatch('abc', 0, 'a'), 1, '"a" is found at index 0, before index 1, in "abc"');
		t.equal(ES.SplitMatch('abc', 1, 'a'), 'not-matched', '"a" is not found at index 1 in "abc"');
		t.equal(ES.SplitMatch('abc', 2, 'a'), 'not-matched', '"a" is not found at index 2 in "abc"');

		t.equal(ES.SplitMatch('abc', 0, 'b'), 'not-matched', '"a" is not found at index 0 in "abc"');
		t.equal(ES.SplitMatch('abc', 1, 'b'), 2, '"b" is found at index 1, before index 2, in "abc"');
		t.equal(ES.SplitMatch('abc', 2, 'b'), 'not-matched', '"a" is not found at index 2 in "abc"');

		t.equal(ES.SplitMatch('abc', 0, 'c'), 'not-matched', '"a" is not found at index 0 in "abc"');
		t.equal(ES.SplitMatch('abc', 1, 'c'), 'not-matched', '"a" is not found at index 1 in "abc"');
		t.equal(ES.SplitMatch('abc', 2, 'c'), 3, '"c" is found at index 2, before index 3, in "abc"');

		t.equal(ES.SplitMatch('a', 0, 'ab'), 'not-matched', 'R longer than S yields false');

		var s = 'a' + wholePoo + 'c';
		t.equal(ES.SplitMatch(s, 1, wholePoo), 3, debug(wholePoo) + ' is found at index 1, before index 3, in ' + debug(s));

		t.end();
	});

	test('StringIndexOf', function (t) {
		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { ES.StringIndexOf(nonString); },
				TypeError,
				'`string` arg: ' + debug(nonString) + ' is not a String'
			);

			t['throws'](
				function () { ES.StringIndexOf('', nonString); },
				TypeError,
				'`searchValue` arg: ' + debug(nonString) + ' is not a String'
			);
		});

		forEach(v.notNonNegativeIntegers, function (notNonNegativeInteger) {
			t['throws'](
				function () { ES.StringIndexOf('', '', notNonNegativeInteger); },
				TypeError,
				'`fromIndex` arg: ' + debug(notNonNegativeInteger) + ' is not a non-negative integer'
			);
		});

		var str = 'abc' + wholePoo + 'abc';
		t.equal(ES.StringIndexOf(str, 'a', 0), 0, 'a: first index found');
		t.equal(ES.StringIndexOf(str, 'a', 1), 5, 'a: second index found');
		t.equal(ES.StringIndexOf(str, 'a', 6), -1, 'a: second index not found');

		t.equal(ES.StringIndexOf(str, 'b', 0), 1, 'b: first index found');
		t.equal(ES.StringIndexOf(str, 'b', 2), 6, 'b: second index found');
		t.equal(ES.StringIndexOf(str, 'b', 7), -1, 'b: second index not found');

		t.equal(ES.StringIndexOf(str, 'c', 0), 2, 'c: first index found');
		t.equal(ES.StringIndexOf(str, 'c', 3), 7, 'c: second index found');
		t.equal(ES.StringIndexOf(str, 'c', 8), -1, 'c: second index not found');

		t.equal(ES.StringIndexOf(str, leadingPoo, 0), 3, 'first half of ' + wholePoo + ' found');
		t.equal(ES.StringIndexOf(str, leadingPoo, 4), -1, 'first half of ' + wholePoo + ' not found');
		t.equal(ES.StringIndexOf(str, trailingPoo, 0), 4, 'second half of ' + wholePoo + ' found');
		t.equal(ES.StringIndexOf(str, trailingPoo, 5), -1, 'second half of ' + wholePoo + ' not found');
		t.equal(ES.StringIndexOf(str, wholePoo, 0), 3, wholePoo + ' found');
		t.equal(ES.StringIndexOf(str, wholePoo, 4), -1, wholePoo + ' not found');

		t.equal(ES.StringIndexOf('', 'a', 0), -1, 'empty string contains nothing');
		for (var i = 0; i < str.length; i += 1) {
			t.equal(ES.StringIndexOf(str, '', i), i, 'empty string is found at every index: ' + i);
		}

		t.end();
	});

	test('StringToCodePoints', function (t) {
		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { ES.StringToCodePoints(nonString); },
				TypeError,
				debug(nonString) + ' is not a String'
			);
		});

		t.deepEqual(ES.StringToCodePoints('abc'), ['a', 'b', 'c'], 'code units get split');
		t.deepEqual(ES.StringToCodePoints('a' + wholePoo + 'c'), ['a', wholePoo, 'c'], 'code points get split too');

		t.end();
	});

	test('substring', function (t) {
		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { ES.substring(nonString, 0, 0); },
				TypeError,
				debug(nonString) + ' is not a String'
			);
		});

		forEach(v.nonNumbers.concat(v.nonIntegerNumbers), function (nonIntegerNumber) {
			t['throws'](
				function () { ES.substring('', nonIntegerNumber); },
				TypeError,
				'inclusiveStart, no end: ' + debug(nonIntegerNumber) + ' is not an integer'
			);

			t['throws'](
				function () { ES.substring('', nonIntegerNumber, 0); },
				TypeError,
				'inclusiveStart: ' + debug(nonIntegerNumber) + ' is not an integer'
			);

			t['throws'](
				function () { ES.substring('', 0, nonIntegerNumber); },
				TypeError,
				'exclusiveEnd: ' + debug(nonIntegerNumber) + ' is not an integer'
			);
		});

		t.equal(ES.substring('abc', 0), 'abc', 'substring of S from 0 works');
		t.equal(ES.substring('abc', 1), 'bc', 'substring of S from 1 works');
		t.equal(ES.substring('abc', 2), 'c', 'substring of S from 2 works');
		t.equal(ES.substring('abc', 3), '', 'substring of S from 3 works');

		t.equal(ES.substring('abc', 0, 1), 'a', 'substring of S from 0 to 1 works');
		t.equal(ES.substring('abc', 1, 1), '', 'substring of S from 1 to 1 works');
		t.equal(ES.substring('abc', 2, 1), '', 'substring of S from 2 to 1 works');
		t.equal(ES.substring('abc', 3, 1), '', 'substring of S from 3 to 1 works');

		t.equal(ES.substring('abc', 0, 2), 'ab', 'substring of S from 0 to 2 works');
		t.equal(ES.substring('abc', 1, 2), 'b', 'substring of S from 1 to 2 works');
		t.equal(ES.substring('abc', 2, 2), '', 'substring of S from 2 to 2 works');
		t.equal(ES.substring('abc', 3, 2), '', 'substring of S from 3 to 2 works');

		t.equal(ES.substring('abc', 0, 3), 'abc', 'substring of S from 0 to 3 works');
		t.equal(ES.substring('abc', 1, 3), 'bc', 'substring of S from 1 to 3 works');
		t.equal(ES.substring('abc', 2, 3), 'c', 'substring of S from 2 to 3 works');
		t.equal(ES.substring('abc', 3, 3), '', 'substring of S from 3 to 3 works');

		t.equal(ES.substring('abc', 0, 4), 'abc', 'substring of S from 0 to 4 works');
		t.equal(ES.substring('abc', 1, 4), 'bc', 'substring of S from 1 to 4 works');
		t.equal(ES.substring('abc', 2, 4), 'c', 'substring of S from 2 to 4 works');
		t.equal(ES.substring('abc', 3, 4), '', 'substring of S from 3 to 4 works');

		t.end();
	});

	test('ToIntegerOrInfinity', function (t) {
		forEach([0, -0, NaN], function (num) {
			t.equal(ES.ToIntegerOrInfinity(num), +0, debug(num) + ' returns +0');
		});
		forEach([Infinity, 42], function (num) {
			t.equal(ES.ToIntegerOrInfinity(num), num, debug(num) + ' returns itself');
			t.equal(ES.ToIntegerOrInfinity(-num), -num, '-' + debug(num) + ' returns itself');
		});
		t.equal(ES.ToIntegerOrInfinity(Math.PI), 3, 'pi returns 3');
		t.equal(ES.ToIntegerOrInfinity(-0.1), +0, '-0.1 truncates to +0, not -0');
		t['throws'](function () { return ES.ToIntegerOrInfinity(v.uncoercibleObject); }, TypeError, 'uncoercibleObject throws');
		t.end();
	});

	test('UTF16SurrogatePairToCodePoint', function (t) {
		t['throws'](
			function () { ES.UTF16SurrogatePairToCodePoint('a'.charCodeAt(0), trailingPoo.charCodeAt(0)); },
			TypeError,
			'"a" is not a leading surrogate'
		);
		t['throws'](
			function () { ES.UTF16SurrogatePairToCodePoint(leadingPoo.charCodeAt(0), 'b'.charCodeAt(0)); },
			TypeError,
			'"b" is not a trailing surrogate'
		);

		t.equal(ES.UTF16SurrogatePairToCodePoint(leadingPoo.charCodeAt(0), trailingPoo.charCodeAt(0)), wholePoo);

		t.end();
	});

	test('UTF16EncodeCodePoint', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.UTF16EncodeCodePoint(nonNumber); },
				TypeError,
				debug(nonNumber) + ' is not a Number'
			);
		});

		t['throws'](
			function () { ES.UTF16EncodeCodePoint(-1); },
			TypeError,
			'-1 is < 0'
		);

		t['throws'](
			function () { ES.UTF16EncodeCodePoint(0x10FFFF + 1); },
			TypeError,
			'0x10FFFF + 1 is > 0x10FFFF'
		);

		t.equal(ES.UTF16EncodeCodePoint(0xd83d), leadingPoo.charAt(0), '0xD83D is the first half of ' + wholePoo);
		t.equal(ES.UTF16EncodeCodePoint(0xdca9), trailingPoo.charAt(0), '0xD83D is the last half of ' + wholePoo);
		t.equal(ES.UTF16EncodeCodePoint(0x10000), '𐀀', '0x10000 is "𐀀"');

		t.end();
	});

	test('ValidateAtomicAccess', function (t) {
		forEach(v.primitives.concat(v.objects, [[]]), function (nonTA) {
			t['throws'](
				function () { ES.ValidateAtomicAccess(nonTA, 0); },
				TypeError,
				debug(nonTA) + ' is not a TypedArray'
			);
		});

		t.test('actual typed arrays', { skip: availableTypedArrays.length === 0 }, function (st) {
			forEach(availableTypedArrays, function (TypedArray) {
				var ta = new global[TypedArray](8);

				st.doesNotThrow(
					function () { ES.ValidateAtomicAccess(ta, 0); },
					debug(ta) + ' is an integer TypedArray'
				);

				st['throws'](
					function () { ES.ValidateAtomicAccess(ta, -1); },
					RangeError, // via ToIndex
					'a requestIndex of -1 is <= 0'
				);
				st['throws'](
					function () { ES.ValidateAtomicAccess(ta, 8); },
					RangeError,
					'a requestIndex === length throws'
				);
				st['throws'](
					function () { ES.ValidateAtomicAccess(ta, 9); },
					RangeError,
					'a requestIndex > length throws'
				);

				var elementSize = elementSizes['$' + TypedArray];

				st.equal(ES.ValidateAtomicAccess(ta, 0), elementSize * 0, TypedArray + ': requestIndex of 0 gives 0');
				st.equal(ES.ValidateAtomicAccess(ta, 1), elementSize * 1, TypedArray + ': requestIndex of 1 gives ' + (elementSize * 1));
				st.equal(ES.ValidateAtomicAccess(ta, 2), elementSize * 2, TypedArray + ': requestIndex of 1 gives ' + (elementSize * 2));
				st.equal(ES.ValidateAtomicAccess(ta, 3), elementSize * 3, TypedArray + ': requestIndex of 1 gives ' + (elementSize * 3));
				st.equal(ES.ValidateAtomicAccess(ta, 4), elementSize * 4, TypedArray + ': requestIndex of 1 gives ' + (elementSize * 4));
				st.equal(ES.ValidateAtomicAccess(ta, 5), elementSize * 5, TypedArray + ': requestIndex of 1 gives ' + (elementSize * 5));
				st.equal(ES.ValidateAtomicAccess(ta, 6), elementSize * 6, TypedArray + ': requestIndex of 1 gives ' + (elementSize * 6));
				st.equal(ES.ValidateAtomicAccess(ta, 7), elementSize * 7, TypedArray + ': requestIndex of 1 gives ' + (elementSize * 7));
			});

			st.end();
		});

		t.end();
	});

	test('ValidateIntegerTypedArray', function (t) {
		forEach(v.nonBooleans, function (nonBoolean) {
			t['throws'](
				function () { ES.ValidateIntegerTypedArray(null, nonBoolean); },
				TypeError,
				debug(nonBoolean) + ' is not a Boolean'
			);
		});

		forEach(v.primitives.concat(v.objects, [[]]), function (nonTA) {
			t['throws'](
				function () { ES.ValidateIntegerTypedArray(nonTA); },
				TypeError,
				debug(nonTA) + ' is not a TypedArray'
			);
		});

		t.test('actual typed arrays', { skip: availableTypedArrays.length === 0 }, function (st) {
			forEach(availableTypedArrays, function (TypedArray) {
				var ta = new global[TypedArray](0);
				var shouldThrow = TypedArray.indexOf('Clamped') > -1 || !(/Int|Uint/).test(TypedArray);
				if (shouldThrow) {
					st['throws'](
						function () { ES.ValidateIntegerTypedArray(ta); },
						TypeError,
						debug(ta) + ' is not an integer TypedArray'
					);
				} else {
					st.doesNotThrow(
						function () { ES.ValidateIntegerTypedArray(ta); },
						debug(ta) + ' is an integer TypedArray'
					);
				}

				var isWaitable = TypedArray === 'Int32Array' || TypedArray === 'BigInt64Array';
				if (isWaitable) {
					st.doesNotThrow(
						function () { ES.ValidateIntegerTypedArray(ta, true); },
						debug(ta) + ' is a waitable integer TypedArray'
					);
				} else {
					st['throws'](
						function () { ES.ValidateIntegerTypedArray(ta, true); },
						TypeError,
						debug(ta) + ' is not a waitable integer TypedArray'
					);
				}
			});

			st.end();
		});

		t.end();
	});

	test('WeakRefDeref', function (t) {
		forEach(v.primitives.concat(v.objects), function (nonWeakRef) {
			t['throws'](
				function () { ES.WeakRefDeref(nonWeakRef); },
				TypeError,
				debug(nonWeakRef) + ' is not a WeakRef'
			);
		});

		t.test('WeakRefs', { skip: typeof WeakRef !== 'function' }, function (st) {
			var sentinel = {};
			var weakRef = new WeakRef({ foo: sentinel });

			st.deepEqual(ES.WeakRefDeref(weakRef), { foo: sentinel }, 'weakRef is dereferenced');

			st.end();
		});

		t.end();
	});
};

var es2022 = function ES2022(ES, ops, expectedMissing, skips) {
	es2021(ES, ops, expectedMissing, assign({}, skips, {
		'Abstract Equality Comparison': true,
		'Abstract Relational Comparison': true,
		GetSubstitution: true,
		'Strict Equality Comparison': true,
		SplitMatch: true,
		StringToBigInt: true
	}));

	var test = makeTest(ES, skips);

	test('CreateNonEnumerableDataPropertyOrThrow', function (t) {
		forEach(v.primitives, function (primitive) {
			t['throws'](
				function () { ES.CreateNonEnumerableDataPropertyOrThrow(primitive, 'key'); },
				TypeError,
				'O must be an Object; ' + debug(primitive) + ' is not one'
			);
		});

		forEach(v.nonPropertyKeys, function (nonPropertyKey) {
			t['throws'](
				function () { ES.CreateNonEnumerableDataPropertyOrThrow({}, nonPropertyKey); },
				TypeError,
				debug(nonPropertyKey) + ' is not a Property Key'
			);
		});

		t.test('defines correctly', function (st) {
			var obj = {};
			var key = 'the key';
			var value = { foo: 'bar' };

			st.equal(ES.CreateNonEnumerableDataPropertyOrThrow(obj, key, value), true, 'defines property successfully');
			st.test('property descriptor', { skip: !getOwnPropertyDescriptor }, function (s2t) {
				s2t.deepEqual(
					getOwnPropertyDescriptor(obj, key),
					{
						configurable: true,
						enumerable: false,
						value: value,
						writable: true
					},
					'sets the correct property descriptor'
				);

				s2t.end();
			});
			st.equal(obj[key], value, 'sets the correct value');

			st.end();
		});

		t.test('fails as expected on a frozen object', { skip: !Object.freeze }, function (st) {
			var obj = Object.freeze({ foo: 'bar' });
			st['throws'](
				function () { ES.CreateNonEnumerableDataPropertyOrThrow(obj, 'foo', { value: 'baz' }); },
				TypeError,
				'nonconfigurable key can not be defined'
			);

			st.end();
		});

		t.test('fails as expected on a function with a nonconfigurable name', { skip: !functionsHaveNames || functionsHaveConfigurableNames }, function (st) {
			st['throws'](
				function () { ES.CreateNonEnumerableDataPropertyOrThrow(function () {}, 'name', { value: 'baz' }); },
				TypeError,
				'nonconfigurable function name can not be defined'
			);
			st.end();
		});

		t.end();
	});

	test('DefineMethodProperty', function (t) {
		var enumerable = true;
		var nonEnumerable = false;

		forEach(v.primitives, function (nonObject) {
			t['throws'](
				function () { ES.DefineMethodProperty(nonObject, 'key', function () {}, enumerable); },
				TypeError,
				'O must be an Object; ' + debug(nonObject) + ' is not one'
			);
		});

		forEach(v.nonPropertyKeys, function (nonPropertyKey) {
			t['throws'](
				function () { ES.DefineMethodProperty({}, nonPropertyKey, function () {}, enumerable); },
				TypeError,
				debug(nonPropertyKey) + ' is not a Property Key'
			);
		});

		forEach(v.nonFunctions, function (nonFunction) {
			t['throws'](
				function () { ES.DefineMethodProperty({}, 'key', nonFunction, enumerable); },
				TypeError,
				debug(nonFunction) + ' is not a Function'
			);
		});

		forEach(v.nonBooleans, function (nonBoolean) {
			t['throws'](
				function () { ES.DefineMethodProperty({}, 'key', function () {}, nonBoolean); },
				TypeError,
				debug(nonBoolean) + ' is not a Boolean'
			);
		});

		t.test('non-extensible object', { skip: !Object.preventExtensions }, function (st) {
			var obj = {};
			Object.preventExtensions(obj);

			st['throws'](
				function () { ES.DefineMethodProperty(obj, 'key', function () {}, enumerable); },
				TypeError,
				'non-extensible object can not have a method defined'
			);

			st.end();
		});

		t.test('defining an enumerable method', function (st) {
			var obj = {};
			var key = 'the key';
			var value = function () {};

			st.doesNotThrow(
				function () { ES.DefineMethodProperty(obj, key, value, enumerable); },
				'defines property successfully'
			);

			st.equal(obj[key], value, 'sets the correct value');
			st.deepEqual(
				getOwnPropertyDescriptor(obj, key),
				{
					configurable: true,
					enumerable: true,
					value: value,
					writable: true
				},
				'sets the correct property descriptor'
			);

			st.end();
		});

		// test defining a non-enumerable property when descriptors are supported
		t.test('defining a non-enumerable method', { skip: !defineProperty || !getOwnPropertyDescriptor }, function (st) {
			var obj = {};
			var key = 'the key';
			var value = function () {};

			st.doesNotThrow(
				function () { ES.DefineMethodProperty(obj, key, value, nonEnumerable); },
				'defines property successfully'
			);

			st.equal(obj[key], value, 'sets the correct value');
			st.deepEqual(
				getOwnPropertyDescriptor(obj, key),
				{
					configurable: true,
					enumerable: false,
					value: value,
					writable: true
				},
				'sets the correct property descriptor'
			);

			st.end();
		});

		// test defining over a nonconfigurable property when descriptors are supported (unless there's an ES3 builtin that's nonconfigurable)
		t.test('defining over a nonconfigurable property', { skip: !defineProperty || !getOwnPropertyDescriptor }, function (st) {
			var obj = {};
			var key = 'the key';
			defineProperty(obj, key, {
				configurable: false,
				enumerable: true,
				value: 'foo',
				writable: true
			});
			var value = function () {};

			st['throws'](
				function () { ES.DefineMethodProperty(obj, key, value, enumerable); },
				TypeError,
				'nonconfigurable key can not be redefined'
			);

			st.end();
		});

		t.end();
	});

	test('GetMatchIndexPair', function (t) {
		forEach(v.nonStrings, function (notString) {
			t['throws'](
				function () { return ES.GetMatchIndexPair(notString); },
				TypeError,
				debug(notString) + ' is not a string'
			);
		});

		forEach(v.primitives.concat(
			v.objects,
			{ '[[StartIndex]]': -1 },
			{ '[[StartIndex]]': 1.2, '[[EndIndex]]': 0 },
			{ '[[StartIndex]]': 1, '[[EndIndex]]': 0 }
		), function (notMatchRecord) {
			t['throws'](
				function () { return ES.GetMatchIndexPair('', notMatchRecord); },
				TypeError,
				debug(notMatchRecord) + ' is not a Match Record'
			);
		});

		var invalidStart = { '[[StartIndex]]': 1, '[[EndIndex]]': 2 };
		t['throws'](
			function () { return ES.GetMatchIndexPair('', invalidStart); },
			TypeError,
			debug(invalidStart) + ' has a [[StartIndex]] that is > the length of the string'
		);

		var invalidEnd = { '[[StartIndex]]': 0, '[[EndIndex]]': 1 };
		t['throws'](
			function () { return ES.GetMatchIndexPair('', invalidEnd); },
			TypeError,
			debug(invalidEnd) + ' has an [[EndIndex]] that is > the length of the string'
		);

		t.deepEqual(
			ES.GetMatchIndexPair('', { '[[StartIndex]]': 0, '[[EndIndex]]': 0 }),
			[0, 0]
		);
		t.deepEqual(
			ES.GetMatchIndexPair('abc', { '[[StartIndex]]': 1, '[[EndIndex]]': 2 }),
			[1, 2]
		);

		t.end();
	});

	test('GetMatchString', function (t) {
		forEach(v.nonStrings, function (notString) {
			t['throws'](
				function () { return ES.GetMatchString(notString); },
				TypeError,
				debug(notString) + ' is not a string'
			);
		});

		forEach(v.primitives.concat(
			v.objects,
			{ '[[StartIndex]]': -1 },
			{ '[[StartIndex]]': 1.2, '[[EndIndex]]': 0 },
			{ '[[StartIndex]]': 1, '[[EndIndex]]': 0 }
		), function (notMatchRecord) {
			t['throws'](
				function () { return ES.GetMatchString('', notMatchRecord); },
				TypeError,
				debug(notMatchRecord) + ' is not a Match Record'
			);
		});

		var invalidStart = { '[[StartIndex]]': 1, '[[EndIndex]]': 2 };
		t['throws'](
			function () { return ES.GetMatchString('', invalidStart); },
			TypeError,
			debug(invalidStart) + ' has a [[StartIndex]] that is > the length of the string'
		);

		var invalidEnd = { '[[StartIndex]]': 0, '[[EndIndex]]': 1 };
		t['throws'](
			function () { return ES.GetMatchString('', invalidEnd); },
			TypeError,
			debug(invalidEnd) + ' has an [[EndIndex]] that is > the length of the string'
		);

		t.equal(
			ES.GetMatchString('', { '[[StartIndex]]': 0, '[[EndIndex]]': 0 }),
			''
		);
		t.equal(
			ES.GetMatchString('abc', { '[[StartIndex]]': 1, '[[EndIndex]]': 2 }),
			'b'
		);

		t.end();
	});

	test('GetStringIndex', function (t) {
		forEach(v.nonStrings, function (notString) {
			t['throws'](
				function () { return ES.GetStringIndex(notString); },
				TypeError,
				'`S`: ' + debug(notString) + ' is not a string'
			);
		});

		forEach(v.notNonNegativeIntegers, function (nonNonNegativeInteger) {
			t['throws'](
				function () { ES.GetStringIndex('', nonNonNegativeInteger); },
				TypeError,
				'`e`: ' + debug(nonNonNegativeInteger) + ' is not a non-negative integer'
			);
		});

		var strWithWholePoo = 'a' + wholePoo + 'c';
		t.equal(ES.GetStringIndex(strWithWholePoo, 0), 0, 'index 0 yields 0');
		t.equal(ES.GetStringIndex(strWithWholePoo, 1), 1, 'index 1 yields 1');
		t.equal(ES.GetStringIndex(strWithWholePoo, 2), 3, 'index 2 yields 3');
		t.equal(ES.GetStringIndex(strWithWholePoo, 3), 4, 'index 3 yields 4');

		t.equal(ES.GetStringIndex('', 0), 0, 'index 0 yields 0 on empty string');
		t.equal(ES.GetStringIndex('', 1), 0, 'index 1 yields 0 on empty string');

		t.end();
	});

	test('GetSubstitution', function (t) {
		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { ES.GetSubstitution(nonString, '', 0, [], undefined, ''); },
				TypeError,
				'`matched`: ' + debug(nonString) + ' is not a String'
			);

			t['throws'](
				function () { ES.GetSubstitution('', nonString, 0, [], undefined, ''); },
				TypeError,
				'`str`: ' + debug(nonString) + ' is not a String'
			);

			t['throws'](
				function () { ES.GetSubstitution('', '', 0, [], undefined, nonString); },
				TypeError,
				'`replacement`: ' + debug(nonString) + ' is not a String'
			);

			if (typeof nonString !== 'undefined') {
				t['throws'](
					function () { ES.GetSubstitution('', '', 0, [nonString], undefined, ''); },
					TypeError,
					'`captures`: ' + debug([nonString]) + ' is not an Array of strings'
				);
			}
		});

		forEach(v.notNonNegativeIntegers, function (nonNonNegativeInteger) {
			t['throws'](
				function () { ES.GetSubstitution('', '', nonNonNegativeInteger, [], undefined, ''); },
				TypeError,
				'`position`: ' + debug(nonNonNegativeInteger) + ' is not a non-negative integer'
			);
		});

		forEach(v.nonArrays, function (nonArray) {
			t['throws'](
				function () { ES.GetSubstitution('', '', 0, nonArray, undefined, ''); },
				TypeError,
				'`captures`: ' + debug(nonArray) + ' is not an Array'
			);
		});

		t.equal(
			ES.GetSubstitution('def', 'abcdefghi', 3, [], undefined, '123'),
			'123',
			'returns the substitution'
		);
		t.equal(
			ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '$$2$'),
			'$2$',
			'supports $$, and trailing $'
		);

		t.equal(
			ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '>$&<'),
			'>abcdef<',
			'supports $&'
		);

		t.equal(
			ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '>$`<'),
			'><',
			'supports $` at position 0'
		);
		t.equal(
			ES.GetSubstitution('def', 'abcdefghi', 3, [], undefined, '>$`<'),
			'>abc<',
			'supports $` at position > 0'
		);

		t.equal(
			ES.GetSubstitution('def', 'abcdefghi', 7, [], undefined, ">$'<"),
			'><',
			"supports $' at a position where there's less than `matched.length` chars left"
		);
		t.equal(
			ES.GetSubstitution('def', 'abcdefghi', 3, [], undefined, ">$'<"),
			'>ghi<',
			"supports $' at a position where there's more than `matched.length` chars left"
		);

		for (var i = 0; i < 100; i += 1) {
			var captures = [];
			captures[i] = 'test';
			if (i > 0) {
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '>$' + i + '<'),
					'>$' + i + '<',
					'supports $' + i + ' with no captures'
				);
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '>$' + i),
					'>$' + i,
					'supports $' + i + ' at the end of the replacement, with no captures'
				);
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, undefined, '>$' + i + '<'),
					i < 10 ? '>$' + i + '<' : '><',
					'supports $' + i + ' with a capture at that index'
				);
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, undefined, '>$' + i),
					'>',
					'supports $' + i + ' at the end of the replacement, with a capture at that index'
				);
			}
			if (i < 10) {
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '>$0' + i + '<'),
					'>$0' + i + '<',
					'supports $0' + i + ' with no captures'
				);
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '>$0' + i),
					'>$0' + i,
					'supports $0' + i + ' at the end of the replacement, with no captures'
				);
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, undefined, '>$0' + i + '<'),
					i === 0 ? '>$0' + i + '<' : '><',
					'supports $0' + i + ' with a capture at that index'
				);
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, undefined, '>$0' + i),
					i === 0 ? '>$0' + i : '>',
					'supports $0' + i + ' at the end of the replacement, with a capture at that index'
				);
			}
		}

		t.equal(
			ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, undefined, 'a>$<foo><z'),
			'a>$<foo><z',
			'works with the named capture regex without named captures'
		);
		t.equal(
			ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, undefined, 'a>$<foo>$<z'),
			'a>$<foo>$<z',
			'works with a mismatched $< without named captures'
		);

		t.test('named captures', function (st) {
			var namedCaptures = {
				foo: 'foo!'
			};

			st.equal(
				ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, namedCaptures, 'a>$<foo><z'),
				'a>foo!<z',
				'supports named captures'
			);

			st.equal(
				ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, namedCaptures, 'a>$<foo>$z'),
				'a>foo!$z',
				'works with a $z'
			);

			st.equal(
				ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, namedCaptures, '$<foo'),
				'$<foo',
				'supports named captures with a mismatched <'
			);

			st.equal(
				ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, namedCaptures, 'a>$<bar><z'),
				'a><z',
				'supports named captures with a missing namedCapture'
			);

			st.test('named captures, native', { skip: !hasNamedCaptures }, function (rt) {
				var str = 'abcdefghi';
				var regex = new RegExp('(?<foo>abcdef)');
				rt.equal(
					str.replace(regex, 'a>$<foo><z'),
					'a>abcdef<zghi',
					'works with the named capture regex with named captures'
				);

				rt.equal(
					str.replace(regex, 'a>$<foo>$z'),
					'a>abcdef$zghi',
					'works with a $z'
				);

				rt.equal(
					str.replace(regex, '$<foo'),
					'$<fooghi',
					'supports named captures with a mismatched <'
				);

				rt.equal(
					str.replace(regex, 'a>$<bar><z'),
					'a><zghi',
					'supports named captures with a missing namedCapture'
				);

				rt.end();
			});

			st.end();
		});

		t.end();
	});

	test('InstallErrorCause', function (t) {
		forEach(v.primitives, function (primitive) {
			t['throws'](
				function () { ES.InstallErrorCause(primitive); },
				TypeError,
				'O must be an Object; ' + debug(primitive) + ' is not one'
			);
		});

		var obj = {};
		ES.InstallErrorCause(obj);
		t.notOk(
			'cause' in obj,
			'installs nothing when `options` is omitted'
		);

		ES.InstallErrorCause(obj, {});
		t.notOk(
			'cause' in obj,
			'installs nothing when `cause` is absent'
		);

		ES.InstallErrorCause(obj, { cause: undefined });
		t.ok(
			'cause' in obj,
			'installs `undefined` when `cause` is present and `undefined`'
		);
		t.equal(obj.cause, undefined, 'obj.cause is `undefined`');

		var obj2 = {};
		ES.InstallErrorCause(obj2, { cause: obj });
		t.ok(
			'cause' in obj2,
			'installs when `cause` is present'
		);
		t.equal(obj2.cause, obj, 'obj2.cause is as expected');

		t.end();
	});

	test('IsStrictlyEqual', function (t) {
		t.test('same types use ===', function (st) {
			forEach(v.primitives.concat(v.objects), function (value) {
				st.equal(ES.IsStrictlyEqual(value, value), value === value, debug(value) + ' is strictly equal to itself');
			});
			st.end();
		});

		t.test('different types are not ===', function (st) {
			var pairs = [
				[null, undefined],
				[3, '3'],
				[true, '3'],
				[true, 3],
				[false, 0],
				[false, '0'],
				[3, [3]],
				['3', [3]],
				[true, [1]],
				[false, [0]],
				[String(v.coercibleObject), v.coercibleObject],
				[Number(String(v.coercibleObject)), v.coercibleObject],
				[Number(v.coercibleObject), v.coercibleObject],
				[String(Number(v.coercibleObject)), v.coercibleObject]
			];
			forEach(pairs, function (pair) {
				var a = pair[0];
				var b = pair[1];
				st.equal(ES.IsStrictlyEqual(a, b), a === b, debug(a) + ' === ' + debug(b));
				st.equal(ES.IsStrictlyEqual(b, a), b === a, debug(b) + ' === ' + debug(a));
			});
			st.end();
		});

		t.end();
	});

	test('IsLooselyEqual', function (t) {
		t.test('same types use ===', function (st) {
			forEach(v.primitives.concat(v.objects), function (value) {
				st.equal(ES.IsLooselyEqual(value, value), value === value, debug(value) + ' is abstractly equal to itself');
			});
			st.end();
		});

		t.test('different types coerce', function (st) {
			var pairs = [
				[null, undefined],
				[3, '3'],
				[true, '3'],
				[true, 3],
				[false, 0],
				[false, '0'],
				[3, [3]],
				['3', [3]],
				[true, [1]],
				[false, [0]],
				[String(v.coercibleObject), v.coercibleObject],
				[Number(String(v.coercibleObject)), v.coercibleObject],
				[Number(v.coercibleObject), v.coercibleObject],
				[String(Number(v.coercibleObject)), v.coercibleObject]
			].concat(hasBigInts ? [
				[BigInt(0), 0],
				[0, BigInt(0)],
				[BigInt(1), 1],
				[1, BigInt(1)],
				[BigInt(0), '0'],
				['0', BigInt(0)],
				[BigInt(1), '1'],
				['1', BigInt(1)],
				[BigInt(0), Infinity],
				[Infinity, BigInt(0)],
				[BigInt(0), 'Infinity'],
				['Infinity', BigInt(0)]
			] : []);
			forEach(pairs, function (pair) {
				var a = pair[0];
				var b = pair[1];
				// eslint-disable-next-line eqeqeq
				st.equal(ES.IsLooselyEqual(a, b), a == b, debug(a) + ' == ' + debug(b));
				// eslint-disable-next-line eqeqeq
				st.equal(ES.IsLooselyEqual(b, a), b == a, debug(b) + ' == ' + debug(a));
			});
			st.end();
		});

		t.end();
	});

	test('IsLessThan', function (t) {
		t.test('at least one operand is NaN', function (st) {
			st.equal(ES.IsLessThan(NaN, {}, true), undefined, 'LeftFirst: first is NaN, returns undefined');
			st.equal(ES.IsLessThan({}, NaN, true), undefined, 'LeftFirst: second is NaN, returns undefined');
			st.equal(ES.IsLessThan(NaN, {}, false), undefined, '!LeftFirst: first is NaN, returns undefined');
			st.equal(ES.IsLessThan({}, NaN, false), undefined, '!LeftFirst: second is NaN, returns undefined');
			st.end();
		});

		forEach(v.nonBooleans, function (nonBoolean) {
			t['throws'](
				function () { ES.IsLessThan(3, 4, nonBoolean); },
				TypeError,
				debug(nonBoolean) + ' is not a Boolean'
			);
		});

		forEach(v.zeroes, function (zero) {
			t.equal(ES.IsLessThan(zero, 1, true), true, 'LeftFirst: ' + debug(zero) + ' is less than 1');
			t.equal(ES.IsLessThan(zero, 1, false), true, '!LeftFirst: ' + debug(zero) + ' is less than 1');
			t.equal(ES.IsLessThan(1, zero, true), false, 'LeftFirst: 1 is not less than ' + debug(zero));
			t.equal(ES.IsLessThan(1, zero, false), false, '!LeftFirst: 1 is not less than ' + debug(zero));

			t.equal(ES.IsLessThan(zero, zero, true), false, 'LeftFirst: ' + debug(zero) + ' is not less than ' + debug(zero));
			t.equal(ES.IsLessThan(zero, zero, false), false, '!LeftFirst: ' + debug(zero) + ' is not less than ' + debug(zero));
		});

		t.equal(ES.IsLessThan(Infinity, -Infinity, true), false, 'LeftFirst: ∞ is not less than -∞');
		t.equal(ES.IsLessThan(Infinity, -Infinity, false), false, '!LeftFirst: ∞ is not less than -∞');
		t.equal(ES.IsLessThan(-Infinity, Infinity, true), true, 'LeftFirst: -∞ is less than ∞');
		t.equal(ES.IsLessThan(-Infinity, Infinity, false), true, '!LeftFirst: -∞ is less than ∞');
		t.equal(ES.IsLessThan(-Infinity, 0, true), true, 'LeftFirst: -∞ is less than +0');
		t.equal(ES.IsLessThan(-Infinity, 0, false), true, '!LeftFirst: -∞ is less than +0');
		t.equal(ES.IsLessThan(0, -Infinity, true), false, 'LeftFirst: +0 is not less than -∞');
		t.equal(ES.IsLessThan(0, -Infinity, false), false, '!LeftFirst: +0 is not less than -∞');

		t.equal(ES.IsLessThan(3, 4, true), true, 'LeftFirst: 3 is less than 4');
		t.equal(ES.IsLessThan(4, 3, true), false, 'LeftFirst: 3 is not less than 4');
		t.equal(ES.IsLessThan(3, 4, false), true, '!LeftFirst: 3 is less than 4');
		t.equal(ES.IsLessThan(4, 3, false), false, '!LeftFirst: 3 is not less than 4');

		t.equal(ES.IsLessThan('3', '4', true), true, 'LeftFirst: "3" is less than "4"');
		t.equal(ES.IsLessThan('4', '3', true), false, 'LeftFirst: "3" is not less than "4"');
		t.equal(ES.IsLessThan('3', '4', false), true, '!LeftFirst: "3" is less than "4"');
		t.equal(ES.IsLessThan('4', '3', false), false, '!LeftFirst: "3" is not less than "4"');

		t.equal(ES.IsLessThan('a', 'abc', true), true, 'LeftFirst: "a" is less than "abc"');
		t.equal(ES.IsLessThan('abc', 'a', true), false, 'LeftFirst: "abc" is not less than "a"');
		t.equal(ES.IsLessThan('a', 'abc', false), true, '!LeftFirst: "a" is less than "abc"');
		t.equal(ES.IsLessThan('abc', 'a', false), false, '!LeftFirst: "abc" is not less than "a"');

		t.equal(ES.IsLessThan(v.coercibleObject, 42, true), true, 'LeftFirst: coercible object is less than 42');
		t.equal(ES.IsLessThan(42, v.coercibleObject, true), false, 'LeftFirst: 42 is not less than coercible object');
		t.equal(ES.IsLessThan(v.coercibleObject, 42, false), true, '!LeftFirst: coercible object is less than 42');
		t.equal(ES.IsLessThan(42, v.coercibleObject, false), false, '!LeftFirst: 42 is not less than coercible object');

		t.equal(ES.IsLessThan(v.coercibleObject, '3', true), false, 'LeftFirst: coercible object is not less than "3"');
		t.equal(ES.IsLessThan('3', v.coercibleObject, true), false, 'LeftFirst: "3" is not less than coercible object');
		t.equal(ES.IsLessThan(v.coercibleObject, '3', false), false, '!LeftFirst: coercible object is not less than "3"');
		t.equal(ES.IsLessThan('3', v.coercibleObject, false), false, '!LeftFirst: "3" is not less than coercible object');

		t.test('BigInts are supported', { skip: !hasBigInts }, function (st) {
			st.equal(ES.IsLessThan($BigInt(0), '1', true), true, 'LeftFirst: 0n is less than "1"');
			st.equal(ES.IsLessThan('1', $BigInt(0), true), false, 'LeftFirst: "1" is not less than 0n');
			st.equal(ES.IsLessThan($BigInt(0), '1', false), true, '!LeftFirst: 0n is less than "1"');
			st.equal(ES.IsLessThan('1', $BigInt(0), false), false, '!LeftFirst: "1" is not less than 0n');

			st.equal(ES.IsLessThan($BigInt(0), 1, true), true, 'LeftFirst: 0n is less than 1');
			st.equal(ES.IsLessThan(1, $BigInt(0), true), false, 'LeftFirst: 1 is not less than 0n');
			st.equal(ES.IsLessThan($BigInt(0), 1, false), true, '!LeftFirst: 0n is less than 1');
			st.equal(ES.IsLessThan(1, $BigInt(0), false), false, '!LeftFirst: 1 is not less than 0n');

			st.equal(ES.IsLessThan($BigInt(0), $BigInt(1), true), true, 'LeftFirst: 0n is less than 1n');
			st.equal(ES.IsLessThan($BigInt(1), $BigInt(0), true), false, 'LeftFirst: 1n is not less than 0n');
			st.equal(ES.IsLessThan($BigInt(0), $BigInt(1), false), true, '!LeftFirst: 0n is less than 1n');
			st.equal(ES.IsLessThan($BigInt(1), $BigInt(0), false), false, '!LeftFirst: 1n is not less than 0n');

			st.equal(ES.IsLessThan($BigInt(0), 'NaN', true), undefined, 'LeftFirst: 0n and "NaN" produce `undefined`');
			st.equal(ES.IsLessThan('NaN', $BigInt(0), true), undefined, 'LeftFirst: "NaN" and 0n produce `undefined`');
			st.equal(ES.IsLessThan($BigInt(0), 'NaN', false), undefined, '!LeftFirst: 0n and "NaN" produce `undefined`');
			st.equal(ES.IsLessThan('NaN', $BigInt(0), false), undefined, '!LeftFirst: "NaN" and 0n produce `undefined`');

			st.equal(ES.IsLessThan($BigInt(0), NaN, true), undefined, 'LeftFirst: 0n and NaN produce `undefined`');
			st.equal(ES.IsLessThan(NaN, $BigInt(0), true), undefined, 'LeftFirst: NaN and 0n produce `undefined`');
			st.equal(ES.IsLessThan($BigInt(0), NaN, false), undefined, '!LeftFirst: 0n and NaN produce `undefined`');
			st.equal(ES.IsLessThan(NaN, $BigInt(0), false), undefined, '!LeftFirst: NaN and 0n produce `undefined`');

			st.equal(ES.IsLessThan($BigInt(0), Infinity, true), true, 'LeftFirst: 0n is less than Infinity');
			st.equal(ES.IsLessThan(Infinity, $BigInt(0), true), false, 'LeftFirst: Infinity is not less than 0n');
			st.equal(ES.IsLessThan($BigInt(0), Infinity, false), true, '!LeftFirst: 0n is less than Infinity');
			st.equal(ES.IsLessThan(Infinity, $BigInt(0), false), false, '!LeftFirst: Infinity is not less than 0n');

			st.equal(ES.IsLessThan($BigInt(0), -Infinity, true), false, 'LeftFirst: 0n is not less than -Infinity');
			st.equal(ES.IsLessThan(-Infinity, $BigInt(0), true), true, 'LeftFirst: -Infinity is less than 0n');
			st.equal(ES.IsLessThan($BigInt(0), -Infinity, false), false, '!LeftFirst: 0n is not less than -Infinity');
			st.equal(ES.IsLessThan(-Infinity, $BigInt(0), false), true, '!LeftFirst: -Infinity is less than 0n');

			st.end();
		});

		t.end();
	});

	test('IsStringWellFormedUnicode', function (t) {
		forEach(v.nonStrings, function (notString) {
			t['throws'](
				function () { return ES.IsStringWellFormedUnicode(notString); },
				TypeError,
				debug(notString) + ' is not a string'
			);
		});

		forEach(v.strings.concat(wholePoo), function (string) {
			t.equal(ES.IsStringWellFormedUnicode(string), true, debug(string) + ' is well-formed unicode');
		});

		forEach([leadingPoo, trailingPoo], function (badString) {
			t.equal(ES.IsStringWellFormedUnicode(badString), false, debug(badString) + ' is not well-formed unicode');
		});

		t.end();
	});

	test('MakeMatchIndicesIndexPairArray', function (t) {
		forEach(v.nonStrings, function (notString) {
			t['throws'](
				function () { return ES.MakeMatchIndicesIndexPairArray(notString); },
				TypeError,
				'`S`: ' + debug(notString) + ' is not a string'
			);
		});

		forEach(v.nonArrays, function (nonArray) {
			t['throws'](
				function () { return ES.MakeMatchIndicesIndexPairArray('', nonArray); },
				TypeError,
				'`indices`: ' + debug(nonArray) + ' is not a List'
			);

			t['throws'](
				function () { return ES.MakeMatchIndicesIndexPairArray('', [undefined], nonArray); },
				TypeError,
				'`groupNames`: ' + debug(nonArray) + ' is not a List'
			);
		});

		forEach(v.nonBooleans, function (nonBoolean) {
			t['throws'](
				function () { ES.MakeMatchIndicesIndexPairArray('', [undefined], [], nonBoolean); },
				TypeError,
				'`hasGroups`: ' + debug(nonBoolean) + ' is not a Boolean'
			);
		});

		t['throws'](
			function () { ES.MakeMatchIndicesIndexPairArray('', [undefined], [undefined], true); },
			TypeError,
			'`indices` must contain exactly one more item than `groupNames`'
		);

		t.deepEqual(
			ES.MakeMatchIndicesIndexPairArray(
				'abc',
				[undefined, { '[[StartIndex]]': 0, '[[EndIndex]]': 1 }, { '[[StartIndex]]': 1, '[[EndIndex]]': 3 }],
				[undefined, undefined],
				false
			),
			assign([undefined, [0, 1], [1, 3]], { groups: undefined }),
			'no groups'
		);

		t.test('has groups', { skip: !Object.create && !$setProto }, function (st) {
			var result = ES.MakeMatchIndicesIndexPairArray(
				'abc',
				[undefined, { '[[StartIndex]]': 0, '[[EndIndex]]': 1 }, { '[[StartIndex]]': 1, '[[EndIndex]]': 3 }],
				['G1', 'G2'],
				true
			);

			st.equal('toString' in {}, true, 'normal objects have toString');
			st.equal('toString' in result.groups, false, 'makes a null `groups` object');

			st.deepEqual(
				result,
				assign(
					[undefined, [0, 1], [1, 3]],
					{ groups: $setProto({ G1: [0, 1], G2: [1, 3] }, null) }
				),
				'has groups, no group names'
			);

			st.end();
		});

		t.test('has groups when no native Object.create', { skip: Object.create || $setProto }, function (st) {
			st['throws'](
				function () { ES.MakeMatchIndicesIndexPairArray(null); },
				SyntaxError,
				'without a native Object.create, can not create null objects'
			);

			st.end();
		});

		t['throws'](
			function () { ES.MakeMatchIndicesIndexPairArray('', [undefined, undefined], [''], false); },
			TypeError,
			'when `!hasGroups`, `groupNames` may only contain `undefined`'
		);

		t.end();
	});

	test('RegExpHasFlag', function (t) {
		forEach(v.primitives, function (primitive) {
			t['throws'](
				function () { ES.RegExpHasFlag(primitive, 'x'); },
				TypeError,
				'R must be an Object; ' + debug(primitive) + ' is not one'
			);
		});

		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { return ES.RegExpHasFlag({}, nonString); },
				TypeError,
				debug(nonString) + ' is not a string'
			);
		});

		t.equal(
			ES.RegExpHasFlag(RegExp.prototype, 'x'),
			reProtoIsRegex ? false : undefined,
			'RegExp.prototype yields ' + (reProtoIsRegex ? 'false' : 'undefined')
		);

		t['throws'](
			function () { return ES.RegExpHasFlag({}, 'x'); },
			TypeError,
			'non-RegExp object throws TypeError'
		);

		var allFlagsU = new RegExp('a', supportedRegexFlags.join('').replace('uv', 'u'));
		var allFlagsV = new RegExp('a', supportedRegexFlags.join('').replace('uv', 'v'));
		forEach(supportedRegexFlags, function (flag) {
			t.equal(ES.RegExpHasFlag(/a/, flag), false, 'regex with no flags does not have flag ' + flag);

			var r = new RegExp('a', flag);
			t.equal(ES.RegExpHasFlag(r, flag), true, debug(r) + ' has flag ' + flag);

			if (allFlagsU !== allFlagsV && (flag === 'u' || flag === 'v')) {
				var flagsSubset = flag === 'u' ? allFlagsU : allFlagsV;
				t.equal(ES.RegExpHasFlag(flagsSubset, flag), true, debug(flagsSubset) + ' has flag ' + flag);
			} else {
				t.equal(ES.RegExpHasFlag(allFlagsU, flag), true, debug(allFlagsU) + ' has flag ' + flag);
			}
		});

		t.end();
	});

	test('SetValueInBuffer', function (t) {
		var order = 'Unordered';

		t.test('SharedArrayBuffers supported', { skip: typeof SharedArrayBuffer !== 'function' }, function (st) {
			st['throws'](
				function () { ES.SetValueInBuffer(new SharedArrayBuffer(0), 0, 'Int8', 0, true, order); },
				SyntaxError,
				'SAB not yet supported'
			);

			st.end();
		});

		t.end();
	});

	test('SortIndexedProperties', function (t) {
		/* eslint no-unused-vars: 0 */

		var emptySortCompare = function (a, b) {};

		forEach(v.primitives, function (primitive) {
			t['throws'](
				function () { ES.SortIndexedProperties(primitive, 0, emptySortCompare); },
				TypeError,
				'obj must be an Object; ' + debug(primitive) + ' is not one'
			);
		});

		forEach(v.notNonNegativeIntegers, function (nonNonNegativeInteger) {
			t['throws'](
				function () { ES.SortIndexedProperties({}, nonNonNegativeInteger, emptySortCompare); },
				TypeError,
				'`len`: ' + debug(nonNonNegativeInteger) + ' is not a non-negative integer'
			);
		});

		forEach(
			v.nonFunctions.concat(
				function () {},
				function f(a, b) { return 0; },
				function (a) { return 0; },
				arrowFns.length > 0 ? [
					/* eslint no-new-func: 1 */
					Function('return () => {}')(),
					Function('return (a) => {}')(),
					Function('return (a, b, c) => {}')()
				] : []
			),
			function (nonTwoArgAbstractClosure) {
				t['throws'](
					function () { ES.SortIndexedProperties({}, 0, nonTwoArgAbstractClosure); },
					TypeError,
					'`len`: ' + debug(nonTwoArgAbstractClosure) + ' is not an abstract closure taking two args'
				);
			}
		);

		forEach([
			function (a, b) { return 0; }
		].concat(arrowFns.length > 0 ? [
			/* eslint no-new-func: 1 */
			Function('return (a, b) => 0')()
		] : []), function (ac) {
			t.doesNotThrow(
				function () { ES.SortIndexedProperties({}, 0, ac); },
				'an abstract closure taking two args is accepted'
			);
		});

		var o = [1, 3, 2, 0];
		t.equal(
			ES.SortIndexedProperties(o, 3, function (a, b) {
				return a - b;
			}),
			o,
			'passed object is returned'
		);
		t.deepEqual(
			o,
			[1, 2, 3, 0],
			'object is sorted up to `len`'
		);

		t.equal(
			ES.SortIndexedProperties(o, 4, function (a, b) {
				return a - b;
			}),
			o,
			'passed object is returned'
		);
		t.deepEqual(
			o,
			[0, 1, 2, 3],
			'object is again sorted up to `len`'
		);

		t.equal(
			ES.SortIndexedProperties(o, 6, function (a, b) {
				return a - b;
			}),
			o,
			'passed object is returned'
		);
		t.deepEqual(
			o,
			[0, 1, 2, 3],
			'object is again sorted up to `len` when `len` is longer than than `o.length`'
		);

		t.end();
	});

	test('StringToBigInt', function (t) {
		test('actual BigInts', { skip: !hasBigInts }, function (st) {
			forEach(v.bigints, function (bigint) {
				st.equal(
					ES.StringToBigInt(String(bigint)),
					bigint,
					debug(String(bigint)) + ' becomes ' + debug(bigint)
				);
			});

			forEach(v.integerNumbers, function (int) {
				var bigint = safeBigInt(int);
				st.equal(
					ES.StringToBigInt(String(int)),
					bigint,
					debug(String(int)) + ' becomes ' + debug(bigint)
				);
			});

			forEach(v.nonIntegerNumbers, function (nonInt) {
				st.equal(
					ES.StringToBigInt(String(nonInt)),
					undefined,
					debug(String(nonInt)) + ' becomes undefined'
				);
			});

			st.equal(ES.StringToBigInt(''), BigInt(0), 'empty string becomes 0n');
			st.equal(ES.StringToBigInt('Infinity'), undefined, 'non-finite numeric string becomes undefined');

			st.end();
		});

		test('BigInt not supported', { skip: hasBigInts }, function (st) {
			st['throws'](
				function () { ES.StringToBigInt('0'); },
				SyntaxError,
				'throws a SyntaxError when BigInt is not available'
			);

			st.end();
		});

		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { ES.StringToBigInt(nonString); },
				TypeError,
				debug(nonString) + ' is not a string'
			);
		});

		t.end();
	});

	test('StringToNumber', function (t) {
		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { ES.StringToNumber(nonString); },
				TypeError,
				debug(nonString) + ' is not a String'
			);
		});

		testStringToNumber(t, ES, ES.StringToNumber);

		t.end();
	});

	test('ToZeroPaddedDecimalString', function (t) {
		forEach(v.notNonNegativeIntegers, function (notNonNegativeInteger) {
			t['throws'](
				function () { ES.ToZeroPaddedDecimalString(notNonNegativeInteger); },
				RangeError,
				debug(notNonNegativeInteger) + ' is not a non-negative integer'
			);
		});

		t.equal(ES.ToZeroPaddedDecimalString(1, 1), '1');
		t.equal(ES.ToZeroPaddedDecimalString(1, 2), '01');
		t.equal(ES.ToZeroPaddedDecimalString(1, 3), '001');

		t.end();
	});

	test('TypedArrayElementSize', function (t) {
		forEach(v.primitives.concat(v.objects), function (nonTA) {
			t['throws'](
				function () { ES.TypedArrayElementSize(nonTA); },
				TypeError,
				debug(nonTA) + ' is not a TypedArray'
			);
		});

		forEach(availableTypedArrays, function (TA) {
			var elementSize = elementSizes['$' + TA];

			var ta = new global[TA](0);

			t.equal(
				elementSize,
				ta.BYTES_PER_ELEMENT,
				'element size table matches BYTES_PER_ELEMENT property',
				{ skip: !('BYTES_PER_ELEMENT' in ta) }
			);

			t.equal(ES.TypedArrayElementSize(ta), elementSize, debug(TA) + ' (which should be a ' + TA + ') has correct element size');
		});

		t.end();
	});

	test('TypedArrayElementType', function (t) {
		forEach(v.primitives.concat(v.objects), function (nonTA) {
			t['throws'](
				function () { ES.TypedArrayElementType(nonTA); },
				TypeError,
				debug(nonTA) + ' is not a TypedArray'
			);
		});

		forEach(availableTypedArrays, function (TA) {
			t.test(TA, function (st) {
				var ta = new global[TA](0);
				st.equal(
					ES.TypedArrayElementType(ta),
					TA.replace(/(?:lamped)?Array$/, ''),
					debug(ta) + ' (which should be a ' + TA + ') has correct element type'
				);

				st.end();
			});
		});

		t.end();
	});

	test('ValidateAndApplyPropertyDescriptor', function (t) {
		t['throws'](
			function () {
				ES.ValidateAndApplyPropertyDescriptor(
					{},
					'property key',
					true,
					v.genericDescriptor(),
					v.genericDescriptor()
				);
			},
			TypeError,
			'current must be a complete descriptor'
		);

		t.end();
	});
};

var es2023 = function ES2023(ES, ops, expectedMissing, skips) {
	es2022(ES, ops, expectedMissing, assign({}, skips, {
		'BigInt::sameValue': true,
		'BigInt::sameValueZero': true,
		'BigInt::toString': true,
		'Number::toString': true,
		Canonicalize: true,
		CreateDataPropertyOrThrow: true,
		EnumerableOwnPropertyNames: true,
		GetIterator: true,
		GetSubstitution: true,
		IsStringPrefix: true,
		IsWordChar: true,
		IterableToList: true,
		IteratorClose: true,
		IteratorNext: true,
		IteratorStep: true,
		SameValueNonNumeric: true,
		SetTypedArrayFromArrayLike: true,
		SortIndexedProperties: true,
		TimeZoneString: true,
		WordCharacters: true
	}));

	var test = makeTest(ES, skips);

	test('BigInt::toString', function (t) {
		forEach(v.nonBigInts, function (nonBigInt) {
			t['throws'](
				function () { ES.BigInt.toString(nonBigInt); },
				TypeError,
				debug(nonBigInt) + ' is not a BigInt'
			);
		});

		test('BigInts are supported', { skip: !hasBigInts }, function (st) {
			forEach(v.nonIntegerNumbers.concat(0, 1, 37), function (nonIntegerNumber) {
				st['throws'](
					function () { ES.Number.toString($BigInt(0), nonIntegerNumber); },
					TypeError,
					debug(nonIntegerNumber) + ' is not an integer [2, 36]'
				);
			});

			forEach([
				[37, 2, '100101'],
				[37, 3, '1101'],
				[37, 4, '211'],
				[37, 5, '122'],
				[37, 6, '101'],
				[37, 7, '52'],
				[37, 8, '45'],
				[37, 9, '41'],
				[37, 10, '37'],
				[37, 11, '34'],
				[37, 12, '31'],
				[37, 13, '2b'],
				[37, 14, '29'],
				[37, 15, '27'],
				[37, 16, '25'],
				[37, 17, '23'],
				[37, 18, '21'],
				[37, 19, '1i'],
				[37, 20, '1h'],
				[37, 21, '1g'],
				[37, 22, '1f'],
				[37, 23, '1e'],
				[37, 24, '1d'],
				[37, 25, '1c'],
				[37, 26, '1b'],
				[37, 27, '1a'],
				[37, 28, '19'],
				[37, 29, '18'],
				[37, 30, '17'],
				[37, 31, '16'],
				[37, 32, '15'],
				[37, 33, '14'],
				[37, 34, '13'],
				[37, 35, '12'],
				[37, 36, '11']
			], function (testCase) {
				var num = $BigInt(testCase[0]);
				st.equal(
					ES.BigInt.toString(num, testCase[1]),
					testCase[2],
					debug(num) + ' stringifies to ' + debug(testCase[2]) + ' in base ' + debug(testCase[1])
				);
			});

			st.end();
		});

		forEach(v.bigints, function (bigint) {
			t.equal(ES.BigInt.toString(bigint, 10), String(bigint), debug(bigint) + ' stringifies to ' + bigint);
		});

		t.end();
	});

	test('CanBeHeldWeakly', function (t) {
		forEach(v.nonSymbolPrimitives, function (nonSymbolPrimitive) {
			t.equal(ES.CanBeHeldWeakly(nonSymbolPrimitive), false, debug(nonSymbolPrimitive) + ' cannot be held weakly');
		});

		forEach(v.objects, function (object) {
			t.equal(
				ES.CanBeHeldWeakly(object),
				true,
				debug(object) + ' can be held weakly'
			);
		});

		forEach(v.symbols.concat($symbolFor ? $symbolFor('registered!') : []), function (symbol) {
			var isReg = isRegisteredSymbol(symbol);
			t.equal(
				ES.CanBeHeldWeakly(symbol),
				!isReg,
				debug(symbol) + ' can' + (isReg ? ' not' : '') + ' be held weakly'
			);
		});

		t.end();
	});

	test('Canonicalize', function (t) {
		var rer = {
			'[[IgnoreCase]]': false,
			'[[Multiline]]': false,
			'[[DotAll]]': false,
			'[[Unicode]]': false,
			'[[CapturingGroupsCount]]': 0
		};

		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { ES.Canonicalize(rer, nonString); },
				TypeError,
				'arg 1: ' + debug(nonString) + ' is not a String'
			);
		});

		forEach(v.nonBooleans, function (nonBoolean) {
			t['throws'](
				function () { ES.Canonicalize(assign({}, rer, { '[[IgnoreCase]]': nonBoolean }), ''); },
				TypeError,
				'[[IgnoreCase]]: ' + debug(nonBoolean) + ' is not a Boolean'
			);

			t['throws'](
				function () { ES.Canonicalize(assign({}, rer, { '[[Unicode]]': nonBoolean }), ''); },
				TypeError,
				'[[Unicode]]: ' + debug(nonBoolean) + ' is not a Boolean'
			);
		});

		t.equal(ES.Canonicalize(rer, leadingPoo), leadingPoo, 'when IgnoreCase is false, ch is returned');

		forEach(keys(caseFolding.C), function (input) {
			var output = caseFolding.C[input];

			t.equal(
				ES.Canonicalize(assign({}, rer, { '[[Unicode]]': true }), input),
				input,
				'C mapping, IgnoreCase false: ' + debug(input) + ' canonicalizes to ' + debug(input)
			);
			t.equal(
				ES.Canonicalize(assign({}, rer, { '[[IgnoreCase]]': true, '[[Unicode]]': true }), input),
				output,
				'C mapping, IgnoreCase true: ' + debug(input) + ' canonicalizes to ' + debug(output)
			);
		});

		forEach(keys(caseFolding.S), function (input) {
			var output = caseFolding.S[input];

			t.equal(
				ES.Canonicalize(assign({}, rer, { '[[Unicode]]': true }), input),
				input,
				'S mapping, IgnoreCase false: ' + debug(input) + ' canonicalizes to ' + debug(input)
			);
			t.equal(
				ES.Canonicalize(assign({}, rer, { '[[IgnoreCase]]': true, '[[Unicode]]': true }), input),
				output,
				'S mapping, IgnoreCase true: ' + debug(input) + ' canonicalizes to ' + debug(output)
			);
		});

		t.end();
	});

	test('CompareArrayElements', function (t) {
		forEach(v.nonFunctions, function (nonFunction) {
			if (typeof nonFunction !== 'undefined') {
				t['throws'](
					function () { ES.CompareArrayElements(0, 0, nonFunction); },
					TypeError,
					debug(nonFunction) + ' is not a function or undefined'
				);
			}
		});

		t.equal(ES.CompareArrayElements(), 0, 'both absent yields 0');
		t.equal(ES.CompareArrayElements(undefined, undefined), 0, 'both undefined yields 0');
		t.equal(ES.CompareArrayElements(undefined, 1), 1, 'x of undefined yields 1');
		t.equal(ES.CompareArrayElements(1, undefined), -1, 'y of undefined yields -1');

		t.equal(ES.CompareArrayElements(+0, +0), 0, '+0 == +0');
		t.equal(ES.CompareArrayElements(+0, -0), 0, '+0 == -0');
		t.equal(ES.CompareArrayElements(-0, +0), 0, '-0 == +0');
		t.equal(ES.CompareArrayElements(1, 1), 0, '1 == 1');
		t.equal(ES.CompareArrayElements(1, 2), -1, '1 < 2');
		t.equal(ES.CompareArrayElements(2, 1), 1, '2 > 1');

		var xSentinel = {};
		var ySentinel = {};
		t.equal(
			ES.CompareArrayElements(xSentinel, ySentinel, function (x, y) {
				t.equal(this, undefined, 'receiver is undefined');
				t.equal(x, xSentinel, 'sentinel x value received');
				t.equal(y, ySentinel, 'sentinel y value received');

				return { valueOf: function () { return 42; } };
			}),
			42,
			'custom comparator returns number-coerced result'
		);

		t.equal(
			ES.CompareArrayElements(xSentinel, ySentinel, function (x, y) {
				return NaN;
			}),
			0,
			'custom comparator returning NaN yields 0'
		);

		t.end();
	});

	test('CompareTypedArrayElements', function (t) {
		t['throws'](
			function () { ES.CompareTypedArrayElements(); },
			TypeError,
			'no arguments throws a TypeError'
		);
		t['throws'](
			function () { ES.CompareTypedArrayElements(1, 'a'); },
			TypeError,
			'one String argument throws a TypeError'
		);
		if (hasBigInts) {
			t['throws'](
				function () { ES.CompareTypedArrayElements(1, twoSixtyFour); },
				TypeError,
				'one Number and other BigInt argument throws a TypeError'
			);
		}

		forEach(v.nonFunctions, function (nonFunction) {
			if (typeof nonFunction !== 'undefined') {
				t['throws'](
					function () { ES.CompareTypedArrayElements(0, 0, nonFunction); },
					TypeError,
					debug(nonFunction) + ' is not a function or undefined'
				);
			}
		});

		t.equal(ES.CompareTypedArrayElements(1, 1, undefined), 0, '1 == 1');
		t.equal(ES.CompareTypedArrayElements(0, 1, undefined), -1, '0 < 1');
		t.equal(ES.CompareTypedArrayElements(1, 0, undefined), 1, '1 > 0');

		t.equal(ES.CompareTypedArrayElements(NaN, NaN, undefined), 0, 'NaN == NaN');
		t.equal(ES.CompareTypedArrayElements(NaN, 0, undefined), 1, 'NaN > 0');
		t.equal(ES.CompareTypedArrayElements(0, NaN, undefined), -1, '0 > NaN');

		t.equal(ES.CompareTypedArrayElements(0, -0, undefined), 1, '0 > -0');
		t.equal(ES.CompareTypedArrayElements(-0, 0, undefined), -1, '-0 < 0');
		t.equal(ES.CompareTypedArrayElements(-0, -0, undefined), 0, '-0 == -0');

		var compareFn = function compareFn(x, y) {
			t.equal(this, undefined, 'receiver is undefined');
			t.equal(x, 0, 'sentinel x value received');
			t.equal(y, 1, 'sentinel y value received');

			return -Infinity;
		};
		t.equal(ES.CompareTypedArrayElements(0, 1, compareFn), -Infinity, 'comparefn return is passed through');

		t.equal(ES.CompareTypedArrayElements(0, 1, function () { return NaN; }), 0, 'comparefn returning NaN yields +0');

		t.end();
	});

	test('CreateDataPropertyOrThrow', function (t) {
		forEach(v.primitives, function (primitive) {
			t['throws'](
				function () { ES.CreateDataPropertyOrThrow(primitive); },
				TypeError,
				debug(primitive) + ' is not an object'
			);
		});

		forEach(v.nonPropertyKeys, function (nonPropertyKey) {
			t['throws'](
				function () { ES.CreateDataPropertyOrThrow({}, nonPropertyKey); },
				TypeError,
				debug(nonPropertyKey) + ' is not a property key'
			);
		});

		var sentinel = {};
		forEach(v.propertyKeys, function (propertyKey) {
			var obj = {};
			var status = ES.CreateDataPropertyOrThrow(obj, propertyKey, sentinel);
			t.equal(status, undefined, 'status is ~unused~');
			t.equal(
				obj[propertyKey],
				sentinel,
				debug(sentinel) + ' is installed on "' + debug(propertyKey) + '" on the object'
			);

			if (typeof Object.preventExtensions === 'function') {
				var notExtensible = {};
				Object.preventExtensions(notExtensible);

				t['throws'](
					function () { ES.CreateDataPropertyOrThrow(notExtensible, propertyKey, sentinel); },
					TypeError,
					'can not install ' + debug(propertyKey) + ' on non-extensible object'
				);
				t.notEqual(
					notExtensible[propertyKey],
					sentinel,
					debug(sentinel) + ' is not installed on "' + debug(propertyKey) + '" on the object'
				);
			}
		});

		t.test('non-extensible object', { skip: !Object.preventExtensions }, function (st) {
			var nonExtensible = Object.preventExtensions({});

			st['throws'](
				function () { ES.CreateDataPropertyOrThrow(nonExtensible, 'foo', {}); },
				TypeError,
				'can not install "foo" on non-extensible object'
			);

			st.end();
		});

		t.end();
	});

	test('DefaultTimeZone', function (t) {
		t.test('Intl supported', { skip: typeof Intl === 'undefined' }, function (st) {
			st.equal(
				ES.DefaultTimeZone(),
				new Intl.DateTimeFormat().resolvedOptions().timeZone,
				'default time zone is resolved from Intl.DateTimeFormat'
			);

			st.end();
		});

		t.test('Intl not supported', { skip: typeof Intl !== 'undefined' }, function (st) {
			st.equal(
				ES.DefaultTimeZone(),
				'UTC',
				'default time zone is UTC'
			);

			st.end();
		});

		t.end();
	});

	test('EnumerableOwnProperties', function (t) {
		var obj = testEnumerableOwnNames(t, function (O) {
			return ES.EnumerableOwnProperties(O, 'key');
		});

		t.deepEqual(
			ES.EnumerableOwnProperties(obj, 'value'),
			[obj.own],
			'returns enumerable own values'
		);

		t.deepEqual(
			ES.EnumerableOwnProperties(obj, 'key+value'),
			[['own', obj.own]],
			'returns enumerable own entries'
		);

		t.end();
	});

	test('FindViaPredicate', function (t) {
		forEach(v.primitives, function (primitive) {
			t['throws'](
				function () { ES.FindViaPredicate(primitive, 0, 'ascending', function () {}); },
				TypeError,
				debug(primitive) + ' is not an object'
			);
		});

		forEach(v.notNonNegativeIntegers, function (notNonNegativeInteger) {
			t['throws'](
				function () { ES.FindViaPredicate({}, notNonNegativeInteger, 'ascending', function () {}); },
				TypeError,
				debug(notNonNegativeInteger) + ' is not a non-negative integer'
			);
		});

		forEach(v.nonFunctions, function (nonFunction) {
			t['throws'](
				function () { ES.FindViaPredicate({}, 0, 'ascending', nonFunction); },
				TypeError,
				debug(nonFunction) + ' is not a function'
			);
		});

		t['throws'](
			function () { ES.FindViaPredicate({}, 0, 'invalid', function () {}); },
			TypeError,
			'invalid direction'
		);

		var sentinel = {};
		var arr = [1, 2, 3, 4];
		var fakeLength = 3;
		t.test('ascending', function (st) {
			var expectedIndex = 1;
			st.plan(((expectedIndex + 1) * 3) + 1);

			var result = ES.FindViaPredicate(arr, fakeLength, 'ascending', function (element, index, obj) {
				st.equal(element, arr[index], 'first callback arg is in O, at second callback arg');
				st.equal(obj, arr, 'third callback arg is O');
				st.equal(this, sentinel, 'callback receiver is thisArg');

				return element % 2 === 0;
			}, sentinel);

			st.deepEqual(result, { '[[Index]]': expectedIndex, '[[Value]]': 2 }, 'expected result is found');

			st.end();
		});

		t.test('descending', function (st) {
			var expectedIndex = 3;
			st.plan((((arr.length - expectedIndex) + 1) * 3) + 1);

			var result = ES.FindViaPredicate(arr, fakeLength, 'descending', function (element, index, obj) {
				st.equal(element, arr[index], 'first callback arg is in O, at second callback arg');
				st.equal(obj, arr, 'third callback arg is O');
				st.equal(this, sentinel, 'callback receiver is thisArg');

				return element % 2 === 0;
			}, sentinel);

			st.deepEqual(result, { '[[Index]]': 3, '[[Value]]': 4 }, 'expected result is found');

			st.end();
		});

		t.test('not found', function (st) {
			st.plan((fakeLength * 3) + 1);

			var result = ES.FindViaPredicate(arr, fakeLength, 'ascending', function (element, index, obj) {
				st.equal(element, arr[index], 'first callback arg is in O, at second callback arg (' + index + ')');
				st.equal(obj, arr, 'third callback arg is O');
				st.equal(this, sentinel, 'callback receiver is thisArg');

				return false;
			}, sentinel);

			st.deepEqual(result, { '[[Index]]': -1, '[[Value]]': void undefined }, 'expected result is produced');

			st.end();
		});

		t.end();
	});

	test('GetIteratorFromMethod', function (t) {
		forEach(v.nonFunctions, function (nonCallable) {
			t['throws'](
				function () { ES.GetIteratorFromMethod(null, nonCallable); },
				TypeError,
				debug(nonCallable) + ' is not callable'
			);
		});

		var sentinel = {};

		forEach(v.primitives, function (nonObject) {
			t['throws'](
				function () { ES.GetIteratorFromMethod(sentinel, function () { return nonObject; }); },
				TypeError,
				'method return value, ' + debug(nonObject) + ', is not an object'
			);
		});

		var iterator = {
			next: function next() {

			}
		};
		var iteratorRecord = ES.GetIteratorFromMethod(sentinel, function () {
			t.equal(this, sentinel, 'method is called with the correct this value');
			t.equal(arguments.length, 0, 'method is called with no arguments');

			return iterator;
		});

		t.deepEqual(
			iteratorRecord,
			{
				'[[Iterator]]': iterator,
				'[[NextMethod]]': iterator.next,
				'[[Done]]': false
			},
			'iterator record is correct'
		);

		t.end();
	});

	test('GetIterator', function (t) {
		try {
			ES.GetIterator({}, 'null');
		} catch (e) {
			t.ok(e.message.indexOf('Assertion failed: `kind` must be one of \'sync\' or \'async\'' >= 0));
		}

		var arr = [1, 2];
		testIterator(t, ES.GetIterator(arr, 'sync')['[[Iterator]]'], arr);

		testIterator(t, ES.GetIterator('abc', 'sync')['[[Iterator]]'], 'abc'.split(''));

		t['throws'](
			function () { ES.GetIterator({}, 'sync'); },
			TypeError,
			'sync hint: undefined iterator method throws'
		);

		t['throws'](
			function () { ES.GetIterator({}, 'async'); },
			TypeError,
			'async hint: undefined iterator method throws'
		);

		t.test('Symbol.iterator', { skip: !v.hasSymbols }, function (st) {
			var m = new Map();
			m.set(1, 'a');
			m.set(2, 'b');

			var syncRecord = ES.GetIterator(m, 'sync');
			testIterator(st, syncRecord['[[Iterator]]'], [[1, 'a'], [2, 'b']]);

			var asyncRecord = ES.GetIterator(m, 'async');
			return testAsyncIterator(st, asyncRecord['[[Iterator]]'], [[1, 'a'], [2, 'b']]);
		});

		t.test('Symbol.asyncIterator', { skip: !v.hasSymbols || !Symbol.asyncIterator }, function (st) {
			st.test('an async iteratable returning a sync iterator', function (s2t) {
				var it = {
					next: function nextFromTest() {
						return Promise.resolve({
							done: true
						});
					}
				};
				var obj = {};
				obj[Symbol.asyncIterator] = function () {
					return it;
				};

				var asyncIterator = ES.GetIterator(obj, 'async');

				s2t.deepEqual(asyncIterator, makeIteratorRecord(it));

				s2t.end();
			});

			st.test('a throwing async iterator', function (s2t) {
				var sentinel = {};

				var asyncIterable = {};
				asyncIterable[Symbol.asyncIterator] = function () {
					var i = 0;
					return {
						next: function next() {
							if (i > 4) {
								throw sentinel;
							}
							try {
								return {
									done: i > 5,
									value: i
								};
							} finally {
								i += 1;
							}
						}
					};
				};
				var iteratorRecord = ES.GetIterator(asyncIterable, 'async');
				return testAsyncIterator(
					s2t,
					iteratorRecord['[[Iterator]]'],
					[0, 1, 2, 3, 4, 5]
				)['catch'](function (e) {
					if (e !== sentinel) {
						throw e;
					}
				});
			});

			st.end();
		});

		t.end();
	});

	test('GetSubstitution', function (t) {
		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { ES.GetSubstitution(nonString, '', 0, [], undefined, ''); },
				TypeError,
				'`matched`: ' + debug(nonString) + ' is not a String'
			);

			t['throws'](
				function () { ES.GetSubstitution('', nonString, 0, [], undefined, ''); },
				TypeError,
				'`str`: ' + debug(nonString) + ' is not a String'
			);

			t['throws'](
				function () { ES.GetSubstitution('', '', 0, [], undefined, nonString); },
				TypeError,
				'`replacement`: ' + debug(nonString) + ' is not a String'
			);

			if (typeof nonString !== 'undefined') {
				t['throws'](
					function () { ES.GetSubstitution('', '', 0, [nonString], undefined, ''); },
					TypeError,
					'`captures`: ' + debug([nonString]) + ' is not an Array of strings'
				);
			}
		});

		forEach(v.notNonNegativeIntegers, function (nonNonNegativeInteger) {
			t['throws'](
				function () { ES.GetSubstitution('', '', nonNonNegativeInteger, [], undefined, ''); },
				TypeError,
				'`position`: ' + debug(nonNonNegativeInteger) + ' is not a non-negative integer'
			);
		});

		forEach(v.nonArrays, function (nonArray) {
			t['throws'](
				function () { ES.GetSubstitution('', '', 0, nonArray, undefined, ''); },
				TypeError,
				'`captures`: ' + debug(nonArray) + ' is not an Array'
			);
		});

		t.equal(
			ES.GetSubstitution('def', 'abcdefghi', 3, [], undefined, '123'),
			'123',
			'returns the substitution'
		);
		t.equal(
			ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '$$2$'),
			'$2$',
			'supports $$, and trailing $'
		);

		t.equal(
			ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '>$&<'),
			'>abcdef<',
			'supports $&'
		);

		t.equal(
			ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '>$`<'),
			'><',
			'supports $` at position 0'
		);
		t.equal(
			ES.GetSubstitution('def', 'abcdefghi', 3, [], undefined, '>$`<'),
			'>abc<',
			'supports $` at position > 0'
		);

		t.equal(
			ES.GetSubstitution('def', 'abcdefghi', 7, [], undefined, ">$'<"),
			'><',
			"supports $' at a position where there's less than `matched.length` chars left"
		);
		t.equal(
			ES.GetSubstitution('def', 'abcdefghi', 3, [], undefined, ">$'<"),
			'>ghi<',
			"supports $' at a position where there's more than `matched.length` chars left"
		);

		for (var i = 0; i < 100; i += 1) {
			var captures = [];
			captures[i] = 'test';
			if (i > 0) {
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '>$' + i + '<'),
					'>$' + i + '<',
					'supports $' + i + ' with no captures'
				);
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '>$' + i),
					'>$' + i,
					'supports $' + i + ' at the end of the replacement, with no captures'
				);
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, undefined, '>$' + i + '<'),
					'><',
					'supports $' + i + ' with a capture at that index'
				);
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, undefined, '>$' + i),
					'>',
					'supports $' + i + ' at the end of the replacement, with a capture at that index'
				);
			}
			if (i < 10) {
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '>$0' + i + '<'),
					'>$0' + i + '<',
					'supports $0' + i + ' with no captures'
				);
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '>$0' + i),
					'>$0' + i,
					'supports $0' + i + ' at the end of the replacement, with no captures'
				);
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, undefined, '>$0' + i + '<'),
					i === 0 ? '>$0' + i + '<' : '><',
					'supports $0' + i + ' with a capture at that index'
				);
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, undefined, '>$0' + i),
					i === 0 ? '>$0' + i : '>',
					'supports $0' + i + ' at the end of the replacement, with a capture at that index'
				);
			}
		}

		t.equal(
			ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, undefined, 'a>$<foo><z'),
			'a>$<foo><z',
			'works with the named capture regex without named captures'
		);
		t.equal(
			ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, undefined, 'a>$<foo>$<z'),
			'a>$<foo>$<z',
			'works with a mismatched $< without named captures'
		);

		t.test('named captures', function (st) {
			var namedCaptures = {
				foo: 'foo!'
			};

			st.equal(
				ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, namedCaptures, 'a>$<foo><z'),
				'a>foo!<z',
				'supports named captures'
			);

			st.equal(
				ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, namedCaptures, 'a>$<foo>$z'),
				'a>foo!$z',
				'works with a $z'
			);

			st.equal(
				ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, namedCaptures, '$<foo'),
				'$<foo',
				'supports named captures with a mismatched <'
			);

			st.equal(
				ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, namedCaptures, 'a>$<bar><z'),
				'a><z',
				'supports named captures with a missing namedCapture'
			);

			st.test('named captures, native', { skip: !hasNamedCaptures }, function (rt) {
				var str = 'abcdefghi';
				var regex = new RegExp('(?<foo>abcdef)');
				rt.equal(
					str.replace(regex, 'a>$<foo><z'),
					'a>abcdef<zghi',
					'works with the named capture regex with named captures'
				);

				rt.equal(
					str.replace(regex, 'a>$<foo>$z'),
					'a>abcdef$zghi',
					'works with a $z'
				);

				rt.equal(
					str.replace(regex, '$<foo'),
					'$<fooghi',
					'supports named captures with a mismatched <'
				);

				rt.equal(
					str.replace(regex, 'a>$<bar><z'),
					'a><zghi',
					'supports named captures with a missing namedCapture'
				);

				rt.end();
			});

			st.end();
		});

		t.end();
	});

	test('IsWordChar', function (t) {
		var rer = {
			'[[IgnoreCase]]': false,
			'[[Multiline]]': false,
			'[[DotAll]]': false,
			'[[Unicode]]': false,
			'[[CapturingGroupsCount]]': 1
		};

		forEach(v.nonBooleans, function (nonBoolean) {
			t['throws'](
				function () { ES.Canonicalize(assign({}, rer, { '[[IgnoreCase]]': nonBoolean }), ''); },
				TypeError,
				'[[IgnoreCase]]: ' + debug(nonBoolean) + ' is not a Boolean'
			);

			t['throws'](
				function () { ES.Canonicalize(assign({}, rer, { '[[Unicode]]': nonBoolean }), ''); },
				TypeError,
				'[[Unicode]]: ' + debug(nonBoolean) + ' is not a Boolean'
			);
		});

		forEach(v.nonArrays, function (nonArray) {
			t['throws'](
				function () { return ES.IsWordChar(rer, nonArray, 0); },
				TypeError,
				'arg 2: ' + debug(nonArray) + ' is not an Array'
			);
		});

		forEach(v.nonIntegerNumbers, function (nonInteger) {
			t['throws'](
				function () { return ES.IsWordChar(rer, [], nonInteger); },
				TypeError,
				'arg 3: ' + debug(nonInteger) + ' is not an integer'
			);
		});

		t.equal(ES.IsWordChar(rer, [], -1), false, 'arg 3: -1 yields false');
		t.equal(ES.IsWordChar(rer, [], 0), false, 'arg 2 length and arg 3 the same yields false');
		t.equal(ES.IsWordChar(rer, ['a', '!'], 2), false, 'arg 2 length and arg 3 the same yields false even with non-word chars');
		t.equal(ES.IsWordChar(rer, ['a', 'b'], 2), false, 'arg 2 length and arg 3 the same yields false even with word chars');

		t.equal(
			ES.IsWordChar(rer, ['a', '!'], 0),
			true,
			'a is a word char'
		);
		t.equal(
			ES.IsWordChar(rer, ['!', 'b'], 1),
			true,
			'b is a word char'
		);

		forEach(keys(caseFolding.C), function (input) {
			var isBasic = (/^[a-zA-Z0-9_]$/).test(input);
			var isFancy = (/^[a-zA-Z0-9_]$/).test(caseFolding.C[input]);

			t.equal(
				ES.IsWordChar(assign({}, rer, { '[[Unicode]]': true }), [input], 0),
				isBasic,
				'C mapping, IgnoreCase false: ' + debug(input) + ' is a word char'
			);
			t.equal(
				ES.IsWordChar(assign({}, rer, { '[[IgnoreCase]]': true, '[[Unicode]]': true }), [input], 0),
				isBasic || isFancy,
				'C mapping, IgnoreCase true: ' + debug(input) + ' is a word char'
			);
		});

		forEach(keys(caseFolding.S), function (input) {
			var isBasic = (/^[a-zA-Z0-9_]$/).test(input);
			var isFancy = (/^[a-zA-Z0-9_]$/).test(caseFolding.S[input]);

			t.equal(
				ES.IsWordChar(assign({}, rer, { '[[Unicode]]': true }), [input], 0),
				isBasic,
				'S mapping, IgnoreCase false: ' + debug(input) + ' is a word char'
			);
			t.equal(
				ES.IsWordChar(assign({}, rer, { '[[IgnoreCase]]': true, '[[Unicode]]': true }), [input], 0),
				isBasic || isFancy,
				'S mapping, IgnoreCase true: ' + debug(input) + ' is a word char'
			);
		});

		t.end();
	});

	test('IteratorToList', function (t) {
		var customIterator = function () {
			var i = -1;
			return {
				next: function () {
					i += 1;
					return {
						done: i >= 5,
						value: i
					};
				}
			};
		};

		var iteratorRecord = makeIteratorRecord(customIterator());

		t.deepEqual(
			ES.IteratorToList(iteratorRecord),
			[0, 1, 2, 3, 4],
			'iterator method is called and values collected'
		);

		t.test('Symbol support', { skip: !v.hasSymbols }, function (st) {
			st.deepEqual(ES.IteratorToList(makeIteratorRecord('abc'[Symbol.iterator]())), ['a', 'b', 'c'], 'a string of code units spreads');
			st.deepEqual(ES.IteratorToList(makeIteratorRecord('☃'[Symbol.iterator]())), ['☃'], 'a string of code points spreads');

			var arr = [1, 2, 3];
			st.deepEqual(ES.IteratorToList(makeIteratorRecord(arr[Symbol.iterator]())), arr, 'an array becomes a similar array');
			st.notEqual(ES.IteratorToList(makeIteratorRecord(arr[Symbol.iterator]())), arr, 'an array becomes a different, but similar, array');

			st.end();
		});

		t['throws'](
			function () { ES.IteratorToList(makeIteratorRecord({})); },
			TypeError,
			'non-function iterator method'
		);

		t.end();
	});

	test('IteratorClose', function (t) {
		forEach(v.primitives, function (nonObject) {
			t['throws'](
				function () { ES.IteratorClose(nonObject); },
				TypeError,
				debug(nonObject) + ' is not an Object'
			);

			t['throws'](
				function () {
					ES.IteratorClose(
						{
							'[[Iterator]]': { 'return': function () { return nonObject; } },
							'[[Done]]': false,
							'[[NextMethod]]': function () { return {}; }
						},
						function () {}
					);
				},
				TypeError,
				'`.return` returns ' + debug(nonObject) + ', which is not an Object'
			);

			t['throws'](
				function () {
					ES.IteratorClose(
						{
							'[[Iterator]]': nonObject,
							'[[Done]]': false,
							'[[NextMethod]]': function () { return {}; }
						},
						function () {}
					);
				},
				TypeError,
				'`.return` returns ' + debug(nonObject) + ', which is not an Object'
			);
		});

		forEach(v.nonFunctions, function (nonFunction) {
			t['throws'](
				function () {
					ES.IteratorClose(
						makeIteratorRecord({ next: function () {} }),
						nonFunction
					);
				},
				TypeError,
				debug(nonFunction) + ' is not a thunk for a Completion Record'
			);

			if (nonFunction != null) {
				t['throws'](
					function () {
						ES.IteratorClose(
							makeIteratorRecord({ next: function () {}, 'return': nonFunction }),
							function () {}
						);
					},
					TypeError,
					'`.return` of ' + debug(nonFunction) + ' is not a Function'
				);
			}
		});

		var sentinel = {};
		t.equal(
			ES.IteratorClose(
				makeIteratorRecord({ next: function () {}, 'return': undefined }),
				function () { return sentinel; }
			),
			sentinel,
			'when `.return` is `undefined`, invokes and returns the completion thunk'
		);

		/* eslint no-throw-literal: 0 */
		t.throwsSentinel(
			function () {
				ES.IteratorClose(
					{ '[[Iterator]]': { 'return': function () { throw sentinel; } }, '[[Done]]': false, '[[NextMethod]]': function () {} },
					function () {}
				);
			},
			sentinel,
			'`.return` that throws, when completionThunk does not, throws exception from `.return`'
		);
		t.throwsSentinel(
			function () {
				ES.IteratorClose(
					{ '[[Iterator]]': { 'return': function () { throw sentinel; } }, '[[Done]]': false, '[[NextMethod]]': function () {} },
					function () { throw -1; }
				);
			},
			-1,
			'`.return` that throws, when completionThunk does too, throws exception from completionThunk'
		);
		t.throwsSentinel(
			function () {
				ES.IteratorClose(
					{ '[[Iterator]]': { 'return': function () { } }, '[[Done]]': false, '[[NextMethod]]': function () {} },
					function () { throw -1; }
				);
			},
			-1,
			'`.return` that does not throw, when completionThunk does, throws exception from completionThunk'
		);

		t.equal(
			ES.IteratorClose(
				{ '[[Iterator]]': { 'return': function () { return sentinel; } }, '[[Done]]': false, '[[NextMethod]]': function () {} },
				function () { return 42; }
			),
			42,
			'when `.return` and completionThunk do not throw, and `.return` returns an Object, returns completionThunk'
		);

		t.end();
	});

	test('IteratorNext', function (t) {
		forEach(v.primitives, function (nonObject) {
			t['throws'](
				function () { ES.IteratorNext(nonObject); },
				TypeError,
				debug(nonObject) + ' is not an Object'
			);

			t['throws'](
				function () { ES.IteratorNext({ next: function () { return nonObject; } }); },
				TypeError,
				'`next()` returns ' + debug(nonObject) + ', which is not an Object'
			);
		});

		var iterator = {
			next: function (value) {
				return [arguments.length, value];
			}
		};
		t.deepEqual(
			ES.IteratorNext(makeIteratorRecord(iterator)),
			[0, undefined],
			'returns expected value from `.next()`; `next` receives expected 0 arguments'
		);
		t.deepEqual(
			ES.IteratorNext(makeIteratorRecord(iterator), iterator),
			[1, iterator],
			'returns expected value from `.next()`; `next` receives expected 1 argument'
		);

		t.end();
	});

	test('IteratorStep', function (t) {
		forEach(v.primitives.concat(v.objects), function (nonIteratorRecord) {
			t['throws'](
				function () { ES.IteratorStep(nonIteratorRecord); },
				TypeError,
				debug(nonIteratorRecord) + ' is not an Iterator Record'
			);
		});

		var iterator = {
			next: function () {
				return {
					done: false,
					value: [1, arguments.length]
				};
			}
		};
		t.deepEqual(
			ES.IteratorStep(makeIteratorRecord(iterator)),
			{ done: false, value: [1, 0] },
			'not-done iterator result yields iterator result'
		);

		var iterator2 = {
			next: function () {
				return {
					done: true,
					value: [2, arguments.length]
				};
			}
		};
		t.deepEqual(
			ES.IteratorStep(makeIteratorRecord(iterator2)),
			false,
			'done iterator result yields false'
		);

		t.end();
	});

	test('KeyForSymbol', function (t) {
		forEach(v.nonSymbolPrimitives, function (nonSymbol) {
			t['throws'](
				function () { ES.KeyForSymbol(nonSymbol); },
				TypeError,
				debug(nonSymbol) + ' is not a Symbol'
			);
		});

		forEach(v.symbols.concat($symbolFor ? $symbolFor('registered!') : []), function (symbol) {
			t.equal(
				ES.KeyForSymbol(symbol),
				isRegisteredSymbol(symbol) ? ES.SymbolDescriptiveString(symbol).slice(7, -1) : undefined,
				debug(symbol) + ' yields expected key'
			);
		});

		t.end();
	});

	test('Number::toString', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.Number.toString(nonNumber); },
				TypeError,
				debug(nonNumber) + ' is not a Number'
			);
		});

		forEach(v.nonIntegerNumbers.concat(0, 1, 37), function (nonIntegerNumber) {
			t['throws'](
				function () { ES.Number.toString(0, nonIntegerNumber); },
				TypeError,
				debug(nonIntegerNumber) + ' is not an integer [2, 36]'
			);
		});

		forEach(v.numbers, function (number) {
			t.equal(ES.Number.toString(number, 10), String(number), debug(number) + ' stringifies to ' + number);
		});

		forEach([
			[37, 2, '100101'],
			[37, 3, '1101'],
			[37, 4, '211'],
			[37, 5, '122'],
			[37, 6, '101'],
			[37, 7, '52'],
			[37, 8, '45'],
			[37, 9, '41'],
			[37, 10, '37'],
			[37, 11, '34'],
			[37, 12, '31'],
			[37, 13, '2b'],
			[37, 14, '29'],
			[37, 15, '27'],
			[37, 16, '25'],
			[37, 17, '23'],
			[37, 18, '21'],
			[37, 19, '1i'],
			[37, 20, '1h'],
			[37, 21, '1g'],
			[37, 22, '1f'],
			[37, 23, '1e'],
			[37, 24, '1d'],
			[37, 25, '1c'],
			[37, 26, '1b'],
			[37, 27, '1a'],
			[37, 28, '19'],
			[37, 29, '18'],
			[37, 30, '17'],
			[37, 31, '16'],
			[37, 32, '15'],
			[37, 33, '14'],
			[37, 34, '13'],
			[37, 35, '12'],
			[37, 36, '11']
		], function (testCase) {
			t.equal(
				ES.Number.toString(testCase[0], testCase[1]),
				testCase[2],
				debug(testCase[0]) + ' stringifies to ' + debug(testCase[2]) + ' in base ' + debug(testCase[1])
			);
		});

		t.end();
	});

	test('ParseHexOctet', function (t) {
		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { ES.ParseHexOctet(nonString, 0); },
				TypeError,
				debug(nonString) + ' is not a String'
			);
		});

		forEach(v.notNonNegativeIntegers, function (nonNonNegativeInteger) {
			t['throws'](
				function () { ES.ParseHexOctet('', nonNonNegativeInteger); },
				TypeError,
				debug(nonNonNegativeInteger) + ' is not a non-negative integer'
			);
		});

		var str = 'abc';
		t.deepEqual(
			ES.ParseHexOctet(str, str.length - 1),
			[new SyntaxError('requested a position on a string that does not contain 2 characters at that position')],
			'"position + 2" is not a valid index into the string'
		);

		t.deepEqual(
			ES.ParseHexOctet('0gx', 0),
			[new SyntaxError('Invalid hexadecimal characters')],
			'invalid hex characters return an array with an error'
		);

		for (var i = 0; i < 256; i += 1) {
			var hex = ES.StringPad(i.toString(16), 2, '0', 'start');
			t.equal(ES.ParseHexOctet(hex, 0), i, debug(hex) + ' parses to ' + i);
			t.equal(ES.ParseHexOctet('0' + hex, 1), i, '0' + debug(hex) + ' at position 1 parses to ' + i);
		}

		t.end();
	});

	test('SameValueNonNumber', function (t) {
		var willThrow = [
			[3, 4],
			[NaN, 4],
			[4, ''],
			['abc', true],
			[{}, false]
		];
		forEach(willThrow, function (nums) {
			t['throws'](function () { return ES.SameValueNonNumber.apply(ES, nums); }, TypeError, 'value must be same type and non-number: got ' + debug(nums[0]) + ' and ' + debug(nums[1]));
		});

		forEach(v.objects.concat(v.nonNumberPrimitives).concat(v.bigints), function (val) {
			t.equal(val === val, ES.SameValueNonNumber(val, val), debug(val) + ' is SameValueNonNumber to itself');
		});

		t.end();
	});

	test('SetTypedArrayFromArrayLike', function (t) {
		forEach(v.primitives.concat(v.objects, [[]]), function (nonTA) {
			t['throws'](
				function () { ES.SetTypedArrayFromArrayLike(nonTA, 0, []); },
				TypeError,
				'target: ' + debug(nonTA) + ' is not a TypedArray'
			);
		});

		t.test('Typed Array Support', { skip: availableTypedArrays.length === 0 }, function (st) {
			forEach(v.notNonNegativeIntegers, function (notNonNegativeInteger) {
				if (notNonNegativeInteger !== Infinity) {
					st['throws'](
						function () { ES.SetTypedArrayFromArrayLike(new Uint8Array(0), notNonNegativeInteger, []); },
						TypeError,
						'targetOffset: ' + debug(notNonNegativeInteger) + ' is not a non-negative integer'
					);
				}
			});

			st['throws'](
				function () { ES.SetTypedArrayFromArrayLike(new Uint8Array(0), Infinity, []); },
				RangeError,
				'targetOffset: ' + debug(Infinity) + ' is not a finite integer'
			);

			st['throws'](
				function () { ES.SetTypedArrayFromArrayLike(new Uint8Array(0), 0, new Uint8Array(0)); },
				TypeError,
				'source: must not be a TypedArray'
			);

			st.test('can detach', { skip: !canDetach }, function (s2t) {
				var arr = new Uint8Array(0);
				ES.DetachArrayBuffer(arr.buffer);

				s2t['throws'](
					function () { ES.SetTypedArrayFromArrayLike(arr, 0, []); },
					TypeError,
					'target’s buffer must not be detached'
				);

				s2t.end();
			});

			forEach(availableTypedArrays, function (name) {
				var isBigInt = name.slice(0, 3) === 'Big';
				var Z = isBigInt ? safeBigInt : Number;
				var TA = global[name];

				var ta = new TA([Z(1), Z(2), Z(3)]);

				st['throws'](
					function () { ES.SetTypedArrayFromArrayLike(ta, 3, [Z(10)]); },
					RangeError,
					name + ': out of bounds set attempt throws'
				);

				ES.SetTypedArrayFromArrayLike(ta, 1, [Z(10)]);

				st.deepEqual(ta, new TA([Z(1), Z(10), Z(3)]), name + ': target is updated');
			});

			st.test('getters are supported, and can detach', { skip: !defineProperty.oDP || !canDetach }, function (s2t) {
				var ta = new Uint8Array([1, 2, 3]);
				var obj = { length: 1 };
				defineProperty.oDP(obj, '0', { get: function () { ES.DetachArrayBuffer(ta.buffer); return 10; } });

				s2t.doesNotThrow(
					function () { ES.SetTypedArrayFromArrayLike(ta, 1, obj); },
					TypeError,
					'when a Get detaches the buffer, it does not throw'
				);

				s2t.end();
			});

			st.end();
		});

		t.end();
	});

	test('SortIndexedProperties', function (t) {
		/* eslint no-unused-vars: 0 */

		var emptySortCompare = function (a, b) {};

		forEach(v.primitives, function (primitive) {
			t['throws'](
				function () { ES.SortIndexedProperties(primitive, 0, emptySortCompare, 'skip-holes'); },
				TypeError,
				'obj must be an Object; ' + debug(primitive) + ' is not one'
			);
		});

		forEach(v.notNonNegativeIntegers, function (nonNonNegativeInteger) {
			t['throws'](
				function () { ES.SortIndexedProperties({}, nonNonNegativeInteger, emptySortCompare, 'skip-holes'); },
				TypeError,
				'`len`: ' + debug(nonNonNegativeInteger) + ' is not a non-negative integer'
			);
		});

		forEach(
			v.nonFunctions.concat(
				function () {},
				function f(a, b) { return 0; },
				function (a) { return 0; },
				arrowFns.length > 0 ? [
					/* eslint no-new-func: 1 */
					Function('return () => {}')(),
					Function('return (a) => {}')(),
					Function('return (a, b, c) => {}')()
				] : []
			),
			function (nonTwoArgAbstractClosure) {
				t['throws'](
					function () { ES.SortIndexedProperties({}, 0, nonTwoArgAbstractClosure, 'skip-holes'); },
					TypeError,
					'`len`: ' + debug(nonTwoArgAbstractClosure) + ' is not an abstract closure taking two args'
				);
			}
		);

		forEach([
			function (a, b) { return 0; }
		].concat(arrowFns.length > 0 ? [
			/* eslint no-new-func: 1 */
			Function('return (a, b) => 0')()
		] : []), function (ac) {
			t.doesNotThrow(
				function () { ES.SortIndexedProperties({}, 0, ac, 'skip-holes'); },
				'an abstract closure taking two args is accepted'
			);
		});

		t['throws'](
			function () { ES.SortIndexedProperties({}, 0, emptySortCompare, ''); },
			TypeError,
			'`holes`: only enums allowed'
		);

		var o = [1, 3, 2, 0];

		forEach(['skip-holes', 'read-through-holes'], function (holes) {
			t.deepEqual(
				ES.SortIndexedProperties(
					o,
					3,
					function (a, b) { return a - b; },
					holes
				),
				[1, 2, 3],
				holes + ': sorted items are returned, up to the expected length of the object'
			);

			t.deepEqual(
				ES.SortIndexedProperties(
					o,
					4,
					function (a, b) { return b - a; },
					holes
				),
				[3, 2, 1, 0],
				holes + ': sorted items are returned'
			);
		});

		t.deepEqual(
			ES.SortIndexedProperties(
				o,
				6,
				function (a, b) { return a - b; },
				'read-through-holes'
			),
			[0, 1, 2, 3, undefined, undefined],
			'read-through-holes: sorted items are returned'
		);
		t.deepEqual(
			ES.SortIndexedProperties(
				o,
				6,
				function (a, b) { return a - b; },
				'skip-holes'
			),
			[0, 1, 2, 3],
			'skip-holes: sorted items are returned, holes skipped'
		);

		// TODO: tests with holes

		t.end();
	});

	test('TimeZoneString', function (t) {
		forEach(v.nonIntegerNumbers.concat(v.infinities, NaN), function (nonIntegerNumber) {
			t['throws'](
				function () { ES.TimeZoneString(nonIntegerNumber); },
				TypeError,
				debug(nonIntegerNumber) + ' is not an integral number'
			);
		});

		var d = new Date();

		t.equal(ES.TimeZoneString(Number(d)), d.toTimeString().match(/\((.*)\)$/)[1], 'matches parenthesized part of .toTimeString');

		t.end();
	});

	test('TypedArrayCreateSameType', function (t) {
		t.test('no Typed Array support', { skip: availableTypedArrays.length > 0 }, function (st) {
			forEach(v.primitives.concat(v.objects), function (nonTA) {
				st['throws'](
					function () { ES.TypedArrayCreateSameType(nonTA, []); },
					SyntaxError,
					'no Typed Array support'
				);
			});

			forEach(v.nonArrays, function (nonArray) {
				st['throws'](
					function () { ES.TypedArrayCreate(Array, nonArray); },
					SyntaxError,
					'no Typed Array support'
				);
			});

			st.end();
		});

		t.test('Typed Array support', { skip: availableTypedArrays.length === 0 }, function (st) {
			forEach(v.primitives.concat(v.objects), function (nonTA) {
				st['throws'](
					function () { ES.TypedArrayCreateSameType(nonTA, []); },
					TypeError,
					debug(nonTA) + ' is not a Typed Array'
				);
			});

			forEach(v.nonArrays, function (nonArray) {
				st['throws'](
					function () { ES.TypedArrayCreateSameType(new global[availableTypedArrays[0]](), nonArray); },
					TypeError,
					debug(nonArray) + ' is not an Array'
				);
			});

			forEach(availableTypedArrays, function (TypedArray) {
				var Constructor = global[TypedArray];

				var typedArray = ES.TypedArrayCreateSameType(new Constructor(), []);
				st.equal(whichTypedArray(typedArray), TypedArray, 'created a ' + TypedArray);
				st.equal(typedArrayLength(typedArray), 0, 'created a ' + TypedArray + ' of length 42');

				var taLength = ES.TypedArrayCreateSameType(new Constructor(1), [42]);
				st.equal(whichTypedArray(taLength), TypedArray, 'created a ' + TypedArray);
				st.equal(typedArrayLength(taLength), 42, 'created a ' + TypedArray + ' of length 42');
			});

			st.end();
		});

		t.end();
	});

	test('truncate', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.truncate(nonNumber); },
				TypeError,
				debug(nonNumber) + ' is not a number'
			);
		});

		t.equal(ES.truncate(-1.1), -1, '-1.1 truncates to -1');
		t.equal(ES.truncate(1.1), 1, '1.1 truncates to 1');
		t.equal(ES.truncate(0), 0, '+0 truncates to +0');
		t.equal(ES.truncate(-0), 0, '-0 truncates to +0');

		t.end();
	});

	test('WordCharacters', function (t) {
		forEach([].concat(v.primitives, v.objects), function (nonRER) {
			t['throws'](
				function () { ES.WordCharacters(nonRER); },
				TypeError,
				debug(nonRER) + ' is not a RegularExpressionRecord'
			);
		});

		var rer = {
			'[[IgnoreCase]]': false,
			'[[Multiline]]': false,
			'[[DotAll]]': false,
			'[[Unicode]]': false,
			'[[CapturingGroupsCount]]': 0
		};

		forEach(v.nonBooleans, function (nonBoolean) {
			t['throws'](
				function () { ES.WordCharacters(assign({}, rer, { '[[IgnoreCase]]': nonBoolean })); },
				TypeError,
				'[[IgnoreCase]]: ' + debug(nonBoolean) + ' is not a Boolean'
			);

			t['throws'](
				function () { ES.WordCharacters(assign({}, rer, { '[[Unicode]]': nonBoolean })); },
				TypeError,
				'[[Unicode]]: ' + debug(nonBoolean) + ' is not a Boolean'
			);
		});

		t.equal(ES.WordCharacters(rer), 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_', 'not both true gives a-zA-Z0-9_');
		t.equal(ES.WordCharacters(assign({}, rer, { '[[Unicode]]': true })), 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_', 'not both true gives a-zA-Z0-9_');
		t.equal(ES.WordCharacters(assign({}, rer, { '[[IgnoreCase]]': true })), 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_', 'not both true gives a-zA-Z0-9_');
		t.equal(ES.WordCharacters(assign({}, rer, { '[[IgnoreCase]]': true, '[[Unicode]]': true })), 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_', 'both true gives a-zA-Z0-9_');

		t.end();
	});
};

var es2024 = function ES2024(ES, ops, expectedMissing, skips) {
	es2023(ES, ops, expectedMissing, assign({}, skips, {
		CreateMethodProperty: true,
		DefaultTimeZone: true,
		GetIterator: true,
		GetSubstitution: true,
		GetValueFromBuffer: true,
		IntegerIndexedElementGet: true,
		IntegerIndexedElementSet: true,
		IsBigIntElementType: true,
		IsNoTearConfiguration: true,
		IsUnclampedIntegerElementType: true,
		IsUnsignedElementType: true,
		NumericToRawBytes: true,
		RawBytesToNumeric: true,
		SetValueInBuffer: true,
		StringPad: true,
		thisBigIntValue: true,
		thisBooleanValue: true,
		thisNumberValue: true,
		thisStringValue: true,
		thisSymbolValue: true,
		thisTimeValue: true,
		TypedArrayCreate: true,
		TypedArrayElementType: true,
		ValidateAtomicAccess: true,
		ValidateIntegerTypedArray: true,
		ValidateTypedArray: true
	}));

	var test = makeTest(ES, skips);

	test('AddValueToKeyedGroup', function (t) {
		forEach(v.nonArrays, function (nonArray) {
			t['throws'](
				function () { ES.AddValueToKeyedGroup(nonArray, 'key', 'value'); },
				TypeError,
				debug(nonArray) + ' is not an Array'
			);
		});

		t['throws'](
			function () { ES.AddValueToKeyedGroup([{ keyedGroup: false }], 'key', 'value'); },
			TypeError,
			'`groups` is not a List of keyed groups'
		);

		var groups = [];
		t.equal(ES.AddValueToKeyedGroup(groups, 'key', 'value'), undefined);
		t.deepEqual(groups, [{ '[[Key]]': 'key', '[[Elements]]': ['value'] }], 'first value is added to a new group');

		t.equal(ES.AddValueToKeyedGroup(groups, 'key', 'value2'), undefined);
		t.equal(ES.AddValueToKeyedGroup(groups, 'key2', 'value'), undefined);
		t.deepEqual(
			groups,
			[
				{ '[[Key]]': 'key', '[[Elements]]': ['value', 'value2'] },
				{ '[[Key]]': 'key2', '[[Elements]]': ['value'] }
			],
			'values added to expected groups'
		);

		t.end();
	});

	test('GetArrayBufferMaxByteLengthOption', function (t) {
		forEach(v.primitives, function (nonObject) {
			t.equal(ES.GetArrayBufferMaxByteLengthOption(nonObject), 'EMPTY', debug(nonObject) + ' is not an Object, returns ~EMPTY~');
		});

		t.equal(ES.GetArrayBufferMaxByteLengthOption({}), 'EMPTY', 'absent `maxByteLength` yields ~EMPTY~');
		t.equal(ES.GetArrayBufferMaxByteLengthOption({ maxByteLength: undefined }), 'EMPTY', 'undefined `maxByteLength` yields ~EMPTY~');

		t.equal(ES.GetArrayBufferMaxByteLengthOption({ maxByteLength: 42 }), 42, '42 `maxByteLength` yields 42');
		t.equal(ES.GetArrayBufferMaxByteLengthOption({ maxByteLength: { valueOf: function () { return 42; } } }), 42, 'valueOf -> 42 `maxByteLength` yields 42');

		t.end();
	});

	test('GetIterator', function (t) {
		try {
			ES.GetIterator({}, 'null');
		} catch (e) {
			t.ok(e.message.indexOf('Assertion failed: `kind` must be one of \'sync\' or \'async\'' >= 0));
		}

		var arr = [1, 2];
		testIterator(t, ES.GetIterator(arr, 'SYNC')['[[Iterator]]'], arr);

		testIterator(t, ES.GetIterator('abc', 'SYNC')['[[Iterator]]'], 'abc'.split(''));

		t['throws'](
			function () { ES.GetIterator({}, 'SYNC'); },
			TypeError,
			'sync hint: undefined iterator method throws'
		);

		t['throws'](
			function () { ES.GetIterator({}, 'ASYNC'); },
			TypeError,
			'async hint: undefined iterator method throws'
		);

		t.test('Symbol.iterator', { skip: !v.hasSymbols }, function (st) {
			var m = new Map();
			m.set(1, 'a');
			m.set(2, 'b');

			var syncRecord = ES.GetIterator(m, 'SYNC');
			testIterator(st, syncRecord['[[Iterator]]'], [[1, 'a'], [2, 'b']]);

			var asyncRecord = ES.GetIterator(m, 'ASYNC');
			return testAsyncIterator(st, asyncRecord['[[Iterator]]'], [[1, 'a'], [2, 'b']]);
		});

		t.test('Symbol.asyncIterator', { skip: !v.hasSymbols || !Symbol.asyncIterator }, function (st) {
			st.test('an async iteratable returning a sync iterator', function (s2t) {
				var it = {
					next: function nextFromTest() {
						return Promise.resolve({
							done: true
						});
					}
				};
				var obj = {};
				obj[Symbol.asyncIterator] = function () {
					return it;
				};

				var asyncIterator = ES.GetIterator(obj, 'ASYNC');

				s2t.deepEqual(asyncIterator, makeIteratorRecord(it));

				s2t.end();
			});

			st.test('a throwing async iterator', function (s2t) {
				var sentinel = {};

				var asyncIterable = {};
				asyncIterable[Symbol.asyncIterator] = function () {
					var i = 0;
					return {
						next: function next() {
							if (i > 4) {
								throw sentinel;
							}
							try {
								return {
									done: i > 5,
									value: i
								};
							} finally {
								i += 1;
							}
						}
					};
				};
				var iteratorRecord = ES.GetIterator(asyncIterable, 'ASYNC');
				return testAsyncIterator(
					s2t,
					iteratorRecord['[[Iterator]]'],
					[0, 1, 2, 3, 4, 5]
				)['catch'](function (e) {
					if (e !== sentinel) {
						throw e;
					}
				});
			});

			st.end();
		});

		t.end();
	});

	test('GetSubstitution', function (t) {
		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { ES.GetSubstitution(nonString, '', 0, [], undefined, ''); },
				TypeError,
				'`matched`: ' + debug(nonString) + ' is not a String'
			);

			t['throws'](
				function () { ES.GetSubstitution('', nonString, 0, [], undefined, ''); },
				TypeError,
				'`str`: ' + debug(nonString) + ' is not a String'
			);

			t['throws'](
				function () { ES.GetSubstitution('', '', 0, [], undefined, nonString); },
				TypeError,
				'`replacement`: ' + debug(nonString) + ' is not a String'
			);

			if (typeof nonString !== 'undefined') {
				t['throws'](
					function () { ES.GetSubstitution('', '', 0, [nonString], undefined, ''); },
					TypeError,
					'`captures`: ' + debug([nonString]) + ' is not an Array of strings'
				);
			}
		});

		forEach(v.notNonNegativeIntegers, function (nonNonNegativeInteger) {
			t['throws'](
				function () { ES.GetSubstitution('', '', nonNonNegativeInteger, [], undefined, ''); },
				TypeError,
				'`position`: ' + debug(nonNonNegativeInteger) + ' is not a non-negative integer'
			);
		});

		forEach(v.nonArrays, function (nonArray) {
			t['throws'](
				function () { ES.GetSubstitution('', '', 0, nonArray, undefined, ''); },
				TypeError,
				'`captures`: ' + debug(nonArray) + ' is not an Array'
			);
		});

		forEach(v.nonUndefinedPrimitives, function (nonUndefinedPrimitive) {
			t['throws'](
				function () { ES.GetSubstitution('', '', 0, [], nonUndefinedPrimitive, ''); },
				TypeError,
				'`namedCaptures`: must be `undefined` or an Object'
			);
		});

		t.equal(
			ES.GetSubstitution('def', 'abcdefghi', 3, [], undefined, '123'),
			'123',
			'returns the substitution'
		);
		t.equal(
			ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '$$2$'),
			'$2$',
			'supports $$, and trailing $'
		);

		t.equal(
			ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '>$&<'),
			'>abcdef<',
			'supports $&'
		);

		t.equal(
			ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '>$`<'),
			'><',
			'supports $` at position 0'
		);
		t.equal(
			ES.GetSubstitution('def', 'abcdefghi', 3, [], undefined, '>$`<'),
			'>abc<',
			'supports $` at position > 0'
		);

		t.equal(
			ES.GetSubstitution('def', 'abcdefghi', 7, [], undefined, ">$'<"),
			'><',
			"supports $' at a position where there's less than `matched.length` chars left"
		);
		t.equal(
			ES.GetSubstitution('def', 'abcdefghi', 3, [], undefined, ">$'<"),
			'>ghi<',
			"supports $' at a position where there's more than `matched.length` chars left"
		);

		for (var i = 1; i < 100; i += 1) {
			var captures = [];
			captures[i] = 'test';
			t.equal(
				ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '>$' + i + '<'),
				'>$' + i + '<',
				'supports $' + i + ' with no captures'
			);
			t.equal(
				ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '>$' + i),
				'>$' + i,
				'supports $' + i + ' at the end of the replacement, with no captures'
			);
			t.equal(
				ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, undefined, '>$' + i + '<'),
				'><',
				'supports $' + i + ' with a capture at that index'
			);
			t.equal(
				ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, undefined, '>$' + i),
				'>',
				'supports $' + i + ' at the end of the replacement, with a capture at that index'
			);

			if (i < 10) {
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '>$0' + i + '<'),
					'>$0' + i + '<',
					'supports $0' + i + ' with no captures'
				);
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '>$0' + i),
					'>$0' + i,
					'supports $0' + i + ' at the end of the replacement, with no captures'
				);
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, undefined, '>$0' + i + '<'),
					'><',
					'supports $0' + i + ' with a capture at that index'
				);
				t.equal(
					ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, undefined, '>$0' + i),
					'>',
					'supports $0' + i + ' at the end of the replacement, with a capture at that index'
				);
			}
		}

		t.equal(
			ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, undefined, 'a>$<foo><z'),
			'a>$<foo><z',
			'works with the named capture regex without named captures'
		);
		t.equal(
			ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, undefined, 'a>$<foo>$<z'),
			'a>$<foo>$<z',
			'ignores named capture with a mismatched $<'
		);

		t.test('named captures', function (st) {
			var namedCaptures = {
				foo: 'foo!'
			};

			st.equal(
				ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, namedCaptures, 'a>$<foo><z'),
				'a>foo!<z',
				'supports named captures'
			);

			st.equal(
				ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, namedCaptures, 'a>$<foo>$z'),
				'a>foo!$z',
				'works with a $z'
			);

			st.equal(
				ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, namedCaptures, '$<foo'),
				'$<foo',
				'ignores named captures with a mismatched <'
			);

			st.equal(
				ES.GetSubstitution('abcdef', 'abcdefghi', 0, captures, namedCaptures, 'a>$<bar><z'),
				'a><z',
				'supports named captures with a missing namedCapture'
			);

			st.end();
		});

		t.test('test262: test/built-ins/String/prototype/replace/regexp-capture-by-index.js', function (st) {
			var str = 'foo-x-bar';

			var re0 = /x/;
			var re0Caps = [];
			var re1 = /(x)/;
			var re1Caps = ['x'];
			var re1x = /(x)($^)?/;
			var re1xCaps = ['x', undefined];
			var re10 = /((((((((((x))))))))))/;
			var re10Caps = ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x'];

			var matched = 'x';
			var pos = 4;

			var msg = function getSubMsg(token, isItem, thing, before0) {
				return '`' + token + '`' + (before0 ? ' before `0`' : ' is') + (isItem === false ? ' a failed' : isItem ? ' a' : ' not a') + ' capture index ' + (typeof thing === 'string' ? 'for string ' : 'in ') + debug(thing);
			};
			var expect = function getExpected(isItem, replacement, before0) {
				if (isItem) {
					return '|' + matched + (before0 ? '0' : '') + '|';
				}
				if (isItem === false) {
					return '|' + (before0 ? '0' : '') + '|';
				}
				return replacement;
			};
			var testGetSub = function testGetSub(token, is, is0) {
				var replacement = '|' + token + '|';

				st.equal(
					ES.GetSubstitution(matched, str, pos, [], [], replacement),
					expect(is[0], replacement),
					msg(token, is[0], matched)
				);
				st.equal(
					ES.GetSubstitution(matched, str, pos, re0Caps, [], replacement),
					expect(is[1], replacement),
					msg(token, is[1], re0)
				);
				st.equal(
					ES.GetSubstitution(matched, str, pos, re1Caps, [], replacement),
					expect(is[2], replacement),
					msg(token, is[2], re1)
				);
				st.equal(
					ES.GetSubstitution(matched, str, pos, re1xCaps, [], replacement),
					expect(is[3], replacement),
					msg(token, is[3], re1x)
				);
				st.equal(
					ES.GetSubstitution(matched, str, pos, re10Caps, [], replacement),
					expect(is[4], replacement),
					msg(token, is[4], re10)
				);

				if (is0) {
					replacement = '|' + token + '0|';
					st.equal(
						ES.GetSubstitution(matched, str, pos, [], [], replacement),
						expect(is0[0], replacement, true),
						msg(token, is0[0], matched, true)
					);
					st.equal(
						ES.GetSubstitution(matched, str, pos, re0Caps, [], replacement),
						expect(is0[1], replacement, true),
						msg(token, is0[1], re0, true)
					);
					st.equal(
						ES.GetSubstitution(matched, str, pos, re1Caps, [], replacement),
						expect(is0[2], replacement, true),
						msg(token, is0[2], re1, true)
					);
					st.equal(
						ES.GetSubstitution(matched, str, pos, re1xCaps, [], replacement),
						expect(is0[3], replacement, true),
						msg(token, is0[3], re1x, true)
					);
					st.equal(
						ES.GetSubstitution(matched, str, pos, re10Caps, [], replacement),
						expect(is0[4], replacement, true),
						msg(token, is0[4], re10, true)
					);
				}
			};

			testGetSub('$0', {});
			testGetSub('$00', {}, {});
			testGetSub('$1', { 2: true, 3: true, 4: true });
			testGetSub('$01', { 2: true, 3: true, 4: true }, { 2: true, 3: true, 4: true });
			testGetSub('$2', { 3: false, 4: true });
			testGetSub('$02', { 3: false, 4: true }, { 3: false, 4: true });

			var replacement = '|$10|';
			st.equal(
				ES.GetSubstitution(matched, str, pos, [], [], replacement),
				replacement,
				'`$10` is not a capture index (nor is `$1`) for string ' + debug(matched)
			);
			st.equal(
				ES.GetSubstitution(matched, str, pos, re0Caps, [], replacement),
				replacement,
				'`$10` is not a capture index (nor is `$1`) in ' + debug(re0)
			);
			st.equal(
				ES.GetSubstitution(matched, str, pos, re1Caps, [], replacement),
				'|x0|',
				'`$10` is not a capture index (but `$1` is) in ' + debug(re1)
			);
			st.equal(
				ES.GetSubstitution(matched, str, pos, re1xCaps, [], replacement),
				'|x0|',
				'`$10` is not a capture index (but `$1` is) in ' + debug(re1x)
			);
			st.equal(
				ES.GetSubstitution(matched, str, pos, re10Caps, [], replacement),
				'|x|',
				'`$10` is a capture index in ' + debug(re10)
			);

			replacement = '|$100|';
			st.equal(
				ES.GetSubstitution(matched, str, pos, [], [], replacement),
				replacement,
				'`$10` before `0` is not a capture index (nor is `$1`) for string ' + debug(matched)
			);
			st.equal(
				ES.GetSubstitution(matched, str, pos, re0Caps, [], replacement),
				replacement,
				'`$10` is not a capture index (nor is `$1`) in ' + debug(re0)
			);
			st.equal(
				ES.GetSubstitution(matched, str, pos, re1Caps, [], replacement),
				'|x00|',
				'`$10` before `0` is not a capture index (but `$1` is) in ' + debug(re1)
			);
			st.equal(
				ES.GetSubstitution(matched, str, pos, re1xCaps, [], replacement),
				'|x00|',
				'`$10` before `0` is not a capture index (but `$1` is) in ' + debug(re1x)
			);
			st.equal(
				ES.GetSubstitution(matched, str, pos, re10Caps, [], replacement),
				'|x0|',
				'`$10` before `0` is a capture index in ' + debug(re10)
			);

			replacement = '|$20|';
			st.equal(
				ES.GetSubstitution(matched, str, pos, [], [], replacement),
				replacement,
				'`$20` is not a capture index (nor is `$2`) for string ' + debug(matched)
			);
			st.equal(
				ES.GetSubstitution(matched, str, pos, re0Caps, [], replacement),
				replacement,
				'`$20` is not a capture index (nor is `$2`) in ' + debug(re0)
			);
			st.equal(
				ES.GetSubstitution(matched, str, pos, re1Caps, [], replacement),
				replacement,
				'`$20` is not a capture index (nor is `$2`) in ' + debug(re1)
			);
			st.equal(
				ES.GetSubstitution(matched, str, pos, re1xCaps, [], replacement),
				'|0|',
				'`$20` is not a capture index (but `$2` is a failed capture index) in ' + debug(re1x)
			);
			st.equal(
				ES.GetSubstitution(matched, str, pos, re10Caps, [], replacement),
				'|x0|',
				'`$20` is not a capture index (but `$2` is) in ' + debug(re10)
			);

			replacement = '|$200|';
			st.equal(
				ES.GetSubstitution(matched, str, pos, [], [], replacement),
				replacement,
				'`$20` before `0` is not a capture index (nor is `$2`) for string ' + debug(matched)
			);
			st.equal(
				ES.GetSubstitution(matched, str, pos, re0Caps, [], replacement),
				replacement,
				'`$20` before `0` is not a capture index (nor is `$2`) in ' + debug(re0)
			);
			st.equal(
				ES.GetSubstitution(matched, str, pos, re1Caps, [], replacement),
				replacement,
				'`$20` before `0` is not a capture index (nor is `$2`) in ' + debug(re1)
			);
			st.equal(
				ES.GetSubstitution(matched, str, pos, re1xCaps, [], replacement),
				'|00|',
				'`$20` before `0` is not a capture index (but `$2` is a failed capture index) in ' + debug(re1x)
			);
			st.equal(
				ES.GetSubstitution(matched, str, pos, re10Caps, [], replacement),
				'|x00|',
				'`$20` before `0` is not a capture index (but `$2` is) in ' + debug(re10)
			);

			st.end();
		});

		t.end();
	});

	test('GetValueFromBuffer', function (t) {
		var isTypedArray = true;
		var order = 'UNORDERED';

		forEach(v.primitives.concat(v.objects), function (nonAB) {
			t['throws'](
				function () { ES.GetValueFromBuffer(nonAB, 0, 'int8', isTypedArray, order); },
				TypeError,
				debug(nonAB) + ' is not an ArrayBuffer'
			);
		});

		t.test('ArrayBuffers supported', { skip: typeof ArrayBuffer !== 'function' }, function (st) {
			forEach(v.notNonNegativeIntegers, function (nonNonNegativeInteger) {
				st['throws'](
					function () { ES.GetValueFromBuffer(new ArrayBuffer(8), nonNonNegativeInteger, 'int8', isTypedArray, order); },
					TypeError,
					debug(nonNonNegativeInteger) + ' is not a valid byte index'
				);
			});

			forEach(v.nonStrings.concat('not a valid type'), function (nonString) {
				st['throws'](
					function () { ES.GetValueFromBuffer(new ArrayBuffer(8), 0, nonString, isTypedArray, order); },
					TypeError,
					'type: ' + debug(nonString) + ' is not a valid String (or type) value'
				);
			});

			forEach(v.nonBooleans, function (nonBoolean) {
				st['throws'](
					function () { ES.GetValueFromBuffer(new ArrayBuffer(8), 0, 'int8', nonBoolean, order); },
					TypeError,
					'isTypedArray: ' + debug(nonBoolean) + ' is not a valid Boolean value'
				);

				st['throws'](
					function () { ES.GetValueFromBuffer(new ArrayBuffer(8), 0, 'int8', isTypedArray, order, nonBoolean); },
					TypeError,
					'isLittleEndian: ' + debug(nonBoolean) + ' is not a valid Boolean value'
				);
			});

			forEach(v.nonStrings, function (nonString) {
				st['throws'](
					function () { ES.GetValueFromBuffer(new ArrayBuffer(8), 0, 'int8', isTypedArray, nonString); },
					TypeError,
					'order: ' + debug(nonString) + ' is not a valid String (or order) value'
				);
			});

			st.test('can detach', { skip: !canDetach }, function (s2t) {
				var buffer = new ArrayBuffer(8);
				s2t.equal(ES.DetachArrayBuffer(buffer), null, 'detaching returns null');

				s2t['throws'](
					function () { ES.GetValueFromBuffer(buffer, 0, 'int8', isTypedArray, order); },
					TypeError,
					'detached buffers throw'
				);

				s2t.end();
			});

			forEach(bufferTestCases, function (testCase, name) {
				st.test(name + ': ' + debug(testCase.value), function (s2t) {
					forEach([].concat(
						'Int8',
						'Uint8',
						'Uint8C',
						'Int16',
						'Uint16',
						'Int32',
						'Uint32',
						hasBigInts ? bigIntTypes : [],
						'Float32',
						'Float64'
					), function (type) {
						var isBigInt = type.slice(0, 3) === 'Big';
						var view = new DataView(new ArrayBuffer(elementSizes.$Float64Array));
						var method = type === 'Uint8C' ? 'Uint8' : type;
						// var value = unserialize(testCase.value);
						var result = testCase[type === 'Uint8C' ? 'Uint8Clamped' : type];
						var hasBigEndian = type !== 'Int8' && type !== 'Uint8' && type !== 'Uint8C'; // the 8-bit types are special, they don't have big-endian
						/*
						st.equal(
							ES.GetValueFromBuffer(testCase.buffer, 0, type.toLowerCase()),
							defaultEndianness === testCase.endian ? testCase[type + 'little'] : testCase[type + 'big'],
							'buffer holding ' + debug(value) + ' (' + testCase.endian + ' endian) with type ' + type + ', default endian, yields expected value'
						);
						*/

						clearBuffer(view.buffer);
						var littleVal = unserialize(result.setAsLittle.asLittle);
						view['set' + method](0, isBigInt ? safeBigInt(littleVal) : littleVal, true);

						try {
							if (isBigInt) {
								$BigInt(littleVal); // noop to trigger the error when needsBigIntHack
							}
							s2t.equal(
								ES.GetValueFromBuffer(view.buffer, 0, type.toUpperCase(), isTypedArray, order, true),
								littleVal,
								'buffer with type ' + type + ', little -> little, yields expected value'
							);
						} catch (e) {
							if (isBigInt && safeBigInt !== $BigInt && e instanceof RangeError) {
								s2t.comment('SKIP node v10.4-v10.8 have a bug where you can‘t `BigInt(x)` anything larger than MAX_SAFE_INTEGER');
								return;
							}
							throw e;
						}

						if (hasBigEndian) {
							s2t.equal(
								ES.GetValueFromBuffer(view.buffer, 0, type.toUpperCase(), isTypedArray, order, false),
								view['get' + method](0, false),
								'buffer with type ' + type + ', little -> big, yields expected value'
							);

							clearBuffer(view.buffer);
							var bigVal = unserialize(result.setAsBig.asBig);
							view['set' + method](0, isBigInt ? safeBigInt(bigVal) : bigVal, false);

							s2t.equal(
								ES.GetValueFromBuffer(view.buffer, 0, type.toUpperCase(), isTypedArray, order, false),
								bigVal,
								'buffer with type ' + type + ', big -> big, yields expected value'
							);

							s2t.equal(
								ES.GetValueFromBuffer(view.buffer, 0, type.toUpperCase(), isTypedArray, order, true),
								view['get' + method](0, true),
								'buffer with type ' + type + ', big -> little, yields expected value'
							);
						}
					});

					s2t.end();
				});
			});

			st.end();
		});

		t.end();
	});

	test('GetViewByteLength', function (t) {
		forEach(v.primitives.concat(v.objects), function (nonDVWBWRecord) {
			t['throws'](
				function () { ES.GetViewByteLength(nonDVWBWRecord); },
				TypeError,
				debug(nonDVWBWRecord) + ' is not a Data View With Buffer Witness Record'
			);
		});

		t.test('DataViews supported', { skip: typeof DataView !== 'function' }, function (st) {
			var ab = new ArrayBuffer(8);
			var dv = new DataView(ab);

			var record = ES.MakeDataViewWithBufferWitnessRecord(dv, 'UNORDERED');

			st.equal(ES.GetViewByteLength(record), 8, 'non-auto byte length returns it');

			// TODO: actual DV byteLength auto, but not fixed length? (may not be possible)

			st.test('non-fixed length, return byteLength - byteOffset', { todo: 'blocked on native resizable ABs/growable SABs' });

			st.test('can detach', { skip: !canDetach }, function (s2t) {
				var dab = new ArrayBuffer(1);
				var ddv = new DataView(dab);

				var ndRecord = ES.MakeDataViewWithBufferWitnessRecord(ddv, 'UNORDERED');
				ES.DetachArrayBuffer(dab);

				s2t['throws'](
					function () { ES.GetViewByteLength(ndRecord); },
					TypeError,
					'non-fixed view, detached buffer, non-detached record, throws inside IsViewOutOfBounds'
				);

				ndRecord = ES.MakeDataViewWithBufferWitnessRecord(ddv, 'UNORDERED'); // reflect detachment

				s2t['throws'](
					function () { ES.GetViewByteLength(ndRecord); },
					TypeError,
					'non-fixed view, detached buffer, detached record, throws inside IsViewOutOfBounds'
				);

				s2t.test('non-fixed length, detached -> throws', { todo: 'blocked on native resizable ABs/growable SABs' });

				s2t.end();
			});

			st.end();
		});

		t.end();
	});

	test('GroupBy', function (t) {
		t['throws'](function () { ES.GroupBy([], function () {}, 'unknown'); }, 'keyCoercion is not ~PROPERTY~ or ~ZERO~');

		forEach(v.nullPrimitives, function (nullish) {
			t['throws'](
				function () { ES.GroupBy(nullish, function () {}, 'PROPERTY'); },
				TypeError,
				debug(nullish) + ' is not an Object'
			);
		});

		forEach(v.nonFunctions, function (nonFunction) {
			t['throws'](
				function () { ES.GroupBy([], nonFunction, 'PROPERTY'); },
				TypeError,
				debug(nonFunction) + ' is not a Function'
			);
		});

		forEach(v.nonStrings, function (nonIterable) {
			t['throws'](
				function () { ES.GroupBy(nonIterable, function () {}, 'PROPERTY'); },
				TypeError,
				debug(nonIterable) + ' is not iterable'
			);
		});

		var tenEx = t.captureFn(function (x) { return x * 10; });
		var result = ES.GroupBy([-0, 0, 1, 2], tenEx, 'PROPERTY');
		t.deepEqual(
			result,
			[
				{ '[[Key]]': '0', '[[Elements]]': [-0, 0] },
				{ '[[Key]]': '10', '[[Elements]]': [1] },
				{ '[[Key]]': '20', '[[Elements]]': [2] }
			],
			'groups by property'
		);
		t.deepEqual(tenEx.calls, [
			{ args: [-0, 0], receiver: undefined, returned: -0 },
			{ args: [0, 1], receiver: undefined, returned: 0 },
			{ args: [1, 2], receiver: undefined, returned: 10 },
			{ args: [2, 3], receiver: undefined, returned: 20 }
		]);

		// TODO: maybe add a test for "larger than max safe int"?

		var negate = t.captureFn(function (x) { return -x; });
		var resultZero = ES.GroupBy([-0, 0, 1, 2], negate, 'ZERO');
		t.deepEqual(
			resultZero,
			[
				{ '[[Key]]': 0, '[[Elements]]': [-0, 0] },
				{ '[[Key]]': -1, '[[Elements]]': [1] },
				{ '[[Key]]': -2, '[[Elements]]': [2] }
			],
			'groups with SameValueZero'
		);
		t.deepEqual(negate.calls, [
			{ args: [-0, 0], receiver: undefined, returned: 0 },
			{ args: [0, 1], receiver: undefined, returned: -0 },
			{ args: [1, 2], receiver: undefined, returned: -1 },
			{ args: [2, 3], receiver: undefined, returned: -2 }
		]);

		// TODO: add a test for the callback throwing, that the iterator is closed

		// TODO: add a test for the callback return coercion throwing, that the iterator is closed

		// TODO:

		t.end();
	});

	test('HasEitherUnicodeFlag', function (t) {
		forEach([].concat(v.primitives, v.objects), function (nonRER) {
			t['throws'](
				function () { ES.HasEitherUnicodeFlag(nonRER); },
				TypeError,
				debug(nonRER) + ' is not a Regular Expression Record'
			);
		});

		var nonUnicode = {
			'[[IgnoreCase]]': false,
			'[[Multiline]]': false,
			'[[DotAll]]': false,
			'[[Unicode]]': false,
			'[[CapturingGroupsCount]]': 0
		};
		var unicode = {
			'[[IgnoreCase]]': false,
			'[[Multiline]]': false,
			'[[DotAll]]': false,
			'[[Unicode]]': true,
			'[[CapturingGroupsCount]]': 0
		};
		var nonUnicodeSets = {
			'[[IgnoreCase]]': false,
			'[[Multiline]]': false,
			'[[DotAll]]': false,
			'[[Unicode]]': false,
			'[[UnicodeSets]]': false,
			'[[CapturingGroupsCount]]': 0
		};
		var unicodeSets = {
			'[[IgnoreCase]]': false,
			'[[Multiline]]': false,
			'[[DotAll]]': false,
			'[[Unicode]]': false,
			'[[UnicodeSets]]': true,
			'[[CapturingGroupsCount]]': 0
		};

		t.equal(ES.HasEitherUnicodeFlag(nonUnicode), false);
		t.equal(ES.HasEitherUnicodeFlag(unicode), true);

		t.equal(ES.HasEitherUnicodeFlag(nonUnicodeSets), false);
		t.equal(ES.HasEitherUnicodeFlag(unicodeSets), true);

		t.end();
	});

	test('IsArrayBufferViewOutOfBounds', function (t) {
		forEach([].concat(v.primitives, v.objects), function (nonABV) {
			t['throws'](
				function () { ES.IsArrayBufferViewOutOfBounds(nonABV); },
				TypeError,
				debug(nonABV) + ' is not a Typed Array or DataView'
			);
		});

		t.test('Typed Arrays supported', { skip: availableTypedArrays.length === 0 }, function (st) {
			var ab = new ArrayBuffer(8);
			var dv = new DataView(ab);

			st.equal(ES.IsArrayBufferViewOutOfBounds(dv), false, 'DataView is not out of bounds');

			forEach(availableTypedArrays, function (type) {
				var TA = global[type];
				var ta = new TA(ab);

				st.equal(ES.IsArrayBufferViewOutOfBounds(ta), false, debug(ta) + ' is not out of bounds');
			});

			st.test('can detach', { skip: !canDetach }, function (s2t) {
				ES.DetachArrayBuffer(ab);

				s2t.equal(ES.IsArrayBufferViewOutOfBounds(dv), true, 'DataView with detached buffer is out of bounds');

				forEach(availableTypedArrays, function (type) {
					var ab2 = new ArrayBuffer(8);
					var TA = global[type];
					var ta = new TA(ab2);
					ES.DetachArrayBuffer(ab2);

					s2t.equal(ES.IsArrayBufferViewOutOfBounds(ta), true, debug(ta) + ' with detached buffer is out of bounds');
				});

				s2t.end();
			});

			st.end();
		});

		t.end();
	});

	test('IsBigIntElementType', function (t) {
		forEach(bigIntTypes, function (type) {
			t.equal(
				ES.IsBigIntElementType(type.toUpperCase()),
				true,
				debug(type.toLowerCase()) + ' is a BigInt element type'
			);
		});

		forEach(numberTypes, function (type) {
			t.equal(
				ES.IsBigIntElementType(type.toUpperCase()),
				false,
				debug(type.toLowerCase()) + ' is not a BigInt element type'
			);
		});

		t.end();
	});

	test('IsFixedLengthArrayBuffer', function (t) {
		forEach(v.primitives.concat(v.objects), function (nonAB) {
			t['throws'](
				function () { ES.IsFixedLengthArrayBuffer(nonAB); },
				TypeError,
				debug(nonAB) + ' is not an ArrayBuffer or SharedArrayBuffer'
			);
		});

		t.test('ArrayBuffers supported', { skip: typeof ArrayBuffer !== 'function' }, function (st) {
			var ab = new ArrayBuffer(1);
			st.equal(ES.IsFixedLengthArrayBuffer(ab), true, 'fixed length ArrayBuffer is fixed length');

			st.end();
		});

		t.test('SharedArrayBuffers supported', { skip: typeof SharedArrayBuffer !== 'function' }, function (st) {
			var sab = new SharedArrayBuffer(1);
			st.equal(ES.IsFixedLengthArrayBuffer(sab), true, 'fixed length SharedArrayBuffer is fixed length');

			st.end();
		});
	});

	test('IsNoTearConfiguration', function (t) {
		forEach(unclampedIntegerTypes, function (type) {
			t.equal(
				ES.IsNoTearConfiguration(type.toUpperCase()),
				true,
				debug(type.toUpperCase()) + ' with any order is a no-tear configuration'
			);
		});

		forEach(bigIntTypes, function (type) {
			t.equal(
				ES.IsNoTearConfiguration(type.toUpperCase(), 'INIT'),
				false,
				debug(type.toUpperCase()) + ' with ' + debug('INIT') + ' is not a no-tear configuration'
			);

			t.equal(
				ES.IsNoTearConfiguration(type.toUpperCase(), 'UNORDERED'),
				false,
				debug(type.toUpperCase()) + ' with ' + debug('UNORDERED') + ' is not a no-tear configuration'
			);

			t.equal(
				ES.IsNoTearConfiguration(type.toUpperCase()),
				true,
				debug(type.toUpperCase()) + ' with any other order is a no-tear configuration'
			);
		});

		forEach(clampedTypes, function (type) {
			t.equal(
				ES.IsNoTearConfiguration(type.toUpperCase()),
				false,
				debug(type.toUpperCase()) + ' with any order is not a no-tear configuration'
			);
		});

		t.end();
	});

	test('IsTypedArrayOutOfBounds', function (t) {
		forEach(v.primitives.concat(v.objects, [[]]), function (nonTAWBWR) {
			t['throws'](
				function () { ES.IsTypedArrayOutOfBounds(nonTAWBWR); },
				TypeError,
				debug(nonTAWBWR) + ' is not a Typed Array With Buffer Witness Record'
			);
		});

		t.test('detached buffer', { skip: !canDetach }, function (st) {
			var ab = new ArrayBuffer(8);

			var ta = new Uint8Array(ab);

			var preDetachedRecord = ES.MakeTypedArrayWithBufferWitnessRecord(ta, 'UNORDERED');

			st.equal(ES.IsTypedArrayOutOfBounds(preDetachedRecord), false);

			ES.DetachArrayBuffer(ab);

			var postDetachedRecord = ES.MakeTypedArrayWithBufferWitnessRecord(ta, 'UNORDERED');

			st['throws'](
				function () { ES.IsTypedArrayOutOfBounds(preDetachedRecord); },
				TypeError
			);

			st.equal(ES.IsTypedArrayOutOfBounds(postDetachedRecord), true);

			st.end();
		});

		t.end();
	});

	test('IsUnclampedIntegerElementType', function (t) {
		forEach(unclampedIntegerTypes, function (type) {
			t.equal(
				ES.IsUnclampedIntegerElementType(type.toUpperCase()),
				true,
				debug(type.toUpperCase()) + ' is an unclamped integer element type'
			);
		});

		forEach(clampedTypes.concat(nonIntegerTypes), function (type) {
			t.equal(
				ES.IsUnclampedIntegerElementType(type.toUpperCase()),
				false,
				debug(type.toUpperCase()) + ' is not an unclamped integer element type'
			);
		});

		t.end();
	});

	test('IsUnsignedElementType', function (t) {
		forEach(unsignedElementTypes, function (type) {
			t.equal(
				ES.IsUnsignedElementType(type.toUpperCase()),
				true,
				debug(type.toUpperCase()) + ' is an unsigned element type'
			);
		});

		forEach(signedElementTypes, function (type) {
			t.equal(
				ES.IsUnsignedElementType(type.toUpperCase()),
				false,
				debug(type.toUpperCase()) + ' is not an unsigned element type'
			);
		});

		t.end();
	});

	test('IsViewOutOfBounds', function (t) {
		forEach(v.primitives.concat(v.objects), function (nonDVWBWRecord) {
			t['throws'](
				function () { ES.IsViewOutOfBounds(nonDVWBWRecord); },
				TypeError,
				debug(nonDVWBWRecord) + ' is not a Data View With Buffer Witness Record'
			);
		});

		t.test('DataViews supported', { skip: typeof DataView !== 'function' }, function (st) {
			var ab = new ArrayBuffer(8);
			var dv = new DataView(ab);

			var record = ES.MakeDataViewWithBufferWitnessRecord(dv, 'UNORDERED');

			st.test('can detach', { skip: !canDetach }, function (s2t) {
				var dab = new ArrayBuffer(1);
				var ddv = new DataView(dab);
				ES.DetachArrayBuffer(dab);

				var ndRecord = { '[[Object]]': ddv, '[[CachedBufferByteLength]]': 1 };

				s2t['throws'](
					function () { ES.IsViewOutOfBounds(ndRecord); },
					TypeError,
					'detached view with no-detached record throws'
				);

				var dRecord = { '[[Object]]': ddv, '[[CachedBufferByteLength]]': 'DETACHED' };

				s2t.equal(ES.IsViewOutOfBounds(dRecord), true, 'detached view with detached record is out of bounds');

				s2t.end();
			});

			// TODO true for byteOffsetStart > bufferByteLength || byteOffsetEnd > bufferByteLength

			// else false

			// ES.IsViewOutOfBounds
		});

		t.end();
	});

	test('IteratorStepValue', function (t) {
		forEach(v.primitives.concat(v.objects), function (nonIteratorRecord) {
			t['throws'](
				function () { ES.IteratorStepValue(nonIteratorRecord); },
				TypeError,
				debug(nonIteratorRecord) + ' is not an Iterator Record'
			);
		});

		t.test('sync iterator record', function (st) {
			var i = 0;
			var iterator = {
				next: function next(x) {
					try {
						return {
							done: i > 2,
							value: [i, arguments.length, x]
						};
					} finally {
						i += 1;
					}
				}
			};
			var syncIteratorRecord = makeIteratorRecord(iterator);

			st.deepEqual(ES.IteratorStepValue(syncIteratorRecord), [0, 0, undefined], 'first yield');
			st.deepEqual(ES.IteratorStepValue(syncIteratorRecord), [1, 0, undefined], 'second yield');
			st.deepEqual(ES.IteratorStepValue(syncIteratorRecord), [2, 0, undefined], 'third yield');
			st.deepEqual(ES.IteratorStepValue(syncIteratorRecord), 'DONE', 'fourth yield');
			st.deepEqual(ES.IteratorStepValue(syncIteratorRecord), 'DONE', 'fifth yield');

			st.end();
		});

		var sentinel = {};
		t.test('next throws', function (st) {
			var iterator = {
				next: function next(x) {
					throw sentinel;
				}
			};
			var syncIteratorRecord = makeIteratorRecord(iterator);

			st.equal(syncIteratorRecord['[[Done]]'], false);
			try {
				ES.IteratorStepValue(syncIteratorRecord);
				st.fail('did not throw');
			} catch (e) {
				st.equal(e, sentinel, 'when next throws, it is rethrown');
			}
			st.equal(syncIteratorRecord['[[Done]]'], true);

			st.end();
		});

		t.test('.done throws', { skip: !$defineProperty }, function (st) {
			var result = {};
			$defineProperty(result, 'done', {
				configurable: true,
				enumerable: true,
				get: function () {
					throw sentinel;
				}
			});
			var iterator = {
				next: function () {
					return result;
				}
			};
			var syncIteratorRecord = makeIteratorRecord(iterator);

			st.equal(syncIteratorRecord['[[Done]]'], false);
			try {
				ES.IteratorStepValue(syncIteratorRecord);
				st.fail('did not throw');
			} catch (e) {
				st.equal(e, sentinel, 'when .done throws, it is rethrown');
			}
			st.equal(syncIteratorRecord['[[Done]]'], true);

			st.end();
		});

		t.test('.value throws', { skip: !$defineProperty }, function (st) {
			var result = { done: false };
			$defineProperty(result, 'value', {
				configurable: true,
				enumerable: true,
				get: function () {
					throw sentinel;
				}
			});
			var iterator = {
				next: function () {
					return result;
				}
			};
			var syncIteratorRecord = makeIteratorRecord(iterator);

			st.equal(syncIteratorRecord['[[Done]]'], false);
			try {
				ES.IteratorStepValue(syncIteratorRecord);
				st.fail('did not throw');
			} catch (e) {
				st.equal(e, sentinel, 'when .value throws, it is rethrown');
			}
			st.equal(syncIteratorRecord['[[Done]]'], true);

			st.end();
		});

		t.test('conflated sentinel value', function (st) {
			var i = 0;
			var iterator = {
				next: function next(x) {
					try {
						return {
							done: i > 2,
							value: i > 0 ? i : 'DONE'
						};
					} finally {
						i += 1;
					}
				}
			};
			var syncIteratorRecord = makeIteratorRecord(iterator);

			st.deepEqual(ES.IteratorStepValue(syncIteratorRecord), 'DONE', 'first yield');
			st.deepEqual(ES.IteratorStepValue(syncIteratorRecord), 1, 'second yield');
			st.deepEqual(ES.IteratorStepValue(syncIteratorRecord), 2, 'third yield');
			st.deepEqual(ES.IteratorStepValue(syncIteratorRecord), 'DONE', 'fourth yield');
			st.deepEqual(ES.IteratorStepValue(syncIteratorRecord), 'DONE', 'fifth yield');

			st.end();
		});

		t.end();
	});

	test('MakeDataViewWithBufferWitnessRecord', function (t) {
		forEach([].concat(
			v.nonObjects,
			v.objects
		), function (nonObject) {
			t['throws'](
				function () { ES.MakeDataViewWithBufferWitnessRecord(nonObject, 'UNORDERED'); },
				TypeError,
				debug(nonObject) + ' is not a DataView'
			);
		});

		t.test('DataViews supported', { skip: typeof DataView !== 'function' }, function (st) {
			forEach(v.nonStrings, function (nonString) {
				st['throws'](
					function () { ES.MakeDataViewWithBufferWitnessRecord(new DataView(new ArrayBuffer(8)), nonString); },
					TypeError,
					debug(nonString) + ' is not a valid order value'
				);
			});

			var ab = new ArrayBuffer(8);
			var dv = new DataView(ab);

			st.deepEqual(
				ES.MakeDataViewWithBufferWitnessRecord(dv, 'UNORDERED'),
				{ '[[Object]]': dv, '[[CachedBufferByteLength]]': ab.byteLength },
				'works with a DataView, unordered'
			);

			st.deepEqual(
				ES.MakeDataViewWithBufferWitnessRecord(dv, 'SEQ-CST'),
				{ '[[Object]]': dv, '[[CachedBufferByteLength]]': ab.byteLength },
				'works with a DataView, seq-cst'
			);

			st.end();
		});

		t.end();
	});

	test('MakeFullYear', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.MakeFullYear(nonNumber); },
				TypeError,
				debug(nonNumber) + ' is not a Number'
			);

		});

		t.equal(ES.MakeFullYear(NaN), NaN, 'NaN returns NaN');
		t.equal(ES.MakeFullYear(Infinity), Infinity, '∞ returns ∞');
		t.equal(ES.MakeFullYear(-Infinity), -Infinity, '-∞ returns -∞');

		t.equal(ES.MakeFullYear(0), 1900, '0 returns 1900');
		t.equal(ES.MakeFullYear(99), 1999, '99 returns 1999');

		t.equal(ES.MakeFullYear(100), 100, '100 returns 100');

		t.end();
	});

	test('MakeTypedArrayWithBufferWitnessRecord', function (t) {
		forEach(v.primitives, function (nonObject) {
			t['throws'](
				function () { ES.MakeTypedArrayWithBufferWitnessRecord(nonObject, 'UNORDERED'); },
				TypeError,
				debug(nonObject) + ' is not a TypedArray'
			);
		});

		t.test('actual typed arrays', { skip: availableTypedArrays.length === 0 }, function (st) {
			forEach(availableTypedArrays, function (TypedArray) {
				st.test('Typed Array: ' + TypedArray, function (tat) {
					var TA = global[TypedArray];
					var ta = new TA(8);

					tat['throws'](
						function () { ES.MakeTypedArrayWithBufferWitnessRecord(ta, 'not a valid order'); },
						TypeError,
						'invalid order enum value throws'
					);

					var record = ES.MakeTypedArrayWithBufferWitnessRecord(ta, 'UNORDERED');
					tat.deepEqual(record, {
						'[[Object]]': ta,
						'[[CachedBufferByteLength]]': ta.byteLength
					});

					tat.end();
				});
			});

			st.end();
		});

		t.end();
	});

	test('NumericToRawBytes', function (t) {
		forEach(v.nonStrings.concat('', 'Byte'), function (nonTAType) {
			t['throws'](
				function () { ES.NumericToRawBytes(nonTAType, 0, false); },
				TypeError,
				debug(nonTAType) + ' is not a String, or not a TypedArray type'
			);
		});

		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.NumericToRawBytes('int8', nonNumber, false); },
				TypeError,
				debug(nonNumber) + ' is not a Number'
			);
		});

		forEach(v.nonBooleans, function (nonBoolean) {
			t['throws'](
				function () { ES.NumericToRawBytes('int8', 0, nonBoolean); },
				TypeError,
				debug(nonBoolean) + ' is not a Boolean'
			);
		});

		forEach(bufferTestCases, function (testCase, name) {
			var value = unserialize(testCase.value);

			t.test(name + ': ' + value, function (st) {
				forEach([].concat(
					'Int8',
					'Uint8',
					'Uint8C',
					'Int16',
					'Uint16',
					'Int32',
					'Uint32',
					hasBigInts ? bigIntTypes : [],
					'Float32',
					'Float64'
				), function (type) {
					var isBigInt = type.slice(0, 3) === 'Big';
					var hasBigEndian = type !== 'Int8' && type !== 'Uint8' && type !== 'Uint8C'; // the 8-bit types are special, they don't have big-endian
					var result = testCase[type === 'Uint8C' ? 'Uint8Clamped' : type];

					if (isBigInt && (!isFinite(value) || Math.floor(value) !== value)) {
						return;
					}

					var valToSet = type === 'Uint8C' && value > 0xFF ? 0xFF : isBigInt ? safeBigInt(value) : value;

					st.test(type, function (s2t) {
						/*
						s2t.equal(
							ES.GetValueFromBuffer(testCase.buffer, 0, type, true, 'Unordered'),
							defaultEndianness === testCase.endian ? testCase[type].little.value : testCase[type].big.value,
							'buffer holding ' + debug(testCase.value) + ' (' + testCase.endian + ' endian) with type ' + type + ', default endian, yields expected value'
						);
						*/

						s2t.deepEqual(
							ES.NumericToRawBytes(type.toUpperCase(), valToSet, true),
							result[type === 'Float64' ? 'setAsLittle' : 'setAsTruncatedLittle'].bytes,
							debug(value) + ' with type ' + type + ', little endian, yields expected value'
						);

						if (hasBigEndian) {
							s2t.deepEqual(
								ES.NumericToRawBytes(type.toUpperCase(), valToSet, false),
								result[type === 'Float64' ? 'setAsBig' : 'setAsTruncatedBig'].bytes,
								debug(value) + ' with type ' + type + ', big endian, yields expected value'
							);
						}

						s2t.end();
					});
				});

				st.end();
			});
		});

		t.test('BigInt64', function (st) {
			st.test('bigints available', { skip: !hasBigInts }, function (s2t) {
				forEach([
					[BigInt(0), [0, 0, 0, 0, 0, 0, 0, 0]],
					[BigInt(1), [1, 0, 0, 0, 0, 0, 0, 0]],
					// [BigInt(-1), [255, 255, 255, 255, 255, 255, 255, 255]],
					[BigInt(16777216), [0, 0, 0, 1, 0, 0, 0, 0]], // max safe float32
					[BigInt(2147483647), [255, 255, 255, 127, 0, 0, 0, 0]],
					// [BigInt(-2147483647), [1, 0, 0, 128, 255, 255, 255, 255]],
					[BigInt(2147483648), [0, 0, 0, 128, 0, 0, 0, 0]]
					// [BigInt(-2147483648), [0, 0, 0, 128, 255, 255, 255, 255]]
				], function (pair) {
					var int = pair[0];
					var bytes = pair[1];

					if (availableTypedArrays.length > 0) {
						var expectedBytes = arrayFrom(new Uint8Array(assign(new BigInt64Array(1), [int]).buffer));
						s2t.deepEqual(
							bytes,
							expectedBytes,
							'bytes for ' + debug(int) + ' are correct; got ' + debug(expectedBytes)
						);
					}

					s2t.deepEqual(
						ES.NumericToRawBytes('BIGINT64', int, true),
						bytes,
						'little-endian: bytes for ' + debug(int) + ' are produced'
					);
					s2t.deepEqual(
						ES.NumericToRawBytes('BIGINT64', int, false),
						bytes.slice().reverse(),
						'big-endian: bytes for ' + debug(int) + ' are produced'
					);
				});

				s2t.end();
			});

			st.end();
		});

		t.test('BigUint64', function (st) {
			st.test('bigints available', { skip: !hasBigInts }, function (s2t) {
				forEach([
					[BigInt(0), [0, 0, 0, 0, 0, 0, 0, 0]],
					[BigInt(1), [1, 0, 0, 0, 0, 0, 0, 0]],
					// [BigInt(-1), [255, 255, 255, 255, 255, 255, 255, 255]],
					[BigInt(16777216), [0, 0, 0, 1, 0, 0, 0, 0]], // max safe float32
					[BigInt(2147483647), [255, 255, 255, 127, 0, 0, 0, 0]],
					// [BigInt(-2147483647), [1, 0, 0, 128, 255, 255, 255, 255]],
					[BigInt(2147483648), [0, 0, 0, 128, 0, 0, 0, 0]]
					// [BigInt(-2147483648), [0, 0, 0, 128, 255, 255, 255, 255]]
				], function (pair) {
					var int = pair[0];
					var bytes = pair[1];

					if (availableTypedArrays.length > 0) {
						var expectedBytes = arrayFrom(new Uint8Array(assign(new BigUint64Array(1), [int]).buffer));
						s2t.deepEqual(
							bytes,
							expectedBytes,
							'bytes for ' + debug(int) + ' are correct; got ' + debug(expectedBytes)
						);
					}

					s2t.deepEqual(
						ES.NumericToRawBytes('BIGUINT64', int, true),
						bytes,
						'little-endian: bytes for ' + debug(int) + ' are produced'
					);
					s2t.deepEqual(
						ES.NumericToRawBytes('BIGUINT64', int, false),
						bytes.slice().reverse(),
						'big-endian: bytes for ' + debug(int) + ' are produced'
					);
				});

				s2t.end();
			});

			st.end();
		});

		t.end();
	});

	test('RawBytesToNumeric', function (t) {
		forEach(v.nonStrings.concat('', 'Byte'), function (nonTAType) {
			t['throws'](
				function () { ES.RawBytesToNumeric(nonTAType, [], false); },
				TypeError,
				debug(nonTAType) + ' is not a String, or not a TypedArray type'
			);
		});

		forEach(v.primitives.concat(v.objects), function (nonArray) {
			t['throws'](
				function () { ES.RawBytesToNumeric('INT8', nonArray, false); },
				TypeError,
				debug(nonArray) + ' is not an Array'
			);
		});
		forEach([-1, 1.5, 256], function (nonByte) {
			t['throws'](
				function () { ES.RawBytesToNumeric('INT8', [nonByte], false); },
				TypeError,
				debug(nonByte) + ' is not a valid "byte"'
			);
		});

		forEach(v.nonBooleans, function (nonBoolean) {
			t['throws'](
				function () { ES.RawBytesToNumeric('INT8', [0], nonBoolean); },
				TypeError,
				debug(nonBoolean) + ' is not a Boolean'
			);
		});

		forEach(bufferTestCases, function (testCase, name) {
			var value = unserialize(testCase.value);
			t.test(name + ': ' + value, function (st) {
				forEach([].concat(
					'Int8',
					'Uint8',
					'Uint8C',
					'Int16',
					'Uint16',
					'Int32',
					'Uint32',
					hasBigInts ? bigIntTypes : [],
					'Float32',
					'Float64'
				), function (type) {
					var result = testCase[type === 'Uint8C' ? 'Uint8Clamped' : type];
					var hasBigEndian = type !== 'Int8' && type !== 'Uint8' && type !== 'Uint8C'; // the 8-bit types are special, they don't have big-endian

					var littleLittle = unserialize(result.setAsLittle.asLittle);
					try {
						st.equal(
							ES.RawBytesToNumeric(type.toUpperCase(), result.setAsLittle.bytes, true),
							littleLittle,
							type + ', little-endian: bytes (' + debug(result.setAsLittle.bytes) + ') for ' + debug(littleLittle) + ' produces it'
						);
					} catch (e) {
						if (safeBigInt !== $BigInt && e instanceof RangeError) {
							st.comment('SKIP node v10.4-v10.8 have a bug where you can‘t `BigInt(x)` anything larger than MAX_SAFE_INTEGER');
							return;
						}
					}
					if (hasBigEndian) {
						var bigBig = unserialize(result.setAsBig.asBig);
						st.equal(
							ES.RawBytesToNumeric(type.toUpperCase(), result.setAsBig.bytes, false),
							bigBig,
							type + ', big-endian: bytes (' + debug(result.setAsBig.bytes) + ') for ' + debug(bigBig) + ' produces it'
						);
					}
				});

				st.end();
			});
		});

		t.test('incorrect byte counts', function (st) {
			st['throws'](
				function () { ES.RawBytesToNumeric('FLOAT32', [0, 0, 0], false); },
				RangeError,
				'float32 with less than 4 bytes throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumeric('FLOAT32', [0, 0, 0, 0, 0], false); },
				RangeError,
				'float32 with more than 4 bytes throws a RangeError'
			);

			st['throws'](
				function () { ES.RawBytesToNumeric('FLOAT64', [0, 0, 0, 0, 0, 0, 0], false); },
				RangeError,
				'float64 with less than 8 bytes throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumeric('FLOAT64', [0, 0, 0, 0, 0, 0, 0, 0, 0], false); },
				RangeError,
				'float64 with more than 8 bytes throws a RangeError'
			);

			st['throws'](
				function () { ES.RawBytesToNumeric('INT8', [], false); },
				RangeError,
				'int8 with less than 1 byte throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumeric('INT8', [0, 0], false); },
				RangeError,
				'int8 with more than 1 byte throws a RangeError'
			);

			st['throws'](
				function () { ES.RawBytesToNumeric('UINT8', [], false); },
				RangeError,
				'uint8 with less than 1 byte throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumeric('UINT8', [0, 0], false); },
				RangeError,
				'uint8 with more than 1 byte throws a RangeError'
			);

			st['throws'](
				function () { ES.RawBytesToNumeric('UINT8C', [], false); },
				RangeError,
				'uint8c with less than 1 byte throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumeric('UINT8C', [0, 0], false); },
				RangeError,
				'uint8c with more than 1 byte throws a RangeError'
			);

			st['throws'](
				function () { ES.RawBytesToNumeric('INT16', [0], false); },
				RangeError,
				'int16 with less than 2 bytes throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumeric('INT16', [0, 0, 0], false); },
				RangeError,
				'int16 with more than 2 bytes throws a RangeError'
			);

			st['throws'](
				function () { ES.RawBytesToNumeric('UINT16', [0], false); },
				RangeError,
				'uint16 with less than 2 bytes throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumeric('UINT16', [0, 0, 0], false); },
				RangeError,
				'uint16 with more than 2 bytes throws a RangeError'
			);

			st['throws'](
				function () { ES.RawBytesToNumeric('UINT16', [0, 0, 0], false); },
				RangeError,
				'uint16 with less than 4 bytes throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumeric('UINT16', [0, 0, 0, 0, 0], false); },
				RangeError,
				'uint16 with more than 4 bytes throws a RangeError'
			);

			st['throws'](
				function () { ES.RawBytesToNumeric('UINT32', [0, 0, 0], false); },
				RangeError,
				'uint32 with less than 4 bytes throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumeric('UINT32', [0, 0, 0, 0, 0], false); },
				RangeError,
				'uint32 with more than 4 bytes throws a RangeError'
			);

			st['throws'](
				function () { ES.RawBytesToNumeric('BIGINT64', [0, 0, 0, 0, 0, 0, 0], false); },
				RangeError,
				'bigint64 with less than 8 bytes throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumeric('BIGINT64', [0, 0, 0, 0, 0, 0, 0, 0, 0], false); },
				RangeError,
				'bigint64 with more than 8 bytes throws a RangeError'
			);

			st['throws'](
				function () { ES.RawBytesToNumeric('BIGUINT64', [0, 0, 0, 0, 0, 0, 0], false); },
				RangeError,
				'biguint64 with less than 8 bytes throws a RangeError'
			);
			st['throws'](
				function () { ES.RawBytesToNumeric('BIGUINT64', [0, 0, 0, 0, 0, 0, 0, 0, 0], false); },
				RangeError,
				'biguint64 with more than 8 bytes throws a RangeError'
			);

			st.end();
		});

		t.test('bigint types, no bigints', { skip: hasBigInts }, function (st) {
			st['throws'](
				function () { ES.RawBytesToNumeric('BIGINT64', [0, 0, 0, 0, 0, 0, 0, 0], false); },
				SyntaxError,
				'bigint64 throws a SyntaxError when BigInt is not available'
			);
			st['throws'](
				function () { ES.RawBytesToNumeric('BIGUINT64', [0, 0, 0, 0, 0, 0, 0, 0], false); },
				SyntaxError,
				'biguint64 throws a SyntaxError when BigInt is not available'
			);

			st.end();
		});

		t.end();
	});

	test('SetValueInBuffer', function (t) {
		var order = 'UNORDERED';
		forEach(v.primitives.concat(v.objects), function (nonAB) {
			t['throws'](
				function () { ES.SetValueInBuffer(nonAB, 0, 'INT8', 0, true, order); },
				TypeError,
				debug(nonAB) + ' is not an ArrayBuffer'
			);
		});

		t.test('ArrayBuffers supported', { skip: typeof ArrayBuffer !== 'function' }, function (st) {
			forEach(v.notNonNegativeIntegers, function (nonNonNegativeInteger) {
				st['throws'](
					function () { ES.SetValueInBuffer(new ArrayBuffer(8), nonNonNegativeInteger, 'INT8', 0, true, order); },
					TypeError,
					debug(nonNonNegativeInteger) + ' is not a valid byte index'
				);
			});

			forEach(v.nonStrings.concat('not a valid type'), function (nonString) {
				st['throws'](
					function () { ES.SetValueInBuffer(new ArrayBuffer(8), 0, nonString, 0, true, order); },
					TypeError,
					'type: ' + debug(nonString) + ' is not a valid String (or type) value'
				);
			});

			forEach(v.nonBooleans, function (nonBoolean) {
				st['throws'](
					function () { ES.SetValueInBuffer(new ArrayBuffer(8), 0, 'INT8', 0, nonBoolean, order); },
					TypeError,
					'isTypedArray: ' + debug(nonBoolean) + ' is not a valid Boolean value'
				);

				st['throws'](
					function () { ES.SetValueInBuffer(new ArrayBuffer(8), 0, 'INT8', 0, true, order, nonBoolean); },
					TypeError,
					'isLittleEndian: ' + debug(nonBoolean) + ' is not a valid Boolean value'
				);
			});

			if (hasBigInts) {
				st['throws'](
					function () { ES.SetValueInBuffer(new ArrayBuffer(8), 0, 'INT8', $BigInt(0), true, order); },
					TypeError,
					debug($BigInt(0)) + ' is not a number, but the given type requires one'
				);

				st['throws'](
					function () { ES.SetValueInBuffer(new ArrayBuffer(8), 0, 'BIGUINT64', 0, true, order); },
					TypeError,
					debug(0) + ' is not a bigint, but the given type requires one'
				);
			}

			st['throws'](
				function () { ES.SetValueInBuffer(new ArrayBuffer(8), 0, 'INT8', 0, true, 'invalid order'); },
				TypeError,
				'invalid order'
			);

			st.test('can detach', { skip: !canDetach }, function (s2t) {
				var buffer = new ArrayBuffer(8);
				s2t.equal(ES.DetachArrayBuffer(buffer), null, 'detaching returns null');

				s2t['throws'](
					function () { ES.SetValueInBuffer(buffer, 0, 'INT8', 0, true, order); },
					TypeError,
					'detached buffers throw'
				);

				s2t.end();
			});

			forEach(bufferTestCases, function (testCase, name) {
				forEach([].concat(
					'Int8',
					'Uint8',
					'Uint8C',
					'Int16',
					'Uint16',
					'Int32',
					'Uint32',
					hasBigInts ? bigIntTypes : [],
					'Float32',
					'Float64'
				), function (type) {
					var isBigInt = type === 'BigInt64' || type === 'BigUint64';
					var Z = isBigInt ? safeBigInt : Number;
					var hasBigEndian = type !== 'Int8' && type !== 'Uint8' && type !== 'Uint8C'; // the 8-bit types are special, they don't have big-endian
					var result = testCase[type === 'Uint8C' ? 'Uint8Clamped' : type];
					var value = unserialize(testCase.value);

					if (isBigInt && (!isFinite(value) || Math.floor(value) !== value)) {
						return;
					}

					var valToSet = type === 'Uint8Clamped' && value > 255 ? 255 : Z(value);

					/*
					st.equal(
						ES.SetValueInBuffer(testCase.buffer, 0, type.toUpperCase(), true, order),
						defaultEndianness === testCase.endian ? testCase[type].little.value] : testCase[type].big.value,
						'buffer holding ' + debug(testCase.value) + ' (' + testCase.endian + ' endian) with type ' + type + ', default endian, yields expected value'
					);
					*/

					var elementSize = elementSizes['$' + (type === 'Uint8C' ? 'Uint8Clamped' : type) + 'Array'];

					var buffer = new ArrayBuffer(elementSizes.$Float64Array);
					var copyBytes = new Uint8Array(buffer);

					clearBuffer(buffer);

					st.equal(
						ES.SetValueInBuffer(buffer, 0, type.toUpperCase(), valToSet, true, order, true),
						void undefined,
						'returns undefined'
					);
					st.deepEqual(
						arrayFrom(Array.prototype.slice.call(copyBytes, 0, elementSize)),
						arrayFrom(Array.prototype.slice.call(new Uint8Array(result[type === 'Float64' ? 'setAsLittle' : 'setAsTruncatedLittle'].bytes), 0, elementSize)),
						'buffer holding ' + debug(value) + ' with type ' + type + ', little endian, yields expected value'
					);

					if (hasBigEndian) {
						clearBuffer(buffer);

						st.equal(
							ES.SetValueInBuffer(buffer, 0, type.toUpperCase(), valToSet, true, order, false),
							void undefined,
							'returns undefined'
						);
						st.deepEqual(
							arrayFrom(Array.prototype.slice.call(copyBytes, 0, elementSize)),
							arrayFrom(Array.prototype.slice.call(new Uint8Array(result[type === 'Float64' ? 'setAsBig' : 'setAsTruncatedBig'].bytes), 0, elementSize)),
							'buffer holding ' + debug(value) + ' with type ' + type + ', big endian, yields expected value'
						);
					}
				});
			});

			st.end();
		});

		t.test('SharedArrayBuffers supported', { skip: typeof SharedArrayBuffer !== 'function' }, function (st) {
			st['throws'](
				function () { ES.SetValueInBuffer(new SharedArrayBuffer(0), 0, 'INT8', 0, true, order); },
				SyntaxError,
				'SAB not yet supported'
			);

			st.end();
		});

		t.end();
	});

	test('StringPad', function (t) {
		t['throws'](
			function () { ES.StringPad('', 0, '', 'not start or end'); },
			TypeError,
			'`placement` must be ~START~ or ~END~'
		);

		t.equal(ES.StringPad('a', 3, '', 'start'), 'a');
		t.equal(ES.StringPad('a', 3, '', 'end'), 'a');
		t.equal(ES.StringPad('a', 3, '0', 'start'), '00a');
		t.equal(ES.StringPad('a', 3, '0', 'end'), 'a00');
		t.equal(ES.StringPad('a', 3, '012', 'start'), '01a');
		t.equal(ES.StringPad('a', 3, '012', 'end'), 'a01');
		t.equal(ES.StringPad('a', 7, '012', 'start'), '012012a');
		t.equal(ES.StringPad('a', 7, '012', 'end'), 'a012012');

		t.equal(ES.StringPad('a', 3, '', 'START'), 'a');
		t.equal(ES.StringPad('a', 3, '', 'END'), 'a');
		t.equal(ES.StringPad('a', 3, '0', 'START'), '00a');
		t.equal(ES.StringPad('a', 3, '0', 'END'), 'a00');
		t.equal(ES.StringPad('a', 3, '012', 'START'), '01a');
		t.equal(ES.StringPad('a', 3, '012', 'END'), 'a01');
		t.equal(ES.StringPad('a', 7, '012', 'START'), '012012a');
		t.equal(ES.StringPad('a', 7, '012', 'END'), 'a012012');

		t.end();
	});

	test('StringPaddingBuiltinsImpl', function (t) {
		t['throws'](
			function () { ES.StringPaddingBuiltinsImpl('', 0, '', 'not start or end'); },
			TypeError,
			'`placement` must be ~START~ or ~END~'
		);

		t.equal(ES.StringPaddingBuiltinsImpl('a', 3, '', 'start'), 'a');
		t.equal(ES.StringPaddingBuiltinsImpl('a', 3, '', 'end'), 'a');
		t.equal(ES.StringPaddingBuiltinsImpl('a', 3, '0', 'start'), '00a');
		t.equal(ES.StringPaddingBuiltinsImpl('a', 3, '0', 'end'), 'a00');
		t.equal(ES.StringPaddingBuiltinsImpl('a', 3, '012', 'start'), '01a');
		t.equal(ES.StringPaddingBuiltinsImpl('a', 3, '012', 'end'), 'a01');
		t.equal(ES.StringPaddingBuiltinsImpl('a', 7, '012', 'start'), '012012a');
		t.equal(ES.StringPaddingBuiltinsImpl('a', 7, '012', 'end'), 'a012012');
		t.equal(ES.StringPaddingBuiltinsImpl('a', 3, undefined, 'start'), '  a');
		t.equal(ES.StringPaddingBuiltinsImpl('abc', 1, undefined, 'start'), 'abc');

		t.equal(ES.StringPaddingBuiltinsImpl('a', 3, '', 'START'), 'a');
		t.equal(ES.StringPaddingBuiltinsImpl('a', 3, '', 'END'), 'a');
		t.equal(ES.StringPaddingBuiltinsImpl('a', 3, '0', 'START'), '00a');
		t.equal(ES.StringPaddingBuiltinsImpl('a', 3, '0', 'END'), 'a00');
		t.equal(ES.StringPaddingBuiltinsImpl('a', 3, '012', 'START'), '01a');
		t.equal(ES.StringPaddingBuiltinsImpl('a', 3, '012', 'END'), 'a01');
		t.equal(ES.StringPaddingBuiltinsImpl('a', 7, '012', 'START'), '012012a');
		t.equal(ES.StringPaddingBuiltinsImpl('a', 7, '012', 'END'), 'a012012');
		t.equal(ES.StringPaddingBuiltinsImpl('a', 3, undefined, 'START'), '  a');
		t.equal(ES.StringPaddingBuiltinsImpl('abc', 1, undefined, 'START'), 'abc');

		t.end();
	});

	test('SystemTimeZoneIdentifier', function (t) {
		t.test('Intl supported', { skip: typeof Intl === 'undefined' }, function (st) {
			st.equal(
				ES.SystemTimeZoneIdentifier(),
				new Intl.DateTimeFormat().resolvedOptions().timeZone,
				'system time zone identifier is resolved from Intl.DateTimeFormat'
			);

			st.end();
		});

		t.test('Intl not supported', { skip: typeof Intl !== 'undefined' }, function (st) {
			st.equal(
				ES.SystemTimeZoneIdentifier(),
				'UTC',
				'system time zone identifier is UTC'
			);

			st.end();
		});

		t.end();
	});

	test('ThisBigIntValue', function (t) {
		test('actual BigInts', { skip: !hasBigInts }, function (st) {
			st.equal(ES.ThisBigIntValue(BigInt(42)), BigInt(42));
			st.equal(ES.ThisBigIntValue(Object(BigInt(42))), BigInt(42));

			st.end();
		});

		forEach(v.nonBigInts, function (nonBigInt) {
			t['throws'](
				function () { ES.ThisBigIntValue(nonBigInt); },
				hasBigInts ? TypeError : SyntaxError,
				debug(nonBigInt) + ' is not a BigInt'
			);
		});

		t.end();
	});

	test('ThisBooleanValue', function (t) {
		forEach(v.nonBooleans, function (nonBoolean) {
			t['throws'](
				function () { ES.ThisBooleanValue(nonBoolean); },
				TypeError,
				debug(nonBoolean) + ' is not a Boolean'
			);
		});

		forEach(v.booleans, function (boolean) {
			t.equal(ES.ThisBooleanValue(boolean), boolean, debug(boolean) + ' is its own ThisBooleanValue');
			var obj = Object(boolean);
			t.equal(ES.ThisBooleanValue(obj), boolean, debug(obj) + ' is the boxed ThisBooleanValue');
		});

		t.end();
	});

	test('ThisNumberValue', function (t) {
		forEach(v.nonNumbers, function (nonNumber) {
			t['throws'](
				function () { ES.ThisNumberValue(nonNumber); },
				TypeError,
				debug(nonNumber) + ' is not a Number'
			);
		});

		forEach(v.numbers, function (number) {
			t.equal(ES.ThisNumberValue(number), number, debug(number) + ' is its own ThisNumberValue');
			var obj = Object(number);
			t.equal(ES.ThisNumberValue(obj), number, debug(obj) + ' is the boxed ThisNumberValue');
		});

		t.end();
	});

	test('ThisStringValue', function (t) {
		forEach(v.nonStrings, function (nonString) {
			t['throws'](
				function () { ES.ThisStringValue(nonString); },
				TypeError,
				debug(nonString) + ' is not a String'
			);
		});

		forEach(v.strings, function (string) {
			t.equal(ES.ThisStringValue(string), string, debug(string) + ' is its own ThisStringValue');
			var obj = Object(string);
			t.equal(ES.ThisStringValue(obj), string, debug(obj) + ' is the boxed ThisStringValue');
		});

		t.end();
	});

	test('ThisSymbolValue', function (t) {
		forEach(v.nonSymbolPrimitives.concat(v.objects), function (nonSymbol) {
			t['throws'](
				function () { ES.ThisSymbolValue(nonSymbol); },
				v.hasSymbols ? TypeError : SyntaxError,
				debug(nonSymbol) + ' is not a Symbol'
			);
		});

		t.test('no native Symbols', { skip: v.hasSymbols }, function (st) {
			forEach(v.objects.concat(v.primitives), function (value) {
				st['throws'](
					function () { ES.ThisSymbolValue(value); },
					SyntaxError,
					'Symbols are not supported'
				);
			});
			st.end();
		});

		t.test('symbol values', { skip: !v.hasSymbols }, function (st) {
			forEach(v.symbols, function (symbol) {
				st.equal(ES.ThisSymbolValue(symbol), symbol, 'Symbol value of ' + debug(symbol) + ' is same symbol');

				st.equal(
					ES.ThisSymbolValue(Object(symbol)),
					symbol,
					'Symbol value of ' + debug(Object(symbol)) + ' is ' + debug(symbol)
				);
			});

			st.end();
		});

		t.end();
	});

	test('TypedArrayByteLength', function (t) {
		forEach(v.primitives.concat(v.objects, [[]]), function (nonTAWBWR) {
			t['throws'](
				function () { ES.TypedArrayByteLength(nonTAWBWR); },
				TypeError,
				debug(nonTAWBWR) + ' is not a Typed Array With Buffer Witness Record'
			);
		});

		t.test('actual typed arrays', { skip: availableTypedArrays.length === 0 }, function (st) {
			forEach(availableTypedArrays, function (TypedArray) {
				st.test('Typed Array: ' + TypedArray, function (tat) {
					var TA = global[TypedArray];
					var ta = new TA(8);
					var record = ES.MakeTypedArrayWithBufferWitnessRecord(ta, 'UNORDERED');

					var elementSize = elementSizes['$' + TypedArray];

					tat.equal(ES.TypedArrayByteLength(record), 8 * elementSize, 'fixed length array, returns byteLength');

					var zta = new TA(0);

					var zRecord = ES.MakeTypedArrayWithBufferWitnessRecord(zta, 'UNORDERED');

					tat.equal(ES.TypedArrayByteLength(zRecord), 0, 'fixed zero length array, returns zero');

					tat.test('can detach', { skip: !canDetach }, function (s2t) {
						ES.DetachArrayBuffer(ta.buffer);

						record = ES.MakeTypedArrayWithBufferWitnessRecord(ta, 'UNORDERED');

						s2t.equal(ES.TypedArrayByteLength(record), 0, 'detached returns zero');

						s2t.end();
					});

					// TODO: actual TA byteLength auto, but not fixed length? (may not be possible)

					tat.test('non-fixed length, return length * elementSize', { todo: 'blocked on native resizable ABs/growable SABs' });

					tat.test('non-fixed length, detached throws', { todo: 'blocked on native resizable ABs/growable SABs' });
				});
			});
		});

		t.end();
	});

	test('TypedArrayCreateFromConstructor', function (t) {
		forEach(v.nonFunctions, function (nonFunction) {
			t['throws'](
				function () { ES.TypedArrayCreateFromConstructor(nonFunction, []); },
				TypeError,
				debug(nonFunction) + ' is not a constructor'
			);
		});

		forEach(v.nonArrays, function (nonArray) {
			t['throws'](
				function () { ES.TypedArrayCreateFromConstructor(Array, nonArray); },
				TypeError,
				debug(nonArray) + ' is not an Array'
			);
		});

		t.test('no Typed Array support', { skip: availableTypedArrays.length > 0 }, function (st) {
			st['throws'](
				function () { ES.TypedArrayCreateFromConstructor(Array, []); },
				SyntaxError,
				'no Typed Array support'
			);

			st.end();
		});

		t.test('Typed Array support', { skip: availableTypedArrays.length === 0 }, function (st) {
			var expectedLengths = {
				__proto__: null,
				$Int8Array: 632,
				$Uint8Array: 632,
				$Uint8ClampedArray: 632,
				$Int16Array: 316,
				$Uint16Array: 316,
				$Int32Array: 158,
				$Uint32Array: 158,
				$Float32Array: 158,
				$BigInt64Array: 79,
				$BigUint64Array: 79,
				$Float64Array: 79
			};
			forEach(availableTypedArrays, function (TypedArray) {
				var Constructor = global[TypedArray];

				var typedArray = ES.TypedArrayCreateFromConstructor(Constructor, []);
				st.equal(whichTypedArray(typedArray), TypedArray, 'created a ' + TypedArray);
				st.equal(typedArray.byteOffset, 0, 'byteOffset is 0');
				st.equal(typedArrayLength(typedArray), 0, 'created a ' + TypedArray + ' of length 42');

				var taLength = ES.TypedArrayCreateFromConstructor(Constructor, [42]);
				st.equal(whichTypedArray(taLength), TypedArray, 'created a ' + TypedArray);
				st.equal(taLength.byteOffset, 0, 'byteOffset is 0');
				st.equal(typedArrayLength(taLength), 42, 'created a ' + TypedArray + ' of length 42');

				var buffer = new ArrayBuffer(640);

				var taBuffer = ES.TypedArrayCreateFromConstructor(Constructor, [buffer, 8]);
				st.equal(whichTypedArray(taBuffer), TypedArray, 'created a ' + TypedArray);
				st.equal(taBuffer.byteOffset, 8, 'byteOffset is 8');
				st.equal(
					typedArrayLength(taBuffer),
					expectedLengths['$' + TypedArray],
					'created a ' + TypedArray + ' of length ' + expectedLengths['$' + TypedArray]
				);

				var taBufferLength = ES.TypedArrayCreateFromConstructor(Constructor, [buffer, 8, 64]);
				st.equal(whichTypedArray(taBufferLength), TypedArray, 'created a ' + TypedArray);
				st.equal(taBufferLength.byteOffset, 8, 'byteOffset is 8');
				st.equal(typedArrayLength(taBufferLength), 64, 'created a ' + TypedArray + ' of length 64');
			});

			st.end();
		});

		t.end();
	});

	test('TypedArrayElementType', function (t) {
		forEach(v.primitives.concat(v.objects), function (nonTA) {
			t['throws'](
				function () { ES.TypedArrayElementType(nonTA); },
				TypeError,
				debug(nonTA) + ' is not a TypedArray'
			);
		});

		forEach(availableTypedArrays, function (TA) {
			t.test(TA, function (st) {
				var ta = new global[TA](0);
				st.equal(
					ES.TypedArrayElementType(ta),
					TA.replace(/(?:lamped)?Array$/, '').toUpperCase(),
					debug(ta) + ' (which should be a ' + TA + ') has correct element type'
				);

				st.end();
			});
		});

		t.end();
	});

	test('TypedArrayGetElement', function (t) {
		forEach(v.primitives.concat(v.objects), function (nonTA) {
			t['throws'](
				function () { ES.TypedArrayGetElement(nonTA, 0); },
				TypeError,
				debug(nonTA) + ' is not a TypedArray'
			);
		});

		t.test('actual typed arrays', { skip: availableTypedArrays.length === 0 }, function (st) {
			var ta = new Uint8Array();

			forEach(v.nonNumbers, function (nonNumber) {
				st['throws'](
					function () { ES.TypedArrayGetElement(ta, nonNumber); },
					TypeError,
					debug(nonNumber) + ' is not a number'
				);
			});

			forEach(availableTypedArrays, function (TypedArray) {
				var isBigInt = TypedArray.slice(0, 3) === 'Big';
				var Z = isBigInt ? safeBigInt : Number;
				var TA = global[TypedArray];

				var arr = new TA([Z(1), Z(2), Z(3)]);

				st.equal(ES.TypedArrayGetElement(arr, 0), Z(1), 'index 0 is as expected');
				st.equal(ES.TypedArrayGetElement(arr, 1), Z(2), 'index 1 is as expected');
				st.equal(ES.TypedArrayGetElement(arr, 2), Z(3), 'index 2 is as expected');
				st.equal(ES.TypedArrayGetElement(arr, 3), undefined, 'index 3 is undefined as expected');
			});

			st.end();
		});

		t.end();
	});

	test('TypedArrayLength', function (t) {
		forEach(v.primitives.concat(v.objects, [[]]), function (nonTAWBWR) {
			t['throws'](
				function () { ES.TypedArrayLength(nonTAWBWR); },
				TypeError,
				debug(nonTAWBWR) + ' is not a Typed Array With Buffer Witness Record'
			);
		});

		t.test('actual typed arrays', { skip: availableTypedArrays.length === 0 }, function (st) {
			forEach(availableTypedArrays, function (type) {
				st.test('Typed Array: ' + type, function (tat) {
					var TA = global[type];
					var ta = new TA(8);
					var record = ES.MakeTypedArrayWithBufferWitnessRecord(ta, 'UNORDERED');

					tat.equal(ES.TypedArrayLength(record), 8, 'fixed length array, returns byteLength');

					tat.test('can detach', { skip: !canDetach }, function (s2t) {
						ES.DetachArrayBuffer(ta.buffer);

						record = ES.MakeTypedArrayWithBufferWitnessRecord(ta, 'UNORDERED');

						s2t['throws'](
							function () { ES.TypedArrayLength(record); },
							TypeError,
							debug(ta) + ' is a detached TypedArray'
						);

						s2t.end();
					});

					// TODO: actual TA byteLength auto, but not fixed length? (may not be possible)

					tat.test('non-fixed length, return floor((byteLength - byteOffset) / elementSize)', { todo: 'blocked on native resizable ABs/growable SABs' });

					tat.test('non-fixed length, detached throws', { todo: 'blocked on native resizable ABs/growable SABs' });
				});
			});

			st.end();
		});

		t.end();
	});

	test('ValidateAtomicAccess', function (t) {
		forEach(v.primitives.concat(v.objects, [[]]), function (nonTAWBWR) {
			t['throws'](
				function () { ES.ValidateAtomicAccess(nonTAWBWR, 0); },
				TypeError,
				debug(nonTAWBWR) + ' is not a Typed Array With Buffer Witness Record'
			);
		});

		t.test('actual typed arrays', { skip: availableTypedArrays.length === 0 }, function (st) {
			forEach(availableTypedArrays, function (TypedArray) {
				var ta = new global[TypedArray](8);
				var taRecord = ES.MakeTypedArrayWithBufferWitnessRecord(ta, 'UNORDERED');

				st.doesNotThrow(
					function () { ES.ValidateAtomicAccess(taRecord, 0); },
					debug(ta) + ' is an integer TypedArray'
				);

				st['throws'](
					function () { ES.ValidateAtomicAccess(taRecord, -1); },
					RangeError, // via ToIndex
					'a requestIndex of -1 is <= 0'
				);
				st['throws'](
					function () { ES.ValidateAtomicAccess(taRecord, 8); },
					RangeError,
					'a requestIndex === length throws'
				);
				st['throws'](
					function () { ES.ValidateAtomicAccess(taRecord, 9); },
					RangeError,
					'a requestIndex > length throws'
				);

				var elementSize = elementSizes['$' + TypedArray];

				st.equal(ES.ValidateAtomicAccess(taRecord, 0), elementSize * 0, TypedArray + ': requestIndex of 0 gives 0');
				st.equal(ES.ValidateAtomicAccess(taRecord, 1), elementSize * 1, TypedArray + ': requestIndex of 1 gives ' + (elementSize * 1));
				st.equal(ES.ValidateAtomicAccess(taRecord, 2), elementSize * 2, TypedArray + ': requestIndex of 1 gives ' + (elementSize * 2));
				st.equal(ES.ValidateAtomicAccess(taRecord, 3), elementSize * 3, TypedArray + ': requestIndex of 1 gives ' + (elementSize * 3));
				st.equal(ES.ValidateAtomicAccess(taRecord, 4), elementSize * 4, TypedArray + ': requestIndex of 1 gives ' + (elementSize * 4));
				st.equal(ES.ValidateAtomicAccess(taRecord, 5), elementSize * 5, TypedArray + ': requestIndex of 1 gives ' + (elementSize * 5));
				st.equal(ES.ValidateAtomicAccess(taRecord, 6), elementSize * 6, TypedArray + ': requestIndex of 1 gives ' + (elementSize * 6));
				st.equal(ES.ValidateAtomicAccess(taRecord, 7), elementSize * 7, TypedArray + ': requestIndex of 1 gives ' + (elementSize * 7));
			});

			st.end();
		});

		t.end();
	});

	test('ValidateAtomicAccessOnIntegerTypedArray', function (t) {
		forEach(v.primitives.concat(v.objects, [[]]), function (nonTA) {
			t['throws'](
				function () { ES.ValidateAtomicAccessOnIntegerTypedArray(nonTA, 0); },
				TypeError,
				debug(nonTA) + ' is not a TypedArray'
			);
		});

		t.test('actual typed arrays', { skip: availableTypedArrays.length === 0 }, function (st) {
			forEach(availableTypedArrays, function (TypedArray) {
				var ta = new global[TypedArray](8);

				var shouldThrow = TypedArray.indexOf('Clamped') > -1 || !(/Int|Uint/).test(TypedArray);
				var isWaitable = TypedArray === 'Int32Array' || TypedArray === 'BigInt64Array';

				if (shouldThrow) {
					st['throws'](
						function () { ES.ValidateAtomicAccessOnIntegerTypedArray(ta, 0); },
						debug(ta) + ' is not an integer Typed Array'
					);
				} else {
					st.doesNotThrow(
						function () { ES.ValidateAtomicAccessOnIntegerTypedArray(ta, 0); },
						debug(ta) + ' is an integer Typed Array'
					);

					st['throws'](
						function () { ES.ValidateAtomicAccessOnIntegerTypedArray(ta, -1); },
						RangeError, // via ToIndex
						'a requestIndex of -1 is <= 0'
					);
					st['throws'](
						function () { ES.ValidateAtomicAccessOnIntegerTypedArray(ta, 8); },
						RangeError,
						'a requestIndex === length throws'
					);
					st['throws'](
						function () { ES.ValidateAtomicAccessOnIntegerTypedArray(ta, 9); },
						RangeError,
						'a requestIndex > length throws'
					);

					var elementSize = elementSizes['$' + TypedArray];

					st.equal(ES.ValidateAtomicAccessOnIntegerTypedArray(ta, 0), elementSize * 0, TypedArray + ': requestIndex of 0 gives 0');
					st.equal(ES.ValidateAtomicAccessOnIntegerTypedArray(ta, 1), elementSize * 1, TypedArray + ': requestIndex of 1 gives ' + (elementSize * 1));
					st.equal(ES.ValidateAtomicAccessOnIntegerTypedArray(ta, 2), elementSize * 2, TypedArray + ': requestIndex of 1 gives ' + (elementSize * 2));
					st.equal(ES.ValidateAtomicAccessOnIntegerTypedArray(ta, 3), elementSize * 3, TypedArray + ': requestIndex of 1 gives ' + (elementSize * 3));
					st.equal(ES.ValidateAtomicAccessOnIntegerTypedArray(ta, 4), elementSize * 4, TypedArray + ': requestIndex of 1 gives ' + (elementSize * 4));
					st.equal(ES.ValidateAtomicAccessOnIntegerTypedArray(ta, 5), elementSize * 5, TypedArray + ': requestIndex of 1 gives ' + (elementSize * 5));
					st.equal(ES.ValidateAtomicAccessOnIntegerTypedArray(ta, 6), elementSize * 6, TypedArray + ': requestIndex of 1 gives ' + (elementSize * 6));
					st.equal(ES.ValidateAtomicAccessOnIntegerTypedArray(ta, 7), elementSize * 7, TypedArray + ': requestIndex of 1 gives ' + (elementSize * 7));

					forEach(v.nonBooleans, function (nonBoolean) {
						st['throws'](
							function () { ES.ValidateAtomicAccessOnIntegerTypedArray(ta, 0, nonBoolean); },
							TypeError,
							debug(nonBoolean) + ' is not a Boolean'
						);
					});

					if (isWaitable) {
						st.doesNotThrow(
							function () { ES.ValidateAtomicAccessOnIntegerTypedArray(ta, 0, true); },
							debug(ta) + ' is a waitable integer Typed Array'
						);
					} else {
						st['throws'](
							function () { ES.ValidateAtomicAccessOnIntegerTypedArray(ta, 0, true); },
							TypeError,
							debug(ta) + ' is not a waitable integer Typed Array'
						);
					}
				}
			});

			st.end();
		});

		t.end();
	});

	test('ValidateIntegerTypedArray', function (t) {
		forEach(v.nonBooleans, function (nonBoolean) {
			t['throws'](
				function () { ES.ValidateIntegerTypedArray(null, nonBoolean); },
				TypeError,
				debug(nonBoolean) + ' is not a Boolean'
			);
		});

		forEach(v.primitives.concat(v.objects, [[]]), function (nonTA) {
			t['throws'](
				function () { ES.ValidateIntegerTypedArray(nonTA, false); },
				TypeError,
				debug(nonTA) + ' is not a TypedArray'
			);
		});

		t.test('actual typed arrays', { skip: availableTypedArrays.length === 0 }, function (st) {
			forEach(availableTypedArrays, function (TypedArray) {
				var ta = new global[TypedArray](0);
				var shouldThrow = TypedArray.indexOf('Clamped') > -1 || !(/Int|Uint/).test(TypedArray);
				if (shouldThrow) {
					st['throws'](
						function () { ES.ValidateIntegerTypedArray(ta, false); },
						TypeError,
						debug(ta) + ' is not an integer TypedArray'
					);
				} else {
					st.doesNotThrow(
						function () { ES.ValidateIntegerTypedArray(ta, false); },
						debug(ta) + ' is an integer TypedArray'
					);
				}

				var isWaitable = TypedArray === 'Int32Array' || TypedArray === 'BigInt64Array';
				if (isWaitable) {
					st.doesNotThrow(
						function () { ES.ValidateIntegerTypedArray(ta, true); },
						debug(ta) + ' is a waitable integer TypedArray'
					);
				} else {
					st['throws'](
						function () { ES.ValidateIntegerTypedArray(ta, true); },
						TypeError,
						debug(ta) + ' is not a waitable integer TypedArray'
					);
				}
			});

			st.end();
		});

		t.end();
	});

	test('ValidateTypedArray', function (t) {
		var order = 'UNORDERED';

		forEach(v.primitives.concat(v.objects, [[]]), function (nonTA) {
			t['throws'](
				function () { ES.ValidateTypedArray(nonTA, order); },
				TypeError,
				debug(nonTA) + ' is not a TypedArray'
			);
		});

		t.test('actual typed arrays', { skip: availableTypedArrays.length === 0 }, function (st) {
			forEach(availableTypedArrays, function (TypedArray) {
				var ta = new global[TypedArray](0);
				st.doesNotThrow(
					function () { ES.ValidateTypedArray(ta, order); },
					debug(ta) + ' is a TypedArray'
				);

				st.test('can detach', { skip: !canDetach }, function (s2t) {
					ES.DetachArrayBuffer(ta.buffer);

					s2t['throws'](
						function () { ES.ValidateTypedArray(ta, order); },
						TypeError,
						debug(ta) + ' is a detached TypedArray'
					);

					s2t.end();
				});
			});

			st.end();
		});

		t.end();
	});
};

module.exports = {
	es5: es5,
	es2015: es2015,
	es2016: es2016,
	es2017: es2017,
	es2018: es2018,
	es2019: es2019,
	es2020: es2020,
	es2021: es2021,
	es2022: es2022,
	es2023: es2023,
	es2024: es2024
};

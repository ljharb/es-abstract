'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var gOPD = require('gopd');

module.exports = function (t, year, OrdinaryDefineOwnProperty, extras) {
	t.ok(year >= 2015, 'ES2015+');

	var CompletePropertyDescriptor = extras.getAO('CompletePropertyDescriptor');
	var FromPropertyDescriptor = extras.getAO('FromPropertyDescriptor');

	forEach(v.primitives, function (primitive) {
		t['throws'](
			function () { OrdinaryDefineOwnProperty(primitive, {}, []); },
			TypeError,
			'O: ' + debug(primitive) + ' is not an Object'
		);
	});
	forEach(v.nonPropertyKeys, function (nonPropertyKey) {
		t['throws'](
			function () { OrdinaryDefineOwnProperty({}, nonPropertyKey, v.genericDescriptor()); },
			TypeError,
			'P: ' + debug(nonPropertyKey) + ' is not a Property Key'
		);
	});
	forEach(v.primitives, function (primitive) {
		t['throws'](
			function () { OrdinaryDefineOwnProperty({}, '', primitive); },
			TypeError,
			'Desc: ' + debug(primitive) + ' is not a Property Descriptor'
		);
	});

	var O = {};
	var P = 'property key';
	var Desc = v.accessorDescriptor();
	t.equal(
		OrdinaryDefineOwnProperty(O, P, Desc),
		true,
		'operation is successful'
	);
	t.deepEqual(
		gOPD(O, P),
		FromPropertyDescriptor(CompletePropertyDescriptor(Desc)),
		'expected property descriptor is defined'
	);
};

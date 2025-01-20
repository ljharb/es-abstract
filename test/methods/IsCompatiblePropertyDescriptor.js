'use strict';

var v = require('es-value-fixtures');

module.exports = function (t, year, IsCompatiblePropertyDescriptor, extras) {
	t.ok(year >= 2015, 'ES2015+');

	var CompletePropertyDescriptor = extras.getAO('CompletePropertyDescriptor');

	t.equal(
		IsCompatiblePropertyDescriptor(
			true,
			v.descriptors.configurable(),
			CompletePropertyDescriptor(v.descriptors.nonConfigurable())
		),
		false
	);
	t.equal(
		IsCompatiblePropertyDescriptor(
			false,
			v.descriptors.configurable(),
			CompletePropertyDescriptor(v.descriptors.nonConfigurable())
		),
		false
	);

	t.equal(
		IsCompatiblePropertyDescriptor(
			true,
			v.descriptors.nonConfigurable(),
			CompletePropertyDescriptor(v.descriptors.configurable())
		),
		true
	);

	t.equal(
		IsCompatiblePropertyDescriptor(
			false,
			v.descriptors.nonConfigurable(),
			CompletePropertyDescriptor(v.descriptors.configurable())
		),
		true
	);
};

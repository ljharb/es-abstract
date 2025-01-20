'use strict';

var $defineProperty = require('es-define-property');
var mockProperty = require('mock-property');

module.exports = function (t, year, GetV) {
	t.ok(year >= 2015, 'ES2015+');

	t['throws'](
		function () { return GetV({ 7: 7 }, 7); },
		TypeError,
		'Throws a TypeError if `P` is not a property key'
	);

	var obj = { a: function () {} };
	t.equal(GetV(obj, 'a'), obj.a, 'returns property if it exists');
	t.equal(GetV(obj, 'b'), undefined, 'returns undefiend if property does not exist');

	t.test('getter observability of the receiver', { skip: !$defineProperty || !Object.isExtensible(Number.prototype) }, function (st) {
		var receivers = [];

		st.teardown(mockProperty(Number.prototype, 'foo', {
			get: function () {
				receivers.push(this);
			}
		}));

		GetV(42, 'foo');
		GetV(Object(42), 'foo');

		st.deepEqual(receivers, [42, Object(42)]);

		st.end();
	});
};

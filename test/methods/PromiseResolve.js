'use strict';

module.exports = function (t, year, PromiseResolve) {
	t.ok(year >= 2018, 'ES2018+');

	t.test('Promises unsupported', { skip: typeof Promise === 'function' }, function (st) {
		st['throws'](
			function () { PromiseResolve(); },
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

		PromiseResolve(Promise, fulfilled).then(function (x) {
			st.equal(x, a, 'fulfilled promise resolves to fulfilled');
		});

		PromiseResolve(Promise, rejected)['catch'](function (e) {
			st.equal(e, b, 'rejected promise resolves to rejected');
		});
	});
};

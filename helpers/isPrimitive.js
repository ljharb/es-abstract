module.exports = function isPrimitive(value) {
	return value === null || typeof value !== 'object';
};

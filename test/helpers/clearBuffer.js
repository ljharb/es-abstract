'use strict';

/** @type {(buffer: ArrayBuffer) => void} */
module.exports = function clearBuffer(buffer) {
	new DataView(buffer).setFloat64(0, 0, true); // clear the buffer
};

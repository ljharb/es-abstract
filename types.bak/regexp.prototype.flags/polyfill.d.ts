import flags = require('./implementation');

/** Gets the optimal implementation to use */
declare function getPolyfill(): typeof flags;
export = getPolyfill;

import flags = require('./implementation');

declare function shimRegExpPrototypeFlags(): typeof flags;
export = shimRegExpPrototypeFlags;

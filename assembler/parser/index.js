const A = require('arcsecond');
const instructionParser = require('./instructions');
const {label} = require('./common');

module.exports = A.many(A.choice([
        instructionParser,
        label,
    ]));


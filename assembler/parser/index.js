const A = require('arcsecond');
const instructionParser = require('./instructions');
const {label} = require('./common');
const {data16,data8} = require('./data');
const constantParser = require('./constant');

module.exports = A.many(A.choice([
        instructionParser,
        label,
        data16,
        data8,
        constantParser,
    ]));


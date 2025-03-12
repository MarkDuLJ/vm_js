const A = require('arcsecond');
const instructionParser = require('./instructions');

module.exports = A.many(instructionParser);


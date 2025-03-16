const A = require('arcsecond');
const {validIdentifier, hexLiteral} = require('./common');
const T = require('./types');

const constantParser = A.coroutine(run => {
    const isExport = Boolean(run(A.possibly(A.char('+'))));
    run(A.str('constant'));
    run(A.whitespace);
    const name = run(validIdentifier);
    run(A.whitespace);
    run(A.char('='));
    run(A.whitespace);
    const value = run(hexLiteral);
    run(A.optionalWhitespace);

    return T.constant({
        isExport,
        name,
        value,
    });
    
});

module.exports = constantParser;

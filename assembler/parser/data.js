const A = require('arcsecond');
const {
  validIdentifier,
  hexLiteral
} = require('./common');
const t = require('./types');

const optionalWhitespaceSurrounded = A.between(A.optionalWhitespace)(A.optionalWhitespace);
const commaSeparated = A.sepBy(optionalWhitespaceSurrounded(A.char(',')));

const dataParser = size => A.coroutine((run) => {
  const isExport = Boolean(run( A.possibly(A.char('+'))));
   run(A.str(`data${size}`));

   run(A.whitespace);
  const name =  run(validIdentifier);
   run(A.whitespace);
   run(A.char('='));
   run(A.whitespace);
   run(A.char('{'));
   run(A.whitespace);

  const values =  run(commaSeparated(hexLiteral));

   run(A.whitespace);
   run(A.char('}'));
   run(A.optionalWhitespace);

  return t.data({
    size,
    isExport,
    name,
    values
  });
});

module.exports = {
  data8: dataParser(8),
  data16: dataParser(16),
};
const A = require('arcsecond');
const { inspect } = require('util');

const deepLog = x => console.log(inspect(x, {
    depth: Infinity,
    colors: true
  }));

const asType = type => value => ({ type, value });
const mapJoin = parser => parser.map(items => items.join(''));
const peek = A.lookAhead(A.regex(/^./));

const hexDigit = A.regex(/^[0-9A-Fa-f]/);
const hexLiteral = A.char('$')
.chain(() => A.many1(hexDigit).map(chars => chars.join('')))
.map(asType('HEX_LITERAL'));

const upperOrLowerStr = s => A.choice([
  A.str(s.toUpperCase()),
  A.str(s.toLowerCase())
]);

const register =  A.choice([
    upperOrLowerStr('r1'),
    upperOrLowerStr('r2'),
    upperOrLowerStr('r3'),
    upperOrLowerStr('r4'),
    upperOrLowerStr('r5'),
    upperOrLowerStr('r6'),
    upperOrLowerStr('r7'),
    upperOrLowerStr('r8'),
    upperOrLowerStr('sp'),
    upperOrLowerStr('fp'),
    upperOrLowerStr('ip'),
    upperOrLowerStr('acc'),
]).map(asType('REGISTER'));

const movLitToReg = A.coroutine(run => {
    const command = run(upperOrLowerStr('mov'));
    console.log("command",command);
    
    run(A.whitespace);
  
    const arg1 = run (A.choice([
      hexLiteral,
      // squareBracketExpr,
    ]));
  
    run(A.optionalWhitespace);
    run(A.char(','));
    run(A.optionalWhitespace);
  
    const arg2 = run(register);
    console.log("ARG:", arg2);
    
    run(A.optionalWhitespace);
  
    return asType('INSTRUCTION') ({
      instruction: 'MOV_LIT_REG',
      args: [arg1, arg2]
    });

   
  });
  
  const res = movLitToReg.run('mov $42, r4');
  deepLog(res);



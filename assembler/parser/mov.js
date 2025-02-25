
const {upperOrLowerStr, hexLiteral, register, address} = require('./common');
const {squareBracketExpr} = require('./expressions');


const movLitToReg = A.coroutine(run => {
    const command = run(upperOrLowerStr('mov'));
    
    run(A.whitespace);
  
    const arg1 = run(A.choice([
      hexLiteral,
      squareBracketExpr,
    ]));
  
    run(A.optionalWhitespace);
    run(A.char(','));
    run(A.optionalWhitespace);
  
    const arg2 = run(register);
    
    run(A.optionalWhitespace);
  
    return T.instruction({
      instruction: 'MOV_LIT_REG',
      args: [arg1, arg2]
    }); 
  });

const movRegToMem = A.coroutine(run => {
    const command = run(upperOrLowerStr('mov'));
    
    run(A.whitespace);
  
    const r1 = run(register);
  
    run(A.optionalWhitespace);
    run(A.char(','));
    run(A.optionalWhitespace);
  
    const addr = run(A.choice([
        address,
        A.char('&').chain(() =>squareBracketExpr),
      ]));
    
    run(A.optionalWhitespace);
  
    return T.instruction({
      instruction: 'MOV_REG_MEM',
      args: [r1, addr]
    }); 
  });


const A = require('arcsecond');
const {upperOrLowerStr, hexLiteral, register, address} = require('./common');
const {squareBracketExpr} = require('./expressions');
const T = require('./types');


const litReg = (mnemonic, type) => A.coroutine(run => {
    const command = run(upperOrLowerStr(mnemonic));
    
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
      instruction: type,
      args: [arg1, arg2]
    }); 
  });

const regReg = (mnemonic, type) => A.coroutine(run => {
    run(upperOrLowerStr(mnemonic));
    
    run(A.whitespace);
  
    const r1 = run(register);
  
    run(A.optionalWhitespace);
    run(A.char(','));
    run(A.optionalWhitespace);
  
    const r2 = run(register);
    
    run(A.optionalWhitespace);
  
    return T.instruction({
      instruction: type,
      args: [r1, r2]
    }); 
  });

const regMem = (mnemonic, type) => A.coroutine(run => {
    run(upperOrLowerStr(mnemonic));
    
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
      instruction: type,
      args: [r1, addr]
    }); 
  });

const memReg = (mnemonic, type) => A.coroutine(run => {
    run(upperOrLowerStr(mnemonic));
    
    run(A.whitespace);
    
    const addr = run(A.choice([
        address,
        A.char('&').chain(() =>squareBracketExpr),
    ]));
    
    run(A.optionalWhitespace);
    run(A.char(','));
    run(A.optionalWhitespace);
    
    const r1 = run(register);
    
    run(A.optionalWhitespace);
  
    return T.instruction({
      instruction: type,
      args: [addr, r1]
    }); 
  });

  const litMem = (mnemonic, type) => A.coroutine(run => {
    run(upperOrLowerStr(mnemonic));
    
    run(A.whitespace);
  
    const lit = run(A.choice([
        hexLiteral,
        squareBracketExpr,
    ]));
  
    run(A.optionalWhitespace);
    run(A.char(','));
    run(A.optionalWhitespace);
  
    const addr = run(A.choice([
        address,
        A.char('&').chain(() =>squareBracketExpr),
      ]));
    
    run(A.optionalWhitespace);
  
    return T.instruction({
      instruction: type,
      args: [lit, addr]
    }); 
  });


  const regPtrReg = (mnemonic, type) => A.coroutine(run => {
    run(upperOrLowerStr(mnemonic));
    run(A.whitespace);

    const r1 = run(A.char('&').chain(()=>register));

    run(A.optionalWhitespace);
    run(A.char(','));
    run(A.optionalWhitespace);

    const r2 = run(register);

    run(A.optionalWhitespace);

    return T.instruction({
        instruction: type,
        args: [r1, r2],
    })
  });

  const litOffReg = (mnemonic, type) => A.coroutine(run => {
    run(upperOrLowerStr(mnemonic));
    run(A.whitespace);

    const lit = run(A.choice([
        hexLiteral,
        squareBracketExpr,
    ]));

    run(A.optionalWhitespace);
    run(A.char(','));
    run(A.optionalWhitespace);

    const r1 = run(A.char('&').chain(()=>register));

    run(A.optionalWhitespace);
    run(A.char(','));
    run(A.optionalWhitespace);

    const r2 = run(register);

    run(A.optionalWhitespace);

    return T.instruction({
        instruction: type,
        args: [lit, r1, r2],
    })
  });


const noArgs = (mnemonic, type) => A.coroutine(run => {
    const command = run(upperOrLowerStr(mnemonic));
 
    run(A.optionalWhitespace);
  
    return T.instruction({
      instruction: type,
      args: []
    }); 
  });


const singleReg = (mnemonic, type) => A.coroutine(run => {
    const command = run(upperOrLowerStr(mnemonic));
    
    run(A.whitespace);
  
    const r1 = run(register);
    
    run(A.optionalWhitespace);
  
    return T.instruction({
      instruction: type,
      args: [r1]
    }); 
  });


const singleLit = (mnemonic, type) => A.coroutine(run => {
    const command = run(upperOrLowerStr(mnemonic));
    
    run(A.whitespace);
  
    const lit = run(A.choice([
      hexLiteral,
      squareBracketExpr,
    ]));
  
    return T.instruction({
      instruction: type,
      args: [lit]
    }); 
  });

module.exports = {
  litReg,
  regReg,
  regMem,
  memReg,
  litMem,
  regPtrReg,
  litOffReg,
  noArgs,
  singleReg,
  singleLit,
}
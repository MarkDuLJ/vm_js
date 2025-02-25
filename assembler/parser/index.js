const { inspect } = require('util');
const A = require('arcsecond');


const deepLog = x => console.log(inspect(x, {
    depth: Infinity,
    colors: true
  }));

  const T = require('./types');

  // const res = movLitToReg.run('mov $42, r4');
  const res = movLitToReg.run('mov [$42 + !var - ($05 * ($44 + !foo) - $08)], r4');
  deepLog(res);


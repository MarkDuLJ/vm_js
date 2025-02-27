const { inspect } = require('util');
const instructionParser = require('./instructions');

const deepLog = x => console.log(inspect(x, {
    depth: Infinity,
    colors: true
  }));

  // const res = instructionParser.run('jgt r2, &ffff');
  const res = instructionParser.run('hlt');
  // const res = instructionParser.run('mov [$42 + !var - ($05 * ($44 + !foo) - $08)], r4');
  deepLog(res);


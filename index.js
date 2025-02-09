const {createMemory} = require('./create_mem');
const {MOVE_TO_R1, MOVE_TO_R2, ADD_REG_REG} = require('./instructions');
const CPU = require('./cpu');

const memory = createMemory(256);
const writableBytes = new Uint8Array(memory.buffer);

writableBytes[0] = MOVE_TO_R1;
writableBytes[1] = 0x12; //ox1234
writableBytes[2] = 0x34;

writableBytes[3] = MOVE_TO_R2;
writableBytes[4] = 0xAB; //oxABCD
writableBytes[5] = 0xCD;

writableBytes[6] = ADD_REG_REG;
writableBytes[7] = 2; // r1 index
writableBytes[8] = 3; // r2 index

const cpu = new CPU(memory);
console.log(

    cpu.step()
);

cpu.debug();

cpu.step();
cpu.debug()
cpu.step()
cpu.debug();


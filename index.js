const {createMemory} = require('./create_mem');
const instructions = require('./instructions');
const CPU = require('./cpu');

const IP = 0;
const ACC = 1;
const R1 = 2;
const R2 = 3;

const memory = createMemory(256 * 256);
const writableBytes = new Uint8Array(memory.buffer);

let i = 0;
writableBytes[i++] = instructions.MOVE_LIT_REG;
writableBytes[i++] = 0x12; //ox1234
writableBytes[i++] = 0x34;
writableBytes[i++] = R1; //dynamic register index

writableBytes[i++] = instructions.MOVE_LIT_REG;
writableBytes[i++] = 0xAB; //oxABCD
writableBytes[i++] = 0xCD;
writableBytes[i++] = R2;

writableBytes[i++] = instructions.ADD_REG_REG;
writableBytes[i++] = R1; 
writableBytes[i++] = R2; 

writableBytes[i++] = instructions.MOVE_REG_MEM; 
writableBytes[i++] = ACC; 
writableBytes[i++] = 0x01; 
writableBytes[i++] = 0x00; //0x0100

const cpu = new CPU(memory);

cpu.debug();
cpu.peekMem(cpu.getReg('ip'));
cpu.peekMem(0x0100);

cpu.step();
cpu.debug();
cpu.peekMem(cpu.getReg('ip'));
cpu.peekMem(0x0100);

cpu.step();
cpu.debug();
cpu.peekMem(cpu.getReg('ip'));
cpu.peekMem(0x0100);

cpu.step();
cpu.debug();
cpu.peekMem(cpu.getReg('ip'));
cpu.peekMem(0x0100);

cpu.step();
cpu.debug();
cpu.peekMem(cpu.getReg('ip'));
cpu.peekMem(0x0100);


const readline = require('readline');

const {createMemory} = require('./create_mem');
const instructions = require('./instructions');
const CPU = require('./cpu');

const IP = 0;
const ACC = 1;
const R1 = 2;
const R2 = 3;
const R3 = 4;
const R4 = 5;
const R5 = 6;
const R6 = 7;
const R7 = 8;
const R8 = 9;
const SP = 10;
const FP = 11;

const memory = createMemory(256 * 256);
const writableBytes = new Uint8Array(memory.buffer);


const cpu = new CPU(memory);

let i = 0;

/** #: memory address
 * move #0x0100, r1
 * move 0x0001,  r2
 * add r1, r2
 * move acc, #0x0100
 * jne 0x0003, start:



writableBytes[i++] = instructions.MOVE_LIT_REG;
writableBytes[i++] = 0x01; 
writableBytes[i++] = 0x00;
writableBytes[i++] = R1;

writableBytes[i++] = instructions.MOVE_LIT_REG;
writableBytes[i++] = 0x00;
writableBytes[i++] = 0x01;
writableBytes[i++] = R2;

writableBytes[i++] = instructions.ADD_REG_REG;
writableBytes[i++] = R1; 
writableBytes[i++] = R2; 

writableBytes[i++] = instructions.MOVE_REG_MEM; 
writableBytes[i++] = ACC; 
writableBytes[i++] = 0x01; 
writableBytes[i++] = 0x00; //0x0100 in memory

writableBytes[i++] = instructions.JUM_NOT_EQ;
writableBytes[i++] = 0x00;
writableBytes[i++] = 0x03; //0x0003
writableBytes[i++] = 0x00;
*/

/**
 * move 0x5151, r1
 * move 0x4242, r2
 * psh r1
 * psh r2
 * pop r1
 * pop r2
 */

writableBytes[i++] = instructions.MOVE_LIT_REG;
writableBytes[i++] = 0x51;
writableBytes[i++] = 0x51;
writableBytes[i++] = R1;

writableBytes[i++] = instructions.MOVE_LIT_REG;
writableBytes[i++] = 0x42;
writableBytes[i++] = 0x42;
writableBytes[i++] = R2;

writableBytes[i++] = instructions.PSH_REG;
writableBytes[i++] = R1;

writableBytes[i++] = instructions.PSH_REG;
writableBytes[i++] = R2;

writableBytes[i++] = instructions.POP;
writableBytes[i++] = R1;

writableBytes[i++] = instructions.POP;
writableBytes[i++] = R2;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

cpu.debug();
cpu.peekMem(cpu.getReg('ip'));
cpu.peekMem(0xffff -1 -6); //try to see 8 byte after this address

rl.on('line', () => {
    cpu.step();
    cpu.debug();
    cpu.peekMem(cpu.getReg('ip'));
    cpu.peekMem(0xffff -1 -6);
})


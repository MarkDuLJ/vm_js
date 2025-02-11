const readline = require('readline');

const {createMemory} = require('./create_mem');
const instructions = require('./instructions');
const CPU = require('./cpu');

const IP = 0;
const ACC = 1;
const R1 = 2;
const R2 = 3;

const memory = createMemory(256 * 256);
const writableBytes = new Uint8Array(memory.buffer);


const cpu = new CPU(memory);

/** #: memory address
 * move #0x0100, r1
 * move 0x0001,  r2
 * add r1, r2
 * move acc, #0x0100
 * jne 0x0003, start:
 */

let i = 0;
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



const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

cpu.debug();
cpu.peekMem(cpu.getReg('ip'));
cpu.peekMem(0x0100);

rl.on('line', () => {
    cpu.step();
    cpu.debug();
    cpu.peekMem(cpu.getReg('ip'));
    cpu.peekMem(0x0100);
})


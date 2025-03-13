// const readline = require('readline');
// const createScreenDev = require('././screen_device');
// const instructions = require('./instructions');

const {createMemory} = require('./create_mem');
const CPU = require('./cpu');
const MemoryMapper = require('./mem_mapper');
const MM = new MemoryMapper();

const dataViewMethods = [
    'getUint8',
    'getUint16',
    'setUint8',
    'setUint16',
];

const createBankMem = (n, bankSize, cpu) => {
    const bankBuffers = Array.from({length: n}, () => new ArrayBuffer(bankSize));
    const banks = bankBuffers.map(ab => new DataView(ab));

    const forwardToDataView = fnName => (...args) => {
        const bankIndex = cpu.getReg('mb') % n;
        const memBankToUse = banks[bankIndex];
        return memBankToUse[fnName](...args);
    };

    const interface = dataViewMethods.reduce((dvOut, fnName) => {
        dvOut[fnName] = forwardToDataView(fnName);
        return dvOut;
    }, {});

    return interface;
};

const banksize = 0xff;
const nBanks = 8;

const cpu = new CPU(MM);

const memoryBankDevice = createBankMem(nBanks, banksize, cpu);
MM.map(memoryBankDevice, 0, banksize);

const regularMem = createMemory(0xff00);
MM.map(regularMem, banksize, 0xffff, true);

// check memory works
console.log(`Writing value to address 0`);

MM.setUint16(0,1);
console.log('read value from address: 0', MM.getUint16(0));

cpu.setReg('mb', 1);
console.log('switch to bank 1', MM.getUint16(0));
MM.setUint16(0,55);
console.log('read value from address: 1', MM.getUint16(0));
console.log('switch to bank 2 then set value....');
cpu.setReg('mb', 2);
MM.setUint16(0,66);
console.log('read value from address: 2', MM.getUint16(0));
console.log("go back to bank 1");
cpu.setReg('mb', 1);
console.log('read value from address: 1', MM.getUint16(0));
cpu.setReg('mb',0);
console.log('read value from bank: 0', MM.getUint16(0));



/**
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
MM.map(memory, 0, 0xffff); //map memory just created to mapper, no difference for now

const lcd = createScreenDev();

//map 0xff bytes of the address space to an "output" device, here is standout
MM.map(lcd, 0x3000, 0x30ff, true);

const writableBytes = new Uint8Array(memory.buffer);

const cpu = new CPU(MM);//now cpu is using mapped address


let i = 0;

const writeCharToScreen = (char, command, position) => {
writableBytes[i++] = instructions.MOVE_LIT_REG;
writableBytes[i++] = command;// control font style
writableBytes[i++] = char.charCodeAt(0);
writableBytes[i++] = R1;

writableBytes[i++] = instructions.MOVE_REG_MEM;
writableBytes[i++] = R1;
writableBytes[i++] = 0x30;
writableBytes[i++] = position;
}

writeCharToScreen(" ", 0xff, 0);

for (let index = 0; index < 0xffff; index++) {
    const command = index % 2 === 0 ? 0x01 : 0x02; //bold or regular
    writeCharToScreen('*', command, index);
}

writableBytes[i++] = instructions.HLT;

cpu.run();

 #: memory address
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
*/

/**
 * psh 0x3333
 * psh 0x2222
 * psh 0x1111
 * 
 * move 0x1234, r1
 * move 0x5678, r4
 * 
 * psh 0x0000
 * cal my_subroutine:
 * psh 0x4444
 * 
 * ;;at address 0x3000
 * my_subroutine:
 * psh 0x0102
 * psh 0x0304
 * psh 0x0506
 * 
 * move 0x0708, r1
 * move 0x090a, r8
 * ret
 */

/** 
const subroutineAddress = 0x3000;
writableBytes[i++] = instructions.PSH_LIT;
writableBytes[i++] = 0x33;
writableBytes[i++] = 0x33;

writableBytes[i++] = instructions.PSH_LIT;
writableBytes[i++] = 0x22;
writableBytes[i++] = 0x22;

writableBytes[i++] = instructions.PSH_LIT;
writableBytes[i++] = 0x11;
writableBytes[i++] = 0x11;

writableBytes[i++] = instructions.MOVE_LIT_REG;
writableBytes[i++] = 0x12;
writableBytes[i++] = 0x34;
writableBytes[i++] = R1;

writableBytes[i++] = instructions.MOVE_LIT_REG;
writableBytes[i++] = 0x56;
writableBytes[i++] = 0x78;
writableBytes[i++] = R4;

writableBytes[i++] = instructions.PSH_LIT;//even no argument, still need to push 0x0000 instead
writableBytes[i++] = 0x00;
writableBytes[i++] = 0x00;

writableBytes[i++] = instructions.CAL_LIT;
writableBytes[i++] = (subroutineAddress & 0xff00) >> 8;
writableBytes[i++] = (subroutineAddress & 0x00ff);
                
writableBytes[i++] = instructions.PSH_LIT;
writableBytes[i++] = 0x44;
writableBytes[i++] = 0x44;

//subroutine
i = subroutineAddress;
writableBytes[i++] = instructions.PSH_LIT;
writableBytes[i++] = 0x01;
writableBytes[i++] = 0x02;

writableBytes[i++] = instructions.PSH_LIT;
writableBytes[i++] = 0x03;
writableBytes[i++] = 0x04;

writableBytes[i++] = instructions.PSH_LIT;
writableBytes[i++] = 0x05;
writableBytes[i++] = 0x06;

writableBytes[i++] = instructions.MOVE_LIT_REG;
writableBytes[i++] = 0x07;
writableBytes[i++] = 0x08;
writableBytes[i++] = R1;

writableBytes[i++] = instructions.MOVE_LIT_REG;
writableBytes[i++] = 0x09;
writableBytes[i++] = 0x0a;
writableBytes[i++] = R8;

writableBytes[i++] = instructions.RET;



const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

cpu.debug();
cpu.peekMem(cpu.getReg('ip'));
cpu.peekMem(0xffff -1 -42, 44); //try to see 8 byte after this address

rl.on('line', () => {
    cpu.step();
    cpu.debug();
    cpu.peekMem(cpu.getReg('ip'));
    cpu.peekMem(0xffff -1 -42, 44);
})
*/

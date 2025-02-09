const {createMemory} = require('./create_mem');
const {ADD_REG_REG, MOVE_TO_R1, MOVE_TO_R2} = require('./instructions');

class CPU {
    constructor(memory) {
        this.memory = memory;

        this.registerNames = [ //they are all a bit of mem actually
            'ip', // instruction pointer
            'acc', //accumulator
            'r1', //below are general purpose registers
            'r2',
            'r3',
            'r4',
            'r5',
            'r6',
            'r7',
            'r8',
        ];

        //every register gets 2 bytes mem for a 16 bit vm
        this.registers = createMemory(this.registerNames.length * 2); 

        //mapping name to actual memory
        this.registerMap = this.registerNames.reduce((map, name, i) => {
            map[name] = i * 2;
            return map;
        }, {});
    }

    debug() {
        this.registerNames.forEach(name => {
            console.log(`${name}: ${this.getReg(name)}`);
            
        })
    }

    getReg(reg) {
        if(!( reg in this.registerMap)) {
            throw new Error(`GetRegister: no ${reg} in registers.`);
        }
        return this.registers.getUint16(this.registerMap[reg]);
    }

    setReg(reg, value) {
        if(!( reg in this.registerMap)) {
            throw new Error(`GetRegister: no ${reg} in registers.`);
        }
        return this.registers.setUint16(this.registerMap[reg], value);
    }

    //fetch instruction, instruction here just one byte, 
    fetch8(){
        const nextInstructionAddress = this.getReg('ip');
        const instruction = this.memory.getUint8(nextInstructionAddress);
        this.setReg('ip', nextInstructionAddress + 1);
        return instruction;
    }

    //fetch 2 bytes 
    fetch16(){
        const nextInstructionAddress = this.getReg('ip');
        const instruction = this.memory.getUint16(nextInstructionAddress);
        this.setReg('ip', nextInstructionAddress + 2);
        return instruction;
    }


    excute(instruction){
        switch (instruction) {
            //move value into r1 register, move is defined as 0x10 here
            case MOVE_TO_R1:{
                const literal = this.fetch16();
                this.setReg('r1', literal);
                return;
            }
            //move value to r2
            case MOVE_TO_R2: {
                const literal = this.fetch16();
                this.setReg('r2', literal);
                return;
            }
            //add register to register, only one byte inside
            case ADD_REG_REG: {
                const r1 = this.fetch8();
                const r2 = this.fetch8();
                const r1Val = this.registers.getUint16(r1 * 2);
                const r2Val = this.registers.getUint16(r2 * 2);
                this.setReg('acc', r1Val + r2Val);
                return;
            }
        }
    }

    step() {
        const instruction = this.fetch8();
        return this.excute(instruction);
    }
}

module.exports = CPU;
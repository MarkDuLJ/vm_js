const {createMemory} = require('./create_mem');
const instructions = require('./instructions');

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
            'sp',//stack pointer
            'fp',//frame pointer
        ];

        //every register gets 2 bytes mem for a 16 bit vm
        this.registers = createMemory(this.registerNames.length * 2); 

        //mapping name to actual memory
        this.registerMap = this.registerNames.reduce((map, name, i) => {
            map[name] = i * 2;
            return map;
        }, {});

        this.setReg('sp', memory.byteLength - 1 - 1); // for 16bit vm, move 1 to end of memory,move another one byte to get the right position
        this.setReg('fp', memory.byteLength - 1 - 1);
    }

    debug() {
        this.registerNames.forEach(name => {
            console.log(`${name}: 0x${this.getReg(name).toString(16).padStart(4,'0')}`);            
        });
        console.log();
        
    }

    //return address: value on address and other 7 bytes followed
    // 0x0f01: 0x04 0x05 0x06 0x07 0x08 0x09 0xa0 0xb0
    peekMem(address) {
        const next8Bytes = Array.from({length: 8}, (_,i) =>
            this.memory.getUint8(address + i))
            .map(v => `0x${v.toString(16).padStart(2,'0')} `);
        console.log(`0x${address.toString(16).padStart(4, '0')}: ${next8Bytes.join(' ')}`);
        
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

    push(value) {
        const spAddress = this.getReg('sp');
        this.memory.setUint16(spAddress, value);
        this.setReg('sp', spAddress - 2); //stack point point from high to low
    }

    pop(){
        const nextSpAddress = this.getReg('sp') + 2;
        this.setReg('sp', nextSpAddress);
        return this.memory.getUint16(nextSpAddress);
    }

    fetchRegIndex(){
        return (this.fetch8() % this.registerNames.length) * 2;
    }

    excute(instruction){
        switch (instruction) {
            //move value from memory ito register, like memory to r1
            case instructions.MOVE_LIT_REG:{
                const literal = this.fetch16();
                const register = this.fetchRegIndex();
                this.registers.setUint16(register, literal);
                return;
            }

            //move registr to register
            case instructions.MOVE_REG_REG: {
                const regFrom = this.fetchRegIndex();
                const regTo = this.fetchRegIndex();
                const value = this.registers.getUint16(regFrom);
                this.registers.setUint16(regTo, value);
                return;
            }

            //move register to memory
            case instructions.MOVE_REG_MEM: {
                const regFrom = this.fetchRegIndex();
                const address = this.fetch16();
                const value = this.registers.getUint16(regFrom);
                this.memory.setUint16(address,value);
                return;
            }

            //move memory to register
            case instructions.MOVE_MEM_REG: {
                const address = this.fetch16();
                const regTo = this.fetchRegIndex();
                const value = this.memory.getUint16(address);
                this.registers.setUint16(regTo,value);
                return;
            }
            //add register to register, only one byte inside
            case instructions.ADD_REG_REG: {
                const r1 = this.fetch8();
                const r2 = this.fetch8();
                const r1Val = this.registers.getUint16(r1 * 2);
                const r2Val = this.registers.getUint16(r2 * 2);
                this.setReg('acc', r1Val + r2Val);
                return;
            }

            //Branching: conditional jumping
            case instructions.JUM_NOT_EQ: {
                const value = this.fetch16();
                const address = this.fetch16();
                if( value !== this.getReg('acc')){
                    this.setReg('ip', address);
                }
                return;
            }

            //push literal
            case instructions.PSH_LIT: {
                const value = this.fetch16();
                this.push(value);
                return;
            }

            //push register
            case instructions.PSH_REG: {
                const regIndex  = this.fetchRegIndex();
                this.push(this.registers.getUint16(regIndex));
                return;
            }

            //Pop
            case instructions.POP: {
                const regIndex = this.fetchRegIndex();
                const value = this.pop();
                this.registers.setUint16(regIndex, value);
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
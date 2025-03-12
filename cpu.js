const { log } = require('console');
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

        // this.setReg('sp', memory.byteLength - 1 - 1); // for 16bit vm, move 1 to end of memory,move another one byte to get the right position
        // this.setReg('fp', memory.byteLength - 1 - 1);

        //set stack pointer & fp to a fix address temporarily
        this.setReg('sp', 0xffff - 1); // for 16bit vm, move 1 to end of memory,move another one byte to get the right position
        this.setReg('fp', 0xffff - 1);

        this.stackFrameSize = 0; //to track stack frame size, required by stack frame
    }

    debug() {
        this.registerNames.forEach(name => {
            console.log(`${name}: 0x${this.getReg(name).toString(16).padStart(4,'0')}`);            
        });
        console.log();
        
    }

    //return address: value on address and other 7 bytes followed
    // 0x0f01: 0x04 0x05 0x06 0x07 0x08 0x09 0xa0 0xb0
    peekMem(address, n = 8) {
        const nextNBytes = Array.from({length: n}, (_,i) =>
            this.memory.getUint8(address + i))
            .map(v => `0x${v.toString(16).padStart(2,'0')} `);
        console.log(`0x${address.toString(16).padStart(4, '0')}: ${nextNBytes.join(' ')}`);
        
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

        this.stackFrameSize += 2;
    }

    pop(){
        const nextSpAddress = this.getReg('sp') + 2;
        this.setReg('sp', nextSpAddress);
        this.stackFrameSize -= 2;
        return this.memory.getUint16(nextSpAddress);
    }

    pushState(){
        this.push(this.getReg('r1'));
        this.push(this.getReg('r2'));
        this.push(this.getReg('r3'));
        this.push(this.getReg('r4'));
        this.push(this.getReg('r5'));
        this.push(this.getReg('r6'));
        this.push(this.getReg('r7'));
        this.push(this.getReg('r8'));
        this.push(this.getReg('ip'));
        this.push(this.stackFrameSize + 2);

        this.setReg('fp', this.getReg('sp'));
        this.stackFrameSize = 0; // ready for new stack frame
    }

    /**
     * STACK: memory with pointers
     * stacke frame 
     * |----Address----------------------value-------------------|
     * |----0xffe6-----------------------0x0000------------------|
     * |----0xffe8-----------------------0x0002------------------|
     * |----0xffea-----------------------0x0001------------------| frame pointer, find the each data by order
     * |----0xffec-----------------------0x0014------------------| =20 in decimal, total frame size include itself
     * |----0xffee-----------------------0x8dbc------------------| instruction pointer
     * |----0xfff0-----------------------0xbcbc------------------| regester
     * |----0xfff2-----------------------0xcbf2------------------| register
     * |----0xfff4-----------------------0xbeef------------------| register
     * |----0xfff6-----------------------0x2eda------------------| register
     * |----0xfff8-----------------------0x0003------------------| argument number
     * |----0xfffa-----------------------0x0003------------------| push
     * |----0xfffc-----------------------0x0002------------------| push
     * |----0xfffe-----------------------0x0001------------------| <--  stack pointer push 
     */


    popState(){
        const framePointerAddress = this.getReg('fp');
        this.setReg('sp', framePointerAddress); //point stack pointer to new subroutine, out of scope

        
        this.stackFrameSize = this.pop();
        const stackFrameSize = this.stackFrameSize; // for reuse, frame pointer address needs
        
        //inverse the order because of pop
        this.setReg('ip',this.pop());
        this.setReg('r8',this.pop());
        this.setReg('r7',this.pop());
        this.setReg('r6',this.pop());
        this.setReg('r5',this.pop());
        this.setReg('r4',this.pop());
        this.setReg('r3',this.pop());
        this.setReg('r2',this.pop());
        this.setReg('r1',this.pop());
        // this.pop(this.stackFrameSize + 2);

        const nArgs = this.pop(); // get dynamic arguments
        for( let i = 0; i < nArgs; i++){
            this.pop();
        }

        this.setReg('fp', framePointerAddress + stackFrameSize);
    }

    fetchRegIndex(){
        return (this.fetch8() % this.registerNames.length) * 2;
    }

    excute(instruction){
        switch (instruction) {
            //move value from memory ito register, like memory to r1
            case instructions.MOVE_LIT_REG.opcode:{
                const literal = this.fetch16();
                const register = this.fetchRegIndex();
                this.registers.setUint16(register, literal);
                return;
            }

            //move registr to register
            case instructions.MOVE_REG_REG.opcode: {
                const regFrom = this.fetchRegIndex();
                const regTo = this.fetchRegIndex();
                const value = this.registers.getUint16(regFrom);
                this.registers.setUint16(regTo, value);
                return;
            }

            //move register to memory
            case instructions.MOVE_REG_MEM.opcode: {
                const regFrom = this.fetchRegIndex();
                const address = this.fetch16();
                const value = this.registers.getUint16(regFrom);
                this.memory.setUint16(address,value);
                return;
            }

            //move memory to register
            case instructions.MOVE_MEM_REG.opcode: {
                const address = this.fetch16();
                const regTo = this.fetchRegIndex();
                const value = this.memory.getUint16(address);
                this.registers.setUint16(regTo,value);
                return;
            }

            //move literal to memory 
            case instructions.MOVE_LIT_MEM.opcode: {
                const value = this.fetch16();
                const address = this.fetch16();
                this.memory.setUint16(address, value);
                return;
            }

            //move register* to register 
            case instructions.MOVE_REG_PTR_REG.opcode: {
                const regFrom = this.fetchRegIndex();
                const regTo = this.fetchRegIndex();
                const ptr = this.registers.getUint16(regFrom);// get the pointer from register
                const value = this.memory.getUint16(ptr); // get the value from pointer
                this.registers.setUint16(regTo, value);
                return;
            }

            //move value at [literal + register] to register 
            case instructions.MOVE_LIT_OFF_REG.opcode: {
                const baseAddress = this.fetch16();
                const reg = this.fetchRegIndex();
                const regTo = this.fetchRegIndex();
                const offset = this.registers.getUint16(reg);

                const value = this.memory.getUint16(baseAddress + offset);
                this.registers.setUint16(regTo, value);
                return;
            }

            //add register to register, only one byte inside
            case instructions.ADD_REG_REG.opcode: {
                const r1 = this.fetch8();
                const r2 = this.fetch8();
                const r1Val = this.registers.getUint16(r1);
                const r2Val = this.registers.getUint16(r2);
                this.setReg('acc', r1Val + r2Val);
                return;
            }

            //add literal to register
            case instructions.ADD_LIT_REG.opcode: {
                const literal = this.fetch16();
                const reg = this.fetchRegIndex();
                const regVal = this.registers.getUint16(reg);
                this.setReg('acc', literal + regVal);
                return;
            }

            //subtract literal from register value
            case instructions.SUB_LIT_REG.opcode: {
                const literal = this.fetch16();
                const reg = this.fetchRegIndex();
                const regVal = this.registers.getUint16(reg);
                const result = regVal - literal;
                this.setReg('acc', result);
                return;
            }

            //subtract register value from literal
            case instructions.SUB_REG_LIT.opcode: {
                const reg = this.fetchRegIndex();
                const literal = this.fetch16();
                const regVal = this.registers.getUint16(reg);
                const result = literal - regVal;
                this.setReg('acc', result);
                return;
            }

            //subtract register value from register value
            case instructions.SUB_REG_REG.opcode: {
                const r1 = this.fetchRegIndex();
                const r2 = this.fetchRegIndex();
                const r1Val = this.registers.getUint16(r1);
                const r2Val = this.registers.getUint16(r2);
                const result = r1Val - r2Val;
                this.setReg('acc', result);
                return;
            }

            //multiply literal by register value
            case instructions.MUL_LIT_REG.opcode: {
                const literal = this.fetch16();
                const reg = this.fetchRegIndex();
                const regVal = this.registers.getUint16(reg);
                const result = literal * regVal;
                this.setReg('acc', result);
                return;
            }

            //multiply register value by register value
            case instructions.MUL_REG_REG.opcode: {
                const r1 = this.fetchRegIndex();
                const r2 = this.fetchRegIndex();
                const r1Val = this.registers.getUint16(r1);
                const r2Val = this.registers.getUint16(r2);
                const result = r1Val * r2Val;
                this.setReg('acc', result);
                return;
            }

            //increment value in register
            case instructions.INC_REG.opcode: {
                const reg = this.fetchRegIndex();
                const value = this.registers.getUint16(reg);
                const result = value + 1;
                this.registers.setUint16(reg, result);
                return;
            }

            //decrement value in register
            case instructions.INC_REG.opcode: {
                const reg = this.fetchRegIndex();
                const value = this.registers.getUint16(reg);
                const result = value - 1;
                this.registers.setUint16(reg, result);
                return;
            }

            //lef shift register by literal(in place)
            case instructions.LSF_REG_LIT.opcode:{
                const reg = this.fetchRegIndex();
                const literal = this.fetch16();
                const regVal = this.registers.getUint16(reg);
                const result = regVal << literal;
                this.registers.setUint16(reg,result);
                return;
            }

            //lef shift register by register(in place)
            case instructions.LSF_REG_REG.opcode:{
                const reg = this.fetchRegIndex();
                const regOffset = this.fetchRegIndex();
                const regVal = this.registers.getUint16(reg);
                const regOffsetVal = this.registers.getUint16(regOffset);
                const result = regVal << regOffsetVal;
                this.registers.setUint16(reg,result);
                return;
            }

            //right shift register by literal(in place)
            case instructions.RSF_REG_LIT.opcode:{
                const reg = this.fetchRegIndex();
                const literal = this.fetch16();
                const regVal = this.registers.getUint16(reg);
                const result = regVal >> literal;
                this.registers.setUint16(reg,result);
                return;
            }

            //right shift register by register(in place)
            case instructions.RSF_REG_REG.opcode:{
                const reg = this.fetchRegIndex();
                const regOffset = this.fetchRegIndex();
                const regVal = this.registers.getUint16(reg);
                const regOffsetVal = this.registers.getUint16(regOffset);
                const result = regVal >> regOffsetVal;
                this.registers.setUint16(reg,result);
                return;
            }

            //and operation on register with literal
            case instructions.AND_REG_LIT.opcode:{
                const reg = this.fetchRegIndex();
                const literal = this.fetch16();
                const regVal =  this.registers.getUint16(reg);

                const result = regVal & literal;
                this.setReg('acc', result);
                return;
            }

            //and operation on register with register
            case instructions.AND_REG_REG.opcode:{
                const r1 = this.fetchRegIndex();
                const r2 = this.fetchRegIndex();
                const r1Val =  this.registers.getUint16(r1);
                const r2Val =  this.registers.getUint16(r2);

                const result = r1Val & r2Val;
                this.setReg('acc', result);
                return;
            }
                  // Or register with literal
            case instructions.OR_REG_LIT.opcode: {
                const r1 = this.fetchRegIndex();
                const literal = this.fetch16();
                const registerValue = this.registers.getUint16(r1);

                const res = registerValue | literal;
                this.setRegister('acc', res);
                return;
            }

            // Or register with register
            case instructions.OR_REG_REG.opcode: {
                const r1 = this.fetchRegIndex();
                const r2 = this.fetchRegIndex();
                const registerValue1 = this.registers.getUint16(r1);
                const registerValue2 = this.registers.getUint16(r2);

                const res = registerValue1 | registerValue2;
                this.setRegister('acc', res);
                return;
            }

            //or operation on register with register
            case instructions.XOR_REG_REG.opcode:{
                const r1 = this.fetchRegIndex();
                const r2 = this.fetchRegIndex();
                const r1Val =  this.registers.getUint16(r1);
                const r2Val =  this.registers.getUint16(r2);

                const result = r1Val ^ r2Val;
                this.setReg('acc', result);
                return;
            }

            //or operation on register with register
            case instructions.XOR_REG_REG.opcode:{
                const r1 = this.fetchRegIndex();
                const r2 = this.fetchRegIndex();
                const r1Val =  this.registers.getUint16(r1);
                const r2Val =  this.registers.getUint16(r2);

                const result = r1Val ^ r2Val;
                this.setReg('acc', result);
                return;
            }

            //not operation: invert register
            case instructions.NOT.opcode: {
                const reg = this.fetchRegIndex();
                const regVal = this.registers.getUint16(reg);
                const result = (~regVal) & 0xffff; //js is 32 bit, use and ignore high 16 bit
                this.setReg('acc', result);
                return;
            }

            //Branching: conditional jumping
            case instructions.JUM_NOT_EQ.opcode: {
                const value = this.fetch16();
                const address = this.fetch16();
                if( value !== this.getReg('acc')){
                    this.setReg('ip', address);
                }
                return;
            }

            // jump if literal not equal
            case instructions.JMP_NOT_EQ.opcode: {
                const value = this.fetch16();
                const address = this.fetch16();

                if (value !== this.getReg('acc')) {
                this.setRegister('ip', address);
                }
                return;
            }

            // jump if literal not equal
            case instructions.JNE_REG.opcode: {
                const reg = this.fetchRegIndex();
                const regVal = this.registers.getUint16(reg);
                const address = this.fetch16();

                if (regVal !== this.getReg('acc')) {
                this.setReg('ip', address);
                }
                return;
            }

            // Jump if literal equal
            case instructions.JEQ_LIT.opcode: {
                const value = this.fetch16();
                const address = this.fetch16();

                if (value === this.getReg('acc')) {
                this.setReg('ip', address);
                }
                return;
            }

            // Jump if register equal
            case instructions.JEQ_REG.opcode: {
                const r1 = this.fetchRegIndex();
                const value = this.registers.getUint16(r1);
                const address = this.fetch16();

                if (value === this.getReg('acc')) {
                this.setReg('ip', address);
                }
                return;
      }

            // Jump if literal less than
            case instructions.JLT_LIT.opcode: {
                const value = this.fetch16();
                const address = this.fetch16();

                if (value < this.getReg('acc')) {
                this.setReg('ip', address);
                }

                return;
            }

            // Jump if register less than
            case instructions.JLT_REG.opcode: {
                const r1 = this.fetchRegIndex();
                const value = this.registers.getUint16(r1);
                const address = this.fetch16();

                if (value < this.getReg('acc')) {
                this.setReg('ip', address);
                }
                return;
            }

            // Jump if literal greater than
            case instructions.JGT_LIT.opcode: {
                const value = this.fetch16();
                const address = this.fetch16();

                if (value > this.getReg('acc')) {
                this.setReg('ip', address);
                }

                return;
            }

            // Jump if register greater than
            case instructions.JGT_REG.opcode: {
                const r1 = this.fetchRegIndex();
                const value = this.registers.getUint16(r1);
                const address = this.fetch16();

                if (value > this.getReg('acc')) {
                this.setReg('ip', address);
                }
                return;
            }

            // Jump if literal less than or equal to
            case instructions.JLE_LIT.opcode: {
                const value = this.fetch16();
                const address = this.fetch16();

                if (value <= this.getReg('acc')) {
                this.setReg('ip', address);
                }
                return;
            }

            // Jump if register less than or equal to
            case instructions.JLE_REG.opcode: {
                const r1 = this.fetchRegIndex();
                const value = this.registers.getUint16(r1);
                const address = this.fetch16();

                if (value <= this.getReg('acc')) {
                this.setReg('ip', address);
                }
                return;
            }

            // Jump if literal greater than or equal to
            case instructions.JGE_LIT.opcode: {
                const value = this.fetch16();
                const address = this.fetch16();

                if (value >= this.getReg('acc')) {
                this.setReg('ip', address);
                }

                return;
            }

            // Jump if register greater than or equal to
            case instructions.JGE_REG.opcode: {
                const r1 = this.fetchRegIndex();
                const value = this.registers.getUint16(r1);
                const address = this.fetch16();

                if (value >= this.getReg('acc')) {
                this.setReg('ip', address);
                }

                return;
            }

            //push literal
            case instructions.PSH_LIT.opcode: {
                const value = this.fetch16();
                this.push(value);
                return;
            }

            //push register
            case instructions.PSH_REG.opcode: {
                const regIndex  = this.fetchRegIndex();
                this.push(this.registers.getUint16(regIndex));
                return;
            }

            //Pop
            case instructions.POP.opcode: {
                const regIndex = this.fetchRegIndex();
                const value = this.pop();
                this.registers.setUint16(regIndex, value);
                return;
            }

            //call literal
            case instructions.CAL_LIT.opcode: {
                const address = this.fetch16();

                this.pushState();
                this.setReg('ip', address); //jump to new stack frame 
                return;
            }

            //call register
            case instructions.CAL_REG.opcode: {
                const regIndex = this.fetchRegIndex();
                const address = this.registers.getUint16(regIndex);
                this.pushState();
                this.setReg('ip', address);
                return;
            }

            //retrun from subroutine, 
            case instructions.RET.opcode: {
                this.popState();
                return;
            }

            //halt all actions
            case instructions.HLT.opcode: {
                return true;
            }
        }
    }

    step() {
        const instruction = this.fetch8();
        return this.excute(instruction);
    }

    //check each step return, if not halt, run again
    run(){
        const halt = this.step();

        if (!halt) {
            setImmediate(() => this.run());
        }
    }
}

module.exports = CPU;
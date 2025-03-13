const parser = require('./parser')
const instructions = require('../instructions')
const {instructionTypes: I} = require('../instructions/meta');
const registers = require('../registers');

const registerMap = registers.reduce((map,regName, i) =>{
    map[regName] = i;
    return map;
}, {});
/*
const exampleProgram = [
    'mov $4200, r1',
    'mov r1, &0060',
    'mov $1300, r1',
    'mov &0060, r2',
    'add r2, r1',
].join('\n');
*/

const exampleProgram = [
    'start:',
    'mov $0A, &0050',
    'loop:',
    'mov &0050, acc',
    'dec acc',
    'mov acc, &0050',
    'inc r2',
    'inc r2',
    'inc r2',
    'jne $00, &[!loop]',
    'end:',
    'hlt',
].join('\n');

const parseOutput = parser.run(exampleProgram);
console.log(parseOutput.result);


const machineCode = []
const labels = {}
let currentAddr = 0

parseOutput.result.forEach(instructionOrLabel => {
    if(instructionOrLabel.type === 'LABEL'){
        labels[instructionOrLabel.value] = currentAddr;
    }else{
        const metadata = instructions[instructionOrLabel.value.instruction];
        currentAddr += metadata.size;
    }
});

const encodeLit16 = lit => {
    let hexVal;
    if(lit.type === 'VARIABLE'){
        if(!(lit.value in labels)){
            throw new Error(`lable "${lit.value}" not resovled.`)
        }
        hexVal = labels[lit.value];
    }else{
        hexVal = parseInt(lit.value, 16);
    }
    const highByte = (hexVal & 0xff00) >> 8;
    const lowByte = hexVal & 0x00ff;
    machineCode.push(highByte, lowByte);
};

const encodeLit8 = lit => {
    let hexVal;
    if(lit.type === 'VARIABLE'){
        if(!(lit.value in labels)){
            throw new Error(`lable "${lit.value}" not resovled.`)
        }
        hexVal = labels[lit.value];
    }else{
        parseInt(lit.value, 16);
    }
    const lowByte = hexVal & 0x00ff;
    machineCode.push(lowByte);
};

const encodeReg = reg => {
    const mappedReg = registerMap[reg.value];
    machineCode.push(mappedReg)
};

parseOutput.result.forEach(instruction => {
    // check instruction type is label or real instruction
    if(instruction.type !== 'INSTRUCTION'){
        return;
    }

    //match right instruction object
    const metadata = instructions[instruction.value.instruction];
    
    //push operation code to machine code array
    machineCode.push(metadata.opcode);

    if([I.litReg, I.memReg].includes(metadata.type)){
        encodeLit16(instruction.value.args[0]);
        encodeReg(instruction.value.args[1]);
    }

    if([I.regLit, I.regMem].includes(metadata.type)){
        encodeReg(instruction.value.args[0]);
        encodeLit16(instruction.value.args[1]);
    }

    if(I.regLit8 === metadata.type){
        encodeReg(instruction.value.args[0]);
        encodeLit8(instruction.value.args[1]);
    }

    if([I.regReg, I.regPtrReg].includes(metadata.type)){
        encodeReg(instruction.value.args[0]);
        encodeReg(instruction.value.args[1]);
    }

    if(I.litMem === metadata.type){
        encodeLit16(instruction.value.args[0]);
        encodeLit16(instruction.value.args[1]);
    }

    if(I.litOffReg === metadata.type){
        encodeLit16(instruction.value.args[0]);
        encodeReg(instruction.value.args[1]);
        encodeReg(instruction.value.args[2]);
    }

    if(I.singleReg === metadata.type) {
        encodeReg(instruction.value.args[0]);
    }

    if(I.singleLit === metadata.type) {
        encodeLit16(instruction.value.args[0]);
    }
});

console.log(machineCode.join(" "));

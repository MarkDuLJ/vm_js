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
*/

const exampleProgram = `

constant code_constant = $C0DE

+data8 bytes = { $01,   $02,   $03,   $04   }
data16 words = { $0506, $0708, $090A, $0B0C }

code:
  mov [!code_constant], &1234

`.trim();

const parseOutput = parser.run(exampleProgram);

if(parseOutput.isError){
    throw new Error(parseOutput.error);
}


const machineCode = []
const labels = {}
let currentAddr = 0

parseOutput.result.forEach(node => {
    switch (node.type) {
        case 'LABEL':{
            labels[node.value] = currentAddr;           
            break;
        }

        case 'CONSTANT':{
            labels[node.value.name] = parseInt(node.value.value.value, 16) & 0xffff;
            break;
        }

        case 'DATA':{
            labels[node.value.name] = currentAddr;
            const sizeOfEachValue = node.value.size === 16 ? 2 : 1;
            const totalSize = node.value.values.length * sizeOfEachValue;
            currentAddr += totalSize;
            break;
        }

        default:{
            const metadata = instructions[node.value.instruction];
            currentAddr += metadata.size;
            break;
        }
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

const encodeData8 = node => {
    for (let byte of node.value.values) {
        const parsed = parseInt(byte.value, 16);
        machineCode.push(parsed & 0xff);
    }
}

const encodeData16 = node => {
    for (let byte of node.value.values) {
        const parsed = parseInt(byte.value, 16);
        machineCode.push((parsed & 0xff00) >> 8);
        machineCode.push(parsed & 0xff);
    }
}

parseOutput.result.forEach(node => {
    // ignore non instruction type 
    if(node.type === 'LABEL' || node.type === 'CONSTANT'){
        return;
    }

    if(node.type === 'DATA') {
        if(node.value.size === 8){
            encodeData8(node);
        }else {
            encodeData16(node);
        }
        return;
    }

    //match right instruction object
    console.log("OUTPUT: ",node.value.args);
    const metadata = instructions[node.value.instruction];
    //push operation code to machine code array
    machineCode.push(metadata.opcode);

    if([I.litReg, I.memReg].includes(metadata.type)){
        encodeLit16(node.value.args[0]);
        encodeReg(node.value.args[1]);
    }

    if([I.regLit, I.regMem].includes(metadata.type)){
        encodeReg(node.value.args[0]);
        encodeLit16(node.value.args[1]);
    }

    if(I.regLit8 === metadata.type){
        encodeReg(node.value.args[0]);
        encodeLit8(node.value.args[1]);
    }

    if([I.regReg, I.regPtrReg].includes(metadata.type)){
        encodeReg(node.value.args[0]);
        encodeReg(node.value.args[1]);
    }

    if(I.litMem === metadata.type){
        encodeLit16(node.value.args[0]);
        encodeLit16(node.value.args[1]);
    }

    if(I.litOffReg === metadata.type){
        encodeLit16(node.value.args[0]);
        encodeReg(node.value.args[1]);
        encodeReg(node.value.args[2]);
    }

    if(I.singleReg === metadata.type) {
        encodeReg(node.value.args[0]);
    }

    if(I.singleLit === metadata.type) {
        encodeLit16(node.value.args[0]);
    }
});

console.log(machineCode.map(x => '0x' + x.toString(16).padStart(2, '0')).join(" "));

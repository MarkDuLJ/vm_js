const MOVE_LIT_REG  = 0x10;
const MOVE_REG_REG  = 0x11;
const MOVE_REG_MEM  = 0x12;
const MOVE_MEM_REG  = 0x13;
const ADD_REG_REG   = 0x14;
const JUM_NOT_EQ    = 0x15;
const PSH_LIT       = 0x17;  //push memory value to stack
const PSH_REG       = 0x18;  //push register value to stack
const POP           = 0x1A; 
const CAL_LIT       = 0x5E;  // call instruction
const CAL_REG       = 0x5F; 
const RET           = 0x60; //return

module.exports = {
    MOVE_LIT_REG,
    MOVE_REG_REG,
    MOVE_REG_MEM,
    MOVE_MEM_REG,
    ADD_REG_REG,
    JUM_NOT_EQ,
    PSH_LIT,
    PSH_REG,
    POP,
    CAL_LIT,
    CAL_REG,
    RET,
}
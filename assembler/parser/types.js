const {asType} = require('./util');

const register = asType('REGISTER');
const hexLiteral = asType('HEX_LITERAL');
const variable = asType('VARIABLE');
const address = asType('ADDRESS');

const opPlus = asType('OP_PLUS');
const opMinus = asType('OP_MINUS');
const opMultiply = asType('OP_MULTIPLY');


const binaryOperation = asType('BINARY_OPERATION');
const bracketedExprssion = asType('BRACTED_EXPRESSION');
const parentheseExpression = asType('PARENTHESE_EXPRESSION');
const squareBracketExpr = asType('SQ_BRACKET_EXPR');

const instruction = asType('INSTRUCTION');

module.exports = {
    register,
    opPlus,
    opMinus,
    opMultiply,
    hexLiteral,
    variable,
    address,
    binaryOperation,
    bracketedExprssion,
    parentheseExpression,
    squareBracketExpr,
    instruction,
}
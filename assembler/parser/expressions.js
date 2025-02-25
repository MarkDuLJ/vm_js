const A = require('arcsecond');

const T = require('./types');
const {peek, hexLiteral, operator, variable} = require('./common');

const last = a => a[a.length - 1]; //return last element in an array

// expr here could be hex/var/mathoperation
const priorityOperations = expr => {
if (expr.type !== 'PARENTHESE_EXPRESSION' && expr.type !== 'SQ_BRACKET_EXPR'){
    return expr;
}

if (expr.value.length === 1){
    return expr.value[0];
}

// set priorities
const priorities = {
    OP_MULTIPLY:2,
    OP_PLUS: 1,
    OP_MINUS: 0,
}

let candidateExpr = {
    priority: -Infinity,
}

// i starts from 1 to get operator
for (let i = 1; i < expr.value.length; i += 2) {
    const level = priorities[expr.value[i].type];
    if(level > candidateExpr.priority){
    candidateExpr ={
        priority: level,
        a: i - 1,
        b: i + 1,
        op: expr.value[i],
    }
    }
}

const newExpr = T.bracketedExprssion([
    ...expr.value.slice(0, candidateExpr.a),
    T.binaryOperation({
    a: priorityOperations(expr.value[candidateExpr.a]),
    b: priorityOperations(expr.value[candidateExpr.b]),
    op: candidateExpr.op,
    }),
    ...expr.value.slice(candidateExpr.b + 1),
]);

return priorityOperations(newExpr);
}

const typifyParentheseExpr = expr => {
const asBracketed = T.parentheseExpression;
return asBracketed(expr.map(item => {
    if(Array.isArray(item)){
    return typifyParentheseExpr(item);
    }

    return item;
}));
}

const parentheseExpr = A.coroutine(run => {
const states = {
    OPEN_BRACKET: 0,
    OPERATOR_OR_CLOSE_BRACKET: 1,
    ELEMENT_OR_OPEN_BRACKET: 2,
    CLOSE_BRACKET: 3,
};

let state = states.ELEMENT_OR_OPEN_BRACKET;

const expr = [];
const stack = [expr];
run(A.char('('));


while(true){
    const nextChar = run(peek);

    if(state === states.OPEN_BRACKET){
    run(A.char('('));
    expr.push([]);
    
    stack.push(last(expr));
    run(A.optionalWhitespace);
    state = states.ELEMENT_OR_OPEN_BRACKET;

    }else if(state === states.CLOSE_BRACKET){
    run(A.char(')'));
    stack.pop();
    if(stack.length === 0) {
        break; //reach the end of the expression
    }

    run(A.optionalWhitespace);
    state = states.OPERATOR_OR_CLOSE_BRACKET;

    }else if(state === states.ELEMENT_OR_OPEN_BRACKET){
    if(nextChar === ')'){
        run(A.fail('End of expression is wrong'));
    }

    if(nextChar === '('){
        state = states.OPEN_BRACKET;
    }else{
        last(stack).push(run(A.choice([
        hexLiteral,
        variable,
        ])));
        run(A.optionalWhitespace);
        state = states.OPERATOR_OR_CLOSE_BRACKET;
    }

    }else if(state === states.OPERATOR_OR_CLOSE_BRACKET){
    if(nextChar === ')'){
        state = states.CLOSE_BRACKET;
        continue;
    }

    last(stack).push(run(operator));//push operator to stack
    run(A.optionalWhitespace);
    state = states.ELEMENT_OR_OPEN_BRACKET;
    }else {
    // shouldn't happen, throw error
    throw new Error('state broken, pls check');
    }
}
return typifyParentheseExpr(expr);
});


/**
 * expr = hex | var | (expr) | mathOperation
 * mathOperation = expr op expr
 * op = + | - | * | \
 */

/**
 * finite state operaion
 *          expect element ---> expect operator
 * start -->                                    ---> end
 *          expect element <--- expect operatro
 */
const squareBracketExpr = A.coroutine( run => {
run(A.str('['));
run(A.optionalWhitespace);

const states = {
EXPEXT_ELEMENT: 0,
EXPEXT_OPERATOR: 1,
}
const expr = [];
let state = states.EXPEXT_ELEMENT;

while(true) {
if(state === states.EXPEXT_ELEMENT) {
    const result = run(A.choice([
    parentheseExpr,
    hexLiteral,
    variable,
    ]));

    expr.push(result);
    state = states.EXPEXT_OPERATOR;
    run(A.optionalWhitespace);
} else if(state === states.EXPEXT_OPERATOR){
    const nextChar = run(peek);
    if(nextChar === ']'){
    run(A.str(']'));
    run(A.optionalWhitespace);
    break;
    }

    const result = run(operator);
    expr.push(result);
    state = states.EXPEXT_ELEMENT;
    run(A.optionalWhitespace);
}
}

return T.squareBracketExpr(expr);
}).map(priorityOperations);

module.exports = {
squareBracketExpr,
parentheseExpr,
}
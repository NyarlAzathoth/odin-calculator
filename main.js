const CHARACTERS_NOT_ALLOWED_REGEX = '[^0123456789+\\-*/^().]'; // regex to match any not allowed characters
const END_OF_LINE_REGEX = '[+\\-*/^(.]$'; // regex to match invalid character in last
const MULTIPLE_OPERATOR_REGEX = '[+\\-*/^.(][*/^.)]|[.][+\\-()]|[+\\-]{3}'; // regex to match any combination of these +-*/. occurring 2 or more time consecutively except for (++ -- +- -+)
const DECIMAL_DOT_REGEX = '[.][0-9]*[.]'; // regex to match any wrong decimal dot
const VALIDITY_REGEX = new RegExp(END_OF_LINE_REGEX+'|'+CHARACTERS_NOT_ALLOWED_REGEX+'|'+DECIMAL_DOT_REGEX+'|'+MULTIPLE_OPERATOR_REGEX);

const SPLIT_REGEX = /(?=[+\-*/^()])|(?<=[+\-*/^()])/g; // regex to split the string into a list

const NOT_NUMBERS = '+-*/.()';
const PARENTHESIS = '()';
const THIRD_OPERATORS = '+-';
const SECOND_OPERATORS = '*/';
const FIRST_OPERATORS = '^';


function add (a, b) {
    return a + b;
}

function subtract (a, b) {
    return a - b;
}

function multiply (a, b) {
    return a * b;
}

function divide (a, b) {
    return a / b;
}

function power (a, b) {
    return a ** b;
}

function operate (a, b, operator) {
    if (operator == '+') {
        return add(a,b);
    } else if (operator == '-') {
        return subtract(a,b);
    } else if (operator == '*') {
        return multiply(a,b);
    } else if (operator == '/') {
        return divide(a,b);
    } else if (operator == '^') {
        return power(a,b);
    }
}

function simplifyNumber (operator, number) {
    if (operator == '+') {
        return number
    } else if (operator == '-') {
        return - number
    }
}

function simplifyOperators (operator1, operator2) {
    if (operator1 === operator2) {
        return '+';
    } else {
        return '-';
    }
}

function areParenthesisValid (expression) {
    let parenthesisStack = [];

    for (let i = 0; i<expression.length; i++) {
        let currentCharacter = expression.charAt(i);
        let currentTop = parenthesisStack[-1];

        if (currentCharacter == '(') {
            parenthesisStack.push(currentCharacter)
        } else if (currentCharacter == ')') {
            if (parenthesisStack.length == 0) {
                return false
            } else {
                parenthesisStack.pop();
            }
        }
    }

    if (parenthesisStack.length == 0) {return true};
}

function evaluateOperators (array, operators) {
    let processedArray = [];

    for (let i = 0; i<array.length; i++) {
        let currentCharacter = array[i];
        
        if (i == 0) {
            processedArray.push(currentCharacter);
        } else if (operators.includes(currentCharacter)) {
            let newNumber = operate(processedArray.slice(-1)[0], array[i+1], currentCharacter);
            processedArray.pop();
            processedArray.push(newNumber);
        } else if (i>0 && !operators.includes(array[i-1])) {
            processedArray.push(currentCharacter);
        }
    }

    return processedArray;
}

function isNotValid (expression) {
    return VALIDITY_REGEX.test(expression) || !areParenthesisValid(expression);
}

function evaluateArray (array) {

    let parenthesisEvaluated = [];

    for (let i = 0; i<array.length; i++) {
        let currentCharacter = array[i];

        if (currentCharacter == '(') {
            let openingArrayIndex = i;
            let closingArrayIndex = i;
            let closed = false;

            while (!closed) {
                closingArrayIndex++;
                if (array[closingArrayIndex] == ')') {
                    closed = true;
                }
            }

            parenthesisEvaluated.push(evaluateArray(array.slice(openingArrayIndex+1,closingArrayIndex)))
            i = closingArrayIndex;
        } else {
            parenthesisEvaluated.push(currentCharacter);
        }
    }

    let firstOpArray = evaluateOperators(parenthesisEvaluated, FIRST_OPERATORS); // array with the first priority operations completed

    console.log(firstOpArray);

    let secondOpArray = evaluateOperators(firstOpArray, SECOND_OPERATORS); // array with the second priority operations completed

    console.log(secondOpArray);

    let result = evaluateOperators(secondOpArray, THIRD_OPERATORS)[0]; // result after completing last operations

    console.log(result);

    
    // let result = 0;

    // result = processedArray.reduce( (total, currentValue, i, array) => {  //evaluates the expression
    //     if (isNaN(parseFloat(currentValue))) {
    //         return operate(total, array[i+1], currentValue);
    //     } else {
    //         return total
    //     }
    // });

    // for (let i = 0; i<processedExpressionArray.length; i++){     //evaluates the expression
    //     let currentValue = processedExpressionArray[i];
        
    //     if (isNaN(parseFloat(currentValue))) {
    //         console.log(result)
    //         result = operate(result, processedExpressionArray[i+1], currentValue);
    //     }
    // }

    return parseFloat(result.toFixed(5))
}

function evaluateExpression (expression) {
    if (isNotValid(expression)) {
        console.log('not valid');
        return false;
    }

    let expressionArray = expression.split(SPLIT_REGEX); //create array of the numbers and characters

    console.log(expressionArray);

    let processedArray = [];

    for (let i = 0; i<expressionArray.length; i++){     //collapse operators into the numbers (['4', '+', '-', '5'] => [4, '+', -5])
        let currentValue = expressionArray[i];
        
        if (NOT_NUMBERS.includes(currentValue)) {
            let nextValue = expressionArray[i+1];

            if (!PARENTHESIS.includes(nextValue) && i==0 || !PARENTHESIS.includes(currentValue) && i>0 && NOT_NUMBERS.includes(expressionArray[i-1]) && !')'.includes(expressionArray[i-1])) {
                processedArray.push(simplifyNumber(currentValue, parseFloat(expressionArray[i+1])));
                i++;
            } else if (PARENTHESIS.includes(nextValue) && i!=0 && NOT_NUMBERS.includes(expressionArray[i-1]) && !PARENTHESIS.includes(expressionArray[i-1])) {
                processedArray.pop();
                processedArray.push(simplifyOperators(expressionArray[i-1], currentValue));
            } else {
                processedArray.push(currentValue);
            }
        } else {
            processedArray.push(parseFloat(currentValue));
        }
    }

    // for (let i = 0; i<expressionArray.length; i++){     //collapse operators into the numbers (['4', '+', '-', '5'] => [4, '+', -5])
    //     let currentValue = expressionArray[i];
        
    //     if (NOT_NUMBERS.includes(currentValue)) {
    //         if (!PARENTHESIS.includes(currentValue) && i==0 || i>0 && NOT_NUMBERS.includes(expressionArray[i-1])) {
    //             processedExpressionArray.push(simplifyNumber(currentValue, parseFloat(expressionArray[i+1])));
    //             i++;
    //         } else if (PARENTHESIS.includes(currentValue)) {

    //         } else {
    //             processedExpressionArray.push(currentValue);
    //         }
    //     } else {
    //         processedExpressionArray.push(parseFloat(currentValue));
    //     }
    // }

    console.log(processedArray);

    let result = evaluateArray(processedArray);

    console.log(result);
}

let expression = '12+(45*65)*(+45*9.1*-7.8)/+154';

console.log(evaluateExpression(expression));

// Setup buttons


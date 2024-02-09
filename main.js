const CHARACTERS_NOT_ALLOWED_REGEX = '[^0123456789+\\-*/^().]'; // regex to match any not allowed characters
const END_OF_LINE_REGEX = '[+\\-*/^(.]$'; // regex to match invalid character in last
const MULTIPLE_OPERATOR_REGEX = '[+\\-*/^.(][*/^.)]|[.][+\\-()]|[+\\-]{3}'; // regex to match any combination of these +-*/. occurring 2 or more time consecutively except for (++ -- +- -+)
const DECIMAL_DOT_REGEX = '[.][0-9]*[.]'; // regex to match any wrong decimal dot
const VALIDITY_REGEX = new RegExp(END_OF_LINE_REGEX+'|'+CHARACTERS_NOT_ALLOWED_REGEX+'|'+DECIMAL_DOT_REGEX+'|'+MULTIPLE_OPERATOR_REGEX);
const POSITIVE_SIMPLIFICATION_REGEX = /\+\+|\-\-/g;
const NEGATIVE_SIMPLIFICATION_REGEX = /\+\-|\-\+/g;
const PLUS_SIMPLIFICATION_REGEX = /[*/(]\+[0-9]/g;

const SPLIT_REGEX = /(?=[+\-*/^()])|(?<=[+\-*/^()])/g; // regex to split the string into a list

const NUMBERS = '0123456789';
const OPERATORS = '+-*/^';
const PARENTHESIS = '()';
const NOT_NUMBERS = '+-*/^.()';
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

// function simplifyOperators (operator1, operator2) {
//     if (operator1 === operator2) {
//         return '+';
//     } else {
//         return '-';
//     }
// }

function simplifyReplacer (match) {
    return match.charAt(0)+match.charAt(2);
}

function simplifyExpression (expression) {
    return expression.replace(POSITIVE_SIMPLIFICATION_REGEX, '+').replace(NEGATIVE_SIMPLIFICATION_REGEX, '-').replace(PLUS_SIMPLIFICATION_REGEX, simplifyReplacer);
}

function convertToNumbers (array) {
    let processedArray = [];

    for (let i = 0; i<array.length; i++) {
        let currentCharacter = array[i];

        if (!NOT_NUMBERS.includes(currentCharacter)) {
            processedArray.push(parseFloat(currentCharacter));
        } else {
            processedArray.push(currentCharacter)
        }
    }

    return processedArray;
}

function collapseSigns (array) {
    let processedArray = [];

    for (let i = 0; i<array.length; i++) {
        let currentCharacter = array[i];

        if (!NOT_NUMBERS.includes(currentCharacter)) {
            if (i == 1 && THIRD_OPERATORS.includes(array[i-1]) || i>1 && THIRD_OPERATORS.includes(array[i-1]) && OPERATORS.includes(array[i-2])) {
                let lastCharacter = array[i-1];

                processedArray.pop();
                processedArray.push(simplifyNumber(lastCharacter, parseFloat(currentCharacter)));
            } else {
                processedArray.push(parseFloat(currentCharacter));
            }
        } else {
            processedArray.push(currentCharacter)
        }
    }

    return processedArray;
}

function areParenthesisValid (expression) { // stack based algorithm, only for ()
    let parenthesisStack = [];

    for (let i = 0; i<expression.length; i++) {
        let currentCharacter = expression.charAt(i);
        let currentTop = parenthesisStack[-1];

        if (currentCharacter == '(') {
            parenthesisStack.push(currentCharacter)
        } else if (currentCharacter == ')') {
            if (parenthesisStack.length === 0) {
                return false
            } else {
                parenthesisStack.pop();
            }
        }
    }

    if (parenthesisStack.length == 0) {return true};
}

function evaluateOperators (array, operators) { // evaluates a set of operators progressively from left to right and produces a new array with the operation results replacing the operations
    let processedArray = [];

    for (let i = 0; i<array.length; i++) {
        let currentCharacter = array[i];
        
        if (i === 0) {
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

function isNotValid (expression) { // test for validity of syntax
    return VALIDITY_REGEX.test(expression) || !areParenthesisValid(expression);
}

function evaluateArray (array) {

    let noParenthesis = [];

    for (let i = 0; i<array.length; i++) {  // calls evaluateArray again for expressions in parenthesis and inserts the result in place of the expression in parenthesis
        let currentCharacter = array[i];

        if (currentCharacter == '(') {
            let parenthesisStack = [];

            let openingArrayIndex = i;
            let closingArrayIndex = i;
            let closed = false;

            while (!closed) {
                closingArrayIndex++;

                if (array[closingArrayIndex] == '(') {
                    parenthesisStack.push('(');
                } else if (array[closingArrayIndex] == ')') {
                    if (parenthesisStack.length !== 0) {
                        parenthesisStack.pop();
                    } else {
                        closed = true;
                    }
                }
            }

            noParenthesis.push(evaluateArray(array.slice(openingArrayIndex+1,closingArrayIndex)))
            i = closingArrayIndex;
        } else {
            noParenthesis.push(currentCharacter);
        }
    }

    console.log(noParenthesis);

    let collapsedSigns = collapseSigns(noParenthesis);

    console.log(collapsedSigns)

    let firstOpArray = evaluateOperators(collapsedSigns, FIRST_OPERATORS); // array with the first priority operations completed

    console.log(firstOpArray);

    let secondOpArray = evaluateOperators(firstOpArray, SECOND_OPERATORS); // array with the second priority operations completed

    console.log(secondOpArray);

    let result = evaluateOperators(secondOpArray, THIRD_OPERATORS)[0]; // result after completing last operations

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

    console.log(result);

    return result;
}

function evaluateExpression (expression) {
    if (isNotValid(expression)) {
        return false;
    }

    console.log(expression);

    let simplifiedExpression = simplifyExpression(expression);

    console.log(simplifiedExpression);

    let expressionArray = simplifiedExpression.split(SPLIT_REGEX); //create array of the numbers and characters

    console.log(expressionArray);

    let processedArray = [];

    processedArray = convertToNumbers(expressionArray);

    console.log(processedArray);

    let result = evaluateArray(processedArray);

    return parseFloat(result.toFixed(5));
}

let expression = '12*((-45*65)*-45*9.1*(-7.8/+154))';

console.log(evaluateExpression(expression));

function addNumber () {

}

// Setup buttons

let numberButtons = document.querySelectorAll('.number')

numberButtons.forEach( (button) => {
    button.addEventListener('click', addNumber())
});
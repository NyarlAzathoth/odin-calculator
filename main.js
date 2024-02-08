const CHARACTERS_NOT_ALLOWED_REGEX = '[^0123456789+\\-*/().]'; // regex to match any not allowed characters
const END_OF_LINE_REGEX = '[+\\-*/(.]$'; // regex to match invalid character in last
const MULTIPLE_OPERATOR_REGEX = '[+\\-*/.][*/.]|[.][+\\-]|[+\\-]{3}'; // regex to match any combination of these +-*/. occurring 2 or more time consecutively except for (++ -- +- -+)
const DECIMAL_DOT_REGEX = '[.][0-9]*[.]'; // regex to match any wrong decimal dot
const VALIDITY_REGEX = new RegExp(END_OF_LINE_REGEX+'|'+CHARACTERS_NOT_ALLOWED_REGEX+'|'+DECIMAL_DOT_REGEX+'|'+MULTIPLE_OPERATOR_REGEX);

const SPLIT_REGEX = /(?=[+\-*/()])|(?<=[+\-*/()])/g; // regex to split the string into a list


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

function operate (a, b, operator) {
    if (operator == '+') {
        return add(a,b);
    } else if (operator == '-') {
        return subtract(a,b);
    } else if (operator == '*') {
        return multiply(a,b);
    } else if (operator == '/') {
        return divide(a,b);
    }
}

function simplifyNumber (operator, number) {
    if (operator == '+') {
        return number
    } else if (operator == '-') {
        return - number
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

function isNotValid (expression) {
    return VALIDITY_REGEX.test(expression) || !areParenthesisValid(expression);
}

function evaluate (expression) {
    if (isNotValid(expression)) {
        console.log('not valid');
        return false;
    }

    let expressionArray = expression.split(SPLIT_REGEX); //create array of the numbers and characters

    let processedExpressionArray = [];

    for (let i = 0; i<expressionArray.length; i++){     //collapse operators into the numbers (['4', '+', '-', '5'] => [4, '+', -5])
        let currentValue = expressionArray[i];
        
        if (isNaN(parseFloat(currentValue))) {
            if (i==0 || currentValue !== '(' && currentValue !== ')' && i!=0 && isNaN(expressionArray[i-1])) {
                processedExpressionArray.push(simplifyNumber(currentValue, parseFloat(expressionArray[i+1])));
                i++;
            } else {
                processedExpressionArray.push(currentValue);
            }
        } else {
            processedExpressionArray.push(parseFloat(currentValue));
        }
    }

    let result = 0;

    result = processedExpressionArray.reduce( (total, currentValue, i, array) => {  //evaluates the expression
        if (isNaN(parseFloat(currentValue))) {
            return operate(total, array[i+1], currentValue);
        } else {
            return total
        }
    });

    // for (let i = 0; i<processedExpressionArray.length; i++){     //evaluates the expression
    //     let currentValue = processedExpressionArray[i];
        
    //     if (isNaN(parseFloat(currentValue))) {
    //         console.log(result)
    //         result = operate(result, processedExpressionArray[i+1], currentValue);
    //     }
    // }

    return result.toFixed(5)
}

let expression = '12+-45-*9.1*-7.8.9/+154';

console.log(evaluate(expression));
const CHARACTERS_NOT_ALLOWED_REGEX = '[^0123456789+\\-*/^().]'; // regex to match any disallowed characters
const END_OF_LINE_REGEX = '[+\\-*/^(.]$'; // regex to match invalid character in last
const MULTIPLE_OPERATOR_REGEX = '[+\\-*/^.(][*/^.)]|[.][+\\-()]|[+\\-]{3}|\\)[0-9]'; // regex to match any combination of these +-*/. occurring 2 or more time consecutively except for the duos +/-
const DECIMAL_DOT_REGEX = '[.][0-9]*[.]'; // regex to match any wrong decimal dot
const VALIDITY_REGEX = new RegExp(END_OF_LINE_REGEX+'|'+CHARACTERS_NOT_ALLOWED_REGEX+'|'+DECIMAL_DOT_REGEX+'|'+MULTIPLE_OPERATOR_REGEX);

const POSITIVE_SIMPLIFICATION_REGEX = /\+\+|\-\-/g; // regex to match ++ or --
const NEGATIVE_SIMPLIFICATION_REGEX = /\+\-|\-\+/g; // regex to match +- or -+
const PLUS_SIMPLIFICATION_REGEX = /[*/(]\+[0-9]/g; // regex to match redundant +

const SPLIT_REGEX = /(?=[+\-*/^()])|(?<=[+\-*/^()])/g; // regex to split the string into a list of numbers and operators/parenthesis and keep the separators

// Not used
// const NUMBERS = '0123456789';
// const PARENTHESIS = '()';

const OPERATORS = '+-*/^';
const OPERATORS_PARENTHESIS = '+-*/^.()';
const ADDITIVE_OPERATORS = '+-';
const MULTIPLICATION_OPERATORS = '*/';
const EXPONENT_OPERATORS = '^';

// Operations functions

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

// Functions to simplify expression

function simplifyNumber (operator, number) {
    if (operator == '+') {
        return number
    } else if (operator == '-') {
        return - number
    }
}

function simplifyReplacer (match) { // function in the replace() method to remove redundant +
    return match.charAt(0)+match.charAt(2);
}

function simplifyExpression (expression) { // duo of +/- and redundant + are simplified
    return expression.replace(POSITIVE_SIMPLIFICATION_REGEX, '+').replace(NEGATIVE_SIMPLIFICATION_REGEX, '-').replace(PLUS_SIMPLIFICATION_REGEX, simplifyReplacer);
}

function collapseSigns (array) {
    let processedArray = [];

    for (let i = 0; i<array.length; i++) {
        let currentCharacter = array[i];

        if (typeof currentCharacter == 'number') {
            if (i == 1 && ADDITIVE_OPERATORS.includes(array[i-1]) || i>1 && ADDITIVE_OPERATORS.includes(array[i-1]) && OPERATORS.includes(array[i-2])) {
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

function convertToNumbers (array) {
    for (let i = 0; i<array.length; i++) {
        let currentCharacter = array[i];

        if (!OPERATORS_PARENTHESIS.includes(currentCharacter)) {
            array[i] = parseFloat(currentCharacter);
        }
    }

    return array;
}

// Functions to check syntax

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

function isNotValid (expression) { // test for validity of syntax
    return VALIDITY_REGEX.test(expression) || !areParenthesisValid(expression);
}

// Functions to evaluate

function evaluateOperators (array, operators) { // evaluates a set of operators progressively from left to right and produces a new array with the operation results
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

function evaluateArray (array) {
    let noParenthesis = []; // array with the expressions in parenthesis evaluated

    for (let i = 0; i<array.length; i++) {
        let currentCharacter = array[i];

        if (currentCharacter == '(') {

            if (i>0 && !OPERATORS_PARENTHESIS.includes(array[i-1])) { // adds an implied multiplication
                noParenthesis.push('*');
            }

            let parenthesisStack = [];

            let openingArrayIndex = i;
            let closingArrayIndex = i;
            let closed = false;

            while (!closed) { // leaves when the corresponding closing parenthesis is reached
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

            noParenthesis.push(evaluateArray(array.slice(openingArrayIndex+1,closingArrayIndex))) // calls evaluateArray again for the content of the parenthesis
            i = closingArrayIndex; // jumps to after the parenthesis
        } else {
            noParenthesis.push(currentCharacter);
        }
    }

    let collapsedSigns = collapseSigns(noParenthesis); // - are collapsed into the numbers

    let firstOpArray = evaluateOperators(collapsedSigns, EXPONENT_OPERATORS); // array with the first priority operations completed

    let secondOpArray = evaluateOperators(firstOpArray, MULTIPLICATION_OPERATORS); // array with the second priority operations completed

    let result = evaluateOperators(secondOpArray, ADDITIVE_OPERATORS)[0]; // result after completing last operations

    return result;
}

function evaluateExpression (expression) {
    let simplifiedExpression = simplifyExpression(expression); // duo of +/- and redundant + are simplified

    let expressionArray = simplifiedExpression.split(SPLIT_REGEX); // creates array of the numbers and characters

    let processedArray = convertToNumbers(expressionArray); // numbers in string are converted to numbers

    let result = evaluateArray(processedArray);

    return parseFloat(result.toFixed(5));
}

// Button functions

function addCharacter (character) {
    inputBox.innerText += character;
}

function removeCharacter () {
    inputBox.innerText = inputBox.innerText.slice(0, -1);
}

function clearAll () {
    inputBox.innerText = '';
}

function evaluateInput () {
    expression = inputBox.innerText;

    if (expression !== '') {
        if (isNotValid(expression)) {
            expression += ' = Invalid characters or wrong syntax';
        } else {
            expression += ` = ${evaluateExpression(expression)}`;
        }

        let newResult = document.createElement('p');
        newResult.innerText = expression;

        resultsBox.prepend(newResult);

        inputBox.innerHTML = '';
    }
}

function reset() {
    clearAll();
    while (resultsBox.firstChild) {
        resultsBox.removeChild(resultsBox.lastChild);
    }
}

// Links display

let inputBox = document.querySelector('#input');

inputBox.addEventListener("keydown", function (e) {
    if (e.code === "Enter") {  //checks whether the pressed key is "Enter"
        e.preventDefault();
        evaluateInput();
    }
});

let resultsBox = document.querySelector('#results');

// Setup buttons

// number buttons
let numberButtons = document.querySelectorAll('.number');

numberButtons.forEach( (button) => {
    button.addEventListener('click', () => {addCharacter(button.id)})
});

// operator buttons
let operatorButtons = document.querySelectorAll('.operator');

operatorButtons.forEach( (button) => {
    button.addEventListener('click', () => {addCharacter(button.id)})
});

// dot button
let dotButton = document.querySelector('.dot');

dotButton.addEventListener('click', () => {addCharacter(dotButton.id)});

// bracket buttons
let bracketButtons = document.querySelectorAll('.bracket');

bracketButtons.forEach( (button) => {
    button.addEventListener('click', () => {addCharacter(button.id)})
});

// // character buttons

// let characterButtons = document.querySelectorAll('')

// remove button
let removeButton = document.querySelector('#remove');

removeButton.addEventListener('click', () => {removeCharacter()});

// clear all button
let clearButton = document.querySelector('#clear');

clearButton.addEventListener('click', () => {clearAll()});

// equal buttons
let equalButton = document.querySelector('#equal');

equalButton.addEventListener('click', () => {evaluateInput()});

// reset button
let resetButton = document.querySelector('#reset');

resetButton.addEventListener('click', () => {reset()});
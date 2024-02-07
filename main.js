const ALLOWED_CHARACTERS = '0123456789+-*/()'
// regex: /(?=[\+\-\*\/\(\)])|(?<=[\+\-\*\/\(\)])/g

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

function evaluate (expression) {
    let expressionArray = expression.split(/(?=[\+\-\*\/\(\)])|(?<=[\+\-\*\/\(\)])/g); //create array of the numbers and characters

    // if (isNotValid(expressionArray)) {   //check if expression is valid
    //     return 'ERROR';
    // }

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

let expression = '12+-45-+9.1*-78/+154';

console.log(evaluate(expression));
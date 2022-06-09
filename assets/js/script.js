const EMPTY = ['0', 'Error', 'Overflow', 'Infinity'];
const SIGNS = ['+', '-', '*', '/', '%'];
const MAX_CARACTERS = 30;
const eraser = document.querySelector('.eraser');
const display = document.querySelector('.display');
const displayContainer = document.querySelector('.calculator-display');
const historyWrapper = document.querySelector('.note .history ul');
let history = [];


const resizeToFit = () => {
    if(display.value.length < 15){
        display.style.fontSize = '46px';
        return;
    }

    if( display.value.length > MAX_CARACTERS ){
        return
    }

    let fontSize = window.getComputedStyle(display).fontSize;
    display.style.fontSize = (parseFloat(fontSize) - 1) + 'px';
    
    if(display.clientHeight >= displayContainer.clientHeight){
      resize_to_fit();
    }
}


const printHistory = history => {
    historyWrapper.innerHTML = '';
    history.forEach(item => {
        const li = document.createElement('li');
        const fontSize = item.length > 20 ? '16px' : '30px'; 
        li.innerHTML = item;
        li.style.fontSize = fontSize;
        historyWrapper.appendChild(li);
    })
}
    
const isFloat = n => {
    n = Number(n);
    return n % 1 !== 0;
}

const getLastChar = str => str.slice(-1);

const getLastNumber = (expression, only_float=false) => {
    let lastNumber = [];

    if( only_float ){
        lastNumber = expression.match(/\d+\.\d+$/g) || [];
    } else {
        lastNumber = expression.match(/\d+\.\d+$/g) || expression.match(/\d+$/g) || expression.match(/\d+\.+$/g) || [];
    }

    if( lastNumber.length > 0 ){
        lastNumber = lastNumber[0];
    }

    if( getLastChar(lastNumber) === '.' ){
        lastNumber = lastNumber.slice(0, -1);
    }

    return lastNumber;
}

const verifyParanthesis = expression => {
    const countOpenParenthesis = expression.match(/\(/g) || [];
    const countCloseParenthesis = expression.match(/\)/g) || [];

    if( countOpenParenthesis && countOpenParenthesis.length > countCloseParenthesis.length ){
        expression += ')';
    }

    return expression;
}

const solveExpression = () => {
    try {
        let expression = display.value;
    
        expression = expression.replace(/x/g, '*');
        expression = expression.replace(/÷/g, '/');
        
        const lastChar = getLastChar(expression);
        if( SIGNS.indexOf(lastChar) > -1 ){
            expression = expression.substring(0, expression.length - 1);
        }

        expression = verifyParanthesis(expression);
        const result = eval(expression);

        history.push(expression + ' = ' + result);
        printHistory(history);

        if( isNaN(result) ){
            display.value = 'Error';
        } else {
            display.value = result;
        }
    } catch(e) {
        display.value = 'Error';
    }
}

const clearDisplay = () => {
    display.value = '0';
}

const invertSign = () => {
    let value = display.value;

    if( EMPTY.indexOf(value) > -1 ){
        return;
    }

    const lastChar = getLastChar(value);

    if( lastChar === '-' || lastChar === ')' ){
        return;
    }

    if( isNaN(lastChar) && lastChar !== '.' ){
        display.value += '(-';
    } else {
        const lastNumber = getLastNumber(value);
        const lastIndexOfNumber = value.lastIndexOf(lastNumber);

        value = value.substring(0, lastIndexOfNumber);
        lastNumber.trim('.')
        value += '(-' + lastNumber + ')';
        display.value = value;
    }
}

const addToExpression = (buttonValue) => {
    if( display.value.length + 1 > MAX_CARACTERS ){
        display.value = 'Overflow';
        return;
    }

    if( EMPTY.indexOf(display.value) > -1 ) {
        if( isNaN(buttonValue) ){
            return;
        }

        display.value = buttonValue;
    } else {
        const lastChar = getLastChar(display.value);
        const lastNumber = getLastNumber(display.value, true);

        if( isNaN(buttonValue) ){
            if ( (isFloat(lastNumber) || isNaN(lastChar)) && buttonValue === '.' ){
                return;
            }

            if( isNaN(lastChar) && lastChar !== ')' ){
                return;
            }

            if( SIGNS.indexOf(buttonValue) > -1 ){
                display.value = verifyParanthesis(display.value);
            }

        } else {
            if( lastChar === ')' ){
                display.value += 'x';
            }
        }

        display.value += buttonValue;
    }

    resizeToFit();
}

const onClickCalculatorButton = (event) => {
    const button = event.target;
    const buttonValue = button.value;

    if (buttonValue === '=') {
        solveExpression();
    } else if (buttonValue === 'C') {
        clearDisplay();
    } else if (buttonValue === '+/-') {
        invertSign();
    } else {
        addToExpression(buttonValue);
    }
}

const buttons = document.querySelectorAll('.calculator-button:not(.faccat)');
buttons.forEach(button => button.addEventListener('click', onClickCalculatorButton));

eraser.addEventListener('click', () => {
    history = [];
    printHistory(history);
});
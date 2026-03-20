let allChariotButtons = document.querySelectorAll('.chariot-btn');
let startGameScreen = document.querySelector('.betting');
let gameScreen = document.querySelector('.game');

// let selectedChariot = null;
let selectedChariot = 1;
let chariots = document.querySelectorAll('.chariot');
let numberLabels = document.querySelectorAll('.number');
let betInput = document.querySelector('.bet-input');
let betAmount = 10;

let moneyAmountLabel = document.querySelector('.money-amount');
let money = getMoney();
moneyAmountLabel.textContent = money.toLocaleString('en-US');
let toggleSettingsBtn = document.querySelector('.settings');
let settingsDisplay = document.querySelector('.settings-display');
let muted = false;

let muteCheckbox = document.querySelector('.mute-checkbox');
let resetDataBtn = document.querySelector('.reset-data');

let terminal2 = document.querySelector('.terminal-2');
let startBtn = document.querySelector('.start');
let pauseBtn = document.querySelector('.pause');
let resetBtn = document.querySelector('.reset');
let raceInterval = null;

const sfx = {
    click: new Audio('./assets/sounds/click.mp3'),
    ding: new Audio('./assets/sounds/ding.mp3'),
    win: new Audio('./assets/sounds/win.mp3'),
    lose: new Audio('./assets/sounds/lose.mp3'),
}

allChariotButtons.forEach(button => {
    button.addEventListener('click', () => {
        startGameScreen.style.display = 'none';
        gameScreen.style.display = 'flex';
        selectedChariot = button.dataset.chariot;
        terminal2.textContent = `Click start to begin the race! You selected chariot ${selectedChariot}`;
        calcMoney(betAmount, '-');
        moneyAmountLabel.textContent = getMoney().toLocaleString('en-US');
        playSound(sfx.click);

        // Recalculate after layout is visible
        requestAnimationFrame(updateRaceWidth);
    });
});

betInput.addEventListener('change', (amount) => {
    if (amount.target.value < 0) {
        betInput.value = 0;
    } else if (amount.target.value > 1000) {
        betInput.value = 1000;
    }
    if (amount.target.value > getMoney()) {
        betInput.value = getMoney();
    }
    amount.target.value = Math.floor(amount.target.value);
    betAmount = parseInt(betInput.value);
});
toggleSettingsBtn.addEventListener('click', () => {
    settingsDisplay.classList.toggle('shown');
    playSound(sfx.click);
});
muteCheckbox.addEventListener('change', () => {
    muted = muteCheckbox.checked;
    playSound(sfx.click);
});
resetDataBtn.addEventListener('click', () => {
    playSound(sfx.click);
    setTimeout(() => {
        if (confirm('Are you sure you want to reset your data? This cannot be undone.')) {
            calcMoney(100, 'set');
            setTimeout(() => {
                window.location.reload();
            }, 250);
        }
    }, 250);
});

startBtn.addEventListener('click',() => {
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    playSound(sfx.click);
    startRace();
});
pauseBtn.addEventListener('click',() => {
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    clearInterval(raceInterval);
    playSound(sfx.click);
    raceInterval = null;
});
resetBtn.addEventListener('click', () => {
    clearInterval(raceInterval);
    raceInterval = null;
    playSound(sfx.click);
    resetGame();
});
function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const chariotSpeedA = [1, 2, 3, 4, 5];
const chariotSpeedB = [1, 2, 3, 4, 5, 6];
const chariotSpeedC = [1, 2, 3, 4, 5, 6];
const chariotSpeedD = [1, 2, 3, 4, 5, 6, 7];
const chariotSpeedE = [1, 2, 3, 4, 5, 6, 7];
const chariotSpeedF = [1, 2, 3, 4, 5, 6, 7, 8];

let chariotSpeeds = [chariotSpeedA, chariotSpeedB, chariotSpeedC, chariotSpeedD, chariotSpeedE, chariotSpeedF];
let chariotPositions = [0, 0, 0, 0, 0, 0];
chariotSpeeds = shuffleInPlace(chariotSpeeds);
let winners = [];
let raceTimeInterval = 75;
let raceWidth = 675;

function updateRaceWidth() {
    const field = document.querySelector('.field');
    const finishLine = document.querySelector('.finish-line');
    const firstChariot = chariots[0];

    if (!field || !finishLine || !firstChariot) return;

    const fieldRect = field.getBoundingClientRect();
    const finishRect = finishLine.getBoundingClientRect();
    const chariotRect = firstChariot.getBoundingClientRect();

    // distance from chariot left=0 to where its right edge reaches finish line
    raceWidth = Math.max(0, (finishRect.left - fieldRect.left) - chariotRect.width) + 25;
}

window.addEventListener('resize', updateRaceWidth);
window.addEventListener('load', updateRaceWidth);
updateRaceWidth();

function resetGame() {
    chariotPositions = [0, 0, 0, 0, 0, 0];
    chariots.forEach(chariot => chariot.style.left = '0px');
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    raceTimeInterval = 75;
    winners = [];
    chariotSpeeds = shuffleInPlace(chariotSpeeds);

    numberLabels.forEach(label => {
        label.classList.remove('shown');
        label.textContent = '';
    });
    gameScreen.style.display = 'none';
    startGameScreen.style.display = 'flex';
}
function startRace() {
    if (raceInterval) return;

    // Ensure latest width before starting
    updateRaceWidth();

    if (raceWidth <= 0) {
        terminal2.textContent = 'Race track width is invalid. Resize window or reopen race screen.';
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        return;
    }

    raceInterval = setInterval(() => {
        for (let i = 0; i < chariots.length; i++) {
            if (winners.includes(i + 1)) continue;
            let randomSpeed = chariotSpeeds[i][Math.floor(Math.random() * chariotSpeeds[i].length)];
            chariotPositions[i] += randomSpeed;
            chariots[i].style.left = chariotPositions[i] + 'px';
            if (chariotPositions[i] >= raceWidth) {
                winners.push(i + 1);
                raceTimeInterval -= 10;
                numberLabels[i].classList.add('shown');
                numberLabels[i].textContent = `${winners.length}${winners.length === 1 ? 'st' : winners.length === 2 ? 'nd' : winners.length === 3 ? 'rd' : 'th'}`;
                playSound(sfx.ding);
            }

            if (winners.length === 6) {
                clearInterval(raceInterval);
                raceInterval = null;

                if (winners[0] == selectedChariot || winners[1] == selectedChariot) {
                    playSound(sfx.win);
                } else {
                    playSound(sfx.lose);
                }

                setTimeout(() => {
                    alert(`1st: Chariot ${winners[0]}\n2nd: Chariot ${winners[1]}\n3rd: Chariot ${winners[2]}\n4th: Chariot ${winners[3]}\n5th: Chariot ${winners[4]}\n6th: Chariot ${winners[5]}`);

                    if (winners[0] == selectedChariot) {
                        const payout = (betAmount * 6).toLocaleString('en-US');
                        calcMoney(betAmount * 6);
                        moneyAmountLabel.textContent = getMoney().toLocaleString('en-US');
                        alert(`Congratulations! You won the round! You made ${payout} Drachma!`);
                    } else if (winners[1] == selectedChariot) {
                        const payout = (betAmount * 2).toLocaleString('en-US');
                        calcMoney(betAmount * 2);
                        moneyAmountLabel.textContent = getMoney().toLocaleString('en-US');
                        alert(`Congratulations! You placed second! You made ${payout} Drachma!`);
                    } else {
                        alert(`You got ${winners.indexOf(parseInt(selectedChariot)) + 1}${winners.indexOf(parseInt(selectedChariot)) === 0 ? 'st' : winners.indexOf(parseInt(selectedChariot)) === 1 ? 'nd' : winners.indexOf(parseInt(selectedChariot)) === 2 ? 'rd' : 'th'} place.\nBetter luck next time!`);
                    }
                    resetGame();
                    return;
                }, 250);
            }
        }
    }, raceTimeInterval);
}


function playSound(sfx) {
    if (!muted) {
        let sound = sfx.cloneNode();
        sound.play();
        sound.addEventListener('ended', () => {
            sound.remove();
        });
    }
}
function getMoney() {
    const raw = localStorage.getItem('Drachma');
    const value = Number(raw);
    return Number.isFinite(value) ? value : 100;
}
function calcMoney(amount, operation = '+') {
    let currentCredits = getMoney();
    amount = parseFloat(amount);
    if (operation === 'add' || operation === '+') {
        localStorage.setItem('Drachma', currentCredits + amount);
    } else if (operation === 'subtract' || operation === '-') {
        localStorage.setItem('Drachma', currentCredits - amount);
    } else if (operation === 'set') {
        localStorage.setItem('Drachma', amount);
    } else if (operation === 'multiply' || operation === '*') {
        localStorage.setItem('Drachma', currentCredits * amount);
    } else if (operation === 'divide' || operation === '/') {
        localStorage.setItem('Drachma', currentCredits / amount);
    } else {
        return;
    }
}

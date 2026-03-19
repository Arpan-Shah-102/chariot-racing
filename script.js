let allChariotButtons = document.querySelectorAll('.chariot-btn');
let startGameScreen = document.querySelector('.betting');
let gameScreen = document.querySelector('.game');

// let selectedChariot = null;
let selectedChariot = 1;
let chariots = document.querySelectorAll('.chariot');

let terminal2 = document.querySelector('.terminal-2');
let startBtn = document.querySelector('.start');
let pauseBtn = document.querySelector('.pause');
let raceInterval = null;

allChariotButtons.forEach(button => {
    button.addEventListener('click', () => {
        startGameScreen.style.display = 'none';
        gameScreen.style.display = 'flex';
        selectedChariot = button.dataset.chariot;
        terminal2.textContent = `Click start to begin the race! You selected chariot ${selectedChariot}`;

        // Recalculate after layout is visible
        requestAnimationFrame(updateRaceWidth);
    });
});

startBtn.addEventListener('click',() => {
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    startRace();
});
pauseBtn.addEventListener('click',() => {
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    clearInterval(raceInterval);
    raceInterval = null;
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
const chariotSpeedC = [2, 3, 4, 5, 6];
const chariotSpeedD = [2, 3, 4, 5, 6, 7];
const chariotSpeedE = [3, 4, 5, 6, 7];
const chariotSpeedF = [3, 4, 5, 6, 7, 8];

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
            }

            if (winners.length === 6) {
                clearInterval(raceInterval);
                raceInterval = null;
                alert(`1st: Chariot ${winners[0]}\n2nd: Chariot ${winners[1]}\n3rd: Chariot ${winners[2]}\n4th: Chariot ${winners[3]}\n5th: Chariot ${winners[4]}\n6th: Chariot ${winners[5]}`);

                if (winners[0] == selectedChariot) {
                    alert('Congratulations! You won the round!');
                } else {
                    alert(`You got ${winners.indexOf(parseInt(selectedChariot)) + 1} place.\nBetter luck next time!`);
                }
                resetGame();
                return;
            }
        }
    }, raceTimeInterval);
}

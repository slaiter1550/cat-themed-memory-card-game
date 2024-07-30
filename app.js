let cards = [];
let difficulty = 'easy';
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let score = 0;
let timerInterval = null;
let secondsElapsed = 0;
let comboStreak = 0;
let challengeTimerInterval = null;
let movesRemaining = 20;
let isSoundOn = true;
let shuffleInterval = null;

const gameBoard = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const comboStreakDisplay = document.getElementById('combo-streak');
const challengeTimerDisplay = document.getElementById('challenge-timer');
const movesRemainingDisplay = document.getElementById('moves-remaining');
const winningMessage = document.getElementById('winning-message');
const soundToggle = document.getElementById('sound-toggle');
const cardFlipSound = new Audio('flip.mp3');
const matchSound = new Audio('match.mp3');
const cardImages = [
    '1.png', '2.png', '3.png', '4.png', '5.jpeg',
    '6.png', '7.png', '8.png', '9.png', '10.png',
    '11.png', '12.jpeg', '13.jpeg', '14.png', '15.png',
    '16.png', '17.png'
];

document.getElementById('easy').addEventListener('click', () => startGame('easy'));
document.getElementById('medium').addEventListener('click', () => startGame('medium'));
document.getElementById('hard').addEventListener('click', () => startGame('hard'));
document.getElementById('challenge').addEventListener('click', () => startGame('challenge'));
document.getElementById('restart').addEventListener('click', restartGame);
soundToggle.addEventListener('click', toggleSound);

document.addEventListener('keydown', (e) => {
    const cardsElements = document.querySelectorAll('.card');
    if (e.key === 'ArrowRight') {
        selectedCardIndex = (selectedCardIndex + 1) % cardsElements.length;
    } else if (e.key === 'ArrowLeft') {
        selectedCardIndex = (selectedCardIndex - 1 + cardsElements.length) % cardsElements.length;
    } else if (e.key === 'Enter') {
        flipCard(cardsElements[selectedCardIndex], cards[selectedCardIndex]);
    }

    highlightSelectedCard(cardsElements);
});

function highlightSelectedCard(cardsElements) {
    cardsElements.forEach((card, index) => {
        card.classList.toggle('selected', index === selectedCardIndex);
    });
}

function startGame(selectedDifficulty) {
    difficulty = selectedDifficulty;
    score = 0;
    comboStreak = 0;
    secondsElapsed = 0;
    movesRemaining = 20; // For Challenge Mode
    scoreDisplay.textContent = `Score: ${score}`;
    comboStreakDisplay.textContent = `Combo: ${comboStreak}`;
    timerDisplay.textContent = `Time: ${secondsElapsed}s`;
    winningMessage.classList.add('hidden');
    clearInterval(timerInterval);
    clearInterval(challengeTimerInterval);
    clearInterval(shuffleInterval);
    timerInterval = setInterval(updateTimer, 1000);
    if (difficulty === 'challenge') {
        challengeTimerDisplay.classList.remove('hidden');
        movesRemainingDisplay.classList.remove('hidden');
        startChallengeTimer();
        updateMovesRemaining();
    } else {
        challengeTimerDisplay.classList.add('hidden');
        movesRemainingDisplay.classList.add('hidden');
    }
    setCards();
    shuffle();
    renderCards();
    if (difficulty === 'medium') {
        document.querySelectorAll('.card').forEach(card => {
            setTimeout(() => card.classList.remove('is-flipped'), 1000); // Memory fade time updated to 1 second
        });
    }
    if (difficulty === 'hard') {
        shuffleInterval = setInterval(shuffleBoard, 5000); // Shuffle cards every 5 seconds in hard mode
    }
}

function toggleSound() {
    isSoundOn = !isSoundOn;
    soundToggle.src = isSoundOn ? 'sound on.png' : 'sound off.png';
}

function startChallengeTimer() {
    let timeLeft = 35;
    challengeTimerDisplay.textContent = `Time Left: ${timeLeft}s`;
    challengeTimerInterval = setInterval(() => {
        timeLeft--;
        challengeTimerDisplay.textContent = `Time Left: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(challengeTimerInterval);
            alert('Time up! You failed the challenge.');
            restartGame();
        }
    }, 1000);
}

function updateMovesRemaining() {
    movesRemainingDisplay.textContent = `Moves Left: ${movesRemaining}`;
    if (movesRemaining <= 0) {
        alert('No moves left! You failed the challenge.');
        restartGame();
    }
}

function setCards() {
    let pairs = 0;

    switch (difficulty) {
        case 'medium':
            pairs = 12;
            break;
        case 'hard':
        case 'challenge':
            pairs = 16;
            break;
        case 'easy':
        default:
            pairs = 8;
            break;
    }

    cards = [];
    for (let i = 0; i < pairs; i++) {
        cards.push({ id: i + 1, img: cardImages[i % cardImages.length] });
        cards.push({ id: i + 1, img: cardImages[i % cardImages.length] });
    }
}

function renderCards() {
    gameBoard.innerHTML = '';
    switch (difficulty) {
        case 'medium':
            gameBoard.style.gridTemplateColumns = 'repeat(6, 1fr)';
            break;
        case 'hard':
        case 'challenge':
            gameBoard.style.gridTemplateColumns = 'repeat(8, 1fr)';
            break;
        case 'easy':
        default:
            gameBoard.style.gridTemplateColumns = 'repeat(4, 1fr)';
            break;
    }
    cards.forEach(createCard);
}

function createCard(card) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.innerHTML = `
        <div class="card-inner">
            <div class="card-front"></div>
            <div class="card-back" style="background-image: url('${card.img}'); background-size: cover;"></div>
        </div>
    `;
    cardElement.addEventListener('click', () => flipCard(cardElement, card));
    gameBoard.appendChild(cardElement);
}

function flipCard(cardElement, card) {
    if (lockBoard) return;
    if (cardElement === firstCard) return;

    cardElement.classList.add('is-flipped');
    playSound(cardFlipSound);

    if (!firstCard) {
        firstCard = cardElement;
        return;
    }

    secondCard = cardElement;
    lockBoard = true;
    score++;
    scoreDisplay.textContent = `Score: ${score}`;
    movesRemaining--;
    updateMovesRemaining();

    if (firstCard.innerHTML === secondCard.innerHTML) {
        comboStreak++;
        playSound(matchSound);
        disableCards();
    } else {
        comboStreak = 0;
        unflipCards();
    }
    comboStreakDisplay.textContent = `Combo: ${comboStreak}`;
}

function disableCards() {
    firstCard.classList.add('match');
    secondCard.classList.add('match');
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    document.querySelector('.game-container').classList.add('correct');
    setTimeout(() => {
        document.querySelector('.game-container').classList.remove('correct');
        checkForWin();
        resetBoard();
    }, 500);
}

function unflipCards() {
    firstCard.classList.add('mismatch');
    secondCard.classList.add('mismatch');
    document.querySelector('.game-container').classList.add('incorrect');
    setTimeout(() => {
        firstCard.classList.remove('is-flipped', 'mismatch');
        secondCard.classList.remove('is-flipped', 'mismatch');
        document.querySelector('.game-container').classList.remove('incorrect');
        resetBoard();
    }, 1500);
}

function checkForWin() {
    if (gameBoard.querySelectorAll('.is-flipped').length === cards.length) {
        winningMessage.classList.remove('hidden');
        clearInterval(timerInterval);
        clearInterval(challengeTimerInterval);
        clearInterval(shuffleInterval);
        updateStats();
        displayStats();
    }
}

function resetBoard() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

function shuffle() {
    cards.sort(() => Math.random() - 0.5);
}

function shuffleBoard() {
    if (difficulty === 'hard') {
        shuffle();
        renderCards();
    }
}

function updateTimer() {
    secondsElapsed++;
    timerDisplay.textContent = `Time: ${secondsElapsed}s`;
}

function restartGame() {
    clearInterval(timerInterval);
    clearInterval(challengeTimerInterval);
    clearInterval(shuffleInterval);
    startGame(difficulty);
}

function updateStats() {
    personalStats.gamesPlayed++;
    personalStats.totalMoves += score;
    personalStats.totalTime += secondsElapsed;
    if (score < personalStats.bestScore) {
        personalStats.bestScore = score;
    }
    localStorage.setItem('memoryGameStats', JSON.stringify(personalStats));
}

function displayStats() {
    const stats = JSON.parse(localStorage.getItem('memoryGameStats')) || personalStats;
    document.getElementById('stats').innerHTML = `
        <p>Games Played: ${stats.gamesPlayed}</p>
        <p>Best Score: ${stats.bestScore}</p>
        <p>Total Moves: ${stats.totalMoves}</p>
        <p>Total Time: ${stats.totalTime}s</p>
    `;
}

function playSound(sound) {
    if (isSoundOn) {
        sound.play();
    }
}

startGame(difficulty);

// window.addEventListener('load', () => {
//     showConfetti();
// });




function createStarField() {
    const starsContainer = document.getElementById('stars-bg');
    if (!starsContainer) return;
    
    starsContainer.innerHTML = '';

    // ===== 10 LAMPS =====
    const lampConfig = {
        count: 10,
        startPos: 5,
        spacing: 9.5,
    };
    
    for (let i = 0; i < lampConfig.count; i++) {
        const lamp = document.createElement('div');
        lamp.className = 'streetlamp';
        lamp.dataset.index = i;
        lamp.style.right = (lampConfig.startPos + i * lampConfig.spacing) + '%';
        lamp.style.animationDelay = i * 0.1 + 's';
        lamp.innerHTML = `
            <div class="lamp-post"></div>
            <div class="lamp-head"></div>
            <div class="light-cone"></div>
            <div class="light-glow"></div>
        `;
        starsContainer.appendChild(lamp);
    }


    
    // ===== CAR WITH BOUNCE =====
    // ===== CAR - INFINITE LOOP =====
const car = document.createElement('img');
car.src = 'pictures/car&wheels.png';
car.className = 'driving-car';
car.alt = 'car';
starsContainer.appendChild(car);

// Start driving immediately when dark mode is on
if (document.body.classList.contains('dark')) {
    car.classList.add('drive-infinite');
}
    // Clouds
    const cloudImages = ['cloud_five', 'cloud_four', 'cloud_three'];
    for (let i = 0; i < 5; i++) {
        const cloud = document.createElement('img');
        cloud.className = 'cloud';
        cloud.src = `pictures/${cloudImages[Math.floor(Math.random() * 3)]}.png`;
        cloud.style.top = Math.random() * 55 + 10 + '%';
        cloud.style.width = Math.random() * 160 + 120 + 'px';
        cloud.style.opacity = Math.random() * 0.35 + 0.25;
        cloud.style.animationDelay = Math.random() * 30 + 's';
        cloud.style.animationDuration = Math.random() * 80 + 90 + 's';
        starsContainer.appendChild(cloud);
    }
    
    // Stars
    for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 60 + '%';
        const size = Math.random() * 2 + 1;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.animationDelay = Math.random() * 3 + 's';
        starsContainer.appendChild(star);
    }
}

const dealBtn = document.getElementById('deal-btn');
const hitBtn = document.getElementById('hit-btn');
const standBtn = document.getElementById('stand-btn');
const resetBtn = document.getElementById('reset-btn');
const dealerCardsEl = document.getElementById('dealer-cards');
const playerCardsEl = document.getElementById('player-cards');
const dealerScoreEl = document.getElementById('dealer-score');
const playerScoreEl = document.getElementById('player-score');
const messageEl = document.getElementById('message');
const balanceEl = document.getElementById('balance-display');
const betEl = document.getElementById('bet-display');
const chipButtonsEl = document.getElementById('chip-buttons');
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const suitNames = { '♠': 'spades', '♥': 'hearts', '♦': 'diamonds', '♣': 'clubs' };
const valueNames = { A: 'ace', J: 'jack', Q: 'queen', K: 'king' };

const soundSettings = {
    win: [{ freq: 440, duration: 0.08 }, { freq: 660, duration: 0.08 }, { freq: 880, duration: 0.12 }],
    lose: [{ freq: 330, duration: 0.1 }, { freq: 260, duration: 0.12 }],
    tie: [{ freq: 440, duration: 0.14 }],
    gameover: [{ freq: 220, duration: 0.16 }, { freq: 180, duration: 0.16 }, { freq: 140, duration: 0.2 }],
};
let audioCtx = null;


function applyTheme(theme) {
    document.body.classList.toggle('dark', theme === 'dark');
    document.body.classList.toggle('light', theme === 'light');
    themeIcon.src = theme === 'dark' ? 'pictures/moon1319.png' : 'pictures/sun59569.png';
    themeIcon.alt = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    themeToggleBtn.classList.toggle('showing-sun', theme === 'light');
    localStorage.setItem('blackjack-theme', theme);
    
    const car = document.querySelector('.driving-car');
    if (car) {
        if (theme === 'dark') {
            car.classList.add('drive-infinite');
        } else {
            car.classList.remove('drive-infinite');
        }
    }
}

function toggleTheme() {
    const nextTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(nextTheme);
}

document.addEventListener('DOMContentLoaded', () => {
    createStarField();
    
    const savedTheme = localStorage.getItem('blackjack-theme');
    const defaultTheme = savedTheme || 'dark';
    applyTheme(defaultTheme);
});

const state = {
    deck: [],
    player: [],
    dealer: [],
    roundActive: false,
    roundOver: true,
    balance: 1000,
    currentBet: 0,
};

function ensureAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

function playTone(freq, duration, type = 'sine', gainValue = 0.15, when = 0) {
    const ctx = ensureAudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime + when);
    gain.gain.setValueAtTime(gainValue, ctx.currentTime + when);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + when + duration);

    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(ctx.currentTime + when);
    oscillator.stop(ctx.currentTime + when + duration + 0.02);
}

function playSound(type) {
    if (type === 'chip') {
        const audio = new Audio('sounds/chips5.wav');
        audio.play().catch(() => {});
        return;
    }

    if (type === 'blackjack') {
        const audio = new Audio('sounds/you-win.mp3');
        audio.play().catch(() => {});
        return;
    }

    if (type === 'win') {
        const audio = new Audio('sounds/cheer.mp3');
        audio.play().catch(() => {});
        return;
    }

    if (type === 'gameover') {
        const audio = new Audio('sounds/game-over.mp3');
        audio.play().catch(() => {});
        return;
    }
    if (type === 'lose') {
        const audio = new Audio('sounds/you-lose.mp3');
        audio.play().catch(() => {});
        return;
    }

    if (!soundSettings[type]) {
        return;
    }

    let timeOffset = 0;
    soundSettings[type].forEach((note) => {
        playTone(note.freq, note.duration, 'sine', 0.16, timeOffset);
        timeOffset += note.duration;
    });
}

// 2. Preload sounds once at the top
const dealSound = new Audio('sounds/deal-card.mp3'); 
const hitSound = new Audio('sounds/hit-me.m4a');   

dealSound.preload = 'auto';
hitSound.preload = 'auto';
dealSound.volume = 0.4;
hitSound.volume = 0.3;

// 3. Safe play function
function playCardSound(audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
}

// 4. Deal button - ONLY THIS ONE, delete any other dealBtn.addEventListener
const DEAL_SOUND_DURATION = 400; 

dealBtn.addEventListener('click', () => {
    // Play deal sound first
    playCardSound(dealSound);
    
    // Run your existing deal function right here
    // Replace 'dealNewHand()' with whatever your function is actually called
    dealNewHand(); 
});

// 5. Hit button
hitBtn.addEventListener('click', () => {
    playCardSound(hitSound);
    playerHit(); // Replace with your actual hit function name
});


// Background music
const bgMusic = new Audio('sounds/game-song3.m4a'); // or whatever your file is
bgMusic.loop = true;
bgMusic.volume = 0.15; // keep it low so card sounds are louder
bgMusic.preload = 'auto';


// Browsers block autoplay, so start it on first click
let musicStarted = false;

document.addEventListener('click', () => {
    if (!musicStarted) {
        bgMusic.play().catch(() => {}); // swallows autoplay errors
        musicStarted = true;
    }
}, { once: true }); // only runs once


function createDeck() {
    const deck = [];
    suits.forEach((suit) => {
        values.forEach((value) => {
            deck.push({ suit, value });
        });
    });
    return deck;
}

function shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function getCardFile(card) {
    const value = valueNames[card.value] || card.value.toLowerCase();
    const suit = suitNames[card.suit];
    return `SVG-cards-1.3/${value}_of_${suit}.svg`;
}

function getScore(hand) {
    let total = 0;
    let aces = 0;

    hand.forEach((card) => {
        if (card.value === 'A') {
            aces += 1;
        } else if (['K', 'Q', 'J'].includes(card.value)) {
            total += 10;
        } else {
            total += Number(card.value);
        }
    });

    for (let i = 0; i < aces; i += 1) {
        total += 11;
    }

    while (total > 21 && aces > 0) {
        total -= 10;
        aces -= 1;
    }

    return total;
}

function formatMoney(value) {
    return `$${value.toFixed(2)}`;
}

function renderCard(card, hidden = false) {
    const element = document.createElement('div');
    element.className = 'card';

    const image = document.createElement('img');
    if (hidden) {
        element.classList.add('hidden');
        image.src = 'SVG-cards-1.3/card-back10118728.png';
        image.alt = 'Hidden card';
    } else {
        image.src = getCardFile(card);
        image.alt = `${card.value} of ${suitNames[card.suit]}`;
    }

    element.appendChild(image);
    return element;
}

function renderHands() {
    dealerCardsEl.innerHTML = '';
    playerCardsEl.innerHTML = '';

    const dealerHidden = state.roundActive && !state.roundOver;

    state.dealer.forEach((card, index) => {
        const hidden = dealerHidden && index === 0;
        dealerCardsEl.appendChild(renderCard(card, hidden));
    });

    state.player.forEach((card) => {
        playerCardsEl.appendChild(renderCard(card));
    });

    dealerScoreEl.textContent = dealerHidden ? '??' : getScore(state.dealer);
    playerScoreEl.textContent = getScore(state.player);
}

function setMessage(text) {
    messageEl.textContent = text;
}

function updateBetUI() {
    balanceEl.textContent = formatMoney(state.balance);
    betEl.textContent = formatMoney(state.currentBet);

    const chipButtons = chipButtonsEl.querySelectorAll('.chip');
    chipButtons.forEach((button) => {
        button.disabled = state.roundActive || state.balance <= 0;
    });

    dealBtn.disabled = state.roundActive || state.currentBet <= 0 || state.balance <= 0;
    hitBtn.disabled = !state.roundActive;
    standBtn.disabled = !state.roundActive;
}

function updateChipActiveState() {
    const buttons = chipButtonsEl.querySelectorAll('.chip');
    buttons.forEach((button) => {
        const value = Number(button.dataset.value);
        button.classList.toggle('active', state.currentBet === value);
    });
}

function resetBoard(forceNewGame = false) {
    state.deck = shuffle(createDeck());
    state.player = [];
    state.dealer = [];
    state.roundActive = false;
    state.roundOver = true;
    state.currentBet = 0;
    
    if (forceNewGame || state.balance <= 0) {
        state.balance = 1000;
    }

    renderHands();
    setMessage('Select chips to set your bet, then press Deal.');
    updateBetUI();
    updateChipActiveState();
}

function endRound(resultText, soundType) {
    state.roundActive = false;
    state.roundOver = true;
    renderHands();
    setMessage(resultText);
    updateBetUI();
    updateChipActiveState();
    playSound(soundType);
}


function showConfetti() {
const containerId = 'confetti-container';
let container = document.getElementById(containerId);
if (!container) {
container = document.createElement('div');
container.id = containerId;
container.style.position = 'fixed';
container.style.top = '0';
container.style.left = '0';
container.style.width = '100%';
container.style.height = '100%';
container.style.pointerEvents = 'none';
container.style.overflow = 'hidden';
container.style.zIndex = '9999';
document.body.appendChild(container);
}

const colors = ['#ff3b5c', '#ffb238', '#2dd4bf', '#3b82f6', '#a855f7', '#ec4899'];  
const count = 80;  

for (let i = 0; i < count; i++) {  
    const piece = document.createElement('div');  
    piece.className = 'confetti-piece';  
    const left = Math.random() * 100;  
    const width = Math.random() * 8 + 6;  
    const height = Math.random() * 18 + 8;  
    const color = colors[Math.floor(Math.random() * colors.length)];  
    const delay = Math.random() * 500; // spread it out more  
    const duration = Math.random() * 3000 + 4000; // 4s to 7s fall time  
    const rotate = Math.random() * 360;  
    const sway = Math.random() * 100 - 50; // side-to-side drift  

    piece.style.position = 'absolute';  
    piece.style.top = '-20px';  
    piece.style.left = `${left}%`;  
    piece.style.width = `${width}px`;  
    piece.style.height = `${height}px`;  
    piece.style.backgroundColor = color;  
    piece.style.opacity = '0.95';  
    piece.style.setProperty('--sway', `${sway}px`);  
    piece.style.transform = `rotate(${rotate}deg)`;  
    piece.style.animationDelay = `${delay}ms`;  
    piece.style.animationDuration = `${duration}ms`;  
    piece.style.animationName = 'confetti-fall';  
    piece.style.animationTimingFunction = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';  
    piece.style.animationFillMode = 'forwards';  

    container.appendChild(piece);  
    setTimeout(() => piece.remove(), duration + delay + 200);  
}  

setTimeout(() => {  
    if (container && container.children.length === 0) container.remove();  
}, 8000);

}




function compareHands() {
    const playerScore = getScore(state.player);
    const dealerScore = getScore(state.dealer);

    if (dealerScore > 21) {
        return { text: 'Dealer busted! You win.', outcome: 'win' };
    }

    if (playerScore > dealerScore) {
        return { text: 'You win!', outcome: 'win' };
    }

    if (playerScore < dealerScore) {
        return { text: 'Dealer wins.', outcome: 'lose' };
    }

    return { text: 'Push. It is a tie.', outcome: 'push' };
}

function payOut(outcome) {
    const bet = state.currentBet;
    if (outcome === 'win') {
        if (getScore(state.player) === 21 && state.player.length === 2) {
            state.balance += bet * 2.5;
        } else {
            state.balance += bet * 2;
        }
    } else if (outcome === 'push') {
        state.balance += bet;
    }
}

function finalizeRound(outcomeData) {
    payOut(outcomeData.outcome);
    const bet = state.currentBet;
    state.currentBet = 0;
    const becomingGameOver = state.balance <= 0;
    const fullMessage = becomingGameOver
        ? `${outcomeData.text} Game over. Reset to play again.`
        : outcomeData.text;

    endRound(fullMessage, becomingGameOver ? 'gameover' : outcomeData.outcome === 'win' ? 'win' : outcomeData.outcome === 'lose' ? 'lose' : 'tie');
    updateResetButton();
}

function dealerPlay() {
    while (getScore(state.dealer) < 17) {
        state.dealer.push(state.deck.pop());
    }

    renderHands();
    finalizeRound(compareHands());
}

function dealRound() {
    if (state.balance <= 0) {
        endRound('No bankroll left. Reset to play again.', 'gameover');
        return;
    }

    if (state.currentBet <= 0) {
        setMessage('Please place a bet before dealing.');
        return;
    }

    if (state.deck.length < 15) {
        state.deck = shuffle(createDeck());
        setMessage('Deck reshuffled before this deal.');
    }

    state.balance -= state.currentBet;
    state.player = [state.deck.pop(), state.deck.pop()];
    state.dealer = [state.deck.pop(), state.deck.pop()];
    state.roundActive = true;
    state.roundOver = false;

    renderHands();
    updateBetUI();

    const playerScore = getScore(state.player);
    const dealerScore = getScore(state.dealer);

    if (playerScore === 21 && dealerScore === 21) {
        finalizeRound({ text: 'Both have blackjack. Push.', outcome: 'push' });
        return;
    }

    if (playerScore === 21) {
        finalizeRound({ text: 'Blackjack! You win!', outcome: 'win' });
        playSound('blackjack');
        showConfetti();
        return;
    }

    if (dealerScore === 21) {
        renderHands();
        finalizeRound({ text: 'Dealer has blackjack. You lose.', outcome: 'lose' });
        return;
    }

    setMessage('Choose Hit or Stand.');
}

function hit() {
    if (!state.roundActive) {
        return;
    }

    state.player.push(state.deck.pop());
    renderHands();

    const playerScore = getScore(state.player);
    if (playerScore > 21) {
        finalizeRound({ text: 'You busted. Dealer wins.', outcome: 'lose' });
    } else if (playerScore === 21) {
        setMessage('21! Stand or continue with caution.');
    }
}

function stand() {
    if (!state.roundActive) {
        return;
    }

    state.roundActive = false;
    renderHands();
    dealerPlay();
}

function setBet(amount) {
    if (state.roundActive || state.balance <= 0) {
        return;
    }

    if (amount === 'clear') {
        state.currentBet = 0;
        playSound('chip');
        setMessage('Bet cleared. Select chips to set your bet, then press Deal.');
        updateBetUI();
        updateChipActiveState();
        return;
    }

    if (state.currentBet + amount > state.balance) {
        setMessage('Not enough bankroll to add that chip.');
        return;
    }

    state.currentBet += amount;
    playSound('chip');
    setMessage(`Bet set to ${formatMoney(state.currentBet)}. Press Deal to play.`);
    updateBetUI();
    updateChipActiveState();
}

chipButtonsEl.addEventListener('click', (event) => {
    const button = event.target.closest('.chip');
    if (!button) return;
    const value = button.dataset.value;
    if (value === 'clear') {
        setBet('clear');
    } else {
        setBet(Number(value));
    }
});

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
}

dealBtn.addEventListener('click', dealRound);
hitBtn.addEventListener('click', hit);
standBtn.addEventListener('click', stand);

resetBtn.addEventListener('click', () => {
    if (state.balance > 0) return; 
    resetBoard(true);
});

function updateResetButton() {
    if (state.balance > 0) {
        resetBtn.classList.add('disabled');
        resetBtn.disabled = true;
    } else {
        resetBtn.classList.remove('disabled');
        resetBtn.disabled = false;
    }
}

resetBoard();
updateResetButton();
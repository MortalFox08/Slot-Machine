// --- CONSTANTS (No change here) ---
const ROWS = 3;
const COLS = 3;

const SYMBOLS_COUNT = {
    "A": 2,
    "B": 3,
    "C": 4,
    "D": 5
};

const SYMBOL_VALUES = {
    "A": 5,
    "B": 4,
    "C": 3,
    "D": 2
};

// --- DOM ELEMENTS ---
const balanceDisplay = document.getElementById("balance-display");
const messageArea = document.getElementById("message-area");
const depositInput = document.getElementById("deposit-input");
const depositButton = document.getElementById("deposit-button");
const linesInput = document.getElementById("lines-input");
const betInput = document.getElementById("bet-input");
const spinButton = document.getElementById("spin-button");
const reelSymbols = document.querySelectorAll(".symbol");

// --- GAME STATE ---
let balance = 0;
spinButton.disabled = true;

// --- CORE GAME LOGIC (No changes here) ---

const spin = () => {
    const symbols = [];
    for (const [symbol, count] of Object.entries(SYMBOLS_COUNT)) {
        for (let i = 0; i < count; i++) {
            symbols.push(symbol);
        }
    }
    const reels = [];
    for (let i = 0; i < COLS; i++) {
        reels.push([]);
        const reelSymbols = [...symbols];
        for (let j = 0; j < ROWS; j++) {
            const randomIndex = Math.floor(Math.random() * reelSymbols.length);
            reels[i].push(reelSymbols[randomIndex]);
            reelSymbols.splice(randomIndex, 1);
        }
    }
    return reels;
};

const transpose = (reels) => {
    const rows = [];
    for (let i = 0; i < ROWS; i++) {
        rows.push([]);
        for (let j = 0; j < COLS; j++) {
            rows[i].push(reels[j][i]);
        }
    }
    return rows;
};

const getWinnings = (rows, bet, lines) => {
    let winnings = 0;
    for (let row = 0; row < lines; row++) {
        const symbols = rows[row];
        let allSame = true;
        for (const symbol of symbols) {
            if (symbol !== symbols[0]) {
                allSame = false;
                break;
            }
        }
        if (allSame) {
            winnings += bet * SYMBOL_VALUES[symbols[0]];
        }
    }
    return winnings;
};

// --- NEW FEATURE: CONFETTI ---
const triggerConfetti = () => {
    confetti({
        particleCount: 150, // The number of confetti pieces
        spread: 100,         // How far the confetti spreads
        origin: { y: 0.6 }   // Launch from the middle of the screen
    });
};

// --- DOM MANIPULATION & EVENT HANDLING ---

const updateBalanceDisplay = () => {
    balanceDisplay.textContent = `₹${balance}`;
};

const printRows = (rows) => {
    reelSymbols.forEach((symbolDiv, index) => {
        const row = Math.floor(index / COLS);
        const col = index % COLS;
        symbolDiv.textContent = rows[row][col];
    });
};

const showMessage = (text, type = "") => {
    messageArea.textContent = text;
    messageArea.className = 'message'; // Reset classes
    if (type) {
        messageArea.classList.add(type);
    }
};

depositButton.addEventListener("click", () => {
    const depositAmount = parseFloat(depositInput.value);

    if (isNaN(depositAmount) || depositAmount <= 0) {
        showMessage("Invalid deposit amount.", "error");
    } else {
        balance += depositAmount;
        updateBalanceDisplay();
        showMessage("Deposit successful!", "success");
        spinButton.disabled = false;
        depositInput.value = "";
    }
});

spinButton.addEventListener("click", () => {
    const numberOfLines = parseInt(linesInput.value);
    const bet = parseInt(betInput.value);
    const totalBet = bet * numberOfLines;

    if (totalBet > balance) {
        showMessage("Not enough balance for this bet.", "error");
        return;
    }
    if (isNaN(numberOfLines) || numberOfLines <= 0 || numberOfLines > 3 || isNaN(bet) || bet <= 0) {
        showMessage("Invalid lines or bet amount.", "error");
        return;
    }

    balance -= totalBet;
    updateBalanceDisplay();

    const reels = spin();
    const rows = transpose(reels);
    printRows(rows);

    const winnings = getWinnings(rows, bet, numberOfLines);
    balance += winnings;
    updateBalanceDisplay();

    if (winnings > 0) {
        showMessage(`You won ₹${winnings}!`, "success");
        // CHANGED: Added a 300ms delay before triggering the confetti
        setTimeout(triggerConfetti, 300);
    } else {
        showMessage("No win this time. Spin again!");
    }

    if (balance <= 0) {
        showMessage("You ran out of money! Please deposit to play again.", "error");
        spinButton.disabled = true;
    }
});
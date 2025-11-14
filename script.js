// script.js

// Game state
let gameState = [];
let selectedPiece = null;
let currentPlayer = 'white';
let gameOver = false;
let isFirstMove = true;

// DOM elements
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const whiteScoreElement = document.getElementById('white-score');
const blackScoreElement = document.getElementById('black-score');
const resetBtn = document.getElementById('reset-btn');
const difficultySlider = document.getElementById('difficulty');
const difficultyValue = document.getElementById('difficultyValue');

// Create initial chess board
function createInitialBoard() {
    const board = Array(8).fill().map(() => Array(8).fill(null));

    // Pawns
    for (let i = 0; i < 8; i++) {
        board[1][i] = { type: 'pawn', color: 'black', hasMoved: false };
        board[6][i] = { type: 'pawn', color: 'white', hasMoved: false };
    }

    // Other pieces
    const pieces = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    for (let i = 0; i < 8; i++) {
        board[0][i] = { type: pieces[i], color: 'black', hasMoved: false };
        board[7][i] = { type: pieces[i], color: 'white', hasMoved: false };
    }

    return board;
}

// Render the board
function renderBoard() {
    boardElement.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
            square.dataset.row = row;
            square.dataset.col = col;

            const piece = gameState[row][col];
            if (piece) {
                const pieceEl = document.createElement('div');
                pieceEl.className = 'piece';
                pieceEl.textContent = getPieceSymbol(piece);
                pieceEl.style.color = piece.color === 'white' ? '#fff' : '#000';
                square.appendChild(pieceEl);
            }

            const handleInteraction = (e) => {
                e.preventDefault();
                handleSquareClick(row, col);
            };

            square.addEventListener('click', handleInteraction);
            square.addEventListener('touchend', handleInteraction, { passive: true });
            square.addEventListener('contextmenu', (e) => e.preventDefault());

            boardElement.appendChild(square);
        }
    }
    updateStatus();
}

// Event listeners
resetBtn.addEventListener('click', resetGame);
difficultySlider.addEventListener('input', () => {
    difficultyValue.textContent = difficultySlider.value;
});

// Initialize game
function initGame() {
    gameState = createInitialBoard();
    currentPlayer = 'white';
    isFirstMove = true;
    renderBoard();
    updateStatus();
}

// Clear selection
function clearSelection() {
    document.querySelectorAll('.square').forEach(sq => sq.classList.remove('selected', 'possible-move'));
    selectedPiece = null;
}

// Get piece symbol
function getPieceSymbol(piece) {
    const black = { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟️' };
    const white = { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' };
    return piece.color === 'black' ? black[piece.type] : white[piece.type];
}

// Update status
function updateStatus() {
    if (isGameOver()) {
        const winner = currentPlayer === 'white' ? 'Black' : 'White';
        statusElement.textContent = isKingInCheck(currentPlayer) ? `Checkmate! ${winner} wins!` : 'Stalemate!';
    } else {
        statusElement.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s turn`;
    }
}

// Reset game
function resetGame() {
    gameState = createInitialBoard();
    currentPlayer = 'white';
    isFirstMove = true;
    clearSelection();
    renderBoard();
    updateStatus();
    const diffContainer = document.querySelector('.difficulty-container');
    if (diffContainer) diffContainer.classList.remove('hidden');
}

// Prevent mobile zoom / pull-to-refresh
window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1 || e.target.classList.contains('square') || e.target.closest('.square')) {
        e.preventDefault();
    }
}, { passive: false });

let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) event.preventDefault();
    lastTouchEnd = now;
}, false);

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initGame();
});

// script.js

// ---------------------
// Game State
// ---------------------
let gameState = [];
let selectedPiece = null;
let currentPlayer = 'white';
let isFirstMove = true;

// ---------------------
// DOM Elements
// ---------------------
let boardElement;
let statusElement;
let whiteScoreElement;
let blackScoreElement;
let resetBtn;
let difficultySlider;
let difficultyValue;

// ---------------------
// Create Initial Board
// ---------------------
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

// ---------------------
// Render Board
// ---------------------
function renderBoard() {
    if (!boardElement) return;

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

            // Add click/touch listeners
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

// ---------------------
// Update Status
// ---------------------
function updateStatus() {
    if (!statusElement) return;

    if (isGameOver()) {
        const winner = currentPlayer === 'white' ? 'Black' : 'White';
        statusElement.textContent = isKingInCheck(currentPlayer) ? `Checkmate! ${winner} wins!` : 'Stalemate!';
    } else {
        statusElement.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s turn`;
    }
}

// ---------------------
// Clear Selection
// ---------------------
function clearSelection() {
    document.querySelectorAll('.square').forEach(sq => sq.classList.remove('selected', 'possible-move'));
    selectedPiece = null;
}

// ---------------------
// Piece Symbols
// ---------------------
function getPieceSymbol(piece) {
    const black = { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟️' };
    const white = { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' };
    return piece.color === 'black' ? black[piece.type] : white[piece.type];
}

// ---------------------
// Reset Game
// ---------------------
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

// ---------------------
// Handle Square Click
// ---------------------
function handleSquareClick(row, col) {
    const piece = gameState[row][col];

    // Select piece
    if (piece && piece.color === currentPlayer) {
        clearSelection();
        selectedPiece = { row, col, piece };
        highlightSelected(row, col);
        return;
    }

    // Move piece if a piece is selected
    if (selectedPiece) {
        const from = selectedPiece;
        // Simple move logic (replace with your full rules)
        gameState[row][col] = from.piece;
        gameState[from.row][from.col] = null;
        clearSelection();
        selectedPiece = null;

        // Switch player
        currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
        renderBoard();
    }
}

// Highlight selected piece
function highlightSelected(row, col) {
    const square = document.querySelector(`.square[data-row='${row}'][data-col='${col}']`);
    if (square) square.classList.add('selected');
}

// ---------------------
// Game Logic Placeholders
// ---------------------
function isGameOver() {
    // Placeholder for real check/checkmate/stalemate logic
    return false;
}
function isKingInCheck(player) {
    // Placeholder for real check logic
    return false;
}

// ---------------------
// Responsive Board
// ---------------------
function resizeBoard() {
    if (!boardElement) return;
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.9; // 90% of smaller dimension
    boardElement.style.width = size + 'px';
    boardElement.style.height = size + 'px';
}

// ---------------------
// Mobile Touch Fix
// ---------------------
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

// ---------------------
// DOM Ready Initialization
// ---------------------
document.addEventListener('DOMContentLoaded', () => {
    // Query DOM elements safely
    boardElement = document.getElementById('board');
    statusElement = document.getElementById('status');
    whiteScoreElement = document.getElementById('white-score');
    blackScoreElement = document.getElementById('black-score');
    resetBtn = document.getElementById('reset-btn');
    difficultySlider = document.getElementById('difficulty');
    difficultyValue = document.getElementById('difficultyValue');

    // Event listeners with null checks
    if (resetBtn) resetBtn.addEventListener('click', resetGame);
    if (difficultySlider && difficultyValue) {
        difficultySlider.addEventListener('input', () => {
            difficultyValue.textContent = difficultySlider.value;
        });
    }

    // Responsive board
    resizeBoard();
    window.addEventListener('resize', resizeBoard);

    // Start game
    resetGame();
});


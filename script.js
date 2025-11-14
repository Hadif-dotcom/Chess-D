// ---------------------
// Game State
// ---------------------
let gameState = [];
let selectedPiece = null;
let currentPlayer = 'white';
let isFirstMove = true;

// DOM elements
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const difficultySlider = document.getElementById('difficulty');
const difficultyValue = document.getElementById('difficultyValue');

// ---------------------
// Chess Setup
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
// Rendering Board
// ---------------------
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
                pieceEl.style.color = piece.color === 'white' ? '#222' : '#eee';
                square.appendChild(pieceEl);
            }

            square.addEventListener('click', () => handleSquareClick(row, col));
            square.addEventListener('contextmenu', e => e.preventDefault());
            boardElement.appendChild(square);
        }
    }
    updateStatus();
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
// Handle Clicks
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
        gameState[row][col] = from.piece;
        gameState[from.row][from.col] = null;
        clearSelection();
        selectedPiece = null;

        // Switch to AI
        currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
        renderBoard();

        // AI move after a short delay based on difficulty
        setTimeout(() => {
            aiMove();
            currentPlayer = 'white';
            renderBoard();
        }, difficultySlider.value * 500); // 1-5 difficulty
    }
}

// ---------------------
// Highlight Selection
// ---------------------
function highlightSelected(row, col) {
    const square = document.querySelector(`.square[data-row='${row}'][data-col='${col}']`);
    if (square) square.classList.add('selected');
}

// ---------------------
// Clear Selection
// ---------------------
function clearSelection() {
    document.querySelectorAll('.square').forEach(sq => sq.classList.remove('selected'));
    selectedPiece = null;
}

// ---------------------
// AI Logic (Random Move)
// ---------------------
function aiMove() {
    // Collect all black pieces
    const blackPieces = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (gameState[r][c] && gameState[r][c].color === 'black') {
                blackPieces.push({ row: r, col: c, piece: gameState[r][c] });
            }
        }
    }

    if (blackPieces.length === 0) return;

    // Random piece and move (simple, no rules)
    const randIndex = Math.floor(Math.random() * blackPieces.length);
    const chosen = blackPieces[randIndex];

    const possibleMoves = [
        { r: chosen.row + 1, c: chosen.col },
        { r: chosen.row - 1, c: chosen.col },
        { r: chosen.row, c: chosen.col + 1 },
        { r: chosen.row, c: chosen.col - 1 }
    ].filter(pos => pos.r >= 0 && pos.r < 8 && pos.c >= 0 && pos.c < 8);

    if (possibleMoves.length === 0) return;

    const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    gameState[move.r][move.c] = chosen.piece;
    gameState[chosen.row][chosen.col] = null;
}

// ---------------------
// Update Status
// ---------------------
function updateStatus() {
    if (isGameOver()) {
        statusElement.textContent = 'Game Over!';
    } else {
        statusElement.textContent = currentPlayer === 'white' ? 'Your turn' : 'AI thinking...';
    }
}

// ---------------------
// Game Over Check (Simplified)
// ---------------------
function isGameOver() {
    let whiteKing = false, blackKing = false;
    for (let row of gameState) {
        for (let cell of row) {
            if (cell?.type === 'king') {
                if (cell.color === 'white') whiteKing = true;
                if (cell.color === 'black') blackKing = true;
            }
        }
    }
    return !whiteKing || !blackKing;
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
}

// ---------------------
// Event Listeners
// ---------------------
resetBtn.addEventListener('click', resetGame);
difficultySlider.addEventListener('input', () => {
    difficultyValue.textContent = difficultySlider.value;
});

// ---------------------
// Initialize
// ---------------------
resetGame();

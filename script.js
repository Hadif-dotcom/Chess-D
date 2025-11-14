// ---------------------
// Game State
// ---------------------
let gameState = [];
let selectedPiece = null;
let currentPlayer = 'white';
let isFirstMove = true;

// DOM Elements
let boardElement;
let statusElement;
let resetBtn;
let difficultySlider;
let difficultyValue;

// ---------------------
// Initialize Board
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

            square.addEventListener('click', () => handleSquareClick(row, col));
            boardElement.appendChild(square);
        }
    }

    highlightSelected();
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
// Clear Selection
// ---------------------
function clearSelection() {
    selectedPiece = null;
}

// ---------------------
// Highlight Selected
// ---------------------
function highlightSelected() {
    document.querySelectorAll('.square').forEach(sq => sq.classList.remove('selected'));
    if (selectedPiece) {
        const square = document.querySelector(`.square[data-row='${selectedPiece.row}'][data-col='${selectedPiece.col}']`);
        if (square) square.classList.add('selected');
    }
}

// ---------------------
// Handle Clicks
// ---------------------
function handleSquareClick(row, col) {
    const piece = gameState[row][col];

    // Select piece
    if (piece && piece.color === currentPlayer) {
        selectedPiece = { row, col, piece };
        renderBoard();
        return;
    }

    // Move selected piece
    if (selectedPiece) {
        const validMoves = getValidMoves(selectedPiece.row, selectedPiece.col, selectedPiece.piece);
        if (validMoves.some(m => m.row === row && m.col === col)) {
            movePiece(selectedPiece.row, selectedPiece.col, row, col);
            selectedPiece = null;
            currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
            renderBoard();

            if (!isGameOver()) {
                setTimeout(() => aiMove(), 300); // AI plays after 0.3s
            }
        }
    }
}

// ---------------------
// Move Pieces
// ---------------------
function movePiece(fromRow, fromCol, toRow, toCol) {
    const piece = gameState[fromRow][fromCol];
    piece.hasMoved = true;
    gameState[toRow][toCol] = piece;
    gameState[fromRow][fromCol] = null;
}

// ---------------------
// Pawn Moves
// ---------------------
function getPawnMoves(row, col, piece, board) {
    const moves = [];
    const dir = piece.color === 'white' ? -1 : 1;

    // Forward
    if (!board[row + dir]?.[col]) moves.push({ row: row + dir, col });

    // Double step
    if (!piece.hasMoved && !board[row + dir]?.[col] && !board[row + 2*dir]?.[col])
        moves.push({ row: row + 2*dir, col });

    // Captures
    for (let dc of [-1, 1]) {
        const target = board[row + dir]?.[col + dc];
        if (target && target.color !== piece.color && target.type !== 'king') {
            moves.push({ row: row + dir, col: col + dc });
        }
    }

    return moves;
}

// ---------------------
// Piece Moves
// ---------------------
function getValidMoves(row, col, piece) {
    if (!piece) return [];
    const moves = [];

    if (piece.type === 'pawn') {
        return getPawnMoves(row, col, piece, gameState);
    }

    // Other pieces simplified for brevity (you can expand)
    // Rook example
    if (piece.type === 'rook') {
        const directions = [[1,0], [-1,0], [0,1], [0,-1]];
        directions.forEach(([dr, dc]) => {
            let r = row + dr;
            let c = col + dc;
            while (r >= 0 && r < 8 && c >=0 && c < 8) {
                if (!gameState[r][c]) {
                    moves.push({row: r, col: c});
                } else {
                    if (gameState[r][c].color !== piece.color && gameState[r][c].type !== 'king')
                        moves.push({row: r, col: c});
                    break;
                }
                r += dr;
                c += dc;
            }
        });
    }

    return moves;
}

// ---------------------
// Game Over
// ---------------------
function isGameOver() {
    // Check if either king is missing
    const kings = gameState.flat().filter(p => p && p.type === 'king');
    if (kings.length < 2) {
        alert(kings[0].color + " wins!");
        return true;
    }
    return false;
}

// ---------------------
// Update Status
// ---------------------
function updateStatus() {
    if (!isGameOver()) {
        statusElement.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s turn`;
    }
}

// ---------------------
// AI Move (Simple Random)
// ---------------------
function aiMove() {
    if (currentPlayer !== 'black') return;

    const allMoves = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = gameState[r][c];
            if (piece && piece.color === 'black') {
                const moves = getValidMoves(r, c, piece);
                moves.forEach(m => allMoves.push({ from: {r,c}, to: m }));
            }
        }
    }

    if (allMoves.length === 0) return;

    // Choose random move for now (difficulty slider can adjust AI later)
    const move = allMoves[Math.floor(Math.random() * allMoves.length)];
    movePiece(move.from.r, move.from.c, move.to.row, move.to.col);
    currentPlayer = 'white';
    renderBoard();
}

// ---------------------
// Reset Game
// ---------------------
function resetGame() {
    gameState = createInitialBoard();
    currentPlayer = 'white';
    isFirstMove = true;
    selectedPiece = null;
    renderBoard();
}

// ---------------------
// DOM Ready
// ---------------------
document.addEventListener('DOMContentLoaded', () => {
    boardElement = document.getElementById('board');
    statusElement = document.getElementById('status');
    resetBtn = document.getElementById('resetBtn');
    difficultySlider = document.getElementById('difficulty');
    difficultyValue = document.getElementById('difficultyValue');

    resetBtn.addEventListener('click', resetGame);
    difficultySlider.addEventListener('input', () => {
        difficultyValue.textContent = difficultySlider.value;
    });

    resetGame();
});


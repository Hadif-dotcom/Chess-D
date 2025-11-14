// ---------------------
// Game State
// ---------------------
let gameState = [];
let selectedPiece = null;
let currentPlayer = 'white';
let gameOver = false;

// ---------------------
// DOM Elements
// ---------------------
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const difficultySlider = document.getElementById('difficulty');
const difficultyValue = document.getElementById('difficultyValue');

// ---------------------
// Initialize board
// ---------------------
function createInitialBoard() {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));

    // Pawns
    for (let i = 0; i < 8; i++) {
        board[1][i] = { type: 'pawn', color: 'black', hasMoved: false };
        board[6][i] = { type: 'pawn', color: 'white', hasMoved: false };
    }

    // Other pieces
    const pieces = ['rook','knight','bishop','queen','king','bishop','knight','rook'];
    for (let i = 0; i < 8; i++) {
        board[0][i] = { type: pieces[i], color: 'black', hasMoved: false };
        board[7][i] = { type: pieces[i], color: 'white', hasMoved: false };
    }

    return board;
}

// ---------------------
// Piece symbols
// ---------------------
function getPieceSymbol(piece) {
    const black = { king:'♚', queen:'♛', rook:'♜', bishop:'♝', knight:'♞', pawn:'♟️' };
    const white = { king:'♔', queen:'♕', rook:'♖', bishop:'♗', knight:'♘', pawn:'♙' };
    return piece.color === 'black' ? black[piece.type] : white[piece.type];
}

// ---------------------
// Render board
// ---------------------
function renderBoard() {
    boardElement.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `square ${(row+col)%2===0?'white':'black'}`;
            square.dataset.row = row;
            square.dataset.col = col;

            const piece = gameState[row][col];
            if (piece) {
                const pieceEl = document.createElement('div');
                pieceEl.className = 'piece';
                pieceEl.textContent = getPieceSymbol(piece);
                pieceEl.style.color = piece.color === 'white' ? '#fff' : '#000';
                pieceEl.style.textShadow = '0 0 3px rgba(0,0,0,0.8)'; // outline for visibility
                square.appendChild(pieceEl);
            }

            square.addEventListener('click', () => handleSquareClick(row,col));
            square.addEventListener('contextmenu', e => e.preventDefault());

            boardElement.appendChild(square);
        }
    }
    updateStatus();
}

// ---------------------
// Clear selection
// ---------------------
function clearSelection() {
    document.querySelectorAll('.square').forEach(sq => sq.classList.remove('selected','valid-move'));
    selectedPiece = null;
}

// ---------------------
// Update status
// ---------------------
function updateStatus(msg='') {
    if (msg) {
        statusElement.textContent = msg;
        return;
    }
    statusElement.textContent = gameOver ? 'Game Over' : `${currentPlayer.charAt(0).toUpperCase()+currentPlayer.slice(1)}'s turn`;
}

// ---------------------
// Handle square click
// ---------------------
function handleSquareClick(row,col) {
    if (gameOver) return;

    const piece = gameState[row][col];

    // Select a piece
    if (piece && piece.color === currentPlayer) {
        clearSelection();
        selectedPiece = { row, col, piece };
        document.querySelector(`.square[data-row='${row}'][data-col='${col}']`).classList.add('selected');

        // Highlight possible moves (very simple, all adjacent for now)
        highlightMoves(row,col);
        return;
    }

    // Move selected piece
    if (selectedPiece) {
        const from = selectedPiece;
        // Simple rules: allow move to empty or capture
        const target = gameState[row][col];
        if (!target || target.color !== currentPlayer) {
            gameState[row][col] = from.piece;
            gameState[from.row][from.col] = null;
            clearSelection();
            // Switch player
            currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
            renderBoard();

            // AI move if black
            if (currentPlayer === 'black') setTimeout(aiMove, 300);
        }
    }
}

// ---------------------
// Highlight moves (simplified)
// ---------------------
function highlightMoves(row,col) {
    const directions = [
        [1,0],[-1,0],[0,1],[0,-1],
        [1,1],[1,-1],[-1,1],[-1,-1]
    ];
    directions.forEach(([dr,dc]) => {
        const r = row+dr, c=col+dc;
        if (r>=0 && r<8 && c>=0 && c<8) {
            const sq = document.querySelector(`.square[data-row='${r}'][data-col='${c}']`);
            if (sq) sq.classList.add('valid-move');
        }
    });
}

// ---------------------
// AI move (random)
// ---------------------
function aiMove() {
    if (gameOver) return;

    // Collect all black pieces
    const moves = [];
    for (let r=0;r<8;r++) {
        for (let c=0;c<8;c++) {
            const p = gameState[r][c];
            if (p && p.color==='black') {
                // Try all adjacent squares
                const dirs = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
                dirs.forEach(([dr,dc])=>{
                    const nr=r+dr,nc=c+dc;
                    if(nr>=0 && nr<8 && nc>=0 && nc<8) {
                        const target = gameState[nr][nc];
                        if (!target || target.color==='white') moves.push({from:{r,c},to:{r:nr,c:nc}});
                    }
                });
            }
        }
    }

    if (moves.length===0) {
        updateStatus('Stalemate!');
        gameOver=true;
        return;
    }

    // Choose move based on difficulty slider
    const difficulty = parseInt(difficultySlider.value);
    const move = moves[Math.floor(Math.random()*moves.length)];
    gameState[move.to.r][move.to.c] = gameState[move.from.r][move.from.c];
    gameState[move.from.r][move.from.c] = null;

    currentPlayer='white';
    renderBoard();
}

// ---------------------
// Reset game
// ---------------------
function resetGame() {
    gameState = createInitialBoard();
    selectedPiece = null;
    currentPlayer = 'white';
    gameOver = false;
    renderBoard();
    updateStatus();
}

// ---------------------
// Slider update
// ---------------------
difficultySlider.addEventListener('input', ()=> {
    difficultyValue.textContent = difficultySlider.value;
});

// ---------------------
// Initialize
// ---------------------
document.addEventListener('DOMContentLoaded', ()=>{
    resetGame();
});

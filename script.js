// ---------------------
// Constants
// ---------------------
const HUMAN_COLOR = 'white';
const AI_COLOR = 'black';

// ---------------------
// Game State
// ---------------------
let gameState = [];
let selectedPiece = null;
let currentPlayer = HUMAN_COLOR;
let isFirstMove = true;

// ---------------------
// DOM Elements
// ---------------------
let boardElement;
let statusElement;
let resetBtn;
let difficultySlider;
let difficultyValue;

// ---------------------
// Initialize board
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
// Render board
// ---------------------
function renderBoard() {
    boardElement.innerHTML = '';

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const square = document.createElement('div');
            square.className = `square ${(r + c) % 2 === 0 ? 'white' : 'black'}`;
            square.dataset.row = r;
            square.dataset.col = c;

            const piece = gameState[r][c];
            if (piece) {
                const pieceEl = document.createElement('div');
                pieceEl.className = 'piece';
                pieceEl.textContent = getPieceSymbol(piece);
                pieceEl.style.color = piece.color === 'white' ? '#fff' : '#000';
                square.appendChild(pieceEl);
            }

            square.addEventListener('click', (e) => handleSquareClick(r, c));
            square.addEventListener('contextmenu', (e) => e.preventDefault());

            boardElement.appendChild(square);
        }
    }
    updateStatus();
}

// ---------------------
// Piece symbols
// ---------------------
function getPieceSymbol(piece) {
    const symbols = {
        black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟️' },
        white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' }
    };
    return symbols[piece.color][piece.type];
}

// ---------------------
// Clear selection
// ---------------------
function clearSelection() {
    document.querySelectorAll('.square').forEach(sq => sq.classList.remove('selected'));
    selectedPiece = null;
}

// ---------------------
// Update status
// ---------------------
function updateStatus() {
    if (isGameOver()) {
        const winner = currentPlayer === HUMAN_COLOR ? 'Black (AI)' : 'White (You)';
        statusElement.textContent = isKingInCheck(currentPlayer) ? `Checkmate! ${winner} wins!` : 'Stalemate!';
    } else {
        statusElement.textContent = `${currentPlayer === HUMAN_COLOR ? 'Your turn' : 'AI is thinking...'}`;
    }
}

// ---------------------
// Reset game
// ---------------------
function resetGame() {
    gameState = createInitialBoard();
    currentPlayer = HUMAN_COLOR;
    isFirstMove = true;
    clearSelection();
    renderBoard();
    updateStatus();
}

// ---------------------
// Handle click
// ---------------------
function handleSquareClick(r, c) {
    const piece = gameState[r][c];

    // Select your own piece
    if (piece && piece.color === HUMAN_COLOR) {
        selectedPiece = { row: r, col: c, piece };
        highlightSelected(r, c);
        return;
    }

    // Move selected piece
    if (selectedPiece) {
        const from = selectedPiece;
        if (isValidMove(from, { row: r, col: c })) {
            movePiece(from, { row: r, col: c });
            clearSelection();
            renderBoard();

            // Switch to AI
            currentPlayer = AI_COLOR;
            setTimeout(aiMove, 300);
        }
    }
}

// ---------------------
// Highlight selected
// ---------------------
function highlightSelected(r, c) {
    clearSelection();
    const square = document.querySelector(`.square[data-row='${r}'][data-col='${c}']`);
    if (square) square.classList.add('selected');
}

// ---------------------
// Move validation
// ---------------------
function isValidMove(from, to) {
    const piece = from.piece;
    const dr = to.row - from.row;
    const dc = to.col - from.col;
    const target = gameState[to.row][to.col];

    if (target && target.color === piece.color) return false; // cannot capture own

    switch(piece.type) {
        case 'pawn':
            const dir = piece.color === 'white' ? -1 : 1;
            // straight move
            if(dc === 0 && dr === dir && !target) return true;
            if(dc === 0 && dr === 2*dir && !piece.hasMoved && !target && !gameState[from.row + dir][from.col]) return true;
            // diagonal capture
            if(Math.abs(dc) === 1 && dr === dir && target && target.color !== piece.color) return true;
            return false;
        case 'rook':
            if(dr !== 0 && dc !==0) return false;
            return !isPathBlocked(from, to);
        case 'bishop':
            if(Math.abs(dr) !== Math.abs(dc)) return false;
            return !isPathBlocked(from, to);
        case 'queen':
            if(dr===0 || dc===0 || Math.abs(dr)===Math.abs(dc)) return !isPathBlocked(from,to);
            return false;
        case 'king':
            return Math.abs(dr)<=1 && Math.abs(dc)<=1;
        case 'knight':
            return (Math.abs(dr)===2 && Math.abs(dc)===1) || (Math.abs(dr)===1 && Math.abs(dc)===2);
        default:
            return false;
    }
}

// ---------------------
// Path blocked check
// ---------------------
function isPathBlocked(from, to) {
    const dr = Math.sign(to.row - from.row);
    const dc = Math.sign(to.col - from.col);
    let r = from.row + dr;
    let c = from.col + dc;

    while(r !== to.row || c !== to.col) {
        if(gameState[r][c]) return true;
        r += dr;
        c += dc;
    }
    return false;
}

// ---------------------
// Execute move
// ---------------------
function movePiece(from, to) {
    gameState[to.row][to.col] = from.piece;
    gameState[to.row][to.col].hasMoved = true;
    gameState[from.row][from.col] = null;
}

// ---------------------
// AI move (simple random)
– ---------------------
function aiMove() {
    const moves = [];

    for(let r=0;r<8;r++){
        for(let c=0;c<8;c++){
            const piece = gameState[r][c];
            if(piece && piece.color===AI_COLOR){
                for(let tr=0;tr<8;tr++){
                    for(let tc=0;tc<8;tc++){
                        if(isValidMove({row:r,col:c,piece}, {row:tr,col:tc})) moves.push({from:{row:r,col:c},to:{row:tr,col:tc}});
                    }
                }
            }
        }
    }

    if(moves.length>0){
        const difficulty = difficultySlider ? parseInt(difficultySlider.value) : 3;
        const move = moves[Math.floor(Math.random()*(moves.length/Math.max(1,6-difficulty)))];
        movePiece(move.from, move.to);
        currentPlayer = HUMAN_COLOR;
        renderBoard();
    }
}

// ---------------------
// Game over check
// ---------------------
function isGameOver() {
    // Simplified placeholder
    return false;
}
function isKingInCheck(player){
    return false;
}

// ---------------------
// Initialize DOM
// ---------------------
document.addEventListener('DOMContentLoaded', ()=>{
    boardElement = document.getElementById('board');
    statusElement = document.getElementById('status');
    resetBtn = document.getElementById('resetBtn');
    difficultySlider = document.getElementById('difficulty');
    difficultyValue = document.getElementById('difficultyValue');

    if(resetBtn) resetBtn.addEventListener('click', resetGame);
    if(difficultySlider && difficultyValue) difficultySlider.addEventListener('input',()=>{difficultyValue.textContent = difficultySlider.value;});

    resetGame();
});

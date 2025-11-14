// ======================
// Chess Game - Player vs AI
// ======================

// ---------------------
// Game State
// ---------------------
let board = [];
let selectedPiece = null;
let currentPlayer = 'w'; // Player is always white
let gameOver = false;

// ---------------------
// DOM Elements
// ---------------------
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn'); // matches HTML
const difficultySlider = document.getElementById('difficulty');
const difficultyValue = document.getElementById('difficultyValue');

// ---------------------
// Piece Symbols
// ---------------------
const symbols = {
    w: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
    b: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟️' }
};

// ---------------------
// Initialize Board
// ---------------------
function initBoard() {
    board = Array(8).fill(null).map(() => Array(8).fill(null));

    // Pawns
    for (let i = 0; i < 8; i++) {
        board[1][i] = { type: 'pawn', color: 'b', hasMoved: false };
        board[6][i] = { type: 'pawn', color: 'w', hasMoved: false };
    }

    // Other pieces
    const order = ['rook','knight','bishop','queen','king','bishop','knight','rook'];
    for (let i = 0; i < 8; i++) {
        board[0][i] = { type: order[i], color: 'b', hasMoved: false };
        board[7][i] = { type: order[i], color: 'w', hasMoved: false };
    }
}

// ---------------------
// Render Board
// ---------------------
function renderBoard() {
    boardEl.innerHTML = '';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const square = document.createElement('div');
            square.className = 'square ' + ((r+c)%2 === 0 ? 'white' : 'black');
            square.dataset.row = r;
            square.dataset.col = c;

            const piece = board[r][c];
            if (piece) {
                const el = document.createElement('div');
                el.className = 'piece';
                el.textContent = symbols[piece.color][piece.type];
                square.appendChild(el);
            }

            if (selectedPiece && selectedPiece.row === r && selectedPiece.col === c) {
                square.classList.add('selected');
            }

            const handleInteraction = (e) => {
                if(e.type === 'touchend') e.preventDefault();
                handleClick(r, c);
            }

            square.addEventListener('click', handleInteraction);
            square.addEventListener('touchend', handleInteraction, { passive: false });

            boardEl.appendChild(square);
        }
    }
}

// ---------------------
// Update Status
// ---------------------
function updateStatus(msg) {
    statusEl.textContent = msg || (gameOver ? "Game Over" : "Your Turn (White)");
}

// ---------------------
// Handle Click
// ---------------------
function handleClick(r, c) {
    if (gameOver) return;
    const piece = board[r][c];

    // Select white piece
    if (piece && piece.color === 'w') {
        selectedPiece = { row: r, col: c };
        renderBoard();
        highlightMoves(selectedPiece);
        return;
    }

    // Move selected piece
    if (selectedPiece) {
        const moves = getLegalMoves(selectedPiece.row, selectedPiece.col);
        if (moves.some(m => m[0] === r && m[1] === c)) {
            makeMove(selectedPiece.row, selectedPiece.col, r, c);
            selectedPiece = null;
            renderBoard();

            // AI move
            setTimeout(aiMove, 300);
        }
    }
}

// ---------------------
// Highlight Moves
// ---------------------
function highlightMoves(sel) {
    const moves = getLegalMoves(sel.row, sel.col);
    moves.forEach(([r, c]) => {
        const sq = boardEl.querySelector(`.square[data-row='${r}'][data-col='${c}']`);
        if (sq) sq.classList.add('possible-move');
    });
}

// ---------------------
// Make Move
// ---------------------
function makeMove(sr, sc, dr, dc) {
    const piece = board[sr][sc];
    // Pawn promotion
    if (piece.type === 'pawn' && (dr === 0 || dr === 7)) piece.type = 'queen';
    piece.hasMoved = true;
    board[dr][dc] = piece;
    board[sr][sc] = null;
}

// ---------------------
// Get Legal Moves
// ---------------------
function getLegalMoves(r, c) {
    const piece = board[r][c];
    if (!piece) return [];
    const moves = [];
    const dir = piece.color === 'w' ? -1 : 1;

    switch(piece.type) {
        case 'pawn':
            if (!board[r+dir]?.[c]) moves.push([r+dir, c]);
            if ((r === 6 && piece.color === 'w') || (r === 1 && piece.color === 'b')) {
                if (!board[r+dir*2]?.[c]) moves.push([r+dir*2, c]);
            }
            if (board[r+dir]?.[c-1] && board[r+dir][c-1].color !== piece.color) moves.push([r+dir, c-1]);
            if (board[r+dir]?.[c+1] && board[r+dir][c+1].color !== piece.color) moves.push([r+dir, c+1]);
            break;
        case 'rook': addLine(r,c,[[1,0],[-1,0],[0,1],[0,-1]],piece,moves); break;
        case 'bishop': addLine(r,c,[[1,1],[1,-1],[-1,1],[-1,-1]],piece,moves); break;
        case 'queen': addLine(r,c,[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]],piece,moves); break;
        case 'king':
            [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc])=>{
                const nr=r+dr,nc=c+dc;
                if(nr>=0&&nr<8&&nc>=0&&nc<8 && (!board[nr][nc] || board[nr][nc].color!==piece.color))
                    moves.push([nr,nc]);
            });
            break;
        case 'knight':
            [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]].forEach(([dr,dc])=>{
                const nr=r+dr,nc=c+dc;
                if(nr>=0&&nr<8&&nc>=0&&nc<8 && (!board[nr][nc] || board[nr][nc].color!==piece.color))
                    moves.push([nr,nc]);
            });
            break;
    }
    return moves;
}

function addLine(r,c,directions,piece,moves){
    directions.forEach(([dr,dc])=>{
        let nr=r+dr,nc=c+dc;
        while(nr>=0&&nr<8&&nc>=0&&nc<8){
            if(!board[nr][nc]) moves.push([nr,nc]);
            else{
                if(board[nr][nc].color!==piece.color) moves.push([nr,nc]);
                break;
            }
            nr+=dr; nc+=dc;
        }
    });
}

// ---------------------
// AI Move
// ---------------------
function aiMove() {
    const moves = [];
    for(let r=0;r<8;r++){
        for(let c=0;c<8;c++){
            const piece = board[r][c];
            if(piece && piece.color==='b'){
                getLegalMoves(r,c).forEach(([dr,dc])=>{
                    moves.push({sr:r,sc:c,dr,dc});
                });
            }
        }
    }
    if(moves.length===0){
        updateStatus("Game Over");
        gameOver=true;
        return;
    }
    const diff = parseInt(difficultySlider.value);
    moves.sort((a,b)=>{
        const captureA = board[a.dr][a.dc]?1:0;
        const captureB = board[b.dr][b.dc]?1:0;
        return (captureB-captureA)*diff + Math.random();
    });
    const move = moves[0];
    makeMove(move.sr, move.sc, move.dr, move.dc);
    renderBoard();
}

// ---------------------
// Event Listeners
// ---------------------
resetBtn.addEventListener('click', () => {
    initBoard();
    selectedPiece=null;
    gameOver=false;
    renderBoard();
    updateStatus();
});

difficultySlider.addEventListener('input', () => {
    difficultyValue.textContent = difficultySlider.value;
});

// ---------------------
// Start Game
// ---------------------
initBoard();
renderBoard();
updateStatus();


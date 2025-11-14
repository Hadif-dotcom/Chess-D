// ---------------------
// Game State
// ---------------------
let gameState = [];
let selectedPiece = null;
const HUMAN_COLOR = 'white';
const AI_COLOR = 'black';
let currentPlayer = HUMAN_COLOR;

// DOM Elements
let boardElement, statusElement, difficultySlider, difficultyValue, resetBtn;

// ---------------------
// Create Initial Board
// ---------------------
function createInitialBoard() {
    const board = Array(8).fill().map(() => Array(8).fill(null));

    // Pawns
    for (let i = 0; i < 8; i++) {
        board[1][i] = { type: 'pawn', color: AI_COLOR, hasMoved: false };
        board[6][i] = { type: 'pawn', color: HUMAN_COLOR, hasMoved: false };
    }

    // Other pieces
    const pieces = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    for (let i = 0; i < 8; i++) {
        board[0][i] = { type: pieces[i], color: AI_COLOR, hasMoved: false };
        board[7][i] = { type: pieces[i], color: HUMAN_COLOR, hasMoved: false };
    }

    return board;
}

// ---------------------
// Piece Symbols
// ---------------------
function getPieceSymbol(piece) {
    const black = { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟️' };
    const white = { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' };
    return piece.color === HUMAN_COLOR ? white[piece.type] : black[piece.type];
}

// ---------------------
// Render Board
// ---------------------
function renderBoard() {
    boardElement.innerHTML = '';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const square = document.createElement('div');
            square.className = `square ${(r+c)%2===0?'white':'black'}`;
            square.dataset.row = r;
            square.dataset.col = c;

            const piece = gameState[r][c];
            if(piece){
                const pieceEl = document.createElement('div');
                pieceEl.className = 'piece';
                pieceEl.textContent = getPieceSymbol(piece);
                pieceEl.style.color = piece.color === HUMAN_COLOR ? '#fff' : '#000';
                square.appendChild(pieceEl);
            }

            square.addEventListener('click', ()=> handleSquareClick(r,c));
            boardElement.appendChild(square);
        }
    }
    updateStatus();
}

// ---------------------
// Update Status
// ---------------------
function updateStatus(){
    if(isGameOver()){
        const winner = currentPlayer===HUMAN_COLOR ? 'Black' : 'White';
        statusElement.textContent = winner + ' wins!';
    } else {
        statusElement.textContent = currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1) + "'s turn";
    }
}

// ---------------------
// Clear Selection
// ---------------------
function clearSelection(){
    document.querySelectorAll('.square').forEach(sq=>sq.classList.remove('selected'));
    selectedPiece = null;
}

// ---------------------
// Handle Human Move
// ---------------------
function handleSquareClick(r,c){
    const piece = gameState[r][c];

    if(currentPlayer !== HUMAN_COLOR) return;

    // Select your piece
    if(piece && piece.color === HUMAN_COLOR){
        clearSelection();
        selectedPiece = {r,c,piece};
        document.querySelector(`.square[data-row='${r}'][data-col='${c}']`)?.classList.add('selected');
        return;
    }

    // Move selected piece
    if(selectedPiece){
        if(isValidMove(selectedPiece, {r,c})){
            const from = selectedPiece;
            gameState[r][c] = from.piece;
            gameState[from.r][from.c] = null;
            from.piece.hasMoved = true;
            clearSelection();
            currentPlayer = AI_COLOR;
            renderBoard();

            setTimeout(aiMove, 300); // AI moves after 300ms
        } else {
            clearSelection(); // invalid move
        }
    }
}

// ---------------------
// Simplified Move Validation
// ---------------------
function isValidMove(from, to){
    const piece = from.piece;
    const target = gameState[to.r][to.c];

    // Cannot eat own piece
    if(target && target.color === piece.color) return false;

    const dr = to.r - from.r;
    const dc = to.c - from.c;

    switch(piece.type){
        case 'pawn':
            const dir = piece.color === HUMAN_COLOR ? -1 : 1;
            if(dc === 0 && dr === dir && !target) return true;
            if(dc === 0 && dr === 2*dir && !piece.hasMoved && !target && !gameState[from.r+dir][from.c]) return true;
            if(Math.abs(dc)===1 && dr===dir && target && target.color !== piece.color) return true;
            return false;
        case 'rook':
            if(dr===0 || dc===0) return pathClear(from,to);
            return false;
        case 'bishop':
            if(Math.abs(dr)===Math.abs(dc)) return pathClear(from,to);
            return false;
        case 'queen':
            if(dr===0 || dc===0 || Math.abs(dr)===Math.abs(dc)) return pathClear(from,to);
            return false;
        case 'knight':
            return (Math.abs(dr)===2 && Math.abs(dc)===1) || (Math.abs(dr)===1 && Math.abs(dc)===2);
        case 'king':
            return Math.abs(dr)<=1 && Math.abs(dc)<=1;
    }
    return false;
}

// ---------------------
// Path Clear Check (for rook/bishop/queen)
// ---------------------
function pathClear(from,to){
    const dr = Math.sign(to.r - from.r);
    const dc = Math.sign(to.c - from.c);
    let r = from.r + dr, c = from.c + dc;
    while(r !== to.r || c !== to.c){
        if(gameState[r][c]) return false;
        r += dr; c += dc;
    }
    return true;
}

// ---------------------
// AI Move
// ---------------------
function aiMove(){
    const moves = [];

    for(let r=0;r<8;r++){
        for(let c=0;c<8;c++){
            const piece = gameState[r][c];
            if(!piece || piece.color !== AI_COLOR) continue;

            for(let tr=0;tr<8;tr++){
                for(let tc=0;tc<8;tc++){
                    if(isValidMove({r,c,piece},{r:tr,c:tc})){
                        moves.push({from:{r,c},to:{r:tr,c:tc}});
                    }
                }
            }
        }
    }

    if(moves.length===0) return; // AI has no moves

    const move = moves[Math.floor(Math.random()*moves.length)];
    const fromPiece = gameState[move.from.r][move.from.c];
    gameState[move.to.r][move.to.c] = fromPiece;
    gameState[move.from.r][move.from.c] = null;
    fromPiece.hasMoved = true;
    currentPlayer = HUMAN_COLOR;
    renderBoard();
}

// ---------------------
// Game Over Check (simplified)
// ---------------------
function isGameOver(){
    // Basic: check if any king missing
    let hasWhite=false, hasBlack=false;
    for(let r=0;r<8;r++){
        for(let c=0;c<8;c++){
            const p = gameState[r][c];
            if(!p) continue;
            if(p.type==='king') p.color===HUMAN_COLOR ? hasWhite=true : hasBlack=true;
        }
    }
    return !(hasWhite && hasBlack);
}

// ---------------------
// Initialize
// ---------------------
document.addEventListener('DOMContentLoaded',()=>{
    boardElement = document.getElementById('board');
    statusElement = document.getElementById('status');
    difficultySlider = document.getElementById('difficulty');
    difficultyValue = document.getElementById('difficultyValue');
    resetBtn = document.getElementById('resetBtn');

    if(resetBtn) resetBtn.addEventListener('click',()=>{
        gameState = createInitialBoard();
        currentPlayer = HUMAN_COLOR;
        renderBoard();
    });

    if(difficultySlider){
        difficultySlider.addEventListener('input',()=>difficultyValue.textContent=difficultySlider.value);
    }

    gameState = createInitialBoard();
    renderBoard();
});

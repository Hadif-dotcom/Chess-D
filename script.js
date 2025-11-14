// ---------------------
// Piece Moves
// ---------------------
function getValidMoves(row, col, piece) {
    if (!piece) return [];
    const moves = [];

    if (piece.type === 'pawn') {
        const dir = piece.color === 'white' ? -1 : 1;
        // Forward move
        if (!gameState[row + dir]?.[col]) moves.push({ row: row + dir, col });
        // Double step
        if (!piece.hasMoved && !gameState[row + dir]?.[col] && !gameState[row + 2*dir]?.[col])
            moves.push({ row: row + 2*dir, col });
        // Captures (cannot capture king)
        for (let dc of [-1, 1]) {
            const target = gameState[row + dir]?.[col + dc];
            if (target && target.color !== piece.color && target.type !== 'king') {
                moves.push({ row: row + dir, col: col + dc });
            }
        }
        return moves;
    }

    // Rook example
    if (piece.type === 'rook') {
        const directions = [[1,0], [-1,0], [0,1], [0,-1]];
        directions.forEach(([dr, dc]) => {
            let r = row + dr;
            let c = col + dc;
            while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                const target = gameState[r][c];
                if (!target) {
                    moves.push({ row: r, col: c });
                } else {
                    if (target.color !== piece.color && target.type !== 'king')
                        moves.push({ row: r, col: c });
                    break;
                }
                r += dr;
                c += dc;
            }
        });
    }

    // Add other pieces here (knight, bishop, queen, king) with same rule:
    // Cannot include moves that capture a king

    return moves;
}

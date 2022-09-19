import { Injectable } from '@angular/core';
import { Cell } from './cell/interface';
import { Board, MoveType } from './interface';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  constructor() { }

  private invalidMove: MoveType = {valid: false, capture: false};
  private validSimpleMove: MoveType = {valid: true, capture: false};

  isMovePossible(from: Cell, to: Cell, board: Board): MoveType {
    //piece has to be there for a move
    if(!from.piece) {
      return this.invalidMove;
    }

    //alternate color move
    if(from.piece.color !== board.move) {
      return this.invalidMove;
    }

    //can't capture same color
    if(to.piece && from.piece.color === to.piece.color) {
      return this.invalidMove;
    }

    //can't move to same place
    if(from.row === to.row && from.col === to.col) {
      return this.invalidMove;
    }

    let capture = false;
    if(to.piece?.color && to.piece?.color !== from.piece.color) {
      capture = true;
    }

    let res = this.checkAllPiece(from, to, board, true);
    res = {...res,capture: capture || res.capture};

    return res;

  }

  checkAllPiece(from: Cell, to: Cell, board: Board, isActualMove: boolean): MoveType {
    if(from.piece!.char === 'pawn') {
      return this.checkPawnMove(from, to);
    } else if(from.piece!.char === 'rook') {
      return this.checkRookMove(from, to, board);
    } else if(from.piece!.char === 'bishop') {
      return this.checkBishopMove(from, to, board);
    } else if(from.piece!.char === 'knight') {
      return this.checkKnightMove(from, to);
    } else if(from.piece!.char === 'queen') {
      return this.checkRookMove(from, to, board).valid || this.checkBishopMove(from, to, board).valid ? this.validSimpleMove : this.invalidMove;
    } else if(from.piece!.char === 'king') {
      return this.checkKingMove(from, to, board, isActualMove);
    }
    return this.invalidMove;
  }

  checkPawnMove(from: Cell, to: Cell): MoveType {
    if(from.row === to.row && from.col === to.col) {
      return this.invalidMove;
    }

    if(from.col === to.col) {
      if((from.piece?.color === 'white' && to.row-from.row === 1) || (from.piece?.color === 'black' && from.row-to.row === 1)) {
        if(to.piece) {
          return this.invalidMove;
        } else {
          return this.validSimpleMove;
        }
      }
      if(Math.abs(from.row-to.row) === 2) {
        if(!to.piece) {
          if(from.piece?.color === 'white' && from.row === 1) {
            return this.validSimpleMove;
          } else if(from.piece?.color === 'black' && from.row === 6) {
            return this.validSimpleMove;
          }
        }
        return this.invalidMove;
      }
    } else if(Math.abs(from.col - to.col) === 1) {
      if(!to.piece) {
        return this.invalidMove;
      }
      if(from.piece?.color === 'white' && to.piece?.color === 'black' && from.row - to.row === -1) {
        return this.validSimpleMove;
      }
      if(from.piece?.color === 'black' && to.piece?.color === 'white' && from.row - to.row === 1) {
        return this.validSimpleMove;
      }
    }
    return this.invalidMove;;
  }

  checkRookMove(from: Cell, to: Cell, board: Board): MoveType {
    if(from.row === to.row && from.col === to.col) {
      return this.invalidMove;
    }

    if(from.row === to.row) {
      if(from.col < to.col) {
        for(let i=from.col+1; i<to.col; i++) {
          if(board.cells[from.row][i].piece) {
            return this.invalidMove;
          }
        }
        return this.validSimpleMove;
      }
      if(from.col > to.col) {
        for(let i=from.col-1; i>to.col; i--) {
          if(board.cells[from.row][i].piece) {
            return this.invalidMove;
          }
        }
        return this.validSimpleMove;
      }
    }
    if(from.col === to.col) {
      if(from.row < to.row) {
        for(let i=from.row+1; i<to.row; i++) {
          if(board.cells[i][from.col].piece) {
            return this.invalidMove;
          }
        }
        return this.validSimpleMove;
      }
      if(from.row > to.row) {
        for(let i=from.row-1; i>to.row; i--) {
          if(board.cells[i][from.col].piece) {
            return this.invalidMove;
          }
        }
        return this.validSimpleMove;
      }
    }
    return this.invalidMove;
  }

  checkBishopMove(from: Cell, to: Cell, board: Board): MoveType {
    if(from.row === to.row && from.col === to.col) {
      return this.invalidMove;
    }

    if(from.row-from.col === to.row-to.col) {
      if(from.row < to.row) {
        for(let i=1; i<=to.row-from.row-1; i++) {
          if(board.cells[from.row+i][from.col+i].piece) {
            return this.invalidMove;
          }
        }
        return this.validSimpleMove;
      }
      if(from.row > to.row) {
        for(let i=1; i<=from.row-to.row-1; i++) {
          if(board.cells[to.row+i][to.col+i].piece) {
            return this.invalidMove;
          }
        }
        return this.validSimpleMove;
      }
    }
    if(from.row+from.col === to.row+to.col) {
      if(from.row < to.row) {
        for(let i=1; i<=to.row-from.row-1; i++) {
          if(board.cells[from.row+i][from.col-i].piece) {
            return this.invalidMove;
          }
        }
        return this.validSimpleMove;
      }
      if(to.row < from.row) {
        for(let i=1; i<=from.row-to.row-1; i++) {
          if(board.cells[to.row+i][to.col-i].piece) {
            return this.invalidMove;
          }
        }
        return this.validSimpleMove;
      }
    }
    return this.invalidMove;
  }

  checkKnightMove(from: Cell, to: Cell): MoveType {
    if(from.row === to.row && from.col === to.col) {
      return this.invalidMove;
    }

    if(Math.abs(from.row-to.row) === 1 && Math.abs(from.col-to.col) === 2) {
      return this.validSimpleMove;
    }
    if(Math.abs(from.row-to.row) === 2 && Math.abs(from.col-to.col) === 1) {
      return this.validSimpleMove;
    }
    return this.invalidMove;
  }

  checkKingMove(from: Cell, to: Cell, board: Board, isActualMove: boolean): MoveType {
    if(from.row === to.row && from.col === to.col) {
      return this.invalidMove;
    }
    
    const oppColor = board.move === 'white' ? 'black' : 'white';
    if(Math.abs(from.row-to.row) <= 1 && Math.abs(from.col-to.col) <= 1 && !this.isUnderCheckFromColor(board, to, oppColor, isActualMove)) {
      return this.validSimpleMove;
    }

    if(!isActualMove) {
      return this.invalidMove;
    }

    //castle
    if(!this.isUnderCheckFromColor(board, from, oppColor, isActualMove) && from.row === to.row) {
      if(!from.piece?.isMoved) {
        if(to.col === 6 && !board.cells[from.row][7].piece?.isMoved) {
          for(let i=5; i<=6; i++) {
            if(board.cells[from.row][i].piece || this.isUnderCheckFromColor(board, board.cells[from.row][i], oppColor, isActualMove)) {
              return this.invalidMove;
            }
          }
          return {valid: true, type: 'shortCastle', capture: false};
        }
        if(to.col === 2 && !board.cells[from.row][0].piece?.isMoved) {
          if(board.cells[from.row][1].piece) {
            return this.invalidMove;
          }
          for(let i=2; i<=3; i++) {
            if(board.cells[from.row][i].piece || this.isUnderCheckFromColor(board, board.cells[from.row][i], oppColor, isActualMove)) {
              return this.invalidMove;
            }
          }
          return {valid: true, type: 'longCastle', capture: false};
        }
      }
    }
    return this.invalidMove;
  }

  isUnderCheckFromColor(board: Board, cell: Cell, color: string, isActualMove: boolean): boolean {
    if(!isActualMove) {
      return false;
    }
    const allPieces: Set<Cell> = color === 'white' ? board.whitePieces : board.blackPieces;
    for(let piece of allPieces) {
      if(piece.piece && this.canAttack(piece, cell, board)) {
        return true;
      }
    }
    return false;
  }

  canAttack(from: Cell, to: Cell, board: Board): boolean {
    return this.checkAllPiece(from, to, board, false).valid;
  }

  isKingUnderAttack(board: Board, kingColor: string): boolean {
    const to: Cell = kingColor === 'white' ? board.whiteKingPosition : board.blackKingPosition;
    const allPieces: Set<Cell> = kingColor === 'white' ? board.blackPieces : board.whitePieces;
    for(let piece of allPieces) {
      if(piece.piece && this.canAttack(piece, to, board)) {
        return true;
      }
    }
    return false;
  }

}

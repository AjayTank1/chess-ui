import { Injectable } from '@angular/core';
import { Cell } from './cell/interface';
import { Board, MoveType } from './interface';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  constructor() { }

  private invalidMove: MoveType = {valid: false};
  private validSimpleMove: MoveType = {valid: true};

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

    if(from.piece.char === 'pawn') {
      return this.checkPawnMove(from, to);
    } else if(from.piece.char === 'rook') {
      return this.checkRookMove(from, to, board);
    } else if(from.piece.char === 'bishop') {
      return this.checkBishopMove(from, to, board);
    } else if(from.piece.char === 'knight') {
      return this.checkKnightMove(from, to);
    } else if(from.piece.char === 'queen') {
      return this.checkRookMove(from, to, board).valid || this.checkBishopMove(from, to, board).valid ? this.validSimpleMove : this.invalidMove;
    } else if(from.piece.char === 'king') {
      return this.checkKingMove(from, to, board);
    }

    return this.validSimpleMove;
  }

  checkPawnMove(from: Cell, to: Cell): MoveType {
    if(from.col === to.col) {
      if(Math.abs(from.row-to.row) === 1) {
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
    if(Math.abs(from.row-to.row) === 1 && Math.abs(from.col-to.col) === 2) {
      return this.validSimpleMove;
    }
    if(Math.abs(from.row-to.row) === 2 && Math.abs(from.col-to.col) === 1) {
      return this.validSimpleMove;
    }
    return this.invalidMove;
  }

  checkKingMove(from: Cell, to: Cell, board: Board): MoveType {
    if(Math.abs(from.row-to.row) <= 1 && Math.abs(from.col-to.col) <= 1) {
      return this.validSimpleMove;
    }
    //castle
    if(!this.isUnderCheck() && from.row === to.row) {
      if(!from.piece?.isMoved) {
        if(to.col === 6 && !board.cells[from.row][7].piece?.isMoved) {
          for(let i=5; i<=6; i++) {
            if(board.cells[from.row][i].piece || this.isUnderCheck()) {
              return this.invalidMove;
            }
          }
          return {valid: true, type: 'shortCastle'};
        }
        if(to.col === 2 && !board.cells[from.row][0].piece?.isMoved) {
          for(let i=2; i<=3; i++) {
            if(board.cells[from.row][i].piece || this.isUnderCheck()) {
              return this.invalidMove;
            }
          }
          return {valid: true, type: 'longCastle'};
        }
      }
    }
    return this.invalidMove;
  }

  isUnderCheck(): boolean {
    return false;
  }

}

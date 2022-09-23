import { Injectable } from '@angular/core';
import { Cell, Piece, Board, MoveType, Game } from './../interface';
import { of } from 'rxjs';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { ModalComponent } from './../modal/modal.component';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  constructor(public matDialog: MatDialog) { }

  private invalidMove: MoveType = {valid: false, capture: false};
  private validSimpleMove: MoveType = {valid: true, capture: false};
  private dummyCell: Cell = {row: 0, col: 0};
  private size: number = 8;

  makeMove(game: Game, fromCell: Cell, toCell: Cell): boolean {
    const board = game.currentBoard;
    let from: Cell = board.cells[fromCell.row][fromCell.col];
    let to: Cell = board.cells[toCell.row][toCell.col];

    const moveType: MoveType = this.isMovePossible(from, to, game);
    
    if(!moveType.valid) {
      return true;
    }

    const newBoard = this.getTempBoard(board);
    game.currentBoard = newBoard;
    
    to = newBoard.cells[to.row][to.col];
    from = newBoard.cells[from.row][from.col];

    //make move on new board.  
    if(moveType.capture) {
      this.removeOppPiece(to, newBoard);
    }

    this.removePiece(from, newBoard);
    this.addPiece(to, newBoard);

    const piece: Piece = from.piece!;
    from.piece = undefined;
    to.piece = piece;
    piece.isMoved = true;

    if(moveType.type === 'shortCastle') {
      this.removePiece(newBoard.cells[from.row][7], newBoard);
      this.addPiece(newBoard.cells[from.row][5], newBoard);
      newBoard.cells[from.row][5].piece = newBoard.cells[from.row][7].piece;
      newBoard.cells[from.row][7].piece = undefined;
      newBoard.cells[from.row][5].piece!.isMoved = true;
    } else if(moveType.type === 'longCastle') {
      this.removePiece(newBoard.cells[from.row][0], newBoard);
      this.addPiece(newBoard.cells[from.row][3], newBoard);
      newBoard.cells[from.row][3].piece = newBoard.cells[from.row][0].piece;
      newBoard.cells[from.row][0].piece = undefined;
      newBoard.cells[from.row][3].piece!.isMoved = true;
    } else if(moveType.type === 'enPassant') {
      if(to.piece.color === 'white') {
        this.removePiece(newBoard.cells[to.row-1][to.col], newBoard);
        newBoard.cells[to.row-1][to.col].piece = undefined;
      } else if(to.piece.color === 'black') {
        this.removePiece(newBoard.cells[to.row+1][to.col], newBoard);
        newBoard.cells[to.row+1][to.col].piece = undefined;
      }
    }

    if(to.piece.char === 'king') {
      if(to.piece.color === 'white') {
        newBoard.whiteKingPosition = to;
      } else {
        newBoard.blackKingPosition = to;
      }
    }

    if(this.isKingUnderAttack(game, newBoard.move)) {
      return false;
    }
    
    this.checkForPromotion(to)
    .subscribe( (isPromoted: any) => {
      if(isPromoted) {
        to.piece = this.getPromotedPiece(isPromoted.piece, to.piece!.color);
      }
      newBoard.move = newBoard.move === 'white' ? 'black' : 'white';
      game.moveHistory.push({from: {row: from.row, col: from.col}, to: {row: to.row, col: to.col}, char: to.piece!.char});
    });
    return true;
  }

  isMovePossible(from: Cell, to: Cell, game: Game): MoveType {
    const board = game.currentBoard;
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

    let res = this.checkAllPiece(from, to, game, false);
    res = {...res,capture: capture || res.capture};

    return res;

  }

  checkAllPiece(from: Cell, to: Cell, game: Game, isAttackCheck: boolean): MoveType {
    const board = game.currentBoard;
    if(from.piece!.char === 'pawn') {
      return this.checkPawnMove(from, to, game, isAttackCheck);
    } else if(from.piece!.char === 'rook') {
      return this.checkRookMove(from, to, board);
    } else if(from.piece!.char === 'bishop') {
      return this.checkBishopMove(from, to, board);
    } else if(from.piece!.char === 'knight') {
      return this.checkKnightMove(from, to);
    } else if(from.piece!.char === 'queen') {
      return this.checkRookMove(from, to, board).valid || this.checkBishopMove(from, to, board).valid ? this.validSimpleMove : this.invalidMove;
    } else if(from.piece!.char === 'king') {
      return this.checkKingMove(from, to, game, isAttackCheck);
    }
    return this.invalidMove;
  }

  checkPawnMove(from: Cell, to: Cell, game: Game, isAttackCheck: boolean): MoveType {
    const board = game.currentBoard;
    if(from.row === to.row && from.col === to.col) {
      return this.invalidMove;
    }

    if(!isAttackCheck && from.col === to.col) {
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
      if(from.piece?.color === 'white' && from.row - to.row === -1) {
        if(to.piece?.color === 'black') {
          return this.validSimpleMove;
        }
        if(this.isEnPassant(from, to, game, isAttackCheck)) {
          return {valid: true, type: 'enPassant', capture: true};
        }
      }
      if(from.piece?.color === 'black' && from.row - to.row === 1) {
        if(to.piece?.color === 'white') {
          return this.validSimpleMove;
        }
        if(this.isEnPassant(from, to, game, isAttackCheck)) {
          return {valid: true, type: 'enPassant', capture: true};
        }
      }
    }
    return this.invalidMove;;
  }

  isEnPassant(from: Cell, to: Cell, game: Game, isAttackCheck: boolean): boolean {
    const board = game.currentBoard;
    if(isAttackCheck) {
      return false;
    }
    if(game.moveHistory.length) {
      const lastMove = game.moveHistory[game.moveHistory.length-1];
      if(from.piece?.color === 'white' && to.row === 5) {
        if(lastMove.char === 'pawn' && lastMove.from.row === 6 && lastMove.from.col === to.col && lastMove.to.row === 4 && lastMove.to.col === to.col) {
          return true;
        }
      } else if(from.piece?.color === 'black' && to.row === 2) {
        if(lastMove.char === 'pawn' && lastMove.from.row === 1 && lastMove.from.col === to.col && lastMove.to.row === 3 && lastMove.to.col === to.col) {
          return true;
        }
      }
    }
    return false;
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

  checkKingMove(from: Cell, to: Cell, game: Game, isAttackCheck: boolean): MoveType {
    const board = game.currentBoard;
    if(from.row === to.row && from.col === to.col) {
      return this.invalidMove;
    }

    const oppColor = board.move === 'white' ? 'black' : 'white';
    if(Math.abs(from.row-to.row) <= 1 && Math.abs(from.col-to.col) <= 1 && !this.isUnderCheckFromColor(game, to, oppColor, isAttackCheck)) {
      return this.validSimpleMove;
    }

    if(isAttackCheck) {
      return this.invalidMove;
    }

    //castle
    if(!this.isUnderCheckFromColor(game, from, oppColor, isAttackCheck) && from.row === to.row) {
      if(!from.piece?.isMoved) {
        if(to.col === 6 && !board.cells[from.row][7].piece?.isMoved) {
          for(let i=5; i<=6; i++) {
            if(board.cells[from.row][i].piece || this.isUnderCheckFromColor(game, board.cells[from.row][i], oppColor, isAttackCheck)) {
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
            if(board.cells[from.row][i].piece || this.isUnderCheckFromColor(game  , board.cells[from.row][i], oppColor, isAttackCheck)) {
              return this.invalidMove;
            }
          }
          return {valid: true, type: 'longCastle', capture: false};
        }
      }
    }
    return this.invalidMove;
  }

  isUnderCheckFromColor(game: Game, cell: Cell, color: string, isAttackCheck: boolean): boolean {
    const board = game.currentBoard;
    if(isAttackCheck) {
      return false;
    }
    const allPieces: Set<Cell> = color === 'white' ? board.whitePieces : board.blackPieces;
    for(let piece of allPieces) {
      if(piece.piece && this.canAttack(piece, cell, game)) {
        return true;
      }
    }
    return false;
  }

  canAttack(from: Cell, to: Cell, game: Game): boolean {
    return this.checkAllPiece(from, to, game, true).valid;
  }

  isKingUnderAttack(game: Game, kingColor: string): boolean {
    const board = game.currentBoard;
    const to: Cell = kingColor === 'white' ? board.whiteKingPosition : board.blackKingPosition;
    const allPieces: Set<Cell> = kingColor === 'white' ? board.blackPieces : board.whitePieces;
    for(let piece of allPieces) {
      if(piece.piece && this.canAttack(piece, to, game)) {
        return true;
      }
    }
    return false;
  }

  getPromotedPiece(piece: string, color: string): Piece {
    let res: Piece = {
      char: piece,
      color,
      url: '',
      isMoved: true
    };
    this.updatePieceUrl(res);
    return res;
  }

  checkForPromotion(to: Cell) {
    if(to.piece?.char === 'pawn') {
      if(to.piece.color === 'white' && to.row === 7) {
        return this.openModal();
      } else if(to.piece.color === 'black' && to.row === 0) {
        return this.openModal();
      }
    }
    return of(false);
  }

  openModal() {
    return this.matDialog.open(ModalComponent, {
        width: '80%',
        disableClose: true
    }).afterClosed();
  }

  removeOppPiece(cell: Cell, board: Board) {
    if(board.move === 'black') {
      board.whitePieces.delete(cell);
    } else {
      board.blackPieces.delete(cell);
    }
  }

  removePiece(cell: Cell, board: Board) {
    if(board.move === 'white') {
      board.whitePieces.delete(cell);
    } else {
      board.blackPieces.delete(cell);
    }
  }

  addPiece(cell: Cell, board: Board) {
    if(board.move === 'white') {
      board.whitePieces.add(cell);
    } else {
      board.blackPieces.add(cell);
    }
  }

  getPiece(row: number, col: number): Piece|undefined {
    let color: string = '';
    let char: string = '';
    let url: string = '';

    if(row > 1 && row <6) {
      return undefined;
    }

    // check color
    if(row == 0 || row == 1) {
      color = 'white';
      url = '/assets/img/w';
    }

    if(row == 6 || row == 7) {
      color = 'black';
      url = '/assets/img/b';
    }

    //check piece
    if(row == 1 || row == 6) {
      char = 'pawn';
      url += 'P.png';
      return {
        color,
        char,
        url,
        isMoved: false
      }
    }

    switch(col) {
      case 0:
      case 7:
        char = 'rook';
        url += 'R.png';
        break;
      case 1:
      case 6:
        char = 'knight';
        url += 'N.png';
        break;
      case 2:
      case 5:
        char = 'bishop';
        url += 'B.png';
        break;
      case 3:
        char = 'queen';
        url += 'Q.png';
        break;
      case 4:
        char = 'king';
        url += 'K.png';
        break;
    }

    return {
      color,
      char,
      url,
      isMoved: false
    }
  }

  updatePieceUrl(piece: Piece): void {
    let url = piece.color === 'white' ? '/assets/img/w' : '/assets/img/b';
    switch(piece.char) {
      case 'rook':
        url += 'R.png';
        break;
      case 'knight':
        url += 'N.png';
        break;
      case 'bishop':
        url += 'B.png';
        break;
      case 'queen':
        url += 'Q.png';
        break;
      case 'king':
        url += 'K.png';
        break;
      case 'pawn':
        url += 'P.png';
        break;
    }
    piece.url = url;
  }

  getTempBoard(board: Board): Board {
    const newBoard: Board = {
      cells: this.getTempCell(),
      move: '',
      isKingUnderAttack: false,
      whiteKingPosition: this.dummyCell,
      blackKingPosition: this.dummyCell,
      whitePieces: new Set<Cell>(),
      blackPieces: new Set<Cell>(),
      whiteCapturedPieces: new Set<Piece>(),
      blackCapturedPieces: new Set<Piece>()
    };
    this.copyBoard(board, newBoard);
    return newBoard;
  }

  getTempCell(): Cell[][] {
    
    const newCells: Cell[][] = [];
    for(let i=0; i<this.size; i++) {
      const row: Cell[] = [];
      for(let j=0; j<this.size; j++) {        
        row.push(this.dummyCell);
      }
      newCells.push(row);
    }
    return newCells;
  }

  copyBoard(from: Board, to: Board): void {

    for(let i=0; i<from.cells.length; i++) {
      for(let j=0; j<from.cells.length; j++) {
        to.cells[i][j] = {...from.cells[i][j]};
      }
    }
    
    to.whitePieces.clear();
    for(let piece of from.whitePieces) {
      to.whitePieces.add(to.cells[piece.row][piece.col]);
    }

    to.blackPieces.clear();
    for(let piece of from.blackPieces) {
      to.blackPieces.add(to.cells[piece.row][piece.col]);
    }

    to.whiteCapturedPieces = from.whiteCapturedPieces;
    to.blackCapturedPieces = from.blackCapturedPieces;

    to.move = from.move;
    to.isKingUnderAttack = from.isKingUnderAttack;
    to.whiteKingPosition = to.cells[from.whiteKingPosition.row][from.whiteKingPosition.col];
    to.blackKingPosition = to.cells[from.blackKingPosition.row][from.blackKingPosition.col];
  }

  createNewBoard(): Board {
    const cells: Cell[][] = [];
    let whiteKingPosition: Cell = this.dummyCell;
    let blackKingPosition: Cell = this.dummyCell;
    const whitePieces: Set<Cell> = new Set<Cell>();
    const blackPieces: Set<Cell> = new Set<Cell>();
    const whiteCapturedPieces: Set<Piece> = new Set<Piece>();
    const blackCapturedPieces: Set<Piece> = new Set<Piece>();

    for(let i=0; i<this.size; i++) {
      const row: Cell[] = [];
      for(let j=0; j<this.size; j++) {
        const piece: Piece | undefined = this.getPiece(i,j);
        const cell: Cell = {row: i, col: j, piece};
        row.push(cell);

        if(piece?.color === 'white') {
          if(piece?.char === 'king') {
            whiteKingPosition = cell;
          }
          whitePieces.add(cell);
        } else if(piece?.color === 'black') {
          if(piece?.char === 'king') {
            blackKingPosition = cell;
          }
          blackPieces.add(cell);
        }

      }
      cells.push(row);
    }
    
    return {cells, move: 'white', whitePieces, blackPieces, whiteCapturedPieces, blackCapturedPieces, whiteKingPosition, blackKingPosition, isKingUnderAttack: false};
  }

}

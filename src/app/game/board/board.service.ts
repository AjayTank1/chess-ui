import { Injectable } from '@angular/core';
import { Cell, Piece, Board, MoveType, GameTreeNode, Move } from './../interface';
import { of, Subject, ReplaySubject } from 'rxjs';
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
  public static size: number = 8;
  
  makeMove(gameTreeNode: GameTreeNode, move: Move): Subject<GameTreeNode> {
    //TODO: make this method async properly, return valid info.
    const subject: Subject<GameTreeNode> = new ReplaySubject<GameTreeNode>(1);
    const board = gameTreeNode.board;
    let from: Cell = board.cells[move.fromRow][move.fromCol];
    let to: Cell = board.cells[move.toRow][move.toCol];

    const moveType: MoveType = this.isMovePossible(gameTreeNode, from, to);
    
    if(!moveType.valid) {
      subject.next(gameTreeNode);
      subject.complete();
      return subject;
    }

    const newTreeNode = this.getTempTreeNode(gameTreeNode);
    gameTreeNode.nodes.push({move, val: newTreeNode});
    
    to = newTreeNode.board.cells[to.row][to.col];
    from = newTreeNode.board.cells[from.row][from.col];

    //make move on new board.
    if(moveType.capture) {
      this.removeOppPiece(newTreeNode, to);
    }

    this.removePiece(newTreeNode, from);
    this.addPiece(newTreeNode, to);

    const piece: Piece = from.piece!;
    from.piece = undefined;
    to.piece = piece;
    piece.isMoved = true;

    if(moveType.type === 'shortCastle') {
      this.removePiece(newTreeNode, newTreeNode.board.cells[from.row][7]);
      this.addPiece(newTreeNode, newTreeNode.board.cells[from.row][5]);
      newTreeNode.board.cells[from.row][5].piece = newTreeNode.board.cells[from.row][7].piece;
      newTreeNode.board.cells[from.row][7].piece = undefined;
      newTreeNode.board.cells[from.row][5].piece!.isMoved = true;
    } else if(moveType.type === 'longCastle') {
      this.removePiece(newTreeNode, newTreeNode.board.cells[from.row][0]);
      this.addPiece(newTreeNode, newTreeNode.board.cells[from.row][3]);
      newTreeNode.board.cells[from.row][3].piece = newTreeNode.board.cells[from.row][0].piece;
      newTreeNode.board.cells[from.row][0].piece = undefined;
      newTreeNode.board.cells[from.row][3].piece!.isMoved = true;
    } else if(moveType.type === 'enPassant') {
      if(to.piece.color === 'white') {
        this.removePiece(newTreeNode, newTreeNode.board.cells[to.row-1][to.col]);
        newTreeNode.board.cells[to.row-1][to.col].piece = undefined;
      } else if(to.piece.color === 'black') {
        this.removePiece(newTreeNode, newTreeNode.board.cells[to.row+1][to.col]);
        newTreeNode.board.cells[to.row+1][to.col].piece = undefined;
      }
    } else if(moveType.type === 'enPassantForNextMove') {
      newTreeNode.enPassantCol = move.toCol;
    }

    if(to.piece.char === 'king') {
      if(to.piece.color === 'white') {
        newTreeNode.board.whiteKingPosition = to;
      } else {
        newTreeNode.board.blackKingPosition = to;
      }
    }
    
    if(this.isKingUnderAttack(newTreeNode)) {
      gameTreeNode.nodes.pop();
      subject.next(gameTreeNode);
      subject.complete();
      return subject;
    }
    
    this.checkForPromotion(to, move.promotionTo)
    .subscribe( (promotionTo: string) => {
      if(promotionTo) {
        move.promotionTo = promotionTo;
        to.piece = this.getPromotedPiece(promotionTo, to.piece!.color);
      }
      subject.next(newTreeNode);
      subject.complete();
    });

    return subject;
  }

  isMovePossible(gameTreeNode: GameTreeNode, from: Cell, to: Cell): MoveType {
    const board = gameTreeNode.board;
    //piece has to be there for a move
    if(!from.piece) {
      return this.invalidMove;
    }

    //alternate color move
    if(from.piece.color !== gameTreeNode.color) {
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

    let res = this.checkAllPiece(gameTreeNode, from, to, false);
    res = {...res,capture: capture || res.capture};

    return res;

  }

  checkAllPiece(gameTreeNode: GameTreeNode, from: Cell, to: Cell, isAttackCheck: boolean): MoveType {
    const board = gameTreeNode.board;
    if(from.piece!.char === 'pawn') {
      return this.checkPawnMove(gameTreeNode, from, to, isAttackCheck);
    } else if(from.piece!.char === 'rook') {
      return this.checkRookMove(board, from, to);
    } else if(from.piece!.char === 'bishop') {
      return this.checkBishopMove(board, from, to);
    } else if(from.piece!.char === 'knight') {
      return this.checkKnightMove(from, to);
    } else if(from.piece!.char === 'queen') {
      return this.checkRookMove(board, from, to).valid || this.checkBishopMove(board, from, to).valid ? this.validSimpleMove : this.invalidMove;
    } else if(from.piece!.char === 'king') {
      return this.checkKingMove(gameTreeNode, from, to, isAttackCheck);
    }
    return this.invalidMove;
  }

  checkPawnMove(gameTreeNode: GameTreeNode, from: Cell, to: Cell, isAttackCheck: boolean): MoveType {
    const board = gameTreeNode.board;
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
            if(from.col > 0 && gameTreeNode.board.cells[3][from.col-1].piece?.color === 'black' && gameTreeNode.board.cells[3][from.col-1].piece?.char === 'pawn') {
              return {type: 'enPassantForNextMove', valid: true, capture: false};
            }
            if(from.col < 7 && gameTreeNode.board.cells[3][from.col+1].piece?.color === 'black' && gameTreeNode.board.cells[3][from.col+1].piece?.char === 'pawn') {
              return {type: 'enPassantForNextMove', valid: true, capture: false};
            }
            return this.validSimpleMove;
          } else if(from.piece?.color === 'black' && from.row === 6) {
            if(from.col > 0 && gameTreeNode.board.cells[4][from.col-1].piece?.color === 'white' && gameTreeNode.board.cells[4][from.col-1].piece?.char === 'pawn') {
              return {type: 'enPassantForNextMove', valid: true, capture: false};
            }
            if(from.col < 7 && gameTreeNode.board.cells[4][from.col+1].piece?.color === 'white' && gameTreeNode.board.cells[4][from.col+1].piece?.char === 'pawn') {
              return {type: 'enPassantForNextMove', valid: true, capture: false};
            }
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
        if(this.isEnPassant(gameTreeNode, from, to, isAttackCheck)) {
          return {valid: true, type: 'enPassant', capture: true};
        }
      }
      if(from.piece?.color === 'black' && from.row - to.row === 1) {
        if(to.piece?.color === 'white') {
          return this.validSimpleMove;
        }
        if(this.isEnPassant(gameTreeNode, from, to, isAttackCheck)) {
          return {valid: true, type: 'enPassant', capture: true};
        }
      }
    }
    return this.invalidMove;
  }

  isEnPassant(gameTreeNode: GameTreeNode, from: Cell, to: Cell, isAttackCheck: boolean): boolean {
    const board = gameTreeNode.board;
    if(isAttackCheck) {
      return false;
    }
    if(gameTreeNode.enPassantCol === -1) {
      return false;
    }

    if(from.piece?.color === 'white' && to.row === 5) {
      if(gameTreeNode.enPassantCol === to.col) {
        return true;
      }
    } else if(from.piece?.color === 'black' && to.row === 2) {
      if(gameTreeNode.enPassantCol === to.col) {
        return true;
      }
    }
    return false;
  }

  checkRookMove(board: Board, from: Cell, to: Cell): MoveType {
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

  checkBishopMove(board: Board, from: Cell, to: Cell): MoveType {
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

  checkKingMove(gameTreeNode: GameTreeNode, from: Cell, to: Cell, isAttackCheck: boolean): MoveType {
    const board = gameTreeNode.board;
    if(from.row === to.row && from.col === to.col) {
      return this.invalidMove;
    }

    const oppColor = gameTreeNode.color === 'white' ? 'black' : 'white';
    if(Math.abs(from.row-to.row) <= 1 && Math.abs(from.col-to.col) <= 1 && !this.isUnderCheckFromColor(gameTreeNode, to, oppColor, isAttackCheck)) {
      return this.validSimpleMove;
    }

    if(isAttackCheck) {
      return this.invalidMove;
    }

    //castle
    if(!this.isUnderCheckFromColor(gameTreeNode, from, oppColor, isAttackCheck) && from.row === to.row) {
      if(!from.piece?.isMoved) {
        if(to.col === 6 && !board.cells[from.row][7].piece?.isMoved) {
          for(let i=5; i<=6; i++) {
            if(board.cells[from.row][i].piece || this.isUnderCheckFromColor(gameTreeNode, board.cells[from.row][i], oppColor, isAttackCheck)) {
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
            if(board.cells[from.row][i].piece || this.isUnderCheckFromColor(gameTreeNode  , board.cells[from.row][i], oppColor, isAttackCheck)) {
              return this.invalidMove;
            }
          }
          return {valid: true, type: 'longCastle', capture: false};
        }
      }
    }
    return this.invalidMove;
  }

  isUnderCheckFromColor(gameTreeNode: GameTreeNode, cell: Cell, color: string, isAttackCheck: boolean): boolean {
    const board = gameTreeNode.board;
    if(isAttackCheck) {
      return false;
    }
    const allPieces: Set<Cell> = color === 'black' ? board.blackPieces : board.whitePieces;
    for(let piece of allPieces) {
      if(piece.piece && this.canAttack(gameTreeNode, piece, cell)) {
        return true;
      }
    }
    return false;
  }

  canAttack(gameTreeNode: GameTreeNode, from: Cell, to: Cell): boolean {
    return this.checkAllPiece(gameTreeNode, from, to, true).valid;
  }

  isKingUnderAttack(gameTreeNode: GameTreeNode): boolean {
    const board = gameTreeNode.board;
    const kingColor = gameTreeNode.color;
    const to: Cell = kingColor === 'white' ? board.blackKingPosition : board.whiteKingPosition;
    const allPieces: Set<Cell> = kingColor === 'white' ? board.whitePieces : board.blackPieces;
    for(let piece of allPieces) {
      if(piece.piece && this.canAttack(gameTreeNode, piece, to)) {
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

  checkForPromotion(to: Cell, promotionTo?: string) {
    if(to.piece?.char === 'pawn') {
      if(to.piece.color === 'white' && to.row === 7) {
        if(promotionTo) {
          return of(promotionTo);
        } else {
          return this.openModal();
        }
      } else if(to.piece.color === 'black' && to.row === 0) {
        if(promotionTo) {
          return of(promotionTo);
        } else {
          return this.openModal();
        }
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

  removeOppPiece(gameTreeNode: GameTreeNode, cell: Cell) {
    if(gameTreeNode.color === 'white') {
      gameTreeNode.board.whitePieces.delete(cell);
    } else {
      gameTreeNode.board.blackPieces.delete(cell);
    }
  }

  removePiece(gameTreeNode: GameTreeNode, cell: Cell) {
    if(gameTreeNode.color === 'black') {
      gameTreeNode.board.whitePieces.delete(cell);
    } else {
      gameTreeNode.board.blackPieces.delete(cell);
    }
  }

  addPiece(gameTreeNode: GameTreeNode, cell: Cell) {
    if(gameTreeNode.color === 'black') {
      gameTreeNode.board.whitePieces.add(cell);
    } else {
      gameTreeNode.board.blackPieces.add(cell);
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

  getTempTreeNode(gameTreeNode: GameTreeNode): GameTreeNode {
    const board = gameTreeNode.board;
    const color = gameTreeNode.color === 'white' ? 'black' : 'white';
    const newBoard: Board = {
      cells: this.getTempCell(),
      isKingUnderAttack: false,
      whiteKingPosition: this.dummyCell,
      blackKingPosition: this.dummyCell,
      whitePieces: new Set<Cell>(),
      blackPieces: new Set<Cell>(),
      whiteCapturedPieces: new Set<Piece>(),
      blackCapturedPieces: new Set<Piece>()
    };
    this.copyBoard(board, newBoard);
    const newTreeNode: GameTreeNode = {
      board: newBoard,
      nodes: [],
      color,
      tags: [],
      desc: '',
      enPassantCol: -1,
    }
    return newTreeNode;
  }

  getTempCell(): Cell[][] {
    
    const newCells: Cell[][] = [];
    for(let i=0; i<BoardService.size; i++) {
      const row: Cell[] = [];
      for(let j=0; j<BoardService.size; j++) {        
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

    for(let i=0; i<BoardService.size; i++) {
      const row: Cell[] = [];
      for(let j=0; j<BoardService.size; j++) {
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
    
    return {cells, whitePieces, blackPieces, whiteCapturedPieces, blackCapturedPieces, whiteKingPosition, blackKingPosition, isKingUnderAttack: false};
  }

}

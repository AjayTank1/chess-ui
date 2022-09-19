import { Component, OnInit } from '@angular/core';
import { Cell, Piece } from './cell/interface';
import { Subject } from 'rxjs';
import { map, withLatestFrom, takeUntil } from 'rxjs/operators';
import { Board, MoveType } from './interface';
import { BoardService } from './board.service';

@Component({
  selector: 'board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {

  private size: number = 8;
  public board: Board;

  private mouseDown = new Subject<Cell>();
  private mouseUp = new Subject<Cell>();
  private destroyed = new Subject<void>();

  private dummyCell: Cell = {row: 0, col: 0};

  constructor(private boardService: BoardService) {  
  }

  ngOnInit(): void {
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
    
    this.board = {cells, move: 'white', whitePieces, blackPieces, whiteCapturedPieces, blackCapturedPieces, whiteKingPosition, blackKingPosition, isKingUnderAttack: false, moveHistory: []};

    this.mouseUp.pipe(takeUntil(this.destroyed), withLatestFrom(this.mouseDown))
    .subscribe(([to, from]) => {
        console.log("make move from " + from.row + " to "+ to.row);
        this.makeMove(to, from);
    });
  }

  makeMove(to:Cell, from:Cell) {
    const moveType: MoveType = this.boardService.isMovePossible(from, to, this.board);
    
    if(!moveType.valid) {
      return;
    }

    const newBoard = this.getTempBoard();
    this.copyBoard(this.board, newBoard);

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

    //check for the result

    if(!this.boardService.isKingUnderAttack(newBoard, newBoard.move)) {
      newBoard.move = newBoard.move === 'white' ? 'black' : 'white';
      newBoard.moveHistory.push({from: {row: from.row, col: from.col}, to: {row: to.row, col: to.col}, char: to.piece.char});
      this.copyBoard(newBoard, this.board);
    }
    
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

  ngOnDestroy(){
    this.destroyed.next();
    this.destroyed.complete();
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

  onMouseUp($event: any) {
    this.mouseUp.next(this.board.cells[$event.row][$event.col]);
  }

  onMouseDown($event: any) {
    this.mouseDown.next(this.board.cells[$event.row][$event.col]);
  }

  getTempBoard(): Board {
    return {
      cells: this.getTempCell(),
      move: '',
      isKingUnderAttack: false,
      whiteKingPosition: this.dummyCell,
      blackKingPosition: this.dummyCell,
      whitePieces: new Set<Cell>(),
      blackPieces: new Set<Cell>(),
      whiteCapturedPieces: new Set<Piece>(),
      blackCapturedPieces: new Set<Piece>(),
      moveHistory: []
    };
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
    to.moveHistory = from.moveHistory;
    to.whiteKingPosition = to.cells[from.whiteKingPosition.row][from.whiteKingPosition.col];
    to.blackKingPosition = to.cells[from.blackKingPosition.row][from.blackKingPosition.col];
  }

}
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
  public board: Board;//Cell[][];

  private mouseDown = new Subject<Cell>();
  private mouseUp = new Subject<Cell>();
  private destroyed = new Subject<void>();

  constructor(private boardService: BoardService) {  
  }

  ngOnInit(): void {
    const cells: Cell[][] = [];
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
          whitePieces.add(cell);
        } else if(piece?.color === 'black') {
          blackPieces.add(cell);
        }

      }
      cells.push(row);
    }

    this.board = {cells, move: 'white', whitePieces, blackPieces, whiteCapturedPieces, blackCapturedPieces};

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

    if(from.piece) {
      const piece: Piece = from.piece;
      from.piece = undefined;
      to.piece = piece;
      this.board.move = this.board.move === 'white' ? 'black' : 'white';
      piece.isMoved = true;

      if(moveType.type === 'shortCastle') {
        this.board.cells[from.row][5].piece = this.board.cells[from.row][7].piece;
        this.board.cells[from.row][7].piece = undefined;
        this.board.cells[from.row][5].piece!.isMoved = true;
      } else if(moveType.type === 'longCastle') {
        this.board.cells[from.row][3].piece = this.board.cells[from.row][0].piece;
        this.board.cells[from.row][0].piece = undefined;
        this.board.cells[from.row][3].piece!.isMoved = true;
      }

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

}
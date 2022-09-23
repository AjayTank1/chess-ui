import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Cell, Piece, Board, MoveType } from './../interface';
import { Subject, of } from 'rxjs';
import { map, withLatestFrom, takeUntil } from 'rxjs/operators';
import { BoardService } from './board.service';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {

  @Input() public board: Board;

  private mouseDown = new Subject<Cell>();
  private mouseUp = new Subject<Cell>();
  private destroyed = new Subject<void>();

  @Output() makeMove = new EventEmitter();

  constructor() {  
  }

  ngOnInit(): void {
    
    this.mouseUp.pipe(takeUntil(this.destroyed), withLatestFrom(this.mouseDown))
    .subscribe(([to, from]) => {
        console.log("make move from " + from.row + " to "+ to.row);
        this.makeMove.emit({to, from});
    });
  }

  onMouseUp($event: any) {
    this.mouseUp.next($event);
  }

  onMouseDown($event: any) {
    this.mouseDown.next($event);
  }

  ngOnDestroy(){
    this.destroyed.next();
    this.destroyed.complete();
  }

}
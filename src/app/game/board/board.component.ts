import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild  } from '@angular/core';
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
  @ViewChild('canvas', {static: false}) canvas: ElementRef<HTMLCanvasElement>;
  public context: CanvasRenderingContext2D;

  @Output() makeMove = new EventEmitter();

  constructor() {  
  }

  ngOnInit(): void {
    this.mouseUp.pipe(takeUntil(this.destroyed), withLatestFrom(this.mouseDown))
    .subscribe(([to, from]) => {
        console.log({to, from});
        this.makeMove.emit({to, from});
    });
  }

  ngAfterViewInit(): void {
    this.context = this.canvas.nativeElement.getContext('2d')!;
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

  clearBoard(): void {
    const ctx = this.context;
    if(!ctx) {
      return;
    }
    this.context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
  }

  drawArrowForCell(cord: number[][], color: string): void {
    const ctx = this.context;
    if(!ctx) {
      return;
    }

    ctx.beginPath();
    ctx.moveTo(cord[0][0], cord[0][1]);
    ctx.lineTo(cord[1][0], cord[1][1]);
    ctx.lineTo(cord[2][0], cord[2][1]);
    ctx.lineTo(cord[3][0], cord[3][1]);
    ctx.lineTo(cord[4][0], cord[4][1]);
    ctx.lineTo(cord[5][0], cord[5][1]);
    ctx.lineTo(cord[6][0], cord[6][1]);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cord[0][0], cord[0][1]);
    ctx.lineTo(cord[1][0], cord[1][1]);
    ctx.lineTo(cord[2][0], cord[2][1]);
    ctx.lineTo(cord[3][0], cord[3][1]);
    ctx.lineTo(cord[4][0], cord[4][1]);
    ctx.lineTo(cord[5][0], cord[5][1]);
    ctx.lineTo(cord[6][0], cord[6][1]);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

  }

}
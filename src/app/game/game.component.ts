import { Component, OnInit } from '@angular/core';
import { BoardService } from './../board/board.service';
import { Board } from './../board/interface';
import { GameService } from './game.service';

@Component({
  selector: 'game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  private boards: Board[] = [];
  private gameLen: number = 0;
  private actualGameLen = 0;

  constructor(private boardService: BoardService,
    private gameService: GameService) { }

  
  currentBoard: Board;

  ngOnInit(): void {
    this.currentBoard = this.boardService.createNewBoard();
    this.boards.push(this.currentBoard);
    this.gameLen += 1;
    this.actualGameLen = this.gameLen;
  }

  makeMove($event: any) {
    this.boardService.makeMove(this.currentBoard, $event.from, $event.to)
    .subscribe(newBoard => {
      if(newBoard) {
        this.currentBoard = newBoard;
        if(this.gameLen === this.boards.length) {
          this.boards.push(newBoard);
        } else if(this.gameLen < this.boards.length) {
          this.boards[this.gameLen] = newBoard;
        }
        this.gameLen +=1;
        this.actualGameLen = this.gameLen;
      }
    })
  }

  goBack(): void {
    if(this.gameLen > 1) {
      this.currentBoard = this.boards[this.gameLen-2];
      this.gameLen -= 1;
    }
  }

  goNext(): void {
    if(this.gameLen < this.actualGameLen) {
      this.currentBoard = this.boards[this.gameLen];
      this.gameLen += 1;
    }
  }

  onSave(): void {
    this.gameService.saveGame(this.boards).subscribe(x=> console.log(x));
  }

}

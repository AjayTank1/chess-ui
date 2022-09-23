import { Component, OnInit, Input } from '@angular/core';
import { BoardService } from './board/board.service';
import { Board, Game, Event } from './interface';
import { GameService } from './game.service';

@Component({
  selector: 'game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  @Input() boards: Board[];
  @Input() readOnlyMode: boolean;
  private gameLen: number = 0;
  private actualGameLen = 0;
  game: Game;

  constructor(
    private boardService: BoardService,
    private gameService: GameService
  ) { }

  ngOnInit(): void {
    if(this.readOnlyMode) {
      if(!this.boards?.length) {
        throw Error("game moves has to be provided");
      }
      this.game = {
        boards: this.boards,
        currentBoard: this.boards[0],
        moveHistory: []
      }
      this.actualGameLen = this.boards.length;
      this.gameLen = 1;
    } else {
      this.boards = [];
      this.game = {
        boards: this.boards,
        currentBoard: this.boardService.createNewBoard(),
        moveHistory: []
      }
      this.boards.push(this.game.currentBoard);
      this.gameLen += 1;
      this.actualGameLen = this.gameLen;
    }
  }

  makeMove($event: any) {
    if(!this.readOnlyMode) {
      const res = this.boardService.makeMove(this.game, $event.from, $event.to);
      if(res) {
        if(this.gameLen === this.boards.length) {
          this.boards.push(this.game.currentBoard);
        } else if(this.gameLen < this.boards.length) {
          this.boards[this.gameLen] = this.game.currentBoard; 
        }
        this.gameLen +=1;
        this.actualGameLen = this.gameLen;
      } else {
        this.game.currentBoard = this.game.boards[this.game.boards.length-1];
      }
    }
  }

  goBack(): void {
    if(this.gameLen > 1) {
      this.game.currentBoard = this.boards[this.gameLen-2];
      this.gameLen -= 1;
    }
  }

  goNext(): void {
    if(this.gameLen < this.actualGameLen) {
      this.game.currentBoard = this.boards[this.gameLen];
      this.gameLen += 1;
    }
  }

  onSave(): void {
    const payload = this.game.moveHistory.map(move => {
      let m = 0;
      m = m*10 + move.from.row;
      m = m*10 + move.from.col;
      m = m*10 + move.to.row;
      m = m*10 + move.to.col;
      return {move: m} as Event
    })
    this.gameService.saveGame(payload).subscribe(x=> console.log(x));
  }

}

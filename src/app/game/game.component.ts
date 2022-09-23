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

  //@Input() boards: Board[];
  @Input() readOnlyMode: boolean;
  private gameLen: number = 0;
  private actualGameLen = 0;
  @Input() game: Game;

  constructor(
    private boardService: BoardService,
    private gameService: GameService
  ) { }

  ngOnInit(): void {
    if(this.readOnlyMode) {
      if(!this.game) {
        throw Error("game moves has to be provided");
      }
      this.actualGameLen = this.game.boards.length;
      this.gameLen = 1;
    } else {
      this.game = {
        boards: [],
        currentBoard: this.boardService.createNewBoard(),
        moveHistory: []
      }
      this.game.boards.push(this.game.currentBoard);
      this.gameLen += 1;
      this.actualGameLen = this.gameLen;
    }
  }

  makeMove($event: any) {
    if(!this.readOnlyMode) {
      const res = this.gameService.makeMove(this.game, $event.from.row, $event.from.col, $event.to.row, $event.to.col);
      if(res) {
        if(this.gameLen === this.game.boards.length) {
          this.game.boards.push(this.game.currentBoard);
        } else if(this.gameLen < this.game.boards.length) {
          this.game.boards[this.gameLen] = this.game.currentBoard; 
        }
        this.gameLen +=1;
        this.actualGameLen = this.gameLen;
      }
    }
  }

  goBack(): void {
    if(this.gameLen > 1) {
      this.game.currentBoard = this.game.boards[this.gameLen-2];
      this.gameLen -= 1;
    }
  }

  goNext(): void {
    if(this.gameLen < this.actualGameLen) {
      this.game.currentBoard = this.game.boards[this.gameLen];
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

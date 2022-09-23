import { Component, OnInit } from '@angular/core';
import { GameService } from './../game/game.service';
import { BoardService } from './../game/board/board.service';
import { Board, Game } from './../game/interface'

@Component({
  selector: 'game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent implements OnInit {

  game: Game;
  isLoading: boolean = true;

  constructor(
    private gameService: GameService,
    private boardService: BoardService,
    ) { }

  
  ngOnInit(): void {
    this.gameService.getAllGame().subscribe(x=>{
      this.constructGame(x[0]);
    });
  }

  constructGame(gameString: string): void {
    const json = JSON.parse(gameString);
    const currentBoard = this.boardService.createNewBoard();
    const boards: Board[] = [];
    boards.push(currentBoard);
    this.game = {
      boards,
      currentBoard,
      moveHistory: []
    }
    for(let x of json) {
      let entry = x.move;
      const toCol: number = entry%10;
      entry = Math.floor(entry/10);
      const toRow: number = entry%10;
      entry = Math.floor(entry/10);
      const fromCol: number = entry%10;
      entry = Math.floor(entry/10);
      const fromRow: number = entry%10;

      this.gameService.makeMove(this.game, fromRow, fromCol, toRow, toCol);
      this.game.boards.push(this.game.currentBoard);
    }
    this.game.currentBoard = this.game.boards[0];
    this.isLoading = false;
  }

}

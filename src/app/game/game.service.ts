import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'
import { BoardService } from './board/board.service';
import { Game } from './interface';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(
    private http: HttpClient,
    private boardService: BoardService,
    ) { }

  saveGame(data: any): Observable<any> {
    return this.http.post("http://localhost:6060/game", data);
  }

  getAllGame(): Observable<any> {
    return this.http.get("http://localhost:6060/game");
  }

  makeMove(game: Game, fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    const res = this.boardService.makeMove(game, game.currentBoard.cells[fromRow][fromCol], game.currentBoard.cells[toRow][toCol]);
    if(!res) {
      game.currentBoard = game.boards[game.boards.length-1];
    }
    return res;
  }
}

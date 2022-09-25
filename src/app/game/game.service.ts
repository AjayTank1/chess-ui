import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs'
import { BoardService } from './board/board.service';
import { GameTreeNode, GameMoveTreeNode } from './interface';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(
    private http: HttpClient,
    private boardService: BoardService,
  ) { }

  saveGame(data: GameMoveTreeNode): Observable<any> {
    return this.http.post("http://localhost:6060/game", data);
  }

  getAllGame(): Observable<any> {
    return this.http.get("http://localhost:6060/game");
  }

  makeMove(gameTreeNode: GameTreeNode, fromRow: number, fromCol: number, toRow: number, toCol: number, playSound: boolean): Observable<GameTreeNode> {
    return this.boardService.makeMove(gameTreeNode,  fromRow, fromCol, toRow, toCol).pipe(tap(res => {
      if(gameTreeNode !== res) {
        if(playSound) {
          this.playAudio();
        }
      }
    }));
  }

  playAudio(){
    let audio = new Audio();
    audio.src = "../../../assets/audio/alarm.wav";
    audio.load();
    audio.play();
  } 
}

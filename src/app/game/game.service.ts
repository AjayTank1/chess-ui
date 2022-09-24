import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'
import { BoardService } from './board/board.service';
import { GameTreeNode } from './interface';

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

  makeMove(gameTreeNode: GameTreeNode, fromRow: number, fromCol: number, toRow: number, toCol: number, playSound: boolean): boolean {
    const res = this.boardService.makeMove(gameTreeNode,  fromRow, fromCol, toRow, toCol);
    if(!res) {
      gameTreeNode.nodes!.pop();
    } else {
      if(playSound) {
        this.playAudio();
      }
    }
    return res;
  }

  playAudio(){
    let audio = new Audio();
    audio.src = "../../../assets/audio/alarm.wav";
    audio.load();
    audio.play();
  } 
}

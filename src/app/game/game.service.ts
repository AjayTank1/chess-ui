import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs'
import { BoardService } from './board/board.service';
import { GameTreeNode, GameMoveTreeNode, Move } from './interface';
import { GameRepoService } from './game-repo.service';
import { MoveService } from './move.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(
    private http: HttpClient,
    private boardService: BoardService,
    private gameRepoService: GameRepoService,
    private moveService: MoveService,
  ) { }

  saveGame(data: GameMoveTreeNode): Observable<any> {
    return this.http.post("http://localhost:6060/game", data);
  }

  getGame(): Observable<any> {
    return this.http.get("http://localhost:6060/game");
  }

  makeMove(gameTreeNode: GameTreeNode, move: Move, playSound: boolean, promotionTo?: string): Observable<GameTreeNode> {
    return this.boardService.makeMove(gameTreeNode, move, promotionTo).pipe(map(res => {
      if(gameTreeNode !== res) {
        const cachedTreeNode: GameTreeNode | undefined = this.gameRepoService.getGameTreeNode(res);
        if(cachedTreeNode) {
          if(cachedTreeNode && cachedTreeNode != res) {
            this.moveService.getGameTreeNodeFromMove(gameTreeNode, move)!.val = cachedTreeNode;
          }
          if(playSound) {
            this.playAudio();
          }
          return cachedTreeNode;
        } else {
          this.gameRepoService.addGameTreeNode(res);
          if(playSound) {
            this.playAudio();
          }
          return res;
        }
      }
      return res;
    }));
  }

  playAudio(){
    let audio = new Audio();
    audio.src = "../../../assets/audio/alarm.wav";
    audio.load();
    audio.play();
  }
}

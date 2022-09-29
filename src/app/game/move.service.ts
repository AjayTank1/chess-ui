import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs'
import { BoardService } from './board/board.service';
import { GameTreeNode, GameMoveTreeNode, Move } from './interface';
import { GameRepoService } from './game-repo.service';

@Injectable({
  providedIn: 'root'
})
export class MoveService {

  constructor(
  ) { }

  getGameTreeNodeFromMove(gameTreeNode: GameTreeNode, move: Move): {val: GameTreeNode, move: Move} | undefined {
    for(let node of gameTreeNode.nodes) {
      if(this.equalMove(node.move,move)) {
        return node;
      }
    }
    return undefined;
  }

  equalMove(move1: Move, move2: Move): boolean {
    return move1.fromRow === move2.fromRow && move1.fromCol === move2.fromCol && move1.toRow === move2.toRow && move1.toCol === move2.toCol;
  }

  removeNodeFromParent(gameTreeNode: GameTreeNode, remove: {gameTreeNode: GameTreeNode, move: Move}): void {
    //delete only if it is not attached any other node.
  }

}

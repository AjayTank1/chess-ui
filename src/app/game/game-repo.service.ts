import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs'
import { BoardService } from './board/board.service';
import { GameTreeNode, GameMoveTreeNode, Cell } from './interface';

@Injectable({
  providedIn: 'root'
})
export class GameRepoService {

  set: Set;
  constructor() {
    this.set = new Set();
  }

  addGameTreeNode(gameTreeNode: GameTreeNode): void {
    this.set.put(gameTreeNode);
  }

  getGameTreeNode(gameTreeNode: GameTreeNode): GameTreeNode | undefined {
    return this.set.get(gameTreeNode);
  }
  
}

export class Set {

  //TODO: give proper variation for castle and en-passant.

  bucketSize: number = 16;
  bucket: GameTreeNode[][] = [];
  count: number = 0;

  constructor() {
    for(let i=0;i<this.bucketSize;i++) {
      this.bucket.push([]);
    }
  }

  put(gameTreeNode: GameTreeNode): void {
    const bucketNumber: number = this.getHash(gameTreeNode) % this.bucketSize;
    this.bucket[bucketNumber].push(gameTreeNode);
    this.count++;

    if(this.count > 1.5*this.bucketSize) {
      this.initiateNewBucket()
    }
  }

  get(gameTreeNode: GameTreeNode): GameTreeNode | undefined {
    const bucketNumber: number = this.getHash(gameTreeNode) % this.bucketSize;
    for(let bucketGameTreeNode of this.bucket[bucketNumber]) {
      if(this.equals(bucketGameTreeNode, gameTreeNode)) {
        return bucketGameTreeNode;
      }
    }
    return undefined;
  }

  getHash(gameTreeNode: GameTreeNode): number {
    let hash: number = 17;
    hash = 37*((hash<<2) - hash) + this.getStringHash(gameTreeNode.color);
    hash |= 0;
    hash = 37*((hash<<5) - hash) + 97*gameTreeNode.enPassantCol;
    hash |= 0;

    for(let i=0;i<BoardService.size;i++) {
      for(let j=0;j<BoardService.size;j++) {
        let cell: Cell = gameTreeNode.board.cells[i][j];
        if(cell.piece) {
          hash = 7*((hash<<2) - hash) + this.getStringHash(cell.piece.char);
          hash |= 0;
          hash = 11*((hash<<2) - hash) + this.getStringHash(cell.piece.color);
          hash |= 0;
          hash = 57*((hash<<5) - hash) + ((cell.piece.char === 'king' || cell.piece.char === 'rook') && cell.piece.isMoved ? 37 : 97);
          hash |= 0;
        } else {
          hash = 17*((hash<<5) - hash) + 57;
          hash |= 0;
        }
      }
    }
    return Math.abs(hash);

  }

  getStringHash(s: string) {
    let hash = 0;
    if (s.length === 0) return hash;
    for (let i = 0; i < s.length; i++) {
      const chr = s.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  equals(gameTreeNode1: GameTreeNode, gameTreeNode2: GameTreeNode): boolean {
    if(gameTreeNode1.color !== gameTreeNode2.color) {
      return false;
    }
    if(gameTreeNode1.enPassantCol !== gameTreeNode2.enPassantCol) {
      return false;
    }
    for(let i=0;i<BoardService.size;i++) {
      for(let j=0;j<BoardService.size;j++) {
        let cell1: Cell = gameTreeNode1.board.cells[i][j];
        let cell2: Cell = gameTreeNode2.board.cells[i][j];
        if(!cell1.piece && !cell2.piece) {
          continue;
        }
        if(!cell1.piece || !cell2.piece) {
          return false;
        }
        if(cell1.piece && cell2.piece) {
          if(cell1.piece.char !== cell2.piece.char) {
            return false;
          }
          if(cell1.piece.color !== cell2.piece.color) {
            return false;
          }
          if((cell1.piece.char === 'king' || cell1.piece.char === 'rook') && cell1.piece.isMoved !== cell2.piece.isMoved) {
            return false;
          }
        }
      }
    }
    return true;
  }

  initiateNewBucket(): void {
    //TODO: implement later.
  }
}


import { Component, OnInit } from '@angular/core';
import { GameService } from './../game/game.service';
import { BoardService } from './../game/board/board.service';
import { Board, Game, GameTreeNode } from './../game/interface'

@Component({
  selector: 'game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent implements OnInit {

  gameTreeNode: GameTreeNode;
  isLoading: boolean = true;

  constructor(
    private gameService: GameService,
    private boardService: BoardService,
    ) { }

  
  ngOnInit(): void {
    this.gameService.getAllGame().subscribe((x:string[])=>{
      const games: Game[] = [];
      x.forEach(y => games.push(this.constructGame(y)));
      this.gameTreeNode = this.makeGameTree(games);
      this.isLoading = false;
    });
  }

  constructGame(gameString: string): Game {
    const json = JSON.parse(gameString);
    const currentBoard = this.boardService.createNewBoard();
    const boards: Board[] = [];
    boards.push(currentBoard);
    const game: Game = {
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

      this.gameService.makeMove(game, fromRow, fromCol, toRow, toCol, false);
      game.boards.push(game.currentBoard);
    }
    game.currentBoard = game.boards[0];
    return game;
  }

  makeGameTree(games: Game[]): GameTreeNode {

    const gameTreeNode: GameTreeNode = {
      board: games[0].boards[0],
      fromRow: -1,
      fromCol: -1,
      toRow: -1,
      toCol: -1,
    };
    games.forEach(game => this.makeGameTreeForSingleGame(game, gameTreeNode));
    return gameTreeNode;
  }

  makeGameTreeForSingleGame(game: Game, gameTreeNode: GameTreeNode): void {
    this.makeGameTreeForSingleGameWithIndex(game, 0, gameTreeNode);
  }

  makeGameTreeForSingleGameWithIndex(game: Game, index: number, gameTreeNode: GameTreeNode): void {
    if(index >= game.moveHistory.length) {
      return;
    }
    const board: Board = game.boards[index + 1];
    const move = game.moveHistory[index];
    if(gameTreeNode.nodes) {
      for(let node of gameTreeNode.nodes) {
        if(node.fromRow === move.from.row && node.fromCol === move.from.col && node.toRow === move.to.row && node.toCol === move.to.col) {
          this.makeGameTreeForSingleGameWithIndex(game, index + 1, node);
          return;
        }
      }
    }
    this.createNewNode(game, index, gameTreeNode);
  }

  createNewNode(game: Game, index: number, gameTreeNode: GameTreeNode): void {
    if(index >= game.moveHistory.length) {
      return;
    }
    if(!gameTreeNode.nodes) {
      gameTreeNode.nodes = [];
    }
    const move = game.moveHistory[index];
    const newTreeNode: GameTreeNode = {
      board: game.boards[index+1],
      fromRow: move.from.row,
      fromCol: move.from.col,
      toRow: move.to.row,
      toCol: move.to.col,
      parent: gameTreeNode,
    }
    gameTreeNode.nodes.push(newTreeNode);
    this.createNewNode(game, index + 1, newTreeNode);
  }

}

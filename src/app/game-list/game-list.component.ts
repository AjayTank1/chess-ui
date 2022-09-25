import { Component, OnInit } from '@angular/core';
import { GameService } from './../game/game.service';
import { BoardService } from './../game/board/board.service';
import { Board, Game, GameTreeNode, GameMoveTreeNode } from './../game/interface'

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
    this.gameService.getAllGame().subscribe((res:string[])=>{
      if(res) {
        const gameMoveTreeNodes: GameMoveTreeNode[] = [];
        res.forEach(gameString => gameMoveTreeNodes.push(JSON.parse(gameString) as GameMoveTreeNode));
        const gameMoveTreeNode: GameMoveTreeNode = this.mergeAllGameMoveTreeNodes(gameMoveTreeNodes);
        const gameTreeNodeRoot: GameTreeNode = this.convertToGameTreeNode(gameMoveTreeNode);
        this.gameTreeNode = this.convertTreeToGraph(gameTreeNodeRoot);
        this.isLoading = false;
      } else {
        throw new Error('API failed to fetch the games');
      }
    });
  }

  mergeAllGameMoveTreeNodes(gameMoveTreeNodes: GameMoveTreeNode[]): GameMoveTreeNode {
    let res: GameMoveTreeNode = gameMoveTreeNodes[0];
    for(let i=1; i<gameMoveTreeNodes.length; i++) {
      res = this.mergeTwoGameMoveTreeNodes(res, gameMoveTreeNodes[i]);
    }
    return res;
  }

  mergeTwoGameMoveTreeNodes(gameMoveTreeNode1: GameMoveTreeNode, gameMoveTreeNode2: GameMoveTreeNode): GameMoveTreeNode {
    //assume that root are always the same.
    const nodes: GameMoveTreeNode[] = [];

    const notVisitedIn2: Set<number> = new Set<number>();
    for(let i=0; i<gameMoveTreeNode2.nodes.length; i++) {
      notVisitedIn2.add(i);
    }
    for(let i=0; i<gameMoveTreeNode1.nodes.length; i++) {
      let isVisited1: boolean = false;
      const node1 = gameMoveTreeNode1.nodes[i];
      for(let j=0; j<gameMoveTreeNode2.nodes.length; j++) {
        const node2 = gameMoveTreeNode2.nodes[j];
        if(this.areSameNode(node1, node2)) {
          isVisited1 = true;
          notVisitedIn2.delete(j);
          nodes.push(this.mergeTwoGameMoveTreeNodes(node1, node2));
        }
      }
      if(!isVisited1) {
        nodes.push(node1);
      }
    }
    for(let i of notVisitedIn2) {
      nodes.push(gameMoveTreeNode2.nodes[i]);
    }
    gameMoveTreeNode1.nodes = nodes;
    return gameMoveTreeNode1;
  }

  areSameNode(node1: GameMoveTreeNode, node2: GameMoveTreeNode): boolean {
    return node1.fromRow === node2.fromRow && node1.fromCol === node2.fromCol && node1.toRow === node2.toRow && node1.toCol === node2.toCol;
  }

  convertToGameTreeNode(gameMoveTreeNode: GameMoveTreeNode): GameTreeNode {
    const root: GameTreeNode = {
      board: this.boardService.createNewBoard(),
      fromRow: -1,
      fromCol: -1,
      toRow: -1,
      toCol: -1,
      char: '',
      nodes: [],
      color: 'white',
    };
    if(gameMoveTreeNode) {
      this.startMovingPieces(root, gameMoveTreeNode);
    }
    return root;
  }

  startMovingPieces(gameTreeNode: GameTreeNode, gameMoveTreeNode: GameMoveTreeNode): void {
    for(let node of gameMoveTreeNode.nodes) {
      //TODO: pass piece promo info
      const res = this.gameService.makeMove(gameTreeNode, node.fromRow, node.fromCol, node.toRow, node.toCol, false);
      if(!res) {
        throw new Error('Something is terribly wrong');
      }
      this.startMovingPieces(gameTreeNode.nodes[gameTreeNode.nodes.length-1], node);
    }
  }

  convertTreeToGraph(gameTreeNodeRoot: GameTreeNode): GameTreeNode {
    //TODO: implement this
    return gameTreeNodeRoot;
  }

  // constructGameMoveTree(gameMoveTreeString: string): GameMoveTreeNode {
  //   const json = 
  //   const currentBoard = this.boardService.createNewBoard();
  //   const boards: Board[] = [];
  //   boards.push(currentBoard);
  //   const game: Game = {
  //     boards,
  //     currentBoard,
  //     moveHistory: []
  //   }
  //   for(let x of json) {
  //     let entry = x.move;
  //     const toCol: number = entry%10;
  //     entry = Math.floor(entry/10);
  //     const toRow: number = entry%10;
  //     entry = Math.floor(entry/10);
  //     const fromCol: number = entry%10;
  //     entry = Math.floor(entry/10);
  //     const fromRow: number = entry%10;

  //     this.gameService.makeMove(game, fromRow, fromCol, toRow, toCol, false);
  //     game.boards.push(game.currentBoard);
  //   }
  //   game.currentBoard = game.boards[0];
  //   return game;
  // }

  // constructGame(gameString: string): Game {
  //   const json = JSON.parse(gameString);
  //   const currentBoard = this.boardService.createNewBoard();
  //   const boards: Board[] = [];
  //   boards.push(currentBoard);
  //   const game: Game = {
  //     boards,
  //     currentBoard,
  //     moveHistory: []
  //   }
  //   for(let x of json) {
  //     let entry = x.move;
  //     const toCol: number = entry%10;
  //     entry = Math.floor(entry/10);
  //     const toRow: number = entry%10;
  //     entry = Math.floor(entry/10);
  //     const fromCol: number = entry%10;
  //     entry = Math.floor(entry/10);
  //     const fromRow: number = entry%10;

  //     this.gameService.makeMove(game, fromRow, fromCol, toRow, toCol, false);
  //     game.boards.push(game.currentBoard);
  //   }
  //   game.currentBoard = game.boards[0];
  //   return game;
  // }

  // makeGameTree(games: Game[]): GameTreeNode {

  //   const gameTreeNode: GameTreeNode = {
  //     board: games[0].boards[0],
  //     fromRow: -1,
  //     fromCol: -1,
  //     toRow: -1,
  //     toCol: -1,
  //     char: '',
  //   };
  //   games.forEach(game => this.makeGameTreeForSingleGame(game, gameTreeNode));
  //   return gameTreeNode;
  // }

  // makeGameTreeForSingleGame(game: Game, gameTreeNode: GameTreeNode): void {
  //   this.makeGameTreeForSingleGameWithIndex(game, 0, gameTreeNode);
  // }

  // makeGameTreeForSingleGameWithIndex(game: Game, index: number, gameTreeNode: GameTreeNode): void {
  //   if(index >= game.moveHistory.length) {
  //     return;
  //   }
  //   const board: Board = game.boards[index + 1];
  //   const move = game.moveHistory[index];
  //   if(gameTreeNode.nodes) {
  //     for(let node of gameTreeNode.nodes) {
  //       if(node.fromRow === move.from.row && node.fromCol === move.from.col && node.toRow === move.to.row && node.toCol === move.to.col) {
  //         this.makeGameTreeForSingleGameWithIndex(game, index + 1, node);
  //         return;
  //       }
  //     }
  //   }
  //   this.createNewNode(game, index, gameTreeNode);
  // }

  // createNewNode(game: Game, index: number, gameTreeNode: GameTreeNode): void {
  //   if(index >= game.moveHistory.length) {
  //     return;
  //   }
  //   if(!gameTreeNode.nodes) {
  //     gameTreeNode.nodes = [];
  //   }
  //   const move = game.moveHistory[index];
  //   const newTreeNode: GameTreeNode = {
  //     board: game.boards[index+1],
  //     fromRow: move.from.row,
  //     fromCol: move.from.col,
  //     toRow: move.to.row,
  //     toCol: move.to.col,
  //     parent: gameTreeNode,
  //     char: game.boards[index].cells[move.from.row][move.from.col].piece!.char,
  //   }
  //   gameTreeNode.nodes.push(newTreeNode);
  //   this.createNewNode(game, index + 1, newTreeNode);
  // }

}

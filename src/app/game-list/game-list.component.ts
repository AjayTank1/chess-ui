import { Component, OnInit } from '@angular/core';
import { GameService } from './../game/game.service';
import { BoardService } from './../game/board/board.service';
import { Board, Game, GameTreeNode, GameMoveTreeNode } from './../game/interface'
import { Observable } from 'rxjs';

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
    this.gameService.getGame().subscribe(res=>{
      let gameMoveTreeNode: GameMoveTreeNode | undefined = undefined;
      if(res?.data) {
        gameMoveTreeNode = JSON.parse(res.data) as GameMoveTreeNode;
      }
      const gameTreeNodeRoot: GameTreeNode = this.convertToGameTreeNode(gameMoveTreeNode);
      this.gameTreeNode = this.convertTreeToGraph(gameTreeNodeRoot);
      this.isLoading = false;
    });
  }

  areSameNode(node1: GameMoveTreeNode, node2: GameMoveTreeNode): boolean {
    return node1.fromRow === node2.fromRow && node1.fromCol === node2.fromCol && node1.toRow === node2.toRow && node1.toCol === node2.toCol;
  }

  convertToGameTreeNode(gameMoveTreeNode: GameMoveTreeNode | undefined): GameTreeNode {
    const root: GameTreeNode = {
      board: this.boardService.createNewBoard(),
      fromRow: -1,
      fromCol: -1,
      toRow: -1,
      toCol: -1,
      char: '',
      nodes: [],
      color: 'white',
      tags: [],
      desc: '',
    };
    if(gameMoveTreeNode) {
      this.startMovingPieces(root, gameMoveTreeNode);
    }
    return root;
  }

  startMovingPieces(gameTreeNode: GameTreeNode, gameMoveTreeNode: GameMoveTreeNode): void {
    gameTreeNode.tags = gameMoveTreeNode.tags;
    gameTreeNode.desc = gameMoveTreeNode.desc;
    for(let node of gameMoveTreeNode.nodes) {
      //TODO: pass piece promo info
      const res: Observable<GameTreeNode> = this.gameService.makeMove(gameTreeNode, node.fromRow, node.fromCol, node.toRow, node.toCol, false, node.promotionTo);
      this.startMovingPieces(gameTreeNode.nodes[gameTreeNode.nodes.length-1], node);
    }
  }

  convertTreeToGraph(gameTreeNodeRoot: GameTreeNode): GameTreeNode {
    //TODO: implement this
    return gameTreeNodeRoot;
  }

}

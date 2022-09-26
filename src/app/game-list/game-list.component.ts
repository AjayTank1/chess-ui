import { Component, OnInit } from '@angular/core';
import { GameService } from './../game/game.service';
import { MoveService } from './../game/move.service';
import { BoardService } from './../game/board/board.service';
import { Board, Game, GameTreeNode, GameMoveTreeNode, Move } from './../game/interface'
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
    private moveService: MoveService
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

  convertToGameTreeNode(gameMoveTreeNode: GameMoveTreeNode | undefined): GameTreeNode {
    const root: GameTreeNode = {
      board: this.boardService.createNewBoard(),
      nodes: [],
      color: 'white',
      tags: [],
      desc: '',
      enPassantCol: -1,
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
      const move: Move = {...node.move};
      const res: Observable<GameTreeNode> = this.gameService.makeMove(gameTreeNode, move, false);
      res.subscribe();
      if(node.val) {
        this.startMovingPieces(this.moveService.getGameTreeNodeFromMove(gameTreeNode, move)!.val, node.val);
      }
    }
  }

  convertTreeToGraph(gameTreeNodeRoot: GameTreeNode): GameTreeNode {
    //TODO: implement this
    return gameTreeNodeRoot;
  }

  getNextNode(gameTreeNode: GameTreeNode, move: Move): GameTreeNode {
    return gameTreeNode;
  }

}

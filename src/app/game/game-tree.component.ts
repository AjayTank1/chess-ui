import { Component, OnInit, Input } from '@angular/core';
import { BoardService } from './board/board.service';
import { Board, Game, Event, GameTreeNode } from './interface';
import { GameService } from './game.service';

@Component({
  selector: 'game-tree',
  templateUrl: './game-tree.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameTreeComponent implements OnInit {

  private gameLen: number = 0;
  private actualGameLen = 10;
  private readOnlyMode = true;
  @Input() gameTreeNode: GameTreeNode;
  currentTreeNode: GameTreeNode;

  constructor(
    private boardService: BoardService,
    private gameService: GameService
  ) { }

  ngOnInit(): void {
    if(this.readOnlyMode) {
      if(!this.gameTreeNode) {
        throw Error("game moves has to be provided");
      }
      this.currentTreeNode = this.gameTreeNode;
      //this.actualGameLen = this.game.boards.length;
      this.gameLen = 1;
    }
  }

  makeMove($event: any) {
    
  }

  goBack(): void {
    if(this.gameLen > 1) {
      this.currentTreeNode = this.currentTreeNode.parent!;
      this.gameLen -= 1;
    }
  }

  goNext(): void {
    if(this.gameLen < this.actualGameLen) {
      this.currentTreeNode = this.currentTreeNode.nodes![0];
      this.gameLen += 1;
    }
  }

  onSave(): void {
    // const payload = this.game.moveHistory.map(move => {
    //   let m = 0;
    //   m = m*10 + move.from.row;
    //   m = m*10 + move.from.col;
    //   m = m*10 + move.to.row;
    //   m = m*10 + move.to.col;
    //   return {move: m} as Event
    // })
    // this.gameService.saveGame(payload).subscribe(x=> console.log(x));
  }

  moveTo($event: any): void {
    this.currentTreeNode = $event;
    this.gameLen += 1;
  }

}

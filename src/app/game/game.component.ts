import { Component, OnInit, Input, ViewChild, ElementRef} from '@angular/core';
import { BoardService } from './board/board.service';
import { BoardComponent } from './board/board.component';
import { Board, Game, Event, GameTreeNode, GameMoveTreeNode, Move } from './interface';
import { GameService } from './game.service';
import { GameRepoService, Set } from './game-repo.service';

@Component({
  selector: 'game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  @Input() readOnlyMode: boolean;
  @Input() gameTreeNode: GameTreeNode;
  @ViewChild(BoardComponent) board: BoardComponent;
  private rootGameTreeNode: GameTreeNode;
  public isArrowEnabled: boolean = true;
  tagValue: string;
  
  constructor(
    private boardService: BoardService,
    private gameService: GameService,
  ) { }

  ngOnInit(): void {
    this.rootGameTreeNode = this.gameTreeNode;
    this.tagValue = this.gameTreeNode.tags.toString();
  }

  ngAfterViewInit(): void {
    this.moveTo(this.gameTreeNode);
  }

  makeMove($event: any): void {
    if(this.readOnlyMode) {
      return;
    }
    if(this.gameTreeNode.nodes) {
      for(let node of this.gameTreeNode.nodes) {
        if(node.move.fromRow === $event.fromRow && node.move.fromCol === $event.fromCol && node.move.toRow === $event.toRow && node.move.toCol === $event.toCol) {
          this.moveTo(node.val);
          return;
        }
      }
    }
    this.gameService.makeMove(this.gameTreeNode, {fromRow: $event.fromRow, fromCol: $event.fromCol, toRow: $event.toRow, toCol: $event.toCol}, false).subscribe(res => {
      this.moveTo(res);
    });
  }

  goBack(): void {
    if(this.gameTreeNode.parent) {
      this.moveTo(this.gameTreeNode.parent);
    }
  }

  goNext(): void {
    //TODO: implement
  }

  moveTo($event: any): void {
    this.gameTreeNode = $event;
    if(this.isArrowEnabled) {
      this.showArrows();
    }
  }

  chechArrows(): void {
    if(this.isArrowEnabled) {
      this.showArrows();
    } else {
      this.board.clearBoard();
    }
  }

  showArrows(): void {
    this.board.clearBoard();
    if(this.gameTreeNode.nodes) {
      for(let node of this.gameTreeNode.nodes) {
        this.drawArrowForCell(node.move, 'green');
      }
    }
  }

  mouseEnter($event: any) {
    if(this.isArrowEnabled) {
      this.drawArrowForCell($event.move, 'yellow');
    }
  }

  mouseLeave($event: any) {
    if(this.isArrowEnabled) {
      this.drawArrowForCell($event.move, 'green');
    }
  }

  drawArrowForCell(move: Move, color: string): void {
    const fromRow = 7 - move.fromRow;
    const toRow = 7 - move.toRow;
    const fromCol = move.fromCol;
    const toCol = move.toCol;
    const cellSize = 300/8;

    const len = Math.sqrt((fromRow-toRow)*(fromRow-toRow) + (fromCol - toCol)*(fromCol - toCol));
    
    const cord = this.getCordinate(len*cellSize - 0.2*cellSize, (fromCol+0.5)*cellSize,(fromRow+0.5)*cellSize , Math.atan2(-fromRow+toRow, fromCol-toCol) - Math.PI/2);
    this.board.drawArrowForCell(cord, color);
  }

  getCordinate(y: number, displacementX: number, displacementY: number, rotate: number): number[][] {

    const a: number = 4;
    const b:number = 3*a;

    const x1 = [a, 0];
    const x2 = [a, y-(b/2)];
    const x3 = [Math.sqrt(3/4)*b, y-(b/2)];
    const x4 = [0, y+b];
    const x5 = [-x3[0], x3[1]];
    const x6 = [-x2[0], x2[1]];
    const x7 = [-x1[0], x1[1]];

    const cord = [x1,x2,x3,x4,x5,x6,x7];
    return this.transform(cord, displacementX, displacementY, rotate);
  }

  transform(cord: number[][], displacementX: number, displacementY: number, rotate: number): number[][] { 
    for(let c of cord) {
      const m = c[0]*Math.cos(rotate) + c[1]*Math.sin(rotate);
      const n = -c[0]*Math.sin(rotate) + c[1]*Math.cos(rotate);
      c[0] = m;
      c[1] = n;
    }
    for(let c of cord) {
      c[0] += displacementX;
      c[1] += displacementY;
    }
    for(let c of cord) {
      c[1] /= 2;
    }
    return cord;
  }

  onSave(): void {
    let set: Set = new Set();
    const payload: GameMoveTreeNode = this.convertGameTreeToGameMoveTree(this.rootGameTreeNode, {
      fromRow: -1,
      fromCol: -1,
      toRow: -1,
      toCol: -1,
    }, set);
    this.gameService.saveGame(payload).subscribe(x=> console.log(x));
  }

  convertGameTreeToGameMoveTree(gameTreeNode: GameTreeNode, move: Move, set: Set): GameMoveTreeNode {
    if(set.get(gameTreeNode)) {
      return {
        fromRow: move.fromRow,
        fromCol: move.fromCol,
        toRow: move.toRow,
        toCol: move.toCol,
        nodes: [],
        tags: gameTreeNode.tags,
        desc: gameTreeNode.desc,
        promotionTo: gameTreeNode.promotionTo,
      } as GameMoveTreeNode;
    }
    set.put(gameTreeNode);
    const gameMoveTreeNodes: GameMoveTreeNode[] = [];
    for(let node of gameTreeNode.nodes) {
      gameMoveTreeNodes.push(this.convertGameTreeToGameMoveTree(node.val, node.move, set));
    }
    const gameMoveTreeNode: GameMoveTreeNode = {
      fromRow: move.fromRow,
      fromCol: move.fromCol,
      toRow: move.toRow,
      toCol: move.toCol,
      nodes: gameMoveTreeNodes,
      tags: gameTreeNode.tags,
      desc: gameTreeNode.desc,
      promotionTo: gameTreeNode.promotionTo,
    }
    return gameMoveTreeNode;
  }

}

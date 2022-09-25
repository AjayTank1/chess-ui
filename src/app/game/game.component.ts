import { Component, OnInit, Input, ViewChild, ElementRef} from '@angular/core';
import { BoardService } from './board/board.service';
import { BoardComponent } from './board/board.component';
import { Board, Game, Event, GameTreeNode, GameMoveTreeNode } from './interface';
import { GameService } from './game.service';

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
    private gameService: GameService
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
        if(node.fromRow === $event.fromRow && node.fromCol === $event.fromCol && node.toRow === $event.toRow && node.toCol === $event.toCol) {
          this.moveTo(node);
          return;
        }
      }
    }
    this.gameService.makeMove(this.gameTreeNode, $event.fromRow, $event.fromCol, $event.toRow, $event.toCol, false).subscribe(res => {
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

  moveTo($event: GameTreeNode): void {
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
        this.drawArrowForCell(node.fromRow, node.fromCol, node.toRow, node.toCol, 'green');
      }
    }
  }

  mouseEnter(node: GameTreeNode) {
    this.drawArrowForCell(node.fromRow, node.fromCol, node.toRow, node.toCol, 'yellow');
  }

  mouseLeave(node: GameTreeNode) {
    this.drawArrowForCell(node.fromRow, node.fromCol, node.toRow, node.toCol, 'green');
  }

  drawArrowForCell(fromRow: number, fromCol: number, toRow: number, toCol: number, color: string): void {
    fromRow = 7 - fromRow;
    toRow = 7 - toRow;
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
    const payload: GameMoveTreeNode = this.convertGameTreeToGameMoveTree(this.rootGameTreeNode);
    this.gameService.saveGame(payload).subscribe(x=> console.log(x));
  }

  convertGameTreeToGameMoveTree(gameTreeNode: GameTreeNode): GameMoveTreeNode {
    //TODO: save only new variation
    const gameMoveTreeNodes: GameMoveTreeNode[] = [];
    for(let node of gameTreeNode.nodes) {
      gameMoveTreeNodes.push(this.convertGameTreeToGameMoveTree(node));
    }
    const gameMoveTreeNode: GameMoveTreeNode = {
      fromRow: gameTreeNode.fromRow,
      fromCol: gameTreeNode.fromCol,
      toRow: gameTreeNode.toRow,
      toCol: gameTreeNode.toCol,
      nodes: gameMoveTreeNodes,
      tags: gameTreeNode.tags.filter(tag => tag.isNew).map(tag => tag.val),
      desc: gameTreeNode.desc,
    }
    return gameMoveTreeNode;
  }

}

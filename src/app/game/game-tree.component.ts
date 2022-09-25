import { Component, OnInit, Input, ViewChild, ElementRef} from '@angular/core';
import { BoardService } from './board/board.service';
import { BoardComponent } from './board/board.component';
import { Board, Game, Event, GameTreeNode } from './interface';
import { GameService } from './game.service';

@Component({
  selector: 'game-tree',
  templateUrl: './game-tree.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameTreeComponent implements OnInit {

  @Input() readOnlyMode: boolean;
  @Input() gameTreeNode: GameTreeNode;
  @ViewChild(BoardComponent) board: BoardComponent;
  private gameLen: number = 0;
  private actualGameLen = 10;
  
  constructor(
    private boardService: BoardService,
    private gameService: GameService
  ) { }

  ngOnInit(): void {
    this.gameTreeNode = this.gameTreeNode;
    this.gameLen = 1;
  }

  makeMove($event: any): void {
    if(this.readOnlyMode) {
      return;
    }
    if(this.gameTreeNode.nodes) {
      for(let node of this.gameTreeNode.nodes) {
        if(node.fromRow === $event.from.row && node.fromCol === $event.from.col && node.toRow === $event.to.row && node.toCol === $event.to.col) {
          this.gameTreeNode = node;
          return;
        }
      }
    }
    this.gameService.makeMove(this.gameTreeNode, $event.from.row, $event.from.col, $event.to.row, $event.to.col, false).subscribe(res => {
      this.gameTreeNode = res;
    });
  }

  goBack(): void {
    if(this.gameLen > 1) {
      this.gameTreeNode = this.gameTreeNode.parent!;
      this.gameLen -= 1;
    }
  }

  goNext(): void {
    if(this.gameLen < this.actualGameLen) {
      this.gameTreeNode = this.gameTreeNode.nodes![0];
      this.gameLen += 1;
    }
  }

  moveTo($event: any): void {
    this.gameTreeNode = $event;
    this.gameLen += 1;
    this.showArrows(this.gameTreeNode);
  }

  showArrows(gameTreeNode: GameTreeNode): void {
    this.board.clearBoard();
    if(gameTreeNode.nodes) {
      for(let node of gameTreeNode.nodes) {
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
    this.gameService.saveGame({}).subscribe(x=> console.log(x));
  }

}

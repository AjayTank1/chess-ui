import { Component, OnInit, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { BoardService } from './board/board.service';
import { BoardComponent } from './board/board.component';
import { Board, Game, Event, GameTreeNode, GameMoveTreeNode, Move } from './interface';
import { GameService } from './game.service';
import { GameRepoService, Set } from './game-repo.service';
import { MoveService } from './move.service';

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
  public reverse: boolean = false;
  private gamePlay: GamePlayNode;

  constructor(
    private boardService: BoardService,
    private gameService: GameService,
    private moveService: MoveService,
  ) { }

  ngOnInit(): void {
    this.rootGameTreeNode = this.gameTreeNode;
    this.gamePlay = {
      val: this. rootGameTreeNode
    }
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
          this.moveToFromDisplay(node.val);
          return;
        }
      }
    }
    this.gameService.makeMove(this.gameTreeNode, {fromRow: $event.fromRow, fromCol: $event.fromCol, toRow: $event.toRow, toCol: $event.toCol}, false).subscribe(res => {
      this.moveTo(res);
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) { 
    // this.key = event.key;
    if(event.key == 'ArrowLeft') {
      this.goBack();
    } else if(event.key == 'ArrowRight') {
      this.goNext();
    }
  }

  goBack(): void {
    if(this.gamePlay.prev) {
      this.playMove(this.gamePlay.prev.val);
      this.gamePlay = this.gamePlay.prev;
    }
  }

  goNext(): void {
    if(this.gamePlay.next) {
      this.playMove(this.gamePlay.next.val);
      this.gamePlay = this.gamePlay.next;
    }
  }

  moveToFromDisplay(gameTreeNode: GameTreeNode): void {
    if(this.gamePlay.next?.val === gameTreeNode) {
      this.goNext();
    } else {
      this.moveTo(gameTreeNode);
    }
  }

  moveTo(gameTreeNode: GameTreeNode): void {
    const newGamePlay: GamePlayNode = {
      val: gameTreeNode
    }
    this.gamePlay.next = newGamePlay;
    newGamePlay.prev = this.gamePlay;
    this.gamePlay = newGamePlay;
    this.playMove(gameTreeNode);
  }

  playMove(gameTreeNode: GameTreeNode): void {
    this.gameTreeNode = gameTreeNode;
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
    if(this.reverse) {
      this.reverseCord(cord);
    }
    return cord;
  }

  reverseCord(cord: number[][]): void {
    for(let c of cord) {
      c[0] = 300-c[0];
      c[1] = 150-c[1];
    }
  }

  delete($event: any): void {
    const parentNode: GameTreeNode = $event.parentNode;
    const nodeToBoRemoved: {gameTreeNode: GameTreeNode, move: Move} = $event.nodeToBoRemoved;
    this.moveService.removeNodeFromParent(parentNode, nodeToBoRemoved);
  }

  onSave(): void {
    let set: Set = new Set();
    const payload = this.convertGameTreeToGameMoveTree(this.rootGameTreeNode, set);
    if(payload) {
      this.gameService.saveGame(payload).subscribe(x=> console.log(x));
    }
  }

  convertGameTreeToGameMoveTree(gameTreeNode: GameTreeNode, set: Set): GameMoveTreeNode | undefined {
    if(set.get(gameTreeNode)) {
      return undefined;
    }
    set.put(gameTreeNode);
    const gameMoveTreeNodes: {val: GameMoveTreeNode | undefined, move: Move}[] = [];
    for(let node of gameTreeNode.nodes) {
      const res = this.convertGameTreeToGameMoveTree(node.val, set);
      gameMoveTreeNodes.push({move: node.move, val: res});
    }
    const gameMoveTreeNode: GameMoveTreeNode = {
      nodes: gameMoveTreeNodes,
      tags: gameTreeNode.tags,
      desc: gameTreeNode.desc,
    }
    return gameMoveTreeNode;
  }

  reverseBoard(): void {
    this.reverse = !this.reverse;
    if(this.isArrowEnabled) {
      this.showArrows();
    }
  }

}

interface GamePlayNode {
  val: GameTreeNode,
  prev?: GamePlayNode,
  next?: GamePlayNode,
}

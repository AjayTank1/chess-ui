import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Board, Game, Event, GameTreeNode } from './interface';

@Component({
  selector: 'move-display',
  templateUrl: './move-display.component.html',
  styleUrls: ['./move-display.component.scss']
})
export class MoveDisplayComponent implements OnInit {

  @Input() currentTreeNode: GameTreeNode;
  @Output() move = new EventEmitter();
  @Output() mouseEnterEvent = new EventEmitter();
  @Output() mouseLeaveEvent = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
    
  }

  moveTo(node: GameTreeNode) {
    this.move.emit(node);
  }

  mouseEnter(node: GameTreeNode) {
    this.mouseEnterEvent.emit(node);
  }
  mouseLeave(node: GameTreeNode) {
    this.mouseLeaveEvent.emit(node);
  }
}

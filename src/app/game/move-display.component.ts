import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Board, Game, Event, GameTreeNode, Move } from './interface';

@Component({
  selector: 'move-display',
  templateUrl: './move-display.component.html',
  styleUrls: ['./move-display.component.scss']
})
export class MoveDisplayComponent implements OnInit {

  @Input() currentTreeNode: GameTreeNode;
  @Output() moveEvent = new EventEmitter();
  @Output() mouseEnterEvent = new EventEmitter();
  @Output() mouseLeaveEvent = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
    
  }

  moveTo($event: any) {
    this.moveEvent.emit($event);
  }

  mouseEnter($event: any) {
    this.mouseEnterEvent.emit($event);
  }
  mouseLeave($event: any) {
    this.mouseLeaveEvent.emit($event);
  }
}

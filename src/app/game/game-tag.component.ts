import { Component, OnInit, Input, ViewChild, ElementRef} from '@angular/core';
import { BoardService } from './board/board.service';
import { BoardComponent } from './board/board.component';
import { Board, Game, Event, GameTreeNode, GameMoveTreeNode } from './interface';
import { GameService } from './game.service';

@Component({
  selector: 'game-tag',
  templateUrl: './game-tag.component.html',
  styleUrls: ['./game-tag.component.scss']
})
export class GameTagComponent implements OnInit {

  @Input() gameTreeNode: GameTreeNode;
  tagValue: string;
  
  constructor() { }

  ngOnInit(): void {
   
  }

  ngOnChanges(): void {
     this.tagValue = this.gameTreeNode.tags.toString();
  }

  onChangeTags(): void {
    this.gameTreeNode.tags = this.tagValue.split(',');
  }

}
